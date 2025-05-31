/**
 * Food class for the Snake game
 * Handles food spawning, rendering, and collection
 */

export class Food {
  constructor(scene, grid) {
    this.scene = scene;
    this.grid = grid;
    this.mesh = null;
    this.position = null;
    this.glowLayer = null;
    
    this.createFood();
    this.setupGlow();
  }

  createFood() {
    // Create food mesh (sphere)
    this.mesh = BABYLON.MeshBuilder.CreateSphere('food', {
      diameter: this.grid.cellSize * 0.8,
      segments: 16
    }, this.scene);

    // Create food material with emissive properties
    const material = new BABYLON.StandardMaterial('foodMaterial', this.scene);
    material.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2); // Red
    material.emissiveColor = new BABYLON.Color3(0.3, 0.05, 0.05); // Slight glow
    material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    
    this.mesh.material = material;

    // Add animation
    this.addFloatingAnimation();
  }

  setupGlow() {
    // Create glow layer for food
    if (!this.scene.getGlowLayerByName('foodGlow')) {
      this.glowLayer = new BABYLON.GlowLayer('foodGlow', this.scene);
      this.glowLayer.intensity = 0.5;
    } else {
      this.glowLayer = this.scene.getGlowLayerByName('foodGlow');
    }

    if (this.glowLayer) {
      this.glowLayer.addIncludedOnlyMesh(this.mesh);
    }
  }

  addFloatingAnimation() {
    // Create floating animation
    const animationKeys = [];
    const frameRate = 30;
    
    const floatAnimation = new BABYLON.Animation(
      'foodFloat',
      'position.y',
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // Define animation keyframes
    animationKeys.push({
      frame: 0,
      value: 0
    });
    animationKeys.push({
      frame: frameRate,
      value: this.grid.cellSize * 0.2
    });
    animationKeys.push({
      frame: frameRate * 2,
      value: 0
    });

    floatAnimation.setKeys(animationKeys);

    // Add easing
    const easingFunction = new BABYLON.SineEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    floatAnimation.setEasingFunction(easingFunction);

    this.mesh.animations.push(floatAnimation);
    this.scene.beginAnimation(this.mesh, 0, frameRate * 2, true);

    // Add rotation animation
    const rotationAnimation = new BABYLON.Animation(
      'foodRotation',
      'rotation.y',
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const rotationKeys = [];
    rotationKeys.push({
      frame: 0,
      value: 0
    });
    rotationKeys.push({
      frame: frameRate * 3,
      value: Math.PI * 2
    });

    rotationAnimation.setKeys(rotationKeys);
    this.mesh.animations.push(rotationAnimation);
    this.scene.beginAnimation(this.mesh, 0, frameRate * 3, true);
  }

  /**
   * Spawn food at a random position
   * @param {Array} excludePositions - Positions to avoid (snake body)
   */
  spawn(excludePositions = []) {
    this.position = this.grid.getRandomPosition(excludePositions);
    this.updateMeshPosition();
  }

  updateMeshPosition() {
    if (this.position && this.mesh) {
      const worldPos = this.grid.gridToWorld(this.position.x, this.position.y);
      this.mesh.position.x = worldPos.x;
      this.mesh.position.z = worldPos.z;
    }
  }

  /**
   * Check if food is at the given position
   * @param {Object} position - Grid position to check
   * @returns {boolean} True if food is at position
   */
  isAtPosition(position) {
    return this.position && 
           this.position.x === position.x && 
           this.position.y === position.y;
  }

  /**
   * Get current food position
   * @returns {Object} Current grid position
   */
  getPosition() {
    return this.position;
  }

  /**
   * Create particle effect when food is eaten
   */
  createEatEffect() {
    if (!this.mesh) return;

    const particleSystem = new BABYLON.ParticleSystem('foodParticles', 50, this.scene);
    
    // Texture for particles
    particleSystem.particleTexture = new BABYLON.Texture(
      'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
          <circle cx="16" cy="16" r="16" fill="#ff3333" opacity="0.8"/>
        </svg>
      `), this.scene
    );

    // Position
    particleSystem.emitter = this.mesh.position.clone();
    particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
    particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);

    // Colors
    particleSystem.color1 = new BABYLON.Color4(1, 0.2, 0.2, 1);
    particleSystem.color2 = new BABYLON.Color4(1, 0.6, 0.2, 1);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

    // Size
    particleSystem.minSize = 0.5;
    particleSystem.maxSize = 1.5;

    // Life time
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 0.8;

    // Emission rate
    particleSystem.emitRate = 100;

    // Blend mode
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    // Gravity
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

    // Direction
    particleSystem.direction1 = new BABYLON.Vector3(-2, 8, -2);
    particleSystem.direction2 = new BABYLON.Vector3(2, 8, 2);

    // Speed
    particleSystem.minInitialRotation = 0;
    particleSystem.maxInitialRotation = Math.PI;
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    // Start the particle system
    particleSystem.start();

    // Stop and dispose after short duration
    setTimeout(() => {
      particleSystem.stop();
      setTimeout(() => {
        particleSystem.dispose();
      }, 1000);
    }, 200);
  }

  /**
   * Hide the food mesh
   */
  hide() {
    if (this.mesh) {
      this.mesh.setEnabled(false);
    }
  }

  /**
   * Show the food mesh
   */
  show() {
    if (this.mesh) {
      this.mesh.setEnabled(true);
    }
  }

  /**
   * Dispose of food resources
   */
  dispose() {
    if (this.mesh) {
      this.scene.stopAnimation(this.mesh);
      this.mesh.dispose();
    }
    
    if (this.glowLayer) {
      this.glowLayer.dispose();
    }
  }
}
