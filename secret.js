const secretZone = document.getElementById('secret-zone');
const calculator = document.getElementById('calculator');
const closeSecretBtn = document.getElementById('close-secret');
const gameCatalog = document.getElementById('game-catalog');
const gameWorkspace = document.getElementById('game-workspace');
const backToCatalogBtn = document.getElementById('back-to-catalog');
const playButtons = Array.from(document.querySelectorAll('.play-btn'));
const gameCards = Array.from(document.querySelectorAll('.game-card'));

const panels = {
  cps: document.getElementById('game-cps'),
  space: document.getElementById('game-space'),
  snake: document.getElementById('game-snake'),
  rps: document.getElementById('game-rps'),
  tictactoe: document.getElementById('game-tictactoe')
};

const durationButtons = Array.from(document.querySelectorAll('.duration-btn'));
const durations = { cps: 1, space: 1 };
let secretOpen = false;
let modalOpen = false;
let lastResult = null;

const resultModal = document.getElementById('result-modal');
const modalDuration = document.getElementById('modal-duration');
const modalActions = document.getElementById('modal-actions');
const modalScore = document.getElementById('modal-score');
const modalReplay = document.getElementById('modal-replay');
const modalChangeMode = document.getElementById('modal-change-mode');
const modalBackMenu = document.getElementById('modal-back-menu');


// RPS
const rpsStatusEl = document.getElementById('rps-status');
const rpsPlayerEl = document.getElementById('rps-player');
const rpsBotEl = document.getElementById('rps-bot');
const rpsChoices = Array.from(document.querySelectorAll('.rps-choice'));
let rpsPlayerScore = 0;
let rpsBotScore = 0;

const resetRps = () => {
  rpsPlayerScore = 0;
  rpsBotScore = 0;
  rpsPlayerEl.textContent = '0';
  rpsBotEl.textContent = '0';
  rpsStatusEl.textContent = 'Prêt.';
};

const beats = {
  pierre: 'ciseaux',
  ciseaux: 'feuille',
  feuille: 'pierre'
};

rpsChoices.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!secretOpen || modalOpen) return;
    const user = btn.dataset.choice;
    const options = ['pierre', 'feuille', 'ciseaux'];
    const bot = options[Math.floor(Math.random() * options.length)];

    if (user === bot) {
      rpsStatusEl.textContent = `Égalité (${user} vs ${bot})`;
      return;
    }

    if (beats[user] === bot) {
      rpsPlayerScore += 1;
      rpsPlayerEl.textContent = String(rpsPlayerScore);
      rpsStatusEl.textContent = `Gagné ! (${user} bat ${bot})`;
    } else {
      rpsBotScore += 1;
      rpsBotEl.textContent = String(rpsBotScore);
      rpsStatusEl.textContent = `Perdu ! (${bot} bat ${user})`;
    }
  });
});

// Tic Tac Toe
const tttGrid = document.getElementById('ttt-grid');
const tttCells = Array.from(document.querySelectorAll('.ttt-cell'));
const tttStatusEl = document.getElementById('ttt-status');
const tttResetBtn = document.getElementById('ttt-reset');
let tttBoard = Array(9).fill('');
let tttOver = false;

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]
];

const checkWinner = (board, mark) => winPatterns.some((p) => p.every((i) => board[i] === mark));

const renderTtt = () => {
  tttCells.forEach((cell, i) => {
    cell.textContent = tttBoard[i];
    cell.disabled = tttOver || tttBoard[i] !== '';
  });
};

const resetTtt = () => {
  tttBoard = Array(9).fill('');
  tttOver = false;
  tttStatusEl.textContent = 'Ton tour.';
  renderTtt();
};

const botMove = () => {
  const free = tttBoard.map((v, i) => (v === '' ? i : -1)).filter((i) => i !== -1);
  if (!free.length) return;
  const idx = free[Math.floor(Math.random() * free.length)];
  tttBoard[idx] = 'O';

  if (checkWinner(tttBoard, 'O')) {
    tttStatusEl.textContent = "L'ordinateur gagne.";
    tttOver = true;
  } else if (!tttBoard.includes('')) {
    tttStatusEl.textContent = 'Match nul.';
    tttOver = true;
  } else {
    tttStatusEl.textContent = 'Ton tour.';
  }
  renderTtt();
};

tttGrid.addEventListener('click', (event) => {
  if (!secretOpen || modalOpen || tttOver) return;
  const btn = event.target.closest('.ttt-cell');
  if (!btn) return;
  const idx = Number(btn.dataset.cell);
  if (tttBoard[idx] !== '') return;
  tttBoard[idx] = 'X';

  if (checkWinner(tttBoard, 'X')) {
    tttStatusEl.textContent = 'Tu as gagné !';
    tttOver = true;
    renderTtt();
    return;
  }

  if (!tttBoard.includes('')) {
    tttStatusEl.textContent = 'Match nul.';
    tttOver = true;
    renderTtt();
    return;
  }

  tttStatusEl.textContent = "Tour de l'ordinateur...";
  renderTtt();
  setTimeout(botMove, 250);
});

tttResetBtn.addEventListener('click', () => {
  if (!secretOpen || modalOpen) return;
  resetTtt();
});

const setActiveGame = (game) => {
  gameCards.forEach((card) => card.classList.toggle('active', card.dataset.card === game));
  Object.entries(panels).forEach(([key, panel]) => panel.classList.toggle('hidden', key !== game));
};

const showCatalog = () => {
  gameCatalog.classList.remove('hidden');
  gameWorkspace.classList.add('hidden');
};

const showWorkspace = () => {
  gameCatalog.classList.add('hidden');
  gameWorkspace.classList.remove('hidden');
};

const openResultModal = ({ mode, duration, actions, score }) => {
  lastResult = { mode, duration, actions, score };
  modalDuration.textContent = `${duration}s`;
  modalActions.textContent = String(actions);
  modalScore.textContent = score.toFixed(2);
  resultModal.classList.remove('hidden');
  resultModal.setAttribute('aria-hidden', 'false');
  modalOpen = true;
};

const closeResultModal = () => {
  resultModal.classList.add('hidden');
  resultModal.setAttribute('aria-hidden', 'true');
  modalOpen = false;
};

// CPS
const cpsArea = document.getElementById('cps-area');
const cpsClicksEl = document.getElementById('cps-clicks');
const cpsRateEl = document.getElementById('cps-rate');
const cpsTimeEl = document.getElementById('cps-time');
const cpsFinalEl = document.getElementById('cps-final');
let cpsTimer = null;
let cpsState = null;

const resetCps = () => {
  clearInterval(cpsTimer);
  cpsState = null;
  cpsClicksEl.textContent = '0';
  cpsRateEl.textContent = '0.00';
  cpsTimeEl.textContent = Number(durations.cps).toFixed(1);
  cpsFinalEl.textContent = 'Prêt.';
};

const startCpsIfNeeded = () => {
  if (cpsState || modalOpen) return;
  cpsState = { clicks: 0, elapsed: 0 };
  cpsFinalEl.textContent = 'GO !';
  cpsTimer = setInterval(() => {
    if (!cpsState) return;
    cpsState.elapsed += 0.1;
    const remain = Math.max(0, durations.cps - cpsState.elapsed);
    cpsTimeEl.textContent = remain.toFixed(1);
    if (remain <= 0) {
      clearInterval(cpsTimer);
      const actions = cpsState.clicks;
      const score = actions / durations.cps;
      cpsFinalEl.textContent = `Terminé : ${actions} clics • CPS ${score.toFixed(2)}`;
      cpsState = null;
      openResultModal({ mode: 'cps', duration: durations.cps, actions, score });
    }
  }, 100);
};

cpsArea.addEventListener('click', () => {
  if (!secretOpen || modalOpen) return;
  startCpsIfNeeded();
  if (!cpsState) return;
  cpsState.clicks += 1;
  cpsClicksEl.textContent = String(cpsState.clicks);
  cpsRateEl.textContent = (cpsState.clicks / Math.max(cpsState.elapsed, 0.1)).toFixed(2);
});

// SPACE
const spaceFocusBtn = document.getElementById('space-focus');
const spacePressesEl = document.getElementById('space-presses');
const spaceRateEl = document.getElementById('space-rate');
const spaceTimeEl = document.getElementById('space-time');
const spaceFinalEl = document.getElementById('space-final');
let spaceArmed = false;
let spaceTimer = null;
let spaceState = null;

const resetSpace = () => {
  clearInterval(spaceTimer);
  spaceState = null;
  spaceArmed = false;
  spacePressesEl.textContent = '0';
  spaceRateEl.textContent = '0.00';
  spaceTimeEl.textContent = Number(durations.space).toFixed(1);
  spaceFinalEl.textContent = 'Prêt.';
  spaceFocusBtn.textContent = 'Activer le mode espace';
};

spaceFocusBtn.addEventListener('click', () => {
  if (!secretOpen || modalOpen) return;
  spaceArmed = true;
  spaceFocusBtn.textContent = 'Mode actif : appuie sur Espace';
});

const startSpaceIfNeeded = () => {
  if (spaceState || modalOpen) return;
  spaceState = { presses: 0, elapsed: 0 };
  spaceFinalEl.textContent = 'GO !';
  spaceTimer = setInterval(() => {
    if (!spaceState) return;
    spaceState.elapsed += 0.1;
    const remain = Math.max(0, durations.space - spaceState.elapsed);
    spaceTimeEl.textContent = remain.toFixed(1);
    if (remain <= 0) {
      clearInterval(spaceTimer);
      const actions = spaceState.presses;
      const score = actions / durations.space;
      spaceFinalEl.textContent = `Terminé : ${actions} appuis • APS ${score.toFixed(2)}`;
      spaceState = null;
      spaceArmed = false;
      spaceFocusBtn.textContent = 'Activer le mode espace';
      openResultModal({ mode: 'space', duration: durations.space, actions, score });
    }
  }, 100);
};

// SNAKE (replacement for flappy)
const snakeCanvas = document.getElementById('snake-canvas');
const snakeCtx = snakeCanvas.getContext('2d');
const snakeStartBtn = document.getElementById('snake-start');
const snakeScoreEl = document.getElementById('snake-score');
const snakeBestEl = document.getElementById('snake-best');
const snakeDirBtns = Array.from(document.querySelectorAll('.snake-dir'));

const GRID = 20;
const COLS = Math.floor(snakeCanvas.width / GRID);
const ROWS = Math.floor(snakeCanvas.height / GRID);
let snakeLoop = null;
let snakeRunning = false;
let snake;
let food;
let direction;
let nextDirection;
let snakeScore;

const getSnakeBest = () => Number(localStorage.getItem('secret_snake_best') || 0);
const setSnakeBest = (value) => localStorage.setItem('secret_snake_best', String(value));

const spawnFood = () => {
  while (true) {
    const candidate = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!snake.some((part) => part.x === candidate.x && part.y === candidate.y)) {
      return candidate;
    }
  }
};

const resetSnake = () => {
  snake = [
    { x: 8, y: 9 },
    { x: 7, y: 9 },
    { x: 6, y: 9 }
  ];
  direction = 'right';
  nextDirection = 'right';
  snakeScore = 0;
  snakeScoreEl.textContent = '0';
  food = spawnFood();
};

const drawSnakeScene = () => {
  snakeCtx.fillStyle = '#0a122f';
  snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

  snakeCtx.fillStyle = '#1e2d69';
  for (let x = 0; x < COLS; x += 1) {
    for (let y = 0; y < ROWS; y += 1) {
      if ((x + y) % 2 === 0) {
        snakeCtx.fillRect(x * GRID, y * GRID, GRID, GRID);
      }
    }
  }

  snakeCtx.fillStyle = '#ef4444';
  snakeCtx.beginPath();
  snakeCtx.arc(food.x * GRID + GRID / 2, food.y * GRID + GRID / 2, GRID / 2.7, 0, Math.PI * 2);
  snakeCtx.fill();

  snake.forEach((part, idx) => {
    snakeCtx.fillStyle = idx === 0 ? '#f8fafc' : '#22c55e';
    snakeCtx.fillRect(part.x * GRID + 1, part.y * GRID + 1, GRID - 2, GRID - 2);
  });
};

const setDirection = (dir) => {
  if (!snakeRunning) return;
  const opposite = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  };
  if (opposite[direction] !== dir) {
    nextDirection = dir;
  }
};

const stopSnake = () => {
  snakeRunning = false;
  clearInterval(snakeLoop);
  snakeStartBtn.textContent = 'Rejouer Snake';
  const best = getSnakeBest();
  if (snakeScore > best) {
    setSnakeBest(snakeScore);
    snakeBestEl.textContent = String(snakeScore);
  }
};

const tickSnake = () => {
  direction = nextDirection;
  const head = { ...snake[0] };
  if (direction === 'up') head.y -= 1;
  if (direction === 'down') head.y += 1;
  if (direction === 'left') head.x -= 1;
  if (direction === 'right') head.x += 1;

  const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
  if (hitWall || hitSelf) {
    stopSnake();
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    snakeScore += 1;
    snakeScoreEl.textContent = String(snakeScore);
    food = spawnFood();
  } else {
    snake.pop();
  }
  drawSnakeScene();
};

snakeDirBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!secretOpen || modalOpen) return;
    setDirection(btn.dataset.dir);
  });
});

snakeStartBtn.addEventListener('click', () => {
  if (!secretOpen || modalOpen) return;
  setActiveGame('snake');
  showWorkspace();
  resetSnake();
  drawSnakeScene();
  clearInterval(snakeLoop);
  snakeRunning = true;
  snakeStartBtn.textContent = 'En cours...';
  snakeLoop = setInterval(tickSnake, 120);
});

document.addEventListener('keydown', (event) => {
  if (!secretOpen || modalOpen) return;

  if (event.key === ' ') {
    if (spaceArmed || spaceState) {
      event.preventDefault();
      startSpaceIfNeeded();
      if (spaceState) {
        spaceState.presses += 1;
        spacePressesEl.textContent = String(spaceState.presses);
        spaceRateEl.textContent = (spaceState.presses / Math.max(spaceState.elapsed, 0.1)).toFixed(2);
      }
    }
  }

  const keyMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right'
  };
  const mapped = keyMap[event.key];
  if (mapped) {
    event.preventDefault();
    setDirection(mapped);
  }
});

const resetMode = (mode) => {
  if (mode === 'cps') resetCps();
  if (mode === 'space') resetSpace();
};

durationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!secretOpen || modalOpen) return;
    const mode = button.dataset.mode;
    durations[mode] = Number(button.dataset.duration);
    durationButtons
      .filter((candidate) => candidate.dataset.mode === mode)
      .forEach((candidate) => candidate.classList.toggle('active', candidate === button));
    resetMode(mode);
  });
});

playButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!secretOpen || modalOpen) return;
    setActiveGame(button.dataset.play);
    showWorkspace();
  });
});

backToCatalogBtn.addEventListener('click', () => {
  if (!secretOpen || modalOpen) return;
  showCatalog();
});

modalReplay.addEventListener('click', () => {
  if (!lastResult) return closeResultModal();
  closeResultModal();
  setActiveGame(lastResult.mode);
  showWorkspace();
  resetMode(lastResult.mode);
  if (lastResult.mode === 'space') {
    spaceArmed = true;
    spaceFocusBtn.textContent = 'Mode actif : appuie sur Espace';
  }
});

modalChangeMode.addEventListener('click', () => {
  if (!lastResult) return closeResultModal();
  closeResultModal();
  setActiveGame(lastResult.mode);
  showWorkspace();
  resetMode(lastResult.mode);
});

modalBackMenu.addEventListener('click', () => {
  closeResultModal();
  showCatalog();
  resetCps();
  resetSpace();
  resetRps();
  resetTtt();
});

window.openSecretGame = () => {
  secretOpen = true;
  secretZone.classList.remove('hidden');
  calculator.classList.add('hidden');
  snakeBestEl.textContent = String(getSnakeBest());
  setActiveGame('cps');
  showCatalog();
  closeResultModal();
  resetCps();
  resetSpace();
  resetRps();
  resetTtt();
  resetSnake();
  drawSnakeScene();
};

const closeSecretGame = () => {
  secretOpen = false;
  closeResultModal();
  clearInterval(cpsTimer);
  clearInterval(spaceTimer);
  clearInterval(snakeLoop);
  snakeRunning = false;
  cpsState = null;
  spaceState = null;
  spaceArmed = false;
  secretZone.classList.add('hidden');
  calculator.classList.remove('hidden');
};

closeSecretBtn.addEventListener('click', closeSecretGame);
snakeBestEl.textContent = String(getSnakeBest());
resetCps();
resetSpace();
resetRps();
resetTtt();
resetSnake();
drawSnakeScene();
