// Title screen — controls init, timer bar, service worker
(function() {

  // ── Timer bar visibility ────────────────────────────────────────────────────
  if (CONFIG.levelTimer === 0) {
    var tw = document.getElementById('timer-bar-wrap');
    if (tw) tw.style.display = 'none';
  }

  // ── Service worker ──────────────────────────────────────────────────────────
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

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

  // ── Level chooser (dev only) ────────────────────────────────────────────────
  // #lvl-chooser always occupies flex space; children are visible only in dev mode
  if (CONFIG.debug.showLevelChooser) {
    var lvlName = document.getElementById('lvl-name');
    var prevBtn = document.getElementById('lvl-prev');
    var nextBtn = document.getElementById('lvl-next');

    // Make children visible
    [prevBtn, lvlName, nextBtn].forEach(function(el) { el.style.visibility = 'visible'; });

    function refreshLevel() {
      currentLevel = Math.max(1, Math.min(CONFIG.levels.length, currentLevel));
      lvlName.textContent = fmt(STRINGS.missionLabel, currentLevel);
    }
    refreshLevel();

    if (CONFIG.levels.length > 1) {
      prevBtn.addEventListener('click', function() {
        currentLevel = currentLevel > 1 ? currentLevel - 1 : CONFIG.levels.length;
        refreshLevel();
      });
      nextBtn.addEventListener('click', function() {
        currentLevel = currentLevel < CONFIG.levels.length ? currentLevel + 1 : 1;
        refreshLevel();
      });
    } else {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    }
  }

})();
