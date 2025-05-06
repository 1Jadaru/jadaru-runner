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

const keys = {
  left: false,
  right: false,
  up: false
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

  const floorGeo = new THREE.PlaneGeometry(20, 200);
  const floorMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
  floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = Math.PI / 2;
  floor.position.z = -100;
  scene.add(floor);

  const playerGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const playerMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
  player = new THREE.Mesh(playerGeo, playerMat);
  player.position.y = 0.25;
  scene.add(player);

  for (let i = 0; i < 10; i++) addObstacle();

  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);

  setupTouchControls();
  animate();
}

function keyDown(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if ((e.code === 'ArrowUp' || e.code === 'Space') && !isJumping) {
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
        padding: 10px 15px;
        border-radius: 10px;
        user-select: none;
      }
      #restart-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #000;
        color: #00ffcc;
        font-size: 1.5rem;
        padding: 1rem 2rem;
        border: 2px solid #00ffcc;
        border-radius: 10px;
        z-index: 20;
        display: none;
      }
    </style>
    <button class="touch-btn" id="btn-left">⬅</button>
    <button class="touch-btn" id="btn-up">⬆</button>
    <button class="touch-btn" id="btn-right">➡</button>
  `;
  document.body.appendChild(controls);

  const restartBtn = document.createElement('button');
  restartBtn.id = 'restart-btn';
  restartBtn.textContent = 'Play Again';
  restartBtn.onclick = () => location.reload();
  document.body.appendChild(restartBtn);

  const left = document.getElementById('btn-left');
  const right = document.getElementById('btn-right');
  const up = document.getElementById('btn-up');

  left.addEventListener('touchstart', () => keys.left = true);
  left.addEventListener('touchend', () => keys.left = false);

  right.addEventListener('touchstart', () => keys.right = true);
  right.addEventListener('touchend', () => keys.right = false);

  up.addEventListener('touchstart', () => {
    if (!isJumping) {
      yVelocity = 0.2;
      isJumping = true;
    }
  });
}

function addObstacle() {
  const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const mat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const obs = new THREE.Mesh(geo, mat);
  obs.position.x = (Math.random() - 0.5) * 4;
  obs.position.y = 0.25;
  obs.position.z = -10 - Math.random() * 40;
  scene.add(obs);
  obstacles.push(obs);
}

function animate() {
  if (gameOver) return;
  requestAnimationFrame(animate);

  if (keys.left) xSpeed = -0.1;
  else if (keys.right) xSpeed = 0.1;
  else xSpeed = 0;

  player.position.x += xSpeed;

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
      obs.position.x = (Math.random() - 0.5) * 4;
      score++;
      document.getElementById('score').innerText = score;
      if (score > topScore) {
        topScore = score;
        document.getElementById('top-score').innerText = topScore;
        localStorage.setItem('jadaru-top-score', topScore);
      }
    }
    const dx = obs.position.x - player.position.x;
    const dz = obs.position.z;
    if (Math.abs(dx) < 0.5 && dz > -0.25 && dz < 0.25 && player.position.y < 0.5) {
      endGame();
    }
  }

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

init();