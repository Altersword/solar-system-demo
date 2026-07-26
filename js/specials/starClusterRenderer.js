/**
 * Star cluster focus near-view renderer.
 * - 'globular-cluster': dense spherical swarm, strong core concentration,
 *   老年恒星色（黄/橙/红巨星点缀蓝离散星）。
 * - 'open-cluster': loose young cluster, hot blue stars + residual gas wisps.
 */
/* global THREE */
globalThis.StarClusterRenderer = class StarClusterRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.swarm = null;
        this.brightStars = [];
        this.gasWisps = [];
        this.mode = 'globular-cluster';
    }

    create(entry, focusType) {
        const group = new THREE.Group();
        group.name = `${entry.id}-cluster-focus`;
        group.userData.effectType = focusType;
        this.mode = focusType;

        const random = this.host.seededRandom(`${entry.id}-cluster-focus`);
        if (focusType === 'globular-cluster') {
            this.createGlobular(group, entry, random);
        } else {
            this.createOpen(group, entry, random);
        }

        this.group = group;
        return group;
    }

    createGlobular(group, entry, random) {
        const count = 9000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const old1 = new THREE.Color(0xffe3b0);
        const old2 = new THREE.Color(0xffc98a);
        const giant = new THREE.Color(0xff9a66);
        const straggler = new THREE.Color(0xa8ccff);

        for (let i = 0; i < count; i += 1) {
            // King-profile-like concentration: strong core, extended halo
            const u = random();
            const r = u < 0.6 ? Math.pow(random(), 2.4) * 18 : Math.pow(random(), 1.25) * 58;
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.cos(phi);
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            const roll = random();
            const color = roll < 0.03 ? giant : roll < 0.05 ? straggler : roll < 0.5 ? old1 : old2;
            const bright = 0.4 + Math.pow(1 - Math.min(r / 58, 1), 1.6) * 0.6;
            colors[i * 3] = color.r * bright;
            colors[i * 3 + 1] = color.g * bright;
            colors[i * 3 + 2] = color.b * bright;
        }
        this.swarm = this.buildPoints(positions, colors, 1.15, 0.95);
        group.add(this.swarm);

        // core glow
        const core = this.host.createHaloSprite(0xffe9c4, 34, 0.4);
        group.add(core);
        this.coreGlow = core;

        // a few resolved red giants as sprites
        for (let i = 0; i < 8; i += 1) {
            const sprite = this.host.createHaloSprite(0xffa168, 3.2 + random() * 2.6, 0.5);
            const r = 6 + random() * 30;
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            sprite.position.set(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.cos(phi),
                r * Math.sin(phi) * Math.sin(theta)
            );
            sprite.userData.twinkle = { phase: random() * Math.PI * 2, baseOpacity: 0.5 };
            group.add(sprite);
            this.brightStars.push(sprite);
        }
    }

    createOpen(group, entry, random) {
        const count = 700;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const hot = new THREE.Color(0xa9d1ff);
        const white = new THREE.Color(0xf2f6ff);
        const warm = new THREE.Color(0xffe9bd);

        for (let i = 0; i < count; i += 1) {
            // loose, slightly flattened distribution with subclumps
            const r = Math.pow(random(), 0.85) * 62;
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.cos(phi) * 0.62;
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            const roll = random();
            const color = roll < 0.3 ? hot : roll < 0.75 ? white : warm;
            const bright = 0.5 + random() * 0.5;
            colors[i * 3] = color.r * bright;
            colors[i * 3 + 1] = color.g * bright;
            colors[i * 3 + 2] = color.b * bright;
        }
        this.swarm = this.buildPoints(positions, colors, 1.9, 0.95);
        group.add(this.swarm);

        // luminous member stars with halo sprites
        for (let i = 0; i < 14; i += 1) {
            const sprite = this.host.createHaloSprite(
                random() < 0.7 ? 0xbcd8ff : 0xfff1cd,
                4.5 + random() * 5,
                0.45
            );
            const r = Math.pow(random(), 0.8) * 46;
            const theta = random() * Math.PI * 2;
            sprite.position.set(
                Math.cos(theta) * r,
                (random() - 0.5) * r * 0.6,
                Math.sin(theta) * r
            );
            sprite.userData.twinkle = { phase: random() * Math.PI * 2, baseOpacity: 0.45 };
            group.add(sprite);
            this.brightStars.push(sprite);
        }

        // residual natal gas wisps (very faint blue reflection)
        for (let i = 0; i < 6; i += 1) {
            const wisp = this.host.createHaloSprite(0x6f9dff, 30 + random() * 30, 0.04 + random() * 0.03);
            wisp.position.set(
                (random() - 0.5) * 80,
                (random() - 0.5) * 34,
                (random() - 0.5) * 80
            );
            wisp.userData.drift = { phase: random() * Math.PI * 2, baseOpacity: wisp.material.opacity };
            group.add(wisp);
            this.gasWisps.push(wisp);
        }
    }

    buildPoints(positions, colors, size, opacity) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return new THREE.Points(geometry, new THREE.PointsMaterial({
            size,
            vertexColors: true,
            transparent: true,
            opacity,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        }));
    }

    update(deltaSeconds, time) {
        if (!this.group) return;
        this.group.rotation.y += deltaSeconds * (this.mode === 'globular-cluster' ? 0.01 : 0.018);
        this.brightStars.forEach((sprite, index) => {
            const twinkle = sprite.userData.twinkle;
            sprite.material.opacity = twinkle.baseOpacity * (0.7 + Math.abs(Math.sin(time * 1.4 + twinkle.phase + index)) * 0.3);
        });
        this.gasWisps.forEach((wisp) => {
            const drift = wisp.userData.drift;
            wisp.material.opacity = drift.baseOpacity * (0.75 + Math.sin(time * 0.22 + drift.phase) * 0.25);
        });
        if (this.coreGlow?.material) {
            this.coreGlow.material.opacity = 0.34 + Math.sin(time * 0.7) * 0.06;
        }
    }

    dispose() {
        this.group = null;
        this.swarm = null;
        this.brightStars = [];
        this.gasWisps = [];
        this.coreGlow = null;
    }
}
