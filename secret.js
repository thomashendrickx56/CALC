const secretZone = document.getElementById('secret-zone');
const calculator = document.getElementById('calculator');
const closeSecretBtn = document.getElementById('close-secret');

const tabs = Array.from(document.querySelectorAll('.game-tab'));
const panels = {
  cps: document.getElementById('game-cps'),
  space: document.getElementById('game-space'),
  flappy: document.getElementById('game-flappy')
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

const setActiveGame = (game) => {
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.game === game));
  Object.entries(panels).forEach(([key, panel]) => {
    panel.classList.toggle('hidden', key !== game);
  });
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

durationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!secretOpen || modalOpen) {
      return;
    }

    const mode = button.dataset.mode;
    const value = Number(button.dataset.duration);
    durations[mode] = value;

    durationButtons
      .filter((candidate) => candidate.dataset.mode === mode)
      .forEach((candidate) => candidate.classList.toggle('active', candidate === button));

    resetMode(mode);
  });
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    if (!secretOpen || modalOpen) {
      return;
    }
    setActiveGame(tab.dataset.game);
  });
});

// CPS game
const cpsArea = document.getElementById('cps-area');
const cpsClicksEl = document.getElementById('cps-clicks');
const cpsRateEl = document.getElementById('cps-rate');
const cpsTimeEl = document.getElementById('cps-time');
const cpsFinalEl = document.getElementById('cps-final');

let cpsTimer = null;
let cpsState = null;

const resetCps = () => {
  clearInterval(cpsTimer);
  cpsTimer = null;
  cpsState = null;
  cpsClicksEl.textContent = '0';
  cpsRateEl.textContent = '0.00';
  cpsTimeEl.textContent = Number(durations.cps).toFixed(1);
  cpsFinalEl.textContent = 'Prêt.';
};

const startCpsIfNeeded = () => {
  if (cpsState || modalOpen) {
    return;
  }

  cpsState = {
    clicks: 0,
    remaining: durations.cps,
    elapsed: 0
  };

  cpsFinalEl.textContent = 'GO !';
  cpsTimeEl.textContent = cpsState.remaining.toFixed(1);

  cpsTimer = setInterval(() => {
    if (!cpsState) {
      clearInterval(cpsTimer);
      cpsTimer = null;
      return;
    }

    cpsState.elapsed += 0.1;
    cpsState.remaining = Math.max(0, durations.cps - cpsState.elapsed);
    cpsTimeEl.textContent = cpsState.remaining.toFixed(1);

    if (cpsState.remaining <= 0) {
      clearInterval(cpsTimer);
      cpsTimer = null;
      const actions = cpsState.clicks;
      const score = actions / durations.cps;
      cpsFinalEl.textContent = `Terminé : ${actions} clics • CPS ${score.toFixed(2)}`;
      cpsState = null;
      openResultModal({ mode: 'cps', duration: durations.cps, actions, score });
    }
  }, 100);
};

cpsArea.addEventListener('click', () => {
  if (!secretOpen || modalOpen) {
    return;
  }

  startCpsIfNeeded();

  if (!cpsState) {
    return;
  }

  cpsState.clicks += 1;
  cpsClicksEl.textContent = String(cpsState.clicks);
  const denom = Math.max(cpsState.elapsed, 0.1);
  cpsRateEl.textContent = (cpsState.clicks / denom).toFixed(2);
});

// Space speed game
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
  spaceTimer = null;
  spaceState = null;
  spaceArmed = false;
  spacePressesEl.textContent = '0';
  spaceRateEl.textContent = '0.00';
  spaceTimeEl.textContent = Number(durations.space).toFixed(1);
  spaceFinalEl.textContent = 'Prêt.';
  spaceFocusBtn.textContent = 'Activer le mode espace';
};

spaceFocusBtn.addEventListener('click', () => {
  if (!secretOpen || modalOpen) {
    return;
  }

  spaceArmed = true;
  spaceFocusBtn.textContent = 'Mode actif : appuie sur Espace';
});

const startSpaceIfNeeded = () => {
  if (spaceState || modalOpen) {
    return;
  }

  spaceState = {
    presses: 0,
    remaining: durations.space,
    elapsed: 0
  };

  spaceFinalEl.textContent = 'GO !';
  spaceTimeEl.textContent = spaceState.remaining.toFixed(1);

  spaceTimer = setInterval(() => {
    if (!spaceState) {
      clearInterval(spaceTimer);
      spaceTimer = null;
      return;
    }

    spaceState.elapsed += 0.1;
    spaceState.remaining = Math.max(0, durations.space - spaceState.elapsed);
    spaceTimeEl.textContent = spaceState.remaining.toFixed(1);

    if (spaceState.remaining <= 0) {
      clearInterval(spaceTimer);
      spaceTimer = null;
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

// Flappy simplified
const canvas = document.getElementById('flappy-canvas');
const ctx = canvas.getContext('2d');
const flappyStartBtn = document.getElementById('flappy-start');
const flappyScoreEl = document.getElementById('flappy-score');
const flappyBestEl = document.getElementById('flappy-best');

let flappyRunning = false;
let flappyAnimation = null;
let bird;
let pipes;
let flappyScore;

const getFlappyBest = () => Number(localStorage.getItem('secret_flappy_best') || 0);
const setFlappyBest = (value) => localStorage.setItem('secret_flappy_best', String(value));

const resetFlappyState = () => {
  bird = { x: 110, y: 160, vy: 0, r: 12 };
  pipes = [];
  flappyScore = 0;
  flappyScoreEl.textContent = '0';
};

const spawnPipe = () => {
  const gap = 95;
  const topHeight = 40 + Math.random() * 160;
  pipes.push({ x: canvas.width + 20, top: topHeight, bottom: topHeight + gap, passed: false });
};

const drawFlappy = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#091026';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#5be27a';
  pipes.forEach((pipe) => {
    ctx.fillRect(pipe.x, 0, 45, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, 45, canvas.height - pipe.bottom);
  });

  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
  ctx.fill();
};

const stopFlappy = () => {
  flappyRunning = false;
  if (flappyAnimation) {
    cancelAnimationFrame(flappyAnimation);
    flappyAnimation = null;
  }
  const best = getFlappyBest();
  if (flappyScore > best) {
    setFlappyBest(flappyScore);
    flappyBestEl.textContent = String(flappyScore);
  }
  flappyStartBtn.textContent = 'Rejouer Flappy';
};

const flappyLoop = () => {
  if (!flappyRunning) {
    return;
  }

  bird.vy += 0.35;
  bird.y += bird.vy;

  if (Math.random() < 0.018) {
    spawnPipe();
  }

  pipes.forEach((pipe) => {
    pipe.x -= 2.6;
    if (!pipe.passed && pipe.x + 45 < bird.x) {
      pipe.passed = true;
      flappyScore += 1;
      flappyScoreEl.textContent = String(flappyScore);
    }

    const hitX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + 45;
    const hitY = bird.y - bird.r < pipe.top || bird.y + bird.r > pipe.bottom;
    if (hitX && hitY) {
      stopFlappy();
    }
  });

  pipes = pipes.filter((pipe) => pipe.x > -60);

  if (bird.y + bird.r >= canvas.height || bird.y - bird.r <= 0) {
    stopFlappy();
  }

  drawFlappy();
  flappyAnimation = requestAnimationFrame(flappyLoop);
};

const flap = () => {
  if (!flappyRunning || !secretOpen || modalOpen) {
    return;
  }
  bird.vy = -5.7;
};

flappyStartBtn.addEventListener('click', () => {
  if (!secretOpen || modalOpen) {
    return;
  }
  resetFlappyState();
  flappyRunning = true;
  flappyStartBtn.textContent = 'En cours...';
  drawFlappy();
  flappyLoop();
});

canvas.addEventListener('click', flap);

document.addEventListener('keydown', (event) => {
  if (!secretOpen || modalOpen) {
    return;
  }

  if (event.key === ' ') {
    if (spaceArmed || spaceState) {
      event.preventDefault();
      startSpaceIfNeeded();
      if (spaceState) {
        spaceState.presses += 1;
        spacePressesEl.textContent = String(spaceState.presses);
        const denom = Math.max(spaceState.elapsed, 0.1);
        spaceRateEl.textContent = (spaceState.presses / denom).toFixed(2);
      }
    }

    flap();
  }
});

const resetMode = (mode) => {
  if (mode === 'cps') {
    resetCps();
  }
  if (mode === 'space') {
    resetSpace();
  }
};

modalReplay.addEventListener('click', () => {
  if (!lastResult) {
    closeResultModal();
    return;
  }

  closeResultModal();
  setActiveGame(lastResult.mode);
  resetMode(lastResult.mode);

  if (lastResult.mode === 'space') {
    spaceArmed = true;
    spaceFocusBtn.textContent = 'Mode actif : appuie sur Espace';
  }
});

modalChangeMode.addEventListener('click', () => {
  if (!lastResult) {
    closeResultModal();
    return;
  }

  closeResultModal();
  setActiveGame(lastResult.mode);
  resetMode(lastResult.mode);
});

modalBackMenu.addEventListener('click', () => {
  closeResultModal();
  setActiveGame('cps');
  resetCps();
  resetSpace();
});

window.openSecretGame = () => {
  secretOpen = true;
  secretZone.classList.remove('hidden');
  calculator.classList.add('hidden');
  flappyBestEl.textContent = String(getFlappyBest());
  setActiveGame('cps');
  closeResultModal();
  resetCps();
  resetSpace();
  resetFlappyState();
  drawFlappy();
};

const closeSecretGame = () => {
  secretOpen = false;
  closeResultModal();
  clearInterval(cpsTimer);
  clearInterval(spaceTimer);
  cpsState = null;
  spaceState = null;
  spaceArmed = false;
  stopFlappy();
  secretZone.classList.add('hidden');
  calculator.classList.remove('hidden');
};

closeSecretBtn.addEventListener('click', closeSecretGame);
flappyBestEl.textContent = String(getFlappyBest());
resetCps();
resetSpace();
resetFlappyState();
drawFlappy();
