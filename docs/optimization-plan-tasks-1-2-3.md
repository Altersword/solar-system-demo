# 优化方案：Tasks 1 / 2 / 3

> 本文档面向执行者（GPT-5.6）。每节包含：**背景测量 → 根本原因 → 具体改法 → 验收标准**。
> 执行前先运行 `node scripts/validate-catalog.cjs` 确认基线（50000 entries）。
> 改完每步都要跑 `node --check <改动文件>` + `validate-catalog.cjs`，不准跳过。

---

## 当前状态（基线）

| 指标 | 数值 |
|---|---|
| 目录总条目 | 50000（精选 500 + bulk 49500） |
| planetData.js 文件大小 | ~340 KB |
| Node 解析+执行耗时 | ~80-90 ms |
| bulk 条目 JSON 总体积 | **25 MB** |
| 每个 bulk 条目 JSON 大小 | ~496 bytes |
| bulk `feature` 字符串总字节 | ~3.5 MB |
| bulk `related` 数组（4 种，各 12375 份拷贝） | **~10 MB 重复数据** |
| 精选标记每帧 draw calls（估算） | ~1000+（每标记各含独立 sprite + glow 几何） |
| `setDisplayMode` 切换耗时 | 完整 teardown+rebuild，百毫秒量级 |

---

## Task 1：planetData.js bulk 条目内存瘦身

### 根本原因

`planetData.js` 的 49500 个 bulk 条目每条都是完整 JS 对象字面量，含：
- `feature`：51 字符中文描述（独立字符串，不共享）
- `related`：`[{title, detail}]` 数组——实测只有 **4 种**，每种 12375 份完整拷贝

这导致 JS 引擎堆中有 49500 × 2 个独立对象 + 49500 个独立字符串，约占 25 MB。

### 改法

**步骤 1：在 `planetData.js` 中声明 4 个共享 `related` 常量**

在文件顶部（`CELESTIAL_CATALOG` 数组之前）添加：

```js
// 共享的 related 数组，4 种各一份，所有 bulk 条目引用同一对象
const BULK_RELATED_NEIGHBORHOOD   = Object.freeze([{ title: '太阳邻域',   detail: 'LHS 高自行恒星序列，用于细化太阳附近低质量恒星的覆盖。' }]);
const BULK_RELATED_MILKYWAY       = Object.freeze([{ title: '银河地标',   detail: 'WISE 电离氢区序列，补强银河系恒星形成区的覆盖。' }]);
const BULK_RELATED_LOCALGROUP     = Object.freeze([{ title: '本星系群成员', detail: 'M31 候选球状星团序列，细化仙女座星系的卫星结构。' }]);
const BULK_RELATED_COSMIC         = Object.freeze([{ title: '近邻宇宙',   detail: 'UGC 星系索引，用于扩充宇宙近邻层的星系样本覆盖。' }]);
```

**步骤 2：所有 bulk 条目的 `related` 字段改为引用常量**

搜索 `planetData.js` 中所有 bulk 批量生成代码（形如 `related: [{ title: ...` 的展开语法）：

```js
// 改前（每条独立对象）：
related: [{ title: '太阳邻域', detail: 'LHS ...' }],

// 改后（引用共享常量）：
related: BULK_RELATED_NEIGHBORHOOD,
```

四个 atlasMap 对应四个常量：
- `atlasMap: 'neighborhood'` → `BULK_RELATED_NEIGHBORHOOD`
- `atlasMap: 'milky-way'`    → `BULK_RELATED_MILKYWAY`
- `atlasMap: 'local-group'`  → `BULK_RELATED_LOCALGROUP`
- `atlasMap: 'cosmic-neighborhood'` → `BULK_RELATED_COSMIC`

**步骤 3：`feature` 字符串改为惰性生成**

bulk 条目的 `feature` 字段只在用户选中该条目时才展示（信息面板）。改为 getter：

```js
// 改前：
{
    id: 'lhs-1001',
    feature: 'LHS 1001（LHS 1001）为近邻红矮星，归入 1000 项目录计划的第 1 个均衡扩容批次。',
    // ...
}

// 改后：
{
    id: 'lhs-1001',
    get feature() { return `LHS 1001（LHS 1001）为近邻红矮星，归入 1000 项目录计划的第 1 个均衡扩容批次。`; },
    // ...
}
```

实际上，批量生成代码已经用模板字符串生成 feature，直接改成 getter 即可：

```js
// 在每个批量生成的 Array.from({ length }, (_, i) => ({ ... })) 里：
// 原：feature: `${name}（${nameEn}）为...，归入...`,
// 改：get feature() { return `${name}（${nameEn}）为...，归入...`; },
```

> 注意：批量生成闭包里的 `name`/`nameEn` 是局部变量，getter 可以正常捕获。

**步骤 4（可选，低优先）**：`dataQuality` 和 `source` 字段全部 bulk 条目值相同（`'synthetic'` / `'generated-stress-test'`），也可以提取为常量，但收益远小于 `related`，可选做。

### 预期效果

| 项 | 改前 | 改后 |
|---|---|---|
| `related` 对象实例数 | 49500 | 4 |
| `related` 占用内存 | ~10 MB | <1 KB |
| `feature` 字符串实例数 | 49500 | 0（按需生成） |
| Node 堆峰值（估算） | ~54 MB | ~30 MB |

### 验收标准

```bash
node --check js/planetData.js
node scripts/validate-catalog.cjs
# 预期：Catalog valid: 50000 entries
```

选中一个 bulk 条目后，信息面板的 `feature` 字段仍然正常显示。

---

## Task 2：精选标记 sprite 合批，降低 draw calls

### 根本原因

~500 个精选目标每个都在 `createStarMarker` / `createDeepSkyObject` 中创建：
- 1 个 `THREE.Sprite`（halo）
- 1 个 `THREE.Mesh` + 自定义 ShaderMaterial（glow）
- 0–12 个 `THREE.Sprite`（nebula clouds，深空目标）

这产生了 **~1000–2000 个独立 draw calls**，超过 4 个 bulk `THREE.Points` 批次的代价。

### 改法

**原则：同类 sprite 合并为一个 `THREE.Points` 批次**

#### 方案 A（推荐）：halo sprite 换为 Points 层

在 `starAtlas.js` 的 `rebuild()` 末尾，把所有精选标记的 halo sprite **不在标记 Group 内创建**，而是统一收集坐标/颜色，生成一个 `THREE.Points` 覆盖所有精选 halo：

```js
// 在 createStarMarker / createDeepSkyObject 里：
// 不再调用 this.host.createHaloSprite(...)
// 而是把 { position, color, size, opacity } 推入 this._pendingHaloPoints

// 在 rebuild() 最后：
this._flushHaloPoints();  // 生成一个 Points 对象覆盖全部精选 halo
```

`_flushHaloPoints()` 实现：

```js
_flushHaloPoints() {
    if (!this._pendingHaloPoints?.length) return;
    const count = this._pendingHaloPoints.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);  // 需要自定义 shader 才能逐点变尺寸
    const color = new THREE.Color();

    this._pendingHaloPoints.forEach((p, i) => {
        positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z;
        color.set(p.color);
        colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({
        size: 24,
        vertexColors: true,
        transparent: true,
        opacity: 0.18,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: this.host.createRadialTexture(0xffffff)  // 复用缓存贴图
    }));
    points.userData.atlasMap = 'all';  // 特殊标记，updateVisibility 单独处理
    this.atlasGroup.add(points);
    this._curatedHaloPoints = points;
    this._pendingHaloPoints = [];
}
```

`updateVisibility` 里对 `_curatedHaloPoints` 特殊处理：不按 atlasMap 隐藏，始终可见（各精选 Group 本身已控制可见性）；或者改成按图层分 4 批。

#### 方案 B（最小改动）：nebula cloud sprite 合批

深空目标（~200 个）各含 5–12 个 nebula sprites，是最大的 draw call 来源。把它们统一进一个 `THREE.Points`：

```js
// 在 createDeepSkyObject 中：
// 不创建 nebula sprites，而是把位置/颜色推入全局 nebula points 缓冲
// rebuild() 末尾统一生成 1 个 Points（或按 atlasMap 分 4 个）
```

#### 推荐执行顺序

1. 先做 nebula sprites 合批（方案 B）— 改动最小，收益最大（消除 ~1200 draw calls）
2. 再考虑 halo sprite 合批（方案 A）— 需要更多坐标跟踪

### 验收标准

```bash
node --check js/atlas/starAtlas.js
node scripts/validate-catalog.cjs
```

浏览器 DevTools Performance 面板：四层切换后 draw calls 相比基线减少 ≥ 40%。精选目标的 halo/glow 视觉效果不变。

---

## Task 3：`setDisplayMode` 切换免重建

### 根本原因

```js
// js/solarSystem.js - setDisplayMode
setDisplayMode(mode) {
    if (!SIMULATION.displayModes[mode] || mode === this.displayMode) return;
    this.displayMode = mode;
    this.rebuildBodies();  // ← 完整 teardown + 重建 50000 条目
    this.controls.maxDistance = this.getModeConfig().maxDistance;
    this.resetCamera();
}
```

`rebuildBodies()` 做：`clearBodies()` → `solarBodies.rebuild()` → `starAtlas.rebuild()`。
切换显示模式时，唯一变化的是 `scaleCatalogDistance` 的计算结果（距离缩放系数）。
几何本身不变，只需要**原地更新位置**。

### 改法

**步骤 1：在 `StarAtlas` 中添加 `rescalePositions()`**

```js
// js/atlas/starAtlas.js
rescalePositions() {
    // 1. 重新定位精选标记的 Group
    this.catalogObjects.forEach((record, id) => {
        const entry = this.catalogEntries.get(id);
        if (!entry) return;
        const newPos = this.host.getCatalogPosition(entry);
        record.group.position.copy(newPos);
    });

    // 2. 原地覆写 bulk Points 的 position buffer
    this.bulkLayerGroups.forEach((group, mapId) => {
        const points = group.children.find(c => c.isPoints);
        if (!points) return;
        const entries = points.userData.catalogEntries;
        const attr = points.geometry.getAttribute('position');
        entries.forEach((entry, index) => {
            const p = this.host.getCatalogPosition(entry);
            attr.setXYZ(index, p.x, p.y, p.z);
        });
        attr.needsUpdate = true;
        points.geometry.computeBoundingSphere();
    });
}
```

**步骤 2：`setDisplayMode` 改为优先调用 `rescalePositions`**

```js
// js/solarSystem.js
setDisplayMode(mode) {
    if (!SIMULATION.displayModes[mode] || mode === this.displayMode) return;
    this.displayMode = mode;

    // 只有从/到 'atlas' 模式才需要完整重建（atlas 模式下隐藏太阳系几何）
    const needsFullRebuild = (mode === 'atlas') !== (this.previousDisplayMode === 'atlas');
    this.previousDisplayMode = mode;

    if (needsFullRebuild) {
        this.rebuildBodies();
    } else {
        // 只更新坐标，不重建几何
        this.starAtlas.rescalePositions();
        this.solarBodies.rescaleOrbits?.();  // 可选：同步更新太阳系轨道线
    }

    this.controls.maxDistance = this.getModeConfig().maxDistance;
    this.resetCamera();
}
```

**步骤 3（可选）：`SolarBodies` 添加 `rescaleOrbits()`**

太阳系轨道线也有距离缩放，模式切换后可能偏移。如果视觉上没问题可以跳过，或者在重建时只重建太阳系部分（保留 atlas）：

```js
// js/solar/solarBodies.js
rescaleOrbits() {
    // 遍历 orbitGroups，重新计算每个行星轨道线的半径并更新 geometry
    // 具体实现参考 createOrbitLine 的逻辑
}
```

### 关键注意事项

- `getCatalogPosition` 每次调用都 `new THREE.Vector3()`，`rescalePositions` 中被调用 ~500 次（精选）+ 49500 次（bulk）。可以传入一个复用的 `Vector3` 以消除 GC 压力：

```js
// getCatalogPosition 增加可选的 target 参数
getCatalogPosition(entry, target) {
    const l = THREE.MathUtils.degToRad(entry.galactic.lDeg);
    const b = THREE.MathUtils.degToRad(entry.galactic.bDeg);
    const radius = this.scaleCatalogDistance(entry);
    const out = target || new THREE.Vector3();
    out.set(
        radius * Math.cos(b) * Math.cos(l),
        radius * Math.sin(b),
        radius * Math.cos(b) * Math.sin(l)
    );
    return out;
}
```

- 模式切换若触发 bulk `setBulkPointVisible` 后的提升对象，需要在 `rescalePositions` 中也更新它的位置（查 `selectedBulkDetailId`）。

### 验收标准

```bash
node --check js/solarSystem.js
node --check js/atlas/starAtlas.js
node scripts/validate-catalog.cjs
```

浏览器中：
1. 切换"观测比例 → 距离感 → 星图"三个模式，页面不闪白/不卡顿
2. 切换后标记位置正确，不残留旧坐标
3. 多次反复切换无 JS 错误

---

## 执行检查清单

每步完成后逐项打勾：

```
Task 1
[ ] planetData.js 顶部声明 4 个 BULK_RELATED_* 常量
[ ] 所有 bulk 批次的 related 字段引用常量（共 ~7 个批次函数）
[ ] feature 改为 getter（或保持字符串，只做 related 优化也可）
[ ] node --check js/planetData.js 通过
[ ] validate-catalog.cjs：50000 entries
[ ] 浏览器点击 bulk 条目信息面板正常显示 feature 和 related

Task 2
[ ] starAtlas.js：深空目标 nebula sprite 改为收集到缓冲，rebuild() 末尾统一创建 Points
[ ] updateVisibility 正确处理新 Points（按 atlasMap 切换可见性）
[ ] clearBodies / clear() 清理新 Points 资源
[ ] node --check js/atlas/starAtlas.js 通过
[ ] validate-catalog.cjs 通过
[ ] 浏览器：深空目标（蟹状星云、猎户座大星云等）视觉效果不退化
[ ] draw calls 相比基线减少

Task 3
[ ] solarSystem.js：setDisplayMode 添加 needsFullRebuild 判断
[ ] starAtlas.js：实现 rescalePositions()
[ ] getCatalogPosition 添加可选 target 参数
[ ] node --check js/solarSystem.js js/atlas/starAtlas.js 通过
[ ] validate-catalog.cjs 通过
[ ] 浏览器：三模式切换无卡顿，无坐标错误，无 JS 报错

最终回归
[ ] node scripts/smoke-test.cjs（14 个目标，全部 ok，0 failures）
[ ] node scripts/validate-catalog.cjs：50000 entries
[ ] git status 确认无多余文件提交
```

---

## 文件影响范围

| 文件 | Task 1 | Task 2 | Task 3 |
|---|---|---|---|
| `js/planetData.js` | ✏️ 主要改动 | — | — |
| `js/atlas/starAtlas.js` | — | ✏️ 主要改动 | ✏️ 添加 rescalePositions |
| `js/solarSystem.js` | — | — | ✏️ setDisplayMode 逻辑 |
| `js/solar/solarBodies.js` | — | — | ⚪ 可选 rescaleOrbits |
| `scripts/validate-catalog.cjs` | — | — | — |
| `index.html` | — | — | — |

---

## 不要做的事

- 不要动 bulk 条目的 `id`、`name`、`galactic` 等字段（validate-catalog 会检查）
- 不要修改 `CELESTIAL_CATALOG` 的条目数量或图层分布
- Task 2 改动前先确认 `clearGroup` / `disposeObject3D` 能正确释放新的合批 Points
- Task 3 的 `rescalePositions` 不要在 focus 模式激活时调用（会破坏近景状态）

---

*生成日期：2026-07-26。基线：50000 entries，4 层，精选 500 条。*
