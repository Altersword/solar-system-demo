/**
 * Lightweight focus models for red-giant, red-dwarf, white-dwarf, supernova, etc.
 * Uses host helpers: getFocusedCoreSize, createGlowMesh, createParticleShell,
 * createFocusGranulation, createFlareSparks, createCompactHaloRing, seededRandom.
 */
/* global THREE */
class SimpleSpecialsRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.effectType = null;
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-focused-model`;
        group.userData.effectType = entry.effectType;
        this.effectType = entry.effectType;

        const coreSize = this.host.getFocusedCoreSize(entry.effectType);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: entry.color,
            transparent: false,
            opacity: 1
        });
        const core = new THREE.Mesh(new THREE.SphereGeometry(coreSize, 96, 64), coreMaterial);
        core.name = 'focus-core';
        group.add(core);

        switch (entry.effectType) {
            case 'red-giant':
                core.material.transparent = true;
                core.material.opacity = 0.92;
                core.add(this.host.createGlowMesh(coreSize * 2.4, entry.color, 0.42));
                core.add(this.host.createGlowMesh(coreSize * 3.4, 0xff6a3a, 0.16));
                group.add(this.host.createParticleShell(entry, 520, coreSize * 1.9, coreSize * 4.6, 0xff8a50, 0.38));
                group.add(this.host.createFocusGranulation(entry.color, coreSize * 2.55));
                group.add(this.host.createFocusGranulation(0xffb06a, coreSize * 3.1));
                group.userData.effectRole = 'red-giant-body';
                break;
            case 'red-dwarf':
                core.add(this.host.createGlowMesh(coreSize * 2.0, entry.color, 0.38));
                group.add(this.host.createFlareSparks({ ...entry, size: coreSize }, this.host.seededRandom(`${entry.id}-focus-flare`)));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize }, 0xffb36f, 2.2));
                break;
            case 'white-dwarf':
                core.scale.setScalar(0.72);
                core.material.color.setHex(0xeef9ff);
                core.add(this.host.createGlowMesh(coreSize * 2.2, 0xd7f4ff, 0.72));
                core.add(this.host.createGlowMesh(coreSize * 4.2, 0x8fd8ff, 0.28));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize * 0.85 }, 0xbfe7ff, 2.1));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize * 0.85 }, 0xffffff, 3.4));
                group.userData.effectRole = 'white-dwarf-body';
                break;
            default:
                core.add(this.host.createGlowMesh(coreSize * 2, entry.color, 0.35));
                break;
        }

        this.group = group;
        this.core = core;
        return group;
    }

    update(deltaSeconds, time) {
        if (!this.group) return;
        if (this.effectType === 'red-giant') {
            const pulse = 1 + Math.sin(time * 0.55) * 0.018;
            this.group.scale.setScalar(pulse);
            this.group.rotation.y += deltaSeconds * 0.05;
        } else if (this.effectType === 'white-dwarf' && this.core) {
            const pulse = 0.94 + Math.sin(time * 3.2) * 0.06;
            this.core.material.opacity = 1;
            this.core.children.forEach((child, index) => {
                if (child.material) {
                    child.material.opacity = (index === 0 ? 0.68 : 0.24) * (0.88 + pulse * 0.18);
                }
            });
        }
    }

    // GPU freed by clearFocusView → disposeObject3D(focusGroup)
    dispose() {
        this.group = null;
        this.core = null;
        this.effectType = null;
    }
}
