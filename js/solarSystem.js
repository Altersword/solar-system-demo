/**
 * Three.js renderer for a compressed solar-system model plus a nearby-star atlas.
 */

class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();

        this.sun = null;
        this.sunLight = null;
        this.starfield = null;
        this.milkyWay = null;
        this.bodyGroups = new THREE.Group();
        this.orbitGroups = new THREE.Group();
        this.atlasGroup = new THREE.Group();
        this.expandedSystemGroup = null;
        this.focusGroup = null;
        this.focusRenderer = null;
        this.focusSpecialRenderer = null;

        this.planets = new Map();
        this.catalogObjects = new Map();
        this.labels = [];
        this.pickables = [];
        this.glowUniforms = [];
        this.animatedAtlasObjects = [];
        this.radialTextureCache = new Map();

        this.displayMode = 'balanced';
        this.elapsedDays = 0;
        this.timeScale = SIMULATION.defaultDaysPerSecond;
        this.lastDeltaDays = 0;
        this.isPaused = false;
        this.showLabels = true;
        this.showOrbits = true;
        this.showAtlas = true;
        this.enhancedEffects = true;
        this.selectedAtlasMap = 'neighborhood';
        this.selectedObject = null;
        this.cameraFlight = null;
        this.focusedCatalogEntry = null;
        this.isPanDragMode = false;
        this.infoPanelHideTimer = null;
        this.blackHoleConfig = {
            resourceMode: 'browser-high',
            allowExternalRenderer: false,
            bloomStrength: 0.78,
            dopplerIntensity: 0.62,
            dopplerTemperature: 0.0,
            diskTemperature: 8751,
            logLuminance: 6.83,
            lensingStrength: 1.0,
            diskTurbulence: 1.0,
            exposureCompensation: 0.94,
            rayBendingStrength: 0.80,
            screenDiskOpacity: 0.42,
            unifiedPassOpacity: 0.62,
            focusRenderScale: 2.35,
            maxFocusPixelRatio: 4,
            renderScale: 0.58
        };

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.labelWorldPosition = new THREE.Vector3();
        this.scaleOrbitDistanceForScene = this.scaleOrbitDistance.bind(this);
        this.effectAxis = new THREE.Vector3(0, 1, 0);
        this.effectWorldDirection = new THREE.Vector3();
        this.effectToCamera = new THREE.Vector3();
        this.effectWorldPosition = new THREE.Vector3();
        this.effectWorldQuaternion = new THREE.Quaternion();

        this.useBloom = false;
        this.composer = null;
        this.bloomPass = null;

        this.init();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.createStarfield();
        this.createMilkyWayBand();
        this.scene.add(this.orbitGroups, this.bodyGroups, this.atlasGroup);
        this.rebuildBodies();
        this.setupControls();
        this.setupBloom();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x02040c);
        this.scene.fog = new THREE.FogExp2(0x02040c, 0.00018);

        this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 8000);
        this.camera.position.fromArray(this.getModeConfig().cameraPosition);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.applyRendererQuality(false);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.16;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    getRendererPixelRatio(isHighFidelityFocus = false) {
        const deviceRatio = window.devicePixelRatio || 1;
        if (isHighFidelityFocus) {
            return Math.min(Math.max(deviceRatio * this.blackHoleConfig.focusRenderScale, 2.5), this.blackHoleConfig.maxFocusPixelRatio);
        }
        return Math.min(deviceRatio, 2);
    }

    applyRendererQuality(isHighFidelityFocus = false) {
        if (!this.renderer) return;
        this.renderer.setPixelRatio(this.getRendererPixelRatio(isHighFidelityFocus));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setupLighting() {
        this.sunLight = new THREE.PointLight(0xfff0d4, 5.4, 0, 1.45);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.set(2048, 2048);
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 2500;
        this.scene.add(this.sunLight);

        this.scene.add(new THREE.AmbientLight(0x0c1020, 0.2));
        this.scene.add(new THREE.HemisphereLight(0x26365f, 0x08020b, 0.18));
    }

    setupBloom() {
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.2, 0.5, 0.2
        );
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderPass);
        this.composer.addPass(this.bloomPass);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.07;
        this.controls.minDistance = 18;
        this.controls.maxDistance = this.getModeConfig().maxDistance;
        this.controls.rotateSpeed = 0.48;
        // OrbitControls follows the platform convention: wheel up zooms in.
        this.controls.zoomSpeed = 1.1;
        this.controls.panSpeed = 0.85;
        this.controls.screenSpacePanning = true;
        this.controls.target.set(0, 0, 0);
        this.applyDragMode();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
    }

    getModeConfig() {
        return SIMULATION.displayModes[this.displayMode];
    }

    scaleOrbitDistance(km) {
        const mode = this.getModeConfig();
        const au = Math.max(km / AU_KM, 0.001);
        return mode.orbitBase + Math.pow(au, mode.orbitExponent) * mode.orbitScale;
    }

    scalePlanetRadius(km) {
        const mode = this.getModeConfig();
        const earthRatio = Math.max(km / PLANET_DATA.earth.radiusKm, 0.01);
        return Math.max(mode.minPlanetRadius, Math.pow(earthRatio, mode.radiusExponent) * mode.radiusScale);
    }

    scaleMoonDistance(km, parentRadius) {
        const mode = this.getModeConfig();
        return Math.max(parentRadius * 2.25, km * mode.moonDistanceScale);
    }

    scaleMoonRadius(km) {
        const mode = this.getModeConfig();
        return Math.max(mode.minMoonRadius, km * mode.moonRadiusScale);
    }

    scaleCatalogDistance(entry) {
        const mode = this.getModeConfig();
        if (entry.category === 'galaxy') {
            const compressed = Math.log10(Math.max(entry.distanceLy, 1000) / 100000 + 1);
            return mode.stellarBase + 520 + compressed * mode.deepSkyScale * 4.8;
        }
        if (entry.category === 'galaxy-group' || entry.category === 'galaxy-cluster' || entry.category === 'supercluster') {
            const compressed = Math.log10(Math.max(entry.distanceLy, 1000000) / 1000000 + 1);
            return mode.stellarBase + 900 + compressed * mode.deepSkyScale * 5.6;
        }
        const distance = entry.category === 'deep-sky' || entry.category === 'galactic-landmark' || entry.category === 'nebula'
            ? Math.min(entry.distanceLy, 9000)
            : entry.distanceLy;
        const scale = entry.category === 'nearby-star' ? mode.stellarScale : mode.deepSkyScale;
        const exponent = entry.category === 'nearby-star' ? mode.stellarExponent : mode.deepSkyExponent;
        return mode.stellarBase + Math.pow(distance, exponent) * scale;
    }

    getCatalogPosition(entry) {
        const l = THREE.MathUtils.degToRad(entry.galactic.lDeg);
        const b = THREE.MathUtils.degToRad(entry.galactic.bDeg);
        const radius = this.scaleCatalogDistance(entry);
        return new THREE.Vector3(
            radius * Math.cos(b) * Math.cos(l),
            radius * Math.sin(b),
            radius * Math.cos(b) * Math.sin(l)
        );
    }

    rebuildBodies() {
        this.clearBodies();
        this.createSun();
        this.createSolarDustBelts();
        PLANET_ORDER.forEach((id) => this.createPlanet(PLANET_DATA[id]));
        this.createAtlas();
        this.updateBodyPositions();
    }

    clearBodies() {
        if (this.sun) {
            this.disposeObject3D(this.sun);
            this.scene.remove(this.sun);
            this.sun = null;
        }

        this.clearGroup(this.bodyGroups);
        this.clearGroup(this.orbitGroups);
        this.clearGroup(this.atlasGroup);
        this.clearExpandedSystem();
        this.clearFocusView();
        this.planets.clear();
        this.catalogObjects.clear();
        this.pickables = [];
        this.glowUniforms = [];
        this.animatedAtlasObjects = [];
        this.labels.forEach((label) => label.element.remove());
        this.labels = [];
    }

    clearGroup(group) {
        while (group.children.length) {
            const child = group.children[0];
            this.disposeObject3D(child);
            group.remove(child);
        }
    }

    disposeObject3D(root) {
        if (!root) return;

        const geometries = new Set();
        const materials = new Set();
        const textures = new Set();
        const sharedTextures = new Set(this.radialTextureCache.values());

        root.traverse((child) => {
            if (child.userData?.managedByFocusRenderer) return;
            if (child.geometry?.dispose) geometries.add(child.geometry);

            const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
            childMaterials.filter(Boolean).forEach((material) => {
                materials.add(material);
                Object.values(material).forEach((value) => {
                    if (value?.isTexture && !sharedTextures.has(value)) textures.add(value);
                });
            });
        });

        textures.forEach((texture) => texture.dispose());
        materials.forEach((material) => material.dispose());
        geometries.forEach((geometry) => geometry.dispose());
    }

    createSun() {
        const mode = this.getModeConfig();
        const geometry = new THREE.SphereGeometry(mode.sunRadius, 96, 64);
        const material = new THREE.MeshBasicMaterial({
            map: this.createSunTexture(),
            color: PLANET_DATA.sun.visual.color
        });

        this.sun = new THREE.Mesh(geometry, material);
        this.sun.name = 'sun';
        this.sun.userData = { bodyId: 'sun', data: PLANET_DATA.sun, objectKind: 'solar-body' };
        this.scene.add(this.sun);
        this.pickables.push(this.sun);

        const glow = this.createGlowMesh(mode.sunRadius * 1.45, 0xffaa2b, 0.58);
        glow.name = 'sun-glow';
        this.sun.add(glow);
        this.createLabel(PLANET_DATA.sun.name, this.sun, 'sun', 'planet');
    }

    createPlanet(data) {
        const radius = this.scalePlanetRadius(data.radiusKm);
        const bodyGroup = new THREE.Group();
        const axialGroup = new THREE.Group();
        const moonSystem = new THREE.Group();
        const geometry = new THREE.SphereGeometry(radius, 80, 56);
        const material = this.createBodyMaterial(data);
        const mesh = new THREE.Mesh(geometry, material);

        bodyGroup.name = `${data.id}-body`;
        axialGroup.rotation.z = THREE.MathUtils.degToRad(data.axialTiltDeg || 0);

        mesh.name = data.id;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { bodyId: data.id, data, radius, isMoon: false, objectKind: 'solar-body' };

        axialGroup.add(mesh);
        bodyGroup.add(axialGroup);
        bodyGroup.add(moonSystem);
        this.bodyGroups.add(bodyGroup);
        this.pickables.push(mesh);

        const orbitColor = data.comet ? 0x88d9ff : data.type?.includes('çŸ®è¡Œæ˜Ÿ') ? 0x5d6f92 : 0x2b3c56;
        const orbit = this.createOrbitLine(data.orbit, this.scaleOrbitDistanceForScene, orbitColor, data.comet ? 0.58 : 0.45);
        orbit.name = `${data.id}-orbit`;
        this.orbitGroups.add(orbit);

        if (data.atmosphere || data.id === 'earth' || data.id === 'venus') {
            mesh.add(this.createAtmosphere(data, radius));
        }

        if (data.rings) {
            axialGroup.add(this.createRings(data, radius));
        }

        if (data.comet) {
            const coma = this.createGlowMesh(radius * 5.5, 0xaedfff, 0.34);
            coma.name = `${data.id}-coma`;
            mesh.add(coma);
        }

        const moonDistanceScale = (km) => this.scaleMoonDistance(km, radius);
        this.createMoons(data, moonSystem, moonDistanceScale);

        this.planets.set(data.id, { data, bodyGroup, axialGroup, moonSystem, mesh, radius, moonDistanceScale });
        this.createLabel(data.name, mesh, data.id, data.type?.includes('çŸ®è¡Œæ˜Ÿ') || data.comet ? 'small-body' : 'planet');
    }

    createMoons(parentData, moonSystem, moonDistanceScale) {
        parentData.moons.forEach((moon) => {
            const radius = this.scaleMoonRadius(moon.radiusKm);
            const geometry = new THREE.SphereGeometry(radius, 36, 24);
            const material = this.createBodyMaterial(moon, true);
            const mesh = new THREE.Mesh(geometry, material);

            mesh.name = moon.id;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = {
                bodyId: moon.id,
                parentId: parentData.id,
                data: moon,
                radius,
                isMoon: true,
                objectKind: 'moon'
            };

            moonSystem.add(mesh);
            this.pickables.push(mesh);

            const orbit = this.createOrbitLine(moon.orbit, moonDistanceScale, 0x405066, 0.26, 128);
            orbit.name = `${moon.id}-orbit`;
            moonSystem.add(orbit);
        });
    }

    createAtlas() {
        this.atlasGroup.visible = this.showAtlas;
        this.createDistanceShells();

        CELESTIAL_CATALOG.forEach((entry) => {
            if (entry.category === 'deep-sky' || entry.category === 'galactic-landmark' || entry.category === 'nebula' || entry.category === 'stellar-object' || entry.category === 'stellar-remnant' || entry.category === 'compact-object' || entry.category === 'supernova-remnant' || entry.category === 'galaxy' || entry.category === 'galaxy-group' || entry.category === 'galaxy-cluster' || entry.category === 'supercluster') {
                this.createDeepSkyObject(entry);
            } else {
                this.createStarMarker(entry);
            }
        });

        this.updateAtlasVisibility();
    }

    createStarMarker(entry) {
        const position = this.getCatalogPosition(entry);
        const radius = entry.size;
        const group = new THREE.Group();
        group.position.copy(position);
        group.name = entry.id;
        group.userData.atlasMap = entry.atlasMap || 'neighborhood';

        const geometry = new THREE.SphereGeometry(radius, 36, 24);
        const material = new THREE.MeshBasicMaterial({
            color: entry.color,
            transparent: true,
            opacity: 0.96
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { bodyId: entry.id, data: entry, objectKind: 'catalog' };
        group.add(mesh);

        const glow = this.createGlowMesh(radius * 3.4, entry.color, 0.28);
        glow.name = `${entry.id}-glow`;
        mesh.add(glow);

        const halo = this.createHaloSprite(entry.color, radius * 15, 0.2);
        halo.name = `${entry.id}-halo`;
        group.add(halo);

        this.atlasGroup.add(group);
        this.pickables.push(mesh);
        this.catalogObjects.set(entry.id, { entry, group, mesh });
        this.animatedAtlasObjects.push({ group, mesh, halo, phase: this.seededRandom(entry.id)() * Math.PI * 2, baseSize: radius });
        this.createLabel(entry.name, mesh, entry.id, 'stellar');
    }

    createDeepSkyObject(entry) {
        const position = this.getCatalogPosition(entry);
        const group = new THREE.Group();
        group.position.copy(position);
        group.name = entry.id;
        group.userData.atlasMap = entry.atlasMap || 'milky-way';

        const coreRadius = Math.max(6, entry.size * 0.3);
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(coreRadius, 28, 18),
            new THREE.MeshBasicMaterial({ color: entry.color, transparent: true, opacity: 0.7 })
        );
        core.userData = { bodyId: entry.id, data: entry, objectKind: 'catalog' };
        group.add(core);

        const cloudCount = entry.category === 'galaxy-group' || entry.category === 'galaxy-cluster' || entry.category === 'supercluster'
            ? 12
            : entry.category === 'galaxy'
                ? 9
                : entry.category === 'nebula'
                    ? 8
                    : entry.category === 'galactic-landmark'
                        ? 5
                        : 7;
        const random = this.seededRandom(entry.id);
        for (let i = 0; i < cloudCount; i += 1) {
            const sprite = this.createNebulaSprite(entry.color, entry.size * (3.8 + random() * 2.8), 0.13 + random() * 0.13);
            sprite.position.set((random() - 0.5) * entry.size * 4, (random() - 0.5) * entry.size * 2.4, (random() - 0.5) * entry.size * 4);
            group.add(sprite);
        }

        if (entry.effectType) {
            this.decorateSpecialObject(group, entry, core, random);
        }

        this.atlasGroup.add(group);
        this.pickables.push(core);
        this.catalogObjects.set(entry.id, { entry, group, mesh: core });
        this.animatedAtlasObjects.push({ group, mesh: core, phase: random() * Math.PI * 2, baseSize: coreRadius, effectType: entry.effectType });
        const labelKind = entry.category === 'stellar-object' || entry.category === 'stellar-remnant' || entry.category === 'compact-object' || entry.category === 'supernova-remnant'
            ? 'special-object'
            : entry.category === 'galaxy' || entry.category === 'galaxy-group' || entry.category === 'galaxy-cluster' || entry.category === 'supercluster'
                ? 'galaxy'
                : 'deep-sky';
        this.createLabel(entry.name, core, entry.id, labelKind);
    }

    decorateSpecialObject(group, entry, core, random) {
        switch (entry.effectType) {
            case 'red-giant':
                core.add(this.createGlowMesh(entry.size * 2.2, entry.color, 0.36));
                group.add(this.createParticleShell(entry, 180, entry.size * 2.4, entry.size * 4.2, 0xff8a50, 0.28));
                break;
            case 'red-dwarf':
                core.add(this.createGlowMesh(entry.size * 1.8, entry.color, 0.24));
                group.add(this.createFlareSparks(entry, random));
                break;
            case 'white-dwarf':
                core.add(this.createGlowMesh(entry.size * 2.0, 0xbfe7ff, 0.42));
                group.add(this.createCompactHaloRing(entry, 0xbfe7ff, 1.8));
                break;
            case 'pulsar':
                core.add(this.createGlowMesh(entry.size * 1.7, 0x8fd8ff, 0.32));
                group.add(this.createPulsarBeams(entry));
                break;
            case 'black-hole':
                core.material.color.setHex(0x020104);
                core.material.opacity = 0.92;
                group.add(this.createAccretionDisk(entry));
                break;
            case 'supernova':
                core.material.opacity = 0.42;
                group.add(this.createParticleShell(entry, 360, entry.size * 1.6, entry.size * 5.2, entry.color, 0.5));
                group.add(this.createCompactHaloRing(entry, entry.color, 3.1));
                break;
            default:
                break;
        }
    }

    createParticleShell(entry, count, innerRadius, outerRadius, color, opacity) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const base = new THREE.Color(color);
        const random = this.seededRandom(`${entry.id}-shell`);

        for (let i = 0; i < count; i += 1) {
            const radius = innerRadius + random() * (outerRadius - innerRadius);
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            vertices.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            const shade = 0.55 + random() * 0.45;
            colors.push(base.r * shade, base.g * shade, base.b * shade);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const points = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                size: 1.6,
                vertexColors: true,
                transparent: true,
                opacity,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        points.name = `${entry.id}-particle-shell`;
        points.userData.effectRole = 'expanding-shell';
        return points;
    }

    createFlareSparks(entry, random) {
        const group = new THREE.Group();
        group.name = `${entry.id}-flare-sparks`;
        group.userData.effectRole = 'flare-sparks';
        for (let i = 0; i < 7; i += 1) {
            const spark = this.createHaloSprite(0xffd08a, entry.size * (2.2 + random() * 2.5), 0.1 + random() * 0.16);
            spark.position.set((random() - 0.5) * entry.size * 5, (random() - 0.5) * entry.size * 5, (random() - 0.5) * entry.size * 5);
            group.add(spark);
        }
        return group;
    }

    createCompactHaloRing(entry, color, multiplier) {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(entry.size * multiplier, entry.size * (multiplier + 0.28), 128),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.32,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        ring.name = `${entry.id}-halo-ring`;
        ring.rotation.x = Math.PI / 2;
        ring.userData.effectRole = 'halo-ring';
        return ring;
    }

    createPulsarBeams(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-pulsar-beams`;
        group.userData.effectRole = 'pulsar-beams';
        const length = entry.size * 9;
        const radius = Math.max(1.2, entry.size * 0.18);

        [-1, 1].forEach((direction) => {
            const material = new THREE.MeshBasicMaterial({
                color: 0x9ee9ff,
                transparent: true,
                opacity: 0.26,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const cone = new THREE.Mesh(new THREE.ConeGeometry(radius * 2.5, length, 32, 1, true), material);
            cone.position.y = direction * length * 0.5;
            cone.rotation.x = direction > 0 ? Math.PI : 0;
            group.add(cone);
        });
        group.rotation.z = THREE.MathUtils.degToRad(28);
        return group;
    }


    createAccretionDisk(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-accretion-disk`;
        group.userData.effectRole = 'accretion-disk';
        const inner = entry.size * 0.9;
        const outer = entry.size * 3.4;
        const hot = new THREE.Mesh(
            new THREE.RingGeometry(inner, outer, 192),
            new THREE.MeshBasicMaterial({
                color: 0xffb15c,
                transparent: true,
                opacity: 0.58,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        hot.rotation.x = Math.PI / 2;
        group.add(hot);

        const cool = new THREE.Mesh(
            new THREE.RingGeometry(outer * 0.92, outer * 1.45, 192),
            new THREE.MeshBasicMaterial({
                color: 0x8fd8ff,
                transparent: true,
                opacity: 0.24,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        cool.rotation.x = Math.PI / 2;
        group.add(cool);
        return group;
    }

    createDistanceShells() {
        [5, 10, 25, 50].forEach((ly) => {
            const mockEntry = { distanceLy: ly, category: 'nearby-star' };
            const radius = this.scaleCatalogDistance(mockEntry);
            const geometry = new THREE.SphereGeometry(radius, 96, 48);
            const material = new THREE.MeshBasicMaterial({
                color: ly <= 10 ? 0x6da5ff : 0x4b6e9c,
                transparent: true,
                opacity: ly <= 10 ? 0.055 : 0.035,
                wireframe: true,
                depthWrite: false
            });
            const shell = new THREE.Mesh(geometry, material);
            shell.name = `${ly}ly-shell`;
            shell.userData.atlasMap = 'neighborhood';
            this.atlasGroup.add(shell);
        });
    }

    createSolarDustBelts() {
        this.orbitGroups.add(this.createParticleBelt(2.1, 3.3, 1050, 0x8c7b68, 0.36, 3.2, 'asteroid-belt'));
        this.orbitGroups.add(this.createParticleBelt(38, 53, 1250, 0x6f91bd, 0.28, 11, 'kuiper-belt'));
    }

    createParticleBelt(innerAu, outerAu, count, color, opacity, ySpread, name) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const base = new THREE.Color(color);
        const random = this.seededRandom(name);

        for (let i = 0; i < count; i += 1) {
            const au = innerAu + random() * (outerAu - innerAu);
            const theta = random() * Math.PI * 2;
            const radius = this.scaleOrbitDistance(au * AU_KM);
            const jitter = 0.94 + random() * 0.12;
            vertices.push(
                Math.cos(theta) * radius * jitter,
                (random() - 0.5) * ySpread,
                Math.sin(theta) * radius * jitter
            );
            const shade = 0.65 + random() * 0.35;
            colors.push(base.r * shade, base.g * shade, base.b * shade);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: name === 'kuiper-belt' ? 1.1 : 1.35,
            vertexColors: true,
            transparent: true,
            opacity,
            sizeAttenuation: true,
            depthWrite: false
        });
        const points = new THREE.Points(geometry, material);
        points.name = name;
        points.visible = this.showOrbits;
        return points;
    }

    createOrbitLine(orbitData, scaleFn, color, opacity, segments = 280) {
        const points = buildOrbitPoints(orbitData, scaleFn, segments);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
            depthWrite: false
        });
        const line = new THREE.Line(geometry, material);
        line.visible = this.showOrbits;
        return line;
    }

    createBodyMaterial(data, isMoon = false) {
        const texture = this.createProceduralTexture(data.visual || { color: 0x888888 }, data.id);
        const roughness = data.visual?.roughness ?? (isMoon ? 0.95 : 0.75);

        return new THREE.MeshStandardMaterial({
            map: texture,
            color: data.visual?.color || 0xffffff,
            roughness,
            metalness: 0.02,
            emissive: new THREE.Color(data.visual?.color || 0x000000),
            emissiveIntensity: isMoon ? 0.012 : 0.024
        });
    }

    createProceduralTexture(visual, seed) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const base = new THREE.Color(visual.color || 0x777777);
        const secondary = new THREE.Color(visual.secondaryColor || visual.color || 0x777777);
        const cloud = new THREE.Color(visual.cloudColor || 0xffffff);

        ctx.fillStyle = `#${base.getHexString()}`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const random = this.seededRandom(seed);

        if (['jupiter', 'saturn'].includes(visual.pattern)) {
            for (let y = 0; y < canvas.height; y += 1) {
                const wave = Math.sin(y * 0.08 + random() * 2) * 10 + Math.sin(y * 0.021) * 20;
                const t = (Math.sin(y * 0.12) + 1) * 0.5;
                const color = base.clone().lerp(secondary, 0.25 + t * 0.55);
                ctx.fillStyle = `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, 0.95)`;
                ctx.fillRect(0, y, canvas.width, 1);
                if (y % 23 < 3) {
                    ctx.fillStyle = 'rgba(255,255,255,0.12)';
                    ctx.fillRect(wave, y, canvas.width, 1);
                }
            }
            if (visual.pattern === 'jupiter') {
                ctx.fillStyle = 'rgba(150, 54, 34, 0.72)';
                ctx.beginPath();
                ctx.ellipse(360, 145, 34, 15, -0.18, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (visual.pattern === 'earth') {
            ctx.fillStyle = `#${secondary.getHexString()}`;
            for (let i = 0; i < 42; i += 1) {
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 18 + random() * 38, 7 + random() * 18, random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = `rgba(${Math.round(cloud.r * 255)},${Math.round(cloud.g * 255)},${Math.round(cloud.b * 255)},0.36)`;
            for (let i = 0; i < 34; i += 1) {
                ctx.fillRect(random() * canvas.width, random() * canvas.height, 25 + random() * 80, 2 + random() * 5);
            }
        } else if (visual.pattern === 'cloud') {
            for (let i = 0; i < 70; i += 1) {
                ctx.fillStyle = `rgba(${Math.round(cloud.r * 255)},${Math.round(cloud.g * 255)},${Math.round(cloud.b * 255)},${0.08 + random() * 0.18})`;
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 30 + random() * 70, 6 + random() * 18, random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (visual.pattern === 'pluto') {
            ctx.fillStyle = `#${secondary.getHexString()}`;
            for (let i = 0; i < 18; i += 1) {
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 28 + random() * 62, 12 + random() * 28, random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            for (let i = 0; i < 900; i += 1) {
                const value = Math.floor(80 + random() * 90);
                ctx.fillStyle = `rgba(${value},${value},${value},${0.05 + random() * 0.13})`;
                ctx.fillRect(random() * canvas.width, random() * canvas.height, 1 + random() * 3, 1 + random() * 2);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = 4;
        return texture;
    }

    createSunTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(256, 128, 20, 256, 128, 260);
        gradient.addColorStop(0, '#fff4b8');
        gradient.addColorStop(0.38, '#ffc653');
        gradient.addColorStop(1, '#d96b16');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const random = this.seededRandom('sun-texture');
        for (let i = 0; i < 180; i += 1) {
            ctx.strokeStyle = `rgba(255, ${150 + random() * 80}, 40, 0.18)`;
            ctx.beginPath();
            const y = random() * canvas.height;
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(130, y + random() * 30 - 15, 330, y + random() * 30 - 15, canvas.width, y);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        return texture;
    }

    createGlowMesh(radius, color, opacity) {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(color) },
                viewVector: { value: this.camera.position.clone() },
                opacity: { value: opacity }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(0.72 - dot(vNormal, vNormel), 2.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float opacity;
                varying float intensity;
                void main() {
                    gl_FragColor = vec4(glowColor * intensity, intensity * opacity);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        this.glowUniforms.push(material.uniforms);
        return new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), material);
    }

    createAtmosphere(data, radius) {
        const color = data.id === 'venus' ? 0xffc978 : data.id === 'earth' ? 0x7db6ff : 0x6f8dff;
        const glow = this.createGlowMesh(radius * 1.08, color, data.id === 'earth' ? 0.38 : 0.22);
        glow.name = `${data.id}-atmosphere`;
        return glow;
    }

    createRings(data, planetRadius) {
        const inner = Math.max(planetRadius * 1.25, this.scaleMoonDistance(data.rings.innerRadiusKm, planetRadius));
        const outer = Math.max(inner + planetRadius * 0.58, this.scaleMoonDistance(data.rings.outerRadiusKm, planetRadius));
        const geometry = new THREE.RingGeometry(inner, outer, 192);
        const material = new THREE.MeshStandardMaterial({
            color: data.rings.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: data.id === 'uranus' ? 0.36 : 0.68,
            roughness: 0.85,
            metalness: 0.0
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.name = `${data.id}-rings`;
        ring.rotation.x = Math.PI / 2;
        ring.receiveShadow = true;
        return ring;
    }

    createStarfield() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];

        for (let i = 0; i < 15000; i += 1) {
            const radius = 2600 + Math.random() * 3300;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            vertices.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );

            const warmth = Math.random();
            if (warmth < 0.68) colors.push(0.92, 0.95, 1.0);
            else if (warmth < 0.86) colors.push(0.72, 0.82, 1.0);
            else colors.push(1.0, 0.87, 0.66);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1.18,
            vertexColors: true,
            transparent: true,
            opacity: 0.82,
            sizeAttenuation: true,
            depthWrite: false
        });

        this.starfield = new THREE.Points(geometry, material);
        this.scene.add(this.starfield);
    }

    createMilkyWayBand() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const random = this.seededRandom('milky-way');

        for (let i = 0; i < 7000; i += 1) {
            const theta = random() * Math.PI * 2;
            const radius = 1800 + random() * 3600;
            const width = (random() - 0.5) * 420;
            vertices.push(
                Math.cos(theta) * radius,
                width,
                Math.sin(theta) * radius
            );
            const shade = 0.35 + random() * 0.45;
            colors.push(0.45 * shade, 0.62 * shade, 1.0 * shade);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        this.milkyWay = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({ size: 2.2, vertexColors: true, transparent: true, opacity: 0.24, depthWrite: false })
        );
        this.milkyWay.rotation.z = THREE.MathUtils.degToRad(62);
        this.scene.add(this.milkyWay);
    }

    createHaloSprite(color, size, opacity) {
        const texture = this.createRadialTexture(color);
        const material = new THREE.SpriteMaterial({
            map: texture,
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(size, size, 1);
        return sprite;
    }

    createNebulaSprite(color, size, opacity) {
        const sprite = this.createHaloSprite(color, size, opacity);
        sprite.material.rotation = Math.random() * Math.PI;
        return sprite;
    }

    createRadialTexture(color) {
        const resolution = color === 0xffffff ? 1024 : 512;
        const cacheKey = `${color}-${resolution}`;
        if (this.radialTextureCache.has(cacheKey)) {
            return this.radialTextureCache.get(cacheKey);
        }
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution;
        const ctx = canvas.getContext('2d');
        const c = new THREE.Color(color);
        const center = resolution / 2;
        const gradient = ctx.createRadialGradient(center, center, resolution * 0.018, center, center, center);
        gradient.addColorStop(0, `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, 1)`);
        gradient.addColorStop(0.18, `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, 0.5)`);
        gradient.addColorStop(0.62, `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, 0.08)`);
        gradient.addColorStop(1, `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, resolution, resolution);
        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = Math.min(8, this.renderer?.capabilities?.getMaxAnisotropy?.() || 1);
        this.radialTextureCache.set(cacheKey, texture);
        return texture;
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = Math.max(window.innerHeight, 1);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.applyRendererQuality(this.focusedCatalogEntry?.effectType === 'black-hole');
        if (this.composer) {
            this.composer.setSize(width, height);
        }
        this.focusRenderer?.setSize(width, height);
    }

    onMouseClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const hits = this.raycaster.intersectObjects(this.pickables, false)
            .filter((hit) => this.isObjectVisible(hit.object));
        if (!hits.length) {
            if (this.focusGroup) return;
            this.hideInfoPanel();
            return;
        }

        this.selectedObject = hits[0].object;
        this.showInfoPanel(this.selectedObject.userData);
    }

    createLabel(text, object, id, kind) {
        const label = document.createElement('div');
        label.className = `planet-label ${kind}`;
        label.textContent = text;
        label.dataset.body = id;
        document.body.appendChild(label);
        this.labels.push({ element: label, object, kind });
    }

    updateLabels() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const position = this.labelWorldPosition;

        this.labels.forEach((label) => {
            if (!this.showLabels || !this.isObjectVisible(label.object)) {
                label.element.style.display = 'none';
                return;
            }

            label.object.getWorldPosition(position);
            const distance = position.distanceTo(this.camera.position);
            position.project(this.camera);

            const x = (position.x * 0.5 + 0.5) * width;
            const y = (position.y * -0.5 + 0.5) * height;
            const visible = position.z > -1 && position.z < 1 && x > 0 && x < width && y > 0 && y < height;

            label.element.style.display = visible ? 'block' : 'none';
            if (visible) {
                label.element.style.left = `${x}px`;
                label.element.style.top = `${y - 18}px`;
                label.element.style.opacity = String(THREE.MathUtils.clamp(1.25 - distance / 2600, 0.35, 1));
            }
        });
    }

    isObjectVisible(object) {
        let current = object;
        while (current) {
            if (!current.visible) return false;
            current = current.parent;
        }
        return true;
    }

    updateBodyPositions() {
        PLANET_ORDER.forEach((id) => {
            const record = this.planets.get(id);
            if (!record) return;

            const position = getOrbitPosition(record.data.orbit, this.elapsedDays, this.scaleOrbitDistanceForScene);
            record.bodyGroup.position.copy(position);
            record.moonSystem.position.set(0, 0, 0);

            if (record.data.rotationPeriodHours) {
                const rotationDirection = record.data.rotationPeriodHours < 0 ? -1 : 1;
                const daysPerRotation = Math.abs(record.data.rotationPeriodHours) / 24;
                record.axialGroup.rotation.y += rotationDirection * (Math.PI * 2 / daysPerRotation) * this.lastDeltaDays;
            }

            record.data.moons.forEach((moon) => {
                const moonMesh = record.moonSystem.getObjectByName(moon.id);
                if (!moonMesh) return;
                moonMesh.position.copy(getOrbitPosition(moon.orbit, this.elapsedDays, record.moonDistanceScale));
            });
        });
    }

    updateAtlasAnimations(deltaSeconds) {
        if (!this.showAtlas) return;
        const time = this.clock.elapsedTime;
        this.animatedAtlasObjects.forEach((item) => {
            if (!item.group.visible) return;
            const pulse = 1 + Math.sin(time * 1.3 + item.phase) * 0.055;
            const effectPulse = item.effectType === 'red-giant' ? 1 + Math.sin(time * 0.9 + item.phase) * 0.1 : pulse;
            item.mesh.scale.setScalar(this.enhancedEffects ? effectPulse : 1);
            item.group.rotation.y += deltaSeconds * 0.035;
            item.group.rotation.x += deltaSeconds * 0.009;
            if (item.halo) {
                item.halo.material.opacity = this.enhancedEffects ? 0.16 + Math.sin(time * 1.8 + item.phase) * 0.05 : 0.08;
            }
            this.updateSpecialObjectEffects(item.group, item.effectType, deltaSeconds, time, item.phase);
        });
    }

    updateSpecialObjectEffects(group, effectType, deltaSeconds, time, phase) {
        if (!effectType || (!this.enhancedEffects && effectType !== 'black-hole')) return;
        group.traverse((child) => {
            const role = child.userData?.effectRole;
            if (!role) return;
            if (role === 'neutron-star-rotor') {
                child.rotation.y += deltaSeconds * 5.2;
                const magneticAxis = child.getObjectByName('neutron-star-magnetic-axis');
                if (!magneticAxis) return;

                magneticAxis.getWorldQuaternion(this.effectWorldQuaternion);
                magneticAxis.getWorldPosition(this.effectWorldPosition);
                this.effectWorldDirection
                    .copy(this.effectAxis)
                    .applyQuaternion(this.effectWorldQuaternion)
                    .normalize();
                this.effectToCamera
                    .copy(this.camera.position)
                    .sub(this.effectWorldPosition)
                    .normalize();

                const alignment = Math.abs(this.effectWorldDirection.dot(this.effectToCamera));
                const lighthousePulse = THREE.MathUtils.clamp(Math.pow(alignment, 9) * 1.8, 0, 1);
                child.traverse((part) => {
                    if (part.userData?.beamLayer && part.material) {
                        part.material.opacity = part.userData.baseOpacity * (0.48 + lighthousePulse * 1.75);
                    } else if (part.userData?.magneticFieldLine && part.material) {
                        part.material.opacity = part.userData.baseOpacity * (0.72 + lighthousePulse * 0.55);
                    } else if (part.userData?.effectRole === 'magnetic-hotspot') {
                        const scale = part.userData.baseScale * (0.86 + lighthousePulse * 0.34);
                        part.scale.set(scale, scale, 1);
                        part.material.opacity = 0.48 + lighthousePulse * 0.5;
                    }
                });
            } else if (role === 'neutron-star-core') {
                if (child.material?.uniforms) {
                    child.material.uniforms.uTime.value = time;
                    const pulse = Math.pow(Math.max(0, Math.sin(time * 5.2 + phase)), 12);
                    child.material.uniforms.uPulse.value = pulse;
                }
            } else if (role === 'neutron-star-wind') {
                child.rotation.y += deltaSeconds * 0.42;
                child.rotation.z += deltaSeconds * 0.025;
                child.material.opacity = child.userData.baseOpacity * (0.88 + Math.sin(time * 1.3 + phase) * 0.12);
            } else if (role === 'neutron-star-shocks') {
                child.rotation.y -= deltaSeconds * 0.12;
                child.children.forEach((ring) => {
                    const wave = 1 + Math.sin(time * 1.05 + ring.userData.phase) * 0.035;
                    ring.scale.setScalar(wave);
                    ring.material.opacity = ring.userData.baseOpacity * (0.78 + Math.sin(time * 1.7 + ring.userData.phase) * 0.2);
                });
            } else if (role === 'pulsar-beams') {
                child.rotation.y += deltaSeconds * 7.5;
                child.children.forEach((beam, index) => {
                    beam.material.opacity = 0.16 + Math.abs(Math.sin(time * 5.5 + phase + index)) * 0.2;
                });
            } else if (role === 'accretion-disk') {
                child.rotation.z += deltaSeconds * 1.35;
                child.children.forEach((ring, index) => {
                    ring.rotation.z += deltaSeconds * (index === 0 ? 1.8 : -0.8);
                    ring.material.opacity = 0.28 + Math.abs(Math.sin(time * 1.6 + phase + index)) * 0.22;
                });
            } else if (role === 'jets') {
                child.rotation.y += deltaSeconds * 0.45;
                child.children.forEach((jet, index) => {
                    jet.material.opacity = 0.12 + Math.abs(Math.sin(time * 2.2 + phase + index)) * 0.12;
                });
            } else if (role === 'expanding-shell') {
                const scale = 1 + Math.sin(time * 0.55 + phase) * 0.035;
                child.scale.setScalar(scale);
                child.rotation.y += deltaSeconds * 0.18;
            } else if (role === 'flare-sparks') {
                child.children.forEach((spark, index) => {
                    spark.material.opacity = 0.05 + Math.max(0, Math.sin(time * 2.8 + phase + index * 1.7)) * 0.28;
                    spark.scale.setScalar(1 + Math.max(0, Math.sin(time * 2.8 + phase + index)) * 0.22);
                });
            } else if (role === 'halo-ring') {
                child.rotation.z += deltaSeconds * 0.72;
                child.material.opacity = 0.18 + Math.abs(Math.sin(time * 1.4 + phase)) * 0.18;
            } else if (role === 'focus-title') {
                child.visible = !document.body.classList.contains('ui-hidden');
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaSeconds = Math.min(this.clock.getDelta(), 0.08);
        this.updateCameraFlight();
        this.controls.update();

        this.lastDeltaDays = this.isPaused ? 0 : deltaSeconds * this.timeScale;
        if (!this.isPaused) {
            this.elapsedDays += this.lastDeltaDays;
            this.updateBodyPositions();
        }

        if (this.sun) {
            this.sun.rotation.y += deltaSeconds * 0.04;
            const sunPulse = this.enhancedEffects ? 1 + Math.sin(this.clock.elapsedTime * 0.7) * 0.012 : 1;
            this.sun.scale.setScalar(sunPulse);
        }

        this.glowUniforms.forEach((uniforms) => {
            uniforms.viewVector.value.copy(this.camera.position);
        });

        if (this.starfield) {
            this.starfield.rotation.y += deltaSeconds * 0.0015;
        }
        if (this.milkyWay) {
            this.milkyWay.rotation.y += deltaSeconds * 0.0008;
            this.milkyWay.visible = this.enhancedEffects;
        }
        if (this.expandedSystemGroup) {
            const plane = this.expandedSystemGroup.getObjectByName('expanded-orbit-plane');
            if (plane) plane.rotation.z += deltaSeconds * 0.045;
        }
        if (this.focusGroup) {
            const focusTitle = this.focusGroup.children.find((child) => child.userData?.effectRole === 'focus-title');
            if (focusTitle) focusTitle.visible = !document.body.classList.contains('ui-hidden');
            if (!['black-hole', 'pulsar'].includes(this.focusedCatalogEntry?.effectType)) {
                this.focusGroup.rotation.y += deltaSeconds * 0.08;
            }
            this.updateSpecialObjectEffects(this.focusGroup, this.focusedCatalogEntry?.effectType, deltaSeconds, this.clock.elapsedTime, 0.4);
        }

        this.updateAtlasAnimations(deltaSeconds);
        this.updateLabels();
        if (this.focusRenderer) {
            this.focusRenderer.update(
                this.camera,
                this.blackHoleConfig,
                this.clock.elapsedTime,
                window.innerWidth / Math.max(window.innerHeight, 1)
            );
        } else {
            if (this.useBloom && this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        }
    }

    showInfoPanel(userData) {
        if (this.infoPanelHideTimer) {
            window.clearTimeout(this.infoPanelHideTimer);
            this.infoPanelHideTimer = null;
        }

        const data = userData.data;
        if (userData.objectKind === 'catalog') {
            this.showCatalogInfo(data);
        } else {
            this.showSolarBodyInfo(userData);
        }
    }

    showSolarBodyInfo(userData) {
        const data = userData.data;
        const panel = document.getElementById('info-panel');
        const parent = userData.parentId ? PLANET_DATA[userData.parentId] : null;

        this.clearExpandedSystem();
        document.getElementById('btn-close-expanded')?.classList.add('hidden');
        document.getElementById('btn-focus-object')?.classList.add('hidden');

        document.getElementById('planet-name').textContent = parent ? `${data.name} / ${parent.name}å«æ˜Ÿ` : data.name;
        document.getElementById('label-diameter').textContent = 'ç›´å¾„';
        document.getElementById('label-mass').textContent = 'è´¨é‡';
        document.getElementById('label-distance').textContent = parent ? 'è½¨é“åŠé•¿è½´' : 'è½¨é“åŠé•¿è½´';
        document.getElementById('label-period').textContent = 'è½¨é“å‘¨æœŸ';
        document.getElementById('label-rotation').textContent = 'è‡ªè½¬å‘¨æœŸ';
        document.getElementById('label-moons').textContent = 'å«æ˜Ÿæ•°é‡';
        document.getElementById('related-title').textContent = 'ä¸»è¦å«æ˜Ÿ';

        document.getElementById('info-diameter').textContent = `${(data.radiusKm * 2).toLocaleString()} km`;
        document.getElementById('info-mass').textContent = data.massKg ? `${data.massKg.toExponential(3)} kg` : 'N/A';
        document.getElementById('info-distance').textContent = data.orbit?.semiMajorAxisKm
            ? `${(data.orbit.semiMajorAxisKm / (parent ? 1 : AU_KM)).toLocaleString(undefined, { maximumFractionDigits: parent ? 0 : 3 })} ${parent ? 'km' : 'AU'}`
            : 'ä¸­å¿ƒå¤©ä½“';
        document.getElementById('info-period').textContent = data.orbit?.orbitalPeriodDays
            ? `${Math.abs(data.orbit.orbitalPeriodDays).toLocaleString()} å¤©${data.orbit.orbitalPeriodDays < 0 ? 'ï¼ˆé€†è¡Œï¼‰' : ''}`
            : 'N/A';
        document.getElementById('info-rotation').textContent = data.rotationPeriodHours
            ? `${Math.abs(data.rotationPeriodHours).toLocaleString()} å°æ—¶${data.rotationPeriodHours < 0 ? 'ï¼ˆé€†å‘ï¼‰' : ''}`
            : 'N/A';
        document.getElementById('info-type').textContent = data.type || 'å«æ˜Ÿ';
        document.getElementById('info-atmosphere').textContent = data.atmosphere || data.composition || 'æ— æ˜¾è‘—å¤§æ°”';
        document.getElementById('info-temperature').textContent = data.surfaceTemperature || 'N/A';
        document.getElementById('info-moons').textContent = data.moons ? data.moons.length : 0;
        document.getElementById('info-feature').textContent = data.feature || 'N/A';

        const moonsList = document.getElementById('moons-list');
        moonsList.innerHTML = '';
        if (data.moons?.length) {
            data.moons.forEach((moon) => {
                const moonEl = document.createElement('button');
                moonEl.className = 'moon-item';
                moonEl.type = 'button';
                moonEl.innerHTML = `
                    <span class="moon-icon" style="background:#${moon.visual.color.toString(16).padStart(6, '0')}"></span>
                    <span>
                        <strong>${moon.name}</strong>
                        <small>${moon.feature}</small>
                    </span>
                `;
                moonEl.addEventListener('click', () => {
                    const record = this.planets.get(data.id);
                    const moonMesh = record?.moonSystem.getObjectByName(moon.id);
                    if (moonMesh) {
                        this.selectedObject = moonMesh;
                        this.showInfoPanel(moonMesh.userData);
                    }
                });
                moonsList.appendChild(moonEl);
            });
        } else {
            moonsList.innerHTML = '<div class="empty-state">æ— ä¸»è¦å«æ˜Ÿ</div>';
        }

        panel.classList.remove('hidden');
        panel.classList.add('visible');
    }

    showCatalogInfo(data) {
        const panel = document.getElementById('info-panel');
        const expandedButton = document.getElementById('btn-close-expanded');
        const focusButton = document.getElementById('btn-focus-object');
        if (data.systemLayout) {
            this.showExpandedSystem(data);
            expandedButton.classList.remove('hidden');
        } else {
            this.clearExpandedSystem();
            expandedButton.classList.add('hidden');
        }
        focusButton.classList.toggle('hidden', !data.effectType);

        document.getElementById('planet-name').textContent = data.name;
        document.getElementById('label-diameter').textContent = 'è‹±æ–‡å';
        document.getElementById('label-mass').textContent = 'å…‰è°±/ç±»åˆ«';
        document.getElementById('label-distance').textContent = 'è·å¤ªé˜³';
        document.getElementById('label-period').textContent = 'æ˜Ÿå›¾å®šä½';
        document.getElementById('label-rotation').textContent = 'æ¸©åº¦/è¯´æ˜Ž';
        document.getElementById('label-moons').textContent = 'å…³è”æ¡ç›®';
        document.getElementById('related-title').textContent = data.systemLayout ? 'ç³»ç»Ÿç»“æž„ / å…³è”æ¡ç›®' : 'å…³è”æ¡ç›®';

        document.getElementById('info-diameter').textContent = data.nameEn || 'N/A';
        document.getElementById('info-mass').textContent = data.spectralClass || data.type || 'N/A';
        document.getElementById('info-distance').textContent = `${data.distanceLy.toLocaleString(undefined, { maximumFractionDigits: 2 })} å…‰å¹´`;
        document.getElementById('info-period').textContent = `é“¶ç» ${data.galactic.lDeg}Â°ï¼Œé“¶çº¬ ${data.galactic.bDeg}Â°`;
        document.getElementById('info-rotation').textContent = data.temperature || 'N/A';
        document.getElementById('info-type').textContent = data.type;
        document.getElementById('info-atmosphere').textContent = data.category === 'nearby-star'
            ? 'æ’æ˜Ÿç³»ç»Ÿ'
                : data.category === 'galaxy'
                    ? 'å¤–æ˜Ÿç³»'
                    : data.category === 'nebula'
                        ? 'é“¶æ²³ç³»æ˜Ÿäº‘'
                        : data.category === 'stellar-object'
                            ? 'æ’æ˜Ÿç±»åž‹è§‚æµ‹ç›®æ ‡'
                            : data.category === 'stellar-remnant'
                                ? 'æ’æ˜Ÿæ®‹éª¸'
                                : data.category === 'compact-object'
                                    ? 'ç´§è‡´å¤©ä½“'
                                    : data.category === 'supernova-remnant'
                                        ? 'è¶…æ–°æ˜Ÿé—è¿¹'
                                        : data.category === 'galaxy-group'
                                            ? 'æ˜Ÿç³»ç¾¤'
                                            : data.category === 'galaxy-cluster'
                                                ? 'æ˜Ÿç³»å›¢'
                                                : data.category === 'supercluster'
                                                    ? 'è¶…æ˜Ÿç³»å›¢æ–¹å‘'
                                                    : 'æ·±ç©ºæ–¹å‘æ ‡';
        document.getElementById('info-temperature').textContent = data.temperature || 'N/A';
        document.getElementById('info-moons').textContent = data.related?.length || 0;
        document.getElementById('info-feature').textContent = data.feature || 'N/A';

        const moonsList = document.getElementById('moons-list');
        moonsList.innerHTML = '';
        if (data.systemLayout) {
            moonsList.appendChild(this.createSystemMiniature(data.systemLayout));
        }
        if (data.related?.length) {
            data.related.forEach((item) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'related-item';
                if (typeof item === 'string') {
                    itemEl.textContent = item;
                } else {
                    itemEl.innerHTML = `<strong>${item.title}</strong><small>${item.detail}</small>`;
                }
                moonsList.appendChild(itemEl);
            });
        } else {
            moonsList.innerHTML = '<div class="empty-state">æš‚æ— å…³è”æ¡ç›®</div>';
        }

        panel.classList.remove('hidden');
        panel.classList.add('visible');
    }

    createSystemMiniature(layout) {
        const wrapper = document.createElement('div');
        wrapper.className = 'system-mini';

        const map = document.createElement('div');
        map.className = 'system-map';

        layout.bodies.forEach((body) => {
            if (Number.isFinite(body.orbit)) {
                const orbit = document.createElement('span');
                orbit.className = `mini-orbit ${body.kind === 'candidate' ? 'candidate' : ''}`;
                orbit.style.width = `${body.orbit * 2}px`;
                orbit.style.height = `${body.orbit * 2}px`;
                map.appendChild(orbit);
            }
        });

        layout.bodies.forEach((body) => {
            const node = document.createElement('span');
            node.className = `mini-body ${body.kind}`;
            node.title = `${body.name}ï¼š${body.detail || ''}`;
            node.style.background = `#${body.color.toString(16).padStart(6, '0')}`;
            node.style.color = `#${body.color.toString(16).padStart(6, '0')}`;
            node.style.width = `${body.size || 7}px`;
            node.style.height = `${body.size || 7}px`;

            if (Number.isFinite(body.orbit)) {
                const angle = THREE.MathUtils.degToRad(body.angleDeg || 0);
                const x = 50 + Math.cos(angle) * body.orbit / 1.12;
                const y = 50 + Math.sin(angle) * body.orbit / 1.12;
                node.style.left = `${x}%`;
                node.style.top = `${y}%`;
            } else {
                node.style.left = `${body.x ?? 50}%`;
                node.style.top = `${body.y ?? 50}%`;
            }

            map.appendChild(node);
        });

        const legend = document.createElement('div');
        legend.className = 'system-legend';
        layout.bodies.forEach((body) => {
            const item = document.createElement('div');
            item.className = 'system-legend-item';
            item.innerHTML = `
                <span class="legend-dot" style="background:#${body.color.toString(16).padStart(6, '0')}"></span>
                <span><strong>${body.name}</strong><small>${body.detail || ''}</small></span>
            `;
            legend.appendChild(item);
        });

        const note = document.createElement('p');
        note.className = 'system-note';
        note.textContent = layout.note || 'å¾®ç¼©å›¾ä¸ºå¯è¯»æ€§åŽ‹ç¼©ç¤ºæ„ï¼Œä¸ä»£è¡¨çœŸå®žæ¯”ä¾‹ã€‚';

        wrapper.append(map, legend, note);
        return wrapper;
    }

    showExpandedSystem(data) {
        this.clearExpandedSystem();
        if (!data.systemLayout || !this.selectedObject) return;

        const anchor = new THREE.Vector3();
        this.selectedObject.getWorldPosition(anchor);

        const radial = anchor.clone().normalize();
        if (radial.lengthSq() < 0.01) radial.set(1, 0, 0);
        const tangent = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), radial).normalize();
        if (tangent.lengthSq() < 0.01) tangent.set(1, 0, 0);

        const group = new THREE.Group();
        group.name = `${data.id}-expanded-system`;
        group.position.copy(anchor).add(tangent.multiplyScalar(95)).add(new THREE.Vector3(0, 46, 0));
        group.userData.anchor = anchor.clone();

        const plane = new THREE.Group();
        plane.name = 'expanded-orbit-plane';
        plane.rotation.x = THREE.MathUtils.degToRad(-62);
        group.add(plane);

        const scale = data.systemLayout.sceneScale || (data.id === 'trappist-1' ? 1.7 : 1.45);
        const centerMap = new Map();

        data.systemLayout.bodies.forEach((body) => {
            if (!Number.isFinite(body.orbit)) {
                centerMap.set(body.name, new THREE.Vector3(
                    ((body.x ?? 50) - 50) * scale,
                    0,
                    ((body.y ?? 50) - 50) * scale
                ));
            }
        });

        data.systemLayout.bodies.forEach((body) => {
            const center = body.orbitCenter ? centerMap.get(body.orbitCenter) || new THREE.Vector3() : new THREE.Vector3();
            if (Number.isFinite(body.orbit) && body.kind !== 'debris-disk') {
                plane.add(this.createExpandedOrbit(body, center, scale));
            }
        });

        data.systemLayout.bodies.forEach((body) => {
            const mesh = this.createExpandedBody(body, centerMap, scale);
            plane.add(mesh);
            const label = this.createTextSprite(body.name, body.kind === 'candidate' ? '#ffd184' : '#f6f3e8');
            label.position.copy(mesh.position).add(new THREE.Vector3(0, (body.size || 7) * 0.65 + 6, 0));
            label.scale.set(34, 12, 1);
            plane.add(label);
        });

        const connector = this.createConnectorLine(anchor, group.position, data.color || 0x9ec9ff);
        group.add(connector);

        this.expandedSystemGroup = group;
        this.scene.add(group);
        this.flyCameraTo(group.position, data.systemLayout.cameraDistance || (data.id === 'trappist-1' ? 210 : 185));
    }

    createExpandedOrbit(body, center, scale) {
        const radius = body.orbit * scale;
        const points = [];
        const segments = 128;
        for (let i = 0; i <= segments; i += 1) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                center.x + Math.cos(angle) * radius,
                0,
                center.z + Math.sin(angle) * radius
            ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: body.kind === 'candidate' ? 0xffd184 : 0x8fb2ff,
            transparent: true,
            opacity: body.kind === 'candidate' ? 0.38 : 0.3,
            depthWrite: false
        });
        const line = new THREE.Line(geometry, material);
        line.name = `${body.name}-expanded-orbit`;
        return line;
    }

    createExpandedBody(body, centerMap, scale) {
        if (body.kind === 'debris-disk') {
            const center = body.orbitCenter ? centerMap.get(body.orbitCenter) || new THREE.Vector3() : new THREE.Vector3();
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(Math.max(2, body.orbit * scale - 2), body.orbit * scale + 2, 128),
                new THREE.MeshBasicMaterial({
                    color: body.color,
                    transparent: true,
                    opacity: 0.22,
                    side: THREE.DoubleSide,
                    depthWrite: false
                })
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.copy(center);
            return ring;
        }

        let position;
        if (Number.isFinite(body.orbit)) {
            const center = body.orbitCenter ? centerMap.get(body.orbitCenter) || new THREE.Vector3() : new THREE.Vector3();
            const angle = THREE.MathUtils.degToRad(body.angleDeg || 0);
            position = new THREE.Vector3(
                center.x + Math.cos(angle) * body.orbit * scale,
                0,
                center.z + Math.sin(angle) * body.orbit * scale
            );
        } else {
            position = new THREE.Vector3(
                ((body.x ?? 50) - 50) * scale,
                0,
                ((body.y ?? 50) - 50) * scale
            );
        }

        const radius = Math.max(1.8, (body.size || 7) * 0.36);
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 20),
            new THREE.MeshBasicMaterial({
                color: body.color,
                transparent: body.kind === 'candidate',
                opacity: body.kind === 'candidate' ? 0.78 : 1
            })
        );
        mesh.name = `${body.name}-expanded-body`;
        mesh.position.copy(position);

        if (['star', 'white-dwarf'].includes(body.kind)) {
            mesh.add(this.createGlowMesh(radius * 3.4, body.color, body.kind === 'white-dwarf' ? 0.36 : 0.28));
        }
        if (body.kind === 'candidate') {
            mesh.add(this.createGlowMesh(radius * 2.2, 0xffd184, 0.18));
        }
        return mesh;
    }

    createConnectorLine(from, to, color) {
        const localFrom = from.clone().sub(to);
        const geometry = new THREE.BufferGeometry().setFromPoints([localFrom, new THREE.Vector3()]);
        const material = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.28,
            depthWrite: false
        });
        const line = new THREE.Line(geometry, material);
        line.name = 'expanded-system-connector';
        return line;
    }

    createTextSprite(text, color = '#f6f3e8') {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.font = '600 24px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
        ctx.fillRect(0, 10, 256, 44);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.strokeRect(0.5, 10.5, 255, 43);
        ctx.fillStyle = color;
        ctx.fillText(text, 128, 32);

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
        return new THREE.Sprite(material);
    }

    flyCameraTo(target, distance) {
        const offset = new THREE.Vector3(0, distance * 0.46, distance).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.32);
        this.cameraFlight = {
            startPosition: this.camera.position.clone(),
            startTarget: this.controls.target.clone(),
            endPosition: target.clone().add(offset),
            endTarget: target.clone(),
            startTime: this.clock.elapsedTime,
            duration: 1.35
        };
    }

    flyCameraToPos(endPos, endTarget) {
        this.cameraFlight = {
            startPosition: this.camera.position.clone(),
            startTarget: this.controls.target.clone(),
            endPosition: endPos.clone(),
            endTarget: endTarget.clone(),
            startTime: this.clock.elapsedTime,
            duration: 1.35
        };
    }

    updateCameraFlight() {
        if (!this.cameraFlight) return;
        const elapsed = this.clock.elapsedTime - this.cameraFlight.startTime;
        const rawT = THREE.MathUtils.clamp(elapsed / this.cameraFlight.duration, 0, 1);
        const t = rawT * rawT * (3 - 2 * rawT);
        this.camera.position.lerpVectors(this.cameraFlight.startPosition, this.cameraFlight.endPosition, t);
        this.controls.target.lerpVectors(this.cameraFlight.startTarget, this.cameraFlight.endTarget, t);
        if (rawT >= 1) {
            this.cameraFlight = null;
        }
    }

    clearExpandedSystem() {
        if (!this.expandedSystemGroup) return;
        this.disposeObject3D(this.expandedSystemGroup);
        this.scene.remove(this.expandedSystemGroup);
        this.expandedSystemGroup = null;
    }

    hideInfoPanel() {
        const panel = document.getElementById('info-panel');
        panel.classList.remove('visible');
        if (this.infoPanelHideTimer) window.clearTimeout(this.infoPanelHideTimer);
        this.infoPanelHideTimer = window.setTimeout(() => {
            if (!panel.classList.contains('visible')) panel.classList.add('hidden');
            this.infoPanelHideTimer = null;
        }, 220);
        this.selectedObject = null;
        document.getElementById('btn-close-expanded')?.classList.add('hidden');
        document.getElementById('btn-focus-object')?.classList.add('hidden');
        this.clearExpandedSystem();
        this.clearFocusView();
    }

    closeExpandedSystemView() {
        const hadFocus = Boolean(this.focusGroup);
        this.clearExpandedSystem();
        this.clearFocusView();
        document.getElementById('btn-close-expanded')?.classList.add('hidden');
        if (hadFocus) {
            this.atlasGroup.visible = this.showAtlas;
            this.flyCameraTo(new THREE.Vector3(0, 0, 0), this.displayMode === 'atlas' ? 760 : 420);
        } else {
            this.flyCameraTo(new THREE.Vector3(0, 0, 0), this.displayMode === 'atlas' ? 680 : 360);
        }
    }

    focusSelectedSpecialObject() {
        if (!this.selectedObject?.userData?.data?.effectType) return;
        this.showFocusView(this.selectedObject.userData.data);
    }

    showFocusView(entry) {
        this.clearExpandedSystem();
        this.clearFocusView();
        this.focusedCatalogEntry = entry;

        const group = new THREE.Group();
        group.name = `${entry.id}-focus-view`;
        group.position.set(0, 0, 0);
        group.userData.focusView = true;

        const model = this.createFocusedSpecialModel(entry);
        group.add(model);

        const title = this.createTextSprite(`${entry.name} Â· ${entry.type}`, '#fff1c8');
        title.userData.effectRole = 'focus-title';
        title.position.set(0, 95, 0);
        title.scale.set(120, 30, 1);
        group.add(title);

        this.scene.add(group);
        this.focusGroup = group;
        this.applyRendererQuality(false);
        this.atlasGroup.visible = false;
        this.orbitGroups.visible = false;
        this.bodyGroups.visible = false;
        if (this.sun) this.sun.visible = false;
        if (this.sunLight) this.sunLight.visible = false;
        if (this.starfield) this.starfield.material.opacity = 0.38;
        if (this.milkyWay) this.milkyWay.visible = false;

        document.getElementById('btn-close-expanded')?.classList.remove('hidden');
        document.getElementById('btn-close-expanded').textContent = 'è¿”å›žæ˜Ÿå›¾';
        this.controls.minDistance = 5;
        if (entry.effectType === 'black-hole') {
            this.controls.maxDistance = 58;
            // Tilted camera so the disk is visible as an ellipse (not edge-on)
            this.flyCameraToPos(
                new THREE.Vector3(30, 25, 30),
                new THREE.Vector3(0, 0, 0)
            );
        } else if (entry.effectType === 'pulsar') {
            this.controls.maxDistance = 280;
            this.useBloom = true;
            this.bloomPass.strength = 0.72;
            this.bloomPass.radius = 0.42;
            this.bloomPass.threshold = 0.34;
            this.flyCameraToPos(
                new THREE.Vector3(92, 54, 112),
                new THREE.Vector3(0, 0, 0)
            );
        } else {
            this.flyCameraTo(new THREE.Vector3(0, 0, 0), 230);
        }
    }

    createFocusedSpecialModel(entry) {
        if (entry.effectType === 'pulsar') {
            this.focusSpecialRenderer = new PulsarRenderer(this);
            return this.focusSpecialRenderer.create(entry);
        }

        const group = new THREE.Group();
        group.name = `${entry.id}-focused-model`;
        group.userData.effectType = entry.effectType;

        const coreSize = this.getFocusedCoreSize(entry.effectType);
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
                core.add(this.createGlowMesh(coreSize * 2.1, entry.color, 0.48));
                group.add(this.createParticleShell(entry, 420, coreSize * 1.8, coreSize * 4.1, 0xff8a50, 0.42));
                group.add(this.createFocusGranulation(entry.color, coreSize * 2.4));
                break;
            case 'red-dwarf':
                core.add(this.createGlowMesh(coreSize * 2.0, entry.color, 0.38));
                group.add(this.createFlareSparks({ ...entry, size: coreSize }, this.seededRandom(`${entry.id}-focus-flare`)));
                group.add(this.createCompactHaloRing({ ...entry, size: coreSize }, 0xffb36f, 2.2));
                break;
            case 'white-dwarf':
                core.add(this.createGlowMesh(coreSize * 3.2, 0xbfe7ff, 0.58));
                group.add(this.createCompactHaloRing({ ...entry, size: coreSize }, 0xbfe7ff, 2.6));
                break;
            case 'black-hole':
                return this.createFocusedBlackHoleModel(entry);
            case 'supernova':
                group.add(this.createParticleShell(entry, 720, coreSize * 1.2, coreSize * 5.6, entry.color, 0.62));
                group.add(this.createCompactHaloRing({ ...entry, size: coreSize }, entry.color, 4.5));
                group.add(this.createCompactHaloRing({ ...entry, size: coreSize }, 0x8fd8ff, 6.2));
                break;
            default:
                core.add(this.createGlowMesh(coreSize * 2, entry.color, 0.35));
                break;
        }

        return group;
    }

    createFocusedBlackHoleModel(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-bh-fullscreen`;
        group.userData.effectType = entry.effectType;

        // BlackHoleRenderer requires the THREE.WebGLRenderer instance.
        // solarSystem stores it as this.renderer.
        this.focusRenderer = new BlackHoleRenderer(this.renderer, this.blackHoleConfig);

        // Set per-object doppler based on entry id
        if (entry.id === 'sagittarius-a-star') {
            this.focusRenderer.setDopplerScale(0.78);
        }

        const mesh = this.focusRenderer.getMesh();
        group.add(mesh);
        return group;
    }


    getFocusedCoreSize(effectType) {
        switch (effectType) {
            case 'red-giant':
                return 36;
            case 'red-dwarf':
                return 18;
            case 'white-dwarf':
                return 13;
            case 'pulsar':
                return 10;
            case 'black-hole':
                return 16;
            case 'supernova':
                return 14;
            default:
                return 18;
        }
    }

    createFocusGranulation(color, radius) {
        const group = new THREE.Group();
        group.name = 'focus-granulation';
        group.userData.effectRole = 'granulation';
        const random = this.seededRandom(`granulation-${color}`);
        for (let i = 0; i < 22; i += 1) {
            const sprite = this.createHaloSprite(color, 16 + random() * 24, 0.08 + random() * 0.1);
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            sprite.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            group.add(sprite);
        }
        return group;
    }

    clearFocusView() {
        if (!this.focusGroup && !this.focusRenderer && !this.focusSpecialRenderer) return;
        this.focusRenderer?.dispose();
        this.focusRenderer = null;
        this.focusSpecialRenderer?.dispose?.();
        this.focusSpecialRenderer = null;
        if (this.focusGroup) {
            this.disposeObject3D(this.focusGroup);
            this.scene.remove(this.focusGroup);
        }
        this.focusGroup = null;
        this.focusedCatalogEntry = null;
        this.applyRendererQuality(false);
        this.useBloom = false;
        this.atlasGroup.visible = this.showAtlas;
        this.orbitGroups.visible = true;
        this.bodyGroups.visible = true;
        if (this.sun) this.sun.visible = true;
        if (this.sunLight) this.sunLight.visible = true;
        if (this.starfield) this.starfield.material.opacity = 0.82;
        if (this.milkyWay) this.milkyWay.visible = this.enhancedEffects;
        const closeExpanded = document.getElementById('btn-close-expanded');
        if (closeExpanded) closeExpanded.textContent = '返回星图';
        this.controls.minDistance = 18;
        this.controls.maxDistance = this.getModeConfig().maxDistance;
    }

    seededRandom(seed) {
        let hash = 2166136261;
        for (let i = 0; i < seed.length; i += 1) {
            hash ^= seed.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return () => {
            hash += hash << 13;
            hash ^= hash >>> 7;
            hash += hash << 3;
            hash ^= hash >>> 17;
            hash += hash << 5;
            return ((hash >>> 0) % 10000) / 10000;
        };
    }

    setTimeScale(scale) {
        this.timeScale = Number(scale) || 0;
    }

    setDisplayMode(mode) {
        if (!SIMULATION.displayModes[mode] || mode === this.displayMode) return;
        this.displayMode = mode;
        this.rebuildBodies();
        this.controls.maxDistance = this.getModeConfig().maxDistance;
        this.resetCamera();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    resetCamera() {
        this.cameraFlight = null;
        this.camera.position.fromArray(this.getModeConfig().cameraPosition);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    toggleLabels() {
        this.showLabels = !this.showLabels;
        return this.showLabels;
    }

    toggleOrbits() {
        this.showOrbits = !this.showOrbits;
        this.orbitGroups.children.forEach((orbit) => { orbit.visible = this.showOrbits; });
        this.planets.forEach((record) => {
            record.moonSystem.children.forEach((child) => {
                if (child.type === 'Line') child.visible = this.showOrbits;
            });
        });
        return this.showOrbits;
    }

    toggleAtlas() {
        this.showAtlas = !this.showAtlas;
        this.atlasGroup.visible = this.showAtlas;
        if (!this.showAtlas) {
            this.clearExpandedSystem();
            this.hideInfoPanel();
        }
        return this.showAtlas;
    }

    setAtlasMap(mapId) {
        if (!SIMULATION.atlasMaps[mapId] || mapId === this.selectedAtlasMap) return;
        this.selectedAtlasMap = mapId;
        this.clearExpandedSystem();
        this.updateAtlasVisibility();
        this.hideInfoPanel();
    }

    updateAtlasVisibility() {
        this.atlasGroup.children.forEach((child) => {
            child.visible = (child.userData.atlasMap || 'neighborhood') === this.selectedAtlasMap;
        });
    }

    toggleEffects() {
        this.enhancedEffects = !this.enhancedEffects;
        this.renderer.toneMappingExposure = this.enhancedEffects ? 1.16 : 0.98;
        return this.enhancedEffects;
    }

    togglePanDragMode() {
        this.isPanDragMode = !this.isPanDragMode;
        this.applyDragMode();
        return this.isPanDragMode;
    }

    applyDragMode() {
        if (!this.controls || !THREE.MOUSE) return;
        this.controls.mouseButtons = this.isPanDragMode
            ? {
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.ROTATE
            }
            : {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };
    }
}

let solarSystem;
document.addEventListener('DOMContentLoaded', () => {
    solarSystem = new SolarSystem();
});
