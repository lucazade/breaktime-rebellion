// ═══════════════════════════════════════════════════════════
//  CONFIG — assets, audio, timer and debug flags
//  Layout, palette and scene structure are in js/layout.js
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  images: {
    background: 'assets/bg-new.png',
  },
  audio: {
    musicVolume: 0.5,
    sfxVolume:   0.8,
    music: 'assets/audio/music.mp3',
    sfx: {
      spray:    'assets/audio/spray.mp3',
      bell:     'assets/audio/bell.mp3',
      caught:   'assets/audio/caught.mp3',
      bag:      'assets/audio/bag.mp3',
      win:      'assets/audio/win.mp3',
      gameover: 'assets/audio/gameover.mp3',
    },
  },
  levelTimer: 60,  // default seconds per level (0 = disabled); override with lv.timer
  shakeTime:  150, // frames to shake a vending machine (≈2.5s at 60fps)
  debug: {
    disableJanitors:  false,
    showLevelChooser: true,
  },
};
