// ═══════════════════════════════════════════════════════════
//  CONFIG — assets, audio, display and debug flags.
//  Timers, shake times and NPC lists live in js/levels.js.
//  Building geometry, palette and scene structure are in js/gfx-building.js and js/gfx-*.js.
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  images: {
    background:        'assets/pics/bg-640-day.png',    // L1-L9 mobile (2x canvas)
    backgroundHd:      'assets/pics/bg-1600-day.png',  // L1-L9 desktop (4x canvas)
    backgroundNight:   'assets/pics/bg-640-night.png', // L10 mobile
    backgroundNightHd: 'assets/pics/bg-1600-night.png',// L10 desktop
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
      caught:    'assets/audio/sfx/caught.mp3',
      bell:      'assets/audio/sfx/bell.mp3',
      spray:     'assets/audio/sfx/spray.ogg',
      bag:       'assets/audio/sfx/bag.mp3',
      machine:   'assets/audio/sfx/machine.wav',
      deflate:   'assets/audio/sfx/deflate.ogg',
      hit:       'assets/audio/sfx/hit.ogg',
      book:      'assets/audio/sfx/book.ogg',
      sink:      'assets/audio/sfx/sink.ogg',
      fuse:      'assets/audio/sfx/fuse.mp3',
      explosion: 'assets/audio/sfx/explosion.wav',
      sprinkler: 'assets/audio/sfx/sprinkler.wav',
      register:  'assets/audio/sfx/register.wav',
      door:      'assets/audio/sfx/door.ogg',
    },
  },
  display: {
    desktopZoom:    2.0,   // desktop CSS zoom — 2.0 → canvas renders at 4× native (800px display height)
    showTapToStart: true,  // "TAP TO START" blink on title screen
    showLegend:     false, // keyboard legend row on title screen (desktop only)
    simulateMobile: false, // force mobile layout on desktop (for testing)
  },
  debug: {
    lang:           'auto', // 'auto' = navigator.language | 'it' | 'en'
    unlockAllLevels: false,
    godMode:         false,
  },
};

if (CONFIG.display.simulateMobile) document.body.classList.add('simulate-mobile');
