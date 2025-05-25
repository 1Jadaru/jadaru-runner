// Game Configuration
const CONFIG = {
  FORCE_MAGNITUDE: 2,
  PHYSICS: {
    GRAVITY: -9.81,
    PLAYER_MASS: 2,
    PLAYER_RESTITUTION: 0.3,
    PLAYER_FRICTION: 0.9,
    GROUND_RESTITUTION: 0.7,
    GROUND_FRICTION: 0.7
  },
  RENDERING: {
    SHADOW_MAP_SIZE: 1024,
    PARTICLE_COUNT: 2000,
    QUALITY_SETTINGS: {
      low: { shadows: false, particles: 500, textures: false },
      medium: { shadows: true, particles: 1000, textures: true },
      high: { shadows: true, particles: 2000, textures: true, postProcessing: true }
    }
  },
  GAME: {
    INITIAL_COINS: 5,
    COINS_TO_WIN: 20,
    LEVEL_PROGRESSION: [
      { level: 1, coinsNeeded: 5, timeLimit: null, obstacles: 1 },
      { level: 2, coinsNeeded: 10, timeLimit: 60, obstacles: 2 },
      { level: 3, coinsNeeded: 15, timeLimit: 45, obstacles: 3 },
      { level: 4, coinsNeeded: 20, timeLimit: 30, obstacles: 4 }
    ],
    POWERUPS: {
      SPEED: { duration: 5000, multiplier: 2, color: [1, 0.5, 0] },
      JUMP: { duration: 8000, multiplier: 1.5, color: [0, 1, 0.5] },
      MAGNET: { duration: 10000, range: 3, color: [1, 0, 1] },
      SHIELD: { duration: 15000, color: [0, 0.5, 1] }
    }
  },
  ASSETS: {
    TEXTURES: {
      GRASS: "https://assets.babylonjs.com/environments/grass.jpg",
      WOOD: "https://assets.babylonjs.com/environments/wood.jpg",
      PARTICLE: "https://playground.babylonjs.com/textures/flare.png",
      SKYBOX: "https://playground.babylonjs.com/textures/skybox"
    },
    SOUNDS: {
      COIN_COLLECT: "https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7bfa.mp3",
      POWERUP: "https://cdn.pixabay.com/audio/2021/08/09/audio_0625c1539c.mp3",
      JUMP: "https://cdn.pixabay.com/audio/2022/02/15/audio_f2d1b8f39f.mp3",
      LEVEL_UP: "https://cdn.pixabay.com/audio/2021/10/05/audio_4de7946db5.mp3"
    }
  }
};

// Performance monitoring system
class PerformanceMonitor {
  constructor() {
    this.frames = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.fpsHistory = [];
    this.maxFPSHistory = 60;
    this.isOptimizing = false;
  }

  update() {
    this.frames++;
    const now = performance.now();
    
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round(this.frames * 1000 / (now - this.lastTime));
      this.fpsHistory.push(this.fps);
      
      if (this.fpsHistory.length > this.maxFPSHistory) {
        this.fpsHistory.shift();
      }
      
      // Auto-optimize if performance is poor
      const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      if (avgFPS < 30 && !this.isOptimizing) {
        this.optimizePerformance();
      }
      
      this.frames = 0;
      this.lastTime = now;
    }
  }

  optimizePerformance() {
    this.isOptimizing = true;
    console.log('Performance issues detected, optimizing...');
    
    // Reduce quality automatically
    if (window.game && window.game.currentQuality !== 'low') {
      window.game.setQuality('low');
    }
    
    // Reduce particle count
    if (window.game && window.game.powerupManager) {
      window.game.powerupManager.optimizeParticles();
    }
    
    setTimeout(() => {
      this.isOptimizing = false;
    }, 5000);
  }

  getFPS() {
    return this.fps;
  }

  getAverageFPS() {
    return this.fpsHistory.length > 0 
      ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
      : 60;
  }
}

// Game State Management
class GameState {
  constructor() {
    this.score = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.startTime = Date.now();
    this.coinsCollected = 0;
    this.level = 1;
    this.powerupsUsed = 0;
    this.jumps = 0;
    this.bestTime = localStorage.getItem('bestTime') || null;
    this.totalGamesPlayed = parseInt(localStorage.getItem('totalGames')) || 0;
    this.activePowerups = new Map();
    this.qualitySetting = 'medium';
  }

  updateScore(points) {
    this.score += points;
    this.coinsCollected++;
  }

  getPlayTime() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  addPowerup(type, duration) {
    this.activePowerups.set(type, Date.now() + duration);
    this.powerupsUsed++;
  }

  removePowerup(type) {
    this.activePowerups.delete(type);
  }

  hasPowerup(type) {
    const expiry = this.activePowerups.get(type);
    if (expiry && Date.now() < expiry) {
      return true;
    } else if (expiry) {
      this.activePowerups.delete(type);
    }
    return false;
  }

  levelUp() {
    this.level++;
    const levelConfig = CONFIG.GAME.LEVEL_PROGRESSION[this.level - 1];
    return levelConfig;
  }

  saveStats() {
    const currentTime = this.getPlayTime();
    if (!this.bestTime || currentTime < this.bestTime) {
      this.bestTime = currentTime;
      localStorage.setItem('bestTime', this.bestTime);
    }
    this.totalGamesPlayed++;
    localStorage.setItem('totalGames', this.totalGamesPlayed);
  }

  reset() {
    this.score = 0;
    this.coinsCollected = 0;
    this.startTime = Date.now();
    this.isPlaying = true;
    this.isPaused = false;
    this.level = 1;
    this.powerupsUsed = 0;
    this.jumps = 0;
    this.activePowerups.clear();
  }
}

// Player Controller
class PlayerController {
  constructor(mesh, physicsImpostor, gameState) {
    this.mesh = mesh;
    this.physicsImpostor = physicsImpostor;
    this.gameState = gameState;
    this.movement = { left: false, right: false, up: false, down: false };
    this.altMovement = { w: false, a: false, s: false, d: false };
    this.forceMagnitude = CONFIG.FORCE_MAGNITUDE;
    this.setupControls();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Prevent arrow keys from scrolling the page
    window.addEventListener('keydown', (e) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }
    }, { passive: false });

    // Mobile touch controls
    this.setupMobileControls();
  }

  setupMobileControls() {
    const mobileControls = {
      mobileLeft: () => this.movement.left = true,
      mobileRight: () => this.movement.right = true,
      mobileUp: () => this.movement.up = true,
      mobileDown: () => this.movement.down = true,
      mobileJump: () => this.jump()
    };

    Object.entries(mobileControls).forEach(([id, action]) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('touchstart', action);
        element.addEventListener('touchend', () => {
          if (id !== 'mobileJump') {
            const direction = id.replace('mobile', '').toLowerCase();
            this.movement[direction] = false;
          }
        });
      }
    });
  }

  handleKeyDown(e) {
    switch(e.key.toLowerCase()) {
      case 'arrowleft':
      case 'a': this.movement.left = true; e.preventDefault(); break;
      case 'arrowright':
      case 'd': this.movement.right = true; e.preventDefault(); break;
      case 'arrowup':
      case 'w': this.movement.up = true; e.preventDefault(); break;
      case 'arrowdown':
      case 's': this.movement.down = true; e.preventDefault(); break;
      case ' ': this.jump(); e.preventDefault(); break;
      case 'p': window.togglePause?.(); break;
      case 'r': window.resetGame?.(); break;
    }
  }

  handleKeyUp(e) {
    switch(e.key.toLowerCase()) {
      case 'arrowleft':
      case 'a': this.movement.left = false; e.preventDefault(); break;
      case 'arrowright':
      case 'd': this.movement.right = false; e.preventDefault(); break;
      case 'arrowup':
      case 'w': this.movement.up = false; e.preventDefault(); break;
      case 'arrowdown':
      case 's': this.movement.down = false; e.preventDefault(); break;
    }
  }

  jump() {
    if (this.physicsImpostor) {
      const jumpMultiplier = this.gameState.hasPowerup('JUMP') ? 
        CONFIG.GAME.POWERUPS.JUMP.multiplier : 1;
      this.physicsImpostor.applyImpulse(
        new BABYLON.Vector3(0, 5 * jumpMultiplier, 0), 
        this.mesh.getAbsolutePosition()
      );
      this.gameState.jumps++;
      window.audioManager?.playSound('jump');
    }
  }

  update() {
    if (!this.physicsImpostor) return;

    let force = new BABYLON.Vector3(0, 0, 0);
    const speedMultiplier = this.gameState.hasPowerup('SPEED') ? 
      CONFIG.GAME.POWERUPS.SPEED.multiplier : 1;
    const currentForce = this.forceMagnitude * speedMultiplier;

    if (this.movement.left) force.x += currentForce;
    if (this.movement.right) force.x -= currentForce;
    if (this.movement.up) force.z -= currentForce;
    if (this.movement.down) force.z += currentForce;

    if (!force.equals(BABYLON.Vector3.Zero())) {
      this.physicsImpostor.applyImpulse(force, this.mesh.getAbsolutePosition());
    }

    return force;
  }

  reset() {
    this.mesh.position = new BABYLON.Vector3(0, 1, 0);
    if (this.physicsImpostor) {
      this.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
      this.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
    }
  }

  isMoving() {
    return this.movement.left || this.movement.right || this.movement.up || this.movement.down;
  }  setForceMagnitude(force) {
    this.forceMagnitude = force;
  }
}

// Powerup Manager
class PowerupManager {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.powerups = [];
    this.materials = this.createPowerupMaterials();
  }

  createPowerupMaterials() {
    const materials = {};
    Object.entries(CONFIG.GAME.POWERUPS).forEach(([type, config]) => {
      const material = new BABYLON.StandardMaterial(`powerup${type}Mat`, this.scene);
      material.diffuseColor = new BABYLON.Color3(...config.color);
      material.emissiveColor = new BABYLON.Color3(...config.color.map(c => c * 0.3));
      materials[type] = material;
    });
    return materials;
  }

  spawnPowerup() {
    const types = Object.keys(CONFIG.GAME.POWERUPS);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const x = Math.random() * 16 - 8;
    const z = Math.random() * 16 - 8;
    
    const powerup = BABYLON.MeshBuilder.CreateSphere(`powerup${type}`, {diameter: 0.8}, this.scene);
    powerup.position = new BABYLON.Vector3(x, 1, z);
    powerup.material = this.materials[type];
    powerup.powerupType = type;
    
    // Add floating animation
    powerup.floatAnimation = BABYLON.Animation.CreateAndStartAnimation(
      "powerupFloat", powerup, "position.y", 30, 0, 1, 1.5, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    
    // Add rotation animation
    powerup.rotationAnimation = BABYLON.Animation.CreateAndStartAnimation(
      "powerupRotation", powerup, "rotation", 30, 0, 
      new BABYLON.Vector3(0, 0, 0), 
      new BABYLON.Vector3(0, Math.PI * 2, 0), 
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    
    this.powerups.push(powerup);
  }

  checkCollisions(player) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      if (player.intersectsMesh(powerup, false)) {
        this.collectPowerup(i);
        return powerup.powerupType;
      }
    }
    return null;
  }

  collectPowerup(index) {
    if (this.powerups[index]) {
      const type = this.powerups[index].powerupType;
      const config = CONFIG.GAME.POWERUPS[type];
      
      this.powerups[index].dispose();
      this.powerups.splice(index, 1);
      
      this.gameState.addPowerup(type, config.duration);
      return type;
    }
    return null;
  }

  update() {
    // Randomly spawn powerups
    if (Math.random() < 0.002 && this.powerups.length < 3) {
      this.spawnPowerup();
    }
    
    // Check for expired powerups and apply magnet effect
    if (this.gameState.hasPowerup('MAGNET')) {
      this.applyMagnetEffect();
    }
  }

  applyMagnetEffect() {
    const player = this.scene.getMeshByName('player');
    if (!player) return;
    
    const magnetRange = CONFIG.GAME.POWERUPS.MAGNET.range;
    const coins = this.scene.meshes.filter(mesh => mesh.name === 'coin');
    
    coins.forEach(coin => {
      const distance = BABYLON.Vector3.Distance(player.position, coin.position);
      if (distance < magnetRange) {
        const direction = player.position.subtract(coin.position).normalize();
        coin.position.addInPlace(direction.scale(0.1));
      }
    });
  }

  reset() {
    this.powerups.forEach(powerup => powerup.dispose());
    this.powerups = [];
  }

  optimizeParticles() {
    // Reduce particle effects for performance
    if (this.powerups) {
      this.powerups.forEach(powerup => {
        // Reduce animation frame rate
        if (powerup.floatAnimation) {
          powerup.floatAnimation.framePerSecond = 15; // Reduced from 30
        }
        if (powerup.rotationAnimation) {
          powerup.rotationAnimation.framePerSecond = 15; // Reduced from 30
        }
      });
    }
  }
}

// Collectible Manager
class CollectibleManager {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.coins = [];
    this.coinMaterial = this.createCoinMaterial();
  }

  createCoinMaterial() {
    const material = new BABYLON.StandardMaterial("coinMat", this.scene);
    material.diffuseColor = new BABYLON.Color3(1, 0.85, 0.2);
    material.emissiveColor = new BABYLON.Color3(0.2, 0.17, 0.04);
    material.specularColor = new BABYLON.Color3(1, 1, 0.5);
    return material;
  }

  spawnCoin() {
    const x = Math.random() * 16 - 8;
    const z = Math.random() * 16 - 8;
    const coin = BABYLON.MeshBuilder.CreateCylinder("coin", {diameter: 0.5, height: 0.1}, this.scene);
    coin.position = new BABYLON.Vector3(x, 0.55, z);
    coin.material = this.coinMaterial;
    coin.rotation.x = Math.PI / 2;
    
    // Add rotation animation
    coin.rotationAnimation = BABYLON.Animation.CreateAndStartAnimation(
      "coinRotation", coin, "rotation.y", 30, 0, 0, Math.PI * 2, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    
    // Add floating animation
    coin.floatAnimation = BABYLON.Animation.CreateAndStartAnimation(
      "coinFloat", coin, "position.y", 30, 0, 0.55, 0.75, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    
    this.coins.push(coin);
  }

  checkCollisions(player) {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      if (player.intersectsMesh(this.coins[i], false)) {
        this.collectCoin(i);
        return true;
      }
    }
    return false;
  }

  collectCoin(index) {
    if (this.coins[index]) {
      this.coins[index].dispose();
      this.coins.splice(index, 1);
      this.spawnCoin();
      return true;
    }
    return false;
  }

  reset() {
    this.coins.forEach(coin => coin.dispose());
    this.coins = [];
    const levelConfig = CONFIG.GAME.LEVEL_PROGRESSION[this.gameState.level - 1];
    const coinCount = levelConfig ? levelConfig.coinsNeeded : CONFIG.GAME.INITIAL_COINS;
    for (let i = 0; i < Math.min(coinCount, 8); i++) {
      this.spawnCoin();
    }
  }
}

// UI Manager
class UIManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.elements = {};
    this.getUIElements();
    this.setupEventListeners();
  }

  getUIElements() {
    this.elements.scoreLabel = document.getElementById('scoreLabel');
    this.elements.forceLabel = document.getElementById('forceLabel');
    this.elements.gameStats = document.getElementById('gameStats');
    this.elements.instructions = document.getElementById('instructions');
    this.elements.levelNotification = document.getElementById('levelNotification');
    this.elements.statsPanel = document.getElementById('statsPanel');
  }

  setupEventListeners() {
    // Game controls
    document.getElementById("resetBtn").addEventListener("click", () => this.resetGame());
    
    // Audio controls
    document.getElementById("soundToggle").addEventListener("click", () => {
      const enabled = this.audioManager.toggle();
      document.getElementById("soundToggle").innerText = enabled ? "🔊 Sound" : "🔇 Muted";
    });
    
    // Settings controls
    document.getElementById("settingsBtn").addEventListener("click", () => this.openSettings());
    document.getElementById("statsBtn").addEventListener("click", () => this.toggleStatsPanel());
    document.getElementById("pauseBtn").addEventListener("click", () => this.togglePause());
    
    // Debug panel toggle
    const debugToggle = document.getElementById('debugToggle');
    const debugPanel = document.getElementById('debugPanel');
    if (debugToggle && debugPanel) {
      debugToggle.addEventListener('click', () => {
        debugPanel.classList.toggle('active');
      });
    }    // Quality setting change
    const qualitySelect = document.getElementById('qualitySelect');
    if (qualitySelect) {
      qualitySelect.addEventListener('change', (e) => {
        if (window.game) {
          window.game.setQuality(e.target.value);
          this.updateDebugInfo();
        }
      });
    }

    // Force control event listeners
    this.setupForceControls();
  }  setupForceControls() {
    const forceSlider = document.getElementById('forceSlider');
    const forceValue = document.getElementById('forceValue');
    const forceIncrease = document.getElementById('forceIncrease');
    const forceDecrease = document.getElementById('forceDecrease');// Update force value display
    const updateForceDisplay = (value, showFeedback = false) => {
      if (forceValue) {
        forceValue.textContent = parseFloat(value).toFixed(1);
        
        // Add visual feedback
        if (showFeedback) {
          forceValue.classList.add('force-changed');
          setTimeout(() => {
            forceValue.classList.remove('force-changed');
          }, 300);
        }
      }
    };    // Slider event listener
    if (forceSlider) {
      forceSlider.addEventListener('input', (e) => {
        const newForce = parseFloat(e.target.value);
        updateForceDisplay(newForce);
        
        // Update player controller force
        if (window.game && window.game.playerController) {
          window.game.playerController.setForceMagnitude(newForce);
        }
      });

      // Initialize display
      updateForceDisplay(forceSlider.value);
    }

    // Increase force button
    if (forceIncrease) {
      forceIncrease.addEventListener('click', () => {
        if (forceSlider) {
          const currentValue = parseFloat(forceSlider.value);
          const newValue = Math.min(parseFloat(forceSlider.max), currentValue + 0.2);
          forceSlider.value = newValue;
          updateForceDisplay(newValue);
          
          if (window.game && window.game.playerController) {
            window.game.playerController.setForceMagnitude(newValue);
          }
        }
      });
    }

    // Decrease force button
    if (forceDecrease) {
      forceDecrease.addEventListener('click', () => {
        if (forceSlider) {
          const currentValue = parseFloat(forceSlider.value);
          const newValue = Math.max(parseFloat(forceSlider.min), currentValue - 0.2);
          forceSlider.value = newValue;
          updateForceDisplay(newValue);
          
          if (window.game && window.game.playerController) {
            window.game.playerController.setForceMagnitude(newValue);
          }
        }
      });
    }

    // Keyboard shortcuts for force adjustment
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName.toLowerCase() === 'input') return; // Don't interfere with input fields
      
      if (e.key === '[' || e.key === '{') { // Decrease force
        e.preventDefault();
        if (forceSlider) {
          const currentValue = parseFloat(forceSlider.value);
          const newValue = Math.max(parseFloat(forceSlider.min), currentValue - 0.1);
          forceSlider.value = newValue;
          updateForceDisplay(newValue);
          
          if (window.game && window.game.playerController) {
            window.game.playerController.setForceMagnitude(newValue);
          }
        }
      } else if (e.key === ']' || e.key === '}') { // Increase force
        e.preventDefault();
        if (forceSlider) {
          const currentValue = parseFloat(forceSlider.value);
          const newValue = Math.min(parseFloat(forceSlider.max), currentValue + 0.1);
          forceSlider.value = newValue;
          updateForceDisplay(newValue);
          
          if (window.game && window.game.playerController) {
            window.game.playerController.setForceMagnitude(newValue);
          }
        }
      }
    });
  }

  updateScore(score) {
    this.elements.scoreLabel.innerText = `Score: ${score}`;
  }
  updateForce(force) {
    this.elements.forceLabel.innerText = `Force: (${force.x.toFixed(1)}, ${force.y.toFixed(1)}, ${force.z.toFixed(1)})`;
  }

  updateForceMagnitude(magnitude) {
    const forceValue = document.getElementById('forceValue');
    const forceSlider = document.getElementById('forceSlider');
    
    if (forceValue) {
      forceValue.textContent = magnitude.toFixed(1);
    }
    
    if (forceSlider) {
      forceSlider.value = magnitude;
    }
  }

  updateStats(playTime, fps) {
    this.elements.gameStats.innerText = `Time: ${playTime}s | FPS: ${Math.round(fps)} | Level: ${this.gameState.level}`;
    
    // Update FPS in stats panel
    const fpsStat = document.getElementById('fpsStat');
    const avgFpsStat = document.getElementById('avgFpsStat');
    if (fpsStat) fpsStat.textContent = fps;
    if (avgFpsStat && performanceMonitor) {
      avgFpsStat.textContent = performanceMonitor.getAverageFPS();
    }
    
    // Update debug panel
    this.updateDebugInfo();
  }

  updateDebugInfo() {
    if (!performanceMonitor) return;
    
    const debugFps = document.getElementById('debugFps');
    const debugAvgFps = document.getElementById('debugAvgFps');
    const debugParticles = document.getElementById('debugParticles');
    const debugShadows = document.getElementById('debugShadows');
    const qualityStat = document.getElementById('qualityStat');
    
    if (debugFps) debugFps.textContent = performanceMonitor.getFPS();
    if (debugAvgFps) debugAvgFps.textContent = performanceMonitor.getAverageFPS();
    if (qualityStat) qualityStat.textContent = this.gameState.qualitySetting.charAt(0).toUpperCase() + this.gameState.qualitySetting.slice(1);
    
    if (window.game && debugParticles) {
      const settings = CONFIG.RENDERING.QUALITY_SETTINGS[this.gameState.qualitySetting];
      debugParticles.textContent = settings.particles || 'N/A';
    }
    
    if (debugShadows) {
      const settings = CONFIG.RENDERING.QUALITY_SETTINGS[this.gameState.qualitySetting];
      debugShadows.textContent = settings.shadows ? 'On' : 'Off';
    }
  }

  updateDetailedStats() {
    const stats = {
      levelStat: this.gameState.level,
      coinsStat: this.gameState.coinsCollected,
      totalScoreStat: this.gameState.score,
      bestTimeStat: this.gameState.bestTime ? `${this.gameState.bestTime}s` : '--',
      powerupsStat: this.gameState.powerupsUsed,
      jumpsStat: this.gameState.jumps
    };

    Object.entries(stats).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  showLevelNotification(level) {
    if (this.elements.levelNotification) {
      this.elements.levelNotification.textContent = `Level ${level} Unlocked!`;
      this.elements.levelNotification.classList.add('show');
      setTimeout(() => {
        this.elements.levelNotification.classList.remove('show');
      }, 3000);
    }
  }

  showPowerupEffect(type) {
    const scoreLabel = this.elements.scoreLabel;
    if (scoreLabel) {
      scoreLabel.classList.add('powerup-active');
      setTimeout(() => {
        scoreLabel.classList.remove('powerup-active');
      }, 500);
    }
  }

  toggleStatsPanel() {
    if (this.elements.statsPanel) {
      this.elements.statsPanel.classList.toggle('active');
      this.updateDetailedStats();
    }
  }

  showLoadingProgress(progress) {
    const progressBar = document.getElementById('loadingProgress');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }

  showError(message) {
    // Create or update error display
    let errorDiv = document.getElementById('gameError');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'gameError';
      errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 10000;
        max-width: 400px;
      `;
      document.body.appendChild(errorDiv);
    }
    
    errorDiv.innerHTML = `
      <h3>Game Error</h3>
      <p>${message}</p>
      <button onclick="location.reload()" style="
        background: white;
        color: red;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
      ">Reload Game</button>
    `;
  }
}

// Audio Manager
class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = {};
    this.enabled = true;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
  }

  async loadSound(name, url) {
    try {
      this.sounds[name] = new Audio(url);
      this.sounds[name].volume = this.sfxVolume;
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }

  async loadMusic(name, url) {
    try {
      this.music[name] = new Audio(url);
      this.music[name].volume = this.musicVolume;
      this.music[name].loop = true;
    } catch (error) {
      console.warn(`Failed to load music: ${name}`, error);
    }
  }

  playSound(name) {
    if (this.enabled && this.sounds[name]) {
      try {
        this.sounds[name].currentTime = 0;
        this.sounds[name].play();
      } catch (error) {
        console.warn(`Failed to play sound: ${name}`, error);
      }
    }
  }

  playMusic(name) {
    if (this.enabled && this.music[name]) {
      try {
        this.music[name].play();
      } catch (error) {
        console.warn(`Failed to play music: ${name}`, error);
      }
    }
  }

  stopMusic(name) {
    if (this.music[name]) {
      this.music[name].pause();
      this.music[name].currentTime = 0;
    }
  }

  setVolume(type, volume) {
    if (type === 'sfx') {
      this.sfxVolume = volume;
      Object.values(this.sounds).forEach(sound => {
        sound.volume = volume;
      });
    } else if (type === 'music') {
      this.musicVolume = volume;
      Object.values(this.music).forEach(music => {
        music.volume = volume;
      });
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      Object.values(this.music).forEach(music => music.pause());
    }
    return this.enabled;
  }
}

// Main Game Class
class BabylonGame {
  constructor() {
    console.log('BabylonGame constructor started');
    this.currentQuality = 'medium';
    this.postProcessingPipeline = null;
    
    // Initialize game state first
    console.log('Initializing GameState...');
    this.gameState = new GameState();
    console.log('Initializing UIManager...');
    this.uiManager = new UIManager(this.gameState);
    console.log('Initializing AudioManager...');
    this.audioManager = new AudioManager();
    
    // Expose game instance globally for performance monitor
    window.game = this;
    
    console.log('Starting Babylon initialization...');
    this.initializeBabylon();
  }
  async initializeBabylon() {
    try {
      console.log('Getting canvas element...');
      // Get canvas and initialize engine
      this.canvas = document.getElementById("renderCanvas");
      if (!this.canvas) {
        throw new Error("Canvas element 'renderCanvas' not found");
      }
      console.log('Canvas found, initializing engine...');
      
      this.engine = new BABYLON.Engine(this.canvas, true, { 
        preserveDrawingBuffer: true, 
        stencil: true 
      });
      console.log('Engine created, creating scene...');
      this.scene = new BABYLON.Scene(this.engine);
      console.log('Scene created, setting up scene...');

      await this.setupScene();
      console.log('Scene setup complete, setting up event listeners...');
      this.setupEventListeners();
      console.log('Event listeners setup, starting game loop...');
      this.startGameLoop();
      
      console.log('Resetting game state...');
      this.gameState.reset();
      console.log('Hiding loading screen...');
      this.uiManager.hideLoadingScreen();
      console.log('Game initialization completed successfully!');
    } catch (error) {
      console.error("Failed to initialize game:", error);
      console.error("Error stack:", error.stack);
      // Hide loading screen even on error to prevent getting stuck
      this.uiManager.hideLoadingScreen();
      // Show error message to user
      this.showError(error.message);
    }
  }
  async setupScene() {
    // Show loading progress
    this.uiManager.showLoadingProgress(10);

    // Enable physics
    this.scene.enablePhysics(new BABYLON.Vector3(0, CONFIG.PHYSICS.GRAVITY, 0), new BABYLON.CannonJSPlugin());
    this.uiManager.showLoadingProgress(20);

    // Setup camera
    this.setupCamera();
    this.uiManager.showLoadingProgress(30);
    
    // Setup lighting
    this.setupLighting();
    this.uiManager.showLoadingProgress(40);
    
    // Create world
    this.createGround();
    this.uiManager.showLoadingProgress(50);
    this.createPlayer();
    this.uiManager.showLoadingProgress(60);
    this.createSkybox();
    this.uiManager.showLoadingProgress(70);
    this.setupParticles();
    this.uiManager.showLoadingProgress(75);
    this.setupPostProcessing();
    this.uiManager.showLoadingProgress(80);
    this.createObstacles();
    this.uiManager.showLoadingProgress(85);
    
    // Initialize managers
    this.collectibleManager = new CollectibleManager(this.scene, this.gameState);
    this.powerupManager = new PowerupManager(this.scene, this.gameState);
    this.collectibleManager.reset();
    this.uiManager.showLoadingProgress(90);
    
    // Load audio
    await this.loadAllAudio();
    this.uiManager.showLoadingProgress(100);
  }

  async loadAllAudio() {
    const audioPromises = [
      this.audioManager.loadSound('coinCollect', CONFIG.ASSETS.SOUNDS.COIN_COLLECT),
      this.audioManager.loadSound('powerup', CONFIG.ASSETS.SOUNDS.POWERUP),
      this.audioManager.loadSound('jump', CONFIG.ASSETS.SOUNDS.JUMP),
      this.audioManager.loadSound('levelUp', CONFIG.ASSETS.SOUNDS.LEVEL_UP)
    ];
    
    await Promise.all(audioPromises);
  }

  setupCamera() {
    this.camera = new BABYLON.ArcRotateCamera("camera", Math.PI/2, Math.PI/3, 12, BABYLON.Vector3.Zero(), this.scene);
    this.camera.attachControl(this.canvas, true);
    
    // Disable arrow key controls for camera
    this.camera.inputs.attached.keyboard.keysUp = [];
    this.camera.inputs.attached.keyboard.keysDown = [];
    this.camera.inputs.attached.keyboard.keysLeft = [];
    this.camera.inputs.attached.keyboard.keysRight = [];
  }

  setupLighting() {
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
    hemiLight.intensity = 0.7;

    this.dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), this.scene);
    this.dirLight.position = new BABYLON.Vector3(10, 20, 10);
    this.dirLight.intensity = 1.0;
  }

  createGround() {
    this.ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, this.scene);
    this.ground.position.y = 0;
    
    const groundMat = new BABYLON.StandardMaterial("gmat", this.scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.19, 0.22, 0.24);
    
    // Add texture with error handling
    try {
      const groundTexture = new BABYLON.Texture(CONFIG.ASSETS.TEXTURES.GRASS, this.scene);
      groundMat.diffuseTexture = groundTexture;
    } catch (error) {
      console.warn("Failed to load ground texture", error);
    }
    
    this.ground.material = groundMat;
    this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.ground, BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: CONFIG.PHYSICS.GROUND_RESTITUTION, friction: CONFIG.PHYSICS.GROUND_FRICTION }, 
      this.scene
    );
    this.ground.receiveShadows = true;
  }

  createPlayer() {
    this.player = BABYLON.MeshBuilder.CreateBox("player", { size: 1 }, this.scene);
    this.player.position.y = 1;
    
    const playerMat = new BABYLON.StandardMaterial("pmat", this.scene);
    playerMat.diffuseColor = new BABYLON.Color3(0.2, 0.7, 1.0);
    
    // Add texture with error handling
    try {
      const playerTexture = new BABYLON.Texture(CONFIG.ASSETS.TEXTURES.WOOD, this.scene);
      playerMat.diffuseTexture = playerTexture;
    } catch (error) {
      console.warn("Failed to load player texture", error);
    }
    
    this.player.material = playerMat;
    this.player.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.player, BABYLON.PhysicsImpostor.BoxImpostor,
      { 
        mass: CONFIG.PHYSICS.PLAYER_MASS, 
        restitution: CONFIG.PHYSICS.PLAYER_RESTITUTION, 
        friction: CONFIG.PHYSICS.PLAYER_FRICTION 
      }, 
      this.scene
    );    // Setup shadows
    this.shadowGenerator = new BABYLON.ShadowGenerator(CONFIG.RENDERING.SHADOW_MAP_SIZE, this.dirLight);
    this.shadowGenerator.addShadowCaster(this.player);
    this.shadowGenerator.useBlurExponentialShadowMap = true;

    // Initialize player controller
    this.playerController = new PlayerController(this.player, this.player.physicsImpostor, this.gameState);
  }

  setupPostProcessing() {
    if (this.gameState.qualitySetting === 'high') {
      try {
        // Add bloom effect
        this.bloomPipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", true, this.scene, [this.camera]);
        this.bloomPipeline.bloomEnabled = true;
        this.bloomPipeline.bloomThreshold = 0.8;
        this.bloomPipeline.bloomWeight = 0.3;
        this.bloomPipeline.bloomKernel = 32;
        
        // Add FXAA
        this.bloomPipeline.fxaaEnabled = true;
        
        // Add tone mapping
        this.bloomPipeline.imageProcessingEnabled = true;
        this.bloomPipeline.imageProcessing.toneMappingEnabled = true;
      } catch (error) {
        console.warn("Failed to setup post-processing:", error);
      }
    }
  }

  createSkybox() {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 100}, this.scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    
    try {
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(CONFIG.ASSETS.TEXTURES.SKYBOX, this.scene);
      skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    } catch (error) {
      console.warn("Failed to load skybox texture", error);
    }
    
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
  }
  setupParticles() {
    const settings = CONFIG.RENDERING.QUALITY_SETTINGS[this.gameState.qualitySetting];
    const particleCount = settings.particles || CONFIG.RENDERING.PARTICLE_COUNT;
    
    this.particleSystem = new BABYLON.ParticleSystem("particles", particleCount, this.scene);
    
    try {
      this.particleSystem.particleTexture = new BABYLON.Texture(CONFIG.ASSETS.TEXTURES.PARTICLE, this.scene);
    } catch (error) {
      console.warn("Failed to load particle texture", error);
    }
    
    this.particleSystem.emitter = this.player;
    this.particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, 0, -0.2);
    this.particleSystem.maxEmitBox = new BABYLON.Vector3(0.2, 0, 0.2);
    this.particleSystem.color1 = new BABYLON.Color4(1, 1, 0, 1);
    this.particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
    this.particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    this.particleSystem.minSize = 0.1;
    this.particleSystem.maxSize = 0.3;
    this.particleSystem.minLifeTime = 0.1;
    this.particleSystem.maxLifeTime = 0.3;
    this.particleSystem.emitRate = 0;
    this.particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    this.particleSystem.direction1 = new BABYLON.Vector3(-1, -1, -1);
    this.particleSystem.direction2 = new BABYLON.Vector3(1, -1, 1);
    this.particleSystem.gravity = new BABYLON.Vector3(0, CONFIG.PHYSICS.GRAVITY, 0);
    this.particleSystem.start();
  }
  createObstacles() {
    this.obstacles = [];
    const levelConfig = CONFIG.GAME.LEVEL_PROGRESSION[this.gameState.level - 1];
    const obstacleCount = levelConfig ? levelConfig.obstacles : 1;
    
    for (let i = 0; i < obstacleCount; i++) {
      const obstacle = BABYLON.MeshBuilder.CreateBox(`obstacle${i}`, {size: 1.5}, this.scene);
      
      // Position obstacles around the level
      const angle = (i / obstacleCount) * Math.PI * 2;
      const radius = 4 + Math.random() * 3;
      obstacle.position = new BABYLON.Vector3(
        Math.cos(angle) * radius,
        0.75,
        Math.sin(angle) * radius
      );
      
      const obstacleMat = new BABYLON.StandardMaterial(`obstacleMat${i}`, this.scene);
      obstacleMat.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
      obstacleMat.emissiveColor = new BABYLON.Color3(0.2, 0.02, 0.02);
      obstacle.material = obstacleMat;
      
      obstacle.physicsImpostor = new BABYLON.PhysicsImpostor(
        obstacle, BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.5, friction: 0.8 }, 
        this.scene
      );
      
      this.obstacles.push(obstacle);
    }
  }
  setupEventListeners() {
    // Game controls
    document.getElementById("resetBtn").addEventListener("click", () => this.resetGame());
    
    // Audio controls
    document.getElementById("soundToggle").addEventListener("click", () => {
      const enabled = this.audioManager.toggle();
      document.getElementById("soundToggle").innerText = enabled ? "🔊 Sound" : "🔇 Muted";
    });
    
    // Settings controls
    document.getElementById("settingsBtn").addEventListener("click", () => this.openSettings());
    document.getElementById("statsBtn").addEventListener("click", () => this.uiManager.toggleStatsPanel());
    document.getElementById("pauseBtn").addEventListener("click", () => this.togglePause());
    
    // Debug panel toggle
    const debugToggle = document.getElementById('debugToggle');
    const debugPanel = document.getElementById('debugPanel');
    if (debugToggle && debugPanel) {
      debugToggle.addEventListener('click', () => {
        debugPanel.classList.toggle('active');
      });
    }

    // Quality setting change
    const qualitySelect = document.getElementById('qualitySelect');
    if (qualitySelect) {
      qualitySelect.addEventListener('change', (e) => {
        if (window.game) {
          window.game.setQuality(e.target.value);
          this.uiManager.updateDebugInfo();
        }
      });
    }
    
    // Window resize
    window.addEventListener("resize", () => this.engine.resize());
    
    // Global functions for UI callbacks
    window.closeSettings = () => this.closeSettings();
    window.openSettings = () => this.openSettings();
    window.togglePause = () => this.togglePause();
    window.resumeGame = () => this.resumeGame();
    window.resetGame = () => this.resetGame();
  }

  openSettings() {
    const settingsMenu = document.getElementById("settingsMenu");
    if (settingsMenu) {
      settingsMenu.classList.add("active");
      this.gameState.isPaused = true;
    }
  }

  closeSettings() {
    const settingsMenu = document.getElementById("settingsMenu");
    if (settingsMenu) {
      settingsMenu.classList.remove("active");
      this.gameState.isPaused = false;
    }
  }

  togglePause() {
    if (this.gameState.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  pauseGame() {
    this.gameState.isPaused = true;
    const pauseMenu = document.getElementById("pauseMenu");
    if (pauseMenu) {
      pauseMenu.classList.add("active");
    }
    document.getElementById("pauseBtn").innerText = "▶️ Resume";
  }

  resumeGame() {
    this.gameState.isPaused = false;
    const pauseMenu = document.getElementById("pauseMenu");
    if (pauseMenu) {
      pauseMenu.classList.remove("active");
    }
    document.getElementById("pauseBtn").innerText = "⏸️ Pause";
  }

  setQuality(quality) {
    if (['low', 'medium', 'high'].includes(quality) && quality !== this.currentQuality) {
      this.currentQuality = quality;
      this.gameState.qualitySetting = quality;
      this.applyQualitySettings();
      console.log(`Quality set to: ${quality}`);
    }
  }

  applyQualitySettings() {
    const settings = CONFIG.RENDERING.QUALITY_SETTINGS[this.gameState.qualitySetting];
    
    // Apply particle count
    if (this.particleSystem) {
      this.particleSystem.updateFunction = null;
      this.particleSystem.dispose();
      this.setupParticles();
    }
    
    // Apply shadow settings
    if (this.shadowGenerator) {
      this.shadowGenerator.getShadowMap().renderList = settings.shadows ? [this.player] : [];
    }
    
    // Apply post-processing
    if (this.bloomPipeline) {
      this.bloomPipeline.dispose();
      this.bloomPipeline = null;
    }
    if (settings.postProcessing) {
      this.setupPostProcessing();
    }
  }
  resetGame() {
    this.gameState.reset();
    this.playerController.reset();
    this.collectibleManager.reset();
    this.powerupManager.reset();
    this.uiManager.updateScore(0);
    this.uiManager.updateDetailedStats();
    
    // Recreate obstacles for new level
    if (this.obstacles) {
      this.obstacles.forEach(obstacle => obstacle.dispose());
    }
    this.createObstacles();
    
    // Close any open menus
    this.closeSettings();
    this.resumeGame();
  }

  startGameLoop() {
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsUpdateTime = 0;
    let currentFPS = 60;

    this.engine.runRenderLoop(() => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update FPS counter
      frameCount++;
      fpsUpdateTime += deltaTime;
      if (fpsUpdateTime >= 1000) {
        currentFPS = frameCount;
        frameCount = 0;
        fpsUpdateTime = 0;
      }

      // Update performance monitor
      performanceMonitor.update();

      // Update game
      this.update(deltaTime);

      // Update UI with FPS from performance monitor
      this.uiManager.updateStats(this.gameState.getPlayTime(), performanceMonitor.getFPS());

      // Render scene
      this.scene.render();
    });
  }
  update(deltaTime) {
    if (!this.gameState.isPlaying || this.gameState.isPaused) return;

    // Update player
    const force = this.playerController.update();
    this.uiManager.updateForce(force);

    // Update powerups
    this.powerupManager.update();

    // Update particles based on movement and powerups
    let emitRate = this.playerController.isMoving() ? 100 : 0;
    if (this.gameState.hasPowerup('SPEED')) emitRate *= 2;
    this.particleSystem.emitRate = emitRate;

    // Check coin collisions
    if (this.collectibleManager.checkCollisions(this.player)) {
      this.gameState.updateScore(10);
      this.uiManager.updateScore(this.gameState.score);
      this.audioManager.playSound('coinCollect');

      // Check level progression
      this.checkLevelProgression();
    }

    // Check powerup collisions
    const powerupType = this.powerupManager.checkCollisions(this.player);
    if (powerupType) {
      this.audioManager.playSound('powerup');
      this.uiManager.showPowerupEffect(powerupType);
    }

    // Update UI stats
    this.uiManager.updateDetailedStats();

    // Check win condition
    const levelConfig = CONFIG.GAME.LEVEL_PROGRESSION[this.gameState.level - 1];
    if (levelConfig && this.gameState.coinsCollected >= levelConfig.coinsNeeded) {
      this.onLevelComplete();
    }

    // Update performance monitor
    performanceMonitor.update();
  }

  checkLevelProgression() {
    const levelConfig = CONFIG.GAME.LEVEL_PROGRESSION[this.gameState.level - 1];
    if (levelConfig && this.gameState.coinsCollected >= levelConfig.coinsNeeded) {
      this.onLevelComplete();
    }
  }

  onLevelComplete() {
    if (this.gameState.level < CONFIG.GAME.LEVEL_PROGRESSION.length) {
      this.gameState.levelUp();
      this.audioManager.playSound('levelUp');
      this.uiManager.showLevelNotification(this.gameState.level);
      
      // Reset for next level
      this.collectibleManager.reset();
      this.powerupManager.reset();
      
      // Recreate obstacles
      if (this.obstacles) {
        this.obstacles.forEach(obstacle => obstacle.dispose());
      }
      this.createObstacles();
    } else {
      this.onGameWin();
    }
  }

  onGameWin() {
    this.gameState.saveStats();
    const message = `🎉 Congratulations! You completed all levels!\n` +
                   `Final Score: ${this.gameState.score}\n` +
                   `Time: ${this.gameState.getPlayTime()}s\n` +
                   `Powerups Used: ${this.gameState.powerupsUsed}\n` +
                   `Total Jumps: ${this.gameState.jumps}`;
    alert(message);
    this.resetGame();
  }
}

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor();

// Debug utilities
const GameDebug = {
  logPerformance() {
    console.log(`FPS: ${performanceMonitor.getFPS()}, Avg FPS: ${performanceMonitor.getAverageFPS()}`);
    if (window.game) {
      console.log(`Quality: ${window.game.currentQuality}`);
      console.log(`Particles: ${window.game.particleSystem?.getCapacity() || 'N/A'}`);
      console.log(`Active powerups: ${window.game.gameState.activePowerups.size}`);
    }
  },

  runPerformanceTest(duration = 10000) {
    console.log('Starting performance test...');
    const startTime = Date.now();
    const initialFPS = performanceMonitor.getFPS();
    
    setTimeout(() => {
      const endTime = Date.now();
      const finalFPS = performanceMonitor.getFPS();
      const avgFPS = performanceMonitor.getAverageFPS();
      
      console.log('Performance Test Results:');
      console.log(`Duration: ${endTime - startTime}ms`);
      console.log(`Initial FPS: ${initialFPS}`);
      console.log(`Final FPS: ${finalFPS}`);
      console.log(`Average FPS: ${avgFPS}`);
      console.log(`Performance stable: ${Math.abs(finalFPS - initialFPS) < 10 ? 'Yes' : 'No'}`);
    }, duration);
  },

  testAllQualitySettings() {
    if (!window.game) {
      console.log('Game not loaded yet');
      return;
    }
    
    const qualities = ['low', 'medium', 'high'];
    let currentIndex = 0;
    
    const testNextQuality = () => {
      if (currentIndex >= qualities.length) {
        console.log('Quality test complete');
        return;
      }
      
      const quality = qualities[currentIndex];
      console.log(`Testing quality: ${quality}`);
      window.game.setQuality(quality);
      
      setTimeout(() => {
        this.logPerformance();
        currentIndex++;
        testNextQuality();
      }, 3000);
    };
    
    testNextQuality();
  }
};

// Expose debug utilities globally
window.GameDebug = GameDebug;

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  try {
    new BabylonGame();
    console.log('Game initialization started successfully');
  } catch (error) {
    console.error('Failed to start game initialization:', error);
  }
});
