/**
 * Red giant / red supergiant near-view renderer.
 * Soft core, granulation, extended atmosphere, slow pulse, stellar wind.
 */
/* global THREE */
class RedGiantRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.core = null;
        this.innerGlow = null;
        this.atmosphere = null;
        this.outerHalo = null;
        this.granules = [];
        this.wind = null;
        this.outerWind = null;
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-red-giant-model`;
        group.userData.effectType = 'red-giant';

        const coreSize = this.host.getFocusedCoreSize('red-giant');
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(coreSize, 96, 64),
            new THREE.MeshBasicMaterial({
                color: entry.color,
                transparent: true,
                opacity: 0.78
            })
        );
        core.name = 'red-giant-core';
        group.add(core);

        const innerGlow = this.host.createGlowMesh(coreSize * 1.55, entry.color, 0.28);
        innerGlow.userData.baseOpacity = 0.28;
        core.add(innerGlow);

        const atmosphere = this.host.createGlowMesh(coreSize * 2.8, 0xff7a45, 0.22);
        atmosphere.name = 'red-giant-atmosphere';
        atmosphere.userData.baseOpacity = 0.22;
        core.add(atmosphere);

        const outerHalo = this.host.createGlowMesh(coreSize * 4.4, 0xff5a2e, 0.1);
        outerHalo.name = 'red-giant-outer-halo';
        outerHalo.userData.baseOpacity = 0.1;
        core.add(outerHalo);

        const granulationA = this.host.createFocusGranulation(entry.color, coreSize * 1.05);
        granulationA.userData.speed = 0.018;
        group.add(granulationA);

        const granulationB = this.host.createFocusGranulation(0xffb06a, coreSize * 1.35);
        granulationB.userData.speed = -0.012;
        group.add(granulationB);

        const granulationC = this.host.createFocusGranulation(0xff8a50, coreSize * 1.7);
        granulationC.userData.speed = 0.008;
        group.add(granulationC);

        const wind = this.host.createParticleShell(
            entry,
            760,
            coreSize * 1.6,
            coreSize * 4.4,
            0xff8a50,
            0.24
        );
        wind.name = 'red-giant-wind';
        wind.userData.baseOpacity = 0.24;
        group.add(wind);

        const outerWind = this.host.createParticleShell(
            entry,
            420,
            coreSize * 3.6,
            coreSize * 6.8,
            0xff6a3a,
            0.12
        );
        outerWind.name = 'red-giant-outer-wind';
        outerWind.userData.baseOpacity = 0.12;
        group.add(outerWind);

        this.group = group;
        this.core = core;
        this.innerGlow = innerGlow;
        this.atmosphere = atmosphere;
        this.outerHalo = outerHalo;
        this.granules = [granulationA, granulationB, granulationC];
        this.wind = wind;
        this.outerWind = outerWind;
        return group;
    }

    update(deltaSeconds, time) {
        if (!this.group) return;
        const pulse = 1 + Math.sin(time * 0.34) * 0.028;
        this.group.scale.setScalar(pulse);
        this.group.rotation.y += deltaSeconds * 0.018;

        if (this.core?.material) {
            this.core.material.opacity = 0.74 + Math.sin(time * 0.3) * 0.04;
        }
        if (this.innerGlow?.material) {
            this.innerGlow.material.uniforms.opacity.value =
                this.innerGlow.userData.baseOpacity * (0.9 + Math.sin(time * 0.45) * 0.1);
        }
        if (this.atmosphere?.material) {
            this.atmosphere.material.uniforms.opacity.value =
                this.atmosphere.userData.baseOpacity * (0.82 + Math.sin(time * 0.5) * 0.18);
            this.atmosphere.scale.setScalar(1 + Math.sin(time * 0.38) * 0.03);
        }
        if (this.outerHalo?.material) {
            this.outerHalo.material.uniforms.opacity.value =
                this.outerHalo.userData.baseOpacity * (0.78 + Math.sin(time * 0.28) * 0.22);
        }
        this.granules.forEach((layer, index) => {
            layer.rotation.y += deltaSeconds * (layer.userData.speed || 0.02);
            layer.rotation.x = Math.sin(time * 0.15 + index) * 0.04;
        });
        if (this.wind) {
            this.wind.rotation.y += deltaSeconds * 0.045;
            this.wind.rotation.z += deltaSeconds * 0.01;
            if (this.wind.material) {
                this.wind.material.opacity = this.wind.userData.baseOpacity
                    * (0.78 + Math.sin(time * 0.32) * 0.16);
            }
        }
        if (this.outerWind) {
            this.outerWind.rotation.y -= deltaSeconds * 0.02;
            if (this.outerWind.material) {
                this.outerWind.material.opacity = this.outerWind.userData.baseOpacity
                    * (0.7 + Math.sin(time * 0.22 + 1.2) * 0.2);
            }
        }
    }

    dispose() {
        this.group = null;
        this.core = null;
        this.innerGlow = null;
        this.atmosphere = null;
        this.outerHalo = null;
        this.granules = [];
        this.wind = null;
        this.outerWind = null;
    }
}
