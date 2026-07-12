/* global THREE, PLANET_DATA, PLANET_ORDER, SIMULATION, AU_KM, getOrbitPosition, buildOrbitPoints */

/**
 * Owns solar-system geometry: sun, planets, moons, orbits, dust belts.
 */
class SolarBodies {
    constructor(host) {
        this.host = host;
        this.bodyGroups = new THREE.Group();
        this.orbitGroups = new THREE.Group();
        this.planets = new Map();
        this.sun = null;
        this.scaleOrbitDistanceForScene = this.scaleOrbitDistance.bind(this);
    }

    attach(scene) {
        scene.add(this.orbitGroups, this.bodyGroups);
    }

    rebuild() {
        this.clear();
        this.createSun();
        this.createSolarDustBelts();
        PLANET_ORDER.forEach((id) => this.createPlanet(PLANET_DATA[id]));
        this.syncHost();
        this.updatePositions(this.host.elapsedDays, this.host.lastDeltaDays, this.host.isPaused);
    }

    clear() {
        if (this.sun) {
            this.host.disposeObject3D(this.sun);
            if (this.sun.parent) this.sun.parent.remove(this.sun);
            this.sun = null;
        }

        this.host.clearGroup(this.bodyGroups);
        this.host.clearGroup(this.orbitGroups);
        this.planets.clear();
        this.syncHost();
    }

    syncHost() {
        this.host.sun = this.sun;
        this.host.planets = this.planets;
        this.host.bodyGroups = this.bodyGroups;
        this.host.orbitGroups = this.orbitGroups;
    }

    setVisible(v) {
        this.bodyGroups.visible = v;
        this.orbitGroups.visible = v;
        if (this.sun) this.sun.visible = v;
    }

    scaleOrbitDistance(km) {
        const mode = this.host.getModeConfig();
        const au = Math.max(km / AU_KM, 0.001);
        return mode.orbitBase + Math.pow(au, mode.orbitExponent) * mode.orbitScale;
    }

    scalePlanetRadius(km) {
        const mode = this.host.getModeConfig();
        const earthRatio = Math.max(km / PLANET_DATA.earth.radiusKm, 0.01);
        return Math.max(mode.minPlanetRadius, Math.pow(earthRatio, mode.radiusExponent) * mode.radiusScale);
    }

    scaleMoonDistance(km, parentRadius) {
        return this.host.scaleMoonDistance(km, parentRadius);
    }

    scaleMoonRadius(km) {
        const mode = this.host.getModeConfig();
        return Math.max(mode.minMoonRadius, km * mode.moonRadiusScale);
    }

    createSun() {
        const mode = this.host.getModeConfig();
        const geometry = new THREE.SphereGeometry(mode.sunRadius, 96, 64);
        const material = new THREE.MeshBasicMaterial({
            map: this.host.createSunTexture(),
            color: PLANET_DATA.sun.visual.color
        });

        this.sun = new THREE.Mesh(geometry, material);
        this.sun.name = 'sun';
        this.sun.userData = { bodyId: 'sun', data: PLANET_DATA.sun, objectKind: 'solar-body' };
        this.host.scene.add(this.sun);
        this.host.pickables.push(this.sun);

        const glow = this.host.createGlowMesh(mode.sunRadius * 1.45, 0xffaa2b, 0.58);
        glow.name = 'sun-glow';
        this.sun.add(glow);
        this.host.createLabel(PLANET_DATA.sun.name, this.sun, 'sun', 'planet');
    }

    createPlanet(data) {
        const radius = this.scalePlanetRadius(data.radiusKm);
        const bodyGroup = new THREE.Group();
        const axialGroup = new THREE.Group();
        const moonSystem = new THREE.Group();
        const geometry = new THREE.SphereGeometry(radius, 80, 56);
        const material = this.host.createBodyMaterial(data);
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
        this.host.pickables.push(mesh);

        const orbitColor = data.comet ? 0x88d9ff : data.type?.includes('小行星') ? 0x5d6f92 : 0x2b3c56;
        const orbit = this.createOrbitLine(data.orbit, this.scaleOrbitDistanceForScene, orbitColor, data.comet ? 0.58 : 0.45);
        orbit.name = `${data.id}-orbit`;
        this.orbitGroups.add(orbit);

        if (data.atmosphere || data.id === 'earth' || data.id === 'venus') {
            mesh.add(this.host.createAtmosphere(data, radius));
        }

        if (data.rings) {
            axialGroup.add(this.host.createRings(data, radius));
        }

        if (data.comet) {
            const coma = this.host.createGlowMesh(radius * 5.5, 0xaedfff, 0.34);
            coma.name = `${data.id}-coma`;
            mesh.add(coma);
        }

        const moonDistanceScale = (km) => this.scaleMoonDistance(km, radius);
        this.createMoons(data, moonSystem, moonDistanceScale);

        this.planets.set(data.id, { data, bodyGroup, axialGroup, moonSystem, mesh, radius, moonDistanceScale });
        this.host.createLabel(data.name, mesh, data.id, data.type?.includes('小行星') || data.comet ? 'small-body' : 'planet');
    }

    createMoons(parentData, moonSystem, moonDistanceScale) {
        parentData.moons.forEach((moon) => {
            const radius = this.scaleMoonRadius(moon.radiusKm);
            const geometry = new THREE.SphereGeometry(radius, 36, 24);
            const material = this.host.createBodyMaterial(moon, true);
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
            this.host.pickables.push(mesh);

            const orbit = this.createOrbitLine(moon.orbit, moonDistanceScale, 0x405066, 0.26, 128);
            orbit.name = `${moon.id}-orbit`;
            moonSystem.add(orbit);
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
        const random = this.host.seededRandom(name);

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
        points.visible = this.host.showOrbits;
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
        line.visible = this.host.showOrbits;
        return line;
    }

    updatePositions(elapsedDays, lastDeltaDays, isPaused) {
        PLANET_ORDER.forEach((id) => {
            const record = this.planets.get(id);
            if (!record) return;

            const position = getOrbitPosition(record.data.orbit, elapsedDays, this.scaleOrbitDistanceForScene);
            record.bodyGroup.position.copy(position);
            record.moonSystem.position.set(0, 0, 0);

            if (record.data.rotationPeriodHours && !isPaused) {
                const rotationDirection = record.data.rotationPeriodHours < 0 ? -1 : 1;
                const daysPerRotation = Math.abs(record.data.rotationPeriodHours) / 24;
                record.axialGroup.rotation.y += rotationDirection * (Math.PI * 2 / daysPerRotation) * lastDeltaDays;
            }

            record.data.moons.forEach((moon) => {
                const moonMesh = record.moonSystem.getObjectByName(moon.id);
                if (!moonMesh) return;
                moonMesh.position.copy(getOrbitPosition(moon.orbit, elapsedDays, record.moonDistanceScale));
            });
        });
    }
}
