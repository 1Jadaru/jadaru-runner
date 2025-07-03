import * as THREE from 'three';
import { DEBUG } from '../core/config.js';

/**
 * Render system handling visual effects and rendering optimizations
 */
export class RenderSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.postProcessing = null;
    this.bloomPass = null;
    this.renderPass = null;
    
    this.init();
  }
  
  /**
   * Initialize rendering system
   */
  init() {
    this.setupPostProcessing();
    this.setupRenderOptimizations();
  }
  
  /**
   * Setup post-processing effects
   */
  setupPostProcessing() {
    // Note: Post-processing requires additional Three.js modules
    // For now, we'll keep the basic renderer
    if (DEBUG) console.log('Post-processing setup (placeholder for bloom effects)');
  }
  
  /**
   * Setup rendering optimizations
   */
  setupRenderOptimizations() {
    const renderer = this.gameEngine.renderer;
    
    // Enable performance optimizations
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Frustum culling optimization
    this.setupFrustumCulling();
  }
  
  /**
   * Setup frustum culling for performance
   */
  setupFrustumCulling() {
    // Three.js handles frustum culling automatically
    // This method can be extended for custom culling logic
  }
  
  /**
   * Update rendering system
   */
  update() {
    this.updateVisualEffects();
    this.performCulling();
  }
  
  /**
   * Update visual effects
   */
  updateVisualEffects() {
    this.updateGlowEffects();
    this.updateParticleEffects();
  }
  
  /**
   * Update glow effects on entities
   */
  updateGlowEffects() {
    const time = Date.now() * 0.001;
    
    // Pulse effect for player and obstacles
    for (const [name, entity] of this.gameEngine.entities) {
      if (entity.mesh && entity.mesh.material) {
        if (name === 'player') {
          // Player glow pulsing
          const intensity = 0.3 + Math.sin(time * 3) * 0.2;
          entity.mesh.material.emissiveIntensity = intensity;
        } else if (name.startsWith('obstacle_')) {
          // Obstacle glow pulsing (different frequency)
          const intensity = 0.3 + Math.sin(time * 2 + entity.id) * 0.2;
          if (entity.mesh.material.emissiveIntensity !== undefined) {
            entity.mesh.material.emissiveIntensity = intensity;
          }
        }
      }
    }
  }
  
  /**
   * Update particle effects
   */
  updateParticleEffects() {
    // Placeholder for particle system updates
    // Could include dust, sparks, etc.
  }
  
  /**
   * Perform culling optimizations
   */
  performCulling() {
    const camera = this.gameEngine.camera;
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(matrix);
    
    // Custom culling for specific objects if needed
    for (const [name, entity] of this.gameEngine.entities) {
      if (entity.mesh) {
        // Let Three.js handle standard frustum culling
        // Custom logic can be added here for specific cases
      }
    }
  }
  
  /**
   * Create screen flash effect
   */
  createScreenFlash(color = 0xffffff, duration = 0.3) {
    const flashElement = document.createElement('div');
    flashElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #${color.toString(16).padStart(6, '0')};
      z-index: 20;
      pointer-events: none;
      opacity: 0.8;
      animation: flashFade ${duration}s ease-out;
    `;
    
    // Add flash animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flashFade {
        0% { opacity: 0.8; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(flashElement);
    
    setTimeout(() => {
      flashElement.remove();
      style.remove();
    }, duration * 1000);
  }
  
  /**
   * Toggle wireframe mode for debugging
   */
  toggleWireframe() {
    for (const [name, entity] of this.gameEngine.entities) {
      if (entity.mesh && entity.mesh.material) {
        entity.mesh.material.wireframe = !entity.mesh.material.wireframe;
      }
    }
  }
  
  /**
   * Reduce visual quality for performance
   */
  reduceQuality() {
    const renderer = this.gameEngine.renderer;
    
    // Reduce pixel ratio
    renderer.setPixelRatio(1);
    
    // Disable shadows
    renderer.shadowMap.enabled = false;
    
    // Reduce material quality
    for (const [name, entity] of this.gameEngine.entities) {
      if (entity.mesh && entity.mesh.material) {
        entity.mesh.material.metalness = 0;
        entity.mesh.material.roughness = 1;
        if (entity.mesh.material.emissiveIntensity !== undefined) {
          entity.mesh.material.emissiveIntensity *= 0.5;
        }
      }
    }
    
    if (DEBUG) console.log('Reduced visual quality for performance');
  }
  
  /**
   * Restore visual quality
   */
  restoreQuality() {
    const renderer = this.gameEngine.renderer;
    
    // Restore pixel ratio
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Enable shadows
    renderer.shadowMap.enabled = true;
    
    if (DEBUG) console.log('Restored visual quality');
  }
  
  /**
   * Take screenshot
   */
  takeScreenshot() {
    const canvas = this.gameEngine.renderer.domElement;
    const link = document.createElement('a');
    link.download = `jadaru-runner-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }
  
  /**
   * Reset render system
   */
  reset() {
    this.restoreQuality();
  }
}
