const arena = document.getElementById('arena');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const bestEl = document.getElementById('best');
const startBtn = document.getElementById('start');
const closeSecretBtn = document.getElementById('close-secret');
const secretZone = document.getElementById('secret-zone');
const calculator = document.getElementById('calculator');

let score = 0;
let timeLeft = 20;
let running = false;
let timerId;

const getBestScore = () => Number(localStorage.getItem('secret_best_score') || 0);
const setBestScore = (value) => localStorage.setItem('secret_best_score', String(value));

const spawnTarget = () => {
  arena.innerHTML = '';
  const target = document.createElement('button');
  target.className = 'target';
  target.type = 'button';
  target.setAttribute('aria-label', 'Cible');

  const margin = 35;
  const x = Math.random() * (arena.clientWidth - margin * 2) + margin;
  const y = Math.random() * (arena.clientHeight - margin * 2) + margin;

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.addEventListener('click', () => {
    if (!running) {
      return;
    }

    score += 1;
    scoreEl.textContent = String(score);
    spawnTarget();
  });

  arena.appendChild(target);
};

const stopGame = () => {
  running = false;
  clearInterval(timerId);
  arena.innerHTML = '';
  startBtn.disabled = false;
  startBtn.textContent = 'Rejouer';

  const best = getBestScore();
  if (score > best) {
    setBestScore(score);
    bestEl.textContent = String(score);
  }
};

const startGame = () => {
  score = 0;
  timeLeft = 20;
  running = true;
  scoreEl.textContent = '0';
  timeEl.textContent = '20';
  bestEl.textContent = String(getBestScore());
  startBtn.disabled = true;
  startBtn.textContent = 'En cours...';

  spawnTarget();

  timerId = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = String(timeLeft);

    if (timeLeft <= 0) {
      stopGame();
    }
  }, 1000);
};

window.openSecretGame = () => {
  secretZone.classList.remove('hidden');
  calculator.classList.add('hidden');
  bestEl.textContent = String(getBestScore());
};

const closeSecretGame = () => {
  if (running) {
    stopGame();
  }
  secretZone.classList.add('hidden');
  calculator.classList.remove('hidden');
};

bestEl.textContent = String(getBestScore());
startBtn.addEventListener('click', startGame);
closeSecretBtn.addEventListener('click', closeSecretGame);
