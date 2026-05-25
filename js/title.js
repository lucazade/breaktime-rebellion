// Title screen — state, UI interactions, service worker

var _titleStarting = false;
// _btrMax declared in state.js to ensure it exists before the first rAF fires

var _titleCtrlY    = 0;       // updated by drawTitleScreen every frame
var _titleLogoRect = null;    // {x,y,w,h} of the logo
var _titleAudioX   = 0;
var _titleAudioW   = 0;       // audio button position (dynamic width)

// ── Keyboard legend (desktop only) ───────────────────────────────────────────

var _legendEl = document.getElementById('legend');
(function() {
  if (!_legendEl || !_isDesktop) return;
  function _key(lbl) { var e=document.createElement('span'); e.className='leg-key'; e.textContent=lbl; return e; }
  function _lbl(lbl) { var e=document.createElement('span'); e.className='leg-lbl'; e.textContent=lbl; return e; }
  var wrap = document.createElement('div');
  [
    [['<','^','v','>'], STRINGS.keyMove],
    [['Z'],             STRINGS.keyAction],
    [['C'],             STRINGS.keyCredits],
    [['P'],             STRINGS.keyPause],
    [['ESC'],           STRINGS.keyHome],
  ].forEach(function(g) {
    var grp = document.createElement('span');
    grp.className = 'leg-group';
    g[0].forEach(function(k) { grp.appendChild(_key(k)); });
    grp.appendChild(_lbl(g[1]));
    wrap.appendChild(grp);
  });
  _legendEl.appendChild(wrap);
})();

function _showLegend(v) {
  if (!_legendEl) return;
  _legendEl.classList.toggle('visible', !!(v && _isDesktop));
}

// ── Title state ───────────────────────────────────────────────────────────────

function _initTitleState() {
  // One-time migration: copy old single-key progress to easy slot
  if (!localStorage.getItem('btr_max_level_easy') && localStorage.getItem('btr_max_level')) {
    localStorage.setItem('btr_max_level_easy',  localStorage.getItem('btr_max_level'));
    localStorage.setItem('btr_last_level_easy', localStorage.getItem('btr_last_level') || '1');
    localStorage.removeItem('btr_max_level');
    localStorage.removeItem('btr_last_level');
  }
  var debug = CONFIG.debug.unlockAllLevels;
  _btrMax = debug ? LEVELS.length
    : Math.min(LEVELS.length, Math.max(1, parseInt(localStorage.getItem('btr_max_level_' + gameDifficulty) || '1')));
  currentLevel = Math.max(1, Math.min(_btrMax, parseInt(localStorage.getItem('btr_last_level_' + gameDifficulty) || '1')));
  _titleStarting = false;
  _showLegend(true);
}

function _tryStart() {
  if (_titleStarting || state !== 'title') return;
  if (window.innerWidth <= window.innerHeight) return; // portrait
  _titleStarting = true;
  _showLegend(false);
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
  var debug = CONFIG.debug.unlockAllLevels;
  _btrMax = debug ? LEVELS.length
    : Math.min(LEVELS.length, Math.max(1, parseInt(localStorage.getItem('btr_max_level_' + gameDifficulty) || '1')));
  currentLevel = Math.max(1, Math.min(_btrMax, parseInt(localStorage.getItem('btr_last_level_' + gameDifficulty) || '1')));
}

function _titleCanvasClick(lx, ly) {
  if (state !== 'title') return;
  var ct = CONFIG.ui.titleScreen.controls;
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

// ── Init ──────────────────────────────────────────────────────────────────────

_initTitleState();
document.body.classList.add('title-mode'); // active on page load (state='title')

window.addEventListener('_titleReset', function() {
  _titleStarting = false; _initTitleState();
  document.body.classList.add('title-mode');
});

// ── Service worker + audio ────────────────────────────────────────────────────

(function() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  GameAudio.playIntro();
})();
