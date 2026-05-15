// Shared state — variables and functions used across all modules

const C = CONFIG.colors;
const DEBUG = new URLSearchParams(location.search).get('debug') === '1';

// String formatter: fmt('Hello {0}, score {1}!', name, score)
function fmt(s) {
  const a = arguments;
  return s.replace(/{(\d+)}/g, function(_, i) { return a[+i + 1]; });
}

// Building structure — same across all levels, derived from layout constants
const floors = [
  {x:0, y:GY - walkOffset, w:320},
  {x:0, y:MY - walkOffset, w:320},
  {x:0, y:TY - walkOffset, w:320},
];

// Mutable level state — all reset by resetLevel()
let stairs, DESKS;
let BOARDS, bags, BELL, teachers, janitors;
let lives, score, state, frame;
let particles, floatingTexts;
let msgText, msgT;
let actionPressed, allBoards, allBags, allMachines, allBall, allStudents, allBooks, timerTicks, maxTimerTicks;
let machines, gymBall, paperBalls, students, throwCooldown, bookcase, sink, bins, sprinklers, register, exitDoor;
let nightMode, registerTime, allRegister, exitDone, exitWinReady;
let shakeTime, deflateTime, dropTime, floodTime, lighterTime;
let allSink, allBins, allSprinklers;
let missionBannerT, missionBannerLines;
let storyBannerT, storyBannerLines;  // like missionBannerT but shown first on L1
let storyShown = false; // session-level — not reset by resetLevel
let pendingTransition = null;
let deathFreeze = false;
let currentLevel = 1;
let bgImage = null;
let levelMechanics;

const player = {
  x:0, y:0, vy:0,
  dir:1, animT:0,
  onStair:false, currentStair:null,
  stunT:0, stunEndedT:-1, spraying:false, sprayT:0, shaking:false,
  speed:1.5,
};

function resetLevel() {
  const lv = LEVELS[currentLevel - 1];
  stairs   = lv.stairs;
  DESKS    = lv.desks;
  BOARDS   = lv.boards.map(function(b)   { return {x:b.x, y:b.y, done:false}; });
  bags     = lv.bags.map(function(b)     { return {x:b.x, y:b.y, collected:false}; });
  BELL     = {x:lv.bell.x, y:lv.bell.y, ringing:false, done:false, ringT:0};
  teachers = lv.teachers.map(function(t) {
    return {x:t.x, y:t.y, dir:t.dir, minX:t.minX, maxX:t.maxX,
            speed:t.speed, animT:0, color:t.color, name:t.name,
            sight:t.sight, alertT:0, chasing:false, chaseX:0, knockedT:0,
            catchRadius: t.catchRadius || 0};
  });
  janitors = lv.janitors.map(function(j) {
    return {x:j.x, y:j.y, dir:j.dir, minX:j.minX, maxX:j.maxX, speed:j.speed, animT:0, name:j.name, knockedT:0, soakCooldownT:0};
  });
  player.x = lv.playerStart.x; player.y = lv.playerStart.y; player.vy = 0;
  player.dir = 1; player.animT = 0;
  player.onStair = false; player.currentStair = null;
  player.stunT = 0; player.spraying = false; player.sprayT = 0; player.shaking = false;
  particles = []; floatingTexts = [];
  msgText = ''; msgT = 0;
  actionPressed = false; allBoards = false; allBags = false; allMachines = false; allBall = false; allStudents = false; allBooks = false; allSink = false; allBins = false; allSprinklers = false; allRegister = false; exitDone = false; exitWinReady = false;
  machines  = (lv.machines  || []).map(function(m) { return {x:m.x, y:m.y, broken:false, shakeT:0}; });
  gymBall   = lv.gymBall ? {x:lv.gymBall.x, y:lv.gymBall.y, deflated:false, shakeT:0, deflateCount:0, reinflateT:0} : null;
  students  = (lv.students  || []).map(function(s) { return {x:s.x, y:s.y, disturbed:false, shakeT:0}; });
  paperBalls = [];
  throwCooldown = 0;
  bookcase    = lv.bookcase ? {x:lv.bookcase.x, y:lv.bookcase.y, fallDx:lv.bookcase.fallDx||0, fallDy:lv.bookcase.fallDy||36, dropped:false, shakeT:0, dropCount:0, resetT:0} : null;
  sink      = lv.sink ? {x:lv.sink.x, y:lv.sink.y, waterLevel:0, pourT:0, pourCount:0, resetT:0} : null;
  bins        = (lv.bins        || []).map(function(b) { return {x:b.x, y:b.y, lit:false, fuseT:0, exploded:false}; });
  sprinklers  = (lv.sprinklers  || []).map(function(s) { return {x:s.x, y:s.y, floor:s.floor||'', lighterT:0, active:false}; });
  register    = lv.register  ? {x:lv.register.x,  y:lv.register.y,  stolen:false, stealT:0} : null;
  exitDoor    = lv.exitDoor  ? {x:lv.exitDoor.x,  y:lv.exitDoor.y}  : null;
  nightMode   = !!(lv.nightMode);
  registerTime = lv.registerTime || 80;
  shakeTime   = lv.shakeTime   || 150;
  deflateTime = lv.deflateTime || 80;
  dropTime    = lv.dropTime    || 40;
  floodTime   = lv.floodTime   || 80;
  lighterTime = lv.lighterTime || 80;
  timerTicks  = maxTimerTicks  = (lv.timer || 0) * 60;
  storyBannerT     = (currentLevel === 1 && !storyShown) ? 300 : 0; // 5s, L1 only
  storyBannerLines = null;
  missionBannerT     = storyBannerT > 0 ? 0 : 210; // defer until after story
  missionBannerLines = null;
  pendingTransition = null;
  deathFreeze = false;
  levelMechanics = Object.assign({ writeBoards:true, ringBell:true, stealBags:false }, lv.mechanics);
  frame = 0;
}

// Initialise
lives = 3; score = 0; state = 'title';
resetLevel();

function setMsg(t, d) { msgText = t; msgT = d || 220; }

// Fade #screen-fade from `from` to `to` opacity over `ms`, then call cb
function fadeScreen(from, to, ms, cb) {
  var el = document.getElementById('screen-fade');
  el.style.display    = 'block';
  el.style.transition = '';
  el.style.opacity    = from;
  void el.offsetWidth; // force reflow so transition fires
  el.style.transition = 'opacity ' + (ms / 1000) + 's linear';
  el.style.opacity    = to;
  el.addEventListener('transitionend', function() {
    el.style.transition = '';
    if (+to === 0) el.style.display = 'none';
    if (cb) cb();
  }, {once: true});
}

function startGame() {
  localStorage.setItem('btr_last_level', currentLevel);
  resetLevel();
  GameAudio.fadeOutIntro(750);
  fadeScreen(0, 1, 750, function() {          // home → black (750ms)
    document.getElementById('overlay').style.display = 'none';
    state = 'playing';
    GameAudio.playMusic();
    fadeScreen(1, 0, 600, null);              // black → game (600ms)
  });
}

function nextLevel() {
  currentLevel++;
  var savedMax = parseInt(localStorage.getItem('btr_max_level') || '1');
  if (currentLevel > savedMax) localStorage.setItem('btr_max_level', currentLevel);
  resetLevel();
  state = 'playing';
  GameAudio.playMusic();
}

function restartGame() {
  lives = 3; score = 0;
  resetLevel();
  state = 'playing';
  GameAudio.playMusic();
}
