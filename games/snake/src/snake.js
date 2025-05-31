/**
 * Snake class for the Snake game
 * Handles snake movement, growth, and rendering
 */

export class Snake {
  constructor(scene, grid) {
    this.scene = scene;
    this.grid = grid;
    this.body = [];
    this.direction = { x: 1, y: 0 }; // Start moving right
    this.meshes = [];
    this.materials = [];
    this.growing = false; // Flag for when snake should grow
      this.init();
  }

  init() {
    // Start snake in center with 3 segments
    const center = this.grid.getCenterPosition();
    
    this.body = [
      { x: center.x, y: center.y },
      { x: center.x - 1, y: center.y },
      { x: center.x - 2, y: center.y }
    ];    this.createMeshes();
  }

  createMeshes() {
    // Clear existing meshes
    this.disposeMeshes();

    // Create materials
    this.createMaterials();

    // Create mesh for each body segment
    this.body.forEach((segment, index) => {
      this.createSegmentMesh(index);
    });
  }

  createMaterials() {
    // Head material (brighter green)
    const headMaterial = new BABYLON.StandardMaterial('snakeHead', this.scene);
    headMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2);
    headMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.2, 0.05);
    headMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

    // Body material (darker green)
    const bodyMaterial = new BABYLON.StandardMaterial('snakeBody', this.scene);
    bodyMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.1);
    bodyMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.1, 0.02);
    bodyMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    this.materials = {
      head: headMaterial,
      body: bodyMaterial    };
  }

  createSegmentMesh(index) {
    const isHead = index === 0;
    const segmentName = isHead ? 'snakeHead' : `snakeBody_${index}`;
    
    // Create a simple box for all segments
    const mesh = BABYLON.MeshBuilder.CreateBox(segmentName, {
      width: this.grid.cellSize * 0.8,
      height: this.grid.cellSize * 0.8,
      depth: this.grid.cellSize * 0.8
    }, this.scene);

    // Apply material
    mesh.material = isHead ? this.materials.head : this.materials.body;
    
    // Position the mesh
    const segment = this.body[index];
    const worldPos = this.grid.gridToWorld(segment.x, segment.y);    mesh.position.x = worldPos.x;
    mesh.position.y = this.grid.cellSize * 0.5; // Lift slightly off ground
    mesh.position.z = worldPos.z;

    this.meshes[index] = mesh;
    return mesh;
  }

  addEyesToHead(headMesh) {
    // Create eyes
    const eyeSize = this.grid.cellSize * 0.1;
    const eyeOffset = this.grid.cellSize * 0.2;

    // Left eye
    const leftEye = BABYLON.MeshBuilder.CreateSphere('leftEye', {
      diameter: eyeSize
    }, this.scene);
    
    // Right eye
    const rightEye = BABYLON.MeshBuilder.CreateSphere('rightEye', {
      diameter: eyeSize
    }, this.scene);

    // Eye material
    const eyeMaterial = new BABYLON.StandardMaterial('eyeMaterial', this.scene);
    eyeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    eyeMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    leftEye.material = eyeMaterial;
    rightEye.material = eyeMaterial;

    // Position eyes relative to head
    leftEye.parent = headMesh;
    rightEye.parent = headMesh;
    
    // Position based on direction
    this.updateEyePositions(leftEye, rightEye);
  }

  updateEyePositions(leftEye, rightEye) {
    const eyeOffset = this.grid.cellSize * 0.2;
    const eyeForward = this.grid.cellSize * 0.4;

    if (this.direction.x === 1) { // Moving right
      leftEye.position = new BABYLON.Vector3(eyeForward, eyeOffset, -eyeOffset);
      rightEye.position = new BABYLON.Vector3(eyeForward, eyeOffset, eyeOffset);
    } else if (this.direction.x === -1) { // Moving left
      leftEye.position = new BABYLON.Vector3(-eyeForward, eyeOffset, eyeOffset);
      rightEye.position = new BABYLON.Vector3(-eyeForward, eyeOffset, -eyeOffset);
    } else if (this.direction.y === 1) { // Moving down
      leftEye.position = new BABYLON.Vector3(-eyeOffset, eyeOffset, eyeForward);
      rightEye.position = new BABYLON.Vector3(eyeOffset, eyeOffset, eyeForward);
    } else if (this.direction.y === -1) { // Moving up
      leftEye.position = new BABYLON.Vector3(eyeOffset, eyeOffset, -eyeForward);
      rightEye.position = new BABYLON.Vector3(-eyeOffset, eyeOffset, -eyeForward);
    }
  }

  addBodyAnimation(mesh, index) {
    // Add subtle scale animation to body segments
    const scaleAnimation = new BABYLON.Animation(
      `bodyScale_${index}`,
      'scaling',
      30,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const animationKeys = [];
    const baseScale = 1;
    const scaleVariation = 0.05;
    const offset = index * 10; // Phase offset for each segment

    animationKeys.push({
      frame: 0 + offset,
      value: new BABYLON.Vector3(baseScale, baseScale, baseScale)
    });
    animationKeys.push({
      frame: 30 + offset,
      value: new BABYLON.Vector3(
        baseScale + scaleVariation,
        baseScale + scaleVariation,
        baseScale + scaleVariation
      )
    });
    animationKeys.push({
      frame: 60 + offset,
      value: new BABYLON.Vector3(baseScale, baseScale, baseScale)
    });

    scaleAnimation.setKeys(animationKeys);
    mesh.animations.push(scaleAnimation);
    this.scene.beginAnimation(mesh, 0, 60, true);
  }  /**
   * Update snake direction
   * @param {Object} newDirection - New direction {x, y}
   */  setDirection(newDirection) {
    // Prevent moving in opposite direction
    const isOpposite = 
      newDirection.x === -this.direction.x && newDirection.y === -this.direction.y;
    
    if (!isOpposite) {
      this.direction = newDirection;
      
      // Update eye positions when direction changes
      if (this.meshes[0]) {
        const head = this.meshes[0];
        const leftEye = head.getChildMeshes().find(child => child.name === 'leftEye');
        const rightEye = head.getChildMeshes().find(child => child.name === 'rightEye');
        
        if (leftEye && rightEye) {
          this.updateEyePositions(leftEye, rightEye);
        }
      }
    }
  }

  /**
   * Move the snake one step forward
   */  move() {
    // Safety check: ensure body exists and has at least one segment
    if (!this.body || this.body.length === 0) {
      this.init();
      return;
    }

    const head = this.body[0];
    if (!head) {
      this.init();
      return;
    }

    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    // Add new head
    this.body.unshift(newHead);
    
    // Remove tail (unless growing)
    if (!this.growing) {
      this.removeTail();
    } else {
      this.growing = false;
    }
    
    // Recreate all meshes for simplicity
    this.createMeshes();
  }
  /**
   * Grow the snake (don't remove tail on next move)
   */
  grow() {
    this.growing = true;
  }

  /**
   * Remove the tail segment
   */
  removeTail() {
    if (this.body.length > 0) {
      this.body.pop();
      
      if (this.meshes.length > 0) {
        const tailMesh = this.meshes.pop();
        if (tailMesh) {
          this.scene.stopAnimation(tailMesh);
          tailMesh.dispose();
        }
      }
    }
  }
  /**
   * Update mesh positions to match body positions
   */
  updateMeshPositions() {
    this.body.forEach((segment, index) => {
      if (this.meshes[index]) {
        const worldPos = this.grid.gridToWorld(segment.x, segment.y);
        this.meshes[index].position.x = worldPos.x;
        this.meshes[index].position.y = this.grid.cellSize * 0.5; // Lift slightly off ground
        this.meshes[index].position.z = worldPos.z;
      }
    });
  }
  /**
   * Check if snake collides with itself
   * @returns {boolean} True if self-collision occurred
   */  checkSelfCollision() {
    if (!this.body || this.body.length < 2) {
      return false; // Need at least 2 segments for self-collision
    }

    const head = this.body[0];
    if (!head) {
      return false;
    }
      for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if snake collides with walls
   * @returns {boolean} True if wall collision occurred
   */  checkWallCollision() {
    if (!this.body || this.body.length === 0) {
      return false; // No collision if no body
    }
    
    const head = this.body[0];
    if (!head) {
      return false;
    }
    
    return !this.grid.isWithinBounds(head.x, head.y);
  }

  /**
   * Get snake head position
   * @returns {Object} Head position {x, y}
   */  getHeadPosition() {
    if (!this.body || this.body.length === 0) {
      console.error('Cannot get head position: body is empty');
      return null;
    }
    return this.body[0];
  }

  /**
   * Get all body positions
   * @returns {Array} Array of body positions
   */
  getBodyPositions() {
    return [...this.body];
  }

  /**
   * Reset snake to initial state
   */
  reset() {
    this.disposeMeshes();
    this.direction = { x: 1, y: 0 };
    this.init();
  }

  /**
   * Create death effect animation
   */
  createDeathEffect() {
    // Flash effect for snake segments
    this.meshes.forEach((mesh, index) => {
      if (mesh) {
        const flashAnimation = new BABYLON.Animation(
          `deathFlash_${index}`,
          'material.emissiveColor',
          10,
          BABYLON.Animation.ANIMATIONTYPE_COLOR3,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [];
        keys.push({
          frame: 0,
          value: mesh.material.emissiveColor.clone()
        });
        keys.push({
          frame: 5,
          value: new BABYLON.Color3(1, 0, 0) // Red flash
        });
        keys.push({
          frame: 10,
          value: new BABYLON.Color3(0.5, 0, 0)
        });

        flashAnimation.setKeys(keys);
        this.scene.beginAnimation(mesh.material, 0, 10, false);
      }
    });
  }

  /**
   * Dispose of all snake meshes
   */
  disposeMeshes() {
    this.meshes.forEach(mesh => {
      if (mesh) {
        this.scene.stopAnimation(mesh);
        mesh.dispose();
      }
    });
    this.meshes = [];
  }
  /**
   * Reset snake to initial state
   */
  reset() {
    // Reset direction
    this.direction = { x: 1, y: 0 };
    this.growing = false;
    
    // Reset body to initial state
    const center = this.grid.getCenterPosition();
    this.body = [
      { x: center.x, y: center.y },
      { x: center.x - 1, y: center.y },
      { x: center.x - 2, y: center.y }
    ];
    
    // Recreate meshes
    this.createMeshes();
  }

  /**
   * Dispose of snake resources
   */
  dispose() {
    this.disposeMeshes();
    
    Object.values(this.materials).forEach(material => {
      if (material) {
        material.dispose();
      }
    });
  }
}
