import { CONFIG } from '../core/config.js';

/**
 * Physics system handling movement, gravity, and game mechanics
 */
export class PhysicsSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.gravity = CONFIG.PLAYER.GRAVITY;
    this.speedIncrement = 0.001; // Gradual speed increase
  }
  
  /**
   * Update physics for all entities
   */
  update() {
    this.updateGameSpeed();
    this.updatePlayerPhysics();
    this.updateObstaclePhysics();
  }
  
  /**
   * Update overall game speed
   */
  updateGameSpeed() {
    // Gradually increase speed over time
    this.gameEngine.speed += this.speedIncrement;
    
    // Cap maximum speed
    if (this.gameEngine.speed > 0.3) {
      this.gameEngine.speed = 0.3;
    }
  }
    /**
   * Update player physics
   */
  updatePlayerPhysics() {
    const player = this.gameEngine.getEntity('player');
    if (!player) return;
    
    // Call the player's update method to handle input and movement
    player.update();
    
    // Apply additional physics constraints
    this.applyScreenBounds(player);
  }  /**
   * Update obstacle physics
   */
  updateObstaclePhysics() {
    // Update all active obstacles
    for (const [name, entity] of this.gameEngine.entities) {
      if (name.startsWith('obstacle_') && entity.isActive) {
        // Call the obstacle's update method to handle movement and effects
        entity.update();
      }
    }
  }
  
  /**
   * Apply screen bounds to prevent entities from going off-screen
   */
  applyScreenBounds(entity) {
    if (!entity.position) return;
    
    const boundary = CONFIG.GAME.LANE_WIDTH / 2 - 0.25; // Account for entity size
    
    if (entity.position.x > boundary) {
      entity.position.x = boundary;
      if (entity.velocity) entity.velocity.x = 0;
    } else if (entity.position.x < -boundary) {
      entity.position.x = -boundary;
      if (entity.velocity) entity.velocity.x = 0;
    }
  }
  
  /**
   * Apply gravity to an entity
   */
  applyGravity(entity) {
    if (!entity.velocity || !entity.position) return;
    
    entity.velocity.y += this.gravity;
    entity.position.y += entity.velocity.y;
    
    // Ground collision
    if (entity.position.y <= CONFIG.PLAYER.POSITION_Y) {
      entity.position.y = CONFIG.PLAYER.POSITION_Y;
      entity.velocity.y = 0;
      if (entity.isJumping !== undefined) {
        entity.isJumping = false;
      }
    }
  }
  
  /**
   * Calculate distance between two points
   */
  getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Interpolate between two values
   */
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }
  
  /**
   * Smooth camera follow
   */
  updateCameraFollow() {
    const player = this.gameEngine.getEntity('player');
    if (!player || !this.gameEngine.camera) return;
    
    const targetX = player.position.x * 0.3; // Slight camera lag for smoothness
    this.gameEngine.camera.position.x = this.lerp(
      this.gameEngine.camera.position.x,
      targetX,
      0.1
    );
  }
  
  /**
   * Reset physics system
   */
  reset() {
    this.gameEngine.speed = CONFIG.GAME.INITIAL_SPEED;
  }
}
