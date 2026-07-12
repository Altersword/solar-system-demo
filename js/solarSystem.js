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
        this.solarBodies = new SolarBodies(this);
        this.bodyGroups = this.solarBodies.bodyGroups;
        this.orbitGroups = this.solarBodies.orbitGroups;
        this.starAtlas = new StarAtlas(this);
        this.atlasGroup = this.starAtlas.atlasGroup;
        this.expandedSystemGroup = this.starAtlas.expandedSystemGroup;
        this.focusGroup = null;
        this.focusRenderer = null;
        this.focusSpecialRenderer = null;
        this.focusController = null;

        this.planets = this.solarBodies.planets;
        this.catalogObjects = this.starAtlas.catalogObjects;
        this.labels = [];
        this.pickables = [];
        this.glowUniforms = [];
        this.animatedAtlasObjects = this.starAtlas.animatedAtlasObjects;
        this.radialTextureCache = new Map();

        this.displayMode = 'balanced';
        this.elapsedDays = 0;
        this.timeScale = SIMULATION.defaultDaysPerSecond;
        this.lastDeltaDays = 0;
        this.isPaused = false;
        this.showLabels = true;
        this.showOrbits = true;
        this.showAtlas = this.starAtlas.showAtlas;
        this.enhancedEffects = true;
        this.selectedAtlasMap = this.starAtlas.selectedAtlasMap;
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
        this.scaleOrbitDistanceForScene = this.solarBodies.scaleOrbitDistanceForScene;
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
        this.solarBodies.attach(this.scene);
        this.starAtlas.attach(this.scene);
        this.rebuildBodies();
        this.setupControls();
        this.setupBloom();
        this.focusController = new FocusController(this);
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.ctx = new AppContext();
        this.ctx.setup(
            document.getElementById('canvas-container'),
            this.getModeConfig().cameraPosition
        );
        this.scene = this.ctx.scene;
        this.camera = this.ctx.camera;
        this.renderer = this.ctx.renderer;
        this.clock = this.ctx.clock;
        this.applyRendererQuality(false);
    }

    getRendererPixelRatio(isHighFidelityFocus = false) {
        return this.ctx
            ? this.ctx.getPixelRatio(isHighFidelityFocus, this.blackHoleConfig)
            : Math.min(window.devicePixelRatio || 1, 2);
    }

    applyRendererQuality(isHighFidelityFocus = false) {
        this.ctx?.applyQuality(isHighFidelityFocus, this.blackHoleConfig);
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
        this.bloom = new BloomComposer(this.renderer, this.scene, this.camera);
        this.composer = this.bloom.composer;
        this.bloomPass = this.bloom.bloomPass;
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
        return this.solarBodies.scaleOrbitDistance(km);
    }

    scalePlanetRadius(km) {
        return this.solarBodies.scalePlanetRadius(km);
    }

    scaleMoonDistance(km, parentRadius) {
        const mode = this.getModeConfig();
        return Math.max(parentRadius * 2.25, km * mode.moonDistanceScale);
    }

    scaleMoonRadius(km) {
        return this.solarBodies.scaleMoonRadius(km);
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
        this.solarBodies.rebuild();
        this.starAtlas.rebuild();
        this.updateBodyPositions();
    }

    clearBodies() {
        this.solarBodies.clear();
        this.starAtlas.clear();
        this.clearFocusView();
        this.pickables = [];
        this.glowUniforms = [];
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
        this.ctx?.resize();
        this.applyRendererQuality(this.focusedCatalogEntry?.effectType === 'black-hole');
        this.bloom?.resize(width, height);
        this.focusController?.onResize(width, height);
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
        this.solarBodies.updatePositions(this.elapsedDays, this.lastDeltaDays, this.isPaused);
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
        this.focusController?.update(deltaSeconds, this.clock.elapsedTime);

        this.starAtlas.updateAnimations(deltaSeconds);
        this.updateLabels();
        const ownsScreen = this.focusController?.renderIfOwning(
            this.camera,
            this.blackHoleConfig,
            this.clock.elapsedTime,
            window.innerWidth / Math.max(window.innerHeight, 1)
        );
        if (!ownsScreen) {
            if (this.bloom) {
                this.bloom.setEnabled(this.useBloom);
                this.bloom.render();
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

        this.starAtlas.clearExpandedSystem();
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
            this.starAtlas.showExpandedSystem(data);
            expandedButton.classList.remove('hidden');
        } else {
            this.starAtlas.clearExpandedSystem();
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
        this.starAtlas.clearExpandedSystem();
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
        this.starAtlas.clearExpandedSystem();
        this.clearFocusView();
    }

    closeExpandedSystemView() {
        const hadFocus = Boolean(this.focusGroup);
        this.starAtlas.clearExpandedSystem();
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
        this.focusController?.focusSelected();
    }

    showFocusView(entry) {
        this.focusController?.show(entry);
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
        this.focusController?.clear();
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
        return this.starAtlas.toggle();
    }

    setAtlasMap(mapId) {
        this.starAtlas.setMap(mapId);
    }

    updateAtlasVisibility() {
        this.starAtlas.updateVisibility();
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
