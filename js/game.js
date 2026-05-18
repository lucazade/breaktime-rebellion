// Game loop and canvas setup

const CV = document.getElementById('c');
const ctx = CV.getContext('2d');

// Aggiorna --game-h su :root così HUD e msg scalano sull'altezza reale del game-area
(function() {
  var _ga = document.getElementById('game-area');
  function _updateGameH() {
    document.documentElement.style.setProperty('--game-h', _ga.offsetHeight + 'px');
  }
  _updateGameH();
  window.addEventListener('resize', _updateGameH);
})();

// #103 — nasconde il cursore dopo 2s di inattività
(function() {
  var _mt, _ga = document.getElementById('game-area');
  document.addEventListener('mousemove', function() {
    _ga.style.cursor = '';
    clearTimeout(_mt);
    _mt = setTimeout(function() { _ga.style.cursor = 'none'; }, 2000);
  });
})();
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
    if ((state === 'win' || state === 'gameover') && endScreenFadingOut) {
      endScreenT = Math.max(0, endScreenT - 1);
      if (endScreenT === 0) {
        endScreenFadingOut = false;
        var _wcb = endScreenFadeOutCb; endScreenFadeOutCb = null;
        if (_wcb) _wcb();
      }
    }
    if (state === 'playing') {
      if (storyBannerT > 0) {
        if (storyBannerFading) {
          storyBannerT--;
          if (storyBannerT <= 0) { storyBannerFading = false; storyShown = true; missionBannerT = 210; bannerChained = true; }
        } else {
          storyFadeInT = Math.min(storyFadeInT + 1, 40);
        }
      } else if (missionBannerT > 0) {
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
        updateSink();
        updateBins();
        updateSprinklers();
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
  drawSprinklers();
  drawSink();
  drawBins();
  drawRegister();
  drawExitDoor();
  drawSight();

  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    if (t.name === 'Preside') {
      drawPreside(t.x, t.y, t.dir, t.animT, t.color, t.chasing, t.knockedT);
    } else if (t.name === 'Guardiano') {
      drawGuard(t.x, t.y, t.dir, t.animT, t.chasing, t.knockedT);
    } else {
      drawChar(t.x, t.y, t.dir, t.animT, t.color, true, false, t.chasing, t.knockedT);
    }
  }
  for (let i = 0; i < janitors.length; i++) {
    const jn = janitors[i];
    drawJanitor(jn.x, jn.y, jn.dir, jn.animT);
    if (jn.knockedT > 0 && Math.floor(frame / 4) % 2 === 0) {
      ctx.fillStyle = C.cyan;
      ctx.fillRect(Math.round(jn.x - 2), Math.round(jn.y),     2, 2);
      ctx.fillRect(Math.round(jn.x + 9), Math.round(jn.y - 3), 2, 2);
      ctx.fillRect(Math.round(jn.x + 4), Math.round(jn.y - 9), 2, 2);
    }
  }
  if (!(player.stunT > 0 && Math.floor(frame/5)%2 === 1)) {
    if (player.onStair && player.currentStair) {
      const s = player.currentStair;
      const surfaceY  = Math.min(s.y1, s.y2);          // walking surface at upper floor
      const bandTop    = surfaceY - (s.fdTop || 0);     // where head appears above (tune fdTop per stair)
      const bandBottom = surfaceY + s.fdBot;  // where legs disappear below (tune fdBot per stair)
      if (player.y > bandTop - PH && player.y < bandBottom + 8) {
        drawCharClipped(player.x, player.y, player.dir, player.animT, C.blue, false, player.spraying, false, 0, bandTop, bandBottom);
      } else {
        drawChar(player.x, player.y, player.dir, player.animT, C.blue, false, player.spraying, false);
      }
    } else {
      drawChar(player.x, player.y, player.dir, player.animT, C.blue, false, player.spraying, false);
    }
  }


  drawPaperBalls();
  drawParticles();
  drawFloating();
  drawNightOverlay();
  drawLucaEnd();

  // Overlay scuro centralizzato — gestisce tutti i banner
  var _shouldDim = state !== 'title' && (storyBannerT > 0 || storyBannerFading || missionBannerT > 0
                || state === 'win' || state === 'gameover'
                || (deathFreeze && !BELL.ringing));
  bannerDimT = _shouldDim ? Math.min(bannerDimT + 1, 20) : Math.max(bannerDimT - 1, 0);
  if (bannerDimT > 0) {
    ctx.fillStyle = 'rgba(0,0,0,' + (0.45 * bannerDimT / 20) + ')';
    ctx.fillRect(0, 0, W, H);
  }

  if ((state === 'win' || state === 'gameover') && !endScreenFadingOut) {
    endScreenT = Math.min(endScreenT + 1, 20);
  }
  drawEndScreen();
  drawStoryBanner();
  drawMissionBanner();
  drawDebugOverlay();
  updateHUD();
  requestAnimationFrame(loop);
}

function handleTap() {
  if (storyBannerT > 0 && !storyBannerFading) { storyBannerT = 20; storyBannerFading = true; return; }
  // L10: tap during Luca fumetto → win state (only after 90-frame cooldown)
  if (deathFreeze && levelMechanics.escapeExit && exitDone && exitWinReady) {
    pendingTransition = null; deathFreeze = false; state = 'win'; endScreenT = 0;
    GameAudio.stopMusic(); GameAudio.playJingle('win');
    return;
  }
  if (missionBannerT > 0) { missionBannerT = Math.min(missionBannerT, 40); return; }
  if (state === 'win' && !endScreenFadingOut) {
    if (currentLevel < LEVELS.length) { endScreenFadingOut = true; endScreenFadeOutCb = nextLevel; }
    else { goHome(); }
    return;
  }
}

// #111: gameover choice — detect SI/NO button tap (logical canvas coords 320×200)
function _gameoverChoice(lx, ly) {
  if (state !== 'gameover' || endScreenFadingOut || endScreenT < 20) return;
  if (ly < 122 || ly > 136) return;
  if (lx >= 60 && lx <= 130)  { endScreenFadingOut = true; endScreenFadeOutCb = restartGame; }
  else if (lx >= 190 && lx <= 260) { goHome(); }
}

CV.addEventListener('click', function(e) {
  if (state === 'gameover') {
    var rect = CV.getBoundingClientRect();
    _gameoverChoice((e.clientX - rect.left) * 320 / rect.width, (e.clientY - rect.top) * 200 / rect.height);
    return;
  }
  handleTap();
});

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
  if (_homeOverlay.classList.contains('active')) return; // home aperto → ignora
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
  if (_pauseOverlay.classList.contains('active')) return;          // pausa aperta → ignora
  if (_homeOverlay.classList.contains('active')) { cancelHome(); return; } // home aperto → chiudi
  if (state !== 'playing') return;
  _stateBeforeHome = state;
  GameAudio.pauseMusic();
  state = 'paused';
  _homeOverlay.classList.add('active');
}

document.getElementById('btn-home').addEventListener('click', triggerHome);

function goHome() {
  _homeOverlay.classList.remove('active');
  _pauseOverlay.classList.remove('active');
  _pauseIcon.className = 'fa-solid fa-pause';
  GameAudio.fadeOutMusic(750);
  fadeScreen(0, 1, 750, function() {          // game → black (750ms)
    lives = 3; score = 0;
    currentLevel = Math.max(1, parseInt(localStorage.getItem('btr_last_level') || '1'));
    resetLevel();
    state = 'title';
    document.getElementById('overlay').style.display = 'flex';
    window.dispatchEvent(new Event('_titleReset'));
    fadeScreen(1, 0, 600, function() {        // black → home (600ms)
      GameAudio.playIntro();
    });
  });
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

// ── Credits (btn-info tap) ────────────────────────────────────────────────────
var _creditsOverlay = document.getElementById('credits-overlay');

function showCredits() {
  _creditsOverlay.classList.add('active');
  if (state === 'playing') GameAudio.pauseMusic();
}
function hideCredits() {
  _creditsOverlay.classList.remove('active');
  if (state === 'playing') GameAudio.resumeMusic();
}

var _btnInfo = document.getElementById('btn-info');
if (_btnInfo) {
  _btnInfo.addEventListener('click', showCredits);
  _btnInfo.addEventListener('touchend', function(e) { e.preventDefault(); showCredits(); }, {passive: false});
}
document.getElementById('btn-credits-close').addEventListener('click', hideCredits);

// ── Keyboard shortcuts (desktop) — P = pause, ESC = home / close dialog ─────
document.addEventListener('keydown', function(e) {
  if (_homeOverlay.classList.contains('active')) {
    if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y') { e.preventDefault(); goHome(); }
    if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') { e.preventDefault(); cancelHome(); }
    return;
  }
  // Gameover choice: Enter/Y = rigioca, Escape/N = home
  if (state === 'gameover' && !endScreenFadingOut && endScreenT >= 20) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'y' || e.key === 'Y') {
      e.preventDefault(); endScreenFadingOut = true; endScreenFadeOutCb = restartGame;
    } else if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') {
      e.preventDefault(); goHome();
    }
    return;
  }
  if (e.key === 'Enter' || e.key === ' ') {
    if (storyBannerT > 0 || missionBannerT > 0 || state === 'win' ||
        (deathFreeze && levelMechanics.escapeExit && exitDone && exitWinReady)) {
      e.preventDefault(); handleTap(); return;
    }
  }
  if (e.key === 'p' || e.key === 'P') triggerPause();
  if (e.key === 'Escape') triggerHome();
});

requestAnimationFrame(loop);
