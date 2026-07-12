# Architecture Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic `js/solarSystem.js` into responsibility-layer modules (core / solar / atlas / focus / specials) while keeping script-tag loading and zero user-facing behavior change.

**Architecture:** Keep Three.js r128 global scripts. `SolarSystem` becomes a thin facade. Special bodies implement `{ create, update, dispose }`. Black hole rendering stays solely in `BlackHoleRenderer`. Dead legacy black-hole methods in `solarSystem.js` are deleted first.

**Tech Stack:** Three.js r128 (CDN globals), vanilla JS (no bundler), static `python -m http.server` hosting.

**Spec:** `docs/superpowers/specs/2026-07-12-architecture-split-design.md`

---

## File map (end state)

| Path | Action | Responsibility |
|------|--------|----------------|
| `js/solarSystem.js` | Modify heavily | Facade: assemble modules, `animate()`, public API |
| `js/blackHoleRenderer.js` | Move | → `js/specials/blackHoleRenderer.js` |
| `js/specials/specialBodyFactory.js` | Create | Route `effectType` → renderer |
| `js/specials/pulsarRenderer.js` | Create | Pulsar / neutron-star focus model |
| `js/specials/simpleSpecials.js` | Create | red-giant / red-dwarf / white-dwarf / supernova focus |
| `js/focus/focusController.js` | Create | show/clear focus, camera flight, scene visibility |
| `js/core/appContext.js` | Create | scene / camera / renderer / clock / quality |
| `js/core/bloomComposer.js` | Create | UnrealBloomPass wrapper |
| `js/solar/solarBodies.js` | Create | sun / planets / moons / orbits / dust |
| `js/atlas/starAtlas.js` | Create | catalog markers / expanded systems / atlas anim |
| `js/main.js` | Minimal / none | Keep calling facade API |
| `index.html` | Modify | Script load order |
| `开发日记.md` / `NEXT_STEPS.md` / `README.md` | Modify | Document new structure |

**Note:** This project has no automated unit test runner. Each task verifies with (1) static checks (`Select-String` / line counts) and (2) manual browser smoke tests.

---

### Task 1: P0 — Delete dead black-hole methods

**Files:**
- Modify: `js/solarSystem.js` (delete ~L2155–L3045)
- Verify: no remaining references to deleted method names

- [ ] **Step 1: Confirm methods are dead (only definitions)**

Run in project root (PowerShell):

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$methods = @(
  'createBlackHoleDiskMaterial',
  'createBlackHolePlasmaCloud',
  'createBlackHoleLensArc',
  'createLensedStarArcField',
  'createBlackHoleRayBendingField',
  'createBlackHoleUnifiedPass',
  'createBlackHoleRelativisticDiskPass',
  'createBlackHoleBloomOverlay',
  'createBlackHoleDustCloud',
  'createBlackHoleShaderMaterial'
)
$content = Get-Content -LiteralPath '.\js\solarSystem.js' -Raw
foreach ($m in $methods) {
  $n = ([regex]::Matches($content, [regex]::Escape($m))).Count
  Write-Host "$m : $n"
}
```

Expected: each method `1` occurrence, except `createBlackHoleLensArc` may be `2` (definition + call inside dead `createLensedStarArcField` only).

- [ ] **Step 2: Delete the dead block**

In `js/solarSystem.js`, delete the entire method bodies from:

```js
    createBlackHoleDiskMaterial(entry, layer) {
```

through the end of:

```js
    createBlackHoleShaderMaterial(entry) {
        ...
    }
```

**Keep immediately after the deletion point:**

```js
    getFocusedCoreSize(effectType) {
```

**Keep before the deletion point:**

```js
    createFocusedBlackHoleModel(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-bh-fullscreen`;
        group.userData.effectType = entry.effectType;

        this.focusRenderer = new BlackHoleRenderer(this.renderer, this.blackHoleConfig);

        if (entry.id === 'sagittarius-a-star') {
            this.focusRenderer.setDopplerScale(0.78);
        }

        const mesh = this.focusRenderer.getMesh();
        group.add(mesh);
        return group;
    }

    getFocusedCoreSize(effectType) {
```

After edit, `createFocusedBlackHoleModel` must be followed directly by `getFocusedCoreSize` (blank line OK).

- [ ] **Step 3: Static verify deletion**

```powershell
Select-String -Path '.\js\solarSystem.js' -Pattern 'createBlackHoleDiskMaterial|createBlackHoleUnifiedPass|createBlackHoleShaderMaterial'
(Get-Content -LiteralPath '.\js\solarSystem.js').Count
```

Expected:
- No matches for those method names
- Line count roughly ~2300 (down from ~3221)

- [ ] **Step 4: Syntax / load smoke check**

```powershell
node --check .\js\solarSystem.js
```

Expected: no output (exit 0). If `node` missing, open browser instead (Step 5).

- [ ] **Step 5: Browser smoke (black hole still works)**

```powershell
python -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

Checklist:
1. Scene loads (sun + planets or atlas markers)
2. Open catalog entry for 人马座 A* or 天鹅座 X-1 → click **近景观测**
3. See black disk + warm accretion disk (not pure black screen)
4. Click **返回星图** → scene restores
5. F12 console: no red errors

- [ ] **Step 6: Commit**

```powershell
git add -- js/solarSystem.js
git commit -m "refactor: remove dead legacy black-hole shader paths from SolarSystem"
```

---

### Task 2: P1 — Create specials folder + move BlackHoleRenderer

**Files:**
- Create: `js/specials/` directory
- Move: `js/blackHoleRenderer.js` → `js/specials/blackHoleRenderer.js`
- Modify: `index.html` script path

- [ ] **Step 1: Create directory and move file**

```powershell
New-Item -ItemType Directory -Path 'js\specials' -Force | Out-Null
Move-Item -LiteralPath 'js\blackHoleRenderer.js' -Destination 'js\specials\blackHoleRenderer.js'
```

- [ ] **Step 2: Update index.html script src**

In `index.html`, change:

```html
<script src="js/blackHoleRenderer.js"></script>
```

to:

```html
<script src="js/specials/blackHoleRenderer.js"></script>
```

Keep order: still load before `js/solarSystem.js`.

- [ ] **Step 3: Verify class still global**

```powershell
Select-String -Path '.\js\specials\blackHoleRenderer.js' -Pattern 'class BlackHoleRenderer'
Select-String -Path '.\index.html' -Pattern 'blackHoleRenderer'
```

Expected: class found; index points to `js/specials/blackHoleRenderer.js`.

- [ ] **Step 4: Browser smoke**

Reload `http://127.0.0.1:4173/` → black-hole focus still works; console clean.

- [ ] **Step 5: Commit**

```powershell
git add -- js/specials/blackHoleRenderer.js js/blackHoleRenderer.js index.html
git commit -m "refactor: move BlackHoleRenderer into js/specials"
```

---

### Task 3: P1 — Extract PulsarRenderer

**Files:**
- Create: `js/specials/pulsarRenderer.js`
- Modify: `js/solarSystem.js` (delegate pulsar focus creation)
- Modify: `index.html` (add script)

- [ ] **Step 1: Create `js/specials/pulsarRenderer.js`**

Move logic from `SolarSystem.createFocusedNeutronStarModel` and helpers:

- `createFocusedNeutronStarModel`
- `createNeutronStarSurfaceMaterial`
- `createPulsarBeamPair`
- `createMagneticFieldLines`
- `createPulsarWindNebula`
- `createPulsarShockRings`

into a class with this public API:

```js
/* global THREE */
class PulsarRenderer {
    constructor(host) {
        // host = SolarSystem instance for shared helpers still on host:
        // createGlowMesh, createParticleShell, createHaloSprite, etc.
        // until those helpers are extracted later.
        this.host = host;
        this.group = null;
    }

    create(entry) {
        // body of former createFocusedNeutronStarModel(entry)
        // replace this.createX with this.host.createX for shared helpers
        // replace this.createNeutronStarSurfaceMaterial with local methods
        this.group = model;
        return model;
    }

    update(camera, config, time, deltaSeconds) {
        // optional no-op: SolarSystem.updateSpecialObjectEffects still walks the group
        // keep empty or thin until FocusController owns updates
    }

    dispose() {
        if (!this.group) return;
        this.host.disposeObject3D(this.group);
        this.group = null;
    }
}
```

**Important:** During this task, `PulsarRenderer` may call `this.host.createGlowMesh(...)` and similar shared utilities that remain on `SolarSystem`. Do not invent new glow helpers yet.

Exact extraction recipe:
1. Copy methods L610–~915 (through end of `createPulsarShockRings`) into `pulsarRenderer.js` as methods on `PulsarRenderer`.
2. Rename entry point to `create(entry)`.
3. For any call that is still on SolarSystem (e.g. `createGlowMesh`, `createParticleShell`, `seededRandom` if needed), use `this.host.*`.
4. Methods fully self-contained on the pulsar (surface material, beams, field lines, wind, shocks) stay as `this.*`.

- [ ] **Step 2: Wire SolarSystem to PulsarRenderer**

In `createFocusedSpecialModel`:

```js
createFocusedSpecialModel(entry) {
    if (entry.effectType === 'pulsar') {
        this.focusSpecialRenderer = new PulsarRenderer(this);
        return this.focusSpecialRenderer.create(entry);
    }
    // ... rest unchanged for non-pulsar
}
```

In `clearFocusView`, after disposing `focusRenderer`:

```js
this.focusSpecialRenderer?.dispose?.();
this.focusSpecialRenderer = null;
```

Add in constructor:

```js
this.focusSpecialRenderer = null;
```

Remove from `SolarSystem` the methods now living only in `PulsarRenderer` (the six listed above), once all call sites use the class.

- [ ] **Step 3: Load script in index.html**

After blackHoleRenderer, before solarSystem:

```html
<script src="js/specials/blackHoleRenderer.js"></script>
<script src="js/specials/pulsarRenderer.js"></script>
<script src="js/solarSystem.js"></script>
```

- [ ] **Step 4: Verify**

```powershell
node --check .\js\specials\pulsarRenderer.js
node --check .\js\solarSystem.js
Select-String -Path '.\js\solarSystem.js' -Pattern 'createFocusedNeutronStarModel'
```

Expected: no `createFocusedNeutronStarModel` left on SolarSystem; node --check clean.

- [ ] **Step 5: Browser smoke**

1. Find a pulsar / neutron-star catalog entry → 近景观测  
2. See rotating beams / bright core  
3. 返回星图 works  
4. Black hole near-view still works  

- [ ] **Step 6: Commit**

```powershell
git add -- js/specials/pulsarRenderer.js js/solarSystem.js index.html
git commit -m "refactor: extract PulsarRenderer from SolarSystem"
```

---

### Task 4: P1 — Extract SimpleSpecials + SpecialBodyFactory

**Files:**
- Create: `js/specials/simpleSpecials.js`
- Create: `js/specials/specialBodyFactory.js`
- Modify: `js/solarSystem.js`
- Modify: `index.html`

- [ ] **Step 1: Create `js/specials/simpleSpecials.js`**

```js
/* global THREE */
class SimpleSpecialsRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.effectType = null;
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-focused-model`;
        group.userData.effectType = entry.effectType;
        this.effectType = entry.effectType;

        const coreSize = this.host.getFocusedCoreSize(entry.effectType);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: entry.effectType === 'black-hole' ? 0x010103 : entry.color,
            transparent: entry.effectType === 'supernova',
            opacity: entry.effectType === 'supernova' ? 0.32 : 1
        });
        const core = new THREE.Mesh(new THREE.SphereGeometry(coreSize, 96, 64), coreMaterial);
        core.name = 'focus-core';
        group.add(core);

        switch (entry.effectType) {
            case 'red-giant':
                core.add(this.host.createGlowMesh(coreSize * 2.1, entry.color, 0.48));
                group.add(this.host.createParticleShell(entry, 420, coreSize * 1.8, coreSize * 4.1, 0xff8a50, 0.42));
                group.add(this.host.createFocusGranulation(entry.color, coreSize * 2.4));
                break;
            case 'red-dwarf':
                core.add(this.host.createGlowMesh(coreSize * 2.0, entry.color, 0.38));
                group.add(this.host.createFlareSparks({ ...entry, size: coreSize }, this.host.seededRandom(`${entry.id}-focus-flare`)));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize }, 0xffb36f, 2.2));
                break;
            case 'white-dwarf':
                core.add(this.host.createGlowMesh(coreSize * 3.2, 0xbfe7ff, 0.58));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize }, 0xbfe7ff, 2.6));
                break;
            case 'supernova':
                group.add(this.host.createParticleShell(entry, 720, coreSize * 1.2, coreSize * 5.6, entry.color, 0.62));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize }, entry.color, 4.5));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize }, 0x8fd8ff, 6.2));
                break;
            default:
                core.add(this.host.createGlowMesh(coreSize * 2, entry.color, 0.35));
                break;
        }

        this.group = group;
        return group;
    }

    update() {}

    dispose() {
        if (!this.group) return;
        this.host.disposeObject3D(this.group);
        this.group = null;
    }
}
```

- [ ] **Step 2: Create `js/specials/specialBodyFactory.js`**

```js
/* global BlackHoleRenderer, PulsarRenderer, SimpleSpecialsRenderer */
class SpecialBodyFactory {
    /**
     * @param {object} host SolarSystem (or later AppContext+helpers)
     * @param {object} entry catalog entry with effectType
     * @returns {{ renderer: object, object3d: THREE.Object3D, ownsScreen: boolean }}
     */
    static create(host, entry) {
        const type = entry.effectType;

        if (type === 'black-hole') {
            const renderer = new BlackHoleRenderer(host.renderer, host.blackHoleConfig);
            if (entry.id === 'sagittarius-a-star') {
                renderer.setDopplerScale(0.78);
            }
            const group = new THREE.Group();
            group.name = `${entry.id}-bh-fullscreen`;
            group.userData.effectType = type;
            group.add(renderer.getMesh());
            return { renderer, object3d: group, ownsScreen: true };
        }

        if (type === 'pulsar') {
            const renderer = new PulsarRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        const renderer = new SimpleSpecialsRenderer(host);
        const object3d = renderer.create(entry);
        return { renderer, object3d, ownsScreen: false };
    }
}
```

- [ ] **Step 3: Replace focus model creation in SolarSystem**

Replace `createFocusedSpecialModel` / `createFocusedBlackHoleModel` usage in `showFocusView` with:

```js
showFocusView(entry) {
    this.clearExpandedSystem();
    this.clearFocusView();
    this.focusedCatalogEntry = entry;

    const group = new THREE.Group();
    group.name = `${entry.id}-focus-view`;
    group.position.set(0, 0, 0);
    group.userData.focusView = true;

    const created = SpecialBodyFactory.create(this, entry);
    this.focusSpecialRenderer = created.renderer;
    this.focusOwnsScreen = created.ownsScreen;
    // keep legacy name used by animate():
    this.focusRenderer = created.ownsScreen ? created.renderer : null;

    group.add(created.object3d);

    const title = this.createTextSprite(`${entry.name} · ${entry.type}`, '#fff1c8');
    title.userData.effectRole = 'focus-title';
    title.position.set(0, 95, 0);
    title.scale.set(120, 30, 1);
    group.add(title);

    this.scene.add(group);
    this.focusGroup = group;
    // ... rest of showFocusView visibility + camera (unchanged)
}
```

Update `clearFocusView`:

```js
clearFocusView() {
    if (!this.focusGroup && !this.focusRenderer && !this.focusSpecialRenderer) return;

    if (this.focusRenderer?.dispose) this.focusRenderer.dispose();
    else if (this.focusSpecialRenderer?.dispose) this.focusSpecialRenderer.dispose();

    this.focusRenderer = null;
    this.focusSpecialRenderer = null;
    this.focusOwnsScreen = false;

    if (this.focusGroup) {
        this.disposeObject3D(this.focusGroup);
        this.scene.remove(this.focusGroup);
    }
    // ... restore visibility (unchanged)
}
```

Update `animate` render branch to keep working:

```js
if (this.focusRenderer) {
    this.focusRenderer.update(
        this.camera,
        this.blackHoleConfig,
        this.clock.elapsedTime,
        window.innerWidth / Math.max(window.innerHeight, 1)
    );
} else {
    // existing bloom / normal render
}
```

Delete now-unused `createFocusedSpecialModel` and `createFocusedBlackHoleModel` from SolarSystem after factory covers all types.

- [ ] **Step 4: index.html scripts**

```html
<script src="js/specials/blackHoleRenderer.js"></script>
<script src="js/specials/pulsarRenderer.js"></script>
<script src="js/specials/simpleSpecials.js"></script>
<script src="js/specials/specialBodyFactory.js"></script>
<script src="js/solarSystem.js"></script>
<script src="js/main.js"></script>
```

- [ ] **Step 5: Verify**

```powershell
node --check .\js\specials\simpleSpecials.js
node --check .\js\specials\specialBodyFactory.js
node --check .\js\solarSystem.js
Select-String -Path '.\js\solarSystem.js' -Pattern 'createFocusedSpecialModel|createFocusedBlackHoleModel'
```

Expected: no matches for those two methods.

- [ ] **Step 6: Browser regression checklist**

1. Black hole focus + return  
2. Pulsar focus + return  
3. Red giant or white dwarf focus if available  
4. Console clean  

- [ ] **Step 7: Commit**

```powershell
git add -- js/specials/simpleSpecials.js js/specials/specialBodyFactory.js js/solarSystem.js index.html
git commit -m "refactor: add SpecialBodyFactory and simple specials renderers"
```

---

### Task 5: P2 — Extract FocusController

**Files:**
- Create: `js/focus/focusController.js`
- Modify: `js/solarSystem.js`
- Modify: `index.html`

- [ ] **Step 1: Create `js/focus/focusController.js`**

Move from SolarSystem:

- `showFocusView`
- `clearFocusView`
- `focusSelectedSpecialObject`
- `flyCameraTo` / `flyCameraToPos` / `updateCameraFlight` (if only used by focus; if shared with expanded systems, keep flight on SolarSystem and inject callbacks)

Recommended constructor:

```js
/* global THREE, SpecialBodyFactory */
class FocusController {
    constructor(host) {
        this.host = host;
        this.focusGroup = null;
        this.focusedCatalogEntry = null;
        this.focusRenderer = null;       // screen-owning (black hole)
        this.focusSpecialRenderer = null;
        this.focusOwnsScreen = false;
    }

    get isActive() {
        return Boolean(this.focusGroup);
    }

    focusSelected() {
        const entry = this.host.selectedObject?.data;
        if (!entry || this.host.selectedObject?.objectKind !== 'catalog') return;
        if (!entry.effectType) return;
        this.show(entry);
    }

    show(entry) { /* moved showFocusView body; use this.host.scene / controls / etc. */ }

    clear() { /* moved clearFocusView body */ }

    update(deltaSeconds, time) {
        // title visibility + updateSpecialObjectEffects for non-BH
        // BH update remains in host.animate when focusRenderer set
    }

    onResize(width, height) {
        this.focusRenderer?.setSize?.(width, height);
    }
}
```

Wire host properties for backward compatibility in SolarSystem:

```js
// getters used elsewhere if needed
get focusGroup() { return this.focusController.focusGroup; }
get focusedCatalogEntry() { return this.focusController.focusedCatalogEntry; }
get focusRenderer() { return this.focusController.focusRenderer; }
```

Or assign after each show/clear to keep existing field reads working without getters — pick one approach and stick to it. Prefer **explicit sync fields** on host for minimal churn:

```js
// at end of FocusController.show / clear:
host.focusGroup = this.focusGroup;
host.focusedCatalogEntry = this.focusedCatalogEntry;
host.focusRenderer = this.focusRenderer;
```

- [ ] **Step 2: SolarSystem uses FocusController**

```js
// constructor / init
this.focusController = new FocusController(this);

// API
focusSelectedSpecialObject() {
    this.focusController.focusSelected();
}

// animate
this.focusController.update(deltaSeconds, this.clock.elapsedTime);
if (this.focusRenderer) {
    this.focusRenderer.update(...);
} else {
    // normal render
}
```

- [ ] **Step 3: index.html**

```html
<script src="js/specials/specialBodyFactory.js"></script>
<script src="js/focus/focusController.js"></script>
<script src="js/solarSystem.js"></script>
```

- [ ] **Step 4: Browser smoke + commit**

```powershell
git add -- js/focus/focusController.js js/solarSystem.js index.html
git commit -m "refactor: extract FocusController for near-view lifecycle"
```

---

### Task 6: P2 — Extract AppContext + BloomComposer

**Files:**
- Create: `js/core/appContext.js`
- Create: `js/core/bloomComposer.js`
- Modify: `js/solarSystem.js`
- Modify: `index.html`

- [ ] **Step 1: `js/core/appContext.js`**

Move:

- `setupScene`
- `getRendererPixelRatio` / `applyRendererQuality`
- `onWindowResize` (renderer/camera parts)
- shared vectors if clean

```js
/* global THREE */
class AppContext {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
    }

    setup(containerEl) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x02040c);
        this.scene.fog = new THREE.FogExp2(0x02040c, 0.00018);

        this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 8000);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.16;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        containerEl.appendChild(this.renderer.domElement);
        return this;
    }

    applyQuality(isHighFidelityFocus, blackHoleConfig) {
        const deviceRatio = window.devicePixelRatio || 1;
        const ratio = isHighFidelityFocus
            ? Math.min(Math.max(deviceRatio * blackHoleConfig.focusRenderScale, 2.5), blackHoleConfig.maxFocusPixelRatio)
            : Math.min(deviceRatio, 2);
        this.renderer.setPixelRatio(ratio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
}
```

- [ ] **Step 2: `js/core/bloomComposer.js`**

Move `setupBloom` + use flags:

```js
/* global THREE */
class BloomComposer {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = null;
        this.bloomPass = null;
        this.enabled = false;
        this.setup();
    }

    setup() {
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        this.bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.3, 0.5, 0.2
        );
        this.composer.addPass(this.bloomPass);
    }

    setEnabled(on) { this.enabled = Boolean(on); }

    resize(w, h) {
        this.composer?.setSize(w, h);
        if (this.bloomPass) this.bloomPass.resolution.set(w, h);
    }

    render() {
        if (this.enabled && this.composer) this.composer.render();
        else this.renderer.render(this.scene, this.camera);
    }
}
```

- [ ] **Step 3: Wire SolarSystem**

```js
this.ctx = new AppContext();
this.ctx.setup(document.getElementById('canvas-container'));
this.scene = this.ctx.scene;
this.camera = this.ctx.camera;
this.renderer = this.ctx.renderer;
this.clock = this.ctx.clock;

this.bloom = new BloomComposer(this.renderer, this.scene, this.camera);
// replace this.useBloom / this.composer / this.bloomPass usages carefully
```

Keep property aliases if many call sites use `this.composer`:

```js
this.composer = this.bloom.composer;
this.bloomPass = this.bloom.bloomPass;
```

- [ ] **Step 4: index.html order**

```html
<script src="js/core/appContext.js"></script>
<script src="js/core/bloomComposer.js"></script>
```

Load after Three.js CDN scripts, before domain modules.

- [ ] **Step 5: Browser smoke + commit**

```powershell
git add -- js/core/appContext.js js/core/bloomComposer.js js/solarSystem.js index.html
git commit -m "refactor: extract AppContext and BloomComposer"
```

---

### Task 7: P2 — Extract SolarBodies

**Files:**
- Create: `js/solar/solarBodies.js`
- Modify: `js/solarSystem.js`
- Modify: `index.html`

- [ ] **Step 1: Create module owning**

Move methods:

- `rebuildBodies` / `clearBodies` (solar parts)
- `createSun` / `createPlanet` / `createMoons`
- `createSolarDustBelts` / `createParticleBelt`
- `createOrbitLine` (if solar-only)
- `updateBodyPositions`
- scale helpers if only used by solar: `scaleOrbitDistance`, `scalePlanetRadius`, `scaleMoonDistance`, `scaleMoonRadius`

Class shape:

```js
class SolarBodies {
    constructor(host) {
        this.host = host;
        this.bodyGroups = new THREE.Group();
        this.orbitGroups = new THREE.Group();
        this.planets = new Map();
        this.sun = null;
    }

    attach(scene) {
        scene.add(this.orbitGroups, this.bodyGroups);
    }

    rebuild() { /* former rebuildBodies solar half */ }
    updatePositions(elapsedDays, deltaDays) { /* ... */ }
    setVisible(v) {
        this.bodyGroups.visible = v;
        this.orbitGroups.visible = v;
        if (this.sun) this.sun.visible = v;
    }
}
```

Starfield / milky way can stay on SolarSystem or move to AppContext later; **do not** move atlas into this task.

- [ ] **Step 2: SolarSystem delegates**

```js
this.solarBodies = new SolarBodies(this);
this.solarBodies.attach(this.scene);
this.bodyGroups = this.solarBodies.bodyGroups;
this.orbitGroups = this.solarBodies.orbitGroups;
```

- [ ] **Step 3: Browser smoke (planets orbit, pause works) + commit**

```powershell
git add -- js/solar/solarBodies.js js/solarSystem.js index.html
git commit -m "refactor: extract SolarBodies module"
```

---

### Task 8: P2 — Extract StarAtlas

**Files:**
- Create: `js/atlas/starAtlas.js`
- Modify: `js/solarSystem.js`
- Modify: `index.html`

- [ ] **Step 1: Create `js/atlas/starAtlas.js`**

Move:

- `createAtlas` / `createStarMarker` / `createDeepSkyObject`
- `decorateSpecialObject` (atlas-scale, not focus)
- `updateAtlasAnimations` / `updateAtlasVisibility` / `setAtlasMap` / `toggleAtlas`
- expanded system: `showExpandedSystem` / `clearExpandedSystem` / related helpers if only used there

```js
class StarAtlas {
    constructor(host) {
        this.host = host;
        this.atlasGroup = new THREE.Group();
        this.catalogObjects = new Map();
        this.expandedSystemGroup = null;
        this.selectedAtlasMap = 'neighborhood';
        this.showAtlas = true;
    }

    attach(scene) { scene.add(this.atlasGroup); }
    rebuild() { /* createAtlas */ }
    setMap(mapId) { /* ... */ }
    setVisible(v) { /* ... */ }
    updateAnimations(deltaSeconds) { /* ... */ }
}
```

- [ ] **Step 2: Wire + keep main.js API**

```js
setAtlasMap(mapId) { this.starAtlas.setMap(mapId); }
toggleAtlas() { return this.starAtlas.toggle(); }
```

- [ ] **Step 3: Browser smoke (atlas layers, expand system, return) + commit**

```powershell
git add -- js/atlas/starAtlas.js js/solarSystem.js index.html
git commit -m "refactor: extract StarAtlas module"
```

---

### Task 9: P2 — Thin SolarSystem facade pass

**Files:**
- Modify: `js/solarSystem.js` only (cleanup)

- [ ] **Step 1: Ensure SolarSystem only**

1. `constructor` + `init` assembly  
2. `animate` orchestration  
3. Public API methods for `main.js`  
4. Shared utilities still needed by modules (`disposeObject3D`, `createTextSprite`, labels, picking) — **OK to keep temporarily**

Target: file under ~1200 lines if possible; if shared helpers still dominate, stop without force-splitting helpers.

- [ ] **Step 2: Line count + API grep**

```powershell
(Get-Content -LiteralPath '.\js\solarSystem.js').Count
Select-String -Path '.\js\main.js' -Pattern 'solarSystem\?\.\w+|solarSystem\.\w+'
```

Confirm every `main.js` call still exists on facade.

- [ ] **Step 3: Full browser regression**

1. Load / pause / time scale  
2. Labels / orbits / atlas toggles  
3. Display modes 观测 / 距离感 / 星图  
4. Atlas map layers  
5. Black hole focus  
6. Pulsar focus  
7. H UI hide  
8. Music still loads  

- [ ] **Step 4: Commit**

```powershell
git add -- js/solarSystem.js
git commit -m "refactor: thin SolarSystem facade after module extraction"
```

---

### Task 10: P3 — Documentation sync

**Files:**
- Modify: `README.md`
- Modify: `开发日记.md`
- Modify: `NEXT_STEPS.md` (or append)

- [ ] **Step 1: README project structure**

Replace structure section with:

```text
.
├── index.html
├── css/style.css
├── js/
│   ├── core/           # AppContext, BloomComposer
│   ├── solar/          # SolarBodies
│   ├── atlas/          # StarAtlas
│   ├── focus/          # FocusController
│   ├── specials/       # BlackHole / Pulsar / Simple / Factory
│   ├── data via planetData.js, orbitalMechanics.js
│   ├── solarSystem.js  # facade
│   ├── musicPlayer.js
│   └── main.js
└── music/
```

Note: black hole near-view uses only `js/specials/blackHoleRenderer.js`.

- [ ] **Step 2: Append 开发日记 entry for 2026-07-12**

```markdown
## 2026-07-12 · 架构拆分（方案 A）

### 完成
- 删除 solarSystem.js 旧黑洞死代码（~900 行）
- specials: BlackHoleRenderer / PulsarRenderer / SimpleSpecials / Factory
- focus: FocusController
- core: AppContext / BloomComposer
- solar: SolarBodies
- atlas: StarAtlas
- SolarSystem 变为薄门面

### 管线
- 黑洞近景唯一路径: specials/blackHoleRenderer.js
- 近景生命周期: FocusController + SpecialBodyFactory

### 未做
- ES Module / Vite
- 黑洞物理重写
```

- [ ] **Step 3: NEXT_STEPS 顶部加状态**

Mark architecture split as done; next priorities: black-hole visual polish, per-body high-fidelity renderers.

- [ ] **Step 4: Commit**

```powershell
git add -- README.md 开发日记.md NEXT_STEPS.md
git commit -m "docs: sync architecture after module split"
```

---

## Final verification (after all tasks)

```powershell
# structure
Get-ChildItem -Recurse js -File | Select-Object FullName

# no dead legacy names
Select-String -Path '.\js\**\*.js' -Pattern 'createBlackHoleUnifiedPass|createBlackHoleShaderMaterial'

# server
python -m http.server 4173
```

Manual checklist (all must pass):

| # | Check |
|---|--------|
| 1 | Home loads without console errors |
| 2 | Planets move when not paused |
| 3 | Atlas maps switch |
| 4 | Sgr A* / Cyg X-1 near view |
| 5 | Pulsar near view |
| 6 | Return to atlas restores scene |
| 7 | UI hide H / Space |
| 8 | Music player works |

---

## Spec coverage self-check

| Spec section | Task |
|--------------|------|
| P0 dead code delete | Task 1 |
| specials folder + BH move | Task 2 |
| Pulsar extract | Task 3 |
| Factory + simple specials | Task 4 |
| FocusController | Task 5 |
| AppContext + Bloom | Task 6 |
| SolarBodies | Task 7 |
| StarAtlas | Task 8 |
| Thin facade | Task 9 |
| Docs P3 | Task 10 |
| Script-tag loading / no bundler | All tasks keep `index.html` scripts |
| main.js API stable | Tasks 5–9 preserve facade methods |
| BH single pipeline | Tasks 1–4 |

---

## Execution notes

- Prefer **one task → verify → commit** before starting the next.
- If a task grows too large mid-way, commit a partial working state rather than a broken intermediate.
- Do not reintroduce deleted black-hole methods.
- Shared helpers (`createGlowMesh`, labels, picking) may remain on SolarSystem until a later cleanup; that is acceptable and not a plan failure.
