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
            transparent: entry.effectType === 'supernova',
            opacity: entry.effectType === 'supernova' ? 0.32 : 1
        });
        const core = new THREE.Mesh(new THREE.SphereGeometry(coreSize, 96, 64), coreMaterial);
        core.name = 'focus-core';
        group.add(core);

        switch (entry.effectType) {
            case 'red-giant':
                core.add(this.host.createGlowMesh(coreSize * 2.1, entry.color, 0.48));
                group.add(this.host.createParticleShell(entry, 420, coreSize * 1.8, coreSize * 4.1, 0xff8a50, 0.42));
                group.add(this.host.createFocusGranulation(entry.color, coreSize * 2.4));
                break;
            case 'red-dwarf':
                core.add(this.host.createGlowMesh(coreSize * 2.0, entry.color, 0.38));
                group.add(this.host.createFlareSparks({ ...entry, size: coreSize }, this.host.seededRandom(`${entry.id}-focus-flare`)));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize }, 0xffb36f, 2.2));
                break;
            case 'white-dwarf':
                core.add(this.host.createGlowMesh(coreSize * 3.2, 0xbfe7ff, 0.58));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize }, 0xbfe7ff, 2.6));
                break;
            case 'supernova':
                group.add(this.host.createParticleShell(entry, 720, coreSize * 1.2, coreSize * 5.6, entry.color, 0.62));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize }, entry.color, 4.5));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize }, 0x8fd8ff, 6.2));
                break;
            default:
                core.add(this.host.createGlowMesh(coreSize * 2, entry.color, 0.35));
                break;
        }

        this.group = group;
        return group;
    }

    update() {}

    // GPU freed by clearFocusView → disposeObject3D(focusGroup)
    dispose() {
        this.group = null;
    }
}
