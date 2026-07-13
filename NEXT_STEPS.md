# 下一轮改进记录

## 状态 · 2026-07-13

**架构拆分（方案 A）已完成**：core / solar / atlas / focus / specials 已抽出，`SolarSystem` 为门面。  
黑洞近景唯一路径：`js/specials/blackHoleRenderer.js`（电影级 ray-march + bloom；已去掉人工四线弧）。
**星图阶段 C 已完成**：`CELESTIAL_CATALOG` 现为 **90** 个目标
（邻域 26 / 银河 34 / 本星系群 15 / 宇宙近邻 15），并按图层提供尺度距离壳。

**下一优先**：
1. 当前版本可作为阶段性完成点；船帆座模型的进一步视觉调参和集成显卡帧率优化改为可选事项
2. 各图层标签拥挤与相机飞入优化
3. 脉冲星/红巨星/白矮星近景与黑洞进一步差异化
4. 可选 ES Module / 打包

**实机性能基线**：
- 脉冲星独立动画更新约 `0.021 ms/帧`；6 个射束层、4 段终止激波弧。
- 超新星遗迹独立动画更新约 `0.0067 ms/帧`；3 层壳、24 条丝状结构、2200 个粒子。
- 超新星遗迹近景约 32 个几何对象、1.9 万三角形；动画不每帧重建几何。
- 当前测量表明 JavaScript 动画更新不是主要瓶颈，后续如需优化应优先观察实际 GPU 透明混合和 bloom 成本。

---

## 当前已知问题

- 近景观测模式中，黑洞视觉效果容易和脉冲星混淆，尤其是两端喷流/脉冲束看起来像同一种效果。
- 黑洞不应该呈现“脉冲星式灯塔射束”。黑洞可以有相对论喷流，但表现方式应与脉冲星磁轴扫射明显区分。
- 当前特殊天体近景动画还偏示意化，真实感、层次、材质和粒子表现不足。
- 黑洞吸积盘、引力透镜感、喷流、暗核心的视觉语言需要重做。
- 中子星/脉冲星需要更明确地表现快速自转、磁轴倾斜、双极射束扫过视线，而不是普通双锥光柱。
- 超新星遗迹、红巨星、白矮星等也需要更独立的形态设计，避免只是换颜色和粒子壳。

## 下一轮优先级

1. 重构特殊天体近景观测模式。
2. 将黑洞、脉冲星、中子星、超新星遗迹、红巨星、白矮星拆成独立渲染函数，而不是共用过多装饰逻辑。
3. 黑洞效果重点：
   - 暗核心/事件视界视觉
   - 倾斜吸积盘
   - 多层差速旋转盘
   - 简化引力透镜光环
   - 可选喷流，但与脉冲星射束区分
4. 脉冲星/中子星效果重点：
   - 小而高亮的致密核心
   - 快速自转
   - 倾斜磁轴
   - 扫描式脉冲束
   - 周围粒子风星云
5. 增加“返回星图”后的状态恢复检查，避免近景模式残留对象、灯光或动画状态污染星图。
6. 做一次实际浏览器交互验证：逐个点击黑洞、脉冲星、白矮星、超新星遗迹，确认效果不串台。

## 新目标：把星体渲染升级为主项目内的大型子项目

用户明确希望黑洞、脉冲星、红巨星、中子星、白矮星、恒星等特殊天体的近景观测达到高保真、震撼、接近参考图的渲染效果。参考目标尤其包括黑洞图像中的：

- 强烈吸积盘亮度层次。
- 广义相对论引力透镜导致的上下弯曲盘面和光环。
- 事件视界/黑暗核心。
- 多普勒增亮，一侧吸积盘明显更亮。
- 高动态范围 bloom。
- 体积感、烟雾感、热等离子体质感。
- 可调参数思路：bloom strength、temperature、Doppler intensity、log luminance 等。

用户不在乎内存和性能，可以不用 Three.js 当前这套简化模型；可以为特殊天体近景观测引入更重的渲染方案、更复杂 shader、更高分辨率粒子/体积采样、更真实的数学模型和物理近似。

### 黑洞重构方向

- 不再用普通 RingGeometry + Cone 喷流糊弄。
- 做一个独立黑洞渲染器/模块，例如 `BlackHoleRenderer` 或 `RelativisticObjectRenderer`。
- 核心视觉：
  - Schwarzschild/Kerr 黑洞近似。
  - 事件视界黑盘。
  - photon ring / Einstein ring 近似。
  - 倾斜吸积盘。
  - 多层温度梯度吸积盘。
  - Doppler boosting：接近观察者一侧更亮、更蓝/白；远离一侧更暗、更红。
  - Gravitational redshift：靠近黑洞区域颜色/亮度发生变化。
  - 简化 ray marching 或屏幕空间 shader，模拟引力透镜弯曲。
  - 体积/雾化盘晕。
  - 可选喷流，但必须与脉冲星射束区分：黑洞喷流应更稳定、更宽、更物质流，不是灯塔扫射。

### 脉冲星/中子星重构方向

- 独立 `PulsarRenderer` / `NeutronStarRenderer`。
- 小而极亮的致密核心。
- 快速自转。
- 倾斜磁轴。
- 双极射束随自转扫过屏幕，形成周期性闪烁。
- 粒子风星云或磁层结构。
- 与黑洞喷流严格区分：脉冲星是旋转灯塔效应；黑洞是吸积盘/喷流/透镜效应。

### 红巨星/红超巨星重构方向

- 独立 `RedGiantRenderer`。
- 巨大、低温、橙红色球体。
- 表面大尺度对流胞/颗粒。
- 半透明外层大气。
- 缓慢脉动。
- 恒星风和质量损失粒子流。
- 可加入非球形扰动，不要完美球体。

### 白矮星重构方向

- 独立 `WhiteDwarfRenderer`。
- 小半径、高亮度、高温蓝白核心。
- 强烈 bloom。
- 可加入伴星吸积时的热斑/细吸积流，但普通白矮星不要乱加喷流。
- 说明电子简并压支撑，不做内部结构模拟。

### 超新星遗迹重构方向

- 独立 `SupernovaRemnantRenderer`。
- 多层膨胀壳。
- 激波前缘。
- 非均匀丝状结构。
- 热 X 射线气体和较冷尘埃/气体分层。
- 粒子系统数量可以大幅增加。

### 技术路线备忘

- 当前 Three.js 可以继续作为星图/太阳系大尺度框架。
- 特殊天体近景模式可以单独使用更重的 WebGL shader 管线，甚至可以逐步迁移到：
  - RawShaderMaterial / ShaderMaterial
  - GPGPU 粒子
  - 多 pass 后处理 bloom
  - 屏幕空间 ray marching
  - 自定义 full-screen quad 黑洞渲染
  - 若浏览器能力允许，未来考虑 WebGPU
- 不要在大尺度星图里跑高成本渲染，只在“近景观测模式”启用。
- 用户接受高内存占用，优先视觉震撼和物理可信度。

### 下一轮第一件事

先从黑洞开始重构：

1. 建立独立黑洞近景渲染模块。
2. 做 full-screen 或 near full-screen 黑洞视图。
3. 实现倾斜吸积盘、事件视界、photon ring、Doppler boosting、bloom。
4. 暂时不做完整 Kerr geodesic，但要用清晰的数学近似，并在 README/注释中说明限制。
5. 与当前 `focusSelectedSpecialObject` 接口连接，点击天鹅座 X-1 / 人马座 A* 后进入新黑洞观测器。

### 当前进展

- 已开始第一轮黑洞重构。
- `black-hole` 近景模式已从普通几何圆环/喷流切换为独立 ShaderMaterial 屏幕空间黑洞近似。
- 当前 shader 已包含：
  - 事件视界黑盘。
  - 直接吸积盘亮带。
  - 上下引力透镜弧的近似。
  - photon ring 近似。
  - 左侧多普勒增亮。
  - 暖色温度梯度。
  - 体积光尾和 bloom 感。
- 下一步需要实际浏览器中调参，重点改善：
  - 吸积盘的真实厚度和湍流纹理。
  - 上下透镜弧的几何准确性。
  - 高亮区是否过曝但仍保留层次。
  - 背景是否足够干净。

### 最新反馈

- 第一版黑洞 shader 已经“有一点像”，但因为本质仍偏 2D 屏幕贴片，所以近景观测时空间感不自然。
- 下一步不能只继续堆 2D shader，需要向真正可自由观测的 3D/体积化模型推进：
  - 倾斜吸积盘应存在于 3D 空间中，而不是纯屏幕图像。
  - 相机绕行时，吸积盘、光子环、透镜弧应有合理的视角变化。
  - 需要探索 3D 几何盘 + shader 材质 + 屏幕空间透镜后处理的混合方案。
  - 长远目标可以是 ray marching / ray bending 视图，而不是固定 billboarding quad。
- 交互 bug 已修复：
  - 近景观测时点击画布空白不应返回星图。
  - 只有点击“返回星图”按钮才退出近景观测。
- 新增沉浸式 UI 目标：
  - 近景观测时用户希望隐藏所有 UI，只保留渲染画面。
  - 已加入 `H` 快捷键和“界面”按钮来隐藏/恢复 UI；界面隐藏时 `Space` 也会优先恢复 UI。

## 参考图识别记录：黑洞效果图

用户提供了一张黑洞参考图，文件名为 `黑洞效果图，发完codex看后记得删除.png`。已使用本地 `vision.js` 分析，并按用户要求删除原图。后续复刻目标如下：

### 视觉目标

- 整体风格：硬核科幻 + 物理仿真 + 电影级 CG 光影，接近《星际穿越》式黑洞可视化。
- 背景应保持深黑，尽量减少星点干扰，让黑洞和吸积盘占据视觉中心。
- 黑洞主体是中心纯黑事件视界圆盘，边缘干净、锐利，与发光吸积盘形成强对比。
- 吸积盘需要有明显温度梯度：
  - 内侧：白色、亮黄色、橙黄。
  - 中层：橙红、赭石色。
  - 外层：暗红、棕褐，并逐渐融入黑暗。
- 吸积盘不能是均匀圆环，要有流动、湍流、拉伸、模糊的等离子体质感。
- 引力透镜是核心特征：
  - 后方盘面被黑洞引力弯曲到上方，形成明亮上弧。
  - 下方也有被弯曲的倒影/次级盘面。
  - 整体形成上下弯曲的沙漏/笑脸式结构。
- 多普勒增亮必须明显：
  - 朝向观察者的一侧应白黄爆亮。
  - 远离观察者的一侧更暗、更红。
  - 亮度和色彩不对称是物理可信度的关键。
- 需要强 HDR/bloom：
  - 高亮区边缘溢出。
  - 左侧高亮形成长条体积光尾。
  - 光晕从白、黄、橙到红逐渐衰减。
- 视角：略俯视的倾斜角度，约 30-45 度，既能看到盘面，又能看到透镜弧。
- 构图：黑洞中心略偏右，左侧保留强光和拖尾空间。

### 参数控制参考

参考图里出现了类似控制面板的参数，可作为下一轮交互设计或 shader uniform：

```js
const blackHoleConfig = {
  bloomStrength: 0.819,
  temperature: 3832.148,
  dopplerIntensity: 1,
  dopplerTemperatureShift: 0,
  bloomIterations: 1,
  logLuminance: 6.831
};
```

### 技术实现建议

- 优先做全屏/近全屏 shader，而不是普通 Three.js 几何环。
- 可用屏幕空间 ray marching 或近似 ray bending 来做引力透镜。
- 吸积盘可以用 procedural noise + radial temperature gradient + velocity field。
- 多普勒增亮可基于盘面切向速度与观察方向点积计算亮度/色温偏移。
- bloom 和 tone mapping 需要作为黑洞近景模式专属后处理。
- 若 Three.js 后处理不够，应考虑 WebGL 自定义 shader pipeline，之后再评估 WebGPU。

## 设计原则

- 保持科学克制：不假装做完整广义相对论光线追踪或磁流体模拟。
- 但视觉上要更接近真实物理现象的结构特征，而不是抽象特效。
- 每种天体都应该一眼能看出差异。
- 近景模式服务于“看清楚细节”，大尺度星图服务于“理解位置和层级”。

## 2026-05-15 截图反馈记录

用户提供当前黑洞近景截图后，识图结论如下：

- 当前人马座 A* 近景已经有黑色中心、橙黄吸积光晕和左侧高亮拖尾，但整体仍像贴在屏幕上的 2D 发光图。
- 最影响沉浸感的问题是吸积盘缺少真实厚度、视角变化和空间视差；相机绕行时不应该只是 billboard 平面。
- 事件视界边缘、光子环和透镜弧需要分层，前后关系要更明确。
- 吸积盘需要湍流、团块、温度梯度和多普勒不对称，而不是均匀发光带。
- 近景观测时 UI 可隐藏后，3D 场景内标题也应该一起隐藏，保证沉浸式观察。

本轮已实施的过渡方案：

- 黑洞近景从单个屏幕平面 shader 改成 3D 组合模型。
- 新增事件视界球体、引力边缘光晕、倾斜多层吸积盘、前后透镜弧、光子环和体积尘埃粒子。
- 吸积盘材质加入 procedural noise、旋臂/团块扰动、径向温度梯度和左侧多普勒增亮。
- 保留后续做更真实 ray bending / ray marching / bloom 后处理管线的方向。
- 沉浸 UI 隐藏时，近景标题随 UI 一起隐藏。

## 2026-05-15 第二轮黑洞截图反馈

用户提供 `屏幕截图 2026-05-15 172241.png` 后，确认本轮黑洞近景有明显进步：

- 事件视界、吸积盘亮度层次、光子环和整体冲击力比上一版更接近目标。
- 仍需继续解决的问题：吸积盘仍偏薄、局部仍像平面椭圆；光子环下半部分不够连续；粒子有方块像素感；多普勒与引力红移还需要更平滑。
- 本轮继续改进方向：增强吸积盘厚度、补全低透明度光子环残影、将方块粒子改成柔和圆形尘埃、让 `H / Space` 恢复 UI 的提示与行为一致。

## 2026-05-15 第三轮黑洞推进

本轮继续围绕黑洞近景观测器推进：

- 新增 `blackHoleConfig`，把 bloom、doppler、lensing、disk turbulence 作为黑洞近景的参数入口。
- 吸积盘多普勒增亮改为根据相机相对吸积盘方向实时计算，不再固定在屏幕一侧。
- 吸积盘 shader 加入简化引力红移：靠近事件视界的区域会更暗、更红，远离区域保留较高亮度。
- 新增被引力弯曲的背景星光弧，用细碎短弧表达星光经过黑洞附近时的透镜化。
- 新增黑洞专属 bloom/眩光叠层，模拟高动态范围下的水平光尾、核心光晕和上方透镜光 bleed。

下一轮黑洞优先级：

1. 将 bloom/透镜叠层和相机距离、观察倾角绑定，避免所有角度都像同一张电影海报。
2. 做吸积盘前后遮挡排序，让靠近观察者的盘面更明确地压过远端盘面。
3. 增加黑洞近景参数 UI，例如 bloom strength、temperature、doppler intensity、lensing strength。
4. 评估是否从 Three.js 组合模型进入 full-screen ray bending / ray marching 专用渲染管线。

## 渲染资源路线

用户确认：为了更高视觉效果，可以把“调用更多系统资源”作为一个可选增强方向，但当前优先级仍是先把默认浏览器内渲染做到最优。

路线分层：

1. 默认模式：继续使用当前 Three.js/WebGL 近景观测器，优化 shader、几何层次、粒子、曝光、透镜和 UI 体验。
2. 高质量浏览器模式：在默认模式基础上开启更多 pass、更多粒子、更高分辨率 procedural texture、更高采样的 bloom/ray bending 近似。
3. 系统资源增强模式：未来作为显式选项，可考虑调用本机更重的计算资源，例如离屏渲染、高采样路径、WebGPU、原生辅助进程或预计算贴图/序列帧。
4. 原则：重型模式必须是用户明确开启，不影响普通星图浏览；科学说明要清楚区分“物理近似”和“真实数值模拟”。

本轮补充：

- `blackHoleConfig` 中加入 `resourceMode` 与 `allowExternalRenderer` 字段，先作为未来重型模式的配置入口。
- 默认保持 `browser-high`，不主动调用额外系统资源。
- bloom 叠层开始跟随相机距离和观察倾角变化，避免静态海报感。
- 透镜星弧随相机距离淡出，减少远距离观测时的视觉噪声。
- 新增软内阴影遮挡层，强化事件视界对吸积盘近内侧的吞噬感。

## 当前主要问题：像素感 / 不够真实

用户指出黑洞目前仍有明显像素感，希望使用更先进、更高级的渲染方法。当前短期处理：

- 黑洞近景进入时临时提升 renderer pixel ratio，退出后恢复普通星图像素比。
- `blackHoleConfig` 新增 `focusRenderScale` 和 `maxFocusPixelRatio`，让黑洞近景可以吃更多浏览器内 GPU 资源。
- 径向粒子贴图从 256 提升到 512/1024，并启用 linear mipmap、linear filter 和 anisotropy。
- 吸积盘 `RingGeometry` 从较低径向采样提升到 768 x 64。
- 光子环和透镜弧增加分段数，减少弧线锯齿。
- 粒子尺寸略收小、alphaTest 降低，减少方块边缘。

后续高级路线：

- 将黑洞近景从 Three.js 组合对象逐步升级成专用 full-screen / near-full-screen ray-bending shader。
- Three.js 可以继续作为星图框架和渲染宿主，但黑洞核心视觉应由自定义 WebGL shader 管线负责。
- 如果浏览器 WebGL 仍无法满足目标，再开启显式“系统资源增强模式”，例如离屏高采样、预计算序列帧、WebGPU 或原生辅助渲染进程。

## 2026-05-15 第四轮黑洞推进：ray-bending 过渡层

本轮开始从“Three.js 组合模型”向“专用黑洞 shader 管线”过渡：

- 新增 `rayBendingStrength` 配置。
- 新增 `createBlackHoleRayBendingField()`，使用近屏 `ShaderMaterial` 绘制连续的引力弯曲光场。
- 该层会根据相机距离、屏幕比例和观察倾角更新，不是固定贴图。
- shader 内部生成近似 Einstein ring、secondary ring、caustic bleed 和透镜化背景星光短弧。
- 目的：减少像素粒子感，把黑洞附近的细节从离散点/管线几何转向连续片元计算。

仍然待做：

- 将当前近屏 ray-bending 层升级为真正全屏黑洞 pass，并与吸积盘采样绑定。
- 让背景星场真实参与弯曲，而不是 procedural 弧线近似。
- 增加参数 UI 控制 `rayBendingStrength`、`bloomStrength`、`dopplerIntensity`、`exposureCompensation`。

## 2026-05-15 第五轮黑洞推进：连续吸积盘采样层

本轮继续把黑洞核心视觉从离散几何迁移到 shader：

- 新增 `screenDiskOpacity` 配置。
- 新增 `createBlackHoleRelativisticDiskPass()`。
- 该层使用近屏 `ShaderMaterial` 连续计算吸积盘辐射，而不是只依赖 Three.js `RingGeometry`。
- shader 内包含：
  - 弯曲后的屏幕空间坐标。
  - 倾斜吸积盘投影。
  - 上方/下方透镜像近似。
  - photon ring 近似。
  - procedural turbulence / streaks。
  - 相机方向驱动的多普勒增亮。
  - 靠近事件视界区域的简化引力红移。
- 现阶段仍保留 3D 几何盘作为体积和视差支撑；新增 shader 层负责提升连续感和真实感。

下一步：

- 逐步降低几何盘对最终视觉的占比，让 shader pass 成为黑洞近景主视觉。
- 将 ray-bending field 与 relativistic disk pass 合并成一个统一全屏 pass。
- 做参数 UI 后，再根据截图调 `screenDiskOpacity`、`rayBendingStrength`、`bloomStrength`。

## 2026-05-15 第六轮黑洞推进：统一近屏 shader pass

本轮完成 ray-bending 与连续吸积盘采样的初步合并：

- 新增 `unifiedPassOpacity` 配置。
- 新增 `createBlackHoleUnifiedPass()`。
- 当前黑洞近景入口已从两个分离 pass 切换为统一 pass：
  - 旧：`createBlackHoleRayBendingField()` + `createBlackHoleRelativisticDiskPass()`。
  - 新：`createBlackHoleUnifiedPass()`。
- 统一 pass 内部同时处理：
  - 屏幕空间引力弯曲。
  - 倾斜吸积盘连续采样。
  - 上/下透镜盘面。
  - photon ring / Einstein ring。
  - 背景星光透镜弧。
  - 多普勒增亮。
  - 简化引力红移。
  - bloom 与曝光压缩。
- 旧的两个 pass 函数暂时保留，作为调参回退或对照。

下一步：

- 根据用户截图调统一 pass 参数，重点看是否过曝、是否仍有贴图感、光环是否过碎。
- 若统一 pass 效果稳定，可以逐步降低旧几何透镜弧和几何吸积盘的视觉权重。
- 下一阶段考虑把统一 pass 扩展到真正 full-screen pass，而不再只是挂在 3D 场景中的近屏平面。

## 2026-05-15 截图反馈：白色光环与 H 快捷键

用户提供 `屏幕截图 2026-05-15 180038.png` 后发现：

- 黑洞周围出现过亮的白色光环，视觉上像硬贴上去的白环。
- 统一 pass 的变化不够明显，主要可见变化集中在高亮环上。
- 近景界面无法按 `H` 隐藏/恢复 UI。

已修复：

- `H` 快捷键失效原因是键盘事件忽略了 `button` 焦点；点击近景观测按钮后焦点停留在按钮上，导致快捷键直接 return。现在只忽略输入框、文本域、下拉框和可编辑区域，不再忽略按钮。
- 降低 `bloomStrength`、`dopplerIntensity`、`exposureCompensation`、`rayBendingStrength`、`screenDiskOpacity` 和 `unifiedPassOpacity`，减少过曝。
- 几何 photon ring / halo 从亮白色改为低透明度暖橙色，避免与统一 pass 叠加成白环。
- 统一 pass 中 Einstein/photon ring 改为更宽、更弱、更暖，并加入噪声扰动，减少硬边白环和贴图感。

下一步观察重点：

- 白环是否已经变成更自然的暖色透镜光。
- `H` 和 `Space` 在近景界面是否都能正常隐藏/恢复 UI。
- 统一 pass 的吸积盘连续感是否比旧版更明显；如果仍不明显，需要进一步降低旧几何盘和旧透镜弧权重。

---

## 2026-05-17 · 推倒重来 — 独立黑洞测试项目

### 发生了什么

Claude Opus (effort=max) 完整分析了项目代码和历史记录后，在 `blackHoleRenderer.js` 中增强了 fragment shader：
- 加入多尺度 hash 噪声湍流
- 加入多普勒增亮（开普勒切向速度投影到观察者方向）
- 加入 Planckian 风格 5 段色温渐变（蓝白→暖白→黄→橙→深红）
- 从 `maxDens`（单点峰值）改为 `totalDens`（路径累积所有采样）

增强版 shader 在 Intel Arc + ANGLE 上一次编译通过（`[BH] GPU shader created`），证明之前的编译失败根因确实是 `uLuminance` uniform 未在 GLSL 中声明，而非指令预算不足。

### 致命 bug 发现：盘面永远显示为一条线

增强后盘面从细线变粗线，但仍不是倾斜椭圆结构。**根因**定位在 `blackHoleRenderer.js` 的 `update()` 方法：

```
quad.lookAt(camera)            → quad 永远正对相机
invWorld = quad.matrixWorld.invert()
camLocal = camera.position × invWorld  → 永远是 (0, 0, d)（quad 正前方）
camSw = swap(camLocal)         → (0, d, 0)
```

相机被锁定在 shader 空间的盘面 xy 平面内（z=0），视线与盘面法线垂直 → 完美侧视边缘 → 只能看到一条线。

修复方向是直接使用相机世界空间坐标，不经过 quad 的局部变换。但用户决定彻底重启。

### 清理动作

1. **删除** `js/blackHoleRenderer.js`
2. **还原** `index.html` — 去掉 `blackHoleRenderer.js` 和 `blackHoleCPU.js` 的 `<script>` 引用
3. **还原** `solarSystem.js`：
   - 恢复 `dopplerIntensity: 0.0`
   - 删除 `createFocusedBlackHoleModel()` 和 `triggerBlackHoleRender()` 方法
   - 黑洞近景回到 `createFocusedSpecialModel` 的 Three.js 几何分支
   - 删除 `showFocusView` 中黑洞专属 bloom / renderer quality / camera 逻辑
   - 简化 `clearFocusView` 的资源清理

### 新建独立项目 `测试黑洞/index.html`

单文件独立项目，Three.js ES module 导入，零其他 CDN 依赖：

**架构**：
- Three.js `PlaneGeometry(2,2)` full-screen quad + `OrthographicCamera`
- 手动球坐标轨道控制（鼠标拖拽旋转 / 滚轮缩放）
- **相机世界空间坐标直接传 shader**（不再经过 quad 局部变换）
- `swap(x,y,z) → (x,z,y)`：Three.js Y=spin → shader Z=spin
- 200 步 Schwarzschild 测地线积分
- `totalDens` 路径累积 + 多普勒 + 色温 + 多尺度噪声
- 底部实时 UI 滑块：多普勒 (0–1)、亮度、色温 (3000–20000K)

**尚未在浏览器中测试**。需验证：
1. 盘面是否正确显示为倾斜椭圆（不是一条线）
2. 鼠标拖拽旋转/缩放是否正常响应
3. 多普勒不对称是否可见（左侧更亮）
4. 噪声湍流是否自然

### 给 Sonnet 的交接

`测试黑洞/HANDOFF.md` — 完整英文交接文档，包含坐标系统说明、测试步骤、常见问题检查表、硬件约束、参考目标、禁止事项。

### 下一步优先级

1. **先让盘面正确显示**（倾斜椭圆 + 视角变化）
2. 加引力透镜效果（上下弯曲弧 / 沙漏结构）
3. 加 photon ring（事件视界外侧细光环）
4. 加 bloom 后处理（Three.js UnrealBloomPass）
5. 效果达标后，把方案移植回主项目
