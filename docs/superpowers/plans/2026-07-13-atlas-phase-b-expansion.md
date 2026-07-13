# Atlas Phase B Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deepen the Milky Way atlas with structural landmarks, representative clusters, star-forming regions, and special stellar objects.

**Architecture:** Extend `CELESTIAL_CATALOG` with ten unique `milky-way` entries. Reuse existing categories, coordinate fields, distance scaling, atlas creation, search/filter behavior, and information-panel rendering. Add validator assertions for the Phase B IDs and update project documentation only after static and browser verification.

**Tech Stack:** Vanilla JavaScript, Three.js, Node CommonJS validator, Node syntax checks, Python static server, agent-browser.

---

### Task 1: Add Milky Way Phase B Targets

**Files:**
- Modify: `js/planetData.js` before the first `local-group` entry

- [ ] **Step 1: Record the current baseline**

```bash
node scripts/validate-catalog.cjs
```

Expected: `Catalog valid: 70 entries` and `milky-way: 24`.

- [ ] **Step 2: Add ten unique entries**

Add these IDs, all with `atlasMap: 'milky-way'`, valid categories, positive `distanceLy`, `galactic` coordinates, color, size, and explanatory `feature` text:

```text
orion-arm-landmark       galactic-landmark   猎户臂方向
scutum-centaurus-arm     galactic-landmark   盾牌-半人马臂方向
galactic-bulge-landmark  galactic-landmark   银河系核球方向
m13-great-cluster        deep-sky            武仙座球状星团 M13
m3-globular-cluster      deep-sky            球状星团 M3
ngc-604                  nebula              NGC 604 恒星形成区
ngc-3603                 nebula              NGC 3603 恒星形成区
wr-104                   stellar-object      WR 104 Wolf-Rayet 星
pistol-star              stellar-object      Pistol Star
vela-supernova-remnant   supernova-remnant   船帆座超新星遗迹
```

Use `supernova-remnant` for `vela-supernova-remnant`; do not add a new category or effect type. For the three structure landmarks, describe them as direction/region references and do not create `systemLayout` bodies. For M13/M3, use `deep-sky` and explain their old stellar populations. For NGC 604/NGC 3603, use nebula-style descriptions. For WR 104/Pistol Star, use conservative stellar descriptions and do not imply unsupported exact system geometry.

- [ ] **Step 3: Run validation after insertion**

```bash
node scripts/validate-catalog.cjs
```

Expected: `Catalog valid: 80 entries`, with `milky-way: 34` and no errors.

- [ ] **Step 4: Commit the data slice**

```bash
git add js/planetData.js
git commit -m "feat: deepen Milky Way atlas landmarks"
```

### Task 2: Add Phase B Validator Assertions

**Files:**
- Modify: `scripts/validate-catalog.cjs`

- [ ] **Step 1: Add the Phase B ID contract**

After the existing Phase A assertions, add:

```js
const phaseBTargetIds = [
    'orion-arm-landmark', 'scutum-centaurus-arm', 'galactic-bulge-landmark',
    'm13-great-cluster', 'm3-globular-cluster', 'ngc-604', 'ngc-3603',
    'wr-104', 'pistol-star', 'vela-supernova-remnant'
];
for (const id of phaseBTargetIds) {
    const entry = CELESTIAL_CATALOG.find((candidate) => candidate.id === id);
    if (!entry) errors.push(`${id}: missing phase B target`);
    else if (entry.atlasMap !== 'milky-way') errors.push(`${id}: phase B target is not milky-way`);
}
```

- [ ] **Step 2: Run the validator**

```bash
node scripts/validate-catalog.cjs
```

Expected: `Catalog valid: 80 entries`, `milky-way: 34`, and no error output.

- [ ] **Step 3: Commit the validator update**

```bash
git add scripts/validate-catalog.cjs
git commit -m "test: assert phase B atlas targets"
```

### Task 3: Update Project Documentation

**Files:**
- Modify: `README.md`
- Modify: `开发日记.md`
- Modify: `NEXT_STEPS.md`

- [ ] **Step 1: Update README counts and feature list**

Change the atlas count from 70 to 80 and add a concise bullet describing the Phase B structural landmarks, M13/M3, NGC 604/NGC 3603, WR 104, Pistol Star, and the Vela remnant. Preserve the scale disclaimer that large structures are directional references.

- [ ] **Step 2: Append the dated development-log entry**

Record that Phase B increased `milky-way` from 24 to 34, reused existing categories and rendering paths, and passed catalog validation. State that Phase C has not started.

- [ ] **Step 3: Update NEXT_STEPS status**

Change the completed catalog count to 80 with counts `neighborhood 26 / milky-way 34 / local-group 10 / cosmic-neighborhood 10`. Make Phase C deep-space expansion the next atlas priority while retaining the special-renderer backlog.

- [ ] **Step 4: Check and commit docs**

```bash
git diff --check
git add README.md NEXT_STEPS.md 开发日记.md
git commit -m "docs: record atlas phase B expansion"
```

Expected: `git diff --check` produces no output.

### Task 4: Run Static Verification

**Files:**
- Test: `js/planetData.js`
- Test: `js/atlas/starAtlas.js`
- Test: `js/solarSystem.js`
- Test: `scripts/validate-catalog.cjs`

- [ ] **Step 1: Run syntax checks**

```bash
node --check js/planetData.js
node --check js/atlas/starAtlas.js
node --check js/solarSystem.js
```

Expected: all commands exit 0 with no output.

- [ ] **Step 2: Run the final catalog validation**

```bash
node scripts/validate-catalog.cjs
```

Expected: `Catalog valid: 80 entries`, `milky-way: 34`, and no errors.

- [ ] **Step 3: Inspect status**

```bash
git status --short
```

Expected: intended Phase B changes are committed; existing untracked media, reference directories, `.claude/`, `.superpowers/`, and browser captures remain untouched.

### Task 5: Verify Browser Interaction

**Files:**
- Test: local app at `http://127.0.0.1:4173/`

- [ ] **Step 1: Open the local app and expose the initialized scene if needed**

Open the app, wait for `solarSystem` to exist, then select the `银河` layer. If the loading overlay remains visible in the headless session despite the scene being initialized, remove only that test overlay through browser evaluation; do not change application code for this environment artifact.

- [ ] **Step 2: Verify a structural landmark**

Search `猎户臂方向`, click the result, and confirm `selectedAtlasMap` is `milky-way` and the information panel title is `猎户臂方向`.

- [ ] **Step 3: Verify a cluster**

Search `武仙座球状星团 M13`, click it, and confirm the panel identifies a deep-sky target without console errors.

- [ ] **Step 4: Verify a nebula or remnant**

Search `NGC 3603` or `船帆座超新星遗迹`, click it, and confirm the selected target and panel content.

- [ ] **Step 5: Capture evidence and conclude Phase B**

Take a screenshot of the Milky Way layer after selecting one target. If all flows pass, mark Phase B complete in `NEXT_STEPS.md`; otherwise record the exact failing target and fix only the relevant catalog or integration issue before beginning Phase C.
