import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

/**
 * Obstacle entity that the player must avoid
 */
export class Obstacle {  constructor(gameEngine, id) {
    this.gameEngine = gameEngine;
    this.id = id;
    this.mesh = null;
    this.position = { x: 0, y: 0, z: 0 };
    this.isActive = true;
    
    this.init();
    this.respawn();
  }  /**
   * Initialize the obstacle mesh
   */
  init() {
    const geometry = new THREE.BoxGeometry(
      CONFIG.OBSTACLES.SIZE.x,
      CONFIG.OBSTACLES.SIZE.y,
      CONFIG.OBSTACLES.SIZE.z
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: CONFIG.OBSTACLES.COLOR,
      metalness: 0.8,
      roughness: 0.2,
      emissive: CONFIG.OBSTACLES.COLOR,
      emissiveIntensity: 0.5
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    
    // Add pulsing animation
    this.addPulseEffect();
  }
  
  /**
   * Add a pulsing effect to make obstacles more visible
   */
  addPulseEffect() {
    this.pulseTime = Math.random() * Math.PI * 2; // Random phase
  }
  
  /**
   * Update obstacle position and effects
   */
  update() {
    if (!this.isActive) return;
    
    // Move obstacle forward
    this.position.z += this.gameEngine.speed;
    
    // Check if obstacle passed the player
    if (this.position.z > 2) {
      this.onObstaclePassed();
      this.respawn();
    }
    
    // Update visual effects
    this.updateEffects();
    this.updateMesh();
  }
  
  /**
   * Update visual effects like pulsing
   */
  updateEffects() {
    this.pulseTime += 0.1;
    const pulse = Math.sin(this.pulseTime) * 0.1 + 1;
    
    if (this.mesh) {
      this.mesh.scale.setScalar(pulse);
      
      // Update emissive intensity for glow effect
      this.mesh.material.emissiveIntensity = 0.3 + Math.sin(this.pulseTime) * 0.2;
    }
  }  /**
   * Respawn obstacle at a new random position
   */
  respawn() {
    // Random X position within lane boundaries
    const laneHalf = CONFIG.GAME.LANE_WIDTH / 2 - CONFIG.OBSTACLES.SIZE.x / 2;
    this.position.x = (Math.random() - 0.5) * (laneHalf * 2);
    
    // Y position (ground level)
    this.position.y = CONFIG.OBSTACLES.SIZE.y / 2;
      // Z position - spawn closer to make them appear sooner
    this.position.z = -5 - Math.random() * 15; // Spawn between z=-5 and z=-20
    
    this.isActive = true;
  }
  
  /**
   * Handle when obstacle passes the player (score point)
   */
  onObstaclePassed() {
    this.gameEngine.updateScore(1);
    
    // Trigger UI score animation
    const uiSystem = this.gameEngine.getSystem('UISystem');
    if (uiSystem) {
      uiSystem.animateScoreIncrease();
    }
  }
  
  /**
   * Update the Three.js mesh position
   */
  updateMesh() {
    if (this.mesh) {
      this.mesh.position.set(this.position.x, this.position.y, this.position.z);
      
      // Add subtle rotation for visual interest
      this.mesh.rotation.y += 0.02;
      this.mesh.rotation.x = Math.sin(this.pulseTime * 0.5) * 0.1;
    }
  }
  
  /**
   * Get the obstacle's bounding box for collision detection
   */
  getBoundingBox() {
    return {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
      width: CONFIG.OBSTACLES.SIZE.x,
      height: CONFIG.OBSTACLES.SIZE.y,
      depth: CONFIG.OBSTACLES.SIZE.z
    };
  }
  
  /**
   * Check if this obstacle collides with another bounding box
   */
  checkCollision(otherBoundingBox) {
    const myBox = this.getBoundingBox();
    
    return (
      Math.abs(myBox.x - otherBoundingBox.x) < (myBox.width + otherBoundingBox.width) / 2 &&
      Math.abs(myBox.y - otherBoundingBox.y) < (myBox.height + otherBoundingBox.height) / 2 &&
      Math.abs(myBox.z - otherBoundingBox.z) < (myBox.depth + otherBoundingBox.depth) / 2
    );
  }
  
  /**
   * Deactivate the obstacle (for pooling)
   */
  deactivate() {
    this.isActive = false;
    if (this.mesh) {
      this.mesh.visible = false;
    }
  }
  
  /**
   * Activate the obstacle
   */
  activate() {
    this.isActive = true;
    if (this.mesh) {
      this.mesh.visible = true;
    }
  }
  
  /**
   * Reset obstacle to initial state
   */
  reset() {
    this.respawn();
    this.activate();
    this.pulseTime = Math.random() * Math.PI * 2;
    
    if (this.mesh) {
      this.mesh.rotation.set(0, 0, 0);
      this.mesh.scale.setScalar(1);
    }
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.gameEngine.scene.remove(this.mesh);
    }
  }
}
