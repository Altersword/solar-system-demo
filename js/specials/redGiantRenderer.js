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

        // thicker convective inner glow
        const innerGlow = this.host.createGlowMesh(coreSize * 1.7, entry.color, 0.32);
        innerGlow.userData.baseOpacity = 0.32;
        core.add(innerGlow);

        // extended bloated atmosphere
        const atmosphere = this.host.createGlowMesh(coreSize * 3.2, 0xff7a45, 0.26);
        atmosphere.name = 'red-giant-atmosphere';
        atmosphere.userData.baseOpacity = 0.26;
        core.add(atmosphere);

        // vast diffuse outer halo
        const outerHalo = this.host.createGlowMesh(coreSize * 5.2, 0xff5a2e, 0.12);
        outerHalo.name = 'red-giant-outer-halo';
        outerHalo.userData.baseOpacity = 0.12;
        core.add(outerHalo);

        const granulationA = this.host.createFocusGranulation(entry.color, coreSize * 1.05);
        granulationA.userData.speed = 0.022;
        group.add(granulationA);

        const granulationB = this.host.createFocusGranulation(0xffb06a, coreSize * 1.45);
        granulationB.userData.speed = -0.015;
        group.add(granulationB);

        const granulationC = this.host.createFocusGranulation(0xff8a50, coreSize * 1.85);
        granulationC.userData.speed = 0.01;
        group.add(granulationC);

        const wind = this.host.createParticleShell(
            entry,
            850,
            coreSize * 1.8,
            coreSize * 5.0,
            0xff8a50,
            0.28
        );
        wind.name = 'red-giant-wind';
        wind.userData.baseOpacity = 0.28;
        group.add(wind);

        const outerWind = this.host.createParticleShell(
            entry,
            500,
            coreSize * 4.0,
            coreSize * 7.8,
            0xff6a3a,
            0.14
        );
        outerWind.name = 'red-giant-outer-wind';
        outerWind.userData.baseOpacity = 0.14;
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
        // slower deeper pulse for giant atmospheric breathing
        const pulse = 1 + Math.sin(time * 0.28) * 0.035;
        this.group.scale.setScalar(pulse);
        this.group.rotation.y += deltaSeconds * 0.015;

        if (this.core?.material) {
            this.core.material.opacity = 0.72 + Math.sin(time * 0.25) * 0.06;
        }
        if (this.innerGlow?.material) {
            this.innerGlow.material.uniforms.opacity.value =
                this.innerGlow.userData.baseOpacity * (0.85 + Math.sin(time * 0.35) * 0.15);
        }
        if (this.atmosphere?.material) {
            this.atmosphere.material.uniforms.opacity.value =
                this.atmosphere.userData.baseOpacity * (0.78 + Math.sin(time * 0.42) * 0.22);
            this.atmosphere.scale.setScalar(1 + Math.sin(time * 0.32) * 0.04);
        }
        if (this.outerHalo?.material) {
            this.outerHalo.material.uniforms.opacity.value =
                this.outerHalo.userData.baseOpacity * (0.72 + Math.sin(time * 0.22) * 0.28);
        }
        this.granules.forEach((layer, index) => {
            layer.rotation.y += deltaSeconds * (layer.userData.speed || 0.02);
            layer.rotation.x = Math.sin(time * 0.12 + index) * 0.05;
        });
        if (this.wind) {
            this.wind.rotation.y += deltaSeconds * 0.04;
            this.wind.rotation.z += deltaSeconds * 0.012;
            if (this.wind.material) {
                this.wind.material.opacity = this.wind.userData.baseOpacity
                    * (0.72 + Math.sin(time * 0.28) * 0.18);
            }
        }
        if (this.outerWind) {
            this.outerWind.rotation.y -= deltaSeconds * 0.018;
            if (this.outerWind.material) {
                this.outerWind.material.opacity = this.outerWind.userData.baseOpacity
                    * (0.65 + Math.sin(time * 0.18 + 1.2) * 0.22);
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
