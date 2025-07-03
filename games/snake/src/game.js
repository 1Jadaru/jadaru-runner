/**
 * Main game controller for the Snake game
 * Coordinates all game systems and handles game state
 */

import { Grid } from './grid.js';
import { Snake } from './snake.js';
import { Food } from './food.js';
import { InputHandler } from './input.js';

export class Game {
  constructor(scene) {
    this.scene = scene;
    this.canvas = scene.getEngine().getRenderingCanvas();
    
    // Game state
    this.state = 'waiting'; // 'waiting', 'playing', 'paused', 'gameOver'
    this.gameMode = 'classic'; // 'classic', 'speed', 'survival'
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    this.level = 1;
    this.combo = 0;
    this.maxCombo = 0;
    this.powerUpActive = false;
    this.powerUpType = null;
    this.powerUpTimer = 0;
    
    // Game timing
    this.moveInterval = 200; // milliseconds between moves
    this.lastMoveTime = 0;
    this.deltaTimeAccumulator = 0;
    this.gameTime = 0;
    
    // Game objects
    this.grid = new Grid(400, 400, 20); // Smaller grid for easier testing
    this.snake = null;
    this.food = null;
    this.powerUps = [];
    this.inputHandler = null;
    
    // UI elements
    this.scoreElement = document.getElementById('score');
    this.highScoreElement = document.getElementById('high-score');
    this.levelElement = document.getElementById('level');
    this.comboElement = document.getElementById('combo');
    this.gameOverlay = document.getElementById('game-overlay');
    this.gameMessage = document.getElementById('game-message');
    
    // Audio system
    this.audioContext = null;
    this.sounds = {};
    this.musicEnabled = true;
    this.soundEnabled = true;
    
    // Performance monitoring
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    
    this.init();
  }

  init() {
    this.setupScene();
    this.createGameObjects();
    this.setupInput();
    this.setupAudio();
    this.updateUI();
    this.setupGameLoop();
  }

  setupScene() {
    // Camera is already set up in main.js
    
    // Create ground that matches the grid size
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {
      width: this.grid.width,
      height: this.grid.height
    }, this.scene);

    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = groundMaterial;
    ground.position.y = 0; // Make sure it's at ground level

    // Create grid lines for visual reference
    this.createGridLines();

    // Setup lighting
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.scene);
    light.intensity = 0.8;

    // Add directional light for better depth perception
    const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-1, -1, -1), this.scene);
    dirLight.position = new BABYLON.Vector3(20, 40, 20);
    dirLight.intensity = 0.5;
    
    // Add point light for dynamic lighting
    this.pointLight = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(0, 50, 0), this.scene);
    this.pointLight.intensity = 0.3;
    this.pointLight.diffuse = new BABYLON.Color3(1, 0.8, 0.6);
  }

  createGridLines() {
    const gridMaterial = new BABYLON.StandardMaterial('gridMaterial', this.scene);
    gridMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    gridMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.1);

    // Vertical lines
    for (let i = 0; i <= this.grid.cols; i++) {
      const x = (i - this.grid.cols / 2) * this.grid.cellSize;
      const line = BABYLON.MeshBuilder.CreateBox(`vLine_${i}`, {
        width: 1,
        height: 2,
        depth: this.grid.height
      }, this.scene);
      
      line.position.x = x;
      line.position.y = 1;
      line.material = gridMaterial;
    }

    // Horizontal lines
    for (let i = 0; i <= this.grid.rows; i++) {
      const z = (i - this.grid.rows / 2) * this.grid.cellSize;
      const line = BABYLON.MeshBuilder.CreateBox(`hLine_${i}`, {
        width: this.grid.width,
        height: 2,
        depth: 1
      }, this.scene);
      
      line.position.z = z;
      line.position.y = 1;
      line.material = gridMaterial;
    }
  }

  createGameObjects() {
    this.snake = new Snake(this.scene, this.grid);
    this.food = new Food(this.scene, this.grid);
    this.spawnFood();
    
    // Test power-up spawning
    console.log('DEBUG: Testing power-up spawning at game start');
    setTimeout(() => {
      this.spawnPowerUp();
    }, 2000); // Spawn a test power-up after 2 seconds
  }

  setupInput() {
    this.inputHandler = new InputHandler();
    
    this.inputHandler.onInput('start', () => this.handleStartInput());
    this.inputHandler.onInput('pause', () => this.handlePauseInput());
    this.inputHandler.onInput('mode', (mode) => this.changeGameMode(mode));
  }
  
  setupAudio() {
    // Initialize Web Audio API
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      this.audioContext = new (AudioContext || webkitAudioContext)();
      this.loadSounds();
    }
  }
  
  loadSounds() {
    // Create simple sound effects using Web Audio API
    this.createSound('eat', 200, 800, 'sine');
    this.createSound('powerup', 150, 1200, 'square');
    this.createSound('gameover', 500, 200, 'sawtooth');
    this.createSound('levelup', 300, 1000, 'triangle');
  }
  
  createSound(name, duration, frequency, type) {
    if (!this.audioContext) return;
    
    this.sounds[name] = () => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    };
  }
  
  playSound(soundName) {
    if (this.soundEnabled && this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }
  
  setupGameLoop() {
    this.scene.onBeforeRenderObservable.add((scene, eventState) => {
      const deltaTime = scene.getEngine().getDeltaTime();
      this.update(deltaTime);
      this.updatePerformance(deltaTime);
    });
  }
  
  updatePerformance(deltaTime) {
    this.frameCount++;
    this.lastFpsUpdate += deltaTime;
    
    if (this.lastFpsUpdate >= 1000) {
      this.fps = Math.round(this.frameCount * 1000 / this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = 0;
      
      // Adaptive quality based on FPS
      if (this.fps < 30 && this.scene.postProcesses.length > 0) {
        this.scene.postProcesses[0].enabled = false;
      } else if (this.fps > 50 && this.scene.postProcesses.length > 0) {
        this.scene.postProcesses[0].enabled = true;
      }
    }
  }
  
  update(deltaTime) {
    if (this.state !== 'playing') {
      return;
    }

    this.gameTime += deltaTime;
    this.deltaTimeAccumulator += deltaTime;
    
    // Update power-up timer
    if (this.powerUpActive) {
      this.powerUpTimer -= deltaTime;
      if (this.powerUpTimer <= 0) {
        this.deactivatePowerUp();
      }
    }

    // Move snake at fixed intervals
    if (this.deltaTimeAccumulator >= this.moveInterval) {
      this.deltaTimeAccumulator = 0;
      this.moveSnake();
    }
  }
  
  moveSnake() {
    // Get input direction
    const inputDirection = this.inputHandler.getNextDirection();
    if (inputDirection) {
      this.snake.setDirection(inputDirection);
    }

    // Check food consumption before moving
    const foodConsumed = this.checkFoodConsumption();
    if (foodConsumed) {
      this.handleFoodConsumption();
    }
    
    // Check power-up consumption
    const powerUpConsumed = this.checkPowerUpConsumption();
    if (powerUpConsumed) {
      this.handlePowerUpConsumption(powerUpConsumed);
    }

    // Move snake (it will handle tail removal internally based on growing flag)
    this.snake.move();

    // Check collisions after moving
    if (this.checkCollisions()) {
      this.gameOver();
      return;
    }
    
    // Update combo timer
    if (this.combo > 0) {
      this.combo--;
      if (this.combo === 0) {
        this.updateComboDisplay();
      }
    }
  }
  
  checkCollisions() {
    const wallCollision = this.snake.checkWallCollision();
    const selfCollision = this.snake.checkSelfCollision();
    
    return wallCollision || selfCollision;
  }
  
  checkFoodConsumption() {
    const headPos = this.snake.getHeadPosition();
    if (!headPos) {
      return false;
    }
    return this.food.isAtPosition(headPos);
  }
  
  checkPowerUpConsumption() {
    const headPos = this.snake.getHeadPosition();
    if (!headPos) {
      console.log('DEBUG: No head position available');
      return false;
    }
    
    console.log('DEBUG: Checking power-up collisions. Snake head at:', headPos);
    console.log('DEBUG: Active power-ups:', this.powerUps.length);
    
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      const powerUpPos = powerUp.getPosition();
      const isColliding = powerUp.isAtPosition(headPos);
      
      console.log(`DEBUG: Power-up ${i} (${powerUp.type}) at:`, powerUpPos, 'Colliding:', isColliding);
      
      if (isColliding) {
        console.log(`DEBUG: COLLISION DETECTED! Collecting ${powerUp.type} power-up`);
        this.powerUps.splice(i, 1);
        console.log(`DEBUG: Power-up removed from array. Remaining power-ups:`, this.powerUps.length);
        return powerUp;
      }
    }
    return false;
  }
  
  handleFoodConsumption() {
    // Create eat effect
    this.food.createEatEffect();
    
    // Increase combo
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    
    // Calculate score with combo multiplier
    const baseScore = 10;
    const comboMultiplier = 1 + (this.combo - 1) * 0.5;
    const scoreGain = Math.round(baseScore * comboMultiplier);
    
    this.score += scoreGain;
    this.updateScore();
    this.updateComboDisplay();
    
    // Play sound
    this.playSound('eat');
    
    // Spawn new food
    this.snake.grow();
    this.spawnFood();
    
    // Check for level up
    this.checkLevelUp();
    
    // Randomly spawn power-up
    const shouldSpawn = Math.random() < 0.3; // 30% chance for testing
    console.log('DEBUG: Food consumed. Should spawn power-up:', shouldSpawn);
    if (shouldSpawn) {
      this.spawnPowerUp();
    }
    
    // Increase speed based on game mode
    this.updateSpeed();
  }
  
  handlePowerUpConsumption(powerUp) {
    console.log(`DEBUG: Handling power-up consumption for type: ${powerUp.type}`);
    this.activatePowerUp(powerUp.type);
    this.playSound('powerup');
    
    // Create power-up effect
    this.createPowerUpEffect(powerUp.position);
    
    // Dispose of the power-up
    powerUp.dispose();
  }
  
  activatePowerUp(type) {
    console.log(`DEBUG: Activating power-up: ${type}`);
    this.powerUpActive = true;
    this.powerUpType = type;
    this.powerUpTimer = 5000; // 5 seconds
    
    switch (type) {
      case 'speed':
        console.log('DEBUG: Activating speed power-up');
        this.moveInterval *= 0.5;
        break;
      case 'slow':
        console.log('DEBUG: Activating slow power-up');
        this.moveInterval *= 2;
        break;
      case 'ghost':
        console.log('DEBUG: Activating ghost power-up');
        this.snake.setGhostMode(true);
        break;
      case 'double':
        console.log('DEBUG: Activating double points power-up');
        // Double points for a duration
        break;
    }
  }
  
  deactivatePowerUp() {
    this.powerUpActive = false;
    this.powerUpType = null;
    
    // Reset to normal speed
    this.updateSpeed();
    
    // Disable ghost mode
    if (this.snake) {
      this.snake.setGhostMode(false);
    }
  }
  
  createPowerUpEffect(position) {
    // Create particle effect at power-up position
    const particleSystem = new BABYLON.ParticleSystem('powerUpEffect', 50, this.scene);
    
    particleSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    
    particleSystem.emitter = new BABYLON.Vector3(
      position.x * this.grid.cellSize,
      5,
      position.z * this.grid.cellSize
    );
    
    particleSystem.minEmitBox = new BABYLON.Vector3(-1, -1, -1);
    particleSystem.maxEmitBox = new BABYLON.Vector3(1, 1, 1);
    
    particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1);
    particleSystem.color2 = new BABYLON.Color4(0, 0, 1, 1);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 0.8;
    
    particleSystem.emitRate = 100;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    
    particleSystem.direction1 = new BABYLON.Vector3(-2, -2, -2);
    particleSystem.direction2 = new BABYLON.Vector3(2, 2, 2);
    
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;
    
    particleSystem.start();
    
    // Stop after 1 second
    setTimeout(() => {
      particleSystem.stop();
    }, 1000);
  }
  
  spawnPowerUp() {
    console.log('DEBUG: spawnPowerUp() method called');
    const types = ['speed', 'slow', 'ghost', 'double'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const snakePositions = this.snake.getBodyPositions();
    const foodPosition = this.food.getPosition();
    const powerUpPositions = this.powerUps.map(p => p.getPosition());
    
    console.log('DEBUG: Snake positions:', snakePositions);
    console.log('DEBUG: Food position:', foodPosition);
    console.log('DEBUG: Existing power-up positions:', powerUpPositions);
    
    const availablePositions = [];
    for (let x = 0; x < this.grid.cols; x++) {
      for (let y = 0; y < this.grid.rows; y++) {
        const pos = { x, y };
        const isSnakePosition = snakePositions.some(p => p.x === pos.x && p.y === pos.y);
        const isFoodPosition = (foodPosition.x === pos.x && foodPosition.y === pos.y);
        const isPowerUpPosition = powerUpPositions.some(p => p.x === pos.x && p.y === pos.y);
        
        if (!isSnakePosition && !isFoodPosition && !isPowerUpPosition) {
          availablePositions.push(pos);
        }
      }
    }
    
    console.log('DEBUG: Available positions count:', availablePositions.length);
    console.log('DEBUG: Grid dimensions:', this.grid.cols, 'x', this.grid.rows);
    
    if (availablePositions.length > 0) {
      const position = availablePositions[Math.floor(Math.random() * availablePositions.length)];
      console.log(`DEBUG: Spawning ${type} power-up at position:`, position);
      try {
        const powerUp = new PowerUp(this.scene, this.grid, position, type);
        this.powerUps.push(powerUp);
        console.log(`DEBUG: Power-up added to array. Total power-ups:`, this.powerUps.length);
      } catch (error) {
        console.error('DEBUG: Error creating power-up:', error);
      }
    } else {
      console.log('DEBUG: No available positions for power-up spawning');
    }
  }
  
  checkLevelUp() {
    const newLevel = Math.floor(this.score / 100) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.updateLevel();
      this.playSound('levelup');
      this.createLevelUpEffect();
    }
  }
  
  createLevelUpEffect() {
    // Create screen flash effect
    const flashMaterial = new BABYLON.StandardMaterial('flash', this.scene);
    flashMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    flashMaterial.alpha = 0.3;
    
    const flashPlane = BABYLON.MeshBuilder.CreatePlane('flash', { width: 1000, height: 1000 }, this.scene);
    flashPlane.material = flashMaterial;
    flashPlane.position.y = 100;
    
    // Animate flash
    const flashAnimation = new BABYLON.Animation('flashAnim', 'material.alpha', 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    
    const keyFrames = [];
    keyFrames.push({ frame: 0, value: 0.3 });
    keyFrames.push({ frame: 15, value: 0 });
    
    flashAnimation.setKeys(keyFrames);
    flashPlane.animations = [flashAnimation];
    
    this.scene.beginAnimation(flashPlane, 0, 15, false, 1, () => {
      flashPlane.dispose();
    });
  }
  
  updateSpeed() {
    const baseSpeed = 200;
    const levelSpeedReduction = (this.level - 1) * 5;
    const modeMultiplier = this.getModeSpeedMultiplier();
    
    this.moveInterval = Math.max(50, baseSpeed - levelSpeedReduction) * modeMultiplier;
  }
  
  getModeSpeedMultiplier() {
    switch (this.gameMode) {
      case 'speed': return 0.7;
      case 'survival': return 1.2;
      default: return 1.0;
    }
  }
  
  changeGameMode(mode) {
    this.gameMode = mode;
    this.updateSpeed();
    this.updateUI();
  }

  spawnFood() {
    const snakePositions = this.snake.getBodyPositions();
    const powerUpPositions = this.powerUps.map(p => p.getPosition());
    this.food.spawn(snakePositions, powerUpPositions);
  }

  handleStartInput() {
    switch (this.state) {
      case 'waiting':
        this.startGame();
        break;
      case 'playing':
        this.pauseGame();
        break;
      case 'paused':
        this.resumeGame();
        break;
      case 'gameOver':
        this.restartGame();
        break;
    }
  }

  handlePauseInput() {
    if (this.state === 'playing') {
      this.pauseGame();
    } else if (this.state === 'paused') {
      this.resumeGame();
    }
  }

  startGame() {
    this.state = 'playing';
    this.hideOverlay();
    this.updateUI();
  }

  pauseGame() {
    this.state = 'paused';
    this.showOverlay('Game Paused', 'Press SPACE to resume');
  }

  resumeGame() {
    this.state = 'playing';
    this.hideOverlay();
  }

  gameOver() {
    this.state = 'gameOver';
    this.playSound('gameover');
    this.updateHighScore();
    this.showOverlay('Game Over!', `Final Score: ${this.score}\nHigh Score: ${this.highScore}\nMax Combo: ${this.maxCombo}`);
  }

  restartGame() {
    // Reset game state
    this.score = 0;
    this.level = 1;
    this.combo = 0;
    this.maxCombo = 0;
    this.gameTime = 0;
    this.powerUpActive = false;
    this.powerUpType = null;
    this.powerUpTimer = 0;
    
    // Clear power-ups
    console.log('DEBUG: Clearing power-ups array in restartGame');
    this.powerUps.forEach(powerUp => powerUp.dispose());
    this.powerUps = [];
    
    // Reset snake and food
    this.snake.reset();
    this.spawnFood();
    
    // Reset speed
    this.updateSpeed();
    
    // Start new game
    this.startGame();
  }

  updateScore() {
    if (this.scoreElement) {
      this.scoreElement.textContent = this.score;
      this.scoreElement.classList.add('score-update');
      setTimeout(() => {
        this.scoreElement.classList.remove('score-update');
      }, 300);
    }
  }

  updateLevel() {
    if (this.levelElement) {
      this.levelElement.textContent = this.level;
      this.levelElement.classList.add('level-up');
      setTimeout(() => {
        this.levelElement.classList.remove('level-up');
      }, 1000);
    }
  }
  
  updateComboDisplay() {
    if (this.comboElement) {
      if (this.combo > 1) {
        this.comboElement.textContent = `${this.combo}x Combo!`;
        this.comboElement.style.display = 'block';
      } else {
        this.comboElement.style.display = 'none';
      }
    }
  }

  updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore.toString());
      if (this.highScoreElement) {
        this.highScoreElement.textContent = this.highScore;
      }
    }
  }

  updateUI() {
    this.updateScore();
    this.updateLevel();
    this.updateComboDisplay();
    this.updateHighScore();
  }

  showOverlay(title, message) {
    if (this.gameOverlay && this.gameMessage) {
      this.gameMessage.innerHTML = `
        <div class="message-icon">🎮</div>
        <h2>${title}</h2>
        <p>${message}</p>
        <div class="game-stats-summary">
          <div class="stat-item">
            <span class="stat-label">Score:</span>
            <span class="stat-value">${this.score}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Level:</span>
            <span class="stat-value">${this.level}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Max Combo:</span>
            <span class="stat-value">${this.maxCombo}</span>
          </div>
        </div>
        <button class="start-game-btn" id="start-game-btn">
          <span class="btn-icon">🚀</span>
          <span>Play Again</span>
        </button>
      `;
      this.gameOverlay.classList.remove('hidden');
    }
  }

  hideOverlay() {
    if (this.gameOverlay) {
      this.gameOverlay.classList.add('hidden');
    }
  }

  getStats() {
    return {
      score: this.score,
      highScore: this.highScore,
      level: this.level,
      combo: this.combo,
      maxCombo: this.maxCombo,
      gameTime: this.gameTime,
      fps: this.fps,
      gameMode: this.gameMode,
      powerUpActive: this.powerUpActive,
      powerUpType: this.powerUpType
    };
  }

  dispose() {
    // Clean up power-ups
    console.log('DEBUG: Clearing power-ups array in dispose');
    this.powerUps.forEach(powerUp => powerUp.dispose());
    this.powerUps = [];
    
    // Clean up game objects
    if (this.snake) this.snake.dispose();
    if (this.food) this.food.dispose();
    if (this.inputHandler) this.inputHandler.dispose();
    
    // Clean up audio
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// PowerUp class for special items
class PowerUp {
  constructor(scene, grid, position, type) {
    console.log(`DEBUG: Creating PowerUp of type ${type} at position:`, position);
    this.scene = scene;
    this.grid = grid;
    this.position = position; // {x, y}
    this.type = type;
    this.mesh = null;
    this.createMesh();
    console.log(`DEBUG: PowerUp created successfully`);
  }
  
  createMesh() {
    const colors = {
      speed: new BABYLON.Color3(1, 0, 0),    // Red
      slow: new BABYLON.Color3(0, 0, 1),     // Blue
      ghost: new BABYLON.Color3(0.5, 0, 0.5), // Purple
      double: new BABYLON.Color3(1, 1, 0)    // Yellow
    };
    
    this.mesh = BABYLON.MeshBuilder.CreateBox(`powerUp_${this.type}`, {
      width: this.grid.cellSize * 0.8,
      height: this.grid.cellSize * 0.8,
      depth: this.grid.cellSize * 0.8
    }, this.scene);
    
    const material = new BABYLON.StandardMaterial(`powerUpMaterial_${this.type}`, this.scene);
    material.diffuseColor = colors[this.type];
    material.emissiveColor = colors[this.type].scale(0.3);
    material.specularColor = new BABYLON.Color3(1, 1, 1);
    
    this.mesh.material = material;
    // Use gridToWorld for correct placement
    const worldPos = this.grid.gridToWorld(this.position.x, this.position.y);
    this.mesh.position = new BABYLON.Vector3(
      worldPos.x,
      this.grid.cellSize * 0.5,
      worldPos.z
    );
    
    // Add rotation animation
    this.mesh.rotation.y = 0;
    const rotationAnimation = new BABYLON.Animation('powerUpRotation', 'rotation.y', 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    
    const keyFrames = [];
    keyFrames.push({ frame: 0, value: 0 });
    keyFrames.push({ frame: 30, value: Math.PI * 2 });
    
    rotationAnimation.setKeys(keyFrames);
    this.mesh.animations = [rotationAnimation];
    
    this.scene.beginAnimation(this.mesh, 0, 30, true);
  }
  
  isAtPosition(position) {
    // Compare x and y (not z)
    const isColliding = this.position.x === position.x && this.position.y === position.y;
    console.log(`DEBUG: PowerUp.isAtPosition - PowerUp at (${this.position.x}, ${this.position.y}), Snake at (${position.x}, ${position.y}), Colliding: ${isColliding}`);
    return isColliding;
  }
  
  getPosition() {
    return this.position;
  }
  
  dispose() {
    console.log(`DEBUG: Disposing PowerUp of type ${this.type}`);
    if (this.mesh) {
      // Stop any animations
      this.scene.stopAnimation(this.mesh);
      // Dispose of the material
      if (this.mesh.material) {
        this.mesh.material.dispose();
      }
      // Dispose of the mesh
      this.mesh.dispose();
      this.mesh = null;
    }
  }
}
