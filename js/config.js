// ═══════════════════════════════════════════════════════════
//  CONFIG — assets, audio and debug flags only.
//  Timers, shake times and NPC lists live in js/levels.js.
//  Layout, palette and scene structure are in js/layout.js.
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  images: {
    background: 'assets/pics/bg.png',
  },
  charOutline:      true,
  charOutlineSize:  1.0,
  charOutlineColor: '#121212',
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
    showLevelChooser: true,
    showLangChooser:  true,
    simulateMobile:   false,
    godMode:          false, // Marco non muore mai
  },
};

if (CONFIG.debug.simulateMobile) {
  var _mobileCSS = [
    '#wrap{flex-direction:row!important;align-items:center!important;width:100vw!important;height:100dvh!important}',
    '#game-area{flex:0 0 auto!important;height:100dvh!important;max-height:100dvh!important;max-width:calc(100vw - 320px)!important;width:auto!important;margin:0!important;box-shadow:none!important}',
    '#game-area::before,#game-area::after{display:none!important}',
    '#panel-left,#panel-right{display:flex!important;flex:1!important;min-width:160px!important;height:100dvh;position:relative;overflow:hidden;border-top:2px solid #2a0055;border-bottom:2px solid #2a0055;background:radial-gradient(ellipse at 50% 108%,rgba(255,0,180,.42) 0%,transparent 52%),linear-gradient(180deg,#080015 0%,#12002e 55%,#080015 100%)}',
    '#panel-left{border-right:3px solid rgba(160,0,255,.7)!important}',
    '#panel-right{border-left:3px solid rgba(160,0,255,.7)!important}',
    '#panel-left #ctrl-joy{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);z-index:1}',
    '#panel-right #ctrl-action{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);z-index:1}',
    '#btn-info{display:flex!important}',
    '.panel-btn{display:flex!important}',
  ].join('');
  var _el = document.createElement('style');
  _el.textContent = _mobileCSS;
  document.head.appendChild(_el);
}
