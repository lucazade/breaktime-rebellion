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
    tapForTitle:          '[ TAP FOR TITLE SCREEN ]',
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
    caughtBy:             '{0} got you! -300',
    goBell:               'Ring the bell!',
    ringMsg:              'Level done! +1000!',

    pauseTitle:           '— PAUSE —',
    btnResume:            'RESUME',
    homeConfirm:          'GO TO HOME?',
    btnYes:               'YES',
    btnNo:                'NO',

    storyTitle:           '— 1987 —',
    storyText:            "Luca dares Marco to pull off a string of pranks to become the school legend.|Marco never backs down from a dare.",

    mission1:             'Tag all boards!',
    getCloser:            'Tag the board!',
    boardTagged:          'Board tagged! ({0}/{1})',
    allBoards:            'All tagged! Ring! 🔔',

    mission2:             "Steal all classmates' bags!",
    bagHint:              'Get closer to steal!',
    bagCollected:         'Bag stolen!',
    bagStolen:            'Bag stolen! ({0}/{1})',
    allBagsStolen:        'All stolen! Ring! 🔔',

    mission3:             'Smash all vending machines!',
    machineHint:          'Hold action to smash!',
    machineBroken:        'Smashed! ({0}/{1})',
    allMachines:          'All smashed! Ring! 🔔',

    mission4:             'Deflate the ball in the gym!',
    deflateHint:          'Hold action to deflate!',
    ballProgress:         'Deflated! ({0}/{1})',
    ballReinflated:       'Ball back! Deflate again!',
    ballDeflated:         'Deflated! Ring! 🔔',

    mission5:             'Throw paper at students in class!',
    throwHint:            'Press to throw the paper!',
    studentHit:           'Hit! ({0}/{1})',
    allStudentsDisturbed: 'All disturbed! Ring! 🔔',

    mission6:             'Drop the books!',
    bookDropHint:         'Hold: drop a book!',
    bookProgress:         'Dropped! ({0}/{1})',
    bookReset:            'Back! Knock again!',
    bookDropped:          'Dropped! Ring! 🔔',

    mission7:             'Flood the bathroom!',
    sinkHint:             'Hold: open the tap!',
    sinkProgress:         'Poured! ({0}/{1})',
    sinkReady:            'Tap ready! Do it again!',
    sinkFlooded:          'Flooded! Ring! 🔔',

    mission8:             'Plant firecrackers in all the bins!',
    binHint:              'Press action to plant the firecracker!',
    binLit:               'Fuse lit! Run! 🧨',
    binExploded:          'BOOM! ({0}/{1})',
    allBinsExploded:      'BOOM! All done! Ring! 🔔',
    binBlastHit:          'Too close to the explosion! ',

    mission9:             'Trigger all the fire sprinklers!',
    sprinklerHint:        'Hold action to use the lighter!',
    sprinklerLit:         'Sprinkler triggered! ({0}/{1})',
    allSprinklersLit:     'Fire alarm! Ring! 🔔',
    sprinklerLit:         'Triggered! ({0}/{1})',

    mission10:            'Steal the register and escape!',
    registerHint:         'Hold action to steal the register!',
    registerStolen:       'Got it! Now run to the exit!',
    exitHint:             'Run! Get out of here!',

    lucaAppears:          'Luca: "LEGENDARY! See you next year... if they let us back in."',
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
    goBell:               'Suona la campanella',
    ringMsg:              'Livello completato!',

    pauseTitle:           '— PAUSA —',
    btnResume:            'RIPRENDI',
    homeConfirm:          'TORNARE ALLA HOME?',
    btnYes:               'SI',
    btnNo:                'NO',

    storyTitle:           '— 1987 —',
    storyText:            "Luca sfida Marco a fare una serie di marachelle per diventare la leggenda della scuola.|Marco ovviamente non si tira indietro!",

    mission1:             'Imbratta tutte le lavagne!',
    getCloser:            'Imbratta la lavagna!',
    boardTagged:          'Lavagna imbrattata! ({0}/{1})',
    allBoards:            'Tutte imbrattate! Suona! 🔔',

    mission2:             'Ruba tutte le cartelle!',
    bagHint:              'Avvicinati per rubare la cartella!',
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
    
    mission8:             'Inserisci petardi in tutti i secchi!',
    binHint:              'Premi per inserire il petardo!',
    binLit:               'Miccia accesa! Scappa! 🧨',
    binExploded:          'BOOM! ({0}/{1})',
    allBinsExploded:      'BOOM! Tutti ok! Suona! 🔔',
    binBlastHit:          'Troppo vicino all\'esplosione! ',
    
    mission9:             'Attiva tutti gli sprinkler antincendio!',
    sprinklerHint:        'Tieni premuto per usare l\'accendino!',
    sprinklerLit:         'Sprinkler attivato! ({0}/{1})',
    allSprinklersLit:     'Allarme! Suona! 🔔',
    sprinklerLit:         'Attivato! ({0}/{1})',
    
    mission10:            'Ruba il registro e scappa!',
    registerHint:         'Tieni premuto per rubare il registro!',
    registerStolen:       'Preso! Corri all\'uscita!',
    exitHint:             'Corri! Esci di qui!',

    lucaAppears:          'Luca: "Marco, ora sei tu la leggenda della Scuola!"',
  };

  window.STRINGS = lang === 'it' ? it : en;

  var pm = document.getElementById('portrait-msg');
  if (pm) pm.textContent = STRINGS.rotateHtml;
  var go = document.querySelector('.go');
  if (go) go.textContent = STRINGS.tapToStart;

  // Localise pause and home-confirm overlays
  var _ids = {
    'pause-title':    'pauseTitle',
    'btn-resume':     'btnResume',
    'home-confirm-title': 'homeConfirm',
    'btn-home-yes':   'btnYes',
    'btn-home-no':    'btnNo',
  };
  Object.keys(_ids).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = STRINGS[_ids[id]];
  });
})();
