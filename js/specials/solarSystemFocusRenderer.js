/**
 * Phase-1 near-view renderer for solar-system planets, moons, and comets.
 * Far-view meshes stay in SolarBodies; this only builds focus models.
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
        this.clouds = null;
        this.effectType = null;
        this.profile = null;
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-solar-focus-model`;
        group.userData.effectType = entry.effectType;
        this.effectType = entry.effectType;
        this.profile = this.resolveProfile(entry);

        const coreSize = this.profile.coreSize;
        const material = new THREE.MeshBasicMaterial({
            map: this.host.createProceduralTexture(entry.visual || { color: 0x888888 }, `${entry.id}-focus`),
            color: entry.visual?.color || 0xffffff
        });
        const core = new THREE.Mesh(new THREE.SphereGeometry(coreSize, 128, 96), material);
        core.name = `${entry.id}-focus-core`;
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
            group.add(rings);
            this.rings = rings;
        }

        if (entry.effectType === 'comet' || entry.comet) {
            const coma = this.host.createGlowMesh(coreSize * 4.8, 0xaedfff, 0.32);
            coma.name = `${entry.id}-focus-coma`;
            coma.userData.baseOpacity = 0.32;
            core.add(coma);
            this.coma = coma;

            const tail = this.createCometTail(coreSize);
            group.add(tail);
            this.tail = tail;
        }

        if (this.profile.surfaceSprites) {
            group.add(this.createSurfaceSprites(entry, coreSize, this.profile.surfaceSprites));
        }

        // Keep a tiny reference orbiter for moons of gas giants feel only in planet views.
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
                coreSize: id === 'mercury' ? 20 : id === 'mars' ? 24 : 28,
                atmosphere: entry.atmosphere || id === 'earth' || id === 'venus'
                    ? {
                        scale: id === 'venus' ? 1.16 : 1.12,
                        color: id === 'venus' ? 0xffc978 : id === 'earth' ? 0x7db6ff : 0x6f8dff,
                        opacity: id === 'venus' ? 0.34 : id === 'earth' ? 0.4 : 0.18
                    }
                    : null,
                clouds: id === 'earth' || id === 'venus'
                    ? {
                        scale: id === 'venus' ? 1.08 : 1.05,
                        color: entry.visual?.cloudColor || 0xffffff,
                        opacity: id === 'venus' ? 0.22 : 0.14
                    }
                    : null,
                surfaceSprites: id === 'mercury' || id === 'mars' ? 18 : 10,
                spin: id === 'venus' ? -0.03 : 0.09,
                cameraDistance: 100,
                bloomStrength: 0.18
            });
        } else if (type === 'planet-gas') {
            Object.assign(base, {
                coreSize: id === 'jupiter' ? 36 : 34,
                atmosphere: { scale: 1.08, color: entry.visual?.color || 0xd6b07e, opacity: 0.16 },
                clouds: { scale: 1.03, color: 0xffe2b0, opacity: 0.1 },
                forceRings: id === 'saturn',
                showMoonHint: true,
                spin: 0.16,
                cameraDistance: id === 'saturn' ? 160 : 140,
                bloomStrength: 0.2
            });
        } else if (type === 'planet-ice') {
            Object.assign(base, {
                coreSize: 30,
                atmosphere: { scale: 1.1, color: entry.visual?.color || 0x6f8dff, opacity: 0.2 },
                forceRings: id === 'uranus',
                spin: id === 'uranus' ? -0.07 : 0.08,
                cameraDistance: 125,
                bloomStrength: 0.2
            });
        } else if (type === 'dwarf-planet') {
            Object.assign(base, {
                coreSize: 22,
                surfaceSprites: 16,
                atmosphere: id === 'pluto' ? { scale: 1.08, color: 0xc9d7ff, opacity: 0.1 } : null,
                spin: 0.06,
                cameraDistance: 95,
                bloomStrength: 0.15
            });
        } else if (type === 'moon') {
            Object.assign(base, {
                coreSize: 20,
                surfaceSprites: entry.visual?.pattern === 'ice' ? 8 : 20,
                atmosphere: id === 'titan' ? { scale: 1.14, color: 0xc69f61, opacity: 0.28 } : null,
                spin: 0.05,
                cameraDistance: 78,
                bloomStrength: 0.12
            });
        } else if (type === 'comet') {
            Object.assign(base, {
                coreSize: 14,
                surfaceSprites: 12,
                spin: 0.11,
                cameraDistance: 90,
                bloomStrength: 0.28,
                bloomThreshold: 0.42
            });
        }

        return base;
    }

    createFocusRings(entry, coreSize) {
        const group = new THREE.Group();
        group.name = `${entry.id}-focus-rings`;
        const color = entry.rings?.color || 0xd7c08c;
        const layers = entry.id === 'saturn'
            ? [
                { inner: 1.35, outer: 1.7, opacity: 0.55 },
                { inner: 1.78, outer: 2.15, opacity: 0.42 },
                { inner: 2.22, outer: 2.55, opacity: 0.28 }
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
            ring.userData.speed = index % 2 === 0 ? 0.02 : -0.015;
            group.add(ring);
        });
        return group;
    }

    createCometTail(coreSize) {
        const group = new THREE.Group();
        group.name = 'comet-tail';
        const random = this.host.seededRandom('halley-tail');
        const positions = [];
        for (let i = 0; i < 900; i += 1) {
            const t = Math.pow(random(), 0.65);
            positions.push(
                -t * coreSize * (8 + random() * 6) + (random() - 0.5) * coreSize * 0.8,
                (random() - 0.5) * coreSize * (0.6 + t * 1.8),
                (random() - 0.5) * coreSize * (0.6 + t * 1.8)
            );
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xbfe8ff,
            size: 1.35,
            map: this.host.createRadialTexture(0xffffff),
            transparent: true,
            opacity: 0.42,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        const tail = new THREE.Points(geometry, material);
        tail.userData.baseOpacity = 0.42;
        group.add(tail);
        return group;
    }

    createSurfaceSprites(entry, coreSize, count) {
        const group = new THREE.Group();
        group.name = `${entry.id}-surface-sprites`;
        const random = this.host.seededRandom(`${entry.id}-focus-surface`);
        const color = entry.visual?.pattern === 'ice' ? 0xddeeff : 0x66594c;
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
        moon.position.set(coreSize * 1.95, coreSize * 0.15, 0);
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
            this.coma.scale.setScalar(1 + Math.sin(time * 0.7) * 0.04);
        }
        if (this.tail) {
            this.tail.rotation.z = Math.sin(time * 0.2) * 0.05;
            this.tail.children.forEach((points) => {
                if (points.material) {
                    points.material.opacity = (points.userData.baseOpacity || 0.4)
                        * (0.75 + Math.sin(time * 0.8) * 0.25);
                }
            });
        }

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
        this.clouds = null;
        this.effectType = null;
        this.profile = null;
    }
}
