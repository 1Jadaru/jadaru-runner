import { DEBUG } from '../core/config.js';

/**
 * Audio system for sound effects and music
 * Note: This is a placeholder implementation for future audio integration
 */
export class AudioSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.audioContext = null;
    this.sounds = new Map();
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.muted = false;
    
    this.init();
  }
  
  /**
   * Initialize audio system
   */
  init() {
    // Initialize Web Audio API if available
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (DEBUG) console.log('Audio system initialized');
    } catch (error) {
      console.warn('Web Audio API not available:', error);
    }
    
    this.createAudioControls();
  }
  
  /**
   * Create audio control UI
   */
  createAudioControls() {
    const controls = document.createElement('div');
    controls.id = 'audio-controls';
    controls.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 15;
      color: #00ffcc;
      font-family: monospace;
      font-size: 0.8rem;
    `;
    
    controls.innerHTML = `
      <button id="mute-btn" style="
        background: rgba(0,255,204,0.2);
        border: 1px solid #00ffcc;
        color: #00ffcc;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        margin-bottom: 5px;
      ">🔊</button>
      <br>
      <label>Music: <input type="range" id="music-volume" min="0" max="1" step="0.1" value="0.5"></label>
      <br>
      <label>SFX: <input type="range" id="sfx-volume" min="0" max="1" step="0.1" value="0.7"></label>
    `;
    
    document.body.appendChild(controls);
    
    // Bind events
    document.getElementById('mute-btn').onclick = () => this.toggleMute();
    document.getElementById('music-volume').oninput = (e) => this.setMusicVolume(e.target.value);
    document.getElementById('sfx-volume').oninput = (e) => this.setSfxVolume(e.target.value);
  }
  
  /**
   * Play a sound effect
   */
  playSound(soundName, volume = 1.0) {
    if (this.muted || !this.audioContext) return;
    
    // Synthesized sound effects using Web Audio API
    switch (soundName) {
      case 'jump':
        this.playJumpSound(volume);
        break;
      case 'collision':
        this.playCollisionSound(volume);
        break;
      case 'score':
        this.playScoreSound(volume);
        break;
      case 'gameOver':
        this.playGameOverSound(volume);
        break;
      default:
        console.warn(`Unknown sound: ${soundName}`);
    }
  }
  
  /**
   * Play jump sound effect
   */
  playJumpSound(volume) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }
  
  /**
   * Play collision sound effect
   */
  playCollisionSound(volume) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const noiseBuffer = this.createNoiseBuffer(0.3);
    const noiseSource = this.audioContext.createBufferSource();
    
    noiseSource.buffer = noiseBuffer;
    oscillator.connect(gainNode);
    noiseSource.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    noiseSource.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
    noiseSource.stop(this.audioContext.currentTime + 0.3);
  }
  
  /**
   * Play score sound effect
   */
  playScoreSound(volume) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(volume * this.sfxVolume * 0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }
  
  /**
   * Play game over sound effect
   */
  playGameOverSound(volume) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 1.0);
    
    gainNode.gain.setValueAtTime(volume * this.sfxVolume * 0.7, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 1.0);
  }
  
  /**
   * Create noise buffer for sound effects
   */
  createNoiseBuffer(duration) {
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }
  
  /**
   * Start background music (placeholder)
   */
  startBackgroundMusic() {
    if (DEBUG) console.log('Background music would start here');
    // Could generate procedural ambient music
  }
  
  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (DEBUG) console.log('Background music stopped');
  }
  
  /**
   * Toggle mute
   */
  toggleMute() {
    this.muted = !this.muted;
    const btn = document.getElementById('mute-btn');
    if (btn) {
      btn.textContent = this.muted ? '🔇' : '🔊';
    }
  }
  
  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.musicVolume = parseFloat(volume);
  }
  
  /**
   * Set SFX volume
   */
  setSfxVolume(volume) {
    this.sfxVolume = parseFloat(volume);
  }
  
  /**
   * Update audio system
   */
  update() {
    // Handle any per-frame audio updates
  }
  
  /**
   * Resume audio context (required for user interaction)
   */
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
  
  /**
   * Reset audio system
   */
  reset() {
    // Reset any ongoing audio
  }
  
  /**
   * Dispose audio system
   */
  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    const controls = document.getElementById('audio-controls');
    if (controls) {
      controls.remove();
    }
  }
}
