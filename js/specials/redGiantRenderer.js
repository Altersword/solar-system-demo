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
        this.atmosphere = null;
        this.granules = [];
        this.wind = null;
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
                opacity: 0.94
            })
        );
        core.name = 'red-giant-core';
        group.add(core);

        const innerGlow = this.host.createGlowMesh(coreSize * 2.2, entry.color, 0.4);
        innerGlow.userData.baseOpacity = 0.4;
        core.add(innerGlow);

        const atmosphere = this.host.createGlowMesh(coreSize * 3.6, 0xff6a3a, 0.18);
        atmosphere.name = 'red-giant-atmosphere';
        atmosphere.userData.baseOpacity = 0.18;
        core.add(atmosphere);

        const granulationA = this.host.createFocusGranulation(entry.color, coreSize * 2.5);
        granulationA.userData.speed = 0.035;
        group.add(granulationA);

        const granulationB = this.host.createFocusGranulation(0xffb06a, coreSize * 3.15);
        granulationB.userData.speed = -0.02;
        group.add(granulationB);

        const wind = this.host.createParticleShell(
            entry,
            620,
            coreSize * 2.0,
            coreSize * 5.2,
            0xff8a50,
            0.34
        );
        wind.name = 'red-giant-wind';
        wind.userData.baseOpacity = 0.34;
        group.add(wind);

        this.group = group;
        this.core = core;
        this.atmosphere = atmosphere;
        this.granules = [granulationA, granulationB];
        this.wind = wind;
        return group;
    }

    update(deltaSeconds, time) {
        if (!this.group) return;
        const pulse = 1 + Math.sin(time * 0.48) * 0.022;
        this.group.scale.setScalar(pulse);
        this.group.rotation.y += deltaSeconds * 0.035;

        if (this.atmosphere?.material) {
            this.atmosphere.material.opacity = this.atmosphere.userData.baseOpacity
                * (0.84 + Math.sin(time * 0.62) * 0.16);
        }
        this.granules.forEach((layer) => {
            layer.rotation.y += deltaSeconds * (layer.userData.speed || 0.03);
        });
        if (this.wind) {
            this.wind.rotation.y += deltaSeconds * 0.07;
            this.wind.rotation.z += deltaSeconds * 0.015;
            if (this.wind.material) {
                this.wind.material.opacity = this.wind.userData.baseOpacity
                    * (0.8 + Math.sin(time * 0.4) * 0.14);
            }
        }
    }

    dispose() {
        this.group = null;
        this.core = null;
        this.atmosphere = null;
        this.granules = [];
        this.wind = null;
    }
}
