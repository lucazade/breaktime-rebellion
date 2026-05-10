// i18n — default language: English; auto-override based on device locale
// Only plain strings here — formatting with {0}, {1}… placeholders done in game.js via fmt()
(function() {
  var urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang) localStorage.setItem('btr_lang', urlLang);
  var lang = (urlLang || localStorage.getItem('btr_lang') || navigator.language || 'en').slice(0, 2).toLowerCase();
  document.documentElement.lang = lang;

  var en = {
    bagCollected:  'Bag collected! +200 points!',
    allBoards:     'All boards done! Ring the bell on the right! 🔔',
    boardTagged:   'Wall tagged! +500 ({0}/{1}) — Run!',
    goBell:        'Go to the bell (top right)!',
    getCloser:     'Get closer to a board! (yellow = reachable)',
    timesUp:       "TIME'S UP!",
    caughtBy:      '{0} caught you! -300 points!',
    tapToStart:    '[ TAP TO START ]',
    missionLabel:  'LEVEL {0}',
    mission1:      'Tag all boards, then ring the bell!',
    mission2:      "Steal all classmates' bags, then ring the bell!",
    winTitle:      'SCHOOL LEGEND!',
    scoreLabel:    'SCORE: ',
    reloadNext:    '[ TAP FOR NEXT LEVEL ]',
    reloadWin:     '[ TAP TO PLAY AGAIN ]',
    gameoverTitle: 'EXPELLED!',
    reloadLose:    '[ TAP TO TRY AGAIN ]',
    bagStolen:     'Bag stolen! ({0}/{1}) — Run!',
    allBagsStolen: 'All bags stolen! Ring the bell! 🔔',
    hey:           'HEY!!',
    ringMsg:       '🔔 DRIIIN! Level complete! +1000 points!',
    rotateHtml:    '↺<br>ROTATE<br>DEVICE',
  };

  var it = {
    bagCollected:  'Cartella raccolta! +200 punti!',
    allBoards:     'Tutte le lavagne! Suona la campanella! 🔔',
    boardTagged:   'Muro imbrattato! +500 ({0}/{1}) — Scappa!',
    goBell:        'Vai alla campanella (in alto a destra)!',
    getCloser:     'Avvicinati a una lavagna! (giallo = raggiungibile)',
    timesUp:       'TEMPO SCADUTO!',
    caughtBy:      '{0} ti ha preso! -300 punti!',
    tapToStart:    '[ TOCCA PER INIZIARE ]',
    missionLabel:  'LIVELLO {0}',
    mission1:      'Imbratta tutte le lavagne, poi suona la campanella!',
    mission2:      'Ruba tutte le cartelle, poi suona la campanella!',
    winTitle:      'LEGGENDA DELLA SCUOLA!',
    scoreLabel:    'PUNTEGGIO: ',
    reloadNext:    '[ TOCCA PER IL LIVELLO SUCCESSIVO ]',
    reloadWin:     '[ TOCCA PER GIOCARE ANCORA ]',
    gameoverTitle: 'ESPULSO!',
    reloadLose:    '[ TOCCA PER RIPROVARE ]',
    bagStolen:     'Borsa rubata! ({0}/{1}) — Scappa!',
    allBagsStolen: 'Tutte le borse rubate! Suona la campanella! 🔔',
    hey:           'EHI!!',
    ringMsg:       '🔔 DRIIIN! Livello completato! +1000 punti!',
    rotateHtml:    '↺<br>RUOTA IL<br>DISPOSITIVO',
  };

  window.STRINGS = lang === 'it' ? it : en;

  var pm = document.getElementById('portrait-msg');
  if (pm) pm.innerHTML = STRINGS.rotateHtml;
  var go = document.querySelector('.go');
  if (go) go.textContent = STRINGS.tapToStart;
})();
