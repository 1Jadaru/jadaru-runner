import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

/**
 * Environment system managing roads, trails, billboards, and scenery
 */
export class EnvironmentSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.roadElements = [];
    this.billboards = [];
    this.trail = null;
    this.trailPoints = [];
    this.init();
  }
  
  /**
   * Initialize all environment elements
   */
  init() {
    this.createLighting();
    this.createFloor();
    this.createRoadLines();
    this.createTrail();
    this.createBillboards();
    this.createScenery();
  }
  
  /**
   * Create lighting for the scene
   */
  createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    this.gameEngine.scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(CONFIG.COLORS.PRIMARY, 1.0);
    directionalLight.position.set(0, 10, 5);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    
    this.gameEngine.scene.add(directionalLight);
  }
  
  /**
   * Create the main floor/road surface
   */
  createFloor() {
    const geometry = new THREE.PlaneGeometry(
      CONFIG.ROAD.FLOOR_WIDTH,
      CONFIG.ROAD.FLOOR_LENGTH
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: CONFIG.COLORS.GROUND,
      side: THREE.DoubleSide,
      metalness: 0.8,
      roughness: 0.4
    });
    
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = Math.PI / 2;
    floor.position.z = -CONFIG.ROAD.FLOOR_LENGTH / 2;
    floor.receiveShadow = true;
    
    this.gameEngine.scene.add(floor);
    this.gameEngine.addEntity('floor', { mesh: floor });
  }
  
  /**
   * Create animated road lines
   */
  createRoadLines() {
    this.createCenterLine();
    this.createSideLines();
    this.createGlowEffects();
  }
  
  /**
   * Create animated center line
   */
  createCenterLine() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    
    // Create dashed line segments
    for (let i = 0; i < CONFIG.ROAD.LINE_SEGMENTS; i++) {
      if (i % 2 === 0) { // Create dashed effect
        const zPos = -i * 10;
        positions.push(0, 0.01, zPos);     // Start of segment
        positions.push(0, 0.01, zPos - 4); // End of segment
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const material = new THREE.LineBasicMaterial({
      color: CONFIG.COLORS.PRIMARY,
      transparent: true,
      opacity: 0.7
    });
    
    const centerLine = new THREE.LineSegments(geometry, material);
    this.gameEngine.scene.add(centerLine);
    this.roadElements.push({ element: centerLine, type: 'center' });
  }
  
  /**
   * Create solid side lines
   */
  createSideLines() {
    const geometry = new THREE.BufferGeometry();
    const positions = [
      // Left line
      -CONFIG.GAME.LANE_WIDTH/2, 0.01, 0,
      -CONFIG.GAME.LANE_WIDTH/2, 0.01, -CONFIG.ROAD.FLOOR_LENGTH,
      // Right line
      CONFIG.GAME.LANE_WIDTH/2, 0.01, 0,
      CONFIG.GAME.LANE_WIDTH/2, 0.01, -CONFIG.ROAD.FLOOR_LENGTH
    ];
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const material = new THREE.LineBasicMaterial({
      color: CONFIG.COLORS.PRIMARY,
      transparent: true,
      opacity: 0.9,
      linewidth: 2
    });
    
    const sideLines = new THREE.LineSegments(geometry, material);
    this.gameEngine.scene.add(sideLines);
    this.roadElements.push({ element: sideLines, type: 'sides' });
  }
  
  /**
   * Create glow effects for road lines
   */
  createGlowEffects() {
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(CONFIG.COLORS.PRIMARY) },
        intensity: { value: 0.5 }
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float intensity;
        varying vec3 vPosition;
        void main() {
          float alpha = intensity * (1.0 - abs(vPosition.x) / 2.0);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    // Create glow planes for side lines
    const glowGeometry = new THREE.PlaneGeometry(0.5, CONFIG.ROAD.FLOOR_LENGTH);
    
    const leftGlow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
    const rightGlow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
    
    leftGlow.position.set(-CONFIG.GAME.LANE_WIDTH/2, 0.1, -CONFIG.ROAD.FLOOR_LENGTH/2);
    rightGlow.position.set(CONFIG.GAME.LANE_WIDTH/2, 0.1, -CONFIG.ROAD.FLOOR_LENGTH/2);
    leftGlow.rotation.x = Math.PI / 2;
    rightGlow.rotation.x = Math.PI / 2;
    
    this.gameEngine.scene.add(leftGlow);
    this.gameEngine.scene.add(rightGlow);
    
    this.roadElements.push(
      { element: leftGlow, type: 'glow' },
      { element: rightGlow, type: 'glow' }
    );
  }
  
  /**
   * Create player trail effect
   */
  createTrail() {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: CONFIG.TRAIL.COLOR,
      transparent: true,
      opacity: CONFIG.TRAIL.OPACITY
    });
    
    this.trail = new THREE.Line(geometry, material);
    this.gameEngine.scene.add(this.trail);
    this.trailPoints = [];
  }
  
  /**
   * Create billboards along the road
   */
  createBillboards() {
    for (let i = 0; i < CONFIG.ENVIRONMENT.BILLBOARD_COUNT; i++) {
      const leftBillboard = this.createBillboard(true);
      const rightBillboard = this.createBillboard(false);
      
      // Position billboards with staggering
      const baseZ = -i * CONFIG.ENVIRONMENT.BILLBOARD_DISTANCE - 20;
      leftBillboard.position.z = baseZ;
      rightBillboard.position.z = baseZ - CONFIG.ENVIRONMENT.BILLBOARD_DISTANCE / 2;
      
      // Add variation
      const xVariation = Math.random() * 0.5;
      leftBillboard.position.x -= xVariation;
      rightBillboard.position.x += xVariation;
      
      // Add rotation variation
      const rotationVariation = (Math.random() - 0.5) * 0.1;
      leftBillboard.rotation.y += rotationVariation;
      rightBillboard.rotation.y += rotationVariation;
      
      this.billboards.push(leftBillboard, rightBillboard);
      this.gameEngine.scene.add(leftBillboard);
      this.gameEngine.scene.add(rightBillboard);
    }
  }
  
  /**
   * Create a single billboard
   */
  createBillboard(isLeft) {
    const group = new THREE.Group();
    
    // Billboard frame
    const frameGeometry = new THREE.BoxGeometry(0.2, 3, 4);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.2
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = 1.5;
    group.add(frame);
    
    // Billboard screen
    const screenGeometry = new THREE.PlaneGeometry(3, 2);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 0.5,
      roughness: 0.5,
      emissive: 0x111111,
      emissiveIntensity: 0.2
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 2, 0.15);
    screen.rotation.y = isLeft ? Math.PI / 6 : -Math.PI / 6;
    group.add(screen);
    
    // Neon trim
    const neonGeometry = new THREE.BoxGeometry(3.2, 2.2, 0.05);
    const neonMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.COLORS.PRIMARY,
      emissive: CONFIG.COLORS.PRIMARY,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });
    const neon = new THREE.Mesh(neonGeometry, neonMaterial);
    neon.position.set(0, 2, 0.1);
    neon.rotation.y = screen.rotation.y;
    group.add(neon);
    
    // Position the group
    const sideOffset = isLeft ? -(CONFIG.GAME.LANE_WIDTH/2 + 2) : (CONFIG.GAME.LANE_WIDTH/2 + 2);
    group.position.set(sideOffset, 0, 0);
    
    return group;
  }
  
  /**
   * Create background scenery
   */
  createScenery() {
    this.createStars();
    this.createMountains();
    this.createTrees();
    this.createEnvironmentGround();
  }
  
  /**
   * Create starfield
   */
  createStars() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < CONFIG.ENVIRONMENT.STAR_COUNT; i++) {
      const r = CONFIG.ENVIRONMENT.STAR_RADIUS;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      vertices.push(x, y, z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    const stars = new THREE.Points(geometry, material);
    this.gameEngine.scene.add(stars);
  }
  
  /**
   * Create distant mountains
   */
  createMountains() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    
    for (let i = 0; i < CONFIG.ENVIRONMENT.MOUNTAIN_COUNT; i++) {
      const x = (Math.random() - 0.5) * 200;
      const z = -50 - Math.random() * 100;
      const height = 10 + Math.random() * 20;
      
      // Create triangle
      vertices.push(
        x - 5, 0, z,
        x + 5, 0, z,
        x, height, z
      );
      
      // Add color gradient
      const color = new THREE.Color();
      color.setHSL(0.5 + Math.random() * 0.1, 1, 0.1 + Math.random() * 0.1);
      for (let j = 0; j < 3; j++) {
        colors.push(color.r, color.g, color.b);
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.8,
      roughness: 0.2,
      emissive: CONFIG.COLORS.MOUNTAIN_BASE,
      emissiveIntensity: 0.2
    });
    
    const mountains = new THREE.Mesh(geometry, material);
    this.gameEngine.scene.add(mountains);
  }
  
  /**
   * Create cyber trees
   */
  createTrees() {
    for (let i = 0; i < CONFIG.ENVIRONMENT.TREE_COUNT; i++) {
      const tree = this.createTree();
      const x = (Math.random() - 0.5) * 100;
      const z = -20 - Math.random() * 160;
      
      // Keep trees away from the road
      if (Math.abs(x) < CONFIG.GAME.LANE_WIDTH + 4) {
        continue;
      }
      
      tree.position.set(x, 0, z);
      this.gameEngine.scene.add(tree);
    }
  }
  
  /**
   * Create a single cyber tree
   */
  createTree() {
    const group = new THREE.Group();
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2 + Math.random() * 3, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.8,
      roughness: 0.2
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    group.add(trunk);
    
    // Tree foliage
    const foliageGeometry = new THREE.IcosahedronGeometry(1 + Math.random());
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff99,
      emissive: 0x00ff99,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.8
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = trunk.geometry.parameters.height;
    group.add(foliage);
    
    return group;
  }
  
  /**
   * Create environment ground plane
   */
  createEnvironmentGround() {
    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.MeshStandardMaterial({
      color: CONFIG.COLORS.ENVIRONMENT_GROUND,
      metalness: 0.8,
      roughness: 0.5,
      emissive: CONFIG.COLORS.ENVIRONMENT_GROUND,
      emissiveIntensity: 0.1
    });
    
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -0.1;
    ground.position.z = -100;
    
    this.gameEngine.scene.add(ground);
  }
  
  /**
   * Update environment elements
   */
  update() {
    this.updateRoadAnimation();
    this.updateTrail();
    this.updateBillboards();
  }
  
  /**
   * Update road line animation
   */
  updateRoadAnimation() {
    for (const roadElement of this.roadElements) {
      if (roadElement.type === 'center') {
        const positions = roadElement.element.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 6) {
          positions[i + 2] += this.gameEngine.speed; // Start z
          positions[i + 5] += this.gameEngine.speed; // End z
          
          if (positions[i + 2] > 2) {
            positions[i + 2] -= 200;
            positions[i + 5] -= 200;
          }
        }
        
        roadElement.element.geometry.attributes.position.needsUpdate = true;
      }
    }
  }
  
  /**
   * Update player trail
   */
  updateTrail() {
    const player = this.gameEngine.getEntity('player');
    if (!player || !this.trail) return;
    
    this.trailPoints.push(player.position.x, player.position.y, player.position.z);
    
    if (this.trailPoints.length > CONFIG.TRAIL.MAX_POINTS * 3) {
      this.trailPoints.splice(0, 3); // Remove oldest point
    }
    
    const positions = new Float32Array(this.trailPoints);
    this.trail.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.trail.geometry.attributes.position.needsUpdate = true;
  }
  
  /**
   * Update billboard positions
   */
  updateBillboards() {
    this.billboards.forEach(billboard => {
      billboard.position.z += this.gameEngine.speed;
      
      if (billboard.position.z > 20) {
        // Reset to back with proper spacing
        billboard.position.z -= (CONFIG.ENVIRONMENT.BILLBOARD_COUNT * CONFIG.ENVIRONMENT.BILLBOARD_DISTANCE + CONFIG.ENVIRONMENT.BILLBOARD_DISTANCE / 2);
        
        // Randomize position slightly
        const xVariation = Math.random() * 0.5;
        if (billboard.position.x < 0) {
          billboard.position.x = -(CONFIG.GAME.LANE_WIDTH/2 + 2) - xVariation;
        } else {
          billboard.position.x = (CONFIG.GAME.LANE_WIDTH/2 + 2) + xVariation;
        }
        
        // Randomize rotation
        const baseRotation = billboard.position.x < 0 ? Math.PI / 6 : -Math.PI / 6;
        billboard.rotation.y = baseRotation + (Math.random() - 0.5) * 0.1;
      }
    });
  }
  
  /**
   * Reset environment to initial state
   */
  reset() {
    this.trailPoints = [];
    if (this.trail) {
      this.trail.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
    }
  }
}
