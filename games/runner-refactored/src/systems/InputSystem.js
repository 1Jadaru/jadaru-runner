import { CONTROLS } from '../core/config.js';

/**
 * Input system handling keyboard and touch controls
 */
export class InputSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.keys = {
      left: false,
      right: false,
      up: false
    };
    
    this.touchControls = null;
    this.init();
  }
  
  /**
   * Initialize input handlers
   */
  init() {
    this.setupKeyboardControls();
    this.setupTouchControls();
  }
  
  /**
   * Setup keyboard event listeners
   */
  setupKeyboardControls() {
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    document.addEventListener('keyup', (event) => this.handleKeyUp(event));
  }
  /**
   * Handle keydown events
   */
  handleKeyDown(event) {
    const code = event.code;
    
    if (CONTROLS.KEYBOARD.LEFT.includes(code)) {
      this.keys.left = true;
      this.keys.right = false; // Prevent conflicting inputs
      event.preventDefault();
    }
    
    if (CONTROLS.KEYBOARD.RIGHT.includes(code)) {
      this.keys.right = true;
      this.keys.left = false; // Prevent conflicting inputs
      event.preventDefault();
    }    if (CONTROLS.KEYBOARD.JUMP.includes(code)) {
      this.keys.up = true;
      event.preventDefault();
    }
    
    if (CONTROLS.KEYBOARD.ESCAPE.includes(code)) {
      this.gameEngine.endGame();
      event.preventDefault();
    }
  }
  
  /**
   * Handle keyup events
   */
  handleKeyUp(event) {
    const code = event.code;
    
    if (CONTROLS.KEYBOARD.LEFT.includes(code)) {
      this.keys.left = false;
    }
    
    if (CONTROLS.KEYBOARD.RIGHT.includes(code)) {
      this.keys.right = false;
    }
    
    if (CONTROLS.KEYBOARD.JUMP.includes(code)) {
      this.keys.up = false;
    }
  }
  
  /**
   * Setup touch controls for mobile devices
   */
  setupTouchControls() {
    this.createTouchElements();
    this.bindTouchEvents();
  }
  
  /**
   * Create touch control UI elements
   */
  createTouchElements() {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'touch-controls';
    controlsContainer.className = 'ui-overlay';
    controlsContainer.innerHTML = `
      <button class="touch-btn" id="btn-left" aria-label="Move Left">⬅</button>
      <button class="touch-btn" id="btn-up" aria-label="Jump">⬆</button>
      <button class="touch-btn" id="btn-right" aria-label="Move Right">➡</button>
    `;
    
    document.body.appendChild(controlsContainer);
    this.touchControls = controlsContainer;
  }
  
  /**
   * Bind touch and mouse events to control buttons
   */
  bindTouchEvents() {
    const leftBtn = document.getElementById('btn-left');
    const rightBtn = document.getElementById('btn-right');
    const upBtn = document.getElementById('btn-up');
    
    // Left button events
    this.bindButtonEvents(leftBtn, () => {
      this.keys.left = true;
      this.keys.right = false;
    }, () => {
      this.keys.left = false;
    });
    
    // Right button events
    this.bindButtonEvents(rightBtn, () => {
      this.keys.right = true;
      this.keys.left = false;
    }, () => {
      this.keys.right = false;
    });
    
    // Jump button events
    this.bindButtonEvents(upBtn, () => {
      this.keys.up = true;
    }, () => {
      this.keys.up = false;
    });
  }
  
  /**
   * Bind both touch and mouse events to a button
   */
  bindButtonEvents(button, onStart, onEnd) {
    // Touch events
    button.addEventListener('touchstart', (event) => {
      event.preventDefault();
      onStart();
    }, { passive: false });
    
    button.addEventListener('touchend', (event) => {
      event.preventDefault();
      onEnd();
    }, { passive: false });
    
    button.addEventListener('touchcancel', (event) => {
      event.preventDefault();
      onEnd();
    }, { passive: false });
    
    // Mouse events (for testing on desktop)
    button.addEventListener('mousedown', (event) => {
      event.preventDefault();
      onStart();
    });
    
    button.addEventListener('mouseup', (event) => {
      event.preventDefault();
      onEnd();
    });
    
    button.addEventListener('mouseleave', (event) => {
      onEnd();
    });
    
    // Prevent context menu
    button.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }
  
  /**
   * Get current movement input state
   */
  getMovementInput() {
    return {
      left: this.keys.left,
      right: this.keys.right
    };
  }
  
  /**
   * Get current jump input state (single press detection)
   */
  getJumpInput() {
    if (this.keys.up) {
      this.keys.up = false; // Reset to prevent continuous jumping
      return true;
    }
    return false;
  }
  
  /**
   * Check if any movement input is active
   */
  hasMovementInput() {
    return this.keys.left || this.keys.right;
  }
  
  /**
   * Toggle touch controls visibility
   */
  toggleTouchControls() {
    if (this.touchControls) {
      const isVisible = this.touchControls.style.display !== 'none';
      this.touchControls.style.display = isVisible ? 'none' : 'flex';
    }
  }
  
  /**
   * Show touch controls
   */
  showTouchControls() {
    if (this.touchControls) {
      this.touchControls.style.display = 'flex';
    }
  }
  
  /**
   * Hide touch controls
   */
  hideTouchControls() {
    if (this.touchControls) {
      this.touchControls.style.display = 'none';
    }
  }
  
  /**
   * Update method called each frame
   */
  update() {
    // Could be used for input polling or state updates
  }
  
  /**
   * Reset all input states
   */
  reset() {
    this.keys = {
      left: false,
      right: false,
      up: false
    };
  }
  
  /**
   * Dispose of input system resources
   */
  dispose() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    
    if (this.touchControls) {
      this.touchControls.remove();
    }
  }
}
