const CV = document.getElementById('c');
const ctx = CV.getContext('2d');
ctx.scale(2, 2); // 2× resolution: 640×400 canvas, 320×200 logical coordinates
ctx.imageSmoothingEnabled = false; // crisp pixel scaling for images

const C = CONFIG.colors;
const DEBUG = new URLSearchParams(location.search).get('debug') === '1';

// Optional hand-drawn background (640×400). Loaded async; falls back to drawBg() code.
let bgImage = null;
(function() {
  if (!CONFIG.images.background) return;
  var img = new Image();
  img.onload = function() { bgImage = img; };
  img.src = CONFIG.images.background;
})();

// Audio manager — silent fallback when files are missing
const GameAudio = (function() {
  var bgMusic = null;

  function playMusic() {
    if (!CONFIG.audio.music) return;
    if (!bgMusic) {
      bgMusic = new Audio(CONFIG.audio.music);
      bgMusic.loop = true;
      bgMusic.volume = CONFIG.audio.musicVolume;
    }
    bgMusic.currentTime = 0;
    bgMusic.play().catch(function() {});
  }

  function stopMusic() {
    if (bgMusic) { bgMusic.pause(); bgMusic.currentTime = 0; }
  }

  function playSfx(name) {
    var src = CONFIG.audio.sfx[name];
    if (!src) return;
    var s = new Audio(src);
    s.volume = CONFIG.audio.sfxVolume;
    s.play().catch(function() {});
  }

  return { playMusic: playMusic, stopMusic: stopMusic, playSfx: playSfx };
})();

const floors = [
  {x:0, y:GY, w:320},
  {x:0, y:MY, w:320},
  {x:0, y:TY, w:320},
];

const stairs = [
  {x1:80,  y1:GY,  x2:30,  y2:MY},  // left-going
  {x1:240, y1:GY,  x2:290, y2:MY},  // right-going
  {x1:60,  y1:MY,  x2:110, y2:TY},  // right-going
  {x1:210, y1:MY,  x2:260, y2:TY},  // right-going
];

const BOARDS_DEF = [
  {x:14,  y:TY-34},
  {x:142, y:TY-34},
  {x:274, y:TY-34},
  {x:14,  y:MY-34},
  {x:142, y:MY-34},
  {x:274, y:MY-34},
];

const DESKS = [
  // GY: stair1 x=30-80, stair2 x=240-290 → safe zone x≈90-230
  {x:92,  y:GY-12}, {x:116, y:GY-12}, {x:140, y:GY-12},
  {x:168, y:GY-12}, {x:192, y:GY-12}, {x:216, y:GY-12},
  // MY: stair1top x=30, stair3bottom x=60-110, stair4bottom x=210-260 → safe zone x=120-188
  {x:120, y:MY-12}, {x:144, y:MY-12},
  {x:164, y:MY-12}, {x:184, y:MY-12},
  // TY: stair3top x=110, stair4top x=260 → left x<100, right x=120-248
  {x:52,  y:TY-12}, {x:76,  y:TY-12},
  {x:168, y:TY-12}, {x:196, y:TY-12},
];

const BAGS_DEF = [
  {x:130, y:GY-10},  // GY - safe zone
  {x:184, y:MY-10},  // MY - moved from 228 (stair4 x=210-265)
  {x:136, y:TY-10},  // TY - moved from 108 (near stair3top x=110)
];

const TEACHERS_DEF = [
  {x:200, y:GY-PH, dir:1,  minX:10, maxX:305, speed:0.55, color:C.red,   name:'Prof.Rossi', sight:90 },
  {x:80,  y:MY-PH, dir:-1, minX:10, maxX:305, speed:0.50, color:C.green, name:'Prof.Verdi', sight:80 },
  {x:230, y:TY-PH, dir:1,  minX:10, maxX:275, speed:0.60, color:C.mgray, name:'Prof.Neri',  sight:100},
];

const JANITORS_DEF = [
  {x:160, y:GY-PH, dir:1,  minX:128, maxX:192, speed:0.65, name:'Bidello'},
  {x:140, y:MY-PH, dir:-1, minX:120, maxX:164, speed:0.55, name:'Bidello'},
];

// Mutable level state — reset by resetLevel()
let BOARDS, bags, BELL, teachers, janitors;
let lives, score, state, frame;
let particles, floatingTexts;
let msgText, msgT;
let actionPressed, allBoards, timerTicks;

const player = {
  x:0, y:0, vy:0,
  dir:1, animT:0,
  onGround:false, onLadder:false,
  onStair:false, currentStair:null,
  stunT:0, spraying:false, sprayT:0,
  speed:1.5,
};

function resetLevel() {
  BOARDS   = BOARDS_DEF.map(function(b) { return {x:b.x, y:b.y, done:false}; });
  bags     = BAGS_DEF.map(function(b)   { return {x:b.x, y:b.y, collected:false}; });
  BELL     = {x:304, y:TY-32, ringing:false, done:false, ringT:0};
  teachers = TEACHERS_DEF.map(function(t) {
    return {x:t.x, y:t.y, dir:t.dir, minX:t.minX, maxX:t.maxX,
            speed:t.speed, animT:0, color:t.color, name:t.name,
            sight:t.sight, alertT:0, chasing:false, chaseX:0};
  });
  janitors = JANITORS_DEF.map(function(j) {
    return {x:j.x, y:j.y, dir:j.dir, minX:j.minX, maxX:j.maxX, speed:j.speed, animT:0, name:j.name};
  });
  player.x = 40; player.y = GY - PH; player.vy = 0;
  player.dir = 1; player.animT = 0;
  player.onGround = false; player.onLadder = false;
  player.onStair = false; player.currentStair = null;
  player.stunT = 0; player.spraying = false; player.sprayT = 0;
  particles = []; floatingTexts = [];
  msgText = ''; msgT = 0;
  actionPressed = false; allBoards = false;
  timerTicks = CONFIG.levelTimer * 60;
  frame = 0;
}

// Initialise
lives = 3; score = 0; state = 'title';
resetLevel();

function setMsg(t, d) { msgText = t; msgT = d || 220; }

// INPUT
const K = {left:false, right:false, up:false, down:false, action:false};

document.addEventListener('keydown', function(e) {
  if (e.code === 'ArrowLeft')  K.left = true;
  if (e.code === 'ArrowRight') K.right = true;
  if (e.code === 'ArrowUp')    K.up = true;
  if (e.code === 'ArrowDown')  K.down = true;
  if (e.code === 'KeyZ' || e.code === 'Space') { K.action = true; actionPressed = true; }
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].indexOf(e.code) >= 0) e.preventDefault();
});
document.addEventListener('keyup', function(e) {
  if (e.code === 'ArrowLeft')  K.left = false;
  if (e.code === 'ArrowRight') K.right = false;
  if (e.code === 'ArrowUp')    K.up = false;
  if (e.code === 'ArrowDown')  K.down = false;
  if (e.code === 'KeyZ' || e.code === 'Space') K.action = false;
});

function bindBtn(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  function on(e)  { e.preventDefault(); K[key] = true;  if (key === 'action') actionPressed = true; el.classList.add('pressed'); }
  function off(e) { e.preventDefault(); K[key] = false; el.classList.remove('pressed'); }
  el.addEventListener('touchstart',  on,  {passive:false});
  el.addEventListener('touchend',    off, {passive:false});
  el.addEventListener('touchcancel', off, {passive:false});
  el.addEventListener('mousedown',   on);
  el.addEventListener('mouseup',     off);
  el.addEventListener('mouseleave',  off);
}
bindBtn('bL','left'); bindBtn('bR','right');
bindBtn('bU','up');   bindBtn('bD','down');

const bA = document.getElementById('btn-action');
function onA(e)  { e.preventDefault(); K.action = true;  actionPressed = true; bA.classList.add('pressed'); }
function offA(e) { e.preventDefault(); K.action = false; bA.classList.remove('pressed'); }
bA.addEventListener('touchstart',  onA,  {passive:false});
bA.addEventListener('touchend',    offA, {passive:false});
bA.addEventListener('touchcancel', offA, {passive:false});
bA.addEventListener('mousedown',   onA);
bA.addEventListener('mouseup',     offA);
bA.addEventListener('mouseleave',  offA);

// JOYSTICK ANALOGICO
(function() {
  const zone = document.getElementById('ctrl-joy');
  const knob = document.getElementById('joy-knob');
  if (!zone || !knob) return;

  var active = false, cx = 0, cy = 0;
  var RADIUS = 33, DEAD = 10;

  function joyStart(e) {
    e.preventDefault();
    active = true;
    var r = zone.getBoundingClientRect();
    cx = r.left + r.width  / 2;
    cy = r.top  + r.height / 2;
    joyUpdate(e);
  }
  function joyMove(e) { if (active) { e.preventDefault(); joyUpdate(e); } }
  function joyEnd(e) {
    e.preventDefault();
    active = false;
    knob.style.transform = '';
    K.left = K.right = K.up = K.down = false;
  }
  function joyUpdate(e) {
    var t = e.touches ? e.touches[0] : e;
    var dx = t.clientX - cx;
    var dy = t.clientY - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var c = Math.min(dist, RADIUS) / (dist || 1);
    knob.style.transform = 'translate(' + (dx * c) + 'px,' + (dy * c) + 'px)';
    K.left  = dx < -DEAD;
    K.right = dx >  DEAD;
    K.up    = dy < -DEAD;
    K.down  = dy >  DEAD;
  }

  zone.addEventListener('touchstart',  joyStart, {passive:false});
  zone.addEventListener('touchmove',   joyMove,  {passive:false});
  zone.addEventListener('touchend',    joyEnd,   {passive:false});
  zone.addEventListener('touchcancel', joyEnd,   {passive:false});
  zone.addEventListener('mousedown',   joyStart);
  zone.addEventListener('mousemove',   joyMove);
  zone.addEventListener('mouseup',     joyEnd);
  zone.addEventListener('mouseleave',  joyEnd);
})();

document.getElementById('overlay').addEventListener('click', startGame);
document.getElementById('overlay').addEventListener('touchstart', function(e) { e.preventDefault(); startGame(); }, {passive:false});

function startGame() {
  document.getElementById('overlay').style.display = 'none';
  state = 'playing';
  if (!CONFIG.debug.disableMusic) GameAudio.playMusic();
}

// PHYSICS
function getFloorBelow(px, py) {
  const b = py + PH;
  for (let i = 0; i < floors.length; i++) {
    const f = floors[i];
    if (b >= f.y-1 && b <= f.y+6 && px+PW > f.x+2 && px < f.x+f.w-2) return f.y;
  }
  return null;
}

function getStairAt(px, py) {
  const cx = px + PW/2, cy = py + PH;
  for (let i = 0; i < stairs.length; i++) {
    const s = stairs[i];
    const minX = Math.min(s.x1,s.x2)-6, maxX = Math.max(s.x1,s.x2)+6;
    const minY = Math.min(s.y1,s.y2)-4, maxY = Math.max(s.y1,s.y2)+4;
    if (cx >= minX && cx <= maxX && cy >= minY && cy <= maxY) {
      let t = (cx - s.x1) / (s.x2 - s.x1);
      t = Math.max(0, Math.min(1, t));
      const expectedY = s.y1 + (s.y2 - s.y1) * t;
      if (Math.abs(cy - expectedY) < 14) return {stair:s, t:t};
    }
  }
  return null;
}

function clampX(x) { return Math.max(4, Math.min(W - PW - 4, x)); }

// UPDATE PLAYER
function updatePlayer() {
  if (state !== 'playing') return;
  if (player.stunT > 0) { player.stunT--; return; }
  if (player.spraying) { player.sprayT--; if (player.sprayT <= 0) player.spraying = false; return; }

  const stairResult = getStairAt(player.x, player.y);

  if (!player.onStair && stairResult) {
    const s0 = stairResult.stair, t0 = stairResult.t;
    const nearBottom = t0 < 0.15;
    const nearTop    = t0 > 0.85;
    const gr = s0.x2 > s0.x1;
    const okUp   = gr ? (K.right && !K.left) : (K.left && !K.right);
    const okDown = gr ? (K.left && !K.right) : (K.right && !K.left);
    if ((nearBottom && K.up && okUp) || (nearTop && K.down && okDown)) {
      player.onStair = true;
      player.currentStair = s0;
    }
  }

  if (player.onStair) {
    const s = player.currentStair;
    const goesRight = s.x2 > s.x1;
    player.vy = 0;
    // K.up/K.down take priority over K.left/K.right to avoid oscillation at stair entry
    var sm = 0;
    if      (K.up   && !K.down)  sm =  1;
    else if (K.down && !K.up)    sm = -1;
    else if (K.right && !K.left) sm = goesRight ?  1 : -1;
    else if (K.left  && !K.right) sm = goesRight ? -1 :  1;
    if (sm !== 0) {
      player.x += sm * player.speed * 0.85 * (goesRight ? 1 : -1);
      player.dir = sm * (goesRight ? 1 : -1);
      player.animT += 0.25;
    }
    player.x = clampX(player.x);
    let t2 = (player.x + PW/2 - s.x1) / (s.x2 - s.x1);
    t2 = Math.max(0, Math.min(1, t2));
    player.y = s.y1 + (s.y2 - s.y1) * t2 - PH;
    player.onGround = true;
    player.onLadder = true;
    if (t2 <= 0.02 || t2 >= 0.98) {
      player.onStair = false;
      player.currentStair = null;
    }
  } else {
    player.onLadder = false;
    player.vy += 0.35;
    player.y  += player.vy;
    if (K.left)  { player.x -= player.speed; player.dir = -1; player.animT += 0.25; }
    if (K.right) { player.x += player.speed; player.dir =  1; player.animT += 0.25; }
    player.x = clampX(player.x);
    const gFy = getFloorBelow(player.x, player.y);
    if (gFy !== null && player.vy >= 0) { player.y = gFy - PH; player.vy = 0; player.onGround = true; }
    else { player.onGround = false; }
  }

  if (player.y < 2) player.y = 2;

  // Collect bags
  for (let bi = 0; bi < bags.length; bi++) {
    const bag = bags[bi];
    if (bag.collected) continue;
    if (Math.abs(player.x - bag.x) < 14 && Math.abs(player.y - bag.y) < 14) {
      bag.collected = true;
      score += 200;
      addFloating(bag.x, bag.y, '+200', C.gold);
      addParticles(bag.x, bag.y, C.gold, 10);
      setMsg(STRINGS.bagCollected);
      GameAudio.playSfx('bag');
    }
  }

  // Auto-ring bell on proximity (no button needed)
  if (allBoards && !BELL.ringing && !BELL.done) {
    const bdx = Math.abs(player.x + PW/2 - BELL.x - 3);
    const bdy = Math.abs(player.y + PH/2 - BELL.y - 5);
    if (bdx < 18 && bdy < 22) ringBell();
  }

  if (actionPressed) { actionPressed = false; tryAction(); }
}

function tryAction() {
  if (state !== 'playing') return;

  let nearest = null, nd = 9999;
  for (let i = 0; i < BOARDS.length; i++) {
    const b = BOARDS[i];
    if (b.done) continue;
    const d = Math.abs(player.x + PW/2 - b.x - BW/2) + Math.abs(player.y - b.y - BH);
    if (d < nd) { nd = d; nearest = b; }
  }

  if (nearest && nd < 36) {
    player.spraying = true;
    player.sprayT = 70;
    player.dir = (player.x + PW/2 < nearest.x + BW/2) ? 1 : -1;
    GameAudio.playSfx('spray');
    const capturedBoard = nearest;
    setTimeout(function() {
      if (!capturedBoard.done) {
        capturedBoard.done = true;
        score += 500;
        addFloating(capturedBoard.x + BW/2, capturedBoard.y, '+500', C.chalk);
        addParticles(capturedBoard.x + BW/2, capturedBoard.y + BH, C.chalk, 14);
        alertTeachers(capturedBoard.x + BW/2, capturedBoard.y);
        let done = 0;
        for (let j = 0; j < BOARDS.length; j++) if (BOARDS[j].done) done++;
        if (done === BOARDS.length) {
          allBoards = true;
          setMsg(STRINGS.allBoards);
        } else {
          setMsg(STRINGS.boardTagged(done, BOARDS.length));
        }
      }
      player.spraying = false;
    }, 750);
  } else {
    if (allBoards && !BELL.done) setMsg(STRINGS.goBell);
    else setMsg(STRINGS.getCloser);
  }
}

function ringBell() {
  if (BELL.ringing || BELL.done) return;
  BELL.ringing = true;
  BELL.ringT = 120;
  score += 1000;
  addFloating(BELL.x - 20, BELL.y - 6, '+1000!', C.gold);
  addParticles(BELL.x, BELL.y, C.gold, 30);
  setMsg(STRINGS.ringMsg);
  GameAudio.playSfx('bell');
  setTimeout(function() { BELL.done = true; state = 'win'; GameAudio.stopMusic(); GameAudio.playSfx('win'); }, 2000);
}

function alertTeachers(bx, by) {
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    if (Math.abs(t.y - player.y) < 20 && Math.abs(t.x - bx) < t.sight) {
      t.alertT = 120; t.chasing = true; t.chaseX = player.x;
    }
  }
}

function updateTeachers() {
  if (state !== 'playing') return;
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    t.animT += 0.12;
    if (t.chasing) {
      t.alertT = Math.max(0, t.alertT - 1);
      const dx = t.chaseX - t.x;
      t.dir = dx > 0 ? 1 : -1;
      t.x += t.dir * t.speed * 1.8;
      t.animT += 0.1;
      if (Math.abs(t.y - player.y) < 12 && Math.abs(t.x - player.x) < 16 && player.stunT === 0) {
        caughtBy(t); t.chasing = false; t.alertT = 0;
      }
      if (t.alertT <= 0) t.chasing = false;
    } else {
      t.x += t.dir * t.speed;
      if (t.x >= t.maxX) { t.x = t.maxX; t.dir = -1; }
      if (t.x <= t.minX) { t.x = t.minX; t.dir =  1; }
    }
  }
}

function caughtBy(t) {
  lives--;
  score = Math.max(0, score - 300);
  player.stunT = 160; player.spraying = false;
  addParticles(player.x + PW/2, player.y, C.red, 20);
  let msg = STRINGS.caughtBy(t.name);
  msg += lives > 0 ? '♥'.repeat(lives) : 'GAME OVER!';
  setMsg(msg);
  player.x = 40; player.y = GY - PH; player.vy = 0;
  GameAudio.playSfx('caught');
  if (lives <= 0) setTimeout(function() { state = 'gameover'; GameAudio.stopMusic(); GameAudio.playSfx('gameover'); }, 1800);
}

function updateJanitors() {
  if (state !== 'playing') return;
  for (let i = 0; i < janitors.length; i++) {
    const j = janitors[i];
    j.animT += 0.15;
    j.x += j.dir * j.speed;
    if (j.x >= j.maxX) { j.x = j.maxX; j.dir = -1; }
    if (j.x <= j.minX) { j.x = j.minX; j.dir =  1; }
    if (Math.abs(j.y - player.y) < 12 && Math.abs(j.x - player.x) < 14 && player.stunT === 0) {
      caughtBy(j);
    }
  }
}

function updateBell() {
  if (BELL.ringing && BELL.ringT > 0) { BELL.ringT--; if (BELL.ringT === 0) BELL.ringing = false; }
}

function updateTimer() {
  if (CONFIG.levelTimer === 0 || BELL.done) return;
  if (player.stunT > 0) return;
  timerTicks--;
  if (timerTicks <= 0) {
    timerTicks = 0;
    lives--;
    addParticles(player.x + PW/2, player.y, C.red, 20);
    var msg = STRINGS.timesUp;
    msg += lives > 0 ? '♥'.repeat(lives) : 'GAME OVER!';
    setMsg(msg);
    player.stunT = 160; player.spraying = false;
    player.x = 40; player.y = GY - PH; player.vy = 0;
    GameAudio.playSfx('caught');
    if (lives <= 0) {
      setTimeout(function() { state = 'gameover'; GameAudio.stopMusic(); GameAudio.playSfx('gameover'); }, 1800);
    } else {
      timerTicks = CONFIG.levelTimer * 60;
    }
  }
}

function addParticles(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    particles.push({x:x, y:y,
      vx:(Math.random()-.5)*2.5, vy:(Math.random()-.5)*2-1,
      color:color, life:45, max:45});
  }
}

function addFloating(x, y, text, color) {
  floatingTexts.push({x:x, y:y, text:text, color:color, life:80, max:80});
}

// DRAW
function drawBg() {
  // Hand-drawn background: 640×400px, drawn at 1:1 canvas pixels (bypasses ctx.scale)
  if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bgImage, 0, 0);
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    return;
  }
  // Fallback: programmatic background
  // Dark exterior void
  ctx.fillStyle = '#0a0818'; ctx.fillRect(0, 0, W, H);

  // Room sections per floor — 3 rooms × 3 floors
  // Each room visible from room_ceiling to floorY-FD (the floor top face covers the rest)
  const rooms = [
    {x:0,   w:107, wall: C.room1},  // left room (teal)
    {x:107, w:106, wall: C.room2},  // center room (purple)
    {x:213, w:107, wall: C.room3},  // right room (amber)
  ];
  const floorDefs = [
    {y: TY, ceiling: 0},
    {y: MY, ceiling: TY + 11},
    {y: GY, ceiling: MY + 11},
  ];
  for (let fi = 0; fi < floorDefs.length; fi++) {
    const fd = floorDefs[fi];
    for (let ri = 0; ri < rooms.length; ri++) {
      const r = rooms[ri];
      ctx.fillStyle = r.wall;
      ctx.fillRect(r.x, fd.ceiling, r.w, fd.y - fd.ceiling);
    }
  }
}

function drawRoomDividers() {
  const divX = [107, 213];
  const floorDefs = [
    {y: TY, ceiling: 0},
    {y: MY, ceiling: TY + 11},
    {y: GY, ceiling: MY + 11},
  ];
  for (let fi = 0; fi < floorDefs.length; fi++) {
    const fd = floorDefs[fi];
    const roomH = fd.y - fd.ceiling;
    for (let di = 0; di < divX.length; di++) {
      const dx = divX[di];
      ctx.fillStyle = '#1a1428'; ctx.fillRect(dx - 2, fd.ceiling, 4, roomH);
      ctx.fillStyle = C.brown;   ctx.fillRect(dx - 2, fd.ceiling, 1, roomH);
    }
  }
}

function drawFloors() {
  for (let i = 0; i < floors.length; i++) {
    const f = floors[i];

    // Collect stair openings at this floor line
    var openings = [];
    for (let si = 0; si < stairs.length; si++) {
      const s = stairs[si];
      if (s.y2 === f.y) {
        openings.push({x0: Math.min(s.x1,s.x2)-2, x1: Math.max(s.x1,s.x2)+4});
      }
    }
    openings.sort(function(a,b){ return a.x0-b.x0; });

    // Top face — gray stone/concrete, drawn in segments skipping stair openings
    // (skipped areas show the stair below = transparent opening effect)
    var curX = f.x;
    for (var oi = 0; oi <= openings.length; oi++) {
      var segEnd = oi < openings.length ? openings[oi].x0 : f.x + f.w;
      var segW = segEnd - curX;
      if (segW > 0) {
        ctx.fillStyle = '#808888'; ctx.fillRect(curX, f.y-FD, segW, FD);
        ctx.fillStyle = '#686e6e';
        for (var py = 3; py < FD; py += 4) ctx.fillRect(curX, f.y-FD+py, segW, 1);
        ctx.fillStyle = '#505555';
        for (var px = curX; px < curX+segW; px += 14) ctx.fillRect(px, f.y-FD, 1, FD);
      }
      if (oi < openings.length) curX = openings[oi].x1;
    }

    // Front face (vertical structural edge, gray)
    ctx.fillStyle = '#787878'; ctx.fillRect(f.x, f.y,   f.w, 3);
    ctx.fillStyle = '#585858'; ctx.fillRect(f.x, f.y+3, f.w, 8);
    ctx.fillStyle = '#404040';
    for (let px = 0; px < f.w; px += 18) ctx.fillRect(f.x+px, f.y+2, 1, 6);
  }
}

function drawStairs() {
  for (let i = 0; i < stairs.length; i++) {
    const s = stairs[i];
    const steps = 10;
    for (let st = 0; st < steps; st++) {
      const t0 = st / steps;
      const x0 = s.x1 + (s.x2-s.x1)*t0;
      const y0 = s.y1 + (s.y2-s.y1)*t0;
      const stepW = Math.round((s.x2-s.x1)/steps);
      const stepY = Math.round(y0);
      ctx.fillStyle = C.floorlt;
      ctx.fillRect(Math.round(x0), stepY-2, stepW+1, 3);
      ctx.fillStyle = C.floor;
      ctx.fillRect(Math.round(x0), stepY+1, stepW+1, 3);
      ctx.fillStyle = C.brown;
      ctx.fillRect(Math.round(x0), stepY-2, 2, Math.round((s.y1-s.y2)/steps)+3);
    }
    ctx.strokeStyle = C.orange;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1-4);
    ctx.lineTo(s.x2, s.y2-4);
    ctx.stroke();
    const pcx = player.x+PW/2, pcy = player.y+PH;
    const nearX = pcx >= Math.min(s.x1,s.x2)-10 && pcx <= Math.max(s.x1,s.x2)+10;
    const nearY = pcy >= Math.min(s.y1,s.y2)-10 && pcy <= Math.max(s.y1,s.y2)+10;
    if (nearX && nearY) {
      ctx.strokeStyle = 'rgba(184,199,111,0.3)';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke();
    }
  }
}

function drawDesks() {
  for (let i = 0; i < DESKS.length; i++) {
    const d = DESKS[i];
    ctx.fillStyle = C.desklt; ctx.fillRect(d.x, d.y, 20, 6);
    ctx.fillStyle = C.desk;   ctx.fillRect(d.x, d.y+5, 20, 2);
    ctx.fillStyle = C.brown;
    ctx.fillRect(d.x+1, d.y+6, 2, 5);
    ctx.fillRect(d.x+17, d.y+6, 2, 5);
    ctx.fillStyle = C.red;   ctx.fillRect(d.x+5, d.y-2, 8, 3);
    ctx.fillStyle = C.white; ctx.fillRect(d.x+6, d.y-2, 6, 2);
  }
}

function drawBoards() {
  let nearestIdx = -1, nd = 9999;
  for (let i = 0; i < BOARDS.length; i++) {
    if (BOARDS[i].done) continue;
    const d = Math.abs(player.x+PW/2 - BOARDS[i].x-BW/2) + Math.abs(player.y - BOARDS[i].y-BH);
    if (d < nd) { nd = d; nearestIdx = i; }
  }
  for (let i = 0; i < BOARDS.length; i++) {
    const b = BOARDS[i];
    ctx.fillStyle = C.brown;   ctx.fillRect(b.x-1, b.y-1, BW+2, BH+2);
    ctx.fillStyle = C.chalkbg; ctx.fillRect(b.x, b.y, BW, BH);
    if (!b.done) {
      ctx.fillStyle = 'rgba(200,220,200,0.18)';
      ctx.fillRect(b.x+2, b.y+3, BW-4, 2);
      ctx.fillRect(b.x+2, b.y+8, BW-4, 2);
      if (i === nearestIdx && nd < 36) {
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
        ctx.setLineDash([2,2]);
        ctx.strokeRect(b.x-2, b.y-2, BW+4, BH+4);
        ctx.setLineDash([]);
        ctx.fillStyle = C.yellow; ctx.font = '5px "Press Start 2P"';
        ctx.fillText('✏', b.x+BW/2-4, b.y+BH+8);
      }
    } else {
      ctx.fillStyle = C.pink;   ctx.font = '4px "Press Start 2P"'; ctx.fillText('MARCO', b.x+2, b.y+6);
      ctx.fillStyle = C.yellow; ctx.fillRect(b.x+1, b.y+7, BW-2, 1);
      ctx.fillStyle = C.lgreen; ctx.font = '4px "Press Start 2P"'; ctx.fillText('WAS HERE', b.x+1, b.y+12);
    }
  }
}

function drawBell() {
  const bx = BELL.x, by = BELL.y;
  const sx = BELL.ringing ? Math.round(Math.sin(frame * 0.6) * 2) : 0;
  const gold = BELL.ringing ? '#FFE000' : C.bell;

  // Wall bracket
  ctx.fillStyle = C.dgray;
  ctx.fillRect(bx+1, by, 3, 2);

  // Bell body (oscillates with sx)
  ctx.fillStyle = gold;
  ctx.fillRect(bx+0+sx, by+2, 5, 1);
  ctx.fillRect(bx-1+sx, by+3, 7, 2);
  ctx.fillRect(bx-2+sx, by+5, 9, 1);

  ctx.fillStyle = 'rgba(255,255,200,0.6)';
  ctx.fillRect(bx+1+sx, by+3, 1, 1);

  // Clapper
  ctx.fillStyle = C.brown;
  ctx.fillRect(bx+2+sx, by+6, 1, 2);
  ctx.fillRect(bx+1+sx, by+8, 3, 1);

  if (allBoards && !BELL.done) {
    const pulse = 0.12 + 0.08 * Math.sin(frame * 0.15);
    ctx.fillStyle = 'rgba(255,215,0,' + pulse + ')';
    ctx.beginPath(); ctx.arc(bx+3, by+5, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = C.gold; ctx.font = '5px "Press Start 2P"';
    ctx.fillText('🔔', bx-5, by+14);
  }

  if (BELL.ringing) {
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = 'rgba(255,215,0,' + (0.6 - i*0.15) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(bx+3, by+5, 4+i*3, 0, Math.PI*2); ctx.stroke();
    }
  }
}

function drawBags() {
  for (let i = 0; i < bags.length; i++) {
    const b = bags[i];
    if (b.collected) continue;
    ctx.fillStyle = C.bagborder; ctx.fillRect(b.x, b.y, 14, 10);
    ctx.fillStyle = C.bagbody;   ctx.fillRect(b.x+1, b.y+1, 12, 8);
    ctx.fillStyle = C.bagborder; ctx.fillRect(b.x+4, b.y-3, 6, 3);
    ctx.fillRect(b.x+6, b.y+3, 2, 4);
    if (Math.floor(frame/10)%2 === 0) {
      ctx.fillStyle = C.gold;
      ctx.fillRect(b.x+12, b.y-1, 2, 2);
      ctx.fillRect(b.x-1, b.y+8, 2, 2);
    }
  }
}

function drawChar(x, y, dir, animT, bodyCol, isTeacher, spraying, stunned, chasing) {
  const bx = Math.round(x), by = Math.round(y);
  if (stunned && Math.floor(frame/5)%2 === 1) return;
  const leg = Math.sin(animT) * 2.5;

  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-1, by+PH, PW, 2);

  ctx.fillStyle = isTeacher ? C.blue : C.mgray;
  ctx.fillRect(bx+1, by+10, 3, 4+leg);
  ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = C.black;
  ctx.fillRect(bx,   by+13+leg, 4, 2);
  ctx.fillRect(bx+3, by+13-leg, 4, 2);

  ctx.fillStyle = bodyCol; ctx.fillRect(bx, by+4, PW, 8);
  if (isTeacher) { ctx.fillStyle = C.yellow; ctx.fillRect(bx+3, by+5, 2, 6); }
  else { ctx.fillStyle = C.lblue; ctx.fillRect(bx+1, by+4, 1, 8); ctx.fillRect(bx+5, by+4, 1, 8); }

  ctx.fillStyle = C.pink;
  ctx.fillRect(dir>0 ? bx-2 : bx+PW, by+5, 2, 4);
  ctx.fillRect(dir>0 ? bx+PW : bx-2, by+5, 2, 4);
  if (isTeacher) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(dir>0 ? bx-4 : bx+PW+1, by+7, 3, 4);
  }

  ctx.fillStyle = C.pink; ctx.fillRect(bx+1, by-7, PW-2, 8);
  ctx.fillStyle = isTeacher ? C.lgray : C.brown; ctx.fillRect(bx+1, by-8, PW-2, 2);
  ctx.fillStyle = C.black; ctx.fillRect(dir>0 ? bx+4 : bx+2, by-5, 2, 2);
  if (isTeacher) { ctx.fillStyle = C.black; ctx.fillRect(bx+1, by-5, 3, 1); ctx.fillRect(bx+5, by-5, 3, 1); }

  if (spraying) {
    const sx = dir>0 ? bx+PW : bx-5;
    ctx.fillStyle = C.cyan; ctx.fillRect(sx, by+4, 4, 6);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(180,230,180,' + (0.4+Math.random()*0.3) + ')';
      ctx.fillRect(sx + (dir>0 ? 4+i*3 : -i*3-3), by+4+i%3, 3, 3);
    }
  }
  if (!isTeacher) { ctx.fillStyle = C.blue; ctx.fillRect(dir>0 ? bx-3 : bx+PW, by+4, 3, 6); }

  if (chasing) {
    const bub = dir>0 ? bx+PW : bx-26;
    ctx.fillStyle = C.yellow; ctx.fillRect(bub, by-14, 26, 10);
    ctx.fillStyle = C.black; ctx.font = '5px "Press Start 2P"';
    ctx.fillText(STRINGS.hey, bub+1, by-7);
  }
}

function drawJanitor(x, y, dir, animT) {
  drawChar(x, y, dir, animT, C.mgray, false, false, false, false);
  const bx = Math.round(x), by = Math.round(y);
  // Cap (navy blue, over the brown hair)
  ctx.fillStyle = C.blue;
  ctx.fillRect(bx+1, by-9, PW-2, 3);
  ctx.fillRect(dir>0 ? bx+PW-1 : bx-1, by-7, 3, 1);
  // Mop handle (on facing side, from arm to floor)
  const mx = dir > 0 ? bx+PW : bx-1;
  ctx.fillStyle = C.brown;
  ctx.fillRect(mx, by+4, 1, 12);
  // Mop head
  ctx.fillStyle = C.lgray;
  ctx.fillRect(mx-1, by+14, 3, 2);
  ctx.fillStyle = C.white;
  ctx.fillRect(mx-2, by+16, 5, 1);
}

function drawSight() {
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    if (t.chasing) continue;
    ctx.fillStyle = 'rgba(255,200,0,0.05)';
    const rx = t.dir>0 ? t.x+PW : t.x-t.sight;
    ctx.fillRect(rx, t.y-2, t.sight, PH+4);
  }
}

function drawParticles() {
  particles = particles.filter(function(p) { return p.life > 0; });
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.globalAlpha = p.life/p.max;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
  }
  ctx.globalAlpha = 1;
}

function drawFloating() {
  floatingTexts = floatingTexts.filter(function(t) { return t.life > 0; });
  for (let i = 0; i < floatingTexts.length; i++) {
    const t = floatingTexts[i];
    ctx.globalAlpha = Math.min(1, t.life/20);
    ctx.fillStyle = t.color; ctx.font = '6px "Press Start 2P"';
    ctx.fillText(t.text, t.x - ctx.measureText(t.text).width/2, t.y);
    t.y -= 0.5; t.life--;
  }
  ctx.globalAlpha = 1;
}

function drawEndScreen() {
  if (state === 'win') {
    ctx.fillStyle = 'rgba(0,0,60,0.88)'; ctx.fillRect(20, 60, 280, 80);
    ctx.fillStyle = C.gold;  ctx.font = '8px "Press Start 2P"';
    ctx.fillText(STRINGS.winTitle, 38, 85);
    ctx.fillStyle = C.white; ctx.font = '7px "Press Start 2P"';
    ctx.fillText(STRINGS.scoreLabel + String(score).padStart(5,'0'), 108, 103);
    if (Math.floor(frame/20)%2 === 0) {
      ctx.fillStyle = C.lgreen; ctx.font = '6px "Press Start 2P"';
      ctx.fillText(STRINGS.reloadWin, 48, 124);
    }
  }
  if (state === 'gameover') {
    ctx.fillStyle = 'rgba(60,0,0,0.88)'; ctx.fillRect(40, 65, 240, 70);
    ctx.fillStyle = C.red;   ctx.font = '10px "Press Start 2P"';
    ctx.fillText(STRINGS.gameoverTitle, 112, 92);
    ctx.fillStyle = C.white; ctx.font = '7px "Press Start 2P"';
    ctx.fillText(STRINGS.scoreLabel + String(score).padStart(5,'0'), 105, 110);
    if (Math.floor(frame/20)%2 === 0) {
      ctx.fillStyle = C.yellow; ctx.font = '6px "Press Start 2P"';
      ctx.fillText(STRINGS.reloadLose, 70, 128);
    }
  }
}

function updateHUD() {
  document.getElementById('hL').textContent = '♥'.repeat(Math.max(0, lives));
  let done = 0;
  for (let i = 0; i < BOARDS.length; i++) if (BOARDS[i].done) done++;
  document.getElementById('hW').textContent = done + '/' + BOARDS.length;
  document.getElementById('hS').textContent = String(score).padStart(5,'0');
  if (msgT > 0) { msgT--; document.getElementById('msg').textContent = msgText; }
  if (CONFIG.levelTimer > 0) {
    var pct = Math.max(0, timerTicks / (CONFIG.levelTimer * 60));
    var bar = document.getElementById('timer-bar');
    if (bar) {
      bar.style.width = (pct * 100) + '%';
      bar.style.background = pct > 0.6 ? C.lgreen : pct > 0.3 ? C.yellow : C.red;
    }
  }
}

var _lastLoopTime = 0;
var _accumulator  = 0;
var _STEP         = 1000 / 60; // ~16.67ms — fixed physics tick at 60Hz

function loop(ts) {
  if (_lastLoopTime === 0) _lastLoopTime = ts;
  var elapsed = ts - _lastLoopTime;
  _lastLoopTime = ts;
  if (elapsed > 250) elapsed = _STEP; // cap: hidden tab / lag
  _accumulator += elapsed;

  while (_accumulator >= _STEP) {
    frame++;
    if (state === 'playing') {
      updatePlayer();
      updateTeachers();
      if (!CONFIG.debug.disableJanitors) updateJanitors();
      updateBell();
      updateTimer();
    }
    _accumulator -= _STEP;
  }

  drawBg();
  var usingBg = bgImage && bgImage.complete && bgImage.naturalWidth > 0;
  if (!usingBg) { drawStairs(); drawFloors(); drawRoomDividers(); }
  drawDesks();
  drawBoards();
  drawBell();
  drawBags();
  drawSight();

  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    drawChar(t.x, t.y, t.dir, t.animT, t.color, true, false, false, t.chasing);
  }
  if (!CONFIG.debug.disableJanitors) {
    for (let i = 0; i < janitors.length; i++) {
      const j = janitors[i];
      drawJanitor(j.x, j.y, j.dir, j.animT);
    }
  }
  if (!(player.stunT > 0 && Math.floor(frame/5)%2 === 1)) {
    drawChar(player.x, player.y, player.dir, player.animT, C.blue, false, player.spraying, false, false);
  }

  if (player.stunT > 120) { ctx.fillStyle = 'rgba(255,0,0,0.18)'; ctx.fillRect(0,0,W,H); }

  drawParticles();
  drawFloating();
  drawEndScreen();
  drawDebugOverlay();
  updateHUD();
  requestAnimationFrame(loop);
}

function drawDebugOverlay() {
  if (!DEBUG) return;
  ctx.save();
  ctx.font = '4px monospace';
  ctx.textAlign = 'left';

  // Floor lines
  [{y:TY, label:'TY='+TY}, {y:MY, label:'MY='+MY}, {y:GY, label:'GY='+GY}].forEach(function(fl) {
    ctx.strokeStyle = 'rgba(255,255,0,0.7)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(0, fl.y); ctx.lineTo(W, fl.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(1, fl.y-6, 26, 7);
    ctx.fillStyle = '#FFFF00'; ctx.fillText(fl.label, 2, fl.y-1);
  });

  // Room dividers
  [107, 213].forEach(function(dx) {
    ctx.strokeStyle = 'rgba(0,200,255,0.6)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(dx+1, 2, 20, 7);
    ctx.fillStyle = '#00E8FF'; ctx.fillText('x='+dx, dx+2, 8);
  });

  // Stairs — orange box + labels at endpoints
  stairs.forEach(function(s, i) {
    var lx = Math.min(s.x1,s.x2), rx = Math.max(s.x1,s.x2);
    var ty = Math.min(s.y1,s.y2), by2 = Math.max(s.y1,s.y2);
    ctx.fillStyle = 'rgba(255,120,0,0.22)';
    ctx.fillRect(lx-2, ty, rx-lx+4, by2-ty);
    ctx.strokeStyle = 'rgba(255,140,0,0.85)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(lx-2, ty, rx-lx+4, by2-ty);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(lx-2, ty-8, 55, 7);
    ctx.fillStyle = '#FF9900';
    ctx.fillText('S'+i+' ('+s.x1+','+s.y1+')→('+s.x2+','+s.y2+')', lx-1, ty-2);
    // Entry dots at both ends
    ctx.fillStyle = '#FF4400';
    ctx.fillRect(s.x1-1, s.y1-1, 3, 3);
    ctx.fillRect(s.x2-1, s.y2-1, 3, 3);
  });

  // Bags
  bags.forEach(function(b) {
    ctx.strokeStyle = 'rgba(100,100,255,0.9)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(b.x, b.y, 14, 10);
    ctx.fillStyle = '#8888FF'; ctx.fillText('bag', b.x, b.y-2);
  });

  // Boards (lavagne)
  BOARDS.forEach(function(b) {
    ctx.strokeStyle = 'rgba(0,255,80,0.85)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(b.x, b.y, BW, BH);
    ctx.fillStyle = '#00FF50'; ctx.fillText('brd', b.x, b.y-2);
  });

  // Desks
  DESKS.forEach(function(d) {
    ctx.strokeStyle = 'rgba(255,220,0,0.65)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(d.x, d.y, 20, 11);
  });

  // Bell
  ctx.strokeStyle = 'rgba(255,215,0,0.9)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(BELL.x-4, BELL.y-4, 14, 14);
  ctx.fillStyle = '#FFD700'; ctx.fillText('bell', BELL.x-4, BELL.y-5);

  // Player hitbox
  ctx.strokeStyle = 'rgba(255,80,255,0.9)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(player.x, player.y, PW, PH);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(player.x, player.y-8, 36, 7);
  ctx.fillStyle = '#FF66FF';
  ctx.fillText('P('+Math.round(player.x)+','+Math.round(player.y)+')', player.x+1, player.y-2);

  ctx.restore();
}

requestAnimationFrame(loop);
