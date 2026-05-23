// i18n — default language: English; auto-override based on device locale
// Only plain strings here — formatting with {0}, {1}… placeholders done in game.js via fmt()
(function() {
  var lang = (function() {
    if (CONFIG.debug.lang && CONFIG.debug.lang !== 'auto') return CONFIG.debug.lang;
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) { localStorage.setItem('btr_lang', urlLang); return urlLang.slice(0, 2); }
    var stored = localStorage.getItem('btr_lang');
    if (stored) return stored.slice(0, 2);
    return (navigator.language || 'en').startsWith('it') ? 'it' : 'en';
  })();
  document.documentElement.lang = lang;

  var en = {
    rotateHtml:           'ROTATE DEVICE',

    keyMove:              'Move',
    keyAction:            'Action',
    keyPause:             'Pause',
    keyHome:              'Home',
    keyCredits:           'Credits',
    levelLabel:           'Lvl',

    audioFull: 'music', audioSfx: 'sfx', audioMute: 'mute',
    difficulty_easy: 'EASY', difficulty_medium: 'MED', difficulty_hard: 'HARD',
    tapToStart:           'TAP TO START',
    reloadLose:           'TAP TO TRY AGAIN',
    reloadNext:           'TAP FOR NEXT LEVEL',
    reloadWin:            'TAP TO PLAY AGAIN',
    tapForTitle:          'TAP TO GO HOME',
    tapContinue:          'TAP TO CONTINUE',

    missionLabel:         '— LEVEL {0} —',
    levelComplete:        '— LEVEL COMPLETE! —',
    gameoverTitle:        '— EXPELLED! —',
    winTitle:             '— SCHOOL LEGEND! —',

    scoreLabel:           'TOTAL SCORE: ',
    bestLabel:            'BEST',
    timeBonusLabel:       '+ TIME BONUS: ',
    livesBonusLabel:      '+ LIVES BONUS: ',
    levelReached:         'LEVEL {0} REACHED',

    hey:                  'HEY!!',
    timesUp:              "TIME'S UP!",
    caughtBy:             '{0} got you!',

    pauseTitle:           '— PAUSE —',
    btnResume:            'RESUME',
    homeConfirm:          'GO TO HOME?',
    gameoverConfirm:      'PLAY AGAIN?',
    btnYes:               'YES',
    btnNo:                'NO',

    storyTitle:           '— 1987 —',
    storyText:            "Luca challenges Marco to a series of school rebellions to become a school legend. Marco, of course, doesn't back down!",

    mission1:             'Vandalize all boards and then ring the bell!',
    getCloser:            'Vandalize the board!',
    boardTagged:          'Board vandalized! ({0}/{1})',
    allBoards:            'All vandalized! Ring the bell!',

    mission2:             "Steal all classmates' bags and then ring the bell!",
    bagStolen:            'Bag stolen! ({0}/{1})',
    allBagsStolen:        'All stolen! Ring the bell!',

    mission3:             'Smash all vending machines and then ring the bell!',
    machineHint:          'Hold to smash it!',
    machineBroken:        'Machine smashed! ({0}/{1})',
    allMachines:          'All smashed! Ring the bell!',

    mission4:             'Deflate the ball in the gym and then ring the bell!',
    deflateHint:          'Hold to deflate!',
    ballProgress:         'Ball deflated! ({0}/{1})',
    ballReinflated:       'Reinflated! Deflate again!',
    ballDeflated:         'All deflated! Ring the bell!',

    mission5:             'Throw paper at students in class and then ring the bell!',
    throwHint:            'Press to throw!',
    studentHit:           'Student hit! ({0}/{1})',
    allStudentsDisturbed: 'All hit! Ring the bell!',

    mission6:             'Drop the books in the office and then ring the bell!',
    bookDropHint:         'Hold to drop the book!',
    bookProgress:         'Book dropped! ({0}/{1})',
    bookReset:            'Put back! Do it again!',
    bookDropped:          'All dropped! Ring the bell!',

    mission7:             'Flood the bathroom and then ring the bell!',
    sinkHint:             'Hold to open the tap!',
    sinkProgress:         'Flooded! ({0}/{1})',
    sinkReady:            'Open again!',
    sinkFlooded:          'Bathroom flooded! Ring the bell!',

    mission8:             'Blow up all the bins and then ring the bell!',
    binHint:              'Press to plant the firecracker!',
    binLit:               'Fuse lit! Run!',
    binExploded:          'BOOM! ({0}/{1})',
    allBinsExploded:      'All blown up! Ring the bell!',
    binBlastHit:          'Too close to the explosion! ',

    mission9:             'Trigger the fire alarm system and then ring the bell!',
    sprinklerHint:        'Hold to activate the sensor!',
    sprinklerLit:         'Sensor triggered! ({0}/{1})',
    allSprinklersLit:     'System activated! Ring the bell!',

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
    keyCredits:           'Crediti',
    levelLabel:           'Lvl',

    audioFull: 'musica', audioSfx: 'sfx', audioMute: 'muto',
    difficulty_easy: 'EASY', difficulty_medium: 'MED', difficulty_hard: 'HARD',
    tapToStart:           'TOCCA PER INIZIARE',
    reloadLose:           'TOCCA PER RIPROVARE',
    reloadNext:           'TOCCA PER IL LIVELLO SUCCESSIVO',
    reloadWin:            'TOCCA PER GIOCARE ANCORA',
    tapForTitle:          'TOCCA PER TORNARE ALLA HOME',
    tapContinue:          'TOCCA PER CONTINUARE',

    missionLabel:         '— LIVELLO {0} —',
    levelComplete:        '— LIVELLO COMPLETATO! —',
    gameoverTitle:        '— ESPULSO! —',
    winTitle:             '— LEGGENDA DELLA SCUOLA! —',
    
    scoreLabel:           'PUNTEGGIO TOTALE: ',
    bestLabel:            'MIGLIOR',
    timeBonusLabel:       '+ BONUS TEMPO: ',
    livesBonusLabel:      '+ BONUS VITE: ',
    levelReached:         'LIVELLO {0} RAGGIUNTO',

    hey:                  'EHI!!',
    timesUp:              'TEMPO SCADUTO!',
    caughtBy:             '{0} ti ha preso!',

    pauseTitle:           '— PAUSA —',
    btnResume:            'RIPRENDI',
    homeConfirm:          'TORNARE ALLA HOME?',
    gameoverConfirm:      'VUOI RIGIOCARE?',
    btnYes:               'SI',
    btnNo:                'NO',

    storyTitle:           '— 1987 —',
    storyText:            "Luca sfida Marco a fare una serie di azioni di ribellione scolastica per diventare la leggenda della scuola.|Marco ovviamente non si tira indietro!",

    mission1:             'Imbratta tutte le lavagne e poi suona la campanella!',
    getCloser:            'Imbratta la lavagna!',
    boardTagged:          'Lavagna imbrattata! ({0}/{1})',
    allBoards:            'Tutte imbrattate! Suona la campanella!',

    mission2:             'Ruba tutte le cartelle e poi suona la campanella!',
    bagStolen:            'Cartella rubata! ({0}/{1})',
    allBagsStolen:        'Tutte rubate! Suona la campanella!',

    mission3:             'Distruggi tutti i distributori e poi suona la campanella!',
    machineHint:          'Tieni premuto per distruggerlo!',
    machineBroken:        'Distributore distrutto! ({0}/{1})',
    allMachines:          'Tutti distrutti! Suona la campanella!',

    mission4:             'Sgonfia il pallone in palestra e poi suona la campanella!',
    deflateHint:          'Tieni premuto per sgonfiare!',
    ballProgress:         'Pallone Sgonfiato! ({0}/{1})',
    ballReinflated:       'Pallone rigonfiato! Sgonfialo!',
    ballDeflated:         'Tutti sgonfiati! Suona la campanella!',
    
    mission5:             'Lancia le cartacce agli alunni in classe e poi suona la campanella!',
    throwHint:            'Premi per lanciare la cartaccia!',
    studentHit:           'Alunno Colpito! ({0}/{1})',
    allStudentsDisturbed: 'Tutti colpiti! Suona la campanella!',
    
    mission6:             'Fai cadere i libri in presidenza e poi suona la campanella!',
    bookDropHint:         'Tieni premuto per fa cadere il libro!',
    bookProgress:         'Libro Caduto! ({0}/{1})',
    bookReset:            'Rimesso a posto! Rifallo!',
    bookDropped:          'Tutti caduti! Suona la campanella!',

    mission7:             'Allaga il bagno e poi suona la campanella!',
    sinkHint:             'Tieni premuto per aprire il rubinetto!',
    sinkProgress:         'Bagno allagato! ({0}/{1})',
    sinkReady:            'Apri ancora!',
    sinkFlooded:          'Bagno Allagato! Suona la campanella!',
    
    mission8:             'Fai esplodere tutti i secchi e poi suona la campanella!',
    binHint:              'Premi per inserire il petardo!',
    binLit:               'Miccia accesa! Scappa!',
    binExploded:          'BOOM! ({0}/{1})',
    allBinsExploded:      'Tutti esplosi! Suona la campanella!',
    binBlastHit:          'Troppo vicino all\'esplosione! ',
    
    mission9:             'Attiva l\'impianto antincendio e poi suona la campanella!',
    sprinklerHint:        'Tieni premuto per attivare il sensore!',
    sprinklerLit:         'Sensore attivato! ({0}/{1})',
    allSprinklersLit:     'Impianto attivato! Suona la campanella!',
    
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
