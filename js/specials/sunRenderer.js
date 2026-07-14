/**
 * Near-view Sun renderer: photosphere, chromosphere, corona, prominences.
 * Far-view sun stays lightweight in SolarBodies.createSun().
 */
/* global THREE */
class SunRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.core = null;
        this.chromosphere = null;
        this.corona = null;
        this.outerCorona = null;
        this.granules = [];
        this.prominences = [];
        this.flare = null;
        this.spots = [];
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id || 'sun'}-near-view-model`;
        group.userData.effectType = 'sun';

        const coreSize = this.host.getFocusedCoreSize('sun');
        const photosphereMap = this.createPhotosphereTexture(entry);
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(coreSize, 128, 96),
            new THREE.MeshBasicMaterial({
                map: photosphereMap,
                color: 0xffc65a,
                transparent: true,
                opacity: 0.92
            })
        );
        core.name = 'sun-photosphere';
        group.add(core);

        const chromosphere = this.host.createGlowMesh(coreSize * 1.22, 0xff6a28, 0.42);
        chromosphere.name = 'sun-chromosphere';
        chromosphere.userData.baseOpacity = 0.42;
        core.add(chromosphere);

        const corona = this.host.createGlowMesh(coreSize * 2.6, 0xffd28a, 0.2);
        corona.name = 'sun-corona';
        corona.userData.baseOpacity = 0.2;
        core.add(corona);

        const outerCorona = this.host.createGlowMesh(coreSize * 4.3, 0xfff3c8, 0.09);
        outerCorona.name = 'sun-outer-corona';
        outerCorona.userData.baseOpacity = 0.09;
        core.add(outerCorona);

        const granulation = this.host.createFocusGranulation(0xffd27a, coreSize * 1.02);
        granulation.userData.speed = 0.012;
        group.add(granulation);

        const granulationOuter = this.host.createFocusGranulation(0xffb24a, coreSize * 1.12);
        granulationOuter.userData.speed = -0.008;
        group.add(granulationOuter);

        const spots = this.createSunspots(coreSize);
        group.add(spots);

        const prominences = this.createProminences(coreSize);
        group.add(prominences);

        const flare = this.host.createHaloSprite(0xfff2b0, coreSize * 1.8, 0.0);
        flare.position.set(coreSize * 0.95, coreSize * 0.45, 0);
        flare.userData.baseOpacity = 0.22;
        flare.userData.baseScale = coreSize * 1.8;
        group.add(flare);

        this.group = group;
        this.core = core;
        this.chromosphere = chromosphere;
        this.corona = corona;
        this.outerCorona = outerCorona;
        this.granules = [granulation, granulationOuter];
        this.prominences = prominences.children.slice();
        this.flare = flare;
        this.spots = spots.children.slice();
        return group;
    }

    createPhotosphereTexture(entry) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const random = this.host.seededRandom(`${entry?.id || 'sun'}-photosphere`);

        const gradient = ctx.createRadialGradient(512, 256, 30, 512, 256, 520);
        gradient.addColorStop(0, '#ffe7a0');
        gradient.addColorStop(0.32, '#ffc653');
        gradient.addColorStop(0.7, '#f08a24');
        gradient.addColorStop(1, '#b84a10');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 1800; i += 1) {
            const x = random() * canvas.width;
            const y = random() * canvas.height;
            const r = 1.2 + random() * 3.8;
            ctx.fillStyle = `rgba(255, ${170 + random() * 55}, ${55 + random() * 35}, ${0.07 + random() * 0.14})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 26; i += 1) {
            const x = random() * canvas.width;
            const y = random() * canvas.height;
            const r = 7 + random() * 18;
            const dark = ctx.createRadialGradient(x, y, 0, x, y, r);
            dark.addColorStop(0, 'rgba(55, 22, 6, 0.62)');
            dark.addColorStop(0.5, 'rgba(110, 42, 8, 0.32)');
            dark.addColorStop(1, 'rgba(255, 150, 35, 0)');
            ctx.fillStyle = dark;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 55; i += 1) {
            const x = random() * canvas.width;
            const y = random() * canvas.height;
            ctx.fillStyle = `rgba(255, 236, 170, ${0.1 + random() * 0.14})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 + random() * 4.5, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.needsUpdate = true;
        return texture;
    }

    createSunspots(coreSize) {
        const group = new THREE.Group();
        group.name = 'sun-spots';
        const random = this.host.seededRandom('sun-near-spots');
        for (let i = 0; i < 7; i += 1) {
            const spot = this.host.createHaloSprite(0x4a2208, coreSize * (0.18 + random() * 0.2), 0.42);
            const theta = random() * Math.PI * 2;
            const phi = (0.35 + random() * 0.9) * Math.PI;
            const radius = coreSize * 1.01;
            spot.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            spot.userData.baseOpacity = 0.35 + random() * 0.2;
            group.add(spot);
        }
        return group;
    }

    createProminences(coreSize) {
        const group = new THREE.Group();
        group.name = 'sun-prominences';
        const random = this.host.seededRandom('sun-prominences');
        for (let i = 0; i < 6; i += 1) {
            const points = [];
            const baseAngle = (i / 6) * Math.PI * 2 + random() * 0.35;
            const tilt = (random() - 0.5) * 0.8;
            for (let step = 0; step < 8; step += 1) {
                const t = step / 7;
                const radius = coreSize * (1.05 + t * (0.55 + random() * 0.45));
                const angle = baseAngle + Math.sin(t * Math.PI) * 0.45;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(tilt + t * 1.2) * coreSize * (0.15 + t * 0.55),
                    Math.sin(angle) * radius
                ));
            }
            const curve = new THREE.CatmullRomCurve3(points);
            const mesh = new THREE.Mesh(
                new THREE.TubeGeometry(curve, 28, coreSize * (0.018 + random() * 0.02), 6, false),
                new THREE.MeshBasicMaterial({
                    color: i % 2 === 0 ? 0xff8a3a : 0xffd27a,
                    transparent: true,
                    opacity: 0.28,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                })
            );
            mesh.userData.baseOpacity = 0.22 + random() * 0.14;
            mesh.userData.phase = random() * Math.PI * 2;
            group.add(mesh);
        }
        return group;
    }

    update(deltaSeconds, time) {
        if (!this.group) return;

        if (this.core) {
            this.core.rotation.y += deltaSeconds * 0.05;
        }

        const pulse = 1 + Math.sin(time * 0.42) * 0.012;
        this.group.scale.setScalar(pulse);

        if (this.chromosphere?.material?.uniforms) {
            this.chromosphere.material.uniforms.opacity.value =
                this.chromosphere.userData.baseOpacity * (0.86 + Math.sin(time * 0.55) * 0.14);
        }
        if (this.corona?.material?.uniforms) {
            this.corona.material.uniforms.opacity.value =
                this.corona.userData.baseOpacity * (0.8 + Math.sin(time * 0.33) * 0.2);
            this.corona.scale.setScalar(1 + Math.sin(time * 0.28) * 0.03);
        }
        if (this.outerCorona?.material?.uniforms) {
            this.outerCorona.material.uniforms.opacity.value =
                this.outerCorona.userData.baseOpacity * (0.75 + Math.sin(time * 0.22 + 1.1) * 0.25);
        }

        this.granules.forEach((layer) => {
            layer.rotation.y += deltaSeconds * (layer.userData.speed || 0.01);
        });

        this.prominences.forEach((arc, index) => {
            if (!arc.material) return;
            const wave = 0.7 + Math.sin(time * 0.9 + (arc.userData.phase || index)) * 0.3;
            arc.material.opacity = (arc.userData.baseOpacity || 0.25) * wave;
            arc.scale.setScalar(0.96 + wave * 0.08);
        });

        if (this.flare?.material) {
            const flareWave = Math.max(0, Math.sin(time * 1.7));
            const intensity = Math.pow(flareWave, 6);
            this.flare.material.opacity = this.flare.userData.baseOpacity * intensity;
            const scale = this.flare.userData.baseScale * (0.8 + intensity * 0.7);
            this.flare.scale.set(scale, scale, 1);
        }
    }

    dispose() {
        if (this.core?.material?.map) {
            this.core.material.map.dispose();
        }
        this.group = null;
        this.core = null;
        this.chromosphere = null;
        this.corona = null;
        this.outerCorona = null;
        this.granules = [];
        this.prominences = [];
        this.flare = null;
        this.spots = [];
    }
}
