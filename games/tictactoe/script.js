// Game Elements
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const playerIcon = document.getElementById('player-icon');
const resetButton = document.getElementById('reset');
const clearStatsButton = document.getElementById('clear-stats');
const toggleSoundButton = document.getElementById('toggle-sound');
const fullscreenButton = document.getElementById('fullscreen-btn');

// Statistics Elements
const xWinsElement = document.getElementById('wins-x');
const oWinsElement = document.getElementById('wins-o');
const drawsElement = document.getElementById('draws');

// Game Overlay Elements
const gameOverlay = document.getElementById('game-overlay');
const resultIcon = document.getElementById('result-icon');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const playAgainButton = document.getElementById('play-again-btn');
const newGameButton = document.getElementById('new-game-btn');

// Game Mode Elements
const modeBtns = document.querySelectorAll('.mode-btn');

// Game State
let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' or 'ai'
let soundEnabled = true;
let gameStats = {
  xWins: 0,
  oWins: 0,
  draws: 0
};

// Initialize game
function initGame() {
  loadStats();
  updateStatsDisplay();
  createBoard();
  updatePlayerIndicator();
  setupEventListeners();
}

// Load statistics from localStorage
function loadStats() {
  const savedStats = localStorage.getItem('tictactoe-stats');
  if (savedStats) {
    gameStats = JSON.parse(savedStats);
  }
}

// Save statistics to localStorage
function saveStats() {
  localStorage.setItem('tictactoe-stats', JSON.stringify(gameStats));
}

// Update statistics display
function updateStatsDisplay() {
  xWinsElement.textContent = gameStats.xWins;
  oWinsElement.textContent = gameStats.oWins;
  drawsElement.textContent = gameStats.draws;
}

// Create game board
function createBoard() {
  boardElement.innerHTML = '';
  board.forEach((cell, index) => {
    const cellEl = document.createElement('div');
    cellEl.classList.add('cell');
    cellEl.dataset.index = index;
    if (cell) {
      cellEl.textContent = cell === 'X' ? '❌' : '⭕';
      cellEl.classList.add('placed');
      cellEl.classList.add(cell.toLowerCase());
    }
    cellEl.addEventListener('click', handleCellClick);
    boardElement.appendChild(cellEl);
  });
}

// Handle cell click
function handleCellClick(e) {
  const index = parseInt(e.target.dataset.index);
  if (!gameActive || board[index]) return;
  
  makeMove(index, currentPlayer);
  
  if (gameMode === 'ai' && gameActive && currentPlayer === 'O') {
    setTimeout(() => {
      makeAIMove();
    }, 500);
  }
}

// Make a move
function makeMove(index, player) {
  board[index] = player;
  const cellEl = boardElement.children[index];
  cellEl.textContent = player === 'X' ? '❌' : '⭕';
  cellEl.classList.add('placed');
  cellEl.classList.add(player.toLowerCase());
  
  if (soundEnabled) {
    playSound('move');
  }
  
  const winner = checkWinner();
  if (winner) {
    handleGameEnd(winner);
    return;
  }
  
  if (board.every(cell => cell)) {
    handleGameEnd('draw');
    return;
  }
  
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updatePlayerIndicator();
  statusElement.textContent = `${currentPlayer}'s turn`;
}

// AI Move (simple random for now)
function makeAIMove() {
  const emptyCells = board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
  if (emptyCells.length === 0) return;
  
  const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  makeMove(randomIndex, 'O');
}

// Check for winner
function checkWinner() {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  
  for (const combo of combos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      highlightWinner(combo);
      return board[a];
    }
  }
  return null;
}

// Highlight winning combination
function highlightWinner(combo) {
  combo.forEach(i => {
    boardElement.children[i].classList.add('winner');
  });
}

// Handle game end
function handleGameEnd(result) {
  gameActive = false;
  
  // Add a small delay to let the winning animation show
  setTimeout(() => {
    if (result === 'draw') {
      gameStats.draws++;
      showGameOverlay('🤝', 'It\'s a Draw!', 'Good game! Nobody wins this time.');
    } else {
      if (result === 'X') {
        gameStats.xWins++;
        showGameOverlay('🎉', 'X Wins!', `${gameMode === 'ai' ? 'You win!' : 'Player X wins!'} Great job!`);
      } else {
        gameStats.oWins++;
        showGameOverlay('🎊', 'O Wins!', `${gameMode === 'ai' ? 'Computer wins!' : 'Player O wins!'} Well played!`);
      }
    }
    
    saveStats();
    updateStatsDisplay();
    
    if (soundEnabled) {
      playSound(result === 'draw' ? 'draw' : 'win');
    }
  }, 1000); // 1 second delay to show the winning animation
}

// Show game overlay
function showGameOverlay(icon, title, message) {
  resultIcon.textContent = icon;
  resultTitle.textContent = title;
  resultMessage.textContent = message;
  gameOverlay.classList.add('active');
}

// Hide game overlay
function hideGameOverlay() {
  gameOverlay.classList.remove('active');
}

// Reset game
function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  statusElement.textContent = "X's turn";
  updatePlayerIndicator();
  createBoard();
  hideGameOverlay();
}

// Update player indicator
function updatePlayerIndicator() {
  playerIcon.textContent = currentPlayer === 'X' ? '❌' : '⭕';
}

// Clear statistics
function clearStats() {
  gameStats = { xWins: 0, oWins: 0, draws: 0 };
  saveStats();
  updateStatsDisplay();
  if (soundEnabled) {
    playSound('clear');
  }
}

// Toggle sound
function toggleSound() {
  soundEnabled = !soundEnabled;
  const soundBtn = toggleSoundButton.querySelector('.btn-icon');
  const soundText = toggleSoundButton.querySelector('span:last-child');
  
  if (soundEnabled) {
    soundBtn.textContent = '🔊';
    soundText.textContent = 'Sound On';
  } else {
    soundBtn.textContent = '🔇';
    soundText.textContent = 'Sound Off';
  }
  
  localStorage.setItem('tictactoe-sound', soundEnabled);
}

// Play sound effect
function playSound(type) {
  // Simple sound implementation using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  switch (type) {
    case 'move':
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      break;
    case 'win':
      oscillator.frequency.value = 523.25;
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      break;
    case 'draw':
      oscillator.frequency.value = 440;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      break;
    case 'clear':
      oscillator.frequency.value = 300;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      break;
  }
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);
}

// Toggle fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log('Error attempting to enable fullscreen:', err);
    });
  } else {
    document.exitFullscreen();
  }
}

// Set game mode
function setGameMode(mode) {
  gameMode = mode;
  modeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  resetGame();
}

// Setup event listeners
function setupEventListeners() {
  resetButton.addEventListener('click', resetGame);
  clearStatsButton.addEventListener('click', clearStats);
  toggleSoundButton.addEventListener('click', toggleSound);
  fullscreenButton.addEventListener('click', toggleFullscreen);
  playAgainButton.addEventListener('click', resetGame);
  newGameButton.addEventListener('click', resetGame);
  
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => setGameMode(btn.dataset.mode));
  });
  
  // Load sound preference
  const savedSound = localStorage.getItem('tictactoe-sound');
  if (savedSound !== null) {
    soundEnabled = JSON.parse(savedSound);
    toggleSound();
    toggleSound(); // Double toggle to set correct state
  }
}

// Initialize the game
initGame();
