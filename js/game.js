// Game loop and canvas setup

const CV = document.getElementById('c');
const ctx = CV.getContext('2d');
ctx.scale(2, 2); // 2× resolution: 640×400 canvas, 320×200 logical coordinates
ctx.imageSmoothingEnabled = false;

// Load optional hand-drawn background (640×400px, drawn bypassing ctx.scale)
(function() {
  if (!CONFIG.images.background) return;
  var img = new Image();
  img.onload = function() { bgImage = img; };
  img.src = CONFIG.images.background;
})();

var _lastLoopTime = 0;
var _accumulator  = 0;
var _STEP         = 1000 / 60; // fixed physics tick at 60Hz

function loop(ts) {
  if (_lastLoopTime === 0) _lastLoopTime = ts;
  var elapsed = ts - _lastLoopTime;
  _lastLoopTime = ts;
  if (elapsed > 250) elapsed = _STEP; // cap on hidden tab / lag spike
  _accumulator += elapsed;

  while (_accumulator >= _STEP) {
    frame++;
    if (state === 'playing') {
      if (missionBannerT > 0) {
        missionBannerT--;
      } else if (deathFreeze) {
        tickTransition(); // only advance the respawn/gameover countdown; everything else frozen
      } else {
        updatePlayer();
        updateTeachers();
        updateJanitors();
        updateBell();
        updateGymBall();
        updateBookcase();
        updatePaperBalls();
        updateTimer();
        tickTransition();
      }
    }
    _accumulator -= _STEP;
  }

  drawBg();
  drawDesks();
  drawStudents();
  drawBoards();
  if (levelMechanics.ringBell && !BELL.done) drawBell();
  drawBags();
  drawMachines();
  drawGymBall();
  drawBookcase();
  drawSight();

  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    drawChar(t.x, t.y, t.dir, t.animT, t.color, true, false, t.chasing, t.knockedT);
  }
  for (let i = 0; i < janitors.length; i++) {
    drawJanitor(janitors[i].x, janitors[i].y, janitors[i].dir, janitors[i].animT);
  }
  if (!(player.stunT > 0 && Math.floor(frame/5)%2 === 1)) {
    drawChar(player.x, player.y, player.dir, player.animT, C.blue, false, player.spraying, false);
  }

  if (deathFreeze) { ctx.fillStyle = 'rgba(255,0,0,0.18)'; ctx.fillRect(0,0,W,H); }

  drawPaperBalls();
  drawParticles();
  drawFloating();
  drawEndScreen();
  drawMissionBanner();
  drawDebugOverlay();
  updateHUD();
  requestAnimationFrame(loop);
}

function handleTap() {
  if (missionBannerT > 0) { missionBannerT = 0; return; }
  if (state === 'win') {
    if (currentLevel < LEVELS.length) nextLevel();
    else { currentLevel = 1; restartGame(); }
    return;
  }
  if (state === 'gameover') { restartGame(); }
}

CV.addEventListener('click', handleTap);

// Panels forward taps to game handler — but NOT when the tap is on a panel button
['panel-left', 'panel-right'].forEach(function(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', function(e) {
    if (e.target.closest('.panel-btn')) return;
    handleTap();
  });
  el.addEventListener('touchend', function(e) {
    if (e.target.closest('.panel-btn')) return; // let the button handle its own tap
    e.preventDefault();
    handleTap();
  }, {passive: false});
});
document.getElementById('btn-action').addEventListener('touchend', function() { handleTap(); }, {passive: true});

// ── Pause ────────────────────────────────────────────────────────────────────
var _pauseOverlay = document.getElementById('pause-overlay');
var _btnPause     = document.getElementById('btn-pause');
var _pauseIcon    = _btnPause.querySelector('i');

function setPaused(paused) {
  if (paused) {
    state = 'paused';
    GameAudio.pauseMusic();
    _pauseOverlay.classList.add('active');
    _pauseIcon.className = 'fa-solid fa-play';
  } else {
    state = 'playing';
    GameAudio.resumeMusic();
    _pauseOverlay.classList.remove('active');
    _pauseIcon.className = 'fa-solid fa-pause';
  }
}

function triggerPause() {
  if (state === 'playing') setPaused(true);
  else if (state === 'paused') setPaused(false);
}

_btnPause.addEventListener('click', triggerPause);
document.getElementById('btn-resume').addEventListener('click', function() {
  if (state === 'paused') setPaused(false);
});

// ── Home ─────────────────────────────────────────────────────────────────────
var _homeOverlay     = document.getElementById('home-confirm-overlay');
var _stateBeforeHome = null;

function triggerHome() {
  if (state !== 'playing' && state !== 'paused') return;
  _stateBeforeHome = state;
  if (state === 'playing') GameAudio.pauseMusic();
  _pauseOverlay.classList.remove('active');
  state = 'paused';
  _homeOverlay.classList.add('active');
}

document.getElementById('btn-home').addEventListener('click', triggerHome);

function goHome() {
  _homeOverlay.classList.remove('active');
  _pauseOverlay.classList.remove('active');
  _pauseIcon.className = 'fa-solid fa-pause';
  lives = 3; score = 0;
  currentLevel = Math.max(1, parseInt(localStorage.getItem('btr_last_level') || '1'));
  resetLevel();
  state = 'title';
  GameAudio.stopMusic();
  document.getElementById('overlay').style.display = 'flex';
}

function cancelHome() {
  _homeOverlay.classList.remove('active');
  if (_stateBeforeHome === 'paused') {
    _pauseOverlay.classList.add('active');
    state = 'paused';
  } else {
    state = 'playing';
    GameAudio.resumeMusic();
  }
  _stateBeforeHome = null;
}

document.getElementById('btn-home-yes').addEventListener('click', goHome);
document.getElementById('btn-home-no').addEventListener('click', cancelHome);

// ── Keyboard shortcuts (desktop) — P = pause, ESC = home / close dialog ─────
document.addEventListener('keydown', function(e) {
  if (_homeOverlay.classList.contains('active')) {
    if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y') { e.preventDefault(); goHome(); }
    if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') { e.preventDefault(); cancelHome(); }
    return;
  }
  if (e.key === 'p' || e.key === 'P') triggerPause();
  if (e.key === 'Escape') triggerHome();
});

requestAnimationFrame(loop);
