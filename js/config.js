// ═══════════════════════════════════════════════════════════
//  CONFIG — assets, audio and debug flags only.
//  Timers, shake times and NPC lists live in js/levels.js.
//  Layout, palette and scene structure are in js/layout.js.
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  images: {
    background:   'assets/pics/bg-640.png',    // 640×400 — mobile (2x canvas)
    backgroundHd: 'assets/pics/bg-1600.png',   // 1586×992 — desktop (4x canvas)
    logo:         'assets/pics/logo-640.png',  // 640×350 — mobile (2x canvas)
    logoHd:       'assets/pics/logo-1600.png', // 1697×927 — desktop (4x canvas)
  },
  audio: {
    musicVolume: 0.5,
    sfxVolume:   0.8,
    music:       'assets/audio/music/music1.mp3',
    introMusic:  'assets/audio/music/intro.mp3',
    bossMusic:   'assets/audio/music/boss.wav',
    sfx: {
      win:       'assets/audio/music/win.mp3',
      gameover:  'assets/audio/music/gameover.mp3',
      spray:     'assets/audio/sfx/spray.mp3',
      bell:      'assets/audio/sfx/bell.mp3',
      caught:    'assets/audio/sfx/caught.mp3',
      bag:       'assets/audio/sfx/bag.mp3',
      explosion: 'assets/audio/sfx/explosion.wav',
      machine:   'assets/audio/sfx/machine.mp3',
      deflate:   'assets/audio/sfx/bag.mp3',
      book:      'assets/audio/sfx/bag.mp3',
      sink:      'assets/audio/sfx/bag.mp3',
      register:  'assets/audio/sfx/bag.mp3',
      sprinkler: 'assets/audio/sfx/bag.mp3',
    },
  },
  debug: {
    lang:             'auto', // 'auto' = navigator.language | 'it' | 'en'
    showTapToStart:   true,
    showLegend:       false,
    simulateMobile:   false,
    unlockAllLevels:  false,
    godMode:          false,
  },
};

if (CONFIG.debug.simulateMobile) document.body.classList.add('simulate-mobile');
