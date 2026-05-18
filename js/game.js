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
                || state === 'win' || state === 'gameover' || state === 'paused'
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
  drawPauseOverlay();
  drawHomeConfirm();
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
  var VG = CONFIG.vis.gameover;
  var bx = Math.round(W / 2 - VG.panW / 2);
  var btnY = VG.panY + VG.padTop + VG.stepTitle + VG.stepLevel + VG.stepScore + VG.stepConfirm;  // mirrors draw.js
  if (ly < btnY || ly > btnY + VG.btnH) return;
  if (lx >= bx + VG.siOx && lx <= bx + VG.siOx + VG.siW) { endScreenFadingOut = true; endScreenFadeOutCb = restartGame; }
  else if (lx >= bx + VG.noOx && lx <= bx + VG.noOx + VG.noW) { goHome(); }
}


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

// ── Pause / Home confirm — canvas-based (no HTML overlay) ────────────────────
var _pauseActive      = false;  // pausa attiva (non home-confirm)
var _homeConfirmActive = false; // home-confirm aperta
var _stateBeforeHome  = null;
var _btnPause         = document.getElementById('btn-pause');
var _pauseIcon        = _btnPause.querySelector('i');

function setPaused(paused) {
  _pauseActive = paused;
  if (paused) {
    state = 'paused';
    GameAudio.pauseMusic();
    _pauseIcon.className = 'fa-solid fa-play';
  } else {
    state = 'playing';
    GameAudio.resumeMusic();
    _pauseIcon.className = 'fa-solid fa-pause';
  }
}

function triggerPause() {
  if (_homeConfirmActive) return;
  if (state === 'playing') setPaused(true);
  else if (state === 'paused' && _pauseActive) setPaused(false);
}

function triggerHome() {
  if (_pauseActive) return;
  if (_homeConfirmActive) { cancelHome(); return; }
  if (state !== 'playing') return;
  _stateBeforeHome = state;
  _homeConfirmActive = true;
  GameAudio.pauseMusic();
  state = 'paused';
}

function goHome() {
  _pauseActive = false; _homeConfirmActive = false;
  _pauseIcon.className = 'fa-solid fa-pause';
  GameAudio.fadeOutMusic(750);
  fadeScreen(0, 1, 750, function() {
    lives = 3; score = 0;
    currentLevel = Math.max(1, parseInt(localStorage.getItem('btr_last_level') || '1'));
    resetLevel();
    state = 'title';
    document.getElementById('overlay').style.display = 'flex';
    window.dispatchEvent(new Event('_titleReset'));
    fadeScreen(1, 0, 600, function() { GameAudio.playIntro(); });
  });
}

function cancelHome() {
  _homeConfirmActive = false;
  if (_stateBeforeHome === 'paused') {
    _pauseActive = true; state = 'paused';
  } else {
    state = 'playing';
    GameAudio.resumeMusic();
  }
  _stateBeforeHome = null;
}

_btnPause.addEventListener('click', triggerPause);
document.getElementById('btn-home').addEventListener('click', triggerHome);

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

// ── Canvas click detection per pause e home-confirm ──────────────────────────
function _pauseCanvasClick(lx, ly) {
  var VP = CONFIG.vis.pauseOverlay;
  var bx = Math.round(W / 2 - VP.panW / 2);
  var btnY = VP.panY + VP.padTop + VP.stepTitle;
  if (ly >= btnY && ly <= btnY + VP.btnH && lx >= bx + VP.resumeOx && lx <= bx + VP.resumeOx + VP.resumeW) {
    setPaused(false);
  }
}

function _homeConfirmCanvasClick(lx, ly) {
  var VH = CONFIG.vis.homeConfirm;
  var bx = Math.round(W / 2 - VH.panW / 2);
  var btnY = VH.panY + VH.padTop + VH.stepTitle;
  if (ly < btnY || ly > btnY + VH.btnH) return;
  if (lx >= bx + VH.siOx && lx <= bx + VH.siOx + VH.siW) { goHome(); }
  else if (lx >= bx + VH.noOx && lx <= bx + VH.noOx + VH.noW) { cancelHome(); }
}

CV.addEventListener('click', function(e) {
  var rect = CV.getBoundingClientRect();
  var lx = (e.clientX - rect.left) * 320 / rect.width;
  var ly = (e.clientY - rect.top)  * 200 / rect.height;
  if (_homeConfirmActive) { _homeConfirmCanvasClick(lx, ly); return; }
  if (state === 'paused' && _pauseActive) { _pauseCanvasClick(lx, ly); return; }
  if (state === 'gameover') { _gameoverChoice(lx, ly); return; }
  handleTap();
});

// ── Keyboard shortcuts (desktop) — P = pause, ESC = home / close dialog ─────
document.addEventListener('keydown', function(e) {
  if (_homeConfirmActive) {
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
