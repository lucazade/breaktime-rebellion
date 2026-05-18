// Title screen — controls init, service worker
(function() {

  // ── Service worker ──────────────────────────────────────────────────────────
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

  // ── Start game: Enter key o tap sull'immagine logo ───────────────────────────
  var _starting = false;
  function _isLandscape() { return window.innerWidth > window.innerHeight; }
  function _tryStart() {
    if (_starting || state !== 'title' || !_isLandscape()) return;
    _starting = true;
    startGame();
  }
  // reset quando si torna alla home (overlay ritorna visibile)
  document.getElementById('overlay').addEventListener('transitionend', function() {
    _starting = false;
  });
  window.addEventListener('_titleReset', function() { _starting = false; });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') _tryStart('key');
  });
  var logoImg = document.getElementById('logo-img');
  logoImg.addEventListener('click', function() { _tryStart(); });
  logoImg.addEventListener('touchend', function(e) {
    e.preventDefault();
    _tryStart();
  }, {passive: false});

  // ── Portrait-msg blocca propagazione (evita tap accidentali che avviano il gioco) ──
  var portraitMsg = document.getElementById('portrait-msg');
  if (portraitMsg) {
    portraitMsg.addEventListener('click',    function(e) { e.stopPropagation(); });
    portraitMsg.addEventListener('touchend', function(e) { e.stopPropagation(); e.preventDefault(); }, {passive: false});
  }

  // ── Stop tap propagation (controls must not trigger startGame) ──────────────
  var controls = document.getElementById('title-controls');
  controls.addEventListener('click',      function(e) { e.stopPropagation(); });
  controls.addEventListener('touchstart', function(e) { e.stopPropagation(); }, {passive: false});

  // ── Audio toggle ────────────────────────────────────────────────────────────
  var audioIcons = {
    full: '<i class="fa-solid fa-volume-high"></i>',
    sfx:  '<i class="fa-solid fa-volume-low"></i>',
    mute: '<i class="fa-solid fa-volume-xmark"></i>',
  };
  var audioModes = ['full', 'sfx', 'mute'];
  var audioBtn = document.getElementById('audio-toggle');

  function refreshAudio() { audioBtn.innerHTML = audioIcons[GameAudio.getMode()]; }
  refreshAudio();

  // Try to autoplay intro immediately; browsers that block autoplay will silently fail
  // and the music will start on first user interaction via the audio toggle or Play button
  GameAudio.playIntro();

  audioBtn.addEventListener('click', function() {
    var next = audioModes[(audioModes.indexOf(GameAudio.getMode()) + 1) % audioModes.length];
    GameAudio.setMode(next);
    if (next === 'full') GameAudio.playIntro();
    refreshAudio();
  });

  // ── Language selector ───────────────────────────────────────────────────────
  var langChooser = document.getElementById('lang-chooser');
  if (CONFIG.debug.showLangChooser) {
    var currentLang = document.documentElement.lang;
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      if (btn.dataset.lang === currentLang) btn.classList.add('active');
      btn.addEventListener('click', function() {
        localStorage.setItem('btr_lang', btn.dataset.lang);
        location.href = location.pathname + '?lang=' + btn.dataset.lang;
      });
    });
  } else {
    langChooser.style.display = 'none';
    document.getElementById('title-controls').classList.add('no-lang');
  }

  // ── Level chooser ────────────────────────────────────────────────────────────
  // Visible to all users when there are multiple levels.
  // Debug mode unlocks every level; normal mode unlocks progressively via localStorage.
  if (LEVELS.length > 1) {
    var debug = CONFIG.debug.showLevelChooser;
    var btrMax = debug
      ? LEVELS.length
      : Math.min(LEVELS.length, Math.max(1, parseInt(localStorage.getItem('btr_max_level') || '1')));

    var lvlName = document.getElementById('lvl-name');
    var prevBtn = document.getElementById('lvl-prev');
    var nextBtn = document.getElementById('lvl-next');
    [prevBtn, lvlName, nextBtn].forEach(function(el) { el.style.visibility = 'visible'; });

    // Restore last chosen level within the unlocked range
    currentLevel = Math.max(1, Math.min(btrMax, parseInt(localStorage.getItem('btr_last_level') || '1')));

    function refreshLevel() {
      lvlName.textContent = STRINGS.levelLabel + ' ' + currentLevel;
      prevBtn.disabled = currentLevel <= 1;
      var atCeiling = currentLevel >= btrMax;
      var moreExist  = btrMax < LEVELS.length;
      nextBtn.innerHTML = (atCeiling && moreExist) ? '<i class="fa-solid fa-lock"></i>' : '&#8250;';
      nextBtn.disabled  = atCeiling && !moreExist;
      nextBtn.classList.toggle('lvl-locked', atCeiling && moreExist);
    }
    refreshLevel();

    prevBtn.addEventListener('click', function() {
      if (currentLevel > 1) { currentLevel--; refreshLevel(); }
    });
    nextBtn.addEventListener('click', function() {
      if (currentLevel < btrMax) { currentLevel++; refreshLevel(); }
    });
  }

  // Keyboard legend labels (localised)
  var _kl = { 'kl-move': 'keyMove', 'kl-action': 'keyAction', 'kl-pause': 'keyPause', 'kl-home': 'keyHome' };
  Object.keys(_kl).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = STRINGS[_kl[id]] || '';
  });

})();
