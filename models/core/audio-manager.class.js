import GAME_AUDIO from "./game-audio.config.js";

export default class AudioManager {
  constructor({ initialMusicMuted = false, initialSfxMuted = false } = {}) {
    this.musicMuted = initialMusicMuted;
    this.sfxMuted = initialSfxMuted;
    this.music = null;
    this.gameOverMusic = null;
    this.victoryMusic = null;
    this.musicPath = null;
    this.gameOverMusicPath = GAME_AUDIO.gameOverMusicPath;
    this.victoryMusicPath = GAME_AUDIO.victoryMusicPath;
    this.attackSoundPath = GAME_AUDIO.attackSoundPath;
    this.landingHitSoundPath = GAME_AUDIO.landingHitSoundPath;
    this.getHurtSoundPath = GAME_AUDIO.getHurtSoundPath;
    this.fireMagicSoundPath = GAME_AUDIO.fireMagicSoundPath;
    this.fireHitSoundPath = GAME_AUDIO.fireHitSoundPath;
    this.collectItemSoundPath = GAME_AUDIO.collectItemSoundPath;
    this.wolfHowlSoundPath = GAME_AUDIO.wolfHowlSoundPath;
    this.wolfBiteSoundPath = GAME_AUDIO.wolfBiteSoundPath;
    this.musicVolume = 0.35;
    this.gameOverMusicVolume = 0.5;
    this.victoryMusicVolume = 0.35;
    this.unlocked = false;
    this.pendingMusicPlay = false;
  }

  /** Enables playback after the first user gesture. */
  unlock() {
    if (this.unlocked) {
      return;
    }

    this.unlocked = true;
    if (this.pendingMusicPlay && !this.musicMuted) {
      this.playMusic();
    }
  }

  /** Creates or updates a track instance and applies loop/volume/restart settings. */
  configureAudioTrack({ audioKey, pathKey, path, loop, volume, restart, volumeKey }) {
    if (!path) {
      return null;
    }

    const hasChanged = this[pathKey] !== path;
    if (!this[audioKey] || hasChanged) {
      if (this[audioKey]) {
        this[audioKey].pause();
      }

      this[audioKey] = new Audio(path);
      this[audioKey].preload = "auto";
      this[pathKey] = path;
    }

    this[audioKey].loop = loop;
    this[volumeKey] = volume;
    this[audioKey].volume = volume;

    if (restart) {
      this[audioKey].currentTime = 0;
    }

    return this[audioKey];
  }
  /** Configures the normal background music track. */
  setMusicTrack(path, { loop = true, volume = 0.35, restart = false } = {}) {
    const music = this.configureAudioTrack({
      audioKey: "music",
      pathKey: "musicPath",
      path,
      loop,
      volume,
      restart,
      volumeKey: "musicVolume",
    });

    if (music) {
      music.muted = this.musicMuted;
    }
  }

  /** Starts background music or defers playback until audio is unlocked. */
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

  /** Configures the victory music track. */
  setVictoryMusicTrack(path, { loop = true, volume = 0.35, restart = false } = {}) {
    this.configureAudioTrack({
      audioKey: "victoryMusic",
      pathKey: "victoryMusicPath",
      path,
      loop,
      volume,
      restart,
      volumeKey: "victoryMusicVolume",
    });
  }

  /** Configures the game-over music track. */
  setGameOverMusicTrack(path, { loop = true, volume = 0.5, restart = false } = {}) {
    this.configureAudioTrack({
      audioKey: "gameOverMusic",
      pathKey: "gameOverMusicPath",
      path,
      loop,
      volume,
      restart,
      volumeKey: "gameOverMusicVolume",
    });
  }

  /** Plays victory/game-over music by key and optionally pauses background music. */
  playSpecialMusic({
    audioKey,
    pathKey,
    volumeKey,
    setTrack,
    warnLabel,
    stopBackgroundMusic = true,
  }) {
    if (stopBackgroundMusic && this.music) {
      this.pauseMusic();
    }

    if (!this[audioKey]) {
      setTrack.call(this, this[pathKey]);
    }

    if (!this[audioKey] || this.musicMuted || !this.unlocked) {
      return;
    }

    this[audioKey].currentTime = 0;
    this[audioKey].volume = this[volumeKey];
    const playPromise = this[audioKey].play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
        console.warn(`${warnLabel} playback failed:`, this[pathKey], error);
      });
    }
  }

  /** Plays game-over music. */
  playGameOverMusic() {
    this.playSpecialMusic({
      audioKey: "gameOverMusic",
      pathKey: "gameOverMusicPath",
      volumeKey: "gameOverMusicVolume",
      setTrack: this.setGameOverMusicTrack,
      warnLabel: "Game-over music",
    });
  }

  /** Plays victory music. */
  playVictoryMusic() {
    this.playSpecialMusic({
      audioKey: "victoryMusic",
      pathKey: "victoryMusicPath",
      volumeKey: "victoryMusicVolume",
      setTrack: this.setVictoryMusicTrack,
      warnLabel: "Victory music",
    });
  }

  /** Stops game-over music and rewinds to start. */
  stopGameOverMusic() {
    if (!this.gameOverMusic) {
      return;
    }

    this.gameOverMusic.pause();
    this.gameOverMusic.currentTime = 0;
  }

  /** Stops victory music and rewinds to start. */
  stopVictoryMusic() {
    if (!this.victoryMusic) {
      return;
    }

    this.victoryMusic.pause();
    this.victoryMusic.currentTime = 0;
  }

  /** Pauses background music if available. */
  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  /** Resumes background music when not muted. */
  resumeMusic() {
    if (this.musicMuted) {
      return;
    }

    this.playMusic();
  }

  /** Stops and rewinds background music, then clears pending playback. */
  stopMusic() {
    if (!this.music) {
      return;
    }

    this.music.pause();
    this.music.currentTime = 0;
    this.pendingMusicPlay = false;
  }

  /** Toggles music mute state and returns whether music is enabled. */
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

  /** Toggles SFX mute state and returns whether SFX is enabled. */
  toggleSfx() {
    this.sfxMuted = !this.sfxMuted;
    return !this.sfxMuted;
  }

  /** Creates an Audio instance for one-shot SFX playback. */
  createSfxAudio(path, volume) {
    const sfx = new Audio(path);
    sfx.preload = "auto";
    sfx.volume = volume;
    return sfx;
  }

  /** Plays audio and ignores rejected play promises. */
  safePlayAudio(audio) {
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => null);
    }
  }

  /** Auto-stops an SFX after maxDurationMs (if provided). */
  scheduleSfxStop(sfx, maxDurationMs) {
    if (!Number.isFinite(maxDurationMs) || maxDurationMs <= 0) {
      return;
    }

    setTimeout(() => {
      sfx.pause();
      sfx.currentTime = 0;
    }, maxDurationMs);
  }

  /** Seeks SFX to startTimeSec once metadata is available. */
  setSfxStartTime(sfx, startTimeSec) {
    if (!Number.isFinite(startTimeSec) || startTimeSec <= 0) {
      return;
    }

    const applyStartTime = () => {
      try {
        sfx.currentTime = startTimeSec;
      } catch {
        // Ignore seek errors; playback can still continue from start.
      }
    };

    if (sfx.readyState >= 1) {
      applyStartTime();
      return;
    }

    sfx.addEventListener("loadedmetadata", applyStartTime, { once: true });
  }

  /** Plays an SFX with optional volume, start offset, and max duration. */
  playSfx(path, { volume = 0.5, maxDurationMs = null, startTimeSec = 0 } = {}) {
    if (!path || this.sfxMuted || !this.unlocked) {
      return null;
    }

    const sfx = this.createSfxAudio(path, volume);
    this.setSfxStartTime(sfx, startTimeSec);
    this.safePlayAudio(sfx);
    this.scheduleSfxStop(sfx, maxDurationMs);

    return sfx;
  }

  /** Temporarily lowers music volume while menu is open. */
  decreaseVolumeOnMenuOpen() {
    this.musicVolume = this.music?.volume ?? 0.35;
    if (this.music) {
      this.music.volume = 0.25;
    }
  }

  /** Restores music volume after closing the menu. */
  increaseVolumeOnMenuClose() {
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
  }

}
