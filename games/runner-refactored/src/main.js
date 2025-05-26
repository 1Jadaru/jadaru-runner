import { GameEngine } from './core/GameEngine.js';

/**
 * Main entry point for the Jadaru Runner game
 * Refactored with modern ES6+ modules and best practices
 */
class JadaruRunner {
  constructor() {
    this.gameEngine = null;
    this.isInitialized = false;
  }
  
  /**
   * Initialize and start the game
   */
  async init() {
    try {
      console.log('🎮 Initializing Jadaru Runner (Refactored)...');
      
      // Show loading screen
      this.showLoadingScreen();
      
      // Create and initialize game engine
      this.gameEngine = new GameEngine();
      await this.gameEngine.init();
      
      // Setup global event handlers
      this.setupGlobalHandlers();
      
      // Hide loading screen
      this.hideLoadingScreen();
      
      this.isInitialized = true;
      console.log('✅ Game initialized successfully!');
      
      // Start the game
      this.startGame();
      
    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
      this.showErrorScreen(error);
    }
  }
  
  /**
   * Start the main game
   */
  startGame() {
    if (!this.isInitialized) {
      console.warn('Game not initialized');
      return;
    }
    
    console.log('🚀 Starting game...');
    
    // Resume audio context on user interaction
    const audioSystem = this.gameEngine.getSystem('AudioSystem');
    if (audioSystem) {
      audioSystem.resumeAudioContext();
      audioSystem.startBackgroundMusic();
    }
    
    // Show notification
    const uiSystem = this.gameEngine.getSystem('UISystem');
    if (uiSystem) {
      uiSystem.showNotification('Game Started! Use arrow keys or touch controls to play.', 4000);
    }
  }
    /**
   * Setup global event handlers
   */
  setupGlobalHandlers() {
    // Handle visibility change (pause on tab switch) - only when actually hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.gameEngine && this.gameEngine.isRunning) {
        this.pauseGame();
      } else if (!document.hidden && this.gameEngine && !this.gameEngine.isRunning && !this.gameEngine.gameOver) {
        this.resumeGame();
      }
    });
    
    // Disable aggressive focus/blur handling that's causing issues
    // window.addEventListener('blur', () => this.pauseGame());
    // window.addEventListener('focus', () => this.resumeGame());
    
    // Handle beforeunload
    window.addEventListener('beforeunload', (event) => {
      if (this.gameEngine && !this.gameEngine.gameOver) {
        event.preventDefault();
        event.returnValue = 'You have a game in progress. Are you sure you want to leave?';
      }
    });
    
    // Debug key bindings (development only)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.setupDebugKeys();
    }
  }
  
  /**
   * Setup debug key bindings for development
   */
  setupDebugKeys() {
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.code) {
          case 'KeyR':
            event.preventDefault();
            this.restartGame();
            break;
          case 'KeyP':
            event.preventDefault();
            this.togglePause();
            break;
          case 'KeyW':
            event.preventDefault();
            this.toggleWireframe();
            break;
          case 'KeyS':
            event.preventDefault();
            this.takeScreenshot();
            break;
        }
      }
    });
    
    console.log('🔧 Debug keys enabled: Ctrl+R (restart), Ctrl+P (pause), Ctrl+W (wireframe), Ctrl+S (screenshot)');
  }
    /**
   * Show loading screen
   */
  showLoadingScreen() {
    const uiSystem = this.gameEngine?.getSystem('UISystem');
    if (uiSystem) {
      uiSystem.showLoading();
    } else {
      // Fallback loading screen - create a new div instead of overwriting body
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'jadaru-loading';
      loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        color: #00ffcc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: monospace;
        font-size: 2rem;
        z-index: 100;
      `;
      loadingDiv.textContent = 'Loading Jadaru Runner...';
      document.body.appendChild(loadingDiv);
    }
  }  /**
   * Hide loading screen
   */
  hideLoadingScreen() {
    const uiSystem = this.gameEngine?.getSystem('UISystem');
    
    if (uiSystem) {
      uiSystem.hideLoading();
    }
    
    // Always check and remove fallback loading screen regardless of UISystem
    const loadingDiv = document.getElementById('jadaru-loading');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }
  
  /**
   * Show error screen
   */
  showErrorScreen(error) {    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        color: #ff6666;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: monospace;
        text-align: center;
        padding: 20px;
        z-index: 100;
      ">
        <h1>🚫 Game Error</h1>
        <p>Failed to initialize the game.</p>
        <p style="color: #ffaa66;">${error.message}</p>
        <button onclick="location.reload()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #ff6666;
          color: black;
          border: none;
          border-radius: 5px;
          font-family: monospace;
          cursor: pointer;
        ">Reload Game</button>
        <p style="color: #888; font-size: 0.9rem; margin-top: 20px;">
          Check the browser console for more details.
        </p>
      </div>
    `;
  }
  
  /**
   * Pause the game
   */
  pauseGame() {
    if (this.gameEngine && this.gameEngine.isRunning) {
      this.gameEngine.isRunning = false;
      console.log('⏸️ Game paused');
    }
  }
  
  /**
   * Resume the game
   */
  resumeGame() {
    if (this.gameEngine && !this.gameEngine.isRunning && !this.gameEngine.gameOver) {
      this.gameEngine.isRunning = true;
      this.gameEngine.gameLoop();
      console.log('▶️ Game resumed');
    }
  }
  
  /**
   * Toggle pause state
   */
  togglePause() {
    if (this.gameEngine) {
      if (this.gameEngine.isRunning) {
        this.pauseGame();
        const uiSystem = this.gameEngine.getSystem('UISystem');
        if (uiSystem) {
          uiSystem.showPause();
        }
      } else {
        this.resumeGame();
      }
    }
  }
  
  /**
   * Restart the game
   */
  restartGame() {
    if (this.gameEngine) {
      this.gameEngine.restart();
      console.log('🔄 Game restarted');
    }
  }
  
  /**
   * Toggle wireframe mode (debug)
   */
  toggleWireframe() {
    const renderSystem = this.gameEngine?.getSystem('RenderSystem');
    if (renderSystem) {
      renderSystem.toggleWireframe();
      console.log('🔧 Wireframe mode toggled');
    }
  }
  
  /**
   * Take screenshot (debug)
   */
  takeScreenshot() {
    const renderSystem = this.gameEngine?.getSystem('RenderSystem');
    if (renderSystem) {
      renderSystem.takeScreenshot();
      console.log('📸 Screenshot taken');
    }
  }
  
  /**
   * Get game statistics (for debugging)
   */
  getGameStats() {
    if (!this.gameEngine) return null;
    
    return {
      score: this.gameEngine.score,
      topScore: this.gameEngine.topScore,
      speed: this.gameEngine.speed,
      isRunning: this.gameEngine.isRunning,
      gameOver: this.gameEngine.gameOver,
      entityCount: this.gameEngine.entities.size,
      systemCount: this.gameEngine.systems.size
    };
  }
}

// Initialize and start the game when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  // Make game instance globally available for debugging
  window.jadaruRunner = new JadaruRunner();
  
  try {
    await window.jadaruRunner.init();
  } catch (error) {
    console.error('Failed to start game:', error);
  }
});

// Handle errors globally
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Export for module systems
export { JadaruRunner };
