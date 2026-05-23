// Game loop and canvas setup

const CV = document.getElementById('c');
const ctx = CV.getContext('2d');

// Desktop uses 4x canvas (1280×800) for high-quality font rendering without CSS scaling.
// Mobile uses 2x canvas (640×400) — same logical coordinates (320×200) in both cases.
var _isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
var _canvasScale = (_isDesktop && !CONFIG.display.simulateMobile) ? 4 : 2;
CV.width  = 320 * _canvasScale;
CV.height = 200 * _canvasScale;

// Updates --game-h on :root so HUD and messages scale with the actual game-area height
(function() {
  var _ga = document.getElementById('game-area');
  function _updateGameH() {
    document.documentElement.style.setProperty('--game-h', _ga.offsetHeight + 'px');
  }
  _updateGameH();
  window.addEventListener('resize', _updateGameH);
})();

// #103 — hides cursor after 2s of inactivity
(function() {
  var _mt, _ga = document.getElementById('game-area');
  document.addEventListener('mousemove', function() {
    _ga.style.cursor = '';
    clearTimeout(_mt);
    _mt = setTimeout(function() { _ga.style.cursor = 'none'; CV.style.cursor = ''; }, 2000);
  });
})();
ctx.scale(_canvasScale, _canvasScale); // logical 320×200 in both modes
ctx.imageSmoothingEnabled = false;

// Pre-load day and night backgrounds; _applyLevelBg() switches based on nightMode
var _bgDay = null, _bgNight = null;
(function() {
  var hd = _isDesktop && !CONFIG.display.simulateMobile;
  var srcDay   = hd ? CONFIG.images.backgroundHd      : CONFIG.images.background;
  var srcNight = hd ? CONFIG.images.backgroundNightHd : CONFIG.images.backgroundNight;
  var d = new Image(); d.onload = function() { _bgDay = d; if (!nightMode) { bgImage = d; } }; d.src = srcDay;
  var n = new Image(); n.onload = function() { _bgNight = n; if (nightMode)  { bgImage = n; } }; n.src = srcNight;
})();

function _applyLevelBg() {
  bgImage = nightMode ? (_bgNight || _bgDay) : (_bgDay || _bgNight);
  resetBgCache();
}

// Load logo — HD version preferred (higher source resolution = better downscale quality)
(function() {
  var src = (CONFIG.images.logoHd || CONFIG.images.logo);
  if (!src) return;
  var img = new Image();
  img.onload = function() { _logoImage = img; };
  img.src = src;
})();

// ── Title screen state ────────────────────────────────────────────────────────
var _titleStarting = false;
var _btrMax = 1;

function _initTitleState() {
  var debug = CONFIG.debug.unlockAllLevels;
  _btrMax = debug ? LEVELS.length
    : Math.min(LEVELS.length, Math.max(1, parseInt(localStorage.getItem('btr_max_level') || '1')));
  currentLevel = Math.max(1, Math.min(_btrMax, parseInt(localStorage.getItem('btr_last_level') || '1')));
  _titleStarting = false;
}
_initTitleState();
document.body.classList.add('title-mode'); // active on page load (state='title')

window.addEventListener('_titleReset', function() {
  _titleStarting = false; _initTitleState();
  document.body.classList.add('title-mode');
});

function _tryStart() {
  if (_titleStarting || state !== 'title') return;
  if (window.innerWidth <= window.innerHeight) return; // portrait
  _titleStarting = true;
  startGame();
}

function _titleCycleAudio() {
  var modes = ['full', 'sfx', 'mute'];
  var next = modes[(modes.indexOf(GameAudio.getMode()) + 1) % modes.length];
  GameAudio.setMode(next);
  if (next === 'full') GameAudio.playIntro();
}

function _titleCycleDifficulty() {
  var modes = ['easy', 'medium', 'hard'];
  gameDifficulty = modes[(modes.indexOf(gameDifficulty) + 1) % modes.length];
  localStorage.setItem('btr_difficulty', gameDifficulty);
}

var _titleCtrlY = 0;       // updated by drawTitleScreen every frame
var _titleLogoRect = null; // {x,y,w,h} of the logo
var _titleAudioX = 0, _titleAudioW = 0; // audio button position (dynamic width)

function _titleCanvasClick(lx, ly) {
  if (state !== 'title') return;
  var ct = CONFIG.vis.titleScreen.controls;
  var tpX = 8, tpY = 6; // tap padding — larger target without changing visuals
  var logoBottom = _titleLogoRect ? _titleLogoRect.y + _titleLogoRect.h : _titleCtrlY;
  var padUp = Math.min(tpY, Math.max(0, _titleCtrlY - logoBottom - 1)); // don't exceed logo
  if (ly >= _titleCtrlY - padUp && ly <= _titleCtrlY + ct.btnH + tpY) {
    if (lx >= _titleAudioX - tpX && lx <= _titleAudioX + _titleAudioW + tpX) { _titleCycleAudio(); return; }
    if (lx >= ct.diffX - tpX && lx <= ct.diffX + ct.diffW + tpX) { _titleCycleDifficulty(); return; }
    if (lx >= ct.prevX - tpX && lx <= ct.prevX + ct.prevW + tpX && currentLevel > 1 && LEVELS.length > 1) { currentLevel--; return; }
    if (lx >= ct.nextX - tpX && lx <= ct.nextX + ct.nextW + tpX && currentLevel < _btrMax && LEVELS.length > 1) { currentLevel++; return; }
    return;
  }
  if (_titleLogoRect && lx >= _titleLogoRect.x && lx <= _titleLogoRect.x + _titleLogoRect.w
                     && ly >= _titleLogoRect.y && ly <= _titleLogoRect.y + _titleLogoRect.h) {
    _tryStart();
  }
}

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
    if (state === 'playing' && !_creditsActive) {
      if (storyBannerT > 0) {
        if (storyBannerFading) {
          storyBannerT--;
          if (storyBannerT <= 0) { storyBannerFading = false; storyShown = true; missionBannerT = 210; }
        } else {
          storyFadeInT = Math.min(storyFadeInT + 1, 40);
        }
      } else if (missionBannerT > 0) {
        missionBannerT--;
      } else if (deathFreeze) {
        if (msgT > 0) msgT--;
        if (exitDone && nightMode) nightExpandT++;
        tickTransition(); // only advance the respawn/gameover countdown; everything else frozen
      } else {
        if (msgT > 0) msgT--;
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

  // Title screen: draw dedicated canvas and skip game rendering
  if (state === 'title') {
    drawTitleScreen();
    drawDebugOverlay();
    requestAnimationFrame(loop);
    return;
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
    } else if (t.name === 'Prof.Ginnastica') {
      drawGinnastica(t.x, t.y, t.dir, t.animT, t.chasing, t.knockedT);
    } else if (t.name === 'Guardiano') {
      if (exitDone) continue;
      drawGuard(t.x, t.y, t.dir, t.animT, t.knockedT);
    } else {
      drawChar(t.x, t.y, t.dir, t.animT, t.color, COLOURS_TEACHER, false, t.chasing, t.knockedT);
    }
  }
  for (let i = 0; i < janitors.length; i++) {
    const jn = janitors[i];
    drawJanitor(jn.x, jn.y, jn.dir, jn.animT);
    if (jn.knockedT > 0 && Math.floor(frame / 4) % 2 === 0) {
      ctx.fillStyle = PAL.cyan;
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
        drawCharClipped(player.x, player.y, player.dir, player.animT, PAL.marcoShirt, COLOURS_MARCO, player.spraying, false, 0, bandTop, bandBottom);
      } else {
        drawChar(player.x, player.y, player.dir, player.animT, PAL.marcoShirt, COLOURS_MARCO, player.spraying, false);
      }
    } else {
      drawChar(player.x, player.y, player.dir, player.animT, PAL.marcoShirt, COLOURS_MARCO, player.spraying, false);
    }
  }


  drawPaperBalls();
  drawParticles();
  drawFloating();
  drawNightOverlay();
  drawLucaEnd();

  // Centralised dark overlay — covers all banner panels
  var _shouldDim = state !== 'title' && (storyBannerT > 0 || storyBannerFading || missionBannerT > 0
                || state === 'win' || state === 'gameover' || state === 'paused'
                || _creditsActive
                || (deathFreeze && !BELL.ringing && !exitDone));
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
  drawCredits();
  drawHUD();
  drawDebugOverlay();
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
  var _gH = VG.padTop + VG.stepTitle + VG.stepLevel + VG.stepScore + VG.stepConfirm + VG.btnH + VG.padBottom;
  var _gp = _panPos(VG.panW, _gH); var bx = _gp.bx;
  var btnY = _gp.by + VG.padTop + VG.stepTitle + VG.stepLevel + VG.stepScore + VG.stepConfirm;
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
var _pauseActive      = false;  // pause is active (not home-confirm)
var _homeConfirmActive = false; // home confirm dialog is open
var _stateBeforeHome  = null;
var _btnPause         = document.getElementById('btn-pause');
// Inline SVG to avoid OS-coloured emoji (⏸/▶ render in colour on Android/iOS)
var _SVG_PAUSE = '<svg viewBox="0 -1 16 16" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v10h4V3zm6 0v10h4V3z"/></svg>';
var _SVG_PLAY  = '<svg viewBox="0 0 16 16"  width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4 2l10 6-10 6z"/></svg>';

function setPaused(paused) {
  _pauseActive = paused;
  if (paused) {
    state = 'paused';
    GameAudio.pauseMusic();
    _btnPause.innerHTML = _SVG_PLAY;
  } else {
    state = 'playing';
    GameAudio.resumeMusic();
    _btnPause.innerHTML = _SVG_PAUSE;
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
  _btnPause.innerHTML = _SVG_PAUSE;
  GameAudio.stopJingle();
  GameAudio.fadeOutMusic(400);
  CV.style.transition = 'opacity 0.4s linear';
  CV.style.opacity = '0';
  CV.style.pointerEvents = 'none';
  CV.addEventListener('transitionend', function() {
    lives = 3; score = 0;
    resetLevel();
    state = 'title';
    window.dispatchEvent(new Event('_titleReset')); // resets _titleStarting and _btrMax
    CV.style.opacity = '1';
    CV.addEventListener('transitionend', function() {
      CV.style.transition = '';
      CV.style.pointerEvents = '';
      GameAudio.playIntro();
    }, {once: true});
  }, {once: true});
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

// ── Credits (btn-info tap) — canvas-based ────────────────────────────────────
var _creditsActive = false;

function showCredits() {
  _creditsActive = true;
  if (state === 'playing') GameAudio.pauseMusic();
}
function hideCredits() {
  _creditsActive = false;
  if (state === 'playing') GameAudio.resumeMusic();
}

var _btnInfo = document.getElementById('btn-info');
if (_btnInfo) {
  _btnInfo.addEventListener('click', showCredits);
  _btnInfo.addEventListener('touchend', function(e) { e.preventDefault(); showCredits(); }, {passive: false});
}

// ── Canvas click detection for all canvas overlays ───────────────────────────

function _creditsCanvasClick(lx, ly) {
  var VC = CONFIG.vis.credits;
  var n = _CREDITS_MEMBERS ? _CREDITS_MEMBERS.length : 5;
  var panH = VC.padTop + VC.stepTitle + VC.stepTeam + n*(VC.nameH+VC.nameGap+VC.roleH+VC.roleGap) + VC.btnGapAbove + VC.btnH + VC.padBottom;
  var p = _panPos(VC.panW, panH);
  var btnY = p.by + panH - VC.padBottom - VC.btnH;
  var btnX = p.bx + Math.round((VC.panW - VC.btnW) / 2);
  if (ly >= btnY && ly <= btnY + VC.btnH && lx >= btnX && lx <= btnX + VC.btnW) hideCredits();
}

function _pauseCanvasClick(lx, ly) {
  var VP = CONFIG.vis.pauseOverlay;
  var pH = VP.padTop + VP.stepTitle + VP.btnH + VP.padBottom;
  var p = _panPos(VP.panW, pH);
  var btnY = p.by + VP.padTop + VP.stepTitle;
  if (ly >= btnY && ly <= btnY + VP.btnH && lx >= p.bx + VP.resumeOx && lx <= p.bx + VP.resumeOx + VP.resumeW) setPaused(false);
}

function _homeConfirmCanvasClick(lx, ly) {
  var VH = CONFIG.vis.homeConfirm;
  var hH = VH.padTop + VH.stepTitle + VH.btnH + VH.padBottom;
  var p = _panPos(VH.panW, hH);
  var btnY = p.by + VH.padTop + VH.stepTitle;
  if (ly < btnY || ly > btnY + VH.btnH) return;
  if (lx >= p.bx + VH.siOx && lx <= p.bx + VH.siOx + VH.siW) { goHome(); }
  else if (lx >= p.bx + VH.noOx && lx <= p.bx + VH.noOx + VH.noW) { cancelHome(); }
}

CV.addEventListener('mousemove', function(e) {
  if (state !== 'title') { CV.style.cursor = ''; return; }
  if (!_titleLogoRect) return;
  var rect = CV.getBoundingClientRect();
  var lx = (e.clientX - rect.left) * 320 / rect.width;
  var ly = (e.clientY - rect.top)  * 200 / rect.height;
  var r = _titleLogoRect;
  CV.style.cursor = (lx >= r.x && lx <= r.x + r.w && ly >= r.y && ly <= r.y + r.h) ? 'pointer' : 'default';
});

CV.addEventListener('click', function(e) {
  var rect = CV.getBoundingClientRect();
  var lx = (e.clientX - rect.left) * 320 / rect.width;
  var ly = (e.clientY - rect.top)  * 200 / rect.height;
  if (state === 'title')                 { _titleCanvasClick(lx, ly); return; }
  if (_creditsActive)                    { _creditsCanvasClick(lx, ly); return; }
  if (_homeConfirmActive)                { _homeConfirmCanvasClick(lx, ly); return; }
  if (state === 'paused' && _pauseActive){ _pauseCanvasClick(lx, ly); return; }
  if (state === 'gameover')              { _gameoverChoice(lx, ly); return; }
  handleTap();
});

// ── Keyboard shortcuts (desktop) — P = pause, ESC = home / close dialog ─────
document.addEventListener('keydown', function(e) {
  if (state === 'title') {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _tryStart(); }
    return;
  }
  if (_homeConfirmActive) {
    if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y') { e.preventDefault(); goHome(); }
    if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') { e.preventDefault(); cancelHome(); }
    return;
  }
  // Gameover choice: Enter/Y = play again, Escape/N = home
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
  if (e.key === 'c' || e.key === 'C') { if (_creditsActive) hideCredits(); else showCredits(); return; }
  if (_creditsActive) { if (e.key === 'Escape') hideCredits(); return; }
  if (e.key === 'p' || e.key === 'P') triggerPause();
  if (e.key === 'Escape') triggerHome();
});

requestAnimationFrame(loop);
