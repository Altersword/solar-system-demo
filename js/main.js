/**
 * UI entry point.
 */

document.addEventListener('DOMContentLoaded', () => {
    initUIControls();
    // Prefer SolarSystem to hide loading after init; keep a hard fallback.
    window.setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading && loading.style.display !== 'none') hideLoading();
    }, 2500);
});

function initUIControls() {
    const timeSlider = document.getElementById('time-slider');
    const timeDisplay = document.getElementById('time-display');
    const elapsedDays = document.getElementById('elapsed-days');
    const modeName = document.getElementById('mode-name');
    const modeDescription = document.getElementById('mode-description');
    const atlasMapName = document.getElementById('atlas-map-name');
    const atlasMapRange = document.getElementById('atlas-map-range');
    const scaleButtons = document.querySelectorAll('.segmented button');
    const atlasButtons = document.querySelectorAll('.atlas-switch button');
    const atlasSearchInput = document.getElementById('atlas-search-input');
    const atlasTypeFilter = document.getElementById('atlas-type-filter');
    const atlasSearchResults = document.getElementById('atlas-search-results');
    const timeScales = SIMULATION.timeScales;
    let displayedElapsedDays = null;

    function applyTimeScale() {
        const index = Number(timeSlider.value);
        const scale = timeScales[index] ?? 1;
        solarSystem?.setTimeScale(scale);
        timeDisplay.textContent = scale === 0 ? '暂停' : `${scale.toLocaleString()} 天/秒`;
    }

    function refreshElapsedDays() {
        if (!solarSystem) return;
        const nextElapsedDays = Math.floor(solarSystem.elapsedDays);
        if (nextElapsedDays === displayedElapsedDays) return;
        displayedElapsedDays = nextElapsedDays;
        elapsedDays.textContent = `${nextElapsedDays.toLocaleString()} 天`;
    }

    timeSlider.max = String(timeScales.length - 1);
    timeSlider.addEventListener('input', applyTimeScale);
    applyTimeScale();
    refreshElapsedDays();
    const elapsedTimer = window.setInterval(refreshElapsedDays, 250);
    window.addEventListener('pagehide', () => window.clearInterval(elapsedTimer), { once: true });

    document.getElementById('btn-time-slower').addEventListener('click', () => {
        timeSlider.value = String(Math.max(0, Number(timeSlider.value) - 1));
        applyTimeScale();
    });

    document.getElementById('btn-time-faster').addEventListener('click', () => {
        timeSlider.value = String(Math.min(timeScales.length - 1, Number(timeSlider.value) + 1));
        applyTimeScale();
    });

    document.getElementById('btn-pause').addEventListener('click', function () {
        const isPaused = solarSystem?.togglePause();
        this.querySelector('.icon').textContent = isPaused ? '▶' : 'Ⅱ';
        this.querySelector('.text').textContent = isPaused ? '播放' : '暂停';
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        solarSystem?.resetCamera();
    });

    document.getElementById('btn-labels').addEventListener('click', function () {
        const showLabels = solarSystem?.toggleLabels();
        this.classList.toggle('active', Boolean(showLabels));
    });

    document.getElementById('btn-orbits').addEventListener('click', function () {
        const showOrbits = solarSystem?.toggleOrbits();
        this.classList.toggle('active', Boolean(showOrbits));
    });

    document.getElementById('btn-atlas').addEventListener('click', function () {
        const showAtlas = solarSystem?.toggleAtlas();
        this.classList.toggle('active', Boolean(showAtlas));
    });

    document.getElementById('btn-effects').addEventListener('click', function () {
        const enhanced = solarSystem?.toggleEffects();
        this.classList.toggle('active', Boolean(enhanced));
    });

    document.getElementById('btn-ui').addEventListener('click', () => {
        document.body.classList.toggle('ui-hidden');
    });

    document.getElementById('btn-drag-mode').addEventListener('click', function () {
        const panMode = solarSystem?.togglePanDragMode();
        this.classList.toggle('active', Boolean(panMode));
        this.querySelector('.text').textContent = panMode ? '平移中' : '平移';
        this.title = panMode ? '左键拖拽：平移空间位置；右键旋转视角' : '左键拖拽：旋转视角';
    });

    document.getElementById('close-info').addEventListener('click', () => {
        solarSystem?.hideInfoPanel();
    });

    document.getElementById('btn-close-expanded').addEventListener('click', () => {
        solarSystem?.closeExpandedSystemView();
    });

    document.getElementById('btn-focus-object').addEventListener('click', () => {
        solarSystem?.focusSelectedSpecialObject();
    });

    scaleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;
            solarSystem?.setDisplayMode(mode);
            scaleButtons.forEach((item) => item.classList.toggle('active', item === button));
            modeName.textContent = SIMULATION.displayModes[mode].name;
            modeDescription.textContent = SIMULATION.displayModes[mode].description;
        });
    });

    atlasButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const mapId = button.dataset.atlasMap;
            solarSystem?.setAtlasMap(mapId);
            atlasButtons.forEach((item) => item.classList.toggle('active', item === button));
            atlasMapName.textContent = SIMULATION.atlasMaps[mapId].name;
            atlasMapRange.textContent = SIMULATION.atlasMaps[mapId].rangeLabel;
        });
    });

    let atlasSearchTimer = null;

    function refreshAtlasSearch() {
        if (!atlasSearchResults || !solarSystem) return;
        const query = atlasSearchInput?.value.trim() || '';
        const type = atlasTypeFilter?.value || 'all';
        const results = solarSystem.searchCatalog(query, type, 8);
        atlasSearchResults.replaceChildren();
        if (!query && type === 'all') return;
        if (!results.length) {
            const emptyState = document.createElement('span');
            emptyState.className = 'atlas-search-empty';
            emptyState.textContent = '\u6ca1\u6709\u5339\u914d\u76ee\u6807';
            atlasSearchResults.appendChild(emptyState);
            return;
        }
        results.forEach((entry) => {
            const button = document.createElement('button');
            const title = document.createElement('strong');
            const meta = document.createElement('small');
            button.type = 'button';
            button.className = 'atlas-result';
            title.textContent = entry.name;
            meta.textContent = `${entry.type} \u00b7 ${entry.nameEn || ''}`;
            if (entry.dataQuality === 'synthetic') {
                const badge = document.createElement('span');
                badge.className = 'atlas-data-badge';
                badge.textContent = '\u6a21\u62df';
                meta.prepend(badge);
            }
            button.append(title, meta);
            button.addEventListener('click', () => {
                if (!solarSystem.selectCatalogEntry(entry.id)) return;
                atlasSearchInput.value = entry.name;
                atlasSearchResults.replaceChildren();
            });
            atlasSearchResults.appendChild(button);
        });
    }

    function scheduleAtlasSearch() {
        window.clearTimeout(atlasSearchTimer);
        atlasSearchTimer = window.setTimeout(refreshAtlasSearch, 120);
    }

    atlasSearchInput?.addEventListener('input', scheduleAtlasSearch);
    atlasTypeFilter?.addEventListener('change', refreshAtlasSearch);

    document.addEventListener('keydown', (event) => {
        if (event.target?.matches?.('input, textarea, select, [contenteditable="true"]')) return;

        switch (event.key.toLowerCase()) {
            case ' ':
                event.preventDefault();
                if (document.body.classList.contains('ui-hidden')) {
                    document.body.classList.remove('ui-hidden');
                } else {
                    document.getElementById('btn-pause').click();
                }
                break;
            case 'r':
                document.getElementById('btn-reset').click();
                break;
            case 'l':
                document.getElementById('btn-labels').click();
                break;
            case 'o':
                document.getElementById('btn-orbits').click();
                break;
            case 's':
                document.getElementById('btn-atlas').click();
                break;
            case 'e':
                document.getElementById('btn-effects').click();
                break;
            case 'h':
                document.getElementById('btn-ui').click();
                break;
            case 'p':
                document.getElementById('btn-drag-mode').click();
                break;
            case 'escape':
                if (document.body.classList.contains('ui-hidden')) {
                    document.body.classList.remove('ui-hidden');
                } else {
                    solarSystem?.hideInfoPanel();
                }
                break;
            case '+':
            case '=':
                document.getElementById('btn-time-faster').click();
                break;
            case '-':
                document.getElementById('btn-time-slower').click();
                break;
        }
    });

    document.getElementById('btn-labels').classList.add('active');
    document.getElementById('btn-orbits').classList.add('active');
    document.getElementById('btn-atlas').classList.add('active');
    document.getElementById('btn-effects').classList.add('active');
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (!loading || loading.dataset.hidden === '1') return;
    loading.dataset.hidden = '1';
    loading.classList.add('hidden');
    window.setTimeout(() => {
        loading.style.display = 'none';
    }, 450);
}

window.hideLoading = hideLoading;
