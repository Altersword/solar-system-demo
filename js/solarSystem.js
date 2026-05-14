/**
 * 太阳系渲染器。
 * 真实数据 -> 轨道物理 -> 可视化缩放，三层保持分离。
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
        this.bodyGroups = new THREE.Group();
        this.orbitGroups = new THREE.Group();
        this.moonOrbitGroups = new THREE.Group();

        this.planets = new Map();
        this.labels = [];
        this.pickables = [];

        this.displayMode = 'balanced';
        this.elapsedDays = 0;
        this.timeScale = SIMULATION.defaultDaysPerSecond;
        this.lastDeltaDays = 0;
        this.isPaused = false;
        this.showLabels = true;
        this.showOrbits = true;
        this.selectedObject = null;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.createStarfield();
        this.scene.add(this.orbitGroups, this.moonOrbitGroups, this.bodyGroups);
        this.rebuildBodies();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x02040c);

        this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 6000);
        this.camera.position.set(-120, 115, 270);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.08;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    setupLighting() {
        this.sunLight = new THREE.PointLight(0xfff0d4, 4.8, 0, 1.45);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.set(2048, 2048);
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 2500;
        this.scene.add(this.sunLight);

        const ambientLight = new THREE.AmbientLight(0x0c1020, 0.18);
        this.scene.add(ambientLight);
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

    rebuildBodies() {
        this.clearBodies();
        this.createSun();
        PLANET_ORDER.forEach((id) => this.createPlanet(PLANET_DATA[id]));
        this.updateBodyPositions();
    }

    clearBodies() {
        if (this.sun) {
            this.scene.remove(this.sun);
            this.sun = null;
        }

        this.clearGroup(this.bodyGroups);
        this.clearGroup(this.orbitGroups);
        this.clearGroup(this.moonOrbitGroups);
        this.planets.clear();
        this.pickables = [];
        this.labels.forEach((label) => label.element.remove());
        this.labels = [];
    }

    clearGroup(group) {
        while (group.children.length) {
            group.remove(group.children[0]);
        }
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
        this.sun.userData = { bodyId: 'sun', data: PLANET_DATA.sun };
        this.scene.add(this.sun);

        const glow = this.createGlowMesh(mode.sunRadius * 1.42, 0xffaa2b, 0.55);
        glow.name = 'sun-glow';
        this.sun.add(glow);
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
        mesh.userData = { bodyId: data.id, data, radius, isMoon: false };

        axialGroup.add(mesh);
        bodyGroup.add(axialGroup);
        this.bodyGroups.add(bodyGroup);
        this.pickables.push(mesh);

        const orbit = this.createOrbitLine(data.orbit, this.scaleOrbitDistance.bind(this), 0x2b3c56, 0.48);
        orbit.name = `${data.id}-orbit`;
        this.orbitGroups.add(orbit);

        if (data.atmosphere || data.id === 'earth' || data.id === 'venus') {
            mesh.add(this.createAtmosphere(data, radius));
        }

        if (data.rings) {
            axialGroup.add(this.createRings(data, radius));
        }

        bodyGroup.add(moonSystem);
        this.createMoons(data, moonSystem, radius);

        this.planets.set(data.id, { data, bodyGroup, axialGroup, moonSystem, mesh, radius });
        this.createLabel(data.name, mesh, data.id, 'planet');
    }

    createMoons(parentData, moonSystem, parentRadius) {
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
                isMoon: true
            };

            moonSystem.add(mesh);
            this.pickables.push(mesh);

            const scaledDistance = (km) => this.scaleMoonDistance(km, parentRadius);
            const orbit = this.createOrbitLine(moon.orbit, scaledDistance, 0x405066, 0.26, 128);
            orbit.name = `${moon.id}-orbit`;
            moonSystem.add(orbit);
        });
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
            emissiveIntensity: isMoon ? 0.015 : 0.025
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
                const x = random() * canvas.width;
                const y = random() * canvas.height;
                ctx.beginPath();
                ctx.ellipse(x, y, 18 + random() * 38, 7 + random() * 18, random() * Math.PI, 0, Math.PI * 2);
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

        for (let i = 0; i < 160; i += 1) {
            ctx.strokeStyle = `rgba(255, ${150 + Math.random() * 80}, 40, 0.18)`;
            ctx.beginPath();
            const y = Math.random() * canvas.height;
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(130, y + Math.random() * 30 - 15, 330, y + Math.random() * 30 - 15, canvas.width, y);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        return texture;
    }

    createGlowMesh(radius, color, opacity) {
        const geometry = new THREE.SphereGeometry(radius, 48, 32);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(color) },
                viewVector: { value: this.camera.position },
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
        return new THREE.Mesh(geometry, material);
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

        for (let i = 0; i < 11000; i += 1) {
            const radius = 2600 + Math.random() * 2600;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            vertices.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );

            const warmth = Math.random();
            if (warmth < 0.72) colors.push(0.92, 0.95, 1.0);
            else if (warmth < 0.88) colors.push(0.72, 0.82, 1.0);
            else colors.push(1.0, 0.9, 0.7);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1.25,
            vertexColors: true,
            transparent: true,
            opacity: 0.78,
            sizeAttenuation: true
        });

        this.starfield = new THREE.Points(geometry, material);
        this.scene.add(this.starfield);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.07;
        this.controls.minDistance = 22;
        this.controls.maxDistance = 1800;
        this.controls.rotateSpeed = 0.48;
        this.controls.zoomSpeed = 1.1;
        this.controls.target.set(0, 0, 0);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const hits = this.raycaster.intersectObjects(this.pickables, false);
        if (!hits.length) {
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
        this.labels.push({ element: label, object });
    }

    updateLabels() {
        this.labels.forEach((label) => {
            if (!this.showLabels) {
                label.element.style.display = 'none';
                return;
            }

            const position = new THREE.Vector3();
            label.object.getWorldPosition(position);
            position.project(this.camera);

            const x = (position.x * 0.5 + 0.5) * window.innerWidth;
            const y = (position.y * -0.5 + 0.5) * window.innerHeight;
            const visible = position.z < 1 && x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight;

            label.element.style.display = visible ? 'block' : 'none';
            if (visible) {
                label.element.style.left = `${x}px`;
                label.element.style.top = `${y - 18}px`;
            }
        });
    }

    updateBodyPositions() {
        PLANET_ORDER.forEach((id) => {
            const record = this.planets.get(id);
            if (!record) return;

            const position = getOrbitPosition(record.data.orbit, this.elapsedDays, this.scaleOrbitDistance.bind(this));
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
                const scaledDistance = (km) => this.scaleMoonDistance(km, record.radius);
                const moonPosition = getOrbitPosition(moon.orbit, this.elapsedDays, scaledDistance);
                moonMesh.position.copy(moonPosition);
            });
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaSeconds = Math.min(this.clock.getDelta(), 0.08);
        this.lastDeltaDays = this.isPaused ? 0 : deltaSeconds * this.timeScale;
        if (!this.isPaused) {
            this.elapsedDays += this.lastDeltaDays;
            this.updateBodyPositions();
        }

        if (this.sun) {
            this.sun.rotation.y += deltaSeconds * 0.04;
            const glow = this.sun.getObjectByName('sun-glow');
            if (glow?.material?.uniforms) {
                glow.material.uniforms.viewVector.value.copy(this.camera.position);
            }
        }

        if (this.starfield) {
            this.starfield.rotation.y += deltaSeconds * 0.0015;
        }

        this.updateLabels();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    showInfoPanel(userData) {
        const data = userData.data;
        const panel = document.getElementById('info-panel');
        const parent = userData.parentId ? PLANET_DATA[userData.parentId] : null;

        document.getElementById('planet-name').textContent = parent ? `${data.name} / ${parent.name}卫星` : data.name;
        document.getElementById('info-diameter').textContent = `${(data.radiusKm * 2).toLocaleString()} km`;
        document.getElementById('info-mass').textContent = data.massKg ? `${data.massKg.toExponential(3)} kg` : 'N/A';
        document.getElementById('info-distance').textContent = data.orbit?.semiMajorAxisKm
            ? `${(data.orbit.semiMajorAxisKm / (parent ? 1 : AU_KM)).toLocaleString(undefined, { maximumFractionDigits: parent ? 0 : 3 })} ${parent ? 'km' : 'AU'}`
            : '中心天体';
        document.getElementById('info-period').textContent = data.orbit?.orbitalPeriodDays
            ? `${Math.abs(data.orbit.orbitalPeriodDays).toLocaleString()} 天${data.orbit.orbitalPeriodDays < 0 ? '（逆行）' : ''}`
            : 'N/A';
        document.getElementById('info-rotation').textContent = data.rotationPeriodHours
            ? `${Math.abs(data.rotationPeriodHours).toLocaleString()} 小时${data.rotationPeriodHours < 0 ? '（逆向）' : ''}`
            : 'N/A';
        document.getElementById('info-type').textContent = data.type || '卫星';
        document.getElementById('info-atmosphere').textContent = data.atmosphere || data.composition || '无显著大气';
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
            moonsList.innerHTML = '<div class="empty-state">无主要卫星</div>';
        }

        panel.classList.remove('hidden');
        panel.classList.add('visible');
    }

    hideInfoPanel() {
        const panel = document.getElementById('info-panel');
        panel.classList.remove('visible');
        window.setTimeout(() => panel.classList.add('hidden'), 220);
        this.selectedObject = null;
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
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    resetCamera() {
        this.camera.position.set(-120, 115, 270);
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
}

let solarSystem;
document.addEventListener('DOMContentLoaded', () => {
    solarSystem = new SolarSystem();
});
