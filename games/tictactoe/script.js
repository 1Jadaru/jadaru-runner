const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetButton = document.getElementById('reset');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;

function createBoard() {
  boardElement.innerHTML = '';
  board.forEach((cell, index) => {
    const cellEl = document.createElement('div');
    cellEl.classList.add('cell');
    cellEl.dataset.index = index;
    cellEl.textContent = cell ? cell : '';
    if (cell === 'O') cellEl.classList.add('o');
    cellEl.addEventListener('click', handleCellClick);
    boardElement.appendChild(cellEl);
  });
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || board[index]) return;
  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  if (currentPlayer === 'O') e.target.classList.add('o');
  if (checkWinner()) {
    statusElement.textContent = `${currentPlayer} wins!`;
    gameActive = false;
    return;
  }
  if (board.every(cell => cell)) {
    statusElement.textContent = 'Draw!';
    gameActive = false;
    return;
  }
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusElement.textContent = `${currentPlayer}'s turn`;
}

function checkWinner() {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return combos.some(combo => {
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      highlightWinner(combo);
      return true;
    }
    return false;
  });
}

function highlightWinner(combo) {
  combo.forEach(i => {
    boardElement.children[i].classList.add('winner');
  });
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  statusElement.textContent = "X's turn";
  createBoard();
}

resetButton.addEventListener('click', resetGame);

createBoard();
