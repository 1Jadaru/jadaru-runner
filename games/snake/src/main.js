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

    // Setup enhanced UI handlers
    this.setupEnhancedUI();
  }
  setupEnhancedUI() {
    // Setup fullscreen functionality
    this.setupFullscreenToggle();
    
    // Setup sound toggle
    this.setupSoundToggle();
    
    // Setup virtual controls toggle
    this.setupVirtualControlsToggle();
    
    // Setup game mode buttons
    this.setupGameModeButtons();
    
    // Setup start game button
    this.setupStartGameButton();
    
    // Setup score animations
    this.setupScoreAnimations();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  setupFullscreenToggle() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
      
      // Update button text based on fullscreen state
      document.addEventListener('fullscreenchange', () => {
        const icon = fullscreenBtn.querySelector('.nav-icon');
        const text = fullscreenBtn.querySelector('.nav-text');
        if (document.fullscreenElement) {
          if (icon) icon.textContent = '⛶';
          if (text) text.textContent = 'Exit Fullscreen';
        } else {
          if (icon) icon.textContent = '⛶';
          if (text) text.textContent = 'Fullscreen';
        }
      });
    }
  }

  setupSoundToggle() {
    const soundBtn = document.getElementById('toggle-sound');
    if (soundBtn) {
      let soundEnabled = true;
      
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const icon = soundBtn.querySelector('.btn-icon');
        const text = soundBtn.querySelector('.btn-text');
        
        if (soundEnabled) {
          soundBtn.classList.remove('muted');
          if (icon) icon.textContent = '🔊';
          if (text) text.textContent = 'Sound On';
        } else {
          soundBtn.classList.add('muted');
          if (icon) icon.textContent = '🔇';
          if (text) text.textContent = 'Sound Off';
        }
        
        // Notify game about sound state change
        if (this.game && this.game.setSoundEnabled) {
          this.game.setSoundEnabled(soundEnabled);
        }
      });
    }
  }

  setupStartGameButton() {
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (typeof gtag === 'function') {
          gtag('event', 'game_start', {
            'event_category': 'Games',
            'event_label': 'Snake Game 3D (in-game)'
          });
        }
        if (this.game) {
          if (this.game.state === 'waiting' || this.game.state === 'gameOver') {
            this.game.startGame();
          } else if (this.game.state === 'playing') {
            this.game.pauseGame();
          } else if (this.game.state === 'paused') {
            this.game.resumeGame();
          }
          
          // Hide overlay
          const overlay = document.getElementById('game-overlay');
          if (overlay) {
            overlay.classList.add('hidden');
          }
        }
      });
    }
  }

  setupScoreAnimations() {
    // Set up score change observers
    this.lastScore = 0;
    this.lastLevel = 1;
    
    // Monitor score changes
    this.scoreUpdateInterval = setInterval(() => {
      const scoreElement = document.getElementById('score');
      const levelElement = document.getElementById('level');
      
      if (this.game && scoreElement) {
        const currentScore = this.game.score || 0;
        if (currentScore !== this.lastScore && currentScore > this.lastScore) {
          scoreElement.classList.add('score-update');
          setTimeout(() => {
            scoreElement.classList.remove('score-update');
          }, 400);
          this.lastScore = currentScore;
        }
      }
      
      if (this.game && levelElement) {
        const currentLevel = this.game.level || 1;
        if (currentLevel !== this.lastLevel && currentLevel > this.lastLevel) {
          levelElement.classList.add('level-up');
          setTimeout(() => {
            levelElement.classList.remove('level-up');
          }, 600);
          this.lastLevel = currentLevel;
        }
      }
    }, 100);
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'Escape':
          event.preventDefault();
          this.showGameMenu();
          break;
        case 'F11':
          event.preventDefault();
          this.toggleFullscreen();
          break;
        case 'KeyM':
          event.preventDefault();
          this.toggleSound();
          break;
      }
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  toggleSound() {
    const soundBtn = document.getElementById('toggle-sound');
    if (soundBtn) {
      soundBtn.click();
    }
  }

  showGameMenu() {
    const overlay = document.getElementById('game-overlay');
    const messageElement = document.getElementById('game-message');
    
    if (overlay && messageElement) {
      const isPaused = this.game && this.game.state === 'playing';
      
      if (isPaused) {
        this.game.pauseGame();
      }
      
      messageElement.innerHTML = `
        <div class="message-icon">⚙️</div>
        <h2>Game Menu</h2>
        <div class="menu-options">
          <button class="menu-btn" onclick="window.snakeGame.resumeGame()">
            <span class="btn-icon">▶️</span>
            <span>Resume Game</span>
          </button>
          <button class="menu-btn" onclick="window.snakeGame.restartGame()">
            <span class="btn-icon">🔄</span>
            <span>Restart Game</span>
          </button>
          <button class="menu-btn" onclick="window.location.href='/'">
            <span class="btn-icon">🏠</span>
            <span>Main Menu</span>
          </button>
        </div>
      `;
      overlay.classList.remove('hidden');
    }
  }

  resumeGame() {
    if (this.game && this.game.state === 'paused') {
      this.game.resumeGame();
    }
    const overlay = document.getElementById('game-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }
  restartGame() {
    if (this.game) {
      this.game.resetGame();
      this.game.startGame();
    }
    const overlay = document.getElementById('game-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  setupGameModeButtons() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    
    modeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const mode = button.getAttribute('data-mode');
        
        // Update active button
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Change game mode
        if (this.game) {
          this.game.changeGameMode(mode);
        }
        
        // Update button text based on mode
        const modeDescriptions = {
          classic: 'Classic Snake gameplay with normal speed',
          speed: 'Fast-paced gameplay with increased speed',
          survival: 'Slower speed but more challenging obstacles'
        };
        
        // Show mode description
        this.showModeDescription(modeDescriptions[mode] || '');
      });
    });
  }
  
  showModeDescription(description) {
    // Create or update description element
    let descElement = document.getElementById('mode-description');
    if (!descElement) {
      descElement = document.createElement('div');
      descElement.id = 'mode-description';
      descElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        z-index: 1000;
        font-size: 1rem;
        text-align: center;
        max-width: 300px;
        backdrop-filter: blur(10px);
      `;
      document.body.appendChild(descElement);
    }
    
    descElement.textContent = description;
    
    // Hide after 2 seconds
    setTimeout(() => {
      if (descElement.parentNode) {
        descElement.parentNode.removeChild(descElement);
      }
    }, 2000);
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
        const icon = toggleButton.querySelector('.btn-icon');
        const text = toggleButton.querySelector('.btn-text');
        if (icon) icon.textContent = '📱';
        if (text) text.textContent = 'Hide Virtual Controls';
      } else {
        mobileControls.style.display = 'none';
        const icon = toggleButton.querySelector('.btn-icon');
        const text = toggleButton.querySelector('.btn-text');
        if (icon) icon.textContent = '📱';
        if (text) text.textContent = 'Show Virtual Controls';
      }
      
      toggleButton.addEventListener('click', () => {
        const isVisible = mobileControls.style.display === 'flex';
        const icon = toggleButton.querySelector('.btn-icon');
        const text = toggleButton.querySelector('.btn-text');
        
        if (isVisible) {
          mobileControls.style.display = 'none';
          if (icon) icon.textContent = '📱';
          if (text) text.textContent = 'Show Virtual Controls';
        } else {
          mobileControls.style.display = 'flex';
          if (icon) icon.textContent = '📱';
          if (text) text.textContent = 'Hide Virtual Controls';
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
    // Clear intervals
    if (this.scoreUpdateInterval) {
      clearInterval(this.scoreUpdateInterval);
    }
    
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
