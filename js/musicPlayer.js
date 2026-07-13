/**
 * Local music player.
 * Browsers cannot read arbitrary local paths, so the player uses bundled relative files or user upload.
 */

class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.currentIndex = -1;
        this.isPlaying = false;
        this.disposed = false;

        this.uploadBtn = document.getElementById('music-upload');
        this.playBtn = document.getElementById('music-play');
        this.prevBtn = document.getElementById('music-prev');
        this.nextBtn = document.getElementById('music-next');
        this.fileInput = document.getElementById('music-file');
        this.trackInfo = document.getElementById('music-track-info');
        this.progressFill = document.getElementById('music-progress');
        this.progressBar = document.querySelector('.progress-bar');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volume-slider');
        this.playlistContainer = document.getElementById('music-playlist');

        this.init();
    }

    init() {
        this.audio.volume = 0.7;
        this.loadBundledTracks();

        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (event) => this.handleFiles(event.target.files));
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        this.volumeSlider.addEventListener('input', (event) => this.setVolume(event.target.value));
        this.progressBar.addEventListener('click', (event) => this.seek(event));

        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.next());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updateButtons();
        });
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updateButtons();
        });
        window.addEventListener('pagehide', () => this.dispose(), { once: true });
    }

    loadBundledTracks() {
        const tracks = [
            'First Step.mp3',
            'Cornfield Chase.mp3',
            'Flying Drone.mp3',
            'Dust.mp3',
            'Day One.mp3',
            'The Wormhole.mp3',
            'Mountains.mp3',
            'Organ Variation.mp3',
            'Tick-Tock.mp3',
            'No Time For Caution.mp3',
            'S.T.A.Y.mp3'
        ];

        this.playlist = tracks.map((fileName) => ({
            file: null,
            name: fileName.replace(/\.[^/.]+$/, ''),
            url: `music/${encodeURIComponent(fileName)}`
        }));

        if (this.playlist.length) {
            this.currentIndex = 0;
            this.audio.src = this.playlist[0].url;
            this.trackInfo.textContent = this.playlist[0].name;
        }

        this.updatePlaylistUI();
        this.updateButtons();
    }

    handleFiles(files) {
        Array.from(files).forEach((file) => {
            const hasAudioType = file.type.startsWith('audio/');
            const hasAudioExtension = /\.(mp3|m4a|aac|wav|ogg|flac)$/i.test(file.name);
            if (!hasAudioType && !hasAudioExtension) return;
            this.playlist.push({
                file,
                name: file.name.replace(/\.[^/.]+$/, ''),
                url: URL.createObjectURL(file)
            });
        });

        this.updatePlaylistUI();
        this.updateButtons();

        if (this.currentIndex === -1 && this.playlist.length) {
            this.play(0);
        }
    }

    async play(index = this.currentIndex) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentIndex = index;
        const track = this.playlist[index];
        const resolvedUrl = new URL(track.url, document.baseURI).href;
        if (this.audio.src !== resolvedUrl) {
            this.audio.src = track.url;
        }

        this.trackInfo.textContent = track.name;
        this.updatePlaylistUI();

        try {
            await this.audio.play();
        } catch {
            this.isPlaying = false;
            this.updateButtons();
        }
    }

    togglePlay() {
        if (!this.playlist.length) return;
        if (this.currentIndex === -1) {
            this.play(0);
            return;
        }
        if (this.audio.paused) this.play(this.currentIndex);
        else this.audio.pause();
    }

    next() {
        if (!this.playlist.length) return;
        this.play((this.currentIndex + 1) % this.playlist.length);
    }

    prev() {
        if (!this.playlist.length) return;
        this.play((this.currentIndex - 1 + this.playlist.length) % this.playlist.length);
    }

    seek(event) {
        if (!Number.isFinite(this.audio.duration)) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const percent = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        this.audio.currentTime = percent * this.audio.duration;
    }

    setVolume(value) {
        this.audio.volume = Number(value) / 100;
    }

    updateProgress() {
        if (!Number.isFinite(this.audio.duration)) return;
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }

    updateDuration() {
        this.durationEl.textContent = this.formatTime(this.audio.duration);
    }

    updateButtons() {
        const hasTracks = this.playlist.length > 0;
        this.playBtn.disabled = !hasTracks;
        this.prevBtn.disabled = !hasTracks;
        this.nextBtn.disabled = !hasTracks;
        this.playBtn.querySelector('.icon').textContent = this.isPlaying ? 'Ⅱ' : '▶';
    }

    updatePlaylistUI() {
        if (!this.playlist.length) {
            this.playlistContainer.classList.add('hidden');
            return;
        }

        this.playlistContainer.classList.remove('hidden');
        this.playlistContainer.innerHTML = '';
        this.playlist.forEach((track, index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = `playlist-item ${index === this.currentIndex ? 'active' : ''}`;
            const number = document.createElement('span');
            number.className = 'track-num';
            number.textContent = String(index + 1);
            const name = document.createElement('span');
            name.className = 'track-name';
            name.textContent = track.name;
            item.append(number, name);
            item.addEventListener('click', () => this.play(index));
            this.playlistContainer.appendChild(item);
        });
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.audio.pause();
        this.playlist.forEach((track) => {
            if (track.file) URL.revokeObjectURL(track.url);
        });
    }

    formatTime(seconds) {
        if (!Number.isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }
}

let musicPlayer;
document.addEventListener('DOMContentLoaded', () => {
    musicPlayer = new MusicPlayer();
});
