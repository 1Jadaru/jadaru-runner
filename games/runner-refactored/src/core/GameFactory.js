import { Player } from '../entities/Player.js';
import { Obstacle } from '../entities/Obstacle.js';
import { CONFIG } from './config.js';

/**
 * Factory for creating and managing game entities
 */
export class GameFactory {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
  }
  
  /**
   * Create and initialize the player
   */
  createPlayer() {
    const player = new Player(this.gameEngine);
    this.gameEngine.addEntity('player', player);
    return player;
  }
  /**
   * Create obstacles pool
   */
  createObstacles() {
    for (let i = 0; i < CONFIG.OBSTACLES.COUNT; i++) {
      const obstacle = new Obstacle(this.gameEngine, i);
      this.gameEngine.addEntity(`obstacle_${i}`, obstacle);
    }
  }
  
  /**
   * Create all game entities
   */
  createAllEntities() {
    this.createPlayer();
    this.createObstacles();
  }
  
  /**
   * Reset all entities to initial state
   */
  resetAllEntities() {
    for (const entity of this.gameEngine.entities.values()) {
      if (entity.reset) {
        entity.reset();
      }
    }
  }
  
  /**
   * Dispose of all entities
   */
  disposeAllEntities() {
    for (const entity of this.gameEngine.entities.values()) {
      if (entity.dispose) {
        entity.dispose();
      }
    }
    this.gameEngine.entities.clear();
  }
}
