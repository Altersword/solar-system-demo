/**
 * Optional UnrealBloomPass via EffectComposer.
 */
/* global THREE */
class BloomComposer {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = null;
        this.bloomPass = null;
        this.enabled = false;
        this.setup();
    }

    setup() {
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.2,
            0.5,
            0.2
        );
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderPass);
        this.composer.addPass(this.bloomPass);
    }

    setEnabled(on) {
        this.enabled = Boolean(on);
    }

    resize(width, height) {
        this.composer?.setSize(width, height);
    }

    render() {
        if (this.enabled && this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
