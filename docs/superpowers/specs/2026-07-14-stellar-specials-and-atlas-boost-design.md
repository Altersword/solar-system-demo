# 红巨星 / 白矮星近景与克制星图扩充设计

## 目标

增强红巨星与白矮星近景的视觉差异，并只新增 5 个高辨识度星图目标，使两类天体都有多个可测样本。

## 范围

### 近景渲染

- 新增 `js/specials/redGiantRenderer.js`
- 新增 `js/specials/whiteDwarfRenderer.js`
- `SpecialBodyFactory` 按 `effectType` 路由
- `SimpleSpecialsRenderer` 不再负责 `red-giant` / `white-dwarf`
- `FocusController` 继续调用渲染器 `update()`，并保留已有 bloom / 相机距离

红巨星：

- 更大更软的橙红核心
- 表面对流颗粒
- 半透明大气
- 慢脉动
- 外层恒星风粒子
- 弱 bloom，不做成脉冲星高对比

白矮星：

- 明显更小的致密核心
- 强 bloom 与蓝白光晕
- 细环或轻微热斑提示
- 快速轻闪烁
- 不加喷流

### 星图扩充

总数 `90 → 95`：

| id | 名称 | atlasMap | effectType |
|---|---|---|---|
| `aldebaran` | 毕宿五 | milky-way | red-giant |
| `arcturus` | 大角星 | milky-way | red-giant |
| `mira` | 米拉 | milky-way | red-giant |
| `van-maanen-star` | 范马南星 | neighborhood | white-dwarf |
| `40-eridani-b` | 波江座 40 B | neighborhood | white-dwarf |

## 非目标

- 不修改黑洞管线
- 不扩到 100+ 目标
- 不做 ray-march 或重体积渲染
- 不推送远程

## 验收

- 参宿四 / 毕宿五近景：大、软、慢、有大气与对流感
- 天狼星 B / 范马南星近景：小、亮、冷白、强 bloom
- 两类不会互相像，也不会像脉冲星
- `node scripts/validate-catalog.cjs` 报告 95 条目
- 搜索、切层、信息面板、进出近景正常
