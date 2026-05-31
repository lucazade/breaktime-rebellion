// UI state — pause, home confirm, credits, keyboard shortcuts

var _pauseActive       = false;  // pause is active (not home-confirm)
var _homeConfirmActive = false;  // home confirm dialog is open
var _stateBeforeHome   = null;
var _creditsActive     = false;
var _btnPause          = document.getElementById('btn-pause');
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

function showCredits() {
  _creditsActive = true;
  if (state === 'playing') GameAudio.pauseMusic();
}
function hideCredits() {
  _creditsActive = false;
  if (state === 'playing') GameAudio.resumeMusic();
}

function _pauseCanvasClick(lx, ly) {
  var VP = CONFIG.ui.pauseOverlay;
  var pH = VP.padTop + VP.titleH + VP.titleSpacing + VP.btnH + VP.padBottom;
  var p = _panPos(VP.panW, pH);
  var btnY = p.by + VP.padTop + VP.titleH + VP.titleSpacing;
  if (ly >= btnY && ly <= btnY + VP.btnH && lx >= p.bx + VP.resumeOx && lx <= p.bx + VP.resumeOx + VP.resumeW) setPaused(false);
}

function _homeConfirmCanvasClick(lx, ly) {
  var VH = CONFIG.ui.homeConfirm;
  var hH = VH.padTop + VH.titleH + VH.titleSpacing + VH.btnH + VH.padBottom;
  var p = _panPos(VH.panW, hH);
  var btnY = p.by + VH.padTop + VH.titleH + VH.titleSpacing;
  if (ly < btnY || ly > btnY + VH.btnH) return;
  if (lx >= p.bx + VH.siOx && lx <= p.bx + VH.siOx + VH.siW) { goHome(); }
  else if (lx >= p.bx + VH.noOx && lx <= p.bx + VH.noOx + VH.noW) { cancelHome(); }
}

function _creditsCanvasClick(lx, ly) {
  var VC = CONFIG.ui.credits;
  var n = _CREDITS_MEMBERS ? _CREDITS_MEMBERS.length : 5;
  var panH = VC.padTop + VC.titleH + VC.titleSpacing + VC.teamH + VC.teamSpacing + n*(VC.nameH+VC.nameGap+VC.roleH+VC.roleGap) + VC.tapSpacing + VC.btnH + VC.padBottom;
  var p = _panPos(VC.panW, panH);
  var btnY = p.by + panH - VC.padBottom - VC.btnH;
  var btnX = p.bx + Math.round((VC.panW - VC.btnW) / 2);
  if (ly >= btnY && ly <= btnY + VC.btnH && lx >= btnX && lx <= btnX + VC.btnW) hideCredits();
}

// ── Event listeners ───────────────────────────────────────────────────────────

_btnPause.addEventListener('click', triggerPause);
document.getElementById('btn-home').addEventListener('click', triggerHome);

var _btnInfo = document.getElementById('btn-info');
if (_btnInfo) {
  _btnInfo.addEventListener('click', function() { if (_creditsActive) hideCredits(); else showCredits(); });
  _btnInfo.addEventListener('touchend', function(e) { e.preventDefault(); if (_creditsActive) hideCredits(); else showCredits(); }, {passive: false});
}

// ── Keyboard shortcuts (desktop) ──────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (state === 'title') {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _tryStart(); }
    return;
  }
  if (_homeConfirmActive) {
    if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y' || e.key === 's' || e.key === 'S') { e.preventDefault(); goHome(); }
    if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') { e.preventDefault(); cancelHome(); }
    return;
  }
  if (state === 'highscores') {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); goHome(); }
    return;
  }
  // Gameover choice: Enter/Y/S = play again, Escape/N → high scores
  if (state === 'gameover' && !endScreenFadingOut && endScreenT >= 20) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'y' || e.key === 'Y' || e.key === 's' || e.key === 'S') {
      e.preventDefault(); endScreenFadingOut = true; endScreenFadeOutCb = restartGame;
    } else if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') {
      e.preventDefault(); state = 'highscores';
    }
    return;
  }
  // Game win after L10: Enter/Y/S = upgrade difficulty, Escape/N → high scores
  if (state === 'win' && currentLevel === LEVELS.length && !endScreenFadingOut && endScreenT >= 20 && gameDifficulty !== 'hard') {
    if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y' || e.key === 's' || e.key === 'S') {
      e.preventDefault(); endScreenFadingOut = true; endScreenFadeOutCb = _winUpgradeDifficulty;
    } else if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') {
      e.preventDefault(); state = 'highscores';
    }
    return;
  }
  if (e.key === 'Enter' || e.key === ' ') {
    if (storyBannerT > 0 || missionBannerT > 0 || state === 'win' || bonusResultActive ||
        (deathFreeze && levelMechanics.escapeExit && exitDone && exitWinReady)) {
      e.preventDefault(); handleTap(); return;
    }
  }
  if (CONFIG.debug.tuneStairRatio && state === 'playing') {
    if (e.key === 'p' || e.key === 'P') {
      _stairVertRatio = Math.round((_stairVertRatio + 0.1) * 10) / 10;
      localStorage.setItem('btr_stairRatio', _stairVertRatio); return;
    }
    if (e.key === 'c' || e.key === 'C') {
      _stairVertRatio = Math.max(0, Math.round((_stairVertRatio - 0.1) * 10) / 10);
      localStorage.setItem('btr_stairRatio', _stairVertRatio); return;
    }
  }
  if (e.key === 'c' || e.key === 'C') { if (_creditsActive) hideCredits(); else showCredits(); return; }
  if (_creditsActive) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') hideCredits(); return; }
  if (e.key === 'p' || e.key === 'P') triggerPause();
  if (e.key === 'Escape' || (_pauseActive && (e.key === 'Enter' || e.key === ' '))) {
    if (_pauseActive) { e.preventDefault(); triggerPause(); } else triggerHome();
  }
});
