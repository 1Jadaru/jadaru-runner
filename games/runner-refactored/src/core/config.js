/**
 * Game configuration and constants
 */
export const CONFIG = {
  // Scene settings
  SCENE: {
    BACKGROUND_COLOR: 0x000000,
    FOG_DENSITY: 0.015
  },
  
  // Camera settings
  CAMERA: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
    POSITION: { x: 0, y: 1, z: 2 }
  },
  
  // Player settings
  PLAYER: {
    SIZE: { x: 0.5, y: 0.5, z: 0.5 },
    COLOR: 0x00ffcc,
    POSITION_Y: 0.25,
    JUMP_VELOCITY: 0.2,
    GRAVITY: -0.01,
    MAX_SPEED: 0.15,
    ACCELERATION: 0.01
  },
  
  // Game mechanics
  GAME: {
    INITIAL_SPEED: 0.1,
    LANE_WIDTH: 4,
    COLLISION_THRESHOLD: 0.5,
    COLLISION_HEIGHT_THRESHOLD: 0.75
  },
  
  // Road settings
  ROAD: {
    LINE_SEGMENTS: 20,
    FLOOR_WIDTH: 6,
    FLOOR_LENGTH: 200
  },
    // Obstacles
  OBSTACLES: {
    COUNT: 5,
    SIZE: { x: 0.5, y: 0.5, z: 0.5 },
    COLOR: 0xff00ff,
    MIN_SPAWN_Z: -10,
    MAX_SPAWN_Z: -50,
    RESPAWN_Z: -60
  },
  
  // Environment
  ENVIRONMENT: {
    BILLBOARD_COUNT: 4,
    BILLBOARD_DISTANCE: 60,
    STAR_COUNT: 5000,
    STAR_RADIUS: 100,
    MOUNTAIN_COUNT: 50,
    TREE_COUNT: 100
  },
  
  // Trail effect
  TRAIL: {
    MAX_POINTS: 10,
    COLOR: 0x00ffcc,
    OPACITY: 0.5
  },
  
  // Colors
  COLORS: {
    PRIMARY: 0x00ffcc,
    SECONDARY: 0xff00ff,
    BACKGROUND: 0x000000,
    GROUND: 0x111111,
    ENVIRONMENT_GROUND: 0x001111,
    MOUNTAIN_BASE: 0x002211
  },
  
  // Performance
  PERFORMANCE: {
    TARGET_FPS: 30,
    FPS_CHECK_INTERVAL: 1000
  }
};

export const STORAGE_KEYS = {
  TOP_SCORE: 'jadaru-top-score'
};

export const CONTROLS = {
  KEYBOARD: {
    LEFT: ['ArrowLeft', 'KeyA'],
    RIGHT: ['ArrowRight', 'KeyD'],
    JUMP: ['ArrowUp', 'Space', 'KeyW'],
    ESCAPE: ['Escape']
  }
};
