// Title screen — controls init, timer bar, service worker
(function() {

  // ── Timer bar visibility ────────────────────────────────────────────────────
  if (maxTimerTicks === 0) {
    var tw = document.getElementById('timer-bar-wrap');
    if (tw) tw.style.display = 'none';
  }

  // ── Service worker ──────────────────────────────────────────────────────────
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

  // ── Enter key to start game ─────────────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && state === 'title') startGame();
  });

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

  audioBtn.addEventListener('click', function() {
    var next = audioModes[(audioModes.indexOf(GameAudio.getMode()) + 1) % audioModes.length];
    GameAudio.setMode(next);
    refreshAudio();
  });

  // ── Language selector ───────────────────────────────────────────────────────
  var currentLang = document.documentElement.lang;
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    if (btn.dataset.lang === currentLang) btn.classList.add('active');
    btn.addEventListener('click', function() {
      localStorage.setItem('btr_lang', btn.dataset.lang);
      location.href = location.pathname + '?lang=' + btn.dataset.lang;
    });
  });

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
      lvlName.textContent = currentLevel;
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

})();
