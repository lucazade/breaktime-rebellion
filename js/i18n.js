// i18n — default language: English; auto-override based on device locale
(function() {
  var urlLang = new URLSearchParams(window.location.search).get('lang');
  var lang = (urlLang || navigator.language || 'en').slice(0, 2).toLowerCase();
  document.documentElement.lang = lang;

  var en = {
    bagCollected:  'Bag collected! +200 points!',
    allBoards:     'All boards done! Ring the bell on the right! 🔔',
    boardTagged:   function(done, total) { return 'Wall tagged! +500 (' + done + '/' + total + ') — Run!'; },
    goBell:        'Go to the bell (top right)!',
    getCloser:     'Get closer to a board! (yellow = reachable)',
    timesUp:       "TIME'S UP! ",
    caughtBy:      function(name) { return name + ' caught you! -300 points! '; },
    tapToStart:    '[ TAP TO START ]',
    initMsg:       'Tag all boards, then ring the bell!',
    winTitle:      'SCHOOL LEGEND!',
    scoreLabel:    'SCORE: ',
    reloadWin:     '[ RELOAD TO PLAY AGAIN ]',
    gameoverTitle: 'EXPELLED!',
    reloadLose:    '[ RELOAD TO TRY AGAIN ]',
    hey:           'HEY!!',
    ringMsg:       '🔔 DRIIIN! Level complete! +1000 points!',
    rotateHtml:    '↺<br>ROTATE<br>DEVICE',
  };

  var it = {
    bagCollected:  'Cartella raccolta! +200 punti!',
    allBoards:     'Tutte le lavagne! Suona la campanella! 🔔',
    boardTagged:   function(done, total) { return 'Muro imbrattato! +500 (' + done + '/' + total + ') — Scappa!'; },
    goBell:        'Vai alla campanella (in alto a destra)!',
    getCloser:     'Avvicinati a una lavagna! (giallo = raggiungibile)',
    timesUp:       'TEMPO SCADUTO! ',
    caughtBy:      function(name) { return name + ' ti ha preso! -300 punti! '; },
    tapToStart:    '[ TOCCA PER INIZIARE ]',
    initMsg:       'Imbratta tutte le lavagne, poi suona la campanella!',
    winTitle:      'LEGGENDA DELLA SCUOLA!',
    scoreLabel:    'PUNTEGGIO: ',
    reloadWin:     '[ RICARICA PER GIOCARE ANCORA ]',
    gameoverTitle: 'ESPULSO!',
    reloadLose:    '[ RICARICA PER RIPROVARE ]',
    hey:           'EHI!!',
    ringMsg:       '🔔 DRIIIN! Livello completato! +1000 punti!',
    rotateHtml:    '↺<br>RUOTA IL<br>DISPOSITIVO',
  };

  window.STRINGS = lang === 'it' ? it : en;

  var pm = document.getElementById('portrait-msg');
  if (pm) pm.innerHTML = STRINGS.rotateHtml;
  var go = document.querySelector('.go');
  if (go) go.textContent = STRINGS.tapToStart;
  var msgEl = document.getElementById('msg');
  if (msgEl) msgEl.textContent = STRINGS.initMsg;
})();
