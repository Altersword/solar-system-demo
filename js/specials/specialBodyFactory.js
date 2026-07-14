/**
 * Routes catalog effectType to a special-body renderer.
 * Returns { renderer, object3d, ownsScreen }.
 */
/* global BlackHoleRenderer, PulsarRenderer, SupernovaRemnantRenderer, RedGiantRenderer, WhiteDwarfRenderer, SunRenderer, SolarSystemFocusRenderer, SimpleSpecialsRenderer, THREE */
globalThis.SpecialBodyFactory = class SpecialBodyFactory {
    /**
     * @param {object} host SolarSystem (renderer, blackHoleConfig, helpers)
     * @param {object} entry catalog entry with effectType
     */
    static create(host, entry) {
        const type = entry.effectType;

        if (type === 'black-hole') {
            const renderer = new BlackHoleRenderer(host.renderer, host.blackHoleConfig);
            if (entry.id === 'sagittarius-a-star') {
                renderer.setDopplerScale(0.78);
            }
            const group = new THREE.Group();
            group.name = `${entry.id}-bh-fullscreen`;
            group.userData.effectType = type;
            group.add(renderer.getMesh());
            return { renderer, object3d: group, ownsScreen: true };
        }

        if (type === 'pulsar') {
            const renderer = new PulsarRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'supernova') {
            const renderer = new SupernovaRemnantRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'red-giant') {
            const renderer = new RedGiantRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'white-dwarf') {
            const renderer = new WhiteDwarfRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'sun') {
            const renderer = new SunRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if ([
            'planet-terrestrial',
            'planet-gas',
            'planet-ice',
            'dwarf-planet',
            'moon',
            'comet'
        ].includes(type)) {
            const renderer = new SolarSystemFocusRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        const renderer = new SimpleSpecialsRenderer(host);
        const object3d = renderer.create(entry);
        return { renderer, object3d, ownsScreen: false };
    }
}
