# 星图阶段 B：银河系地标深化设计

## 目标

将银河层从分散的星云、星团和特殊天体列表，扩展为具有观测路线感的银河系地标集合。阶段 B 只新增 `milky-way` 目录数据，不改变星图渲染器、搜索筛选和信息面板架构。

## 范围

新增约 10 个不重复目标，覆盖四类银河系观测主题：

- 银河结构方向：猎户臂、盾牌-半人马臂、银河盘/核球参照方向
- 球状星团：M13、M3 等银河晕中的古老恒星系统
- 恒星形成区：NGC 604、NGC 3603 等代表性区域
- 特殊恒星和致密天体：WR 104、Pistol Star、船帆座超新星遗迹、蟹状星云之外的脉冲星风星云

如果目标属于方向或结构参照，必须明确说明它是方向标或观测概念，不把旋臂、银河盘等大尺度结构误建模成实体几何。所有新增 ID 必须先与现有 70 项目录比对，不能重复。

## 数据设计

- 图层：所有目标使用 `atlasMap: 'milky-way'`。
- 分类：沿用现有 `galactic-landmark`、`deep-sky`、`nebula`、`stellar-object`、`stellar-remnant`、`supernova-remnant` 和 `compact-object` 枚举。
- 坐标：为每个目标提供近似 `galactic.lDeg` 与 `galactic.bDeg`；结构方向使用代表性银经银纬，而不是伪造精确实体位置。
- 距离：使用 `distanceLy` 表达目标所在尺度，继续由 `scaleCatalogDistance()` 压缩到可读的银河层空间。
- 视觉：复用现有恒星、深空点、特殊天体和标签创建流程；不新增专用 renderer 或新的 `effectType`。

## 交互与数据流

1. `CELESTIAL_CATALOG` 提供阶段 B 目标。
2. `StarAtlas.rebuild()` 按现有分类创建标记、光晕或特殊对象。
3. 搜索和类型筛选自动包含新增目标。
4. 点击搜索结果调用现有 `selectCatalogEntry()`，自动切换到银河层、飞入目标并打开信息面板。

## 验收标准

- 目录总数从 70 增加到约 80，银河层从 24 增加到约 34。
- 所有新增 ID 唯一，且全部属于 `milky-way`。
- `node scripts/validate-catalog.cjs` 通过，并包含阶段 B 目标存在性检查。
- `node --check js/planetData.js`、`js/atlas/starAtlas.js`、`js/solarSystem.js` 通过。
- 至少验证一个结构方向、一个星团、一个星云/残骸、一个特殊恒星或致密天体的搜索、切层、飞入和信息面板。
- 银河层没有明显大面积标签重叠，新增目标不会导致空白场景或浏览器控制台错误。
- `README.md`、`开发日记.md`、`NEXT_STEPS.md` 记录阶段 B 完成状态，并明确阶段 C 尚未开始。

## 后续阶段

阶段 B 验收通过后，再单独设计阶段 C 的本星系群和宇宙近邻扩展。阶段 C 继续遵循“数据扩充、脚本校验、浏览器验证、文档同步”的闭环。
