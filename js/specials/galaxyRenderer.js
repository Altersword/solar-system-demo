/**
 * Galaxy / galaxy-cluster focus near-view renderer.
 * Particle-disk morphology: spiral (with arms/bar), elliptical halo,
 * irregular clump field, and multi-galaxy cluster layout.
 * Budgets kept modest for integrated GPUs (<= ~14k points total).
 */
/* global THREE */
globalThis.GalaxyRenderer = class GalaxyRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.disk = null;
        this.halo = null;
        this.coreGlow = null;
        this.members = [];
        this.morphology = 'spiral';
    }

    detectMorphology(entry) {
        const text = (entry.type || '') + (entry.feature || '');
        if (/椭圆|透镜/.test(text)) return 'elliptical';
        if (/不规则|星暴|矮星系|卫星星系/.test(text)) return 'irregular';
        if (/棒旋/.test(text)) return 'barred-spiral';
        if (/侧向/.test(text)) return 'edge-on';
        return 'spiral';
    }

    create(entry, focusType) {
        const group = new THREE.Group();
        group.name = `${entry.id}-galaxy-focus`;
        group.userData.effectType = focusType;

        if (focusType === 'galaxy-cluster') {
            this.morphology = 'cluster';
            this.createCluster(group, entry);
        } else {
            this.morphology = this.detectMorphology(entry);
            this.createGalaxy(group, entry, this.morphology, 1, new THREE.Vector3());
        }

        this.group = group;
        return group;
    }

    createGalaxy(parent, entry, morphology, scale, offset) {
        const random = this.host.seededRandom(`${entry.id}-galaxy-${offset.x}-${offset.z}`);
        const galaxy = new THREE.Group();
        galaxy.position.copy(offset);
        galaxy.scale.setScalar(scale);
        // Random orientation for cluster members; main galaxy gets a readable tilt.
        if (scale < 1) {
            galaxy.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI * 0.4);
        } else {
            galaxy.rotation.x = morphology === 'edge-on' ? Math.PI / 2.15 : -0.42;
        }

        const baseColor = new THREE.Color(entry.color);
        const coreColor = new THREE.Color(0xffe8c2).lerp(baseColor, 0.35);
        const armColor = new THREE.Color(0x9fc4ff).lerp(baseColor, 0.4);

        if (morphology === 'elliptical') {
            galaxy.add(this.createEllipticalHalo(random, coreColor, scale >= 1 ? 9000 : 1200));
        } else if (morphology === 'irregular') {
            galaxy.add(this.createIrregularField(random, baseColor, armColor, scale >= 1 ? 8000 : 1100));
        } else {
            galaxy.add(this.createSpiralDisk(
                random, coreColor, armColor,
                morphology === 'barred-spiral',
                scale >= 1 ? 11000 : 1400
            ));
        }

        // Keep the core glow smaller than the disk radius so it doesn't
        // wash out the spiral arms.  Disk extends to ~62 units; glow ≤ 14.
        const coreGlow = this.host.createHaloSprite(coreColor.getHex(), morphology === 'elliptical' ? 18 : 12, 0.38);
        coreGlow.userData.galaxyCore = true;
        galaxy.add(coreGlow);
        if (scale >= 1) this.coreGlow = coreGlow;

        parent.add(galaxy);
        if (scale >= 1) this.disk = galaxy;
        else this.members.push(galaxy);
        return galaxy;
    }

    createSpiralDisk(random, coreColor, armColor, barred, count) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const armCount = 2 + Math.floor(random() * 2);
        const maxRadius = 62;
        const dust = new THREE.Color(0x2a1e2e);

        for (let i = 0; i < count; i += 1) {
            const t = Math.pow(random(), 0.72);
            let radius = t * maxRadius;
            let angle;

            if (barred && radius < maxRadius * 0.3 && random() < 0.55) {
                // central bar: elongated along x
                angle = (random() < 0.5 ? 0 : Math.PI) + (random() - 0.5) * 0.5;
                radius *= 0.85;
            } else {
                const arm = Math.floor(random() * armCount);
                const armOffset = (arm / armCount) * Math.PI * 2;
                const winding = radius * 0.085;
                const spread = (random() - 0.5) * (0.32 + t * 0.5);
                angle = armOffset + winding + spread;
            }

            const puff = (random() - 0.5) * (3.2 - t * 2.1);
            positions[i * 3] = Math.cos(angle) * radius + (random() - 0.5) * 2.2;
            positions[i * 3 + 1] = puff;
            positions[i * 3 + 2] = Math.sin(angle) * radius + (random() - 0.5) * 2.2;

            const mix = Math.min(1, t * 1.35);
            const color = coreColor.clone().lerp(armColor, mix);
            // occasional pink HII knots along the arms
            if (mix > 0.35 && random() < 0.05) color.setHex(0xff9cb8);
            // dust darkening
            if (mix > 0.25 && random() < 0.08) color.copy(dust);
            // Keep central particles DIMMER: they pile up densely, so with
            // additive blending a bright center saturates to white and hides
            // the arms.  Let the arms carry the brightness instead.
            const bright = 0.34 + t * 0.34;
            colors[i * 3] = color.r * bright;
            colors[i * 3 + 1] = color.g * bright;
            colors[i * 3 + 2] = color.b * bright;
        }
        return this.buildPoints(positions, colors, 1.35);
    }

    createEllipticalHalo(random, coreColor, count) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const old = new THREE.Color(0xffd9a8);

        for (let i = 0; i < count; i += 1) {
            const r = Math.pow(random(), 1.9) * 58;
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.25;
            positions[i * 3 + 1] = r * Math.cos(phi) * 0.78;
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            // Flatter brightness curve so the dense center doesn't saturate
            // to a white blob under additive blending.
            const bright = 0.3 + Math.pow(1 - r / 58, 2) * 0.32;
            const color = coreColor.clone().lerp(old, random() * 0.5);
            colors[i * 3] = color.r * bright;
            colors[i * 3 + 1] = color.g * bright;
            colors[i * 3 + 2] = color.b * bright;
        }
        return this.buildPoints(positions, colors, 1.25);
    }

    createIrregularField(random, baseColor, armColor, count) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        // several star-forming clumps
        const clumps = [];
        const clumpCount = 4 + Math.floor(random() * 4);
        for (let c = 0; c < clumpCount; c += 1) {
            clumps.push({
                x: (random() - 0.5) * 70,
                y: (random() - 0.5) * 18,
                z: (random() - 0.5) * 55,
                r: 7 + random() * 13
            });
        }
        const hii = new THREE.Color(0xff9cb8);
        const young = new THREE.Color(0xaad4ff);

        for (let i = 0; i < count; i += 1) {
            const clump = clumps[Math.floor(random() * clumps.length)];
            const spread = random() < 0.3 ? 2.6 : 1;
            positions[i * 3] = clump.x + (random() - 0.5) * clump.r * 2 * spread;
            positions[i * 3 + 1] = clump.y + (random() - 0.5) * clump.r * spread;
            positions[i * 3 + 2] = clump.z + (random() - 0.5) * clump.r * 2 * spread;

            const roll = random();
            const color = roll < 0.12 ? hii : roll < 0.5 ? young : baseColor.clone().lerp(armColor, random());
            const bright = 0.45 + random() * 0.55;
            colors[i * 3] = color.r * bright;
            colors[i * 3 + 1] = color.g * bright;
            colors[i * 3 + 2] = color.b * bright;
        }
        return this.buildPoints(positions, colors, 1.5);
    }

    createCluster(group, entry) {
        const random = this.host.seededRandom(`${entry.id}-cluster-layout`);
        // Bright central galaxy + surrounding members
        this.createGalaxy(group, entry, 'elliptical', 0.62, new THREE.Vector3(0, 0, 0));
        const memberCount = 9;
        const morphs = ['spiral', 'elliptical', 'irregular', 'barred-spiral'];
        for (let i = 0; i < memberCount; i += 1) {
            const angle = (i / memberCount) * Math.PI * 2 + random() * 1.2;
            const dist = 55 + random() * 95;
            const offset = new THREE.Vector3(
                Math.cos(angle) * dist,
                (random() - 0.5) * 70,
                Math.sin(angle) * dist
            );
            this.createGalaxy(group, entry, morphs[Math.floor(random() * morphs.length)], 0.16 + random() * 0.2, offset);
        }
        // faint intracluster medium
        const icm = this.host.createHaloSprite(0x8899cc, 320, 0.05);
        group.add(icm);
    }

    buildPoints(positions, colors, size) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return new THREE.Points(geometry, new THREE.PointsMaterial({
            size,
            vertexColors: true,
            transparent: true,
            opacity: 0.62,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        }));
    }

    update(deltaSeconds, time) {
        if (!this.group) return;
        if (this.morphology === 'cluster') {
            this.group.rotation.y += deltaSeconds * 0.008;
            this.members.forEach((member, index) => {
                member.rotation.y += deltaSeconds * (0.05 + (index % 3) * 0.02);
            });
        } else if (this.disk) {
            // differential-feel slow rotation of the whole disk
            this.disk.rotation.y += deltaSeconds * (this.morphology === 'elliptical' ? 0.01 : 0.028);
        }
        if (this.coreGlow?.material) {
            this.coreGlow.material.opacity = 0.42 + Math.sin(time * 0.5) * 0.08;
        }
    }

    dispose() {
        this.group = null;
        this.disk = null;
        this.halo = null;
        this.coreGlow = null;
        this.members = [];
    }
}
