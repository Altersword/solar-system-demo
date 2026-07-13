/**
 * Near-view focus lifecycle: show/clear focus, scene visibility, special body factory.
 * Camera flight stays on host (shared with expanded system views).
 */
/* global THREE, SpecialBodyFactory */
class FocusController {
    constructor(host) {
        this.host = host;
        this.focusGroup = null;
        this.focusedCatalogEntry = null;
        this.focusRenderer = null;
        this.focusSpecialRenderer = null;
    }

    get isActive() {
        return Boolean(this.focusGroup);
    }

    focusSelected() {
        const data = this.host.selectedObject?.userData?.data;
        if (!data?.effectType) return;
        this.show(data);
    }

    show(entry) {
        this.host.clearExpandedSystem();
        this.clear();
        this.focusedCatalogEntry = entry;
        this._syncHost();

        const group = new THREE.Group();
        group.name = `${entry.id}-focus-view`;
        group.position.set(0, 0, 0);
        group.userData.focusView = true;

        const created = SpecialBodyFactory.create(this.host, entry);
        this.focusSpecialRenderer = created.renderer;
        this.focusRenderer = created.ownsScreen ? created.renderer : null;
        group.add(created.object3d);

        const title = this.host.createTextSprite(`${entry.name} · ${entry.type}`, '#fff1c8');
        title.userData.effectRole = 'focus-title';
        title.position.set(0, 95, 0);
        title.scale.set(120, 30, 1);
        group.add(title);

        this.host.scene.add(group);
        this.focusGroup = group;
        this.host.applyFocusTimeScale?.(entry.effectType);
        this.host.applyRendererQuality(false);
        this.host.atlasGroup.visible = false;
        this.host.orbitGroups.visible = false;
        this.host.bodyGroups.visible = false;
        if (this.host.sun) this.host.sun.visible = false;
        if (this.host.sunLight) this.host.sunLight.visible = false;
        if (this.host.starfield) this.host.starfield.material.opacity = 0.38;
        if (this.host.milkyWay) this.host.milkyWay.visible = false;

        document.getElementById('btn-close-expanded')?.classList.remove('hidden');
        document.getElementById('btn-close-expanded').textContent = '返回星图';
        this.host.controls.minDistance = 5;

        if (entry.effectType === 'black-hole') {
            this.host.controls.maxDistance = 58;
            this.host.flyCameraToPos(
                new THREE.Vector3(30, 25, 30),
                new THREE.Vector3(0, 0, 0)
            );
        } else if (entry.effectType === 'pulsar') {
            this.host.controls.maxDistance = 280;
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.72;
            this.host.bloomPass.radius = 0.42;
            this.host.bloomPass.threshold = 0.34;
            this.host.flyCameraToPos(
                new THREE.Vector3(92, 54, 112),
                new THREE.Vector3(0, 0, 0)
            );
        } else if (entry.effectType === 'white-dwarf') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.95;
            this.host.bloomPass.radius = 0.48;
            this.host.bloomPass.threshold = 0.28;
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), 180);
        } else if (entry.effectType === 'red-giant') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.42;
            this.host.bloomPass.radius = 0.55;
            this.host.bloomPass.threshold = 0.42;
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), 280);
        } else {
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), 230);
        }

        this._syncHost();
    }

    clear() {
        if (!this.focusGroup && !this.focusRenderer && !this.focusSpecialRenderer) {
            this._syncHost();
            return;
        }

        if (this.focusRenderer && this.focusRenderer === this.focusSpecialRenderer) {
            this.focusRenderer.dispose();
        } else {
            this.focusRenderer?.dispose?.();
            this.focusSpecialRenderer?.dispose?.();
        }
        this.focusRenderer = null;
        this.focusSpecialRenderer = null;

        if (this.focusGroup) {
            this.host.disposeObject3D(this.focusGroup);
            this.host.scene.remove(this.focusGroup);
        }
        this.focusGroup = null;
        this.focusedCatalogEntry = null;
        this.host.restoreTimeScale?.();
        this.host.applyRendererQuality(false);
        this.host.useBloom = false;
        this.host.atlasGroup.visible = this.host.showAtlas;
        this.host.orbitGroups.visible = true;
        this.host.bodyGroups.visible = true;
        if (this.host.sun) this.host.sun.visible = true;
        if (this.host.sunLight) this.host.sunLight.visible = true;
        if (this.host.starfield) this.host.starfield.material.opacity = 0.82;
        if (this.host.milkyWay) this.host.milkyWay.visible = this.host.enhancedEffects;
        const closeExpanded = document.getElementById('btn-close-expanded');
        if (closeExpanded) closeExpanded.textContent = '返回星图';
        this.host.controls.minDistance = 18;
        this.host.controls.maxDistance = this.host.getModeConfig().maxDistance;
        this._syncHost();
    }

    update(deltaSeconds, time) {
        if (!this.focusGroup) return;

        const focusTitle = this.focusGroup.children.find((child) => child.userData?.effectRole === 'focus-title');
        if (focusTitle) focusTitle.visible = !document.body.classList.contains('ui-hidden');

        if (!['black-hole', 'pulsar', 'supernova'].includes(this.focusedCatalogEntry?.effectType)) {
            this.focusGroup.rotation.y += deltaSeconds * 0.08;
        }
        const effectType = this.focusedCatalogEntry?.effectType;
        if (['pulsar', 'supernova', 'red-giant', 'white-dwarf'].includes(effectType)) {
            this.focusSpecialRenderer?.update?.(deltaSeconds, time, this.host.camera);
        } else {
            this.host.updateSpecialObjectEffects(
                this.focusGroup,
                effectType,
                deltaSeconds,
                time,
                0.4
            );
        }
    }

    onResize(width, height) {
        this.focusRenderer?.setSize?.(width, height);
    }

    renderIfOwning(camera, blackHoleConfig, time, aspect) {
        if (!this.focusRenderer) return false;
        this.focusRenderer.update(camera, blackHoleConfig, time, aspect);
        return true;
    }

    _syncHost() {
        this.host.focusGroup = this.focusGroup;
        this.host.focusedCatalogEntry = this.focusedCatalogEntry;
        this.host.focusRenderer = this.focusRenderer;
        this.host.focusSpecialRenderer = this.focusSpecialRenderer;
    }
}
