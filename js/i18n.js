// i18n — default language: English; auto-override based on device locale
// Only plain strings here — formatting with {0}, {1}… placeholders done in game.js via fmt()
(function() {
  var urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang) localStorage.setItem('btr_lang', urlLang);
  var lang = (urlLang || localStorage.getItem('btr_lang') || navigator.language || 'en').slice(0, 2).toLowerCase();
  document.documentElement.lang = lang;

  var en = {
    rotateHtml:           'ROTATE DEVICE',

    keyMove:              'Move',
    keyAction:            'Action',
    keyPause:             'Pause',
    keyHome:              'Home',
    levelLabel:           'Lvl',

    tapToStart:           '[ TAP TO START ]',
    reloadLose:           '[ TAP TO TRY AGAIN ]',
    reloadNext:           '[ TAP FOR NEXT LEVEL ]',
    reloadWin:            '[ TAP TO PLAY AGAIN ]',
    tapForTitle:          '[ TAP TO GO HOME ]',
    tapContinue:          '[ TAP TO CONTINUE ]',

    missionLabel:         '— LEVEL {0} —',
    levelComplete:        '— LEVEL COMPLETE! —',
    gameoverTitle:        '— EXPELLED! —',
    winTitle:             '— SCHOOL LEGEND! —',

    scoreLabel:           'SCORE: ',
    bestLabel:            'BEST',
    levelReached:         'LEVEL {0} REACHED',

    hey:                  'HEY!!',
    timesUp:              "TIME'S UP!",
    caughtBy:             '{0} got you!',
    ringMsg:              'Level complete!',

    pauseTitle:           '— PAUSE —',
    btnResume:            'RESUME',
    homeConfirm:          'GO TO HOME?',
    gameoverConfirm:      'PLAY AGAIN?',
    btnYes:               'YES',
    btnNo:                'NO',

    storyTitle:           '— 1987 —',
    storyText:            "Luca dares Marco to pull off a string of pranks to become the school legend.|Marco never backs down from a dare.",

    mission1:             'Vandalize all boards!',
    getCloser:            'Vandalize the board!',
    boardTagged:          'Board vandalized! ({0}/{1})',
    allBoards:            'All vandalized! Ring! 🔔',

    mission2:             "Steal all classmates' bags!",
    bagHint:              'Hold to steal!',
    bagCollected:         'Bag stolen!',
    bagStolen:            'Bag stolen! ({0}/{1})',
    allBagsStolen:        'All stolen! Ring! 🔔',

    mission3:             'Smash all vending machines!',
    machineHint:          'Hold to smash it!',
    machineBroken:        'Machine smashed! ({0}/{1})',
    allMachines:          'All smashed! Ring! 🔔',

    mission4:             'Deflate the ball in the gym!',
    deflateHint:          'Hold to deflate!',
    ballProgress:         'Ball deflated! ({0}/{1})',
    ballReinflated:       'Reinflated! Deflate again!',
    ballDeflated:         'All deflated! Ring! 🔔',

    mission5:             'Throw paper at students in class!',
    throwHint:            'Press to throw!',
    studentHit:           'Student hit! ({0}/{1})',
    allStudentsDisturbed: 'All hit! Ring! 🔔',

    mission6:             'Drop the books in the office!',
    bookDropHint:         'Hold to drop the book!',
    bookProgress:         'Book dropped! ({0}/{1})',
    bookReset:            'Put back! Do it again!',
    bookDropped:          'All dropped! Ring! 🔔',

    mission7:             'Flood the bathroom!',
    sinkHint:             'Hold to open the tap!',
    sinkProgress:         'Flooded! ({0}/{1})',
    sinkReady:            'Open again!',
    sinkFlooded:          'Bathroom flooded! Ring! 🔔',

    mission8:             'Blow up all the bins!',
    binHint:              'Press to plant the firecracker!',
    binLit:               'Fuse lit! Run! 🧨',
    binExploded:          'BOOM! ({0}/{1})',
    allBinsExploded:      'All blown up! Ring! 🔔',
    binBlastHit:          'Too close to the explosion! ',

    mission9:             'Trigger the fire alarm system!',
    sprinklerHint:        'Hold to activate the sensor!',
    sprinklerLit:         'Sensor triggered! ({0}/{1})',
    allSprinklersLit:     'System activated! Ring! 🔔',

    mission10:            'Steal the register and escape!',
    registerHint:         'Hold to steal the register!',
    registerStolen:       'Got it! Run to the exit!',
    exitHint:             'Run! Get out of here!',

    lucaAppears:          'Luca: "Marco, you are the school legend now!"',
  };

  var it = {
    rotateHtml:           'RUOTA IL DISPOSITIVO',

    keyMove:              'Muovi',
    keyAction:            'Azione',
    keyPause:             'Pausa',
    keyHome:              'Home',
    levelLabel:           'Lvl',

    tapToStart:           '[ TOCCA PER INIZIARE ]',
    reloadLose:           '[ TOCCA PER RIPROVARE ]',
    reloadNext:           '[ TOCCA PER IL LIVELLO SUCCESSIVO ]',
    reloadWin:            '[ TOCCA PER GIOCARE ANCORA ]',
    tapForTitle:          '[ TOCCA PER TORNARE ALLA HOME ]',
    tapContinue:          '[ TOCCA PER CONTINUARE ]',

    missionLabel:         '— LIVELLO {0} —',
    levelComplete:        '— LIVELLO COMPLETATO! —',
    gameoverTitle:        '— ESPULSO! —',
    winTitle:             '— LEGGENDA DELLA SCUOLA! —',
    
    scoreLabel:           'PUNTEGGIO: ',
    bestLabel:            'MIGLIOR',
    levelReached:         'LIVELLO {0} RAGGIUNTO',

    hey:                  'EHI!!',
    timesUp:              'TEMPO SCADUTO!',
    caughtBy:             '{0} ti ha preso!',
    ringMsg:              'Livello completato!',

    pauseTitle:           '— PAUSA —',
    btnResume:            'RIPRENDI',
    homeConfirm:          'TORNARE ALLA HOME?',
    gameoverConfirm:      'VUOI RIGIOCARE?',
    btnYes:               'SI',
    btnNo:                'NO',

    storyTitle:           '— 1987 —',
    storyText:            "Luca sfida Marco a fare una serie di marachelle per diventare la leggenda della scuola.|Marco ovviamente non si tira indietro!",

    mission1:             'Imbratta tutte le lavagne!',
    getCloser:            'Imbratta la lavagna!',
    boardTagged:          'Lavagna imbrattata! ({0}/{1})',
    allBoards:            'Tutte imbrattate! Suona! 🔔',

    mission2:             'Ruba tutte le cartelle!',
    bagHint:              'Tieni premuto per rubare la cartella!',
    bagCollected:         'Cartella rubata!',
    bagStolen:            'Cartella rubata! ({0}/{1})',
    allBagsStolen:        'Tutte rubate! Suona! 🔔',

    mission3:             'Distruggi tutti i distributori!',
    machineHint:          'Tieni premuto per distruggerlo!',
    machineBroken:        'Distributore distrutto! ({0}/{1})',
    allMachines:          'Tutti distrutti! Suona! 🔔',

    mission4:             'Sgonfia il pallone in palestra!',
    deflateHint:          'Tieni premuto per sgonfiare!',
    ballProgress:         'Pallone Sgonfiato! ({0}/{1})',
    ballReinflated:       'Pallone rigonfiato! Sgonfialo!',
    ballDeflated:         'Tutti sgonfiati! Suona! 🔔',
    
    mission5:             'Lancia le cartacce agli alunni in classe!',
    throwHint:            'Premi per lanciare la cartaccia!',
    studentHit:           'Alunno Colpito! ({0}/{1})',
    allStudentsDisturbed: 'Tutti colpiti! Suona! 🔔',
    
    mission6:             'Fai cadere i libri in presidenza!',
    bookDropHint:         'Tieni premuto per fa cadere il libro!',
    bookProgress:         'Libro Caduto! ({0}/{1})',
    bookReset:            'Rimesso a posto! Rifallo!',
    bookDropped:          'Tutti caduti! Suona! 🔔',

    mission7:             'Allaga il bagno!',
    sinkHint:             'Tieni premuto per aprire il rubinetto!',
    sinkProgress:         'Bagno allagato! ({0}/{1})',
    sinkReady:            'Apri ancora!',
    sinkFlooded:          'Bagno Allagato! Suona! 🔔',
    
    mission8:             'Fai esplodere tutti i secchi!',
    binHint:              'Premi per inserire il petardo!',
    binLit:               'Miccia accesa! Scappa! 🧨',
    binExploded:          'BOOM! ({0}/{1})',
    allBinsExploded:      'Tutti esplosi! Suona! 🔔',
    binBlastHit:          'Troppo vicino all\'esplosione! ',
    
    mission9:             'Attiva l\'impianto antincendio!',
    sprinklerHint:        'Tieni premuto per attivare il sensore!',
    sprinklerLit:         'Sensore attivato! ({0}/{1})',
    allSprinklersLit:     'Impianto attivato! Suona! 🔔',
    
    mission10:            'Ruba il registro e scappa!',
    registerHint:         'Tieni premuto per rubare il registro!',
    registerStolen:       'Preso! Corri all\'uscita!',
    exitHint:             'Corri! Esci di qui!',

    lucaAppears:          'Luca: "Marco, ora sei tu la leggenda della Scuola!"',
  };

  window.STRINGS = lang === 'it' ? it : en;

  var pt = document.getElementById('portrait-text');
  if (pt) pt.textContent = STRINGS.rotateHtml;

})();
