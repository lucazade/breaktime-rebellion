// Shared state — variables and functions used across all modules


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
let msgText, msgT, msgDuration;
let actionPressed, allBoards, allBags, allMachines, allBall, allStudents, allBooks, timerTicks, maxTimerTicks;
let machines, gymBall, paperBalls, students, throwCooldown, bookcase, sink, bins, sprinklers, register, exitDoor;
let nightMode, registerTime, allRegister, exitDone, exitWinReady, nightExpandT;
var unlockedDifficulty = localStorage.getItem('btr_unlocked_difficulty') || 'easy';
var gameDifficulty = (function() {
  var saved = localStorage.getItem('btr_difficulty') || 'easy';
  var ord = ['easy', 'medium', 'hard'];
  return ord.indexOf(saved) <= ord.indexOf(unlockedDifficulty) ? saved : 'easy';
})();
function _isDifficultyUnlocked(diff) {
  if (CONFIG.debug.unlockAllLevels) return true;
  var ord = ['easy', 'medium', 'hard'];
  return ord.indexOf(diff) <= ord.indexOf(unlockedDifficulty);
}
function _unlockNextDifficulty() {
  var ord = ['easy', 'medium', 'hard'];
  var idx = ord.indexOf(gameDifficulty);
  if (idx < 0 || idx >= ord.length - 1) return;
  var next = ord[idx + 1];
  if (ord.indexOf(next) > ord.indexOf(unlockedDifficulty)) {
    unlockedDifficulty = next;
    localStorage.setItem('btr_unlocked_difficulty', next);
  }
}
let lastTimeBonus, lastLivesBonus;
let shakeTime, deflateTime, dropTime, floodTime, lighterTime, throwChargeTime, throwBarThreshold, bonusMilestoneEvery;
let allSink, allBins, allSprinklers;
let missionBannerT, missionBannerLines;
let storyBannerT, storyBannerLines;  // like missionBannerT but shown first on L1
let storyShown = false; // session-level — not reset by resetLevel
let pendingTransition = null;
// Bonus level state
var bonusActive      = false;   // true during the CARAMBOLA! bonus level
var bonusCarambole   = 0;       // tumbles scored in current bonus
var bonusBonusLives  = 0;       // extra lives accumulated
var bonusBonusScore  = 0;       // extra score accumulated
var bonusResultActive = false;  // true when bonus-result banner is shown
var paperProjectiles = [];      // [{x,y,dir,decay}] bonus paper projectiles
var bonusWanderers   = [];      // wandering students (bonus only)
let deathFreeze = false;
let endScreenT = 0;
let _endBonusT = 0;

function _getHighScores() {
  try { return JSON.parse(localStorage.getItem('btr_highscores') || '[]'); } catch(e) { return []; }
}
function _addHighScore(sc, lv, diff) {
  var hs = _getHighScores();
  hs.push({ score: sc, level: lv, difficulty: diff });
  hs.sort(function(a, b) { return b.score - a.score; });
  if (hs.length > 10) hs.length = 10;
  try { localStorage.setItem('btr_highscores', JSON.stringify(hs)); } catch(e) {}
}
let endScreenFadingOut = false;
let endScreenFadeOutCb = null;
let storyBannerFading = false;
let storyFadeInT = 0;
let bannerDimT = 0;
let currentLevel = 1;
// Declared here (before game.js registers rAF) so drawTitleScreen() can never see
// it as undefined, even in WebView/browser contexts where rAF fires before title.js.
var _btrMax = 1;
let bgImage = null;
let levelMechanics;

const player = {
  x:0, y:0, vy:0,
  dir:1, animT:0,
  onStair:false, currentStair:null,
  stunT:0, stunEndedT:-1, spraying:false, sprayT:0, boardCommitT:0, boardCommitTarget:null, shaking:false,
  speed:1.0,
  throwChargeT:0,   // bonus: frames held so far while charging the throw
  throwCharging:false, // bonus: true while action is held and charge is building
};

function resetLevel() {
  const lv = bonusActive ? BONUS_LEVEL : LEVELS[currentLevel - 1];
  stairs   = lv.stairs;
  DESKS    = lv.desks;
  BOARDS   = lv.boards.map(function(b)   { return {x:b.x, y:b.y, done:false}; });
  bags     = lv.bags.map(function(b)     { return {x:b.x, y:b.y, collected:false}; });
  BELL     = {x:lv.bell.x, y:lv.bell.y, ringing:false, done:false, ringT:0};
  var _dSight = gameDifficulty === 'hard' ? 1.7 : gameDifficulty === 'medium' ? 1.3 : 1.0;
  var _dT     = gameDifficulty === 'hard' ? 0.833 : gameDifficulty === 'medium' ? 0.917 : 1.0;
  teachers = lv.teachers.map(function(t) {
    return {x:t.x, y:t.y, dir:t.dir, minX:t.minX, maxX:t.maxX,
            speed:t.speed, animT:0, color:t.color, name:t.name,
            sight:Math.round(t.sight * _dSight), alertT:0, chasing:false, chaseX:0, knockedT:0,
            catchRadius: t.catchRadius || 0, reactionT:0};
  });
  janitors = lv.janitors.map(function(j) {
    return {x:j.x, y:j.y, dir:j.dir, minX:j.minX, maxX:j.maxX, speed:j.speed, animT:0, name:j.name, knockedT:0, soakCooldownT:0, dryT:0};
  });
  player.x = lv.playerStart.x; player.y = lv.playerStart.y; player.vy = 0;
  player.dir = 1; player.animT = 0;
  player.onStair = false; player.currentStair = null;
  player.stunT = 0; player.spraying = false; player.sprayT = 0; player.boardCommitT = 0; player.boardCommitTarget = null; player.shaking = false; player.throwChargeT = 0; player.throwCharging = false;
  particles = []; floatingTexts = [];
  msgText = ''; msgT = 0; msgDuration = 0;
  actionPressed = false; allBoards = false; allBags = false; allMachines = false; allBall = false; allStudents = false; allBooks = false; allSink = false; allBins = false; allSprinklers = false; allRegister = false; exitDone = false; exitWinReady = false; nightExpandT = 0; lastTimeBonus = 0; lastLivesBonus = 0;
  machines  = (lv.machines  || []).map(function(m) { return {x:m.x, y:m.y, broken:false, shakeT:0}; });
  gymBall   = lv.gymBall ? {x:lv.gymBall.x, y:lv.gymBall.y, deflated:false, shakeT:0, deflateCount:0, reinflateT:0} : null;
  students  = (lv.students  || []).map(function(s) { return {x:s.x, y:s.y, shirtColor:s.shirtColor||null, disturbed:false, shakeT:0}; });
  paperBalls = [];
  throwCooldown = 0;
  bookcase    = lv.bookcase ? {x:lv.bookcase.x, y:lv.bookcase.y, fallDx:lv.bookcase.fallDx||0, fallDy:lv.bookcase.fallDy||36, dropped:false, shakeT:0, dropCount:0, resetT:0} : null;
  sink      = lv.sink ? {x:lv.sink.x, y:lv.sink.y, waterLevel:0, pourT:0, pourCount:0, resetT:0, floodSpread:0} : null;
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
  lighterTime      = lv.lighterTime      || 80;
  throwChargeTime      = lv.throwChargeTime      || 50;
  throwBarThreshold    = lv.throwBarThreshold    || 18;
  bonusMilestoneEvery  = typeof lv.bonusMilestoneEvery === 'object' ? (lv.bonusMilestoneEvery[gameDifficulty] || 30) : (lv.bonusMilestoneEvery || 30);
  // timer can be a per-difficulty object (bonus level) or a plain number (normal levels)
  var _rawTimer = typeof lv.timer === 'object' ? (lv.timer[gameDifficulty] || 0) : (lv.timer || 0);
  timerTicks  = maxTimerTicks  = Math.round(_rawTimer * 60 * _dT);
  storyBannerFading = false;
  storyFadeInT  = 0;
  // Bonus: show bonus opening banner; L1: show story banner; otherwise: no story banner
  storyBannerT  = bonusActive ? 300 : (currentLevel === 1 && !storyShown) ? 300 : 0;
  storyBannerLines = null;
  missionBannerT     = storyBannerT > 0 ? 0 : (bonusActive ? 0 : 210);
  missionBannerLines = null;
  pendingTransition = null;
  deathFreeze = false;
  // Bonus: reset bonus-specific state
  bonusCarambole    = 0;
  bonusBonusLives   = 0;
  bonusBonusScore   = 0;
  bonusResultActive = false;
  paperProjectiles  = [];
  bonusWanderers = (lv.wanderers || []).map(function(w, i) {
    return {x:w.x, y:w.y, dir:w.dir||1, minX:w.minX||20, maxX:w.maxX||290,
            wanderTimer: 90 + Math.round(Math.random() * 90),
            state:'walking', knockedT:0, recoverT:0,
            shirtColor:w.shirtColor||PAL.wandererShirt1,
            animT: i * 0.7};
  });
  levelMechanics = Object.assign({ writeBoards:true, ringBell:true, stealBags:false }, lv.mechanics);
  frame = 0;
}

// Initialise
lives = 3; score = 0; state = 'title';
resetLevel();

function setMsg(t, d) { msgText = t; msgT = d || 220; msgDuration = msgT; }


function startGame() {
  if (CONFIG.debug.startAtBonus) { bonusActive = true; currentLevel = 5; }
  localStorage.setItem('btr_last_level_' + gameDifficulty, currentLevel);
  resetLevel();
  if (typeof _applyLevelBg === 'function') _applyLevelBg();
  GameAudio.primeAudio();
  GameAudio.fadeOutIntro(400);
  CV.style.transition = 'opacity 0.4s linear';
  CV.style.opacity = '0';
  CV.style.pointerEvents = 'none';
  CV.addEventListener('transitionend', function() {
    document.body.classList.remove('title-mode');
    state = 'playing';
    GameAudio.playMusic();
    CV.style.opacity = '1';
    CV.addEventListener('transitionend', function() {
      CV.style.transition = '';
      CV.style.pointerEvents = '';
    }, {once: true});
  }, {once: true});
}

function nextLevel() {
  // After L5 (and bonus not yet played): activate bonus level
  if (currentLevel === 5 && !bonusActive) {
    bonusActive = true;
    // currentLevel stays at 5 — win check (currentLevel === LEVELS.length) unchanged
    resetLevel();
    if (typeof _applyLevelBg === 'function') _applyLevelBg();
    state = 'playing';
    GameAudio.playMusic();
    return;
  }
  bonusActive = false;
  currentLevel++;
  var savedMax = parseInt(localStorage.getItem('btr_max_level_' + gameDifficulty) || '1');
  if (currentLevel > savedMax) localStorage.setItem('btr_max_level_' + gameDifficulty, currentLevel);
  resetLevel();
  if (typeof _applyLevelBg === 'function') _applyLevelBg();
  state = 'playing';
  GameAudio.playMusic();
}

function restartGame() {
  lives = 3; score = 0;
  bonusActive = false;
  bonusResultActive = false;
  resetLevel();
  if (typeof _applyLevelBg === 'function') _applyLevelBg();
  state = 'playing';
  GameAudio.playMusic();
}
