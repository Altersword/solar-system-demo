# Atlas Phase C Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five Local Group galaxies and five cosmic-neighborhood landmarks while preserving the existing four-layer atlas architecture.

**Architecture:** Extend `CELESTIAL_CATALOG` with ten unique entries split evenly between `local-group` and `cosmic-neighborhood`. Reuse the existing galaxy and supercluster categories, distance compression, atlas rebuild, search/filter, camera flight, and information panel. Add explicit validator assertions, then update documentation and verify representative targets in the browser.

**Tech Stack:** Vanilla JavaScript, Three.js, Node CommonJS validator, Node syntax checks, Python static server, agent-browser.

---

### Task 1: Add Phase C Deep-Space Targets

**Files:**
- Modify: `js/planetData.js` in the existing Local Group and cosmic-neighborhood sections

- [ ] **Step 1: Verify the baseline**

```bash
node scripts/validate-catalog.cjs
```

Expected: `Catalog valid: 80 entries`, `local-group: 10`, and `cosmic-neighborhood: 10`.

- [ ] **Step 2: Add five Local Group galaxies**

Add entries with `atlasMap: 'local-group'`, `category: 'galaxy'`, positive distances, galactic coordinates, colors, sizes, and explanatory text:

```text
ic-1613       IC 1613
ngc-6822      巴纳德星系 / NGC 6822
wolf-lundmark-melotte  WLM
andromeda-ii  仙女座 II
andromeda-iii 仙女座 III
```

- [ ] **Step 3: Add five cosmic-neighborhood targets**

Add four representative galaxies and one direction marker:

```text
ngc-253                    NGC 253                 galaxy
m82-starburst              M82 星暴星系            galaxy
centaurus-a-galaxy         半人马座 A / NGC 5128   galaxy
m87-galaxy                 M87                     galaxy
local-supercluster-direction 本超星系团方向         supercluster
```

Use `atlasMap: 'cosmic-neighborhood'`. The supercluster entry must state that it is a scale/direction reference, not a precise physical boundary.

- [ ] **Step 4: Run validation**

```bash
node scripts/validate-catalog.cjs
```

Expected before adding the Phase C assertions: `Catalog valid: 90 entries`, `local-group: 15`, `cosmic-neighborhood: 15`.

- [ ] **Step 5: Commit catalog data**

```bash
git add js/planetData.js
git commit -m "feat: expand Local Group and cosmic atlas"
```

### Task 2: Add Phase C Validator Contract

**Files:**
- Modify: `scripts/validate-catalog.cjs`

- [ ] **Step 1: Assert the Phase C IDs and maps**

```js
const phaseCTargetMaps = {
    'ic-1613': 'local-group',
    'ngc-6822': 'local-group',
    'wolf-lundmark-melotte': 'local-group',
    'andromeda-ii': 'local-group',
    'andromeda-iii': 'local-group',
    'ngc-253': 'cosmic-neighborhood',
    'm82-starburst': 'cosmic-neighborhood',
    'centaurus-a-galaxy': 'cosmic-neighborhood',
    'm87-galaxy': 'cosmic-neighborhood',
    'local-supercluster-direction': 'cosmic-neighborhood'
};
for (const [id, atlasMap] of Object.entries(phaseCTargetMaps)) {
    const entry = CELESTIAL_CATALOG.find((candidate) => candidate.id === id);
    if (!entry) errors.push(`${id}: missing phase C target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}
```

- [ ] **Step 2: Run and commit validation**

```bash
node scripts/validate-catalog.cjs
git add scripts/validate-catalog.cjs
git commit -m "test: assert phase C atlas targets"
```

Expected: `Catalog valid: 90 entries`, with both deep-space maps at 15.

### Task 3: Synchronize Documentation

**Files:**
- Modify: `README.md`
- Modify: `开发日记.md`
- Modify: `NEXT_STEPS.md`

- [ ] **Step 1: Update README**

Change the total from 80 to 90 and add a concise Phase C feature bullet listing the new Local Group galaxies, representative nearby-universe galaxies, and the Local Supercluster direction marker.

- [ ] **Step 2: Update logs and next steps**

Record counts `26 / 34 / 15 / 15`, mark Phase C complete, and make the Vela pulsar/remnant visual redesign the next independent task. Preserve existing rendering backlog details.

- [ ] **Step 3: Check and commit documentation**

```bash
git diff --check
git add README.md 开发日记.md NEXT_STEPS.md
git commit -m "docs: record atlas phase C expansion"
```

Expected: whitespace check produces no output.

### Task 4: Run Static Verification

**Files:**
- Test: `js/planetData.js`
- Test: `js/atlas/starAtlas.js`
- Test: `js/solarSystem.js`
- Test: `scripts/validate-catalog.cjs`

- [ ] **Step 1: Run syntax and catalog checks**

```bash
node --check js/planetData.js
node --check js/atlas/starAtlas.js
node --check js/solarSystem.js
node scripts/validate-catalog.cjs
```

Expected: syntax checks exit 0; catalog reports 90 entries and map counts `26 / 34 / 15 / 15`.

- [ ] **Step 2: Inspect repository status**

```bash
git status --short
```

Expected: Phase C files are committed; existing media, references, `.claude/`, `.superpowers/`, and screenshots remain untracked and unstaged.

### Task 5: Verify Browser Interaction

**Files:**
- Test: `http://127.0.0.1:4173/`

- [ ] **Step 1: Confirm initialized catalog count**

Open the app and verify `solarSystem.catalogObjects.size === 90`.

- [ ] **Step 2: Verify Local Group targets**

Select `ic-1613` and `andromeda-ii`; confirm `selectedAtlasMap === 'local-group'` and the information-panel titles match.

- [ ] **Step 3: Verify cosmic-neighborhood targets**

Select `m82-starburst`, `m87-galaxy`, and `local-supercluster-direction`; confirm `selectedAtlasMap === 'cosmic-neighborhood'` and the panel titles match.

- [ ] **Step 4: Capture evidence**

Take `phase-c-deep-space.png` after selecting the Local Supercluster direction. Confirm no blank scene or browser console errors before declaring Phase C complete.
