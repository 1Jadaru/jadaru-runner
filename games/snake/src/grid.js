/**
 * Grid system for the Snake game
 * Handles the game field dimensions and coordinate system
 */

export class Grid {  constructor(width, height, cellSize = 20) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.floor(width / cellSize);
    this.rows = Math.floor(height / cellSize);
    
    console.log(`Grid initialized: ${this.cols}x${this.rows} cells, cellSize: ${this.cellSize}`);
  }

  /**
   * Check if coordinates are within grid bounds
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if within bounds
   */
  isWithinBounds(x, y) {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }
  /**
   * Convert grid coordinates to world position
   * @param {number} gridX - Grid X coordinate
   * @param {number} gridY - Grid Y coordinate
   * @returns {Object} World position {x, y, z}
   */  gridToWorld(gridX, gridY) {
    // Center the grid around origin
    const worldX = -(gridX - this.cols / 2 + 0.5) * this.cellSize; // Negated X to fix left/right controls
    const worldZ = (gridY - this.rows / 2 + 0.5) * this.cellSize;
    
    return {
      x: worldX,
      y: 0, // Keep on ground level
      z: worldZ,
    };
  }

  /**
   * Convert world position to grid coordinates
   * @param {number} worldX - World X coordinate
   * @param {number} worldZ - World Z coordinate
   * @returns {Object} Grid position {x, y}
   */
  worldToGrid(worldX, worldZ) {
    return {
      x: Math.floor(worldX / this.cellSize + this.cols / 2),
      y: Math.floor(worldZ / this.cellSize + this.rows / 2),
    };
  }

  /**
   * Get a random valid grid position
   * @param {Array} excludePositions - Array of positions to exclude
   * @returns {Object} Random grid position {x, y}
   */
  getRandomPosition(excludePositions = []) {
    let position;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      position = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows),
      };
      attempts++;
    } while (
      attempts < maxAttempts &&
      excludePositions.some(
        (pos) => pos.x === position.x && pos.y === position.y
      )
    );

    return position;
  }

  /**
   * Get the center position of the grid
   * @returns {Object} Center grid position {x, y}
   */
  getCenterPosition() {
    return {
      x: Math.floor(this.cols / 2),
      y: Math.floor(this.rows / 2),
    };
  }
}
