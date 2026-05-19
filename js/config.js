// ═══════════════════════════════════════════════════════════
//  CONFIG — assets, audio and debug flags only.
//  Timers, shake times and NPC lists live in js/levels.js.
//  Layout, palette and scene structure are in js/layout.js.
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  images: {
    background: 'assets/pics/bg.png',
    logo:       'assets/pics/logo.png',
  },
  audio: {
    musicVolume: 0.5,
    sfxVolume:   0.8,
    music:       'assets/audio/music1.mp3',
    introMusic:  'assets/audio/intro.mp3',
    bossMusic:   'assets/audio/boss.wav',
    sfx: {
      spray:     'assets/audio/spray.mp3',
      bell:      'assets/audio/bell.mp3',
      caught:    'assets/audio/caught.mp3',
      bag:       'assets/audio/bag.mp3',
      win:       'assets/audio/win.mp3',
      gameover:  'assets/audio/gameover.mp3',
      explosion: 'assets/audio/explosion.wav',
      machine:   'assets/audio/bag.mp3',
      deflate:   'assets/audio/bag.mp3',
      book:      'assets/audio/bag.mp3',
      sink:      'assets/audio/bag.mp3',
      register:  'assets/audio/bag.mp3',
      sprinkler: 'assets/audio/bag.mp3',
    },
  },
  debug: {
    unlockAllLevels:  false,
    showLangChooser:  true,
    showLegend:       true,
    simulateMobile:   false,
    godMode:          false,
  },
};

if (CONFIG.debug.simulateMobile) document.body.classList.add('simulate-mobile');
