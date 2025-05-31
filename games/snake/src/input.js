/**
 * Input handler for the Snake game
 * Manages keyboard input and touch controls
 */

export class InputHandler {
  constructor() {
    this.keys = new Set();
    this.lastDirection = { x: 1, y: 0 }; // Initialize with snake's starting direction
    this.directionQueue = [];
    this.callbacks = new Map();
      this.init();
  }

  init() {
    // Keyboard event listeners
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    document.addEventListener('keyup', (event) => this.handleKeyUp(event));
    
    // Touch event listeners for mobile
    this.initTouchControls();
    
    // Virtual control listeners
    this.initVirtualControls();
  }

  handleKeyDown(event) {
    // Prevent default behavior for game keys
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
                     'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyP'];
    
    if (gameKeys.includes(event.code)) {
      event.preventDefault();
    }

    this.keys.add(event.code);
    this.processInput(event.code);
  }
  handleKeyUp(event) {
    this.keys.delete(event.code);
  }
  processInput(keyCode) {
    let direction = null;

    // Movement keys
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        direction = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 'KeyS':
        direction = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'KeyA':
        direction = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'KeyD':
        direction = { x: 1, y: 0 };
        break;      case 'Space':
        this.triggerCallback('start');
        return;
      case 'KeyP':
        this.triggerCallback('pause');
        return;
    }    if (direction) {
      this.queueDirection(direction);
    }
  }

  queueDirection(direction) {
    // Prevent opposite direction inputs
    if (this.lastDirection) {
      const isOpposite = 
        (direction.x === -this.lastDirection.x && direction.y === -this.lastDirection.y);
        if (isOpposite) {
        return;
      }
    }    // Queue direction if it's different from the last one
    if (this.directionQueue.length === 0 || 
        !this.directionsEqual(direction, this.directionQueue[this.directionQueue.length - 1])) {
      this.directionQueue.push(direction);
    }
  }
  getNextDirection() {
    if (this.directionQueue.length > 0) {
      const direction = this.directionQueue.shift();
      this.lastDirection = direction;
      return direction;
    }
    // Always return the last known direction to keep the snake moving
    return this.lastDirection;
  }

  directionsEqual(dir1, dir2) {
    return dir1.x === dir2.x && dir1.y === dir2.y;
  }

  initTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30;

    document.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    document.addEventListener('touchend', (event) => {
      event.preventDefault();
      
      const touch = event.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Check if swipe is long enough
      if (Math.max(absX, absY) < minSwipeDistance) {
        // Tap to start/pause
        this.triggerCallback('start');
        return;
      }

      // Determine swipe direction
      let direction = null;
      if (absX > absY) {
        // Horizontal swipe
        direction = deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      } else {
        // Vertical swipe
        direction = deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      }

      if (direction) {
        this.queueDirection(direction);
      }    });
  }

  initVirtualControls() {
    const virtualButtons = document.querySelectorAll('.dpad-btn, .action-btn');
    
    virtualButtons.forEach((button) => {
      // Prevent scrolling on touch
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
      }, { passive: false });
      
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleVirtualButton(button);
      }, { passive: false });
        // Also handle click for testing on desktop
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleVirtualButton(button);
      });
    });
  }

  handleVirtualButton(button) {
    const direction = button.getAttribute('data-direction');
    const action = button.getAttribute('data-action');
    
    if (direction) {
      let directionVector = null;
      
      switch (direction) {
        case 'up':
          directionVector = { x: 0, y: -1 };
          break;
        case 'down':
          directionVector = { x: 0, y: 1 };
          break;
        case 'left':
          directionVector = { x: -1, y: 0 };
          break;
        case 'right':
          directionVector = { x: 1, y: 0 };
          break;
      }      
      if (directionVector) {
        this.queueDirection(directionVector);
      }
    } else if (action) {
      this.triggerCallback(action);
    }
  }

  /**
   * Register a callback for specific input events
   * @param {string} event - Event name ('start', 'pause')
   * @param {function} callback - Callback function
   */
  onInput(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }  triggerCallback(event) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  /**
   * Check if a key is currently pressed
   * @param {string} keyCode - Key code to check
   * @returns {boolean} True if key is pressed
   */
  isKeyPressed(keyCode) {
    return this.keys.has(keyCode);
  }
  reset() {
    this.directionQueue = [];
    this.lastDirection = { x: 1, y: 0 }; // Reset to initial direction
  }
}
