# Atlas Phase A Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a curated set of nearby stars and exoplanet systems to the existing neighborhood atlas without changing the atlas rendering architecture.

**Architecture:** Extend `CELESTIAL_CATALOG` in `js/planetData.js` with approximately ten unique `neighborhood` entries. Reuse the existing `nearby-star` category, `systemLayout` shape, `StarAtlas` rebuild path, search/filter behavior, and distance scaling. Update only the catalog validator and project status documents where the new data requires it.

**Tech Stack:** Vanilla JavaScript, Three.js, CommonJS catalog validator, Node syntax checks, Python static server for browser verification.

---

### Task 1: Add Phase A Catalog Entries

**Files:**
- Modify: `js/planetData.js` in `CELESTIAL_CATALOG` near the existing neighborhood entries

- [ ] **Step 1: Record the current baseline**

Run:

```bash
node scripts/validate-catalog.cjs
```

Expected: `Catalog valid: 60 entries` with the existing four map counts.

- [ ] **Step 2: Add ten unique neighborhood targets**

Insert entries before the first `milky-way` entry (`pleiades`) using the existing object shape:

```js
{
    id: 'alpha-centauri-b',
    name: '半人马座 α B',
    nameEn: 'Alpha Centauri B',
    atlasMap: 'neighborhood',
    category: 'nearby-star',
    type: 'K 型伴星',
    distanceLy: 4.37,
    galactic: { lDeg: 315.7, bDeg: -0.7 },
    spectralClass: 'K1V',
    color: 0xffc278,
    size: 3.4,
    temperature: '约 5200 K',
    feature: '半人马座 α 三合星系统中的 K 型成员。',
    related: [
        { title: '双星成员', detail: '与半人马座 α A 绕共同质心运行。' },
        { title: '近邻系统', detail: '与比邻星共同构成离太阳最近的恒星系统。' }
    ]
},
{
    id: 'wolf-359',
    name: '沃尔夫 359',
    nameEn: 'Wolf 359',
    atlasMap: 'neighborhood',
    category: 'nearby-star',
    type: '红矮星',
    distanceLy: 7.86,
    galactic: { lDeg: 226.0, bDeg: 57.0 },
    spectralClass: 'M6V',
    color: 0xff715f,
    size: 2.8,
    temperature: '约 2800 K',
    feature: '距离太阳很近、质量和光度都很低的耀斑红矮星。'
},
{
    id: 'ross-128',
    name: '罗斯 128',
    nameEn: 'Ross 128',
    atlasMap: 'neighborhood',
    category: 'nearby-star',
    type: '红矮星',
    distanceLy: 11.0,
    galactic: { lDeg: 271.0, bDeg: 48.0 },
    spectralClass: 'M4V',
    color: 0xff896f,
    size: 2.9,
    temperature: '约 3200 K',
    feature: '相对安静的近邻红矮星，拥有已确认系外行星 Ross 128 b。',
    systemLayout: {
        sceneScale: 1.12,
        cameraDistance: 175,
        note: '行星轨道经过压缩，仅用于表达系统结构。',
        bodies: [
            { name: 'Ross 128', kind: 'star', color: 0xff896f, size: 13, x: 50, y: 50, detail: 'M4V 红矮星' },
            { name: 'Ross 128 b', kind: 'planet', color: 0x83b8d8, orbit: 25, angleDeg: 220, detail: '已确认；约 9.9 天轨道周期' }
        ]
    }
},

- [ ] **Step 3: Run the catalog validator after data insertion**

Run:

```bash
node scripts/validate-catalog.cjs
```

Expected: `Catalog valid: 70 entries`, with `neighborhood: 26` and no errors.

- [ ] **Step 4: Commit the catalog slice**

```bash
git add js/planetData.js
git commit -m "feat: expand nearby star atlas targets"
```

### Task 2: Update the Catalog Validator Contract

**Files:**
- Modify: `scripts/validate-catalog.cjs`

- [ ] **Step 1: Add phase-specific neighborhood assertions**

After the catalog loop, assert that the ten new IDs exist and belong to `neighborhood`:

```js
const phaseATargetIds = [
    'alpha-centauri-b', 'wolf-359', 'ross-128', 'teegarden-star', 'gj-667',
    'kepler-186', 'kepler-452', 'lhs-1140', 'gj-1132', 'hd-219134'
];
for (const id of phaseATargetIds) {
    const entry = CELESTIAL_CATALOG.find((candidate) => candidate.id === id);
    if (!entry) errors.push(`${id}: missing phase A target`);
    else if (entry.atlasMap !== 'neighborhood') errors.push(`${id}: phase A target is not neighborhood`);
}
```

- [ ] **Step 2: Run the validator and confirm the assertions pass**

```bash
node scripts/validate-catalog.cjs
```

Expected: `Catalog valid: 70 entries` and no error output.

- [ ] **Step 3: Commit the validator contract**

```bash
git add scripts/validate-catalog.cjs
git commit -m "test: assert phase A atlas targets"
```

### Task 3: Synchronize Project Documentation

**Files:**
- Modify: `README.md`
- Modify: `开发日记.md`
- Modify: `NEXT_STEPS.md`

- [ ] **Step 1: Update README catalog counts and feature wording**

Change the four-layer count from 60 to 70 and state that the neighborhood layer now includes the new nearby-star and exoplanet research targets. Keep the existing architecture and scientific-scale disclaimers unchanged.

- [ ] **Step 2: Append a dated development-log entry**

Add a 2026-07-13 entry recording that Phase A added ten targets, reused the existing data shape, and passed catalog validation. Explicitly say Phase B has not started.

- [ ] **Step 3: Update NEXT_STEPS status and priorities**

Change the completed catalog count to 70, record `neighborhood: 26`, and make “validate Phase A, then begin Milky Way landmarks” the next atlas priority. Do not delete the existing special-renderer backlog.

- [ ] **Step 4: Check Markdown whitespace and commit docs**

```bash
git diff --check
git add README.md 开发日记.md NEXT_STEPS.md
git commit -m "docs: record atlas phase A expansion"
```

Expected: `git diff --check` produces no output.

### Task 4: Run Static Verification

**Files:**
- Test: `js/planetData.js`
- Test: `js/atlas/starAtlas.js`
- Test: `js/solarSystem.js`
- Test: `scripts/validate-catalog.cjs`

- [ ] **Step 1: Run JavaScript syntax checks**

```bash
node --check js/planetData.js
node --check js/atlas/starAtlas.js
node --check js/solarSystem.js
```

Expected: all commands exit 0 with no output.

- [ ] **Step 2: Run the catalog validator one final time**

```bash
node scripts/validate-catalog.cjs
```

Expected: `Catalog valid: 70 entries`, `neighborhood: 26`, and no errors.

- [ ] **Step 3: Inspect final status**

```bash
git status --short
```

Expected: only intended phase A files are staged or committed; existing screenshots, videos, reference directories, and `.claude/` remain untouched.

### Task 5: Browser Interaction Verification

**Files:**
- Test: local app at `http://127.0.0.1:4173/`

- [ ] **Step 1: Start the static server**

```bash
python -m http.server 4173
```

- [ ] **Step 2: Verify a system target**

Open the app, select “太阳邻域”, search for `TRAPPIST-1`, click the result, and confirm selection, camera flight, and the information panel.

- [ ] **Step 3: Verify a simple star target**

Search for `沃尔夫 359`, click it, and confirm selection without a console error or blank scene.

- [ ] **Step 4: Verify a second system target**

Search for `开普勒-186`, click it, and confirm the information panel shows the system details and the existing compressed orbital layout can be opened.

- [ ] **Step 5: Record the result**

If all three flows pass, mark Phase A complete in `NEXT_STEPS.md`. If any flow fails, capture the exact browser error and fix only the failing data or integration boundary before starting Phase B.
{
    id: 'teegarden-star',
    name: '蒂加登星',
    nameEn: "Teegarden's Star",
    atlasMap: 'neighborhood',
    category: 'nearby-star',
    type: '超冷红矮星',
    distanceLy: 12.5,
    galactic: { lDeg: 197.0, bDeg: -22.0 },
    spectralClass: 'M7V',
    color: 0xff6d60,
    size: 2.7,
    temperature: '约 2700 K',
    feature: '拥有 Teegarden b、c 等近地球质量行星的近邻红矮星系统。',
    systemLayout: {
        sceneScale: 1.16,
        cameraDistance: 180,
        note: '两颗行星轨道按可读性拉开。',
        bodies: [
            { name: '蒂加登星', kind: 'star', color: 0xff6d60, size: 12, x: 50, y: 50, detail: 'M7V 超冷红矮星' },
            { name: 'Teegarden b', kind: 'planet', color: 0x75c6a0, orbit: 21, angleDeg: 30, detail: '已确认；约 4.9 天轨道周期' },
            { name: 'Teegarden c', kind: 'planet', color: 0x76a9d6, orbit: 31, angleDeg: 185, detail: '已确认；约 11.4 天轨道周期' }
        ]
    }
},
{
    id: 'gj-667',
    name: '格利泽 667',
    nameEn: 'Gliese 667',
    atlasMap: 'neighborhood',
    category: 'nearby-star',
    type: '三合星系统',
    distanceLy: 23.6,
    galactic: { lDeg: 332.0, bDeg: -12.0 },
    spectralClass: 'M1.5V + M3V + M3V',
    color: 0xff946e,
    size: 3.5,
    temperature: '多颗红矮星成员',
    feature: '多星系统；格利泽 667 C 曾被报告拥有多个系外行星候选。',
    systemLayout: {
        sceneScale: 1.18,
        cameraDistance: 185,
        note: '多星成员和候选行星均为压缩结构示意。',
        bodies: [
            { name: 'Gliese 667 C', kind: 'star', color: 0xff946e, size: 13, x: 50, y: 50, detail: 'M3V 红矮星' },
            { name: 'Gliese 667 A/B', kind: 'star', color: 0xffb184, size: 9, x: 28, y: 40, detail: '远处双星成员' },
            { name: '候选行星区', kind: 'candidate', color: 0x91b8e9, orbit: 28, angleDeg: 215, detail: '候选/研究目标，参数仍在修正' }
        ]
    }
},
{
    id: 'kepler-186',
    name: '开普勒-186',
    nameEn: 'Kepler-186',
    atlasMap: 'neighborhood',
    category: 'nearby-star',
    type: '系外行星系统',
    distanceLy: 492.0,
    galactic: { lDeg: 76.0, bDeg: 13.0 },
    spectralClass: 'M1V',
    color: 0xff956f,
    size: 3.0,
    temperature: '红矮星',
    feature: '拥有五颗已确认行星，Kepler-186 f 是早期地球大小宜居带候选代表。',
    systemLayout: {
        sceneScale: 1.2,
        cameraDistance: 195,
        note: '距离较远但仍归入邻域层，用压缩距离表达系外行星研究路线。',
        bodies: [
            { name: 'Kepler-186', kind: 'star', color: 0xff956f, size: 12, x: 50, y: 50, detail: 'M1V 红矮星' },
            { name: 'Kepler-186 b', kind: 'planet', color: 0xb7a18d, orbit: 14, angleDeg: 15, detail: '已确认行星' },
            { name: 'Kepler-186 c', kind: 'planet', color: 0x9daabf, orbit: 21, angleDeg: 80, detail: '已确认行星' },
            { name: 'Kepler-186 d', kind: 'planet', color: 0x9cae9e, orbit: 28, angleDeg: 145, detail: '已确认行星' },
            { name: 'Kepler-186 e', kind: 'planet', color: 0x87a9c6, orbit: 35, angleDeg: 220, detail: '已确认行星' },
            { name: 'Kepler-186 f', kind: 'planet', color: 0x78c49c, orbit: 43, angleDeg: 300, detail: '地球大小；宜居带候选代表' }
        ]
    }
},
{
    id: 'kepler-452',
    name: '开普勒-452',
    nameEn: 'Kepler-452',
    atlasMap: 'neighborhood',
    category: 'nearby-star',
    type: '太阳相似恒星系统',
    distanceLy: 1800.0,
    galactic: { lDeg: 76.0, bDeg: 6.0 },
    spectralClass: 'G2V',
    color: 0xffe1a0,
    size: 3.2,
    temperature: '约 5750 K',
    feature: '拥有位于宜居带附近的 Kepler-452 b，是太阳相似系统研究的代表目标。',
    systemLayout: {
        sceneScale: 1.12,
        cameraDistance: 190,
        note: 'Kepler-452 b 的性质仍需谨慎表述，轨道为压缩示意。',
        bodies: [
            { name: 'Kepler-452', kind: 'star', color: 0xffe1a0, size: 13, x: 50, y: 50, detail: 'G2V 太阳相似恒星' },
            { name: 'Kepler-452 b', kind: 'candidate', color: 0x76b98e, orbit: 34, angleDeg: 160, detail: '确认状态和物理性质仍需后续观测约束' }
        ]
    }
},
{
    id: 'lhs-1140',
    name: 'LHS 1140',
    nameEn: 'LHS 1140',
    atlasMap: 'neighborhood',
    category: 'nearby-star',
    type: '红矮星系统',
    distanceLy: 49.0,
    galactic: { lDeg: 204.0, bDeg: -55.0 },
    spectralClass: 'M4.5V',
    color: 0xff806b,
    size: 2.9,
    temperature: '约 3130 K',
    feature: 'LHS 1140 b 是近距离、适合大气研究的岩质行星候选。',
    systemLayout: {
        sceneScale: 1.14,
        cameraDistance: 185,
        note: '行星轨道和大小不是同一真实比例。',
        bodies: [
            { name: 'LHS 1140', kind: 'star', color: 0xff806b, size: 12, x: 50, y: 50, detail: 'M4.5V 红矮星' },
            { name: 'LHS 1140 b', kind: 'planet', color: 0x7eb5c5, orbit: 29, angleDeg: 250, detail: '岩质行星；宜居带大气研究重点' }
        ]
    }
},
{
    id: 'gj-1132',
    name: '格利泽 1132',
    nameEn: 'GJ 1132',
    atlasMap: 'neighborhood',
    category: 'nearby-star',
    type: '红矮星系统',
    distanceLy: 41.0,
    galactic: { lDeg: 295.0, bDeg: -59.0 },
    spectralClass: 'M4.5V',
    color: 0xff7c63,
    size: 2.9,
    temperature: '约 3270 K',
    feature: '近邻红矮星系统，GJ 1132 b 是大气观测的重要岩质行星目标。',
    systemLayout: {
        sceneScale: 1.1,
        cameraDistance: 180,
        note: '只展示代表性行星，轨道为压缩示意。',
        bodies: [
            { name: 'GJ 1132', kind: 'star', color: 0xff7c63, size: 12, x: 50, y: 50, detail: 'M4.5V 红矮星' },
            { name: 'GJ 1132 b', kind: 'planet', color: 0xb27f72, orbit: 23, angleDeg: 55, detail: '岩质行星；大气观测目标' }
        ]
    }
},
{
    id: 'hd-219134',
    name: 'HD 219134',
    nameEn: 'HD 219134',
    atlasMap: 'neighborhood',
    category: 'nearby-star',
    type: '多行星系统',
    distanceLy: 21.3,
    galactic: { lDeg: 92.0, bDeg: 2.0 },
    spectralClass: 'K3V',
    color: 0xffc889,
    size: 3.4,
    temperature: '约 4690 K',
    feature: '距离较近的 K 型多行星系统，包含已确认的岩质行星。',
    systemLayout: {
        sceneScale: 1.16,
        cameraDistance: 180,
        note: '多颗行星轨道按可读性压缩。',
        bodies: [
            { name: 'HD 219134', kind: 'star', color: 0xffc889, size: 13, x: 50, y: 50, detail: 'K3V 主序星' },
            { name: 'b', kind: 'planet', color: 0xb99478, orbit: 15, angleDeg: 10, detail: '已确认岩质行星' },
            { name: 'c', kind: 'planet', color: 0x8faac1, orbit: 24, angleDeg: 100, detail: '已确认行星' },
            { name: 'f', kind: 'planet', color: 0x9bc59d, orbit: 35, angleDeg: 215, detail: '已确认行星' }
        ]
    }
},
