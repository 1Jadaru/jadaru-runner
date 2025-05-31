/**
 * Main entry point for the Snake game
 * Initializes Babylon.js scene and starts the game
 */

import { Game } from './game.js';

class SnakeGameApp {
  constructor() {
    this.canvas = null;
    this.engine = null;
    this.scene = null;
    this.game = null;
    
    this.init();
  }

  async init() {
    try {
      await this.setupBabylon();
      this.startGame();
      this.setupWindowHandlers();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to initialize game. Please refresh and try again.');
    }
  }
  async setupBabylon() {
    // Get canvas element
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }

    // Create Babylon.js engine with adaptive sizing
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      adaptToDeviceRatio: true
    });

    // Create scene
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.actionManager = new BABYLON.ActionManager(this.scene);

    // Setup camera
    this.setupCamera();

    // Setup post-processing
    this.setupPostProcessing();    // Start render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    // Force resize to ensure proper canvas dimensions
    this.engine.resize();
    
    console.log('Babylon.js setup complete - Canvas size:', this.canvas.width, 'x', this.canvas.height);
  }

  setupCamera() {
    // Create a universal camera positioned much higher for full game view
    const camera = new BABYLON.UniversalCamera(
      'camera',
      new BABYLON.Vector3(0, 300, 0), // Much higher to see entire game area
      this.scene
    );

    // Set camera to look straight down
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    
    // Adjust field of view for wider perspective
    camera.fov = Math.PI / 2; // 90 degrees for wider view
    
    // Set as active camera
    this.scene.activeCamera = camera;
    
    // Disable camera controls (no user interaction)
    camera.inputs.clear();
    
    console.log('Camera setup complete - Position:', camera.position, 'Target:', camera.getTarget(), 'FOV:', camera.fov);
  }

  setupPostProcessing() {
    // Add subtle bloom effect
    const pipeline = new BABYLON.DefaultRenderingPipeline(
      'defaultPipeline',
      true,
      this.scene,
      [this.scene.activeCamera]
    );

    // Configure bloom
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.8;
    pipeline.bloomWeight = 0.3;
    pipeline.bloomKernel = 64;
    pipeline.bloomScale = 0.5;

    // Add FXAA for anti-aliasing
    pipeline.fxaaEnabled = true;

    // Add tone mapping
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
    pipeline.imageProcessing.exposure = 1.0;
  }

  startGame() {
    // Create and start the game
    this.game = new Game(this.scene);
    
    // Log game initialization
    console.log('🐍 Snake game initialized successfully!');
    console.log('Controls: Arrow keys or WASD to move, SPACE to start/pause');
  }

  setupWindowHandlers() {
    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Handle window focus/blur for auto-pause
    window.addEventListener('blur', () => {
      if (this.game && this.game.state === 'playing') {
        this.game.pauseGame();
      }
    });

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.game && this.game.state === 'playing') {
        this.game.pauseGame();
      }
    });

    // Prevent context menu on canvas
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    // Handle beforeunload for cleanup
    window.addEventListener('beforeunload', () => {
      this.dispose();
    });

    // Setup virtual controls toggle
    this.setupVirtualControlsToggle();
  }

  setupVirtualControlsToggle() {
    const toggleButton = document.getElementById('toggle-virtual-controls');
    const mobileControls = document.getElementById('mobile-controls');
    
    if (toggleButton && mobileControls) {
      // Check if device is mobile/touch
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      // Auto-show on touch devices or small screens
      if (isTouchDevice || isSmallScreen) {
        mobileControls.style.display = 'flex';
        toggleButton.textContent = 'Hide Virtual Controls';
      } else {
        mobileControls.style.display = 'none';
        toggleButton.textContent = 'Show Virtual Controls';
      }
      
      toggleButton.addEventListener('click', () => {
        const isVisible = mobileControls.style.display === 'flex';
        if (isVisible) {
          mobileControls.style.display = 'none';
          toggleButton.textContent = 'Show Virtual Controls';
        } else {
          mobileControls.style.display = 'flex';
          toggleButton.textContent = 'Hide Virtual Controls';
        }
      });
    }
  }

  handleResize() {
    if (this.engine) {
      this.engine.resize();
    }
  }

  showError(message) {
    const overlay = document.getElementById('game-overlay');
    const messageElement = document.getElementById('game-message');
    
    if (overlay && messageElement) {
      messageElement.innerHTML = `<h2>Error</h2><p>${message}</p>`;
      overlay.classList.remove('hidden');
    }
  }

  /**
   * Get game statistics for debugging
   * @returns {Object} Current game stats
   */
  getStats() {
    if (this.game) {
      return {
        ...this.game.getStats(),
        fps: this.engine.getFps().toFixed(0),
        drawCalls: this.scene.getActiveMeshes().length,
        engineInfo: {
          webGL: this.engine.webGLVersion,
          hardwareScaling: this.engine.getHardwareScalingLevel(),
          isWebGPU: this.engine.isWebGPU
        }
      };
    }
    return null;
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    if (this.game) {
      this.game.dispose();
    }
    
    if (this.scene) {
      this.scene.dispose();
    }
    
    if (this.engine) {
      this.engine.dispose();
    }
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.snakeGame = new SnakeGameApp();
});

// Expose global functions for debugging
window.getGameStats = () => {
  return window.snakeGame ? window.snakeGame.getStats() : null;
};

// Add performance monitoring
if (typeof performance !== 'undefined' && performance.mark) {
  performance.mark('snake-game-start');
  
  window.addEventListener('load', () => {
    performance.mark('snake-game-loaded');
    performance.measure('snake-game-load-time', 'snake-game-start', 'snake-game-loaded');
    
    const measure = performance.getEntriesByName('snake-game-load-time')[0];
    console.log(`🎮 Game loaded in ${measure.duration.toFixed(2)}ms`);
  });
}
