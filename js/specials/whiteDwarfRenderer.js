/**
 * White-dwarf near-view renderer.
 * Tiny dense core, controlled bloom-friendly glows, thin ring, no jets.
 */
/* global THREE */
class WhiteDwarfRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.core = null;
        this.innerGlow = null;
        this.outerGlow = null;
        this.ring = null;
        this.hotspot = null;
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-white-dwarf-model`;
        group.userData.effectType = 'white-dwarf';

        // compact extremely dense core
        const coreSize = this.host.getFocusedCoreSize('white-dwarf') * 0.38;
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(coreSize, 64, 48),
            new THREE.MeshBasicMaterial({ color: 0xf4fbff })
        );
        core.name = 'white-dwarf-core';
        group.add(core);

        // intense inner glow
        const innerGlow = this.host.createGlowMesh(coreSize * 2.6, 0xd7f4ff, 0.62);
        innerGlow.userData.baseOpacity = 0.62;
        core.add(innerGlow);

        // extended bloom-friendly outer glow
        const outerGlow = this.host.createGlowMesh(coreSize * 5.2, 0x8fd8ff, 0.2);
        outerGlow.userData.baseOpacity = 0.2;
        core.add(outerGlow);

        const ring = this.host.createCompactHaloRing(
            { ...entry, size: coreSize * 0.9 },
            0xbfe7ff,
            2.8
        );
        if (ring.material) {
            ring.material.opacity = 0.16;
            ring.userData.baseOpacity = 0.16;
        }
        group.add(ring);

        // bright accretion hotspot
        const hotspot = this.host.createHaloSprite(0xffffff, coreSize * 1.8, 0.32);
        hotspot.position.set(coreSize * 0.9, coreSize * 0.28, 0);
        hotspot.userData.baseOpacity = 0.32;
        hotspot.userData.baseScale = coreSize * 1.8;
        group.add(hotspot);

        this.group = group;
        this.core = core;
        this.innerGlow = innerGlow;
        this.outerGlow = outerGlow;
        this.ring = ring;
        this.hotspot = hotspot;
        return group;
    }



    update(deltaSeconds, time) {
        if (!this.group) return;
        // fast sharp pulse for compact intense variability
        const pulse = 0.88 + Math.sin(time * 3.2) * 0.12;

        if (this.innerGlow?.material?.uniforms) {
            this.innerGlow.material.uniforms.opacity.value =
                this.innerGlow.userData.baseOpacity * (0.82 + pulse * 0.18);
            this.innerGlow.scale.setScalar(this.innerGlow.userData.baseScale * (0.95 + pulse * 0.07));
        }
        if (this.outerGlow?.material?.uniforms) {
            this.outerGlow.material.uniforms.opacity.value =
                this.outerGlow.userData.baseOpacity * (0.72 + Math.sin(time * 1.8) * 0.18);
        }
        if (this.ring) {
            this.ring.rotation.z += deltaSeconds * 0.55;
            if (this.ring.material) {
                this.ring.material.opacity = (this.ring.userData.baseOpacity || 0.16)
                    * (0.75 + Math.sin(time * 2.0) * 0.18);
            }
        }
        if (this.hotspot?.material) {
            const hot = 0.55 + Math.max(0, Math.sin(time * 4.2)) * 0.35;
            this.hotspot.material.opacity = this.hotspot.userData.baseOpacity * hot;
            const scale = this.hotspot.userData.baseScale * (0.85 + hot * 0.18);
            this.hotspot.scale.set(scale, scale, 1);
        }
    }



    dispose() {
        this.group = null;
        this.core = null;
        this.innerGlow = null;
        this.outerGlow = null;
        this.ring = null;
        this.hotspot = null;
    }
}
