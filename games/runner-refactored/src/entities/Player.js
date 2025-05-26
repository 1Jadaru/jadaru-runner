import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

/**
 * Player entity representing the controllable character
 */
export class Player {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.mesh = null;
    this.position = { x: 0, y: CONFIG.PLAYER.POSITION_Y, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.isJumping = false;
    this.xSpeed = 0;
    
    this.init();
  }
  
  /**
   * Initialize the player mesh and properties
   */
  init() {
    const geometry = new THREE.BoxGeometry(
      CONFIG.PLAYER.SIZE.x,
      CONFIG.PLAYER.SIZE.y,
      CONFIG.PLAYER.SIZE.z
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: CONFIG.PLAYER.COLOR,
      metalness: 0.8,
      roughness: 0.2,
      emissive: CONFIG.PLAYER.COLOR,
      emissiveIntensity: 0.5
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh.castShadow = true;
    
    // Add glow effect
    this.addGlowEffect();
  }
  
  /**
   * Add a glow effect to the player
   */
  addGlowEffect() {
    const glowGeometry = new THREE.BoxGeometry(
      CONFIG.PLAYER.SIZE.x * 1.2,
      CONFIG.PLAYER.SIZE.y * 1.2,
      CONFIG.PLAYER.SIZE.z * 1.2
    );
    
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: CONFIG.PLAYER.COLOR,
      transparent: true,
      opacity: 0.3
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(glow);
  }
  
  /**
   * Update player movement and physics
   */
  update() {
    this.updateMovement();
    this.updateJump();
    this.updateMesh();
  }
  
  /**
   * Update horizontal movement
   */  updateMovement() {
    const inputSystem = this.gameEngine.getSystem('InputSystem');
    if (!inputSystem) return;
    
    const { left, right } = inputSystem.getMovementInput();
    
    // Apply acceleration/deceleration
    if (left) {
      this.xSpeed = Math.max(this.xSpeed - CONFIG.PLAYER.ACCELERATION, -CONFIG.PLAYER.MAX_SPEED);
    } else if (right) {
      this.xSpeed = Math.min(this.xSpeed + CONFIG.PLAYER.ACCELERATION, CONFIG.PLAYER.MAX_SPEED);
    } else {
      // Decelerate when no input
      if (this.xSpeed > 0) {
        this.xSpeed = Math.max(0, this.xSpeed - CONFIG.PLAYER.ACCELERATION);
      } else if (this.xSpeed < 0) {
        this.xSpeed = Math.min(0, this.xSpeed + CONFIG.PLAYER.ACCELERATION);
      }
    }
    
    // Apply movement with boundary constraints
    const newX = this.position.x + this.xSpeed;
    const boundary = CONFIG.GAME.LANE_WIDTH / 2 - CONFIG.PLAYER.SIZE.x / 2;
    
    if (newX >= -boundary && newX <= boundary) {
      this.position.x = newX;
    } else {
      this.xSpeed = 0; // Stop at boundaries
      this.position.x = Math.max(-boundary, Math.min(boundary, this.position.x));
    }
  }
  
  /**
   * Update jump physics
   */
  updateJump() {
    const inputSystem = this.gameEngine.getSystem('InputSystem');
    if (!inputSystem) return;
    
    // Check for jump input
    if (inputSystem.getJumpInput() && !this.isJumping) {
      this.jump();
    }
    
    // Apply gravity
    if (this.isJumping) {
      this.position.y += this.velocity.y;
      this.velocity.y += CONFIG.PLAYER.GRAVITY;
      
      // Check if landed
      if (this.position.y <= CONFIG.PLAYER.POSITION_Y) {
        this.position.y = CONFIG.PLAYER.POSITION_Y;
        this.velocity.y = 0;
        this.isJumping = false;
      }
    }
  }
  
  /**
   * Make the player jump
   */
  jump() {
    if (!this.isJumping) {
      this.velocity.y = CONFIG.PLAYER.JUMP_VELOCITY;
      this.isJumping = true;
    }
  }
  
  /**
   * Update the Three.js mesh position
   */
  updateMesh() {
    if (this.mesh) {
      this.mesh.position.set(this.position.x, this.position.y, this.position.z);
      
      // Add subtle rotation based on movement
      this.mesh.rotation.z = -this.xSpeed * 0.5;
      
      // Add bounce effect during jump
      if (this.isJumping) {
        this.mesh.rotation.x = this.velocity.y * 0.5;
      } else {
        this.mesh.rotation.x *= 0.9; // Smoothly return to normal
      }
    }
  }
  
  /**
   * Get the player's bounding box for collision detection
   */
  getBoundingBox() {
    return {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
      width: CONFIG.PLAYER.SIZE.x,
      height: CONFIG.PLAYER.SIZE.y,
      depth: CONFIG.PLAYER.SIZE.z
    };
  }
  
  /**
   * Reset player to initial state
   */
  reset() {
    this.position = { x: 0, y: CONFIG.PLAYER.POSITION_Y, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.xSpeed = 0;
    this.isJumping = false;
    
    if (this.mesh) {
      this.mesh.position.set(this.position.x, this.position.y, this.position.z);
      this.mesh.rotation.set(0, 0, 0);
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
