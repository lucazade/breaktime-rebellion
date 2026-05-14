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
let actionPressed, allBoards, allBags, allMachines, allBall, allStudents, timerTicks, maxTimerTicks;
let machines, gymBall, paperBalls, students, throwCooldown;
let missionBannerT, missionBannerLines;
let pendingTransition = null;
let deathFreeze = false;
let currentLevel = 1;
let bgImage = null;
let levelMechanics;

const player = {
  x:0, y:0, vy:0,
  dir:1, animT:0,
  onGround:false, onLadder:false,
  onStair:false, currentStair:null,
  stunT:0, spraying:false, sprayT:0, shaking:false,
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
            sight:t.sight, alertT:0, chasing:false, chaseX:0, knockedT:0};
  });
  janitors = lv.janitors.map(function(j) {
    return {x:j.x, y:j.y, dir:j.dir, minX:j.minX, maxX:j.maxX, speed:j.speed, animT:0, name:j.name};
  });
  player.x = lv.playerStart.x; player.y = lv.playerStart.y; player.vy = 0;
  player.dir = 1; player.animT = 0;
  player.onGround = false; player.onLadder = false;
  player.onStair = false; player.currentStair = null;
  player.stunT = 0; player.spraying = false; player.sprayT = 0; player.shaking = false;
  particles = []; floatingTexts = [];
  msgText = ''; msgT = 0;
  actionPressed = false; allBoards = false; allBags = false; allMachines = false; allBall = false; allStudents = false;
  machines  = (lv.machines  || []).map(function(m) { return {x:m.x, y:m.y, broken:false, shakeT:0}; });
  gymBall   = lv.gymBall ? {x:lv.gymBall.x, y:lv.gymBall.y, deflated:false, shakeT:0, deflateCount:0, reinflateT:0} : null;
  students  = (lv.students  || []).map(function(s) { return {x:s.x, y:s.y, disturbed:false, shakeT:0}; });
  paperBalls = [];
  throwCooldown = 0;
  timerTicks = maxTimerTicks = (lv.timer !== undefined ? lv.timer : CONFIG.levelTimer) * 60;
  missionBannerT = 210;
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

function startGame() {
  localStorage.setItem('btr_last_level', currentLevel);
  document.getElementById('overlay').style.display = 'none';
  resetLevel();
  state = 'playing';
  GameAudio.playMusic();
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
