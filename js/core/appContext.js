/**
 * Scene / camera / renderer bootstrap and quality settings.
 */
/* global THREE */
class AppContext {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
    }

    setup(containerEl, cameraPosition) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x02040c);
        this.scene.fog = new THREE.FogExp2(0x02040c, 0.00018);

        this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 8000);
        if (cameraPosition) {
            this.camera.position.fromArray(cameraPosition);
        }

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.16;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        containerEl.appendChild(this.renderer.domElement);
        return this;
    }

    getPixelRatio(isHighFidelityFocus, blackHoleConfig) {
        const deviceRatio = window.devicePixelRatio || 1;
        if (isHighFidelityFocus && blackHoleConfig) {
            return Math.min(
                Math.max(deviceRatio * blackHoleConfig.focusRenderScale, 2.5),
                blackHoleConfig.maxFocusPixelRatio
            );
        }
        return Math.min(deviceRatio, 2);
    }

    applyQuality(isHighFidelityFocus, blackHoleConfig) {
        if (!this.renderer) return;
        this.renderer.setPixelRatio(this.getPixelRatio(isHighFidelityFocus, blackHoleConfig));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    resize() {
        if (!this.camera || !this.renderer) return;
        const w = window.innerWidth;
        const h = Math.max(window.innerHeight, 1);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
}
