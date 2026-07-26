/**
 * Generic star focus near-view renderer for nearby stars and stellar objects
 * without a dedicated renderer (main-sequence stars, giants, binaries,
 * multi-star systems, Wolf-Rayet, variables, etc.).
 * Detects multiplicity from the type text and renders companions in orbit.
 */
/* global THREE */
globalThis.GenericStarRenderer = class GenericStarRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.primary = null;
        this.primaryGlow = null;
        this.companions = [];
        this.granules = [];
        this.windShell = null;
        this.pulsationDepth = 0.012;
        this.pulsationSpeed = 0.6;
    }

    detectCompanionCount(entry) {
        const text = entry.type || '';
        if (/六合/.test(text)) return 5;
        if (/四合/.test(text)) return 3;
        if (/三合/.test(text)) return 2;
        if (/双星|双红矮星|伴星|W(olf)?-?R(ayet)? 双星|热双星/.test(text)) return 1;
        return 0;
    }

    classifyPrimary(entry) {
        const text = (entry.type || '') + (entry.feature || '');
        if (/Wolf-Rayet|WR /.test(text)) return { size: 15, color: 0x9fc9ff, wind: true, pulse: [0.02, 1.4] };
        if (/蓝超巨星|高光度蓝变星/.test(text)) return { size: 30, color: 0xa8ccff, wind: true, pulse: [0.02, 0.7] };
        if (/白超巨星/.test(text)) return { size: 27, color: 0xf4f6ff, wind: false, pulse: [0.015, 0.6] };
        if (/造父变星/.test(text)) return { size: 24, color: 0xfff0c0, wind: false, pulse: [0.06, 0.45] };
        if (/橙巨星|K 型巨星/.test(text)) return { size: 26, color: 0xffbb77, wind: false, pulse: [0.02, 0.4] };
        if (/巨星/.test(text)) return { size: 25, color: entry.color, wind: false, pulse: [0.025, 0.4] };
        if (/超冷红矮星|红矮星|M 型/.test(text)) return { size: 12, color: 0xff8f5e, wind: false, pulse: [0.015, 1.1] };
        if (/A 型/.test(text)) return { size: 21, color: 0xdbe8ff, wind: false, pulse: [0.008, 0.8] };
        if (/B 型/.test(text)) return { size: 23, color: 0xb4d0ff, wind: false, pulse: [0.01, 0.9] };
        if (/K 型/.test(text)) return { size: 16, color: 0xffc98c, wind: false, pulse: [0.012, 0.55] };
        if (/G 型|太阳相似/.test(text)) return { size: 18, color: 0xffe3a8, wind: false, pulse: [0.012, 0.6] };
        return { size: 18, color: entry.color, wind: false, pulse: [0.012, 0.6] };
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-star-focus`;
        group.userData.effectType = 'generic-star';

        const random = this.host.seededRandom(`${entry.id}-star-focus`);
        const profile = this.classifyPrimary(entry);
        this.pulsationDepth = profile.pulse[0];
        this.pulsationSpeed = profile.pulse[1];

        // primary star
        const core = new THREE.Mesh(
            this.host.getSharedSphereGeometry(48, 32),
            new THREE.MeshBasicMaterial({ color: profile.color })
        );
        core.scale.setScalar(profile.size);
        core.userData.baseScale = profile.size;
        group.add(core);
        this.primary = core;

        const glow = this.host.createGlowMesh(1.9, profile.color, 0.4);
        glow.userData.baseOpacity = 0.4;
        core.add(glow);
        this.primaryGlow = glow;

        const halo = this.host.createHaloSprite(profile.color, profile.size * 5.2, 0.16);
        group.add(halo);

        // surface granulation for non-compact stars
        if (profile.size >= 14) {
            const granulation = this.host.createFocusGranulation(profile.color, profile.size * 1.03);
            granulation.userData.speed = 0.02;
            group.add(granulation);
            this.granules.push(granulation);
        }

        // strong stellar wind shell (WR / blue supergiants)
        if (profile.wind) {
            const wind = this.host.createParticleShell(
                { ...entry, size: profile.size },
                420,
                profile.size * 1.6,
                profile.size * 4.6,
                0x9fd0ff,
                0.3
            );
            group.add(wind);
            this.windShell = wind;
        }

        // red dwarfs keep their signature flare sparks
        if (entry.effectType === 'red-dwarf' || /红矮星/.test(entry.type || '')) {
            const sparks = this.host.createFlareSparks(
                { ...entry, size: profile.size },
                this.host.seededRandom(`${entry.id}-focus-flare`)
            );
            group.add(sparks);
            this.flareSparks = sparks;
        }

        // companions
        const companionCount = this.detectCompanionCount(entry);
        for (let i = 0; i < companionCount; i += 1) {
            const isWhiteDwarfCompanion = /白矮星伴星/.test(entry.type || '') && i === 0;
            const size = isWhiteDwarfCompanion
                ? 3.2
                : profile.size * (0.28 + random() * 0.3);
            const color = isWhiteDwarfCompanion
                ? 0xd9f2ff
                : [0xffc98c, 0xff9a66, 0xdbe8ff, 0xfff0c0][Math.floor(random() * 4)];

            const companion = new THREE.Mesh(
                this.host.getSharedSphereGeometry(32, 24),
                new THREE.MeshBasicMaterial({ color })
            );
            companion.scale.setScalar(size);
            const compGlow = this.host.createGlowMesh(1.8, color, 0.32);
            companion.add(compGlow);

            const pivot = new THREE.Group();
            const orbitRadius = profile.size * (2.6 + i * 1.5) + random() * 14;
            const inclination = (random() - 0.5) * 0.7;
            pivot.rotation.x = inclination;
            companion.position.set(orbitRadius, 0, 0);
            pivot.add(companion);
            pivot.rotation.y = random() * Math.PI * 2;
            group.add(pivot);

            // faint orbit path hint
            const curve = new THREE.EllipseCurve(0, 0, orbitRadius, orbitRadius, 0, Math.PI * 2, false, 0);
            const points = curve.getPoints(72).map((p) => new THREE.Vector3(p.x, 0, p.y));
            const orbitLine = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(points),
                new THREE.LineBasicMaterial({
                    color: 0x5a6d8c,
                    transparent: true,
                    opacity: 0.2,
                    depthWrite: false
                })
            );
            pivot.add(orbitLine);

            this.companions.push({
                pivot,
                mesh: companion,
                speed: 0.55 / (1 + i * 0.8) * (0.7 + random() * 0.6),
                spin: 0.4 + random() * 0.5
            });
        }

        this.group = group;
        return group;
    }

    update(deltaSeconds, time) {
        if (!this.group) return;

        if (this.primary) {
            const base = this.primary.userData.baseScale;
            const pulse = 1 + Math.sin(time * this.pulsationSpeed) * this.pulsationDepth;
            this.primary.scale.setScalar(base * pulse);
            this.primary.rotation.y += deltaSeconds * 0.05;
        }
        if (this.primaryGlow?.material?.uniforms) {
            this.primaryGlow.material.uniforms.opacity.value =
                this.primaryGlow.userData.baseOpacity * (0.85 + Math.sin(time * this.pulsationSpeed * 1.6) * 0.15);
        }
        this.granules.forEach((layer) => {
            layer.rotation.y += deltaSeconds * (layer.userData.speed || 0.02);
        });
        if (this.windShell) {
            this.windShell.rotation.y += deltaSeconds * 0.06;
            const breathe = 1 + Math.sin(time * 0.5) * 0.04;
            this.windShell.scale.setScalar(breathe);
        }
        if (this.flareSparks) {
            this.flareSparks.children.forEach((spark, index) => {
                spark.material.opacity = 0.05 + Math.max(0, Math.sin(time * 2.8 + index * 1.7)) * 0.28;
            });
        }
        this.companions.forEach((companion) => {
            companion.pivot.rotation.y += deltaSeconds * companion.speed;
            companion.mesh.rotation.y += deltaSeconds * companion.spin;
        });
    }

    dispose() {
        this.group = null;
        this.primary = null;
        this.primaryGlow = null;
        this.companions = [];
        this.granules = [];
        this.windShell = null;
        this.flareSparks = null;
    }
}
