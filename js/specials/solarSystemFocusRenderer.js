/**
 * Near-view renderer for solar-system planets, moons, and comets.
 * Phase 1: type coverage. Phase 2: stronger profiles for key bodies.
 * Far-view meshes stay in SolarBodies.
 */
/* global THREE */
class SolarSystemFocusRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.core = null;
        this.atmosphere = null;
        this.rings = null;
        this.coma = null;
        this.tail = null;
        this.ionTail = null;
        this.clouds = null;
        this.extras = [];
        this.effectType = null;
        this.profile = null;
        this.entryId = null;
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-solar-focus-model`;
        group.userData.effectType = entry.effectType;
        this.effectType = entry.effectType;
        this.entryId = entry.id;
        this.profile = this.resolveProfile(entry);
        this.extras = [];

        const coreSize = this.profile.coreSize;
        const material = new THREE.MeshBasicMaterial({
            map: this.createFocusTexture(entry),
            color: entry.visual?.color || 0xffffff
        });
        const core = new THREE.Mesh(new THREE.SphereGeometry(coreSize, 128, 96), material);
        core.name = `${entry.id}-focus-core`;
        if (entry.id === 'uranus') {
            core.rotation.z = THREE.MathUtils.degToRad(90);
        }
        group.add(core);

        if (this.profile.atmosphere) {
            const atmosphere = this.host.createGlowMesh(
                coreSize * this.profile.atmosphere.scale,
                this.profile.atmosphere.color,
                this.profile.atmosphere.opacity
            );
            atmosphere.name = `${entry.id}-focus-atmosphere`;
            atmosphere.userData.baseOpacity = this.profile.atmosphere.opacity;
            core.add(atmosphere);
            this.atmosphere = atmosphere;
        }

        if (this.profile.clouds) {
            const clouds = this.host.createGlowMesh(
                coreSize * this.profile.clouds.scale,
                this.profile.clouds.color,
                this.profile.clouds.opacity
            );
            clouds.name = `${entry.id}-focus-clouds`;
            clouds.userData.baseOpacity = this.profile.clouds.opacity;
            core.add(clouds);
            this.clouds = clouds;
        }

        if (entry.rings || this.profile.forceRings) {
            const rings = this.createFocusRings(entry, coreSize);
            if (entry.id === 'uranus') rings.rotation.z = THREE.MathUtils.degToRad(90);
            if (entry.id === 'saturn') rings.rotation.x = THREE.MathUtils.degToRad(16);
            group.add(rings);
            this.rings = rings;
        }

        if (entry.effectType === 'comet' || entry.comet) {
            const coma = this.host.createGlowMesh(coreSize * 5.4, 0xaedfff, 0.36);
            coma.name = `${entry.id}-focus-coma`;
            coma.userData.baseOpacity = 0.36;
            core.add(coma);
            this.coma = coma;

            const tail = this.createCometTail(coreSize, 0xbfe8ff, 1100, 1.0);
            group.add(tail);
            this.tail = tail;

            const ionTail = this.createCometTail(coreSize, 0x7ec8ff, 700, 1.35);
            ionTail.position.y = coreSize * 0.25;
            group.add(ionTail);
            this.ionTail = ionTail;
        }

        if (this.profile.surfaceSprites) {
            group.add(this.createSurfaceSprites(entry, coreSize, this.profile.surfaceSprites));
        }

        this.addBodyExtras(group, entry, coreSize);

        if (this.profile.showMoonHint && entry.moons?.length) {
            group.add(this.createMoonHint(entry, coreSize));
        }

        this.group = group;
        this.core = core;
        return group;
    }

    resolveProfile(entry) {
        const type = entry.effectType;
        const id = entry.id;
        const base = {
            coreSize: 26,
            atmosphere: null,
            clouds: null,
            forceRings: false,
            surfaceSprites: 0,
            showMoonHint: false,
            spin: 0.08,
            cameraDistance: 110,
            bloomStrength: 0.22,
            bloomThreshold: 0.55
        };

        if (type === 'planet-terrestrial') {
            Object.assign(base, {
                coreSize: id === 'mercury' ? 20 : id === 'mars' ? 25 : id === 'earth' ? 30 : 28,
                atmosphere: entry.atmosphere || id === 'earth' || id === 'venus' || id === 'mars'
                    ? {
                        scale: id === 'venus' ? 1.18 : id === 'earth' ? 1.14 : id === 'mars' ? 1.08 : 1.1,
                        color: id === 'venus' ? 0xffc978 : id === 'earth' ? 0x6fb0ff : id === 'mars' ? 0xffb08a : 0x6f8dff,
                        opacity: id === 'venus' ? 0.36 : id === 'earth' ? 0.44 : id === 'mars' ? 0.16 : 0.18
                    }
                    : null,
                clouds: id === 'earth' || id === 'venus'
                    ? {
                        scale: id === 'venus' ? 1.09 : 1.06,
                        color: entry.visual?.cloudColor || 0xffffff,
                        opacity: id === 'venus' ? 0.24 : 0.16
                    }
                    : null,
                surfaceSprites: id === 'mercury' ? 24 : id === 'mars' ? 20 : id === 'earth' ? 8 : 12,
                spin: id === 'venus' ? -0.03 : 0.09,
                cameraDistance: id === 'earth' ? 105 : 100,
                bloomStrength: id === 'earth' ? 0.2 : 0.16
            });
        } else if (type === 'planet-gas') {
            Object.assign(base, {
                coreSize: id === 'jupiter' ? 38 : 36,
                atmosphere: { scale: 1.1, color: entry.visual?.color || 0xd6b07e, opacity: 0.18 },
                clouds: { scale: 1.04, color: 0xffe2b0, opacity: 0.12 },
                forceRings: id === 'saturn',
                showMoonHint: true,
                spin: id === 'jupiter' ? 0.22 : 0.18,
                cameraDistance: id === 'saturn' ? 175 : 150,
                bloomStrength: 0.22
            });
        } else if (type === 'planet-ice') {
            Object.assign(base, {
                coreSize: 31,
                atmosphere: { scale: 1.12, color: entry.visual?.color || 0x6f8dff, opacity: 0.22 },
                forceRings: id === 'uranus',
                spin: id === 'uranus' ? -0.07 : 0.09,
                cameraDistance: 128,
                bloomStrength: 0.2
            });
        } else if (type === 'dwarf-planet') {
            Object.assign(base, {
                coreSize: 22,
                surfaceSprites: 18,
                atmosphere: id === 'pluto' ? { scale: 1.09, color: 0xc9d7ff, opacity: 0.12 } : null,
                spin: 0.06,
                cameraDistance: 95,
                bloomStrength: 0.15
            });
        } else if (type === 'moon') {
            Object.assign(base, {
                coreSize: id === 'moon' ? 22 : 20,
                surfaceSprites: id === 'moon' ? 34 : entry.visual?.pattern === 'ice' ? 10 : 20,
                atmosphere: id === 'titan' ? { scale: 1.14, color: 0xc69f61, opacity: 0.28 } : null,
                spin: 0.045,
                cameraDistance: id === 'moon' ? 82 : 78,
                bloomStrength: 0.1
            });
        } else if (type === 'comet') {
            Object.assign(base, {
                coreSize: 15,
                surfaceSprites: 16,
                spin: 0.13,
                cameraDistance: 100,
                bloomStrength: 0.32,
                bloomThreshold: 0.4
            });
        }

        return base;
    }

    createFocusTexture(entry) {
        // Reuse host procedural texture, then enrich key bodies.
        if (typeof this.host.createProceduralTexture === 'function') {
            const texture = this.host.createProceduralTexture(entry.visual || { color: 0x888888 }, `${entry.id}-focus-v2`);
            return texture;
        }
        return null;
    }

    addBodyExtras(group, entry, coreSize) {
        const id = entry.id;
        if (id === 'earth') {
            group.add(this.createEarthCityLights(coreSize));
            group.add(this.createBandLayer(coreSize * 1.02, 0xffffff, 0.08, 0.04, 'earth-cloud-bands'));
        } else if (id === 'mars') {
            group.add(this.createPolarCaps(coreSize));
            group.add(this.createDustHaze(coreSize));
        } else if (id === 'jupiter') {
            group.add(this.createGreatRedSpot(coreSize));
            group.add(this.createBandLayer(coreSize * 1.015, 0xf0d2a0, 0.1, 0.06, 'jupiter-bands'));
        } else if (id === 'saturn') {
            group.add(this.createBandLayer(coreSize * 1.012, 0xffe6b5, 0.08, 0.035, 'saturn-bands'));
        } else if (id === 'moon') {
            group.add(this.createCraterField(coreSize, 42));
        } else if (id === 'halley') {
            group.add(this.createCometJets(coreSize));
        }
    }

    createBandLayer(radius, color, opacity, speed, name) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 96, 64),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        mesh.name = name;
        mesh.userData.baseOpacity = opacity;
        mesh.userData.speed = speed;
        this.extras.push(mesh);
        return mesh;
    }

    createGreatRedSpot(coreSize) {
        const spot = this.host.createHaloSprite(0xc14a2c, coreSize * 0.55, 0.55);
        spot.name = 'jupiter-great-red-spot';
        spot.position.set(coreSize * 0.82, -coreSize * 0.18, coreSize * 0.42);
        spot.userData.baseOpacity = 0.55;
        spot.userData.baseScale = coreSize * 0.55;
        this.extras.push(spot);
        return spot;
    }

    createPolarCaps(coreSize) {
        const group = new THREE.Group();
        group.name = 'mars-polar-caps';
        [-1, 1].forEach((dir) => {
            const cap = this.host.createHaloSprite(0xf3f7ff, coreSize * 0.42, 0.42);
            cap.position.set(0, dir * coreSize * 0.92, 0);
            cap.userData.baseOpacity = 0.42;
            group.add(cap);
            this.extras.push(cap);
        });
        return group;
    }

    createDustHaze(coreSize) {
        const haze = this.host.createGlowMesh(coreSize * 1.2, 0xffa06a, 0.1);
        haze.name = 'mars-dust-haze';
        haze.userData.baseOpacity = 0.1;
        this.extras.push(haze);
        return haze;
    }

    createEarthCityLights(coreSize) {
        const group = new THREE.Group();
        group.name = 'earth-city-lights';
        const random = this.host.seededRandom('earth-lights');
        for (let i = 0; i < 48; i += 1) {
            const light = this.host.createHaloSprite(0xffe2a8, coreSize * (0.03 + random() * 0.04), 0.2 + random() * 0.2);
            const theta = random() * Math.PI * 2;
            const phi = (0.35 + random() * 1.2);
            const radius = coreSize * 1.01;
            light.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi) * (0.2 + random() * 0.7),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            light.userData.baseOpacity = 0.15 + random() * 0.2;
            group.add(light);
            this.extras.push(light);
        }
        return group;
    }

    createCraterField(coreSize, count) {
        const group = new THREE.Group();
        group.name = 'moon-craters';
        const random = this.host.seededRandom('moon-craters');
        for (let i = 0; i < count; i += 1) {
            const crater = this.host.createHaloSprite(0x4d4a45, coreSize * (0.05 + random() * 0.12), 0.22 + random() * 0.2);
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            const radius = coreSize * 1.012;
            crater.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            group.add(crater);
        }
        return group;
    }

    createCometJets(coreSize) {
        const group = new THREE.Group();
        group.name = 'halley-jets';
        const random = this.host.seededRandom('halley-jets');
        for (let i = 0; i < 5; i += 1) {
            const points = [];
            const angle = random() * Math.PI * 2;
            for (let step = 0; step < 7; step += 1) {
                const t = step / 6;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * coreSize * (1.05 + t * 1.8),
                    (random() - 0.5) * coreSize * 0.5 + t * coreSize * 0.4,
                    Math.sin(angle) * coreSize * (1.05 + t * 1.8)
                ));
            }
            const curve = new THREE.CatmullRomCurve3(points);
            const jet = new THREE.Mesh(
                new THREE.TubeGeometry(curve, 20, coreSize * 0.03, 5, false),
                new THREE.MeshBasicMaterial({
                    color: 0xd7f3ff,
                    transparent: true,
                    opacity: 0.28,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                })
            );
            jet.userData.baseOpacity = 0.22 + random() * 0.14;
            group.add(jet);
            this.extras.push(jet);
        }
        return group;
    }

    createFocusRings(entry, coreSize) {
        const group = new THREE.Group();
        group.name = `${entry.id}-focus-rings`;
        const color = entry.rings?.color || 0xd7c08c;
        const layers = entry.id === 'saturn'
            ? [
                { inner: 1.28, outer: 1.52, opacity: 0.62 },
                { inner: 1.58, outer: 1.92, opacity: 0.5 },
                { inner: 2.0, outer: 2.28, opacity: 0.34 },
                { inner: 2.38, outer: 2.72, opacity: 0.22 }
            ]
            : [
                { inner: 1.45, outer: 1.85, opacity: 0.3 }
            ];

        layers.forEach((layer, index) => {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(coreSize * layer.inner, coreSize * layer.outer, 192),
                new THREE.MeshBasicMaterial({
                    color,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: layer.opacity,
                    depthWrite: false
                })
            );
            ring.rotation.x = Math.PI / 2;
            ring.userData.baseOpacity = layer.opacity;
            ring.userData.speed = index % 2 === 0 ? 0.025 : -0.018;
            group.add(ring);
        });
        return group;
    }

    createCometTail(coreSize, color, count, lengthScale) {
        const group = new THREE.Group();
        group.name = 'comet-tail';
        const random = this.host.seededRandom(`halley-tail-${color}-${count}`);
        const positions = [];
        for (let i = 0; i < count; i += 1) {
            const t = Math.pow(random(), 0.65);
            positions.push(
                -t * coreSize * (8 * lengthScale + random() * 6) + (random() - 0.5) * coreSize * 0.8,
                (random() - 0.5) * coreSize * (0.6 + t * 1.8),
                (random() - 0.5) * coreSize * (0.6 + t * 1.8)
            );
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color,
            size: 1.3,
            map: this.host.createRadialTexture(0xffffff),
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        const tail = new THREE.Points(geometry, material);
        tail.userData.baseOpacity = 0.4;
        group.add(tail);
        return group;
    }

    createSurfaceSprites(entry, coreSize, count) {
        const group = new THREE.Group();
        group.name = `${entry.id}-surface-sprites`;
        const random = this.host.seededRandom(`${entry.id}-focus-surface`);
        const color = entry.visual?.pattern === 'ice' ? 0xddeeff : entry.id === 'mars' ? 0x8a3b1d : 0x66594c;
        for (let i = 0; i < count; i += 1) {
            const sprite = this.host.createHaloSprite(color, coreSize * (0.08 + random() * 0.12), 0.18 + random() * 0.16);
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            const radius = coreSize * 1.01;
            sprite.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            group.add(sprite);
        }
        return group;
    }

    createMoonHint(entry, coreSize) {
        const group = new THREE.Group();
        group.name = `${entry.id}-moon-hint`;
        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(coreSize * 0.08, 24, 16),
            new THREE.MeshBasicMaterial({ color: 0xc9c4b8 })
        );
        moon.position.set(coreSize * 2.05, coreSize * 0.15, 0);
        group.add(moon);
        group.userData.speed = 0.25;
        return group;
    }

    update(deltaSeconds, time) {
        if (!this.group || !this.profile) return;

        if (this.core) {
            this.core.rotation.y += deltaSeconds * (this.profile.spin || 0.08);
        }

        if (this.atmosphere?.material?.uniforms) {
            this.atmosphere.material.uniforms.opacity.value =
                this.atmosphere.userData.baseOpacity * (0.88 + Math.sin(time * 0.4) * 0.12);
        }
        if (this.clouds?.material?.uniforms) {
            this.clouds.rotation.y += deltaSeconds * 0.03;
            this.clouds.material.uniforms.opacity.value =
                this.clouds.userData.baseOpacity * (0.85 + Math.sin(time * 0.55) * 0.15);
        }
        if (this.rings) {
            this.rings.children.forEach((ring) => {
                ring.rotation.z += deltaSeconds * (ring.userData.speed || 0.02);
                if (ring.material) {
                    ring.material.opacity = (ring.userData.baseOpacity || 0.4)
                        * (0.9 + Math.sin(time * 0.35) * 0.08);
                }
            });
        }
        if (this.coma?.material?.uniforms) {
            this.coma.material.uniforms.opacity.value =
                this.coma.userData.baseOpacity * (0.8 + Math.sin(time * 0.9) * 0.2);
            this.coma.scale.setScalar(1 + Math.sin(time * 0.7) * 0.05);
        }
        [this.tail, this.ionTail].forEach((tail, index) => {
            if (!tail) return;
            tail.rotation.z = Math.sin(time * (0.2 + index * 0.08)) * (0.05 + index * 0.02);
            tail.children.forEach((points) => {
                if (points.material) {
                    points.material.opacity = (points.userData.baseOpacity || 0.4)
                        * (0.72 + Math.sin(time * (0.8 + index * 0.15)) * 0.28);
                }
            });
        });

        this.extras.forEach((item, index) => {
            if (item.userData?.speed) {
                item.rotation.y += deltaSeconds * item.userData.speed;
            }
            if (item.material && item.userData?.baseOpacity != null) {
                item.material.opacity = item.userData.baseOpacity
                    * (0.8 + Math.sin(time * 0.7 + index) * 0.2);
            }
            if (item.name === 'jupiter-great-red-spot' && item.userData?.baseScale) {
                const pulse = 0.92 + Math.sin(time * 0.9) * 0.08;
                item.scale.set(item.userData.baseScale * pulse, item.userData.baseScale * pulse * 0.72, 1);
            }
        });

        this.group.children.forEach((child) => {
            if (child.userData?.speed && child.name.includes('moon-hint')) {
                child.rotation.y += deltaSeconds * child.userData.speed;
            }
        });
    }

    dispose() {
        if (this.core?.material?.map) this.core.material.map.dispose();
        this.group = null;
        this.core = null;
        this.atmosphere = null;
        this.rings = null;
        this.coma = null;
        this.tail = null;
        this.ionTail = null;
        this.clouds = null;
        this.extras = [];
        this.effectType = null;
        this.profile = null;
        this.entryId = null;
    }
}
