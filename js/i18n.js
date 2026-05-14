// i18n — default language: English; auto-override based on device locale
// Only plain strings here — formatting with {0}, {1}… placeholders done in game.js via fmt()
(function() {
  var urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang) localStorage.setItem('btr_lang', urlLang);
  var lang = (urlLang || localStorage.getItem('btr_lang') || navigator.language || 'en').slice(0, 2).toLowerCase();
  document.documentElement.lang = lang;

  var en = {
    rotateHtml:    '↺<br>ROTATE<br>DEVICE',
    tapToStart:    '[ TAP TO START ]',
    reloadLose:    '[ TAP TO TRY AGAIN ]',
    reloadNext:    '[ TAP FOR NEXT LEVEL ]',
    reloadWin:     '[ TAP TO PLAY AGAIN ]', 
    timesUp:       "TIME'S UP!",
    goBell:        'Ring the bell!',
    hey:           'HEY!!',
    caughtBy:      '{0} caught you! -300 points!',
    ringMsg:       'Level complete! +1000 points!',
    winTitle:      'SCHOOL LEGEND!',
    scoreLabel:    'SCORE: ',
    gameoverTitle: 'EXPELLED!',
    keyMove:       'Move',
    keyAction:     'Action',
    keyPause:      'Pause',
    keyHome:       'Home',
    missionLabel:  'LEVEL {0}',
    mission1:      'Tag all boards!',
    getCloser:     'Tag the board!',
    boardTagged:   'Board tagged! +500 ({0}/{1})',
    allBoards:     'All boards tagged! Ring the bell! 🔔',
    mission2:      "Steal all classmates' bags!",
    bagCollected:  'Bag stolen! +200 points!',
    bagStolen:     'Bag stolen! ({0}/{1})',
    allBagsStolen: 'All bags stolen! Ring the bell! 🔔', 
    mission3:      'Smash all vending machines!',
    machineBroken: 'Machine smashed! ({0}/{1})',
    allMachines:          'All machines smashed! Ring the bell! 🔔',
    machineHint:          'Hold action to smash!',
    mission4:             'Deflate the ball in the gym!',
    deflateHint:          'Hold action to deflate!',
    ballFirstDeflate:     "He's reinflating it... do it again!",
    ballSecondDeflate:    'Almost there! One more time!',
    ballReinflated:       'Ball is back! Deflate it again!',
    ballDeflated:         'Ball deflated! Run to the bell! 🔔',
    bagHint:              'Get closer to steal!',
    mission5:             'Throw paper at students in class!',
    throwHint:            'Press to throw the paper!',
    studentHit:           'Student hit! ({0}/{1})',
    allStudentsDisturbed: 'All students disturbed! Ring the bell! 🔔',
  };

  var it = {
    rotateHtml:    '↺<br>RUOTA IL<br>DISPOSITIVO',
    tapToStart:    '[ TOCCA PER INIZIARE ]',
    reloadLose:    '[ TOCCA PER RIPROVARE ]',
    reloadNext:    '[ TOCCA PER IL LIVELLO SUCCESSIVO ]',
    reloadWin:     '[ TOCCA PER GIOCARE ANCORA ]',
    timesUp:       'TEMPO SCADUTO!',
    goBell:        'Suona la campanella',
    hey:           'EHI!!',
    caughtBy:      '{0} ti ha preso! -300 punti!',
    ringMsg:       'Livello completato! +1000 punti!',
    winTitle:      'LEGGENDA DELLA SCUOLA!',
    scoreLabel:    'PUNTEGGIO: ',
    gameoverTitle: 'ESPULSO!',
    keyMove:       'Muovi',
    keyAction:     'Azione',
    keyPause:      'Pausa',
    keyHome:       'Home',
    missionLabel:  'LIVELLO {0}',
    mission1:      'Imbratta tutte le lavagne!',
    getCloser:     'Scrivi sulla lavagna!',
    boardTagged:   'Lavagna imbrattata! +500 ({0}/{1})',
    allBoards:     'Tutte le lavagne imbrattate! Suona la campanella! 🔔',
    mission2:      'Ruba tutte le cartelle!',
    bagCollected:  'Cartella rubata! +200 punti!',
    bagStolen:     'Cartella rubata! ({0}/{1})',
    allBagsStolen: 'Tutte le cartelle rubate! Suona la campanella! 🔔',
    mission3:      'Spacca tutti i distributori!',
    machineBroken: 'Distributore distrutto! ({0}/{1})',
    allMachines:          'Tutti i distributori a pezzi! Suona la campanella! 🔔',
    machineHint:          'Tieni premuto per spaccare!',
    mission4:             'Sgonfia il pallone in palestra!',
    deflateHint:          'Tieni premuto per sgonfiare!',
    ballFirstDeflate:     'Lo sta rigonfiando... rifallo!',
    ballSecondDeflate:    'Quasi! Ancora una volta!',
    ballReinflated:       'Il pallone è tornato! Sgonfialo di nuovo!',
    ballDeflated:         'Pallone sgonfiato! Corri alla campanella! 🔔',
    bagHint:              'Avvicinati per rubare!',
    mission5:             'Lancia le cartacce agli alunni in classe!',
    throwHint:            'Premi per lanciare la cartaccia!',
    studentHit:           'Alunno colpito! ({0}/{1})',
    allStudentsDisturbed: 'Tutti gli alunni disturbati! Suona la campanella! 🔔',
  };

  window.STRINGS = lang === 'it' ? it : en;

  var pm = document.getElementById('portrait-msg');
  if (pm) pm.innerHTML = STRINGS.rotateHtml;
  var go = document.querySelector('.go');
  if (go) go.textContent = STRINGS.tapToStart;
})();
