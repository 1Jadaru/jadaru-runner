/**
 * UI system managing game interface elements
 */
export class UISystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.elements = {};
    this.init();
  }
  
  /**
   * Initialize UI elements
   */
  init() {
    this.createScoreOverlay();
    this.createMenuButton();
    this.createGameOverOverlay();
    this.createRestartButton();
  }
  
  /**
   * Create score display overlay
   */
  createScoreOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'score-overlay';
    overlay.className = 'ui-overlay';
    overlay.innerHTML = `
      Score: <span id="score">0</span><br>
      Top Score: <span id="top-score">${this.gameEngine.topScore}</span>
    `;
    
    document.body.appendChild(overlay);
    this.elements.scoreOverlay = overlay;
    this.elements.scoreElement = document.getElementById('score');
    this.elements.topScoreElement = document.getElementById('top-score');
  }
  
  /**
   * Create menu button
   */
  createMenuButton() {
    const button = document.createElement('button');
    button.id = 'menu-btn';
    button.className = 'ui-overlay';
    button.textContent = 'Menu';
    button.onclick = () => this.showMenuConfirm();
    
    document.body.appendChild(button);
    this.elements.menuButton = button;
  }
  
  /**
   * Create game over overlay
   */
  createGameOverOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    overlay.style.display = 'none';
    
    document.body.appendChild(overlay);
    this.elements.gameOverOverlay = overlay;
  }
  
  /**
   * Create restart button (hidden initially)
   */
  createRestartButton() {
    const button = document.createElement('button');
    button.id = 'restart-btn';
    button.className = 'game-over-btn';
    button.textContent = 'Play Again';
    button.onclick = () => this.restartGame();
    button.style.display = 'none';
    
    document.body.appendChild(button);
    this.elements.restartButton = button;
  }
  
  /**
   * Update score display
   */
  updateScore(score) {
    if (this.elements.scoreElement) {
      this.elements.scoreElement.textContent = score;
    }
  }
  
  /**
   * Update top score display
   */
  updateTopScore(topScore) {
    if (this.elements.topScoreElement) {
      this.elements.topScoreElement.textContent = topScore;
    }
  }
  
  /**
   * Animate score increase
   */
  animateScoreIncrease() {
    if (this.elements.scoreElement) {
      this.elements.scoreElement.style.transform = 'scale(1.2)';
      this.elements.scoreElement.style.color = '#ffff00';
      
      setTimeout(() => {
        this.elements.scoreElement.style.transform = 'scale(1)';
        this.elements.scoreElement.style.color = '#00ffcc';
      }, 200);
    }
  }
  
  /**
   * Show game over screen
   */
  showGameOver(finalScore, topScore) {
    const overlay = this.elements.gameOverOverlay;
    if (!overlay) return;
    
    overlay.innerHTML = `
      <h1>Game Over!</h1>
      <h2>Final Score: ${finalScore}</h2>
      <h2>Top Score: ${topScore}</h2>
      <button class="game-over-btn" onclick="location.reload()">Play Again</button>
      <button class="game-over-btn" onclick="window.location.href='/'">Return to Menu</button>
    `;
    
    overlay.style.display = 'flex';
    
    // Animate in
    setTimeout(() => {
      overlay.classList.add('visible');
    }, 100);
    
    // Hide other UI elements
    this.hideGameUI();
  }
  
  /**
   * Hide game UI elements during game over
   */
  hideGameUI() {
    const inputSystem = this.gameEngine.getSystem('InputSystem');
    if (inputSystem) {
      inputSystem.hideTouchControls();
    }
    
    if (this.elements.menuButton) {
      this.elements.menuButton.style.display = 'none';
    }
  }
  
  /**
   * Show game UI elements
   */
  showGameUI() {
    const inputSystem = this.gameEngine.getSystem('InputSystem');
    if (inputSystem) {
      inputSystem.showTouchControls();
    }
    
    if (this.elements.menuButton) {
      this.elements.menuButton.style.display = 'block';
    }
    
    if (this.elements.gameOverOverlay) {
      this.elements.gameOverOverlay.style.display = 'none';
      this.elements.gameOverOverlay.classList.remove('visible');
    }
  }
  
  /**
   * Show menu confirmation dialog
   */
  showMenuConfirm() {
    const confirmed = confirm('Return to main site? Your current game will be lost.');
    if (confirmed) {
      window.location.href = '/';
    }
  }
  
  /**
   * Restart the game
   */
  restartGame() {
    this.showGameUI();
    this.gameEngine.restart();
    this.updateScore(0);
    if (typeof gtag === 'function') {
      gtag('event', 'game_start', {
        'event_category': 'Games',
        'event_label': 'Runner Game Refactored (in-game)'
      });
    }
  }
  
  /**
   * Show loading screen
   */
  showLoading() {
    const loader = document.createElement('div');
    loader.id = 'loading-overlay';
    loader.style.cssText = `
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
      z-index: 50;
    `;
    loader.textContent = 'Loading...';
    
    document.body.appendChild(loader);
    this.elements.loadingOverlay = loader;
  }
  /**
   * Hide loading screen
   */
  hideLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.remove();
      delete this.elements.loadingOverlay;
    }
  }
  
  /**
   * Show pause screen
   */
  showPause() {
    const overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      color: #00ffcc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      z-index: 25;
    `;
    overlay.innerHTML = `
      <h1>Paused</h1>
      <button class="game-over-btn" onclick="this.parentElement.remove()">Resume</button>
    `;
    
    document.body.appendChild(overlay);
    this.elements.pauseOverlay = overlay;
  }
  
  /**
   * Toggle control visibility
   */
  toggleControls() {
    const inputSystem = this.gameEngine.getSystem('InputSystem');
    if (inputSystem) {
      inputSystem.toggleTouchControls();
    }
  }
  
  /**
   * Update method called each frame
   */
  update() {
    // Update score if it changed
    if (this.elements.scoreElement) {
      const currentScore = parseInt(this.elements.scoreElement.textContent);
      if (currentScore !== this.gameEngine.score) {
        this.updateScore(this.gameEngine.score);
      }
    }
    
    // Update top score if it changed
    if (this.elements.topScoreElement) {
      const currentTopScore = parseInt(this.elements.topScoreElement.textContent);
      if (currentTopScore !== this.gameEngine.topScore) {
        this.updateTopScore(this.gameEngine.topScore);
      }
    }
  }
  
  /**
   * Create notification popup
   */
  showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 255, 204, 0.9);
      color: black;
      padding: 20px;
      border-radius: 10px;
      font-family: monospace;
      font-weight: bold;
      z-index: 40;
      animation: fadeInOut ${duration}ms ease-in-out;
    `;
    notification.textContent = message;
    
    // Add fade animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, duration);
  }
  
  /**
   * Reset UI to initial state
   */
  reset() {
    this.updateScore(0);
    this.showGameUI();
  }
  
  /**
   * Dispose of UI system resources
   */
  dispose() {
    Object.values(this.elements).forEach(element => {
      if (element && element.remove) {
        element.remove();
      }
    });
    this.elements = {};
  }
}
