// Basic Tron-style 3D runner using Three.js with mobile touch controls and graceful game end
let scene, camera, renderer;
let player, floor;
let obstacles = [];
let speed = 0.1;
let xSpeed = 0;
let yVelocity = 0;
let gravity = -0.01;
let isJumping = false;
let score = 0;
let topScore = parseInt(localStorage.getItem('jadaru-top-score')) || 0;
let gameOver = false;

// Add these variables at the top with other global variables
let centerLine, leftLine, rightLine;
const LANE_WIDTH = 4; // Total width of the playable area
const LINE_SEGMENTS = 20; // Number of line segments for the road
let billboards = [];
let skybox;
const BILLBOARD_COUNT = 4; // Reduced from 6 (33% reduction)
const BILLBOARD_DISTANCE = 60; // Increased from 40 to space them out more
const BILLBOARD_OFFSET = BILLBOARD_DISTANCE / 2; // For staggering left and right billboards

const keys = {
  left: false,
  right: false,
  up: false
};

// Add frame rate monitoring and adjustment
const fpsMonitor = {
    frames: 0,
    lastTime: performance.now(),
    
    update() {
        this.frames++;
        const now = performance.now();
        if (now - this.lastTime > 1000) {
            const fps = this.frames * 1000 / (now - this.lastTime);
            if (fps < 30) {
                // Reduce visual effects
                reduceVisualEffects();
            }
            this.frames = 0;
            this.lastTime = now;
        }
    }
};

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 2);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const overlay = document.createElement('div');
  overlay.id = 'score-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '20px';
  overlay.style.left = '20px';
  overlay.style.zIndex = '10';
  overlay.style.color = '#00ffcc';
  overlay.style.fontFamily = 'monospace';
  overlay.innerHTML = `Score: <span id=\"score\"><\/span><br>Top Score: <span id=\"top-score\">${topScore}<\/span>`;
  document.body.appendChild(overlay);

  const menuBtn = document.createElement('button');
  menuBtn.innerText = "Menu";
  menuBtn.style.position = 'absolute';
  menuBtn.style.top = '20px';
  menuBtn.style.left = '50%';
  menuBtn.style.transform = 'translateX(-50%)';
  menuBtn.style.zIndex = '10';
  menuBtn.style.background = '#000';
  menuBtn.style.color = '#00ffcc';
  menuBtn.style.border = '2px solid #00ffcc';
  menuBtn.style.padding = '10px 20px';
  menuBtn.style.borderRadius = '10px';
  menuBtn.onclick = () => {
    if (confirm("Return to main site?")) {
      window.location.href = "/";
    }
  };
  document.body.appendChild(menuBtn);

  // Update floor to be more road-like
  const floorGeo = new THREE.PlaneGeometry(LANE_WIDTH + 2, 200); // Slightly wider than play area
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x111111, 
    side: THREE.DoubleSide,
    metalness: 0.8,
    roughness: 0.4
  });
  floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = Math.PI / 2;
  floor.position.z = -100;
  floor.receiveShadow = true;
  scene.add(floor);

  // Create road lines
  createRoadLines();

  const playerGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const playerMat = new THREE.MeshStandardMaterial({ 
    color: 0x00ffcc,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x00ffcc,
    emissiveIntensity: 0.5
  });
  player = new THREE.Mesh(playerGeo, playerMat);
  player.position.y = 0.25;
  player.castShadow = true;
  scene.add(player);

  // Adjust lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 1.0); // Increased intensity
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x00ffcc, 1.0); // Increased intensity
  directionalLight.position.set(0, 10, 5);
  directionalLight.castShadow = true;
  // Adjust shadow properties
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  // Enable shadows with better quality
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Create trail effect (moved outside init)
  createTrail();

  for (let i = 0; i < 10; i++) addObstacle();

  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);

  setupTouchControls();
  animate();

  createEnvironment();

  // Create staggered billboards
  for (let i = 0; i < BILLBOARD_COUNT; i++) {
    const leftBillboard = createBillboard(true);
    const rightBillboard = createBillboard(false);
    
    // Stagger the billboards by offsetting right side
    leftBillboard.position.z = -i * BILLBOARD_DISTANCE - 20;
    rightBillboard.position.z = -i * BILLBOARD_DISTANCE - 20 - BILLBOARD_OFFSET;
    
    // Add some subtle random variation to X position
    const xVariation = Math.random() * 0.5;
    leftBillboard.position.x -= xVariation;
    rightBillboard.position.x += xVariation;
    
    // Add subtle random rotation variation
    const rotationVariation = (Math.random() - 0.5) * 0.1;
    leftBillboard.rotation.y += rotationVariation;
    rightBillboard.rotation.y += rotationVariation;

    billboards.push(leftBillboard, rightBillboard);
    scene.add(leftBillboard);
    scene.add(rightBillboard);
  }
}

function keyDown(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    keys.left = true;
    keys.right = false; // Ensure opposite direction is false
  }
  if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    keys.right = true;
    keys.left = false; // Ensure opposite direction is false
  }
  if ((e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') && !isJumping) {
    yVelocity = 0.2;
    isJumping = true;
  }
  if (e.code === 'Escape') {
    endGame();
  }
}

function keyUp(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
}

function setupTouchControls() {
  const controls = document.createElement('div');
  controls.id = 'touch-controls';
  controls.innerHTML = `
    <style>
      #touch-controls {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 20px;
        z-index: 10;
      }
      .touch-btn {
        background: rgba(0, 255, 204, 0.2);
        border: 2px solid #00ffcc;
        color: #00ffcc;
        font-size: 1.2rem;
        padding: 20px 25px;
        border-radius: 10px;
        user-select: none;
        cursor: pointer;
        touch-action: manipulation;
      }
      .touch-btn:active {
        background: rgba(0, 255, 204, 0.4);
      }
    </style>
    <button class="touch-btn" id="btn-left">⬅</button>
    <button class="touch-btn" id="btn-up">⬆</button>
    <button class="touch-btn" id="btn-right">➡</button>
  `;
  document.body.appendChild(controls);

  // Add restart button
  const restartBtn = document.createElement('button');
  restartBtn.id = 'restart-btn';
  restartBtn.textContent = 'Play Again';
  restartBtn.onclick = () => location.reload();
  document.body.appendChild(restartBtn);

  // Setup touch and mouse controls
  const left = document.getElementById('btn-left');
  const right = document.getElementById('btn-right');
  const up = document.getElementById('btn-up');

  // Touch events
  left.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.left = true;
    keys.right = false;
  });
  left.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.left = false;
  });

  right.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.right = true;
    keys.left = false;
  });
  right.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.right = false;
  });

  up.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isJumping) {
      yVelocity = 0.2;
      isJumping = true;
    }
  });

  // Mouse events
  left.addEventListener('mousedown', () => {
    keys.left = true;
    keys.right = false;
  });
  left.addEventListener('mouseup', () => keys.left = false);
  left.addEventListener('mouseleave', () => keys.left = false);

  right.addEventListener('mousedown', () => {
    keys.right = true;
    keys.left = false;
  });
  right.addEventListener('mouseup', () => keys.right = false);
  right.addEventListener('mouseleave', () => keys.right = false);

  up.addEventListener('mousedown', () => {
    if (!isJumping) {
      yVelocity = 0.2;
      isJumping = true;
    }
  });
}

// Move trail creation and management outside init
let trail, trailPoints;
const maxTrailPoints = 10;

function createTrail() {
  const trailGeometry = new THREE.BufferGeometry();
  const trailMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.5
  });
  trail = new THREE.Line(trailGeometry, trailMaterial);
  scene.add(trail);
  trailPoints = [];
}

function updateTrail() {
  if (!trail || !player) return;
  
  trailPoints.push(player.position.clone());
  if (trailPoints.length > maxTrailPoints) {
    trailPoints.shift();
  }
  
  const positions = new Float32Array(trailPoints.length * 3);
  trailPoints.forEach((point, i) => {
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  });
  
  trail.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  trail.geometry.attributes.position.needsUpdate = true;
}

function createRoadLines() {
  // Create center line segments
  const centerLineGeometry = new THREE.BufferGeometry();
  const centerLinePositions = [];
  for (let i = 0; i < LINE_SEGMENTS; i++) {
    // Create dashed line effect by skipping every other segment
    if (i % 2 === 0) {
      const zPos = -i * 10;
      centerLinePositions.push(0, 0.01, zPos); // Start of segment
      centerLinePositions.push(0, 0.01, zPos - 4); // End of segment
    }
  }
  centerLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(centerLinePositions, 3));
  const linesMaterial = new THREE.LineBasicMaterial({ 
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.7
  });
  centerLine = new THREE.LineSegments(centerLineGeometry, linesMaterial);
  scene.add(centerLine);

  // Create solid side lines
  const sideLineGeometry = new THREE.BufferGeometry();
  const sideLinePositions = [];
  // Left line
  sideLinePositions.push(-LANE_WIDTH/2, 0.01, 0);
  sideLinePositions.push(-LANE_WIDTH/2, 0.01, -200);
  // Right line
  sideLinePositions.push(LANE_WIDTH/2, 0.01, 0);
  sideLinePositions.push(LANE_WIDTH/2, 0.01, -200);

  sideLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sideLinePositions, 3));
  const sideLineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.9,
    linewidth: 2
  });
  
  leftLine = new THREE.Line(sideLineGeometry.clone(), sideLineMaterial);
  rightLine = new THREE.Line(sideLineGeometry.clone(), sideLineMaterial);
  scene.add(leftLine);
  scene.add(rightLine);

  // Add glow effect to lines
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x00ffcc) }
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
      varying vec3 vPosition;
      void main() {
        float intensity = 1.0 - abs(vPosition.x) / 2.0;
        gl_FragColor = vec4(color, intensity * 0.5);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });

  // Add glow planes along the side lines
  const glowGeometry = new THREE.PlaneGeometry(0.5, 200);
  const leftGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  const rightGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  
  leftGlow.position.set(-LANE_WIDTH/2, 0.1, -100);
  rightGlow.position.set(LANE_WIDTH/2, 0.1, -100);
  leftGlow.rotation.x = Math.PI / 2;
  rightGlow.rotation.x = Math.PI / 2;
  
  scene.add(leftGlow);
  scene.add(rightGlow);
}

function addObstacle() {
  const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const mat = new THREE.MeshStandardMaterial({ 
    color: 0xff00ff,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0xff00ff,
    emissiveIntensity: 0.5
  });
  const obs = new THREE.Mesh(geo, mat);
  obs.position.x = (Math.random() - 0.5) * (LANE_WIDTH - 0.5); // Adjust spawn width
  obs.position.y = 0.25;
  obs.position.z = -10 - Math.random() * 40;
  obs.castShadow = true;
  scene.add(obs);
  obstacles.push(obs);
}

function animate() {
  if (gameOver) return;
  requestAnimationFrame(animate);

  // Update movement with proper boundaries
  const acceleration = 0.01;
  const maxSpeed = 0.15;
  
  if (keys.left) {
    xSpeed = Math.max(xSpeed - acceleration, -maxSpeed);
  } else if (keys.right) {
    xSpeed = Math.min(xSpeed + acceleration, maxSpeed);
  } else {
    // Decelerate when no keys are pressed
    if (xSpeed > 0) xSpeed = Math.max(0, xSpeed - acceleration);
    if (xSpeed < 0) xSpeed = Math.min(0, xSpeed + acceleration);
  }

  // Apply movement with strict boundaries
  const newX = player.position.x + xSpeed;
  if (newX >= -(LANE_WIDTH/2 - 0.25) && newX <= (LANE_WIDTH/2 - 0.25)) {
    player.position.x = newX;
  } else {
    xSpeed = 0; // Stop movement at boundaries
  }

  // Animate center line segments (moving effect)
  if (centerLine) {
    const positions = centerLine.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 6) { // Move each segment
      positions[i + 2] += speed; // Start z
      positions[i + 5] += speed; // End z
      
      if (positions[i + 2] > 2) {
        positions[i + 2] -= 200;
        positions[i + 5] -= 200;
      }
    }
    centerLine.geometry.attributes.position.needsUpdate = true;
  }

  // Jump physics
  if (isJumping) {
    player.position.y += yVelocity;
    yVelocity += gravity;
    if (player.position.y <= 0.25) {
      player.position.y = 0.25;
      isJumping = false;
      yVelocity = 0;
    }
  }

  for (let obs of obstacles) {
    obs.position.z += speed;
    if (obs.position.z > 2) {
      obs.position.z = -40 - Math.random() * 20;
      obs.position.x = (Math.random() - 0.5) * (LANE_WIDTH - 0.5); // Adjust spawn width
      score++;
      document.getElementById('score').innerText = score;
      if (score > topScore) {
        topScore = score;
        document.getElementById('top-score').innerText = topScore;
        localStorage.setItem('jadaru-top-score', topScore);
      }
    }
    
    // Collision detection
    const dx = obs.position.x - player.position.x;
    const dz = obs.position.z - player.position.z;
    if (Math.abs(dx) < 0.5 && Math.abs(dz) < 0.5 && player.position.y < 0.75) {
      endGame();
    }
  }

  updateTrail();

  // Update billboards with proper recycling distance
  billboards.forEach(billboard => {
    billboard.position.z += speed;
    if (billboard.position.z > 20) {
      // Reset to the back with proper staggering
      billboard.position.z -= (BILLBOARD_COUNT * BILLBOARD_DISTANCE + BILLBOARD_OFFSET);
      
      // Randomize X position slightly when recycling
      const xVariation = Math.random() * 0.5;
      if (billboard.position.x < 0) { // Left side
        billboard.position.x = -(LANE_WIDTH/2 + 2) - xVariation;
      } else { // Right side
        billboard.position.x = (LANE_WIDTH/2 + 2) + xVariation;
      }
      
      // Randomize rotation slightly when recycling
      const baseRotation = billboard.position.x < 0 ? Math.PI / 6 : -Math.PI / 6;
      billboard.rotation.y = baseRotation + (Math.random() - 0.5) * 0.1;
    }
  });

  renderer.render(scene, camera);
}

function endGame() {
  gameOver = true;
  if (score > topScore) {
    topScore = score;
    document.getElementById('top-score').innerText = topScore;
    localStorage.setItem('jadaru-top-score', topScore);
  }

  const overlay = document.createElement('div');
  overlay.id = 'game-over-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
  overlay.style.color = '#00ffcc';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '30';
  overlay.style.fontFamily = 'monospace';
  overlay.innerHTML = `
    <h1>You died with a score of: ${score}</h1>
    <h2>Top Score: ${topScore}</h2>
    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #000; color: #00ffcc; border: 2px solid #00ffcc; border-radius: 8px; font-size: 1.2rem;">Play Again</button>
    <button onclick="window.location.href='/'" style="margin-top: 10px; padding: 8px 18px; background: #000; color: #00ffcc; border: 2px solid #00ffcc; border-radius: 8px; font-size: 1rem;">Return to Menu</button>
  `;
  document.body.appendChild(overlay);
}

// Add this function to create a billboard mesh
function createBillboard(isLeft) {
  const group = new THREE.Group();
  
  // Billboard frame
  const frameGeo = new THREE.BoxGeometry(0.2, 3, 4);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.8,
    roughness: 0.2
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = 1.5; // Height of the billboard
  group.add(frame);

  // Billboard screen
  const screenGeo = new THREE.PlaneGeometry(3, 2);
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.5,
    roughness: 0.5,
    emissive: 0x111111,
    emissiveIntensity: 0.2
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.y = 2; // Position above the frame
  screen.position.z = 0.15; // Slightly in front of frame
  screen.rotation.y = isLeft ? Math.PI / 6 : -Math.PI / 6; // Angle towards the road
  group.add(screen);

  // Add neon trim
  const neonGeo = new THREE.BoxGeometry(3.2, 2.2, 0.05);
  const neonMat = new THREE.MeshStandardMaterial({
    color: 0x00ffcc,
    emissive: 0x00ffcc,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8
  });
  const neon = new THREE.Mesh(neonGeo, neonMat);
  neon.position.y = 2;
  neon.position.z = 0.1;
  neon.rotation.y = screen.rotation.y;
  group.add(neon);

  // Position the entire billboard
  const sideOffset = isLeft ? -(LANE_WIDTH/2 + 2) : (LANE_WIDTH/2 + 2);
  group.position.set(sideOffset, 0, 0);
  
  return group;
}

// Add this function to create the environment
function createEnvironment() {
  // Create a dynamic sky with stars
  const starGeometry = new THREE.BufferGeometry();
  const starVertices = [];
  for (let i = 0; i < 5000; i++) {
    const r = 100; // radius of the star sphere
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    starVertices.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // Create distant mountains
  const mountainGeometry = new THREE.BufferGeometry();
  const mountainVertices = [];
  const mountainColors = [];
  
  for (let i = 0; i < 50; i++) {
    const x = (Math.random() - 0.5) * 200;
    const z = -50 - Math.random() * 100;
    const height = 10 + Math.random() * 20;
    
    // Create triangle
    mountainVertices.push(
      x - 5, 0, z,
      x + 5, 0, z,
      x, height, z
    );
    
    // Add color gradient
    const color = new THREE.Color();
    color.setHSL(0.5 + Math.random() * 0.1, 1, 0.1 + Math.random() * 0.1);
    for (let j = 0; j < 3; j++) {
      mountainColors.push(color.r, color.g, color.b);
    }
  }
  
  mountainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(mountainVertices, 3));
  mountainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(mountainColors, 3));
  
  const mountainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x002211,
    emissiveIntensity: 0.2
  });
  
  const mountains = new THREE.Mesh(mountainGeometry, mountainMaterial);
  scene.add(mountains);

  // Add fog
  scene.fog = new THREE.FogExp2(0x000000, 0.015);

  // Create ground plane for environment (extends beyond the road)
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x001111,
    metalness: 0.8,
    roughness: 0.5,
    emissive: 0x001111,
    emissiveIntensity: 0.1
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = Math.PI / 2;
  ground.position.y = -0.1;
  ground.position.z = -100;
  scene.add(ground);

  // Add some random cyber-trees
  for (let i = 0; i < 100; i++) {
    const treeGroup = new THREE.Group();
    
    // Tree trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 2 + Math.random() * 3, 6);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.8,
      roughness: 0.2
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    treeGroup.add(trunk);

    // Tree foliage (geometric shapes with glow)
    const foliageGeo = new THREE.IcosahedronGeometry(1 + Math.random());
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x00ff99,
      emissive: 0x00ff99,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.8
    });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = trunk.geometry.parameters.height;
    treeGroup.add(foliage);

    // Position the tree
    const x = (Math.random() - 0.5) * 100;
    const z = -20 - Math.random() * 160;
    // Keep trees away from the road
    if (Math.abs(x) < LANE_WIDTH + 4) {
      continue;
    }
    treeGroup.position.set(x, 0, z);
    scene.add(treeGroup);
  }
}

// Add asset preloading
const preloadAssets = async () => {
    const loadingManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadingManager);
    
    return new Promise((resolve, reject) => {
        loadingManager.onLoad = resolve;
        loadingManager.onError = reject;
        
        // Preload textures/assets here
    });
};

init();