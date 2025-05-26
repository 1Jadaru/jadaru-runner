import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

/**
 * Collision detection system
 */
export class CollisionSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.collisionPairs = [];
  }
  
  /**
   * Update collision detection
   */
  update() {
    this.checkPlayerObstacleCollisions();
  }
  
  /**
   * Check collisions between player and obstacles
   */
  checkPlayerObstacleCollisions() {
    const player = this.gameEngine.getEntity('player');
    if (!player) return;
    
    const playerBox = player.getBoundingBox();
    
    // Check against all obstacles
    for (const [name, entity] of this.gameEngine.entities) {
      if (name.startsWith('obstacle_') && entity.isActive) {
        if (this.checkBoxCollision(playerBox, entity.getBoundingBox())) {
          this.handlePlayerObstacleCollision(player, entity);
          break; // Only handle one collision per frame
        }
      }
    }
  }
  
  /**
   * Check if two bounding boxes collide
   */
  checkBoxCollision(box1, box2) {
    const dx = Math.abs(box1.x - box2.x);
    const dy = Math.abs(box1.y - box2.y);
    const dz = Math.abs(box1.z - box2.z);
    
    const collisionThreshold = CONFIG.GAME.COLLISION_THRESHOLD;
    
    return (
      dx < collisionThreshold &&
      dy < collisionThreshold &&
      dz < collisionThreshold &&
      box1.y < CONFIG.GAME.COLLISION_HEIGHT_THRESHOLD // Player must be low enough (not jumping over)
    );
  }
  
  /**
   * Handle collision between player and obstacle
   */
  handlePlayerObstacleCollision(player, obstacle) {
    console.log('Collision detected!');
    
    // Add collision effect
    this.createCollisionEffect(player.position, obstacle.position);
    
    // End the game
    this.gameEngine.endGame();
  }
  
  /**
   * Create visual effect at collision point
   */
  createCollisionEffect(playerPos, obstaclePos) {
    const effectPosition = {
      x: (playerPos.x + obstaclePos.x) / 2,
      y: (playerPos.y + obstaclePos.y) / 2,
      z: (playerPos.z + obstaclePos.z) / 2
    };
    
    // Create explosion-like particle effect
    this.createExplosionEffect(effectPosition);
    
    // Screen shake effect
    this.createScreenShake();
  }
  
  /**
   * Create explosion particle effect
   */
  createExplosionEffect(position) {
    const particleCount = 20;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: CONFIG.COLORS.SECONDARY,
        transparent: true,
        opacity: 1
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(position.x, position.y, position.z);
      
      // Random velocity
      particle.userData = {
        velocity: {
          x: (Math.random() - 0.5) * 0.3,
          y: Math.random() * 0.2,
          z: (Math.random() - 0.5) * 0.3
        },
        life: 1.0,
        decay: 0.02
      };
      
      particles.push(particle);
      this.gameEngine.scene.add(particle);
    }
    
    // Animate particles
    this.animateExplosionParticles(particles);
  }
  
  /**
   * Animate explosion particles
   */
  animateExplosionParticles(particles) {
    const animate = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        const userData = particle.userData;
        
        // Update position
        particle.position.x += userData.velocity.x;
        particle.position.y += userData.velocity.y;
        particle.position.z += userData.velocity.z;
        
        // Apply gravity to Y velocity
        userData.velocity.y -= 0.01;
        
        // Fade out
        userData.life -= userData.decay;
        particle.material.opacity = userData.life;
        
        // Remove dead particles
        if (userData.life <= 0) {
          this.gameEngine.scene.remove(particle);
          particle.geometry.dispose();
          particle.material.dispose();
          particles.splice(i, 1);
        }
      }
      
      // Continue animation if particles remain
      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  /**
   * Create screen shake effect
   */
  createScreenShake() {
    const camera = this.gameEngine.camera;
    const originalPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };
    
    let shakeTime = 0;
    const shakeDuration = 0.5; // seconds
    const shakeIntensity = 0.1;
    
    const shake = () => {
      shakeTime += 0.016; // ~60fps
      
      if (shakeTime < shakeDuration) {
        const progress = shakeTime / shakeDuration;
        const intensity = shakeIntensity * (1 - progress); // Fade out
        
        camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
        camera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity;
        camera.position.z = originalPosition.z + (Math.random() - 0.5) * intensity;
        
        requestAnimationFrame(shake);
      } else {
        // Restore original position
        camera.position.set(originalPosition.x, originalPosition.y, originalPosition.z);
      }
    };
    
    shake();
  }
  
  /**
   * Check collision between two spheres (alternative collision method)
   */
  checkSphereCollision(center1, radius1, center2, radius2) {
    const dx = center1.x - center2.x;
    const dy = center1.y - center2.y;
    const dz = center1.z - center2.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    return distance < (radius1 + radius2);
  }
  
  /**
   * Add a collision pair to monitor
   */
  addCollisionPair(entity1, entity2, callback) {
    this.collisionPairs.push({
      entity1,
      entity2,
      callback
    });
  }
  
  /**
   * Remove a collision pair
   */
  removeCollisionPair(entity1, entity2) {
    this.collisionPairs = this.collisionPairs.filter(pair => 
      !(pair.entity1 === entity1 && pair.entity2 === entity2) &&
      !(pair.entity1 === entity2 && pair.entity2 === entity1)
    );
  }
  
  /**
   * Check all registered collision pairs
   */
  checkCollisionPairs() {
    for (const pair of this.collisionPairs) {
      const entity1 = this.gameEngine.getEntity(pair.entity1);
      const entity2 = this.gameEngine.getEntity(pair.entity2);
      
      if (entity1 && entity2) {
        const box1 = entity1.getBoundingBox();
        const box2 = entity2.getBoundingBox();
        
        if (this.checkBoxCollision(box1, box2)) {
          pair.callback(entity1, entity2);
        }
      }
    }
  }
  
  /**
   * Reset collision system
   */
  reset() {
    this.collisionPairs = [];
  }
}
