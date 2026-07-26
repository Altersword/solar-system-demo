/**
 * Nebula focus near-view renderer.
 * Two modes:
 * - 'nebula': emission / star-forming region — layered sprite clouds,
 *   dark dust lanes, embedded young stars, slow internal drift.
 * - 'planetary-nebula': bright central white dwarf + expanding shells + ring.
 * Budget kept modest for integrated GPUs.
 */
/* global THREE */
globalThis.NebulaRenderer = class NebulaRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.cloudLayers = [];
        this.stars = null;
        this.centralStar = null;
        this.shells = [];
        this.mode = 'nebula';
    }

    create(entry, focusType) {
        const group = new THREE.Group();
        group.name = `${entry.id}-nebula-focus`;
        group.userData.effectType = focusType;
        this.mode = focusType;

        if (focusType === 'planetary-nebula') {
            this.createPlanetaryNebula(group, entry);
        } else {
            this.createEmissionNebula(group, entry);
        }

        this.group = group;
        return group;
    }

    createEmissionNebula(group, entry) {
        const random = this.host.seededRandom(`${entry.id}-nebula-focus`);
        const baseColor = new THREE.Color(entry.color);
        const emission = new THREE.Color(0xff7a9c).lerp(baseColor, 0.45);
        const reflection = new THREE.Color(0x7fa8ff).lerp(baseColor, 0.3);

        // Billowing cloud volume from layered sprites in several lobes.
        const lobes = [];
        const lobeCount = 3 + Math.floor(random() * 3);
        for (let i = 0; i < lobeCount; i += 1) {
            lobes.push({
                x: (random() - 0.5) * 95,
                y: (random() - 0.5) * 55,
                z: (random() - 0.5) * 80,
                r: 24 + random() * 30
            });
        }

        for (let i = 0; i < 54; i += 1) {
            const lobe = lobes[Math.floor(random() * lobes.length)];
            const mixColor = random() < 0.62 ? emission : reflection;
            const sprite = this.host.createHaloSprite(
                mixColor.getHex(),
                lobe.r * (0.8 + random() * 1.3),
                0.05 + random() * 0.07
            );
            sprite.position.set(
                lobe.x + (random() - 0.5) * lobe.r * 1.6,
                lobe.y + (random() - 0.5) * lobe.r * 1.1,
                lobe.z + (random() - 0.5) * lobe.r * 1.6
            );
            sprite.userData.drift = {
                phase: random() * Math.PI * 2,
                speed: 0.1 + random() * 0.2,
                baseOpacity: sprite.material.opacity
            };
            group.add(sprite);
            this.cloudLayers.push(sprite);
        }

        // Dark dust lanes cutting through the glow.
        for (let i = 0; i < 10; i += 1) {
            const dust = this.host.createHaloSprite(0x0d0a12, 26 + random() * 34, 0.16 + random() * 0.12);
            dust.material.blending = THREE.NormalBlending;
            const lobe = lobes[Math.floor(random() * lobes.length)];
            dust.position.set(
                lobe.x + (random() - 0.5) * lobe.r * 1.8,
                lobe.y + (random() - 0.5) * lobe.r,
                lobe.z + (random() - 0.5) * lobe.r * 1.8
            );
            group.add(dust);
        }

        // Embedded young cluster: hot sparse stars inside the brightest lobe.
        const starCount = 260;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const hot = new THREE.Color(0xcfe4ff);
        const warm = new THREE.Color(0xfff0c8);
        for (let i = 0; i < starCount; i += 1) {
            const lobe = lobes[Math.floor(random() * lobes.length)];
            positions[i * 3] = lobe.x + (random() - 0.5) * lobe.r * 2.2;
            positions[i * 3 + 1] = lobe.y + (random() - 0.5) * lobe.r * 1.4;
            positions[i * 3 + 2] = lobe.z + (random() - 0.5) * lobe.r * 2.2;
            const color = random() < 0.55 ? hot : warm;
            const bright = 0.5 + random() * 0.5;
            colors[i * 3] = color.r * bright;
            colors[i * 3 + 1] = color.g * bright;
            colors[i * 3 + 2] = color.b * bright;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.stars = new THREE.Points(geometry, new THREE.PointsMaterial({
            size: 1.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        }));
        group.add(this.stars);
    }

    createPlanetaryNebula(group, entry) {
        const random = this.host.seededRandom(`${entry.id}-pn-focus`);
        const shellColor = new THREE.Color(entry.color);
        const inner = new THREE.Color(0x7ff0d8).lerp(shellColor, 0.4);
        const outer = new THREE.Color(0xff8a6a).lerp(shellColor, 0.35);

        // Central hot white dwarf — keep it tiny and dim so shells are the focus
        const core = new THREE.Mesh(
            this.host.getSharedSphereGeometry(32, 24),
            new THREE.MeshBasicMaterial({ color: 0xeef8ff })
        );
        core.scale.setScalar(1.2);
        group.add(core);
        this.centralStar = core;
        // subtle glow only — shells should dominate
        const coreGlow = this.host.createGlowMesh(2.2, 0xbfe9ff, 0.28);
        core.add(coreGlow);

        // Expanding translucent shells — use OIII blue-green + warm outer tones
        const shellConfigs = [
            { radius: 26, count: 900, color: new THREE.Color(0x7ff0d8), opacity: 0.72, speed: 0.05 },
            { radius: 40, count: 1100, color: new THREE.Color(0x55c8e8), opacity: 0.58, speed: 0.035 },
            { radius: 56, count: 900, color: new THREE.Color(0xff9a6a), opacity: 0.38, speed: 0.022 }
        ];
        shellConfigs.forEach((config, index) => {
            const positions = new Float32Array(config.count * 3);
            const colors = new Float32Array(config.count * 3);
            for (let i = 0; i < config.count; i += 1) {
                const theta = random() * Math.PI * 2;
                const phi = Math.acos(2 * random() - 1);
                // slight ellipticity + surface noise
                const r = config.radius * (0.92 + random() * 0.16);
                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.cos(phi) * 0.82;
                positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
                const bright = 0.5 + random() * 0.5;
                colors[i * 3] = config.color.r * bright;
                colors[i * 3 + 1] = config.color.g * bright;
                colors[i * 3 + 2] = config.color.b * bright;
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            const points = new THREE.Points(geometry, new THREE.PointsMaterial({
                size: 1.4,
                vertexColors: true,
                transparent: true,
                opacity: config.opacity,
                sizeAttenuation: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            }));
            points.userData.pnShell = { speed: config.speed, baseOpacity: config.opacity, phase: index * 1.7 };
            group.add(points);
            this.shells.push(points);
        });

        // Equatorial brighter ring
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(33, 3.2, 10, 64),
            new THREE.MeshBasicMaterial({
                color: inner.getHex(),
                transparent: true,
                opacity: 0.22,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        ring.rotation.x = Math.PI / 2;
        ring.userData.pnRing = true;
        group.add(ring);
        this.ring = ring;
    }

    update(deltaSeconds, time) {
        if (!this.group) return;
        if (this.mode === 'planetary-nebula') {
            this.shells.forEach((shell) => {
                const data = shell.userData.pnShell;
                const breathing = 1 + Math.sin(time * data.speed * 4 + data.phase) * 0.03;
                shell.scale.setScalar(breathing);
                shell.rotation.y += deltaSeconds * data.speed;
                shell.material.opacity = data.baseOpacity * (0.85 + Math.sin(time * 0.6 + data.phase) * 0.15);
            });
            if (this.ring) this.ring.rotation.z += deltaSeconds * 0.04;
        if (this.centralStar) {
            const pulse = 1 + Math.sin(time * 2.2) * 0.05;
            this.centralStar.scale.setScalar(1.2 * pulse);
        }
        } else {
            this.group.rotation.y += deltaSeconds * 0.012;
            this.cloudLayers.forEach((sprite) => {
                const drift = sprite.userData.drift;
                sprite.material.opacity = drift.baseOpacity * (0.8 + Math.sin(time * drift.speed + drift.phase) * 0.2);
            });
        }
    }

    dispose() {
        this.group = null;
        this.cloudLayers = [];
        this.stars = null;
        this.centralStar = null;
        this.shells = [];
        this.ring = null;
    }
}
