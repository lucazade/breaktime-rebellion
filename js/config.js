// ═══════════════════════════════════════════════════════════
//  CONFIG — assets, audio, display and debug flags.
//  Timers, shake times and NPC lists live in js/levels.js.
//  Building geometry and scene structure are in scene.js; UI config in vis-ui.js; rendering in draw-*.js.
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  images: {
    background:      'assets/pics/bg/bg-1600-day.png',   // L1-L9 (1600×1000)
    backgroundNight: 'assets/pics/bg/bg-1600-night.png', // L10 night (1600×1000)
    logo:            'assets/pics/logo/logo-1600.png',   // title screen logo
  },
  audio: {
    musicVolume: 0.5,
    sfxVolume:   0.8,
    music:       'assets/audio/music/music1.mp3',
    introMusic:  'assets/audio/music/intro.mp3',
    bossMusic:   'assets/audio/music/boss.mp3',
    sfx: {
      win:       'assets/audio/music/win.mp3',
      gameover:  'assets/audio/music/gameover.mp3',
      caught:    'assets/audio/sfx/caught.mp3',
      bell:      'assets/audio/sfx/bell.mp3',
      spray:     'assets/audio/sfx/spray.ogg',
      bag:       'assets/audio/sfx/took.mp3',
      machine:   'assets/audio/sfx/machine.ogg',
      deflate:   'assets/audio/sfx/deflate.ogg',
      hit:       'assets/audio/sfx/hit.ogg',
      book:      'assets/audio/sfx/book.ogg',
      sink:      'assets/audio/sfx/sink.ogg',
      fuse:      'assets/audio/sfx/fuse.mp3',
      explosion: 'assets/audio/sfx/explosion.ogg',
      sprinkler: 'assets/audio/sfx/spray.ogg',
      register:  'assets/audio/sfx/took.mp3',
      door:      'assets/audio/sfx/door.ogg',
      mechCompleted: 'assets/audio/sfx/completed.ogg',
    },
  },
  display: {
    fontFamily: '"Press Start 2P"',  // canvas font — used everywhere via FF shortcut + --btr-font-family CSS var
  },
  debug: {
    unlockAllLevels: false,
    godMode:         false,
  },
};

// Global font shortcut — available to all draw-* files from the very first script
var FF = CONFIG.display.fontFamily;

