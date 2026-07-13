# Vela Visual Models Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Vela pulsar and Vela supernova remnant distinct, cinematic near-view models that remain practical on an integrated-GPU laptop.

**Architecture:** Keep `PulsarRenderer` as the pulsar owner and move its animation into `update()`. Add `SupernovaRemnantRenderer` for layered shells, filaments, and particles. Route both through `SpecialBodyFactory`, let `FocusController` call renderer-owned updates, and retain lightweight atlas effects plus the existing bloom pipeline.

**Tech Stack:** Three.js r128, ShaderMaterial, BufferGeometry, TubeGeometry, PointsMaterial, UnrealBloomPass, vanilla JavaScript.

---

### Task 1: Add the Supernova Remnant Renderer

**Files:**
- Create: `js/specials/supernovaRemnantRenderer.js`

- [ ] **Step 1: Create the renderer lifecycle**

Implement `constructor(host)`, `create(entry)`, `update(deltaSeconds, time)`, and `dispose()`. Store references to shell materials, filament materials, particle groups, and the central source. `create()` must return one `THREE.Group` with `userData.effectType = 'supernova'`.

- [ ] **Step 2: Build three irregular shell layers**

Create three sphere geometries with 48 by 32 segments and deterministic vertex displacement from `host.seededRandom()` before material creation. Use transparent additive materials for cyan hot shock, violet diffuse gas, and warm orange dust. Use a low-cost shader with `uTime`, `uOpacity`, rim lighting, and two or three sine terms; no noise loops.

- [ ] **Step 3: Add filaments and particles**

Create 24 deterministic `CatmullRomCurve3` arcs around incomplete shell regions, each rendered as a thin `TubeGeometry` with 24 path segments. Add two point clouds totaling no more than 2400 particles: blue interior gas and warm outer dust. Mark groups with roles used by `update()`.

- [ ] **Step 4: Add a subtle central source and animation**

Add a small dim blue-white core and halo. In `update()`, slowly rotate shell layers at different rates, vary shell/filament opacity, pulse the central source slightly, and scale the full model by no more than 2 percent. Do not rebuild geometry per frame.

- [ ] **Step 5: Run syntax check and commit**

```bash
node --check js/specials/supernovaRemnantRenderer.js
git add js/specials/supernovaRemnantRenderer.js
git commit -m "feat: add supernova remnant near-view renderer"
```

Expected: syntax check exits 0.

### Task 2: Upgrade Pulsar Geometry and Renderer-Owned Animation

**Files:**
- Modify: `js/specials/pulsarRenderer.js`

- [ ] **Step 1: Store animated object references**

Add fields for rotor, magnetic axis, core material, beam layers, hotspots, wind, and shock arcs. Set them during `create()` so `update()` does not traverse the whole focus scene each frame.

- [ ] **Step 2: Refine core and beams**

Reduce the core radius from 10 to 7. Replace the three broad cone layers with a narrow bright core, a soft outer cone, and axial particles. Keep the beam length visually large but reduce cone radii and opacity so the beam reads as radiation rather than solid geometry.

- [ ] **Step 3: Replace circular termination shocks**

Replace three complete torus rings with four incomplete curve arcs placed in a flattened, slightly offset wind plane. Use thin tubes or lines with different phases and opacities.

- [ ] **Step 4: Implement `update(deltaSeconds, time, camera)`**

Rotate the rotor, compute magnetic-axis alignment with the camera, sharpen the lighthouse peak, update beam/hotspot opacity, update `uTime` and `uPulse`, rotate the asymmetric wind, and animate shock arc opacity/scale. Guard every optional reference.

- [ ] **Step 5: Run syntax check and commit**

```bash
node --check js/specials/pulsarRenderer.js
git add js/specials/pulsarRenderer.js
git commit -m "feat: refine Vela pulsar near-view model"
```

### Task 3: Integrate Dedicated Renderers

**Files:**
- Modify: `index.html`
- Modify: `js/specials/specialBodyFactory.js`
- Modify: `js/specials/simpleSpecials.js`
- Modify: `js/focus/focusController.js`
- Modify: `js/solarSystem.js`

- [ ] **Step 1: Load and route the remnant renderer**

Load `js/specials/supernovaRemnantRenderer.js` after `pulsarRenderer.js` and before `specialBodyFactory.js`. In the factory, route `effectType === 'supernova'` to `new SupernovaRemnantRenderer(host)` and return `ownsScreen: false`.

- [ ] **Step 2: Remove the generic supernova branch**

Remove `supernova` transparency setup and switch handling from `SimpleSpecialsRenderer`. Keep red giant, red dwarf, white dwarf, and default behavior unchanged.

- [ ] **Step 3: Delegate focus animation**

In `FocusController.update()`, call:

```js
this.focusSpecialRenderer?.update?.(deltaSeconds, time, this.host.camera);
```

Only call `host.updateSpecialObjectEffects()` for renderer types that still depend on host animation. Prevent double animation for pulsar and supernova.

- [ ] **Step 4: Remove migrated near-view pulsar animation**

Delete or bypass host branches that only animate `neutron-star-*` focus roles, while retaining the `pulsar-beams` branch used by atlas thumbnails and the `expanding-shell` branch used by lightweight atlas effects.

- [ ] **Step 5: Run integration syntax checks and commit**

```bash
node --check js/specials/simpleSpecials.js
node --check js/specials/specialBodyFactory.js
node --check js/focus/focusController.js
node --check js/solarSystem.js
git add index.html js/specials/simpleSpecials.js js/specials/specialBodyFactory.js js/focus/focusController.js js/solarSystem.js
git commit -m "refactor: route Vela models through dedicated renderers"
```

### Task 4: Improve Atlas Thumbnails Without Heavy Models

**Files:**
- Modify: `js/atlas/starAtlas.js`
- Modify: `js/solarSystem.js`

- [ ] **Step 1: Make the supernova atlas shell irregular**

Replace the single regular particle shell and two visual rings with a deterministic lightweight shell plus two or three incomplete arcs. Keep the atlas particle count at or below the existing 360 particles.

- [ ] **Step 2: Preserve lightweight animation roles**

Use `effectRole: 'expanding-shell'` for the atlas remnant root and existing `pulsar-beams` for the atlas pulsar. Ensure host animation continues to update only these lightweight roles.

- [ ] **Step 3: Run syntax checks and commit**

```bash
node --check js/atlas/starAtlas.js
node --check js/solarSystem.js
git add js/atlas/starAtlas.js js/solarSystem.js
git commit -m "feat: improve Vela atlas thumbnails"
```

### Task 5: Verify Behavior and Performance

**Files:**
- Test: local app at `http://127.0.0.1:4173/`

- [ ] **Step 1: Run all static checks**

```bash
node --check js/specials/pulsarRenderer.js
node --check js/specials/supernovaRemnantRenderer.js
node --check js/specials/simpleSpecials.js
node --check js/specials/specialBodyFactory.js
node --check js/focus/focusController.js
node --check js/atlas/starAtlas.js
node --check js/solarSystem.js
node scripts/validate-catalog.cjs
git diff --check
```

Expected: all checks pass; catalog remains at 90 entries.

- [ ] **Step 2: Verify pulsar near view**

Select `vela-pulsar`, enter near view, wait through several rotations, and confirm visible lighthouse peaks, narrow layered beams, asymmetric wind, and broken shock arcs. Rotate the camera and confirm the model remains stable.

- [ ] **Step 3: Verify remnant near view**

Return to the atlas, select `vela-supernova-remnant`, enter near view, and confirm irregular layered shells, gaps, colored filaments, particles, and slow expansion. Confirm it does not resemble the pulsar or a regular glowing sphere.

- [ ] **Step 4: Verify lifecycle**

Switch between the two near views twice, return to the atlas after each, and confirm no residual model, bloom state, camera constraint, console error, or long freeze.

- [ ] **Step 5: Capture evidence**

Save `vela-pulsar-v2.png` and `vela-remnant-v2.png`. Use the current laptop as the performance acceptance environment; reject changes that cause multi-second interaction stalls.

### Task 6: Synchronize Documentation

**Files:**
- Modify: `README.md`
- Modify: `开发日记.md`
- Modify: `NEXT_STEPS.md`

- [ ] **Step 1: Document renderer ownership and visual distinctions**

Describe the dedicated pulsar and supernova-remnant renderers, integrated-GPU performance budget, and the distinct lighthouse versus shock-shell visual language.

- [ ] **Step 2: Check and commit documentation**

```bash
git diff --check
git add README.md 开发日记.md NEXT_STEPS.md
git commit -m "docs: record Vela visual model redesign"
```
