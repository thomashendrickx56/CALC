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
  tictactoe: document.getElementById('game-tictactoe'),
  chess: document.getElementById('game-chess')
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



// CHESS
const initChess = () => {
  const root = document.getElementById('chess-root');
  if (!root || root.dataset.initialized === '1') return;
  root.dataset.initialized = '1';

  const PIECES = {
    K: { w: '♔', b: '♚' },
    Q: { w: '♕', b: '♛' },
    R: { w: '♖', b: '♜' },
    B: { w: '♗', b: '♝' },
    N: { w: '♘', b: '♞' },
    P: { w: '♙', b: '♟' }
  };
  const PIECE_VALUES = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };

  let board = [];
  let turn = 'w';
  let selected = null;
  let validMoves = [];
  let mode = 'friend';
  let kingMoved = { w: false, b: false };
  let rookMoved = { w: [false, false], b: [false, false] };
  let lastMove = null;
  let lastMoveFrom = null;
  let pendingPromotion = null;
  let gameOver = false;

  const boardEl = document.getElementById('chess-board');
  const modeScreen = document.getElementById('chess-mode-screen');
  const gameScreen = document.getElementById('chess-game-screen');
  const turnLabel = document.getElementById('chess-turn-label');
  const modeBadge = document.getElementById('chess-mode-badge');
  const promotionOverlay = document.getElementById('chess-promotion-overlay');
  const promotionPiecesEl = document.getElementById('chess-promotion-pieces');
  const gameOverOverlay = document.getElementById('chess-game-over-overlay');
  const gameOverTitle = document.getElementById('chess-game-over-title');
  const gameOverMessage = document.getElementById('chess-game-over-message');

  const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const getPiece = (r, c) => (inBounds(r, c) ? board[r][c] : null);

  function initBoard() {
    board = [
      [
        { type: 'R', color: 'b' }, { type: 'N', color: 'b' }, { type: 'B', color: 'b' }, { type: 'Q', color: 'b' },
        { type: 'K', color: 'b' }, { type: 'B', color: 'b' }, { type: 'N', color: 'b' }, { type: 'R', color: 'b' }
      ],
      Array(8).fill(null).map(() => ({ type: 'P', color: 'b' })),
      ...Array(4).fill(null).map(() => Array(8).fill(null)),
      Array(8).fill(null).map(() => ({ type: 'P', color: 'w' })),
      [
        { type: 'R', color: 'w' }, { type: 'N', color: 'w' }, { type: 'B', color: 'w' }, { type: 'Q', color: 'w' },
        { type: 'K', color: 'w' }, { type: 'B', color: 'w' }, { type: 'N', color: 'w' }, { type: 'R', color: 'w' }
      ]
    ];
    turn = 'w'; selected = null; validMoves = []; kingMoved = { w: false, b: false }; rookMoved = { w: [false, false], b: [false, false] };
    lastMove = null; lastMoveFrom = null; pendingPromotion = null; gameOver = false;
  }

  function getKingPos(color) {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const p = getPiece(r, c); if (p && p.type === 'K' && p.color === color) return [r, c];
    }
    return null;
  }

  function getRawMoves(r, c, forAttackOnly) {
    const piece = getPiece(r, c); if (!piece) return [];
    const { type, color } = piece; const moves = [];
    const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    const knightDirs = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

    const add = (r1,c1) => { if (!inBounds(r1,c1)) return; const t = getPiece(r1,c1); if (!t || t.color !== color) moves.push([r1,c1]); };
    const slide = (dr,dc) => { let r1=r+dr,c1=c+dc; while(inBounds(r1,c1)){ const t=getPiece(r1,c1); if(!t){ moves.push([r1,c1]); r1+=dr; c1+=dc; continue;} if(t.color!==color)moves.push([r1,c1]); break; } };

    if (type === 'R') { slide(-1,0); slide(1,0); slide(0,-1); slide(0,1); }
    else if (type === 'B') { slide(-1,-1); slide(-1,1); slide(1,-1); slide(1,1); }
    else if (type === 'Q') { dirs.forEach(([dr,dc]) => slide(dr,dc)); }
    else if (type === 'N') { knightDirs.forEach(([dr,dc]) => add(r+dr,c+dc)); }
    else if (type === 'K') {
      dirs.forEach(([dr,dc]) => add(r+dr,c+dc));
    } else if (type === 'P') {
      const forward = color === 'w' ? -1 : 1; const startRow = color === 'w' ? 6 : 1;
      if (!forAttackOnly) {
        if (!getPiece(r + forward, c)) {
          moves.push([r + forward, c]);
          if (r === startRow && !getPiece(r + 2 * forward, c)) moves.push([r + 2 * forward, c]);
        }
      }
      [[r + forward, c - 1], [r + forward, c + 1]].forEach(([r1, c1]) => {
        if (!inBounds(r1, c1)) return;
        const target = getPiece(r1, c1);
        if (target && target.color !== color) moves.push([r1, c1]);
      });
    }
    return moves;
  }

  const isSquareAttacked = (r,c,byColor)=>{
    for (let ri=0;ri<8;ri++) for (let ci=0;ci<8;ci++) {
      const p=getPiece(ri,ci); if(!p||p.color!==byColor) continue;
      if(getRawMoves(ri,ci,true).some((m)=>m[0]===r&&m[1]===c)) return true;
    }
    return false;
  };

  function getLegalMoves(r,c){
    const piece=getPiece(r,c); if(!piece||piece.color!==turn) return [];
    const raw=getRawMoves(r,c,false); const legal=[]; const kp=getKingPos(turn);
    for(const [toR,toC] of raw){
      const captured=board[toR][toC]; const fromPiece=board[r][c]; board[toR][toC]=fromPiece; board[r][c]=null;
      const kingR = piece.type==='K'?toR:kp[0]; const kingC = piece.type==='K'?toC:kp[1];
      const inCheck=isSquareAttacked(kingR,kingC,turn==='w'?'b':'w');
      board[r][c]=fromPiece; board[toR][toC]=captured;
      if(!inCheck) legal.push([toR,toC]);
    }
    return legal;
  }

  function getAllMoves(color){
    const moves=[];
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const p=getPiece(r,c); if(p&&p.color===color) getLegalMoves(r,c).forEach(([tr,tc])=>moves.push({from:[r,c],to:[tr,tc]})); }
    return moves;
  }

  const isCheck=(color)=>{ const k=getKingPos(color); return k&&isSquareAttacked(k[0],k[1],color==='w'?'b':'w'); };
  const isCheckmate=(color)=>isCheck(color)&&getAllMoves(color).length===0;
  const isStalemate=(color)=>!isCheck(color)&&getAllMoves(color).length===0;

  function makeMove(fromR,fromC,toR,toC,promotionType){
    const piece=board[fromR][fromC]; if(!piece) return false;
    const legal=getLegalMoves(fromR,fromC); if(!legal.some(([r,c])=>r===toR&&c===toC)) return false;
    lastMoveFrom=[fromR,fromC]; lastMove={piece:piece.type,fromR,fromC,toR,toC};
    let promo=promotionType; if(piece.type==='P'&&(toR===0||toR===7)) promo=promo||'Q';
    board[toR][toC]=promo?{type:promo,color:piece.color}:piece; board[fromR][fromC]=null; turn=turn==='w'?'b':'w';
    return true;
  }

  function evaluate(){
    let score=0;
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const p=getPiece(r,c); if(!p) continue; score += p.color==='w'?PIECE_VALUES[p.type]:-PIECE_VALUES[p.type]; }
    return score;
  }

  function cloneBoard(){ return board.map((row)=>row.map((cell)=>(cell?{...cell}:null))); }
  function restoreBoard(b,t,lm){ board=b.map((row)=>row.map((cell)=>(cell?{...cell}:null))); turn=t; lastMove=lm?{...lm}:null; }

  function minimax(depth, alpha, beta, isMax){
    if(depth===0) return evaluate();
    const color=isMax?'b':'w'; const moves=getAllMoves(color);
    if(!moves.length){ if(isCheck(color)) return isMax?-10000:10000; return 0; }
    const b0=cloneBoard(); const t0=turn; const lm0=lastMove?{...lastMove}:null;
    if(isMax){
      let best=-Infinity;
      for(const m of moves){ makeMove(m.from[0],m.from[1],m.to[0],m.to[1]); const v=minimax(depth-1,alpha,beta,false); restoreBoard(b0,t0,lm0); best=Math.max(best,v); alpha=Math.max(alpha,v); if(beta<=alpha) break; }
      return best;
    }
    let best=Infinity;
    for(const m of moves){ makeMove(m.from[0],m.from[1],m.to[0],m.to[1]); const v=minimax(depth-1,alpha,beta,true); restoreBoard(b0,t0,lm0); best=Math.min(best,v); beta=Math.min(beta,v); if(beta<=alpha) break; }
    return best;
  }

  function getBestMove(depth){
    const moves=getAllMoves('b'); if(!moves.length) return null;
    const b0=cloneBoard(); const t0=turn; const lm0=lastMove?{...lastMove}:null;
    let bestScore=-Infinity,bestMove=moves[0];
    for(const m of moves){ makeMove(m.from[0],m.from[1],m.to[0],m.to[1]); const sc=-minimax(depth-1,-Infinity,Infinity,false); restoreBoard(b0,t0,lm0); if(sc>bestScore){bestScore=sc;bestMove=m;} }
    return bestMove;
  }

  function render(){
    boardEl.innerHTML='';
    const kingPos=getKingPos(turn);
    const inCheckKing=kingPos&&isSquareAttacked(kingPos[0],kingPos[1],turn==='w'?'b':'w');
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
      const sq=document.createElement('div'); sq.className='chess-square'; sq.classList.add((r+c)%2===0?'light':'dark'); sq.dataset.row=r; sq.dataset.col=c;
      const piece=getPiece(r,c); if(piece){ sq.textContent=PIECES[piece.type][piece.color]; sq.classList.add(piece.color==='w'?'white':'black'); }
      if(selected&&selected[0]===r&&selected[1]===c) sq.classList.add('highlight');
      if(validMoves.some(([a,b])=>a===r&&b===c)) sq.classList.add('move-target');
      if(kingPos&&r===kingPos[0]&&c===kingPos[1]&&inCheckKing) sq.classList.add('check');
      if((lastMoveFrom&&r===lastMoveFrom[0]&&c===lastMoveFrom[1])||(lastMove&&r===lastMove.toR&&c===lastMove.toC)) sq.classList.add('last-move');
      boardEl.appendChild(sq);
    }
  }

  function updateTurnLabel(){ if(gameOver) return; turnLabel.textContent = turn==='w'?'White to move':'Black to move'; }

  function showPromotion(fromR,fromC,toR,toC){
    pendingPromotion={fromR,fromC,toR,toC}; promotionOverlay.classList.remove('hidden');
    const color=board[fromR][fromC].color; const options=['Q','R','B','N']; promotionPiecesEl.innerHTML='';
    options.forEach((type)=>{
      const btn=document.createElement('button'); btn.type='button'; btn.className='chess-promotion-piece-btn'; btn.textContent=PIECES[type][color];
      btn.addEventListener('click',()=>{ makeMove(fromR,fromC,toR,toC,type); promotionOverlay.classList.add('hidden'); pendingPromotion=null; render(); updateTurnLabel(); afterMove(); });
      promotionPiecesEl.appendChild(btn);
    });
  }

  function afterMove(){
    if(isCheckmate('w')){ gameOver=true; gameOverTitle.textContent='Checkmate!'; gameOverMessage.textContent='Black wins.'; gameOverOverlay.classList.remove('hidden'); return; }
    if(isCheckmate('b')){ gameOver=true; gameOverTitle.textContent='Checkmate!'; gameOverMessage.textContent='White wins.'; gameOverOverlay.classList.remove('hidden'); return; }
    if(isStalemate(turn)){ gameOver=true; gameOverTitle.textContent='Stalemate'; gameOverMessage.textContent='Draw.'; gameOverOverlay.classList.remove('hidden'); return; }
    if(isCheck(turn)) turnLabel.textContent = `${turn === 'w' ? 'White' : 'Black'} is in check!`;

    if(mode==='ai'&&turn==='b'){
      setTimeout(()=>{
        const move=getBestMove(2);
        if(move){
          const piece=board[move.from[0]][move.from[1]];
          const isPromo=piece.type==='P'&&(move.to[0]===0||move.to[0]===7);
          makeMove(move.from[0],move.from[1],move.to[0],move.to[1],isPromo?'Q':undefined);
          render(); updateTurnLabel(); afterMove();
        }
      },300);
    }
  }

  function onSquareClick(r,c){
    if(gameOver||pendingPromotion) return;
    if(mode==='ai'&&turn==='b') return;
    const piece=getPiece(r,c);
    if(selected){
      const [sr,sc]=selected;
      if(validMoves.some(([tr,tc])=>tr===r&&tc===c)){
        const movingPiece=board[sr][sc];
        const isPromo=movingPiece.type==='P'&&(r===0||r===7);
        if(isPromo){ showPromotion(sr,sc,r,c); return; }
        makeMove(sr,sc,r,c); selected=null; validMoves=[]; render(); updateTurnLabel(); afterMove(); return;
      }
      selected=null; validMoves=[];
    }
    if(piece&&piece.color===turn){ selected=[r,c]; validMoves=getLegalMoves(r,c); }
    render();
  }

  boardEl.addEventListener('click',(e)=>{
    const sq=e.target.closest('.chess-square'); if(!sq) return;
    onSquareClick(parseInt(sq.dataset.row,10), parseInt(sq.dataset.col,10));
  });

  const showGame=(m)=>{ mode=m; modeScreen.classList.add('hidden'); gameScreen.classList.remove('hidden'); modeBadge.textContent=m==='ai'?'Vs AI':'Vs Friend'; initBoard(); render(); updateTurnLabel(); };

  document.getElementById('chess-vs-friend-btn').addEventListener('click',()=>showGame('friend'));
  document.getElementById('chess-vs-ai-btn').addEventListener('click',()=>showGame('ai'));

  document.getElementById('chess-new-game-btn').addEventListener('click',()=>{ initBoard(); render(); updateTurnLabel(); gameOverOverlay.classList.add('hidden'); });
  document.getElementById('chess-change-mode-btn').addEventListener('click',()=>{ modeScreen.classList.remove('hidden'); gameScreen.classList.add('hidden'); gameOverOverlay.classList.add('hidden'); });
  document.getElementById('chess-play-again-btn').addEventListener('click',()=>{ modeScreen.classList.remove('hidden'); gameScreen.classList.add('hidden'); gameOverOverlay.classList.add('hidden'); });

  initBoard();
  render();
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
  initChess();
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

initChess();
