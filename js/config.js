// ═══════════════════════════════════════════════════════════
//  CONFIG — modifica qui layout, immagini, audio
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  layout: {
    W: 320, H: 200,
    PW: 8, PH: 16,
    GY: 175, MY: 110, TY: 45,
    BW: 22, BH: 14,
  },
  images: {
    logo: 'assets/logo.png',
  },
  audio: {
    musicVolume: 0.5,
    sfxVolume:   0.8,
  },
  levelTimer: 60,  // secondi per completare il livello (0 = disabilitato)
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
    desk:'#5C3D11', desklt:'#8B5E2A',
    bell:'#DAA520',
  },
};

const W = CONFIG.layout.W, H = CONFIG.layout.H;
const PW = CONFIG.layout.PW, PH = CONFIG.layout.PH;
const GY = CONFIG.layout.GY, MY = CONFIG.layout.MY, TY = CONFIG.layout.TY;
const BW = CONFIG.layout.BW, BH = CONFIG.layout.BH;
