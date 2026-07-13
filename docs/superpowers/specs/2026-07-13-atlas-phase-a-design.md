# 星图阶段 A：近邻恒星与系外行星设计

## 目标

在现有四层星图基础上，优先增强太阳邻域的可探索性。阶段 A 只扩充 `neighborhood` 数据，不改变星图渲染、搜索、筛选、飞入和信息面板的整体架构。

## 范围

新增约 10 个不重复的近邻恒星或系外行星系统目标，覆盖：

- Alpha Centauri 星系
- Barnard 星、Wolf 359、Ross 128、Teegarden 星等近邻恒星
- TRAPPIST-1、Kepler-186、Kepler-452、LHS 1140、GJ 667 等系外行星系统

每个目录项必须使用现有字段约定，包含唯一 `id`、中文名称、英文名称、`category`、距离、坐标、颜色、尺寸和说明。系外行星系统可通过现有 `systemLayout` 描述内部行星分布，不新增专用渲染器。

## 设计

- 目录层级：全部使用 `category: 'neighborhood'`。
- 目标类型：沿用现有 `star` 和 `exoplanet-system` 类型；不添加新的类型枚举。
- 空间位置：使用真实天球方向的近似坐标，再交给 `scaleCatalogDistance()` 做显示距离压缩。
- 可视密度：保持每个系统的子行星数量克制，优先保证搜索命中目标的标签和信息面板可读。
- 兼容性：不修改 `StarAtlas` 的对象创建流程；如目录校验器需要补充约束，只做与新增字段直接相关的最小变更。

## 交互与数据流

1. `CELESTIAL_CATALOG` 提供阶段 A 目录项。
2. `StarAtlas.rebuild()` 将目录项创建为恒星标记或系外行星系统。
3. 搜索和类型筛选自动读取目录项，无需新增事件处理器。
4. 点击搜索结果调用现有 `selectCatalogEntry()`，自动切换到 `neighborhood`、飞入目标并显示信息面板。

## 验收标准

- 目录总数从 60 增加到约 70，所有 ID 唯一。
- `node scripts/validate-catalog.cjs` 通过。
- `node --check js/planetData.js`、`js/atlas/starAtlas.js`、`js/solarSystem.js` 通过。
- 至少验证一个恒星目标和一个系外行星系统的搜索、筛选、切层、飞入和信息面板。
- 近邻层没有出现明显的大面积标签重叠或新渲染报错。
- `README.md`、`开发日记.md`、`NEXT_STEPS.md` 记录阶段 A 的完成状态，并明确阶段 B 尚未开始。

## 后续阶段

阶段 A 验收通过后，再单独设计并实现阶段 B 的银河系地标扩充；阶段 C 在阶段 B 完成后处理。每个阶段都沿用“数据扩充、脚本校验、浏览器验证、文档同步”的闭环。
