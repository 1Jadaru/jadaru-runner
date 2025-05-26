import * as THREE from 'three';
import { CONFIG, STORAGE_KEYS } from './config.js';

/**
 * Core game engine managing the main game loop and state
 */
export class GameEngine {  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.isRunning = false;
    this.gameOver = false;
    this.score = 0;
    this.topScore = parseInt(localStorage.getItem(STORAGE_KEYS.TOP_SCORE)) || 0;
    this.speed = CONFIG.GAME.INITIAL_SPEED;
    this.distance = 0;
    
    // Game state object for easy access by systems
    this.gameState = {
      score: 0,
      distance: 0,
      speed: CONFIG.GAME.INITIAL_SPEED,
      topScore: this.topScore
    };
    
    // Game objects
    this.entities = new Map();
    this.systems = new Map();
      // Performance monitoring
    this.performanceOptimized = false;
    this.fpsMonitor = {
      frames: 0,
      lastTime: performance.now(),
      
      update: () => {
        this.fpsMonitor.frames++;
        const now = performance.now();
        if (now - this.fpsMonitor.lastTime > CONFIG.PERFORMANCE.FPS_CHECK_INTERVAL) {
          const fps = this.fpsMonitor.frames * 1000 / (now - this.fpsMonitor.lastTime);
          if (fps < CONFIG.PERFORMANCE.TARGET_FPS && !this.performanceOptimized) {
            this.optimizePerformance();
          }
          this.fpsMonitor.frames = 0;
          this.fpsMonitor.lastTime = now;
        }
      }
    };
  }
  
  /**
   * Initialize the game engine
   */
  async init() {
    this.initRenderer();
    this.initScene();
    this.initCamera();
    
    // Initialize systems and entities through dependency injection
    await this.loadSystems();
    await this.loadEntities();
    
    this.isRunning = true;
    this.gameLoop();
  }
    /**
   * Initialize Three.js renderer
   */
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Updated API
    document.body.appendChild(this.renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  /**
   * Initialize Three.js scene
   */
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.SCENE.BACKGROUND_COLOR);
    this.scene.fog = new THREE.FogExp2(CONFIG.SCENE.BACKGROUND_COLOR, CONFIG.SCENE.FOG_DENSITY);
  }
  
  /**
   * Initialize camera
   */
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      CONFIG.CAMERA.NEAR,
      CONFIG.CAMERA.FAR
    );
    this.camera.position.set(
      CONFIG.CAMERA.POSITION.x,
      CONFIG.CAMERA.POSITION.y,
      CONFIG.CAMERA.POSITION.z
    );
  }
    /**
   * Load game systems
   */
  async loadSystems() {
    // Load UI system first
    const { UISystem } = await import('../ui/UISystem.js');
    this.systems.set('UISystem', new UISystem(this));
    
    // Load environment system
    const { EnvironmentSystem } = await import('../environment/EnvironmentSystem.js');
    this.systems.set('EnvironmentSystem', new EnvironmentSystem(this));
    
    // Load core systems
    const systemModules = [
      'InputSystem',
      'PhysicsSystem',
      'RenderSystem',
      'CollisionSystem',
      'AudioSystem'
    ];
    
    for (const systemName of systemModules) {
      try {
        const module = await import(`../systems/${systemName}.js`);
        const SystemClass = module[systemName];
        this.systems.set(systemName, new SystemClass(this));
      } catch (error) {
        console.warn(`Failed to load system: ${systemName}`, error);
      }
    }
  }
    /**
   * Load game entities
   */
  async loadEntities() {
    // Load entity factory
    const { GameFactory } = await import('./GameFactory.js');
    this.gameFactory = new GameFactory(this);
    
    // Create all game entities
    this.gameFactory.createAllEntities();
  }
    /**
   * Main game loop
   */
  gameLoop() {
    if (!this.isRunning || this.gameOver) return;
    
    requestAnimationFrame(() => this.gameLoop());
    
    // Update performance monitoring
    this.fpsMonitor.update();
    
    // Update game state
    this.updateGameState();
    
    // Update all systems
    for (const system of this.systems.values()) {
      if (system.update) {
        system.update();
      }
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Update game state values
   */
  updateGameState() {
    // Update distance based on speed
    this.distance += this.speed;
    
    // Sync game state object
    this.gameState.score = this.score;
    this.gameState.distance = this.distance;
    this.gameState.speed = this.speed;
    this.gameState.topScore = this.topScore;
  }
  
  /**
   * Handle window resize
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  /**
   * Add entity to the game
   */
  addEntity(name, entity) {
    this.entities.set(name, entity);
    if (entity.mesh) {
      this.scene.add(entity.mesh);
    }
  }
  
  /**
   * Remove entity from the game
   */
  removeEntity(name) {
    const entity = this.entities.get(name);
    if (entity && entity.mesh) {
      this.scene.remove(entity.mesh);
    }
    this.entities.delete(name);
  }
  
  /**
   * Get entity by name
   */
  getEntity(name) {
    return this.entities.get(name);
  }
  
  /**
   * Get system by name
   */
  getSystem(name) {
    return this.systems.get(name);
  }
  
  /**
   * Update score
   */
  updateScore(points = 1) {
    this.score += points;
    if (this.score > this.topScore) {
      this.topScore = this.score;
      localStorage.setItem(STORAGE_KEYS.TOP_SCORE, this.topScore);
    }
  }
  
  /**
   * End the game
   */
  endGame() {
    this.gameOver = true;
    this.isRunning = false;
    
    const uiSystem = this.getSystem('UISystem');
    if (uiSystem) {
      uiSystem.showGameOver(this.score, this.topScore);
    }
  }
    /**
   * Restart the game
   */
  restart() {
    this.gameOver = false;
    this.score = 0;
    this.speed = CONFIG.GAME.INITIAL_SPEED;
    this.isRunning = true;
    
    // Reset all entities
    if (this.gameFactory) {
      this.gameFactory.resetAllEntities();
    }
    
    // Reset all systems
    for (const system of this.systems.values()) {
      if (system.reset) {
        system.reset();
      }
    }
    
    this.gameLoop();
  }
    /**
   * Optimize performance when FPS drops
   */
  optimizePerformance() {
    // Only optimize once to prevent spam
    if (this.performanceOptimized) return;
    
    this.performanceOptimized = true;
    console.log('Optimizing performance...');
    
    // Reduce shadow quality
    this.renderer.shadowMap.enabled = false;
    
    // Reduce particle effects
    const trailSystem = this.getSystem('TrailSystem');
    if (trailSystem) {
      trailSystem.reduceQuality();
    }
  }
}
