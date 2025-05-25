'use strict';

// --- Global Constants ---
const PLAYER_SPEED = 0.15;
const PLAYER_BOUNDS = { x: 2.5, z: 2.5 }; // Adjust if you change the camera or scene
const SPHERE_RADIUS = 0.15;
const NUM_SPHERES = 5;

// --- Helper Functions ---
function randomPosition() {
  return new THREE.Vector3(
    (Math.random() - 0.5) * PLAYER_BOUNDS.x * 2,
    0,
    (Math.random() - 0.5) * PLAYER_BOUNDS.z * 2
  );
}

// --- Scene, Camera, Renderer ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222244);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 3, 6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.1, 50);
pointLight.position.set(0, 6, 6);
scene.add(pointLight);

// --- Player Cube ---
const playerGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const playerCube = new THREE.Mesh(playerGeometry, playerMaterial);
playerCube.position.set(0, 0, 0);
scene.add(playerCube);

// --- Floor (optional, for visual reference) ---
const floorGeometry = new THREE.PlaneGeometry(6, 6);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x111111, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -0.17;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// --- Spheres ---
function createSphere() {
  const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32);
  const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.copy(randomPosition());
  scene.add(sphere);
  return sphere;
}

const spheres = [];
for (let i = 0; i < NUM_SPHERES; i++) {
  spheres.push(createSphere());
}
const sphereCollected = new Array(NUM_SPHERES).fill(false);

// --- Score Display ---
let score = 0;
const scoreElem = document.getElementById('score');
function updateScore() {
  scoreElem.innerText = `Score: ${score}/${NUM_SPHERES}`;
}
updateScore();

// --- Sound Effect ---
const collectSound = document.getElementById('collectSound');

// --- Player Movement State ---
const movement = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false };

// --- Input Handling ---
document.addEventListener('keydown', (e) => {
  if (movement.hasOwnProperty(e.key)) movement[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  if (movement.hasOwnProperty(e.key)) movement[e.key] = false;
});

// --- Window Resize Handling ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Game Loop ---
let gameOver = false;

function animate() {
  requestAnimationFrame(animate);

  // Move Player
  if (!gameOver) {
    let dx = 0, dz = 0;
    if (movement.ArrowLeft) dx -= PLAYER_SPEED;
    if (movement.ArrowRight) dx += PLAYER_SPEED;
    if (movement.ArrowUp) dz -= PLAYER_SPEED;
    if (movement.ArrowDown) dz += PLAYER_SPEED;
    playerCube.position.x += dx;
    playerCube.position.z += dz;
    // Clamp to bounds
    playerCube.position.x = Math.max(Math.min(playerCube.position.x, PLAYER_BOUNDS.x), -PLAYER_BOUNDS.x);
    playerCube.position.z = Math.max(Math.min(playerCube.position.z, PLAYER_BOUNDS.z), -PLAYER_BOUNDS.z);
    // Optional: Animate the player
    playerCube.rotation.y += dx * 0.15;
    playerCube.rotation.x += dz * 0.15;
  }

  // Collision & Collection
  spheres.forEach((sphere, idx) => {
    if (!sphereCollected[idx] && playerCube.position.distanceTo(sphere.position) < SPHERE_RADIUS + 0.17) {
      sphereCollected[idx] = true;
      score += 1;
      updateScore();
      if (collectSound) {
        collectSound.currentTime = 0;
        collectSound.play();
      }
      // Respawn sphere at new random location
      sphere.position.copy(randomPosition());
      sphereCollected[idx] = false; // If you want the game to end, set this to true and comment out respawn.
      // If you want spheres to disappear instead of respawn, uncomment below:
      // scene.remove(sphere);
      // sphereCollected[idx] = true;
    }
  });

  // Win Condition (all spheres collected and not respawning)
  // Uncomment this if you want to end the game when all are collected:
  // if (!gameOver && sphereCollected.every(Boolean)) {
  //   gameOver = true;
  //   setTimeout(() => alert('You win! Refresh to play again.'), 200);
  // }

  renderer.render(scene, camera);
}
animate();
