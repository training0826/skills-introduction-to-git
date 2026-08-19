// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Colors for blocks (dev-themed)
const COLORS = {
  0: "#252526", // Empty
  1: "#f48771", // Bug red
  2: "#4ec9b0", // Function cyan
  3: "#ce9178", // String orange
  4: "#c586c0", // Class purple
  5: "#dcdcaa", // Variable yellow
  6: "#569cd6", // Keyword blue
  7: "#b5cea8", // Number green
  8: "#ffffff", // White block
};

// Tetromino shapes
const SHAPES = [
  [[1]], // Single block
  [[2, 2]], // Horizontal pair
  [[3], [3]], // Vertical pair
  [
    [6, 0],
    [6, 0],
    [6, 6],
  ], // L shape
  [
    [0, 7],
    [0, 7],
    [7, 7],
  ], // Mirrored L shape
  [
    [4, 4],
    [4, 4],
  ], // 2x2 square
  [[5, 5, 5]], // Horizontal line of 3
  [[6, 6, 6, 6]], // I tetromino
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T tetromino
  [
    [0, 2, 2],
    [2, 2, 0],
  ], // S tetromino
  [
    [3, 3, 0],
    [0, 3, 3],
  ], // Z tetromino
  [[8]], // White block
  [[8, 8]], // White pair
];

// Game state
let canvas, ctx, patternCanvas, patternCtx;
let board = [];
let currentPiece = null;
let nextPiece = null;
let currentX = 0;
let currentY = 0;
let score = 0;
let gameOver = false;
let highScore = 0;
let level = 1;
let totalLinesCleared = 0;
let isPaused = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Initialize game
function init() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  patternCanvas = document.getElementById("patternCanvas");
  patternCtx = patternCanvas.getContext("2d");

  // Initialize empty board
  board = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(0));

  nextPiece = createRandomPiece();
  drawNextPiecePreview();

  // Spawn first piece
  spawnPiece();

  // Start game loop
  requestAnimationFrame(gameLoop);

  // Add keyboard controls
  document.addEventListener("keydown", handleKeyPress);
}

function createRandomPiece() {
  const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return randomShape.map((row) => [...row]);
}

// Game loop
function gameLoop(time = 0) {
  if (!gameOver && !isPaused) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      moveDown();
      dropCounter = 0;
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// Draw everything
function draw() {
  // Clear canvas
  ctx.fillStyle = COLORS[0];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw board
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) {
        drawBlock(ctx, col, row, board[row][col]);
      }
    }
  }

  // Draw current piece
  if (currentPiece) {
    drawPiece(ctx, currentPiece, currentX, currentY);
  }

  // Draw grid
  ctx.strokeStyle = "#3e3e42";
  ctx.lineWidth = 0.5;
  for (let row = 0; row <= ROWS; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * BLOCK_SIZE);
    ctx.lineTo(COLS * BLOCK_SIZE, row * BLOCK_SIZE);
    ctx.stroke();
  }
  for (let col = 0; col <= COLS; col++) {
    ctx.beginPath();
    ctx.moveTo(col * BLOCK_SIZE, 0);
    ctx.lineTo(col * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    ctx.stroke();
  }
}

// Draw a single block
function drawBlock(context, x, y, colorCode) {
  context.fillStyle = COLORS[colorCode];
  context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  context.strokeStyle = "#1e1e1e";
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Draw current piece
function drawPiece(context, piece, offsetX, offsetY) {
  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      if (piece[row][col]) {
        drawBlock(context, offsetX + col, offsetY + row, piece[row][col]);
      }
    }
  }
}

// Spawn new piece
function spawnPiece() {
  currentPiece = nextPiece || createRandomPiece();
  nextPiece = createRandomPiece();
  drawNextPiecePreview();
  currentX = Math.floor(COLS / 2) - Math.floor(currentPiece[0].length / 2);
  currentY = 0;

  if (checkCollision(currentPiece, currentX, currentY)) {
    endGame();
  }
}

// Check collision
function checkCollision(piece, x, y) {
  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      if (piece[row][col]) {
        const newX = x + col;
        const newY = y + row;

        if (newX < 0 || newX >= COLS || newY >= ROWS) {
          return true;
        }

        if (newY >= 0 && board[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

// Move piece down
function moveDown() {
  if (!checkCollision(currentPiece, currentX, currentY + 1)) {
    currentY++;
  } else {
    lockPiece();
    clearCompletedLines();
    spawnPiece();
  }
}

// Lock piece to board
function lockPiece() {
  for (let row = 0; row < currentPiece.length; row++) {
    for (let col = 0; col < currentPiece[row].length; col++) {
      if (currentPiece[row][col]) {
        const boardY = currentY + row;
        const boardX = currentX + col;
        if (boardY >= 0) {
          board[boardY][boardX] = currentPiece[row][col];
        }
      }
    }
  }
}

// Rotate piece
function rotate() {
  const rotated = currentPiece[0].map((_, i) => currentPiece.map((row) => row[i]).reverse());

  if (!checkCollision(rotated, currentX, currentY)) {
    currentPiece = rotated;
  }
}

// Move left
function moveLeft() {
  if (!checkCollision(currentPiece, currentX - 1, currentY)) {
    currentX--;
  }
}

// Move right
function moveRight() {
  if (!checkCollision(currentPiece, currentX + 1, currentY)) {
    currentX++;
  }
}

// Hard drop
function hardDrop() {
  while (!checkCollision(currentPiece, currentX, currentY + 1)) {
    currentY++;
  }
  lockPiece();
  clearCompletedLines();
  spawnPiece();
}

// Clear any completed rows and collapse the board downward
function clearCompletedLines() {
  let clearedLines = 0;

  for (let row = ROWS - 1; row >= 0; row--) {
    const isFull = board[row].every((cell) => cell !== 0);
    if (isFull) {
      board.splice(row, 1);
      board.unshift(Array(COLS).fill(0));
      clearedLines++;
      row++;
    }
  }

  if (clearedLines > 0) {
    totalLinesCleared += clearedLines;
    const lineClearPoints = {
      1: 100,
      2: 300,
      3: 500,
      4: 800,
    };
    score += (lineClearPoints[clearedLines] || 0) * level;
    const newLevel = Math.floor(totalLinesCleared / 10) + 1;
    if (newLevel !== level) {
      level = newLevel;
      dropInterval = Math.max(150, 1000 - (level - 1) * 80);
      document.getElementById("level").textContent = level;
    }
    updateScore();
  }
}

// Draw the next piece preview in the side panel
function drawNextPiecePreview() {
  const blockSize = 20;
  patternCtx.fillStyle = "#1e1e1e";
  patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

  if (!nextPiece) return;

  const pieceHeight = nextPiece.length;
  const pieceWidth = nextPiece[0].length;
  const offsetX = Math.floor((patternCanvas.width - pieceWidth * blockSize) / 2);
  const offsetY = Math.floor((patternCanvas.height - pieceHeight * blockSize) / 2);

  for (let row = 0; row < pieceHeight; row++) {
    for (let col = 0; col < pieceWidth; col++) {
      const colorCode = nextPiece[row][col];
      if (colorCode) {
        patternCtx.fillStyle = COLORS[colorCode];
        patternCtx.fillRect(offsetX + col * blockSize, offsetY + row * blockSize, blockSize, blockSize);
        patternCtx.strokeStyle = "#3e3e42";
        patternCtx.strokeRect(offsetX + col * blockSize, offsetY + row * blockSize, blockSize, blockSize);
      }
    }
  }
}

function updateScore() {
  document.getElementById("score").textContent = score;

  // Update high score if current score exceeds it
  if (score > highScore) {
    highScore = score;
    document.getElementById("high-score").textContent = highScore;
    localStorage.setItem("stackOverflownHighScore", highScore);
  }
}

// Handle keyboard input
function handleKeyPress(e) {
  if (gameOver) return;

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      if (!isPaused) moveLeft();
      break;
    case "ArrowRight":
      e.preventDefault();
      if (!isPaused) moveRight();
      break;
    case "ArrowDown":
      e.preventDefault();
      if (!isPaused) moveDown();
      break;
    case "ArrowUp":
      e.preventDefault();
      if (!isPaused) rotate();
      break;
    case " ":
      e.preventDefault();
      if (!isPaused) hardDrop();
      break;
    case "p":
    case "P":
      e.preventDefault();
      togglePause();
      break;
  }
}

// Toggle pause
function togglePause() {
  isPaused = !isPaused;
  document.getElementById("status").textContent = isPaused ? "Paused" : "Playing...";
}

// End game
function endGame() {
  gameOver = true;
  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameOver").classList.add("show");
}

// Start the game when page loads
window.addEventListener("load", init);
