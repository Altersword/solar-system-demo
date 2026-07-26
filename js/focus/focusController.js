/**
 * Near-view focus lifecycle: show/clear focus, scene visibility, special body factory.
 * Camera flight stays on host (shared with expanded system views).
 */
/* global THREE, SpecialBodyFactory */
globalThis.FocusController = class FocusController {
    constructor(host) {
        this.host = host;
        this.focusGroup = null;
        this.focusedCatalogEntry = null;
        this.focusedType = null;
        this.focusRenderer = null;
        this.focusSpecialRenderer = null;
    }

    get isActive() {
        return Boolean(this.focusGroup);
    }

    focusSelected() {
        const data = this.host.selectedObject?.userData?.data;
        if (!data) return;
        if (!globalThis.SpecialBodyFactory.getFocusType(data)) return;
        this.show(data);
    }

    show(entry) {
        this.host.clearExpandedSystem();
        this.clear();
        this.focusedCatalogEntry = entry;
        this.focusedType = globalThis.SpecialBodyFactory.getFocusType(entry);
        this._syncHost();

        const group = new THREE.Group();
        group.name = `${entry.id}-focus-view`;
        group.position.set(0, 0, 0);
        group.userData.focusView = true;

        const created = globalThis.SpecialBodyFactory.create(this.host, entry);
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
        const focusType = this.focusedType;
        this.host.applyFocusTimeScale?.(focusType);
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

        if (focusType === 'black-hole') {
            this.host.controls.maxDistance = 58;
            this.host.flyCameraToPos(
                new THREE.Vector3(38, 12, 42),
                new THREE.Vector3(0, 0, 0)
            );
        } else if (focusType === 'pulsar') {
            this.host.controls.maxDistance = 280;
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.72;
            this.host.bloomPass.radius = 0.42;
            this.host.bloomPass.threshold = 0.34;
            this.host.flyCameraToPos(
                new THREE.Vector3(92, 54, 112),
                new THREE.Vector3(0, 0, 0)
            );
        } else if (focusType === 'white-dwarf') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.68;
            this.host.bloomPass.radius = 0.4;
            this.host.bloomPass.threshold = 0.4;
            // White dwarf: closer than red giant to emphasize compact brilliance
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), 170);
        } else if (focusType === 'red-giant') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.3;
            this.host.bloomPass.radius = 0.62;
            this.host.bloomPass.threshold = 0.5;
            // Red giant: further back to show its bloated atmosphere
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), 340);
        } else if (focusType === 'sun') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.36;
            this.host.bloomPass.radius = 0.58;
            this.host.bloomPass.threshold = 0.52;
            this.host.controls.maxDistance = 280;
            this.host.flyCameraToPos(
                new THREE.Vector3(0, 22, 110),
                new THREE.Vector3(0, 0, 0)
            );
        } else if ([
            'planet-terrestrial',
            'planet-gas',
            'planet-ice',
            'dwarf-planet',
            'moon',
            'comet'
        ].includes(focusType)) {
            const profile = this.focusSpecialRenderer?.profile;
            this.host.useBloom = true;
            this.host.bloomPass.strength = profile?.bloomStrength ?? 0.2;
            this.host.bloomPass.radius = 0.45;
            this.host.bloomPass.threshold = profile?.bloomThreshold ?? 0.55;
            this.host.controls.maxDistance = Math.max(180, (profile?.cameraDistance || 110) * 2.2);
            this.host.flyCameraToPos(
                new THREE.Vector3(0, (profile?.cameraDistance || 110) * 0.18, profile?.cameraDistance || 110),
                new THREE.Vector3(0, 0, 0)
            );
        } else if (focusType === 'supernova') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.35;
            this.host.bloomPass.radius = 0.5;
            this.host.bloomPass.threshold = 0.45;
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), 380);
        } else if (focusType === 'galaxy' || focusType === 'galaxy-cluster') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.26;
            this.host.bloomPass.radius = 0.5;
            this.host.bloomPass.threshold = 0.62;
            this.host.controls.maxDistance = 640;
            // slightly elevated view to read the disk / cluster layout
            this.host.flyCameraToPos(
                new THREE.Vector3(0, focusType === 'galaxy-cluster' ? 150 : 88, focusType === 'galaxy-cluster' ? 300 : 175),
                new THREE.Vector3(0, 0, 0)
            );
        } else if (focusType === 'nebula') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.4;
            this.host.bloomPass.radius = 0.62;
            this.host.bloomPass.threshold = 0.38;
            this.host.controls.maxDistance = 520;
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), 265);
        } else if (focusType === 'planetary-nebula') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.5;
            this.host.bloomPass.radius = 0.5;
            this.host.bloomPass.threshold = 0.4;
            this.host.controls.maxDistance = 420;
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), 185);
        } else if (focusType === 'globular-cluster' || focusType === 'open-cluster') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.42;
            this.host.bloomPass.radius = 0.48;
            this.host.bloomPass.threshold = 0.4;
            this.host.controls.maxDistance = 480;
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), focusType === 'globular-cluster' ? 210 : 240);
        } else if (focusType === 'generic-star' || focusType === 'red-dwarf') {
            this.host.useBloom = true;
            this.host.bloomPass.strength = 0.4;
            this.host.bloomPass.radius = 0.5;
            this.host.bloomPass.threshold = 0.46;
            this.host.controls.maxDistance = 420;
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), 200);
        } else {
            this.host.flyCameraTo(new THREE.Vector3(0, 0, 0), 230);
        }

        this._updateFocusTimeHint();
        this._syncHost();
    }

    clear() {
        if (!this.focusGroup && !this.focusRenderer && !this.focusSpecialRenderer) {
            this._forceCleanup();
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
        this.focusedType = null;
        this._forceCleanup();
        this._syncHost();
    }

    /** Ensure no state leaks regardless of partial clear() calls. */
    _forceCleanup() {
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
        if (this.host.controls) {
            this.host.controls.minDistance = 18;
            this.host.controls.maxDistance = this.host.getModeConfig().maxDistance;
        }
        // Hide time scale hint
        const hint = document.getElementById('focus-time-hint');
        if (hint) hint.classList.add('hidden');
    }

    update(deltaSeconds, time) {
        if (!this.focusGroup) return;

        const focusTitle = this.focusGroup.children.find((child) => child.userData?.effectRole === 'focus-title');
        if (focusTitle) focusTitle.visible = !document.body.classList.contains('ui-hidden');

        const effectType = this.focusedType;
        if (!['black-hole', 'pulsar', 'supernova', 'sun', 'planet-gas', 'planet-ice', 'comet', 'galaxy', 'galaxy-cluster', 'nebula', 'planetary-nebula', 'globular-cluster', 'open-cluster'].includes(effectType)) {
            this.focusGroup.rotation.y += deltaSeconds * 0.08;
        }
        if ([
            'pulsar',
            'supernova',
            'red-giant',
            'white-dwarf',
            'sun',
            'planet-terrestrial',
            'planet-gas',
            'planet-ice',
            'dwarf-planet',
            'moon',
            'comet',
            'galaxy',
            'galaxy-cluster',
            'nebula',
            'planetary-nebula',
            'globular-cluster',
            'open-cluster',
            'generic-star',
            'red-dwarf'
        ].includes(effectType)) {
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
        this._updateFocusTimeHint();
    }

    onResize(width, height) {
        this.focusRenderer?.setSize?.(width, height);
    }

    renderIfOwning(camera, blackHoleConfig, time, aspect) {
        if (!this.focusRenderer) return false;
        this.focusRenderer.update(camera, blackHoleConfig, time, aspect);
        return true;
    }

    _updateFocusTimeHint() {
        const hint = document.getElementById('focus-time-hint');
        if (!hint) return;
        if (this.focusedCatalogEntry && this.host.timeScale > 0) {
            hint.textContent = '当前 1 天 = ' + this.host.timeScale.toLocaleString() + ' 秒';
            hint.classList.remove('hidden');
        } else if (this.focusedCatalogEntry && this.host.timeScale === 0) {
            hint.textContent = '暂停';
            hint.classList.remove('hidden');
        } else {
            hint.classList.add('hidden');
        }
    }

    _syncHost() {
        this.host.focusGroup = this.focusGroup;
        this.host.focusedCatalogEntry = this.focusedCatalogEntry;
        this.host.focusRenderer = this.focusRenderer;
        this.host.focusSpecialRenderer = this.focusSpecialRenderer;
    }
}
