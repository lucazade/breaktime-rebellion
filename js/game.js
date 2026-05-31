// Game loop and canvas setup

const CV = document.getElementById('c');
const ctx = CV.getContext('2d');

// 1600×1000 canvas — logical coords 320×200 at scale 5.
// CSS always scales DOWN to fit the viewport, so aspect ratio is naturally preserved.
var _isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
var _canvasScale = 5;
CV.width  = 320 * _canvasScale; // 1600
CV.height = 200 * _canvasScale; // 1000

// Updates --game-h on :root so HUD and messages scale with the actual game-area height
(function() {
  var _ga = document.getElementById('game-area');
  function _updateGameH() {
    document.documentElement.style.setProperty('--game-h', _ga.offsetHeight + 'px');
  }
  _updateGameH();
  window.addEventListener('resize', _updateGameH);
})();

// Adds .rounded + sets --canvas-top/--canvas-h when canvas has vertical air
// Also hides #top-bezel when there is not enough room above the canvas
(function() {
  var _ga        = document.getElementById('game-area');
  var _root      = document.documentElement;
  var _topBezel  = document.getElementById('top-bezel');
  // Minimum canvas-top for top-bezel to be fully visible:
  // BEZEL_TOP_GAP(26) + max bezel font height ~30px = 56px
  var BEZEL_MIN_TOP = 56;
  function _updateRoundness() {
    var rect = CV.getBoundingClientRect();
    var top  = rect.top - _ga.getBoundingClientRect().top;
    _root.style.setProperty('--canvas-top', top + 'px');
    _root.style.setProperty('--canvas-h',   rect.height + 'px');
    CV.classList.toggle('rounded', rect.top > 2);
    if (_topBezel) _topBezel.classList.toggle('bezel-hidden', rect.top < BEZEL_MIN_TOP);
  }
  new ResizeObserver(_updateRoundness).observe(CV);
  window.addEventListener('resize', _updateRoundness);
  _updateRoundness();

})();

// Top bezel click → home dialog
document.getElementById('top-bezel').addEventListener('click', triggerHome);

// #103 — hides cursor after 2s of inactivity; shows pointer over top bezel
(function() {
  var _mt, _ga = document.getElementById('game-area');
  document.addEventListener('mousemove', function() {
    _ga.style.cursor = '';
    clearTimeout(_mt);
    _mt = setTimeout(function() { _ga.style.cursor = 'none'; CV.style.cursor = ''; }, 2000);
  });
})();
ctx.setTransform(_canvasScale, 0, 0, _canvasScale, 0, 0); // logical 320×200 in both modes
ctx.imageSmoothingEnabled = false;

// Prime WebAudio on the very first user gesture so the AudioContext is already
// running by the time the game starts — prevents the hardware pop/thump on game start.
document.addEventListener('pointerdown', function() { GameAudio.primeAudio(); }, {once: true});
document.addEventListener('keydown',     function() { GameAudio.primeAudio(); }, {once: true});

// Pre-load day and night backgrounds; _applyLevelBg() switches based on nightMode
var _bgDay = null, _bgNight = null;
(function() {
  var d = new Image(); d.onload = function() { _bgDay = d; if (!nightMode) { bgImage = d; } }; d.src = CONFIG.images.background;
  var n = new Image(); n.onload = function() { _bgNight = n; if (nightMode)  { bgImage = n; } }; n.src = CONFIG.images.backgroundNight;
})();

function _applyLevelBg() {
  bgImage = nightMode ? (_bgNight || _bgDay) : (_bgDay || _bgNight);
  resetBgCache();
}

// Load logo
(function() {
  if (!CONFIG.images.logo) return;
  var img = new Image();
  img.onload = function() { _logoImage = img; };
  img.src = CONFIG.images.logo;
})();

// ── Game loop ─────────────────────────────────────────────────────────────────

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
          if (storyBannerT <= 0) { storyBannerFading = false; storyShown = true; missionBannerT = bonusActive ? 0 : 210; }
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
        if (bonusActive) {
          updateBonusPaperProjectiles();
          updateWanderers();
        }
        updateTimer();
        tickTransition();
      }
    }
    _accumulator -= _STEP;
  }

  // Re-apply transform every frame: Android WebView can reset the canvas context state
  // (lose ctx.scale) when the rendering surface is recreated on device rotation.
  // setTransform is absolute (unlike scale which compounds) so it is safe every frame.
  ctx.setTransform(_canvasScale, 0, 0, _canvasScale, 0, 0);
  ctx.imageSmoothingEnabled = false;

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
      var _th = t.name==='Prof.Rossi' ? PAL.profRossiHair : t.name==='Prof.Celeste' ? PAL.profCelesteHair : t.name==='Prof.Neri' ? PAL.profNeriHair : PAL.profRossiHair;
      var _tt = t.name==='Prof.Rossi' ? PAL.profRossiTie  : t.name==='Prof.Celeste' ? PAL.profCelesteTie  : t.name==='Prof.Neri' ? PAL.profNeriTie  : PAL.profRossiTie;
      var _tr = t.name==='Prof.Rossi' ? PAL.profRossiTrousers : t.name==='Prof.Celeste' ? PAL.profCelesteTrousers : t.name==='Prof.Neri' ? PAL.profNeriTrousers : PAL.teacherTrousers;
      var _ts = t.name==='Prof.Rossi' ? PAL.profRossiShoes    : t.name==='Prof.Celeste' ? PAL.profCelesteShoes    : t.name==='Prof.Neri' ? PAL.profNeriShoes    : PAL.teacherShoes;
      drawChar(t.x, t.y, t.dir, t.animT, t.color, Object.assign({}, COLOURS_TEACHER, {hair:_th, tie:_tt, trousers:_tr, shoes:_ts}), false, t.chasing, t.knockedT);
    }
  }
  for (let i = 0; i < janitors.length; i++) {
    const jn = janitors[i];
    drawJanitor(jn.x, jn.y, jn.dir, jn.animT);
    if (jn.knockedT > 0 && Math.floor(frame / 4) % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(Math.round(jn.x - 2), Math.round(jn.y),     1, 1);
      ctx.fillRect(Math.round(jn.x + 9), Math.round(jn.y - 3), 1, 1);
      ctx.fillRect(Math.round(jn.x + 4), Math.round(jn.y - 9), 1, 1);
      ctx.fillStyle = PAL.wetParticle;
      ctx.fillRect(Math.round(jn.x + 1), Math.round(jn.y - 2), 1, 1);
      ctx.fillRect(Math.round(jn.x + 7), Math.round(jn.y - 6), 1, 1);
      ctx.fillRect(Math.round(jn.x + 3), Math.round(jn.y -12), 1, 1);
    }
  }
  if (!(player.stunT > 0 && Math.floor(frame/5)%2 === 1)) {
    var _playerBodyCol  = bonusActive ? PAL.lucaBody    : PAL.marcoShirt;
    var _playerColours  = bonusActive ? COLOURS_LUCA    : COLOURS_MARCO;
    var _ps = 0.9;
    var _pfx = Math.round(player.x + PW/2), _pfy = Math.round(player.y + PH);
    ctx.save();
    ctx.translate(_pfx, _pfy); ctx.scale(_ps, _ps); ctx.translate(-_pfx, -_pfy);
    if (player.onStair && player.currentStair) {
      const s = player.currentStair;
      const surfaceY  = Math.min(s.y1, s.y2);
      const bandTop    = surfaceY - (s.fdTop || 0);
      const bandBottom = surfaceY + s.fdBot;
      if (player.y > bandTop - PH && player.y < bandBottom + 8) {
        drawCharClipped(player.x, player.y, player.dir, player.animT, _playerBodyCol, _playerColours, player.spraying, false, 0, bandTop, bandBottom);
      } else {
        drawChar(player.x, player.y, player.dir, player.animT, _playerBodyCol, _playerColours, player.spraying, false);
      }
    } else {
      drawChar(player.x, player.y, player.dir, player.animT, _playerBodyCol, _playerColours, player.spraying, false);
    }
    if (nightMode && !bonusActive) drawTorch(player.x, player.y, player.dir);
    ctx.restore();
  }

  if (bonusActive) drawThrowChargeBar();
  drawPaperBalls();
  if (bonusActive) { drawBonusWanderers(); drawPaperProjectiles(); }
  drawParticles();
  drawFloating();
  drawNightOverlay();
  drawLucaEnd();
  drawHUD();
  drawStairZones();

  // Centralised dark overlay — covers all banner panels
  var _shouldDim = state !== 'title' && (storyBannerT > 0 || storyBannerFading || missionBannerT > 0
                || state === 'win' || state === 'gameover' || state === 'paused' || state === 'highscores'
                || _creditsActive
                || bonusResultActive
                || (deathFreeze && !BELL.ringing && !exitDone));
  bannerDimT = _shouldDim ? Math.min(bannerDimT + 1, 20) : Math.max(bannerDimT - 1, 0);
  if (bannerDimT > 0) {
    ctx.fillStyle = 'rgba(0,0,0,' + (0.45 * bannerDimT / 20) + ')';
    ctx.fillRect(0, 0, W, H);
  }

  if ((state === 'win' || state === 'gameover') && !endScreenFadingOut) {
    endScreenT = Math.min(endScreenT + 1, 20);
  }
  if (state === 'win' && endScreenT >= 20 && !endScreenFadingOut) {
    _endBonusT++;
    var _bt = _endBonusT, _bDELAY = 90, _bTICK = 90, _bGAP = 30;
    var _inTime  = lastTimeBonus  > 0 && _bt > _bDELAY && _bt <= _bDELAY + _bTICK;
    var _inLives = lastLivesBonus > 0 && _bt > _bDELAY + _bTICK + _bGAP && _bt <= _bDELAY + _bTICK + _bGAP + _bTICK;
    if ((_inTime || _inLives) && _bt % 6 === 0) GameAudio.playSfx('scoreTick');
  }
  drawEndScreen();
  drawBonusResult();
  drawStoryBanner();
  drawMissionBanner();
  drawPauseOverlay();
  drawHomeConfirm();
  drawCredits();
  drawHighScores();
  drawDebugOverlay();
  requestAnimationFrame(loop);
}

// ── Tap handler ───────────────────────────────────────────────────────────────

function handleTap() {
  if (storyBannerT > 0 && !storyBannerFading) { storyBannerT = 20; storyBannerFading = true; return; }
  // Bonus result banner — apply rewards and advance to L6 (only after cooldown)
  if (bonusResultActive && bonusResultReady) {
    score += bonusBonusScore;
    bonusActive = false;
    bonusResultActive = false;
    deathFreeze = false;
    currentLevel = 6;
    var savedMax = parseInt(localStorage.getItem('btr_max_level_' + gameDifficulty) || '1');
    if (currentLevel > savedMax) localStorage.setItem('btr_max_level_' + gameDifficulty, currentLevel);
    resetLevel();
    if (typeof _applyLevelBg === 'function') _applyLevelBg();
    state = 'playing';
    GameAudio.playMusic();
    return;
  }
  if (state === 'highscores') { goHome(); return; }
  // L10: tap during Luca fumetto → win state (only after 90-frame cooldown)
  if (deathFreeze && levelMechanics.escapeExit && exitDone && exitWinReady) {
    _addHighScore(score, currentLevel, gameDifficulty);
    _unlockNextDifficulty();
    pendingTransition = null; deathFreeze = false; state = 'win'; endScreenT = 0; _endBonusT = 0;
    GameAudio.stopMusic(); GameAudio.playJingle('win');
    return;
  }
  if (missionBannerT > 0) { missionBannerT = Math.min(missionBannerT, 40); return; }
  if (state === 'win' && !endScreenFadingOut) {
    if (currentLevel < LEVELS.length) { endScreenFadingOut = true; endScreenFadeOutCb = nextLevel; }
    else if (gameDifficulty === 'hard') { state = 'highscores'; }
    return;
  }
}

// #208: game win upgrade choice — detect SÌ/NO button tap (easy/medium difficulty only)
function _winUpgradeDifficulty() {
  var modes = ['easy', 'medium', 'hard'];
  var next = modes[modes.indexOf(gameDifficulty) + 1];
  if (next) { gameDifficulty = next; localStorage.setItem('btr_difficulty', next); }
  currentLevel = 1;
  bonusActive = false;
  bonusResultActive = false;
  resetLevel();
  if (typeof _applyLevelBg === 'function') _applyLevelBg();
  state = 'playing';
  GameAudio.playMusic();
}

function _gameWinChoice(lx, ly) {
  if (state !== 'win' || endScreenFadingOut || endScreenT < 20 || currentLevel < LEVELS.length) return;
  if (gameDifficulty === 'hard') { state = 'highscores'; return; }
  var VW = CONFIG.ui.gameWin;
  var _wH = VW.padTop + VW.titleH + VW.titleSpacing + VW.scoreH + VW.scoreSpacing + VW.confirmH + VW.confirmSpacing + VW.btnH + VW.padBottom;
  var _wp = _panPos(VW.panW, _wH); var bx = _wp.bx;
  var btnY = _wp.by + VW.padTop + VW.titleH + VW.titleSpacing + VW.scoreH + VW.scoreSpacing + VW.confirmH + VW.confirmSpacing;
  if (ly < btnY || ly > btnY + VW.btnH) return;
  if (lx >= bx + VW.siOx && lx <= bx + VW.siOx + VW.siW) { endScreenFadingOut = true; endScreenFadeOutCb = _winUpgradeDifficulty; }
  else if (lx >= bx + VW.noOx && lx <= bx + VW.noOx + VW.noW) { state = 'highscores'; }
}

// #111: gameover choice — detect SI/NO button tap (logical canvas coords 320×200)
function _gameoverChoice(lx, ly) {
  if (state !== 'gameover' || endScreenFadingOut || endScreenT < 20) return;
  var VG = CONFIG.ui.gameover;
  var _gH = VG.padTop + VG.titleH + VG.titleSpacing + VG.scoreH + VG.scoreSpacing + VG.confirmH + VG.confirmSpacing + VG.btnH + VG.padBottom;
  var _gp = _panPos(VG.panW, _gH); var bx = _gp.bx;
  var btnY = _gp.by + VG.padTop + VG.titleH + VG.titleSpacing + VG.scoreH + VG.scoreSpacing + VG.confirmH + VG.confirmSpacing;
  if (ly < btnY || ly > btnY + VG.btnH) return;
  if (lx >= bx + VG.siOx && lx <= bx + VG.siOx + VG.siW) { endScreenFadingOut = true; endScreenFadeOutCb = restartGame; }
  else if (lx >= bx + VG.noOx && lx <= bx + VG.noOx + VG.noW) { state = 'highscores'; }
}

// ── Canvas interaction ────────────────────────────────────────────────────────

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
  if (state === 'win' && currentLevel === LEVELS.length) { _gameWinChoice(lx, ly); return; }
  if (state === 'gameover')              { _gameoverChoice(lx, ly); return; }
  handleTap();
});

requestAnimationFrame(loop);
