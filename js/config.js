// ═══════════════════════════════════════════════════════════
//  CONFIG — edit layout, images, audio here
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  layout: {
    W: 320, H: 200,
    PW: 8, PH: 16,
    GY: 188, MY: 123, TY: 58,
    BW: 22, BH: 14,
    FD: 12,  // floor depth — visible top-face height (oblique cross-section effect)
  },
  images: {
    logo: 'assets/logo.png',
    background: 'assets/bg.png',  // optional hand-drawn background (640×400px)
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
  levelTimer: 60,  // seconds to complete the level (0 = disabled)
  debug: {
    disableMusic:    false,  // set true to skip background music during testing
    disableJanitors: false,  // set true to remove janitors during testing
  },
  colors: {
    black:'#000000', white:'#FFFFFF',
    blue:'#352879', lblue:'#6C5EB5',
    red:'#68372B', pink:'#9A6759',
    green:'#588D43', lgreen:'#9AD284',
    brown:'#433900', orange:'#6F4F25',
    yellow:'#B8C76F', gold:'#FFD700',
    dgray:'#444444', mgray:'#6C6C6C', lgray:'#959595',
    floor:'#6B4C11', floorlt:'#A07040',
    chalk:'#D8E8D0', chalkbg:'#1A4A1A',
    purple:'#6F3D86', cyan:'#70A4B2',
    desk:'#2C1800', desklt:'#4E2A00',
    bagbody:'#4A3D8F', bagborder:'#2A1F5E',
    bell:'#DAA520',
    room1:'#2e5048', room2:'#4a2e50', room3:'#50420e', // room wall colors (teal/purple/amber)
  },
};

// Level definitions — edit here to change layout, enemies, objects per level.
// L = layout constants, C = color palette (both already resolved when this runs).
CONFIG.levels = (function() {
  var L = CONFIG.layout;
  var C = CONFIG.colors;
  return [
    // ── LEVEL 1 — Tag all boards, ring the bell ──────────────────────────────
    {
      timer: 60,
      playerStart: { x: 40, y: L.GY - L.PH },

      stairs: [
        {x1:80,  y1:L.GY, x2:30,  y2:L.MY},  // GY→MY left
        {x1:240, y1:L.GY, x2:290, y2:L.MY},  // GY→MY right
        {x1:60,  y1:L.MY, x2:110, y2:L.TY},  // MY→TY left
        {x1:210, y1:L.MY, x2:260, y2:L.TY},  // MY→TY right
      ],

      boards: [
        {x:14,  y:L.TY-34}, {x:142, y:L.TY-34}, {x:274, y:L.TY-34},
        {x:14,  y:L.MY-34}, {x:142, y:L.MY-34}, {x:274, y:L.MY-34},
      ],

      bags: [
        {x:130, y:L.GY-10},
        {x:184, y:L.MY-10},
        {x:136, y:L.TY-10},
      ],

      desks: [
        // GY floor — clear of stairs (x30-80, x240-290)
        {x:92,  y:L.GY-12}, {x:116, y:L.GY-12}, {x:140, y:L.GY-12},
        {x:168, y:L.GY-12}, {x:192, y:L.GY-12}, {x:216, y:L.GY-12},
        // MY floor — clear of stairs (x30, x60-110, x210-260)
        {x:120, y:L.MY-12}, {x:144, y:L.MY-12},
        {x:164, y:L.MY-12}, {x:184, y:L.MY-12},
        // TY floor — clear of stairs (x110, x260)
        {x:52,  y:L.TY-12}, {x:76,  y:L.TY-12},
        {x:168, y:L.TY-12}, {x:196, y:L.TY-12},
      ],

      bell: { x: 304, y: L.TY - 32 },

      teachers: [
        {x:200, y:L.GY-L.PH, dir:1,  minX:10, maxX:305, speed:0.55, color:C.red,   name:'Prof.Rossi', sight:90 },
        {x:80,  y:L.MY-L.PH, dir:-1, minX:10, maxX:305, speed:0.50, color:C.green, name:'Prof.Verdi', sight:80 },
        {x:230, y:L.TY-L.PH, dir:1,  minX:10, maxX:275, speed:0.60, color:C.mgray, name:'Prof.Neri',  sight:100},
      ],

      janitors: [
        {x:160, y:L.GY-L.PH, dir:1,  minX:128, maxX:192, speed:0.65, name:'Bidello'},
        {x:140, y:L.MY-L.PH, dir:-1, minX:120, maxX:164, speed:0.55, name:'Bidello'},
      ],
    },
  ];
})();

const W = CONFIG.layout.W, H = CONFIG.layout.H;
const PW = CONFIG.layout.PW, PH = CONFIG.layout.PH;
const GY = CONFIG.layout.GY, MY = CONFIG.layout.MY, TY = CONFIG.layout.TY;
const BW = CONFIG.layout.BW, BH = CONFIG.layout.BH;
const FD = CONFIG.layout.FD;
