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
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
      // Game timing
    this.moveInterval = 200; // milliseconds between moves
    this.lastMoveTime = 0;
    this.deltaTimeAccumulator = 0;
    
    // Game objects
    this.grid = new Grid(400, 400, 20); // Smaller grid for easier testing
    this.snake = null;
    this.food = null;
    this.inputHandler = null;
    
    // UI elements
    this.scoreElement = document.getElementById('score');
    this.highScoreElement = document.getElementById('high-score');
    this.gameOverlay = document.getElementById('game-overlay');
    this.gameMessage = document.getElementById('game-message');
    
    this.init();
  }

  init() {
    this.setupScene();
    this.createGameObjects();
    this.setupInput();
    this.updateUI();    this.setupGameLoop();
  }

  setupScene() {
    // Camera is already set up in main.js
    
    // Create ground that matches the grid size
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {
      width: this.grid.width,
      height: this.grid.height
    }, this.scene);

    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);    groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
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
  }

  setupInput() {
    this.inputHandler = new InputHandler();
    
    this.inputHandler.onInput('start', () => this.handleStartInput());
    this.inputHandler.onInput('pause', () => this.handlePauseInput());
  }
  setupGameLoop() {
    this.scene.onBeforeRenderObservable.add((scene, eventState) => {
      const deltaTime = scene.getEngine().getDeltaTime();
      this.update(deltaTime);
    });
  }
  update(deltaTime) {
    if (this.state !== 'playing') {
      return;
    }

    this.deltaTimeAccumulator += deltaTime;

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
    const shouldGrow = this.checkFoodConsumption();
    if (shouldGrow) {
      this.snake.grow(); // Tell snake to grow on next move
      this.consumeFood();
    }

    // Move snake (it will handle tail removal internally based on growing flag)
    this.snake.move();

    // Check collisions after moving
    if (this.checkCollisions()) {
      this.gameOver();
      return;
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
      return false; // No consumption if no valid head position
    }
    return this.food.isAtPosition(headPos);
  }
  consumeFood() {
    // Create eat effect
    this.food.createEatEffect();
    
    // Increase score
    this.score += 10;
    this.updateScore();
    
    // Spawn new food
    this.spawnFood();
    
    // Increase speed slightly
    this.moveInterval = Math.max(80, this.moveInterval - 2);
  }

  spawnFood() {
    const snakePositions = this.snake.getBodyPositions();
    this.food.spawn(snakePositions);
  }  handleStartInput() {
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
  }  startGame() {
    this.state = 'playing';
    this.hideOverlay();
    this.inputHandler.reset();
  }

  pauseGame() {
    this.state = 'paused';
    this.showOverlay('Game Paused', 'Press SPACE or P to resume');
  }

  resumeGame() {
    this.state = 'playing';
    this.hideOverlay();
  }

  gameOver() {
    this.state = 'gameOver';
    this.snake.createDeathEffect();
    
    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore.toString());
      this.updateHighScore();
      this.showOverlay('New High Score!', `Score: ${this.score}\\nPress SPACE to play again`);
    } else {
      this.showOverlay('Game Over', `Score: ${this.score}\\nPress SPACE to play again`);
    }
  }

  restartGame() {
    // Reset game state
    this.score = 0;
    this.moveInterval = 200;
    this.deltaTimeAccumulator = 0;
    
    // Reset game objects
    this.snake.reset();
    this.spawnFood();
    
    // Update UI
    this.updateScore();
    
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

  updateHighScore() {
    if (this.highScoreElement) {
      this.highScoreElement.textContent = this.highScore;
    }
  }

  updateUI() {
    this.updateScore();
    this.updateHighScore();
  }

  showOverlay(title, message) {
    if (this.gameOverlay && this.gameMessage) {
      this.gameMessage.innerHTML = `<h2>${title}</h2><p>${message.replace('\\n', '<br>')}</p>`;
      this.gameOverlay.classList.remove('hidden');
    }
  }

  hideOverlay() {
    if (this.gameOverlay) {
      this.gameOverlay.classList.add('hidden');
    }
  }

  /**
   * Get current game statistics
   * @returns {Object} Game stats
   */
  getStats() {
    return {
      score: this.score,
      highScore: this.highScore,
      snakeLength: this.snake ? this.snake.getBodyPositions().length : 0,
      gameSpeed: 200 - this.moveInterval + 200,
      state: this.state
    };
  }

  /**
   * Dispose of game resources
   */
  dispose() {
    if (this.snake) {
      this.snake.dispose();
    }
    
    if (this.food) {
      this.food.dispose();
    }
    
    // Remove event listeners
    if (this.inputHandler) {
      // InputHandler manages its own cleanup
    }
  }
}
