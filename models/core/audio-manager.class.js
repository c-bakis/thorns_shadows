export default class AudioManager {
  constructor({ initialMusicMuted = false, initialSfxMuted = false } = {}) {
    this.musicMuted = initialMusicMuted;
    this.sfxMuted = initialSfxMuted;
    this.music = null;
    this.musicPath = null;
    this.musicVolume = 0.35;
    this.unlocked = false;
    this.pendingMusicPlay = false;
  }

  unlock() {
    if (this.unlocked) {
      return;
    }

    this.unlocked = true;
    if (this.pendingMusicPlay && !this.musicMuted) {
      this.playMusic();
    }
  }

  setMusicTrack(path, { loop = true, volume = 0.35, restart = false } = {}) {
    if (!path) {
      return;
    }

    const hasChanged = this.musicPath !== path;
    if (!this.music || hasChanged) {
      if (this.music) {
        this.music.pause();
      }

      this.music = new Audio(path);
      this.music.preload = "auto";
      this.musicPath = path;
    }

    this.music.loop = loop;
    this.musicVolume = volume;
    this.music.volume = volume;
    this.music.muted = this.musicMuted;

    if (restart) {
      this.music.currentTime = 0;
    }
  }

  playMusic() {
    if (!this.music || this.musicMuted) {
      this.pendingMusicPlay = !this.musicMuted;
      return;
    }

    if (!this.unlocked) {
      this.pendingMusicPlay = true;
      return;
    }

    const playPromise = this.music.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
        console.warn("Music playback failed:", this.musicPath, error);
        this.pendingMusicPlay = true;
      });
    }

    this.pendingMusicPlay = false;
  }

  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  resumeMusic() {
    if (this.musicMuted) {
      return;
    }

    this.playMusic();
  }

  stopMusic() {
    if (!this.music) {
      return;
    }

    this.music.pause();
    this.music.currentTime = 0;
    this.pendingMusicPlay = false;
  }

  toggleMusic() {
    this.musicMuted = !this.musicMuted;

    if (this.music) {
      this.music.muted = this.musicMuted;
    }

    if (this.musicMuted) {
      this.pauseMusic();
    } else {
      this.resumeMusic();
    }

    return !this.musicMuted;
  }

  toggleSfx() {
    this.sfxMuted = !this.sfxMuted;
    return !this.sfxMuted;
  }

  playSfx(path, { volume = 0.7 } = {}) {
    if (!path || this.sfxMuted || !this.unlocked) {
      return null;
    }

    const sfx = new Audio(path);
    sfx.preload = "auto";
    sfx.volume = volume;

    const playPromise = sfx.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => null);
    }

    return sfx;
  }
}
