# 架构拆分设计 · 太阳系 / 近邻星图 / 特殊天体近景

**日期**: 2026-07-12  
**状态**: 待用户审阅  
**范围**: Three.js 主项目结构重组（方案 A · 分阶段）  
**非范围**: Vite/ES Module 打包、黑洞物理公式重写、UI 视觉改版

---

## 1. 背景与问题

当前主渲染逻辑集中在 `js/solarSystem.js`（约 3200 行），职责包括：

- 场景 / 相机 / 渲染器 / bloom
- 太阳系天体与轨道
- 近邻星图与展开系统
- 特殊天体近景（黑洞、脉冲星、红巨星等）
- 信息面板与相机飞行

黑洞近景已独立为 `js/blackHoleRenderer.js`（测地线 ray-march + 5-pass bloom），但 `solarSystem.js` 内仍残留约 890 行**未调用**的旧黑洞 shader/几何方法。开发日记停在 2026-05，与 2026-07 代码不同步。

核心痛点：上帝类 + 死代码 + 特殊天体无统一接口，阻碍继续打磨视觉与扩展新天体。

---

## 2. 目标与非目标

### 目标

1. 将 `SolarSystem` 变为**薄编排器**，专职模块各管一块。
2. 特殊天体统一 `create / update / dispose` 接口，可插拔。
3. 黑洞管线唯一：只走 `BlackHoleRenderer`。
4. 行为零回归：星图、近景进出、脉冲星、音乐、快捷键、模式切换保持可用。
5. 继续支持 `python -m http.server` + script 标签加载，不引入打包工具。

### 非目标

- 不上 Vite / ES Module 打包（后续可选方案 C）。
- 不重写黑洞测地线/辐射公式。
- 不改 UI 外观与快捷键语义。
- 不把 USTC / rossning92 参考项目并入主路径。

### 成功标准

| # | 标准 |
|---|------|
| 1 | `solarSystem.js` 明显变薄，不再含旧黑洞大块 shader |
| 2 | 特殊天体经 Factory 创建，近景控制器不写 effectType 大段分支 |
| 3 | 死代码清除，文档与结构对齐 |
| 4 | 手动回归：Sgr A* / 天鹅座 X-1 近景、脉冲星近景、返回星图、星图层切换 |

---

## 3. 方案选择

采用 **方案 A · 按职责层分阶段拆分**（已确认）。

| 方案 | 说明 | 结论 |
|------|------|------|
| A 职责层 | script 加载 + 按 core/solar/atlas/focus/specials 拆 | **采用** |
| B Runtime | Solar/Atlas/Focus 三运行时切换 | 后续可选 |
| C ES Module | import/export + 可选 Vite | 结构稳定后再做 |

---

## 4. 目标目录与模块职责

```text
js/
  data/
    planetData.js
    orbitalMechanics.js
  core/
    appContext.js          # scene / camera / renderer / clock / shared vectors
    bloomComposer.js       # 通用 EffectComposer + UnrealBloomPass
  solar/
    solarBodies.js         # 太阳、行星、卫星、轨道、尘埃带
  atlas/
    starAtlas.js           # 近邻星 / 深空 / 星系群 / 展开系统
  focus/
    focusController.js     # 近景进出、相机飞行、主场景显隐恢复
  specials/
    specialBodyFactory.js  # effectType → renderer
    blackHoleRenderer.js   # 已有，迁入此目录
    pulsarRenderer.js      # 脉冲星近景
    simpleSpecials.js      # 红巨星 / 白矮星 / 超新星等
  ui/
    musicPlayer.js
    main.js
  solarSystem.js           # 薄门面
```

### 边界表

| 模块 | 负责 | 不负责 |
|------|------|--------|
| AppContext | scene/camera/renderer、像素比、resize | 天体内容 |
| BloomComposer | 通用 bloom | 黑洞 5-pass（在 BlackHoleRenderer） |
| SolarBodies | 太阳系重建、轨道、位置更新 | 星图 / 近景 |
| StarAtlas | catalog、展开系统、atlas 动画 | 太阳系轨道 |
| FocusController | show/clear focus、相机飞行、场景显隐 | 具体 shader |
| SpecialBodyFactory | 按 effectType 路由 | 场景编排 |
| BlackHoleRenderer | 测地线 + bloom 全屏渲染 | 星图点击 |
| SolarSystem 门面 | 组装模块、animate、对外 API | 几何/shader 细节 |

### 特殊天体统一接口

```js
{
  create(entry, ctx) -> THREE.Object3D  // 或 proxy mesh
  update(camera, config, time, delta) -> void
  dispose() -> void
}
```

`FocusController` 只依赖该接口；同时最多一个 active special renderer。

### index.html 加载顺序

```text
planetData → orbitalMechanics → musicPlayer
→ appContext → bloomComposer
→ solarBodies → starAtlas
→ blackHoleRenderer → pulsarRenderer → simpleSpecials → specialBodyFactory
→ focusController
→ solarSystem → main
```

---

## 5. 运行时数据流

```text
main.js (DOM)
    │
    ▼
SolarSystem 门面
  setTimeScale / toggleAtlas / focusSelectedSpecialObject / ...
    │
    ├─ SolarBodies     → bodyGroups, orbitGroups
    ├─ StarAtlas       → atlasGroup, expandedSystem
    ├─ FocusController → focusGroup + SpecialBodyFactory
    │                      ├─ BlackHoleRenderer
    │                      ├─ PulsarRenderer
    │                      └─ SimpleSpecials
    └─ AppContext      → scene, camera, renderer, clock
```

### animate() 拆分

```text
1. AppContext.tick()                 // delta / clock
2. FocusController.updateFlight()
3. controls.update()
4. if !paused: SolarBodies.updatePositions()
5. StarAtlas.updateAnimations()
6. FocusController.updateEffects()   // active special renderer
7. labels 更新
8. 渲染:
   - 若 special 接管画面（黑洞 full-screen）→ 由其绘制
   - 否则 BloomComposer 或 renderer.render(scene, camera)
```

### 近景生命周期

```text
focusSelectedSpecialObject(entry)
  → FocusController.show(entry)
      → 隐藏/降权 body、orbit、atlas
      → SpecialBodyFactory.create(entry, ctx)
      → flyCameraTo(...)
  每帧 update(camera, config, time, delta)
  → 返回星图 / clear
      → dispose active renderer
      → 恢复场景显隐与 controls 距离
```

---

## 6. 对外 API（保持兼容）

`main.js` 继续调用以下门面方法（零改或极少改）：

- `setTimeScale` / `togglePause` / `resetCamera`
- `toggleLabels` / `toggleOrbits` / `toggleAtlas` / `toggleEffects`
- `setDisplayMode` / `setAtlasMap`
- `focusSelectedSpecialObject` / `closeExpandedSystemView` / `hideInfoPanel`
- `togglePanDragMode`
- 属性：`elapsedDays` 等只读状态

---

## 7. 分阶段实施

### P0 · 清理死代码（优先）

删除 `solarSystem.js` 中仅定义、无外部调用的旧黑洞方法（约 L2155–L3045）：

- `createBlackHoleDiskMaterial`
- `createBlackHolePlasmaCloud`
- `createBlackHoleLensArc`
- `createLensedStarArcField`
- `createBlackHoleRayBendingField`
- `createBlackHoleUnifiedPass`
- `createBlackHoleRelativisticDiskPass`
- `createBlackHoleBloomOverlay`
- `createBlackHoleDustCloud`
- `createBlackHoleShaderMaterial`

**保留**：

- `createFocusedBlackHoleModel`（仅接 `BlackHoleRenderer`）
- `blackHoleConfig`
- `focusRenderer` 的 create / update / dispose 路径

### P1 · 抽出 specials

- 迁入/整理 `specials/blackHoleRenderer.js`
- 抽出 `pulsarRenderer.js`、`simpleSpecials.js`
- 新增 `specialBodyFactory.js`
- `createFocusedSpecialModel` 改为 Factory 调用

### P2 · 抽出场景层

- `core/appContext.js`、`core/bloomComposer.js`
- `solar/solarBodies.js`
- `atlas/starAtlas.js`
- `focus/focusController.js`
- `solarSystem.js` 仅组装 + animate + 门面 API

### P3 · 文档对齐

- 更新 `开发日记.md` / `NEXT_STEPS.md` / `README.md` 结构说明到当前架构
- 标明黑洞唯一管线与模块边界

---

## 8. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 误删仍在用的代码 | P0 仅删出现次数=1 的定义；改后点 Sgr A* / 天鹅座 X-1 |
| script 顺序导致 undefined | 每阶段更新 index.html 并浏览器验证 |
| 脉冲星与黑洞渲染互染 | Factory 保证单一 active renderer；clear 时强制 dispose |
| 行为回归 | 固定检查清单：近景进出、星图层、暂停、标签、音乐 |

### 回归清单

1. 打开主页，太阳系与星图可见  
2. 点击人马座 A* / 天鹅座 X-1 → 近景椭圆吸积盘 + 事件视界  
3. 拖拽环绕、滚轮缩放  
4. 返回星图，场景恢复  
5. 脉冲星近景与 bloom  
6. 星图层切换、时间倍率、H 隐藏 UI  

---

## 9. 后续可选（本设计不实施）

- 方案 B：Solar / Atlas / Focus 运行时硬隔离  
- 方案 C：ES Module + Vite  
- 黑洞参数面板 UI  
- 其他特殊天体高保真 Renderer  

---

## 10. 决策记录

| 决策 | 选择 | 日期 |
|------|------|------|
| 优化方向 | 架构拆分优先于视觉打磨 | 2026-07-12 |
| 拆分策略 | 方案 A 分阶段 | 2026-07-12 |
| 模块系统 | 暂保持 script 标签 | 2026-07-12 |
| 黑洞管线 | 仅 BlackHoleRenderer | 2026-07-12 |
