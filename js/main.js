/**
 * UI 入口。
 */

document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => {
        initUIControls();
        hideLoading();
    }, 350);
});

function initUIControls() {
    const timeSlider = document.getElementById('time-slider');
    const timeDisplay = document.getElementById('time-display');
    const elapsedDays = document.getElementById('elapsed-days');
    const modeName = document.getElementById('mode-name');
    const modeDescription = document.getElementById('mode-description');
    const scaleButtons = document.querySelectorAll('.segmented button');
    const timeScales = SIMULATION.timeScales;

    function applyTimeScale() {
        const index = Number(timeSlider.value);
        const scale = timeScales[index] ?? 1;
        solarSystem?.setTimeScale(scale);
        timeDisplay.textContent = scale === 0 ? '暂停' : `${scale.toLocaleString()} 天/秒`;
    }

    function refreshElapsedDays() {
        if (!solarSystem) return;
        elapsedDays.textContent = `${Math.floor(solarSystem.elapsedDays).toLocaleString()} 天`;
        window.requestAnimationFrame(refreshElapsedDays);
    }

    timeSlider.max = String(timeScales.length - 1);
    timeSlider.addEventListener('input', applyTimeScale);
    applyTimeScale();
    refreshElapsedDays();

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
        this.querySelector('.icon').textContent = isPaused ? '▶' : '⏸';
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

    document.getElementById('close-info').addEventListener('click', () => {
        solarSystem?.hideInfoPanel();
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

    document.addEventListener('keydown', (event) => {
        if (event.target?.matches?.('input, button')) return;

        switch (event.key.toLowerCase()) {
            case ' ':
                event.preventDefault();
                document.getElementById('btn-pause').click();
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
            case 'escape':
                solarSystem?.hideInfoPanel();
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
}

function hideLoading() {
    const loading = document.getElementById('loading');
    loading.classList.add('hidden');
    window.setTimeout(() => {
        loading.style.display = 'none';
    }, 450);
}
