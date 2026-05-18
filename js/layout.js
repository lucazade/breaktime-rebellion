// ═══════════════════════════════════════════════════════════
//  LAYOUT — game world dimensions, palette, and scene structure
//  Edit here to change the look of the school building.
// ═══════════════════════════════════════════════════════════

CONFIG.colors = {
  black:'#000000', white:'#FFFFFF',
  blue:'#352879', lblue:'#6C5EB5',
  red:'#68372B', pink:'#9A6759',
  green:'#588D43', lgreen:'#9AD284',
  brown:'#433900',
  yellow:'#B8C76F', gold:'#FFD700',
  dgray:'#444444', mgray:'#6C6C6C', lgray:'#959595',
  chalk:'#D8E8D0', chalkbg:'#1A4A1A',
  cyan:'#70A4B2',
  desk:'#2C1800', desklt:'#4E2A00',
  bagbody:'#4A3D8F', bagborder:'#2A1F5E',
  bell:'#DAA520',
  redprof:'#c3200e', greenprof:'#109f06', grayprof:'#171717', whiteprof:'#dcdcdc', cyanprof:'#0757d7',
};

CONFIG.layout = {
  W: 320, H: 200,
  PW: 8, PH: 16,
  GY: 185, MY: 127, TY: 70,
  BW: 22, BH: 14,
  walkOffset: 6,
  wallLeft: 10, wallRight: 10, // #78 — margini muro sx/dx (pixel logici)
};

// Layout shortcut constants — used throughout all modules
const W = CONFIG.layout.W, H = CONFIG.layout.H;
const PW = CONFIG.layout.PW, PH = CONFIG.layout.PH;
const GY = CONFIG.layout.GY, MY = CONFIG.layout.MY, TY = CONFIG.layout.TY;
const BW = CONFIG.layout.BW, BH = CONFIG.layout.BH;
const walkOffset = CONFIG.layout.walkOffset;

// ── Visual config — edit here to adjust layout, dashed borders and canvas banners ─
// All canvas coords are in logical 320×200 space (ctx.scale 2×).
CONFIG.vis = {

  // Shared scene — stairs, boards, desks, bell and player start are the same in every level.
  // Physical elements fixed in bg.png; only mechanics and NPCs change per level.
  shared: {
    playerStart: { x: 18, y: GY - PH - walkOffset },

    // fdTop: px above the walking surface where the sprite starts to appear
    // fdBot: px below the walking surface where the sprite disappears
    stairs: [
      {x1:90,  y1:GY-walkOffset, x2:37,  y2:MY-walkOffset, fdTop:4, fdBot:12},  // GY→MY sx
      {x1:232, y1:GY-walkOffset, x2:285, y2:MY-walkOffset, fdTop:4, fdBot:12},  // GY→MY dx
      {x1:92,  y1:MY-walkOffset, x2:35,  y2:TY-walkOffset, fdTop:4, fdBot:12},  // MY→TY sx
      {x1:232, y1:MY-walkOffset, x2:285, y2:TY-walkOffset, fdTop:4, fdBot:12},  // MY→TY dx
    ],

    boards: [
      {x:130, y:GY-44},
      {x:130, y:MY-43},
      {x:72,  y:TY-41}, {x:130, y:TY-41},
    ],

    desks: [
      {x:155, y:GY-22}, {x:179, y:GY-22},
      {x:155, y:MY-22}, {x:179, y:MY-22},
      {x:62,  y:TY-20}, {x:85,  y:TY-20}, {x:158, y:TY-20}, {x:182, y:TY-20},
    ],

    bell: { x: 7, y: GY - 49 },
  },

  // Proximity dashed borders — { x, y, w, h } offset from object's top-left (bx, by)
  dashed: {
    gymBall:    { x:-2, y:-2,  w:13, h:13 },
    bookcase:   { x:0,  y:-8,  w:28, h:46 },
    sprinklers: { x:-2, y:-4,  w:12, h:9  },
    bins:       { x:-2, y:-16, w:14, h:18 },
    sink:       { x:-2, y:-11, w:16, h:13 },
    bags:       { x:-1, y:-1,  w:16, h:12 },
    machines:   { x:-2, y:-2,  w:14, h:22 },
    register:   { x:-2, y:-4,  w:14, h:18 },
    exitDoor:   { x:-2, y:-14, w:14, h:30 },
  },

  // Banner gameover — panH calcolato: padTop+stepTitle+stepLevel+stepScore+stepConfirm+btnH+padBottom
  gameover: {
    panY: 44, panW: 260,
    padTop:      12,  // spazio dal bordo superiore al primo testo
    stepTitle:   18,  // avanzamento dopo "ESPULSO!"
    stepLevel:   12,  // avanzamento dopo livello raggiunto
    stepScore:   20,  // avanzamento dopo punteggio
    stepConfirm: 16,  // avanzamento dopo "VUOI RIGIOCARE?" → top pulsanti
    btnH:        14,
    padBottom:   12,  // spazio dal fondo pulsanti al bordo inferiore
    siOx: 30, siW: 70,   // SI: bx+siOx, larghezza siW
    noOx: 160, noW: 70,  // NO: bx+noOx, larghezza noW
  },

  // Banner livello superato — panH calcolato: padTop+stepTitle+stepScore+tapH+padBottom
  levelComplete: {
    panY: 64, panW: 260,
    padTop:    11,  // spazio dal bordo superiore al primo testo
    stepTitle: 20,  // avanzamento dopo titolo (h=10 + spacing=10)
    stepScore: 22,  // avanzamento dopo punteggio (h=8 + spacing=14)
    tapH:       8,  // altezza tapContinue
    padBottom: 11,  // spazio dal fondo tapContinue al bordo inferiore
  },

  // Banner fine gioco (L10) — panH calcolato: padTop+stepTitle+stepScore+stepBest+tapH+padBottom
  gameWin: {
    panY: 44, panW: 260,
    padTop:    23,  // spazio dal bordo superiore al primo testo
    stepTitle: 22,  // avanzamento dopo titolo win (h=12 + spacing=10)
    stepScore: 12,  // avanzamento dopo punteggio (h=8 + spacing=4)
    stepBest:  16,  // avanzamento dopo riga miglior punteggio (h=8 + spacing=8)
    tapH:       8,  // altezza tapForTitle
    padBottom: 23,  // spazio dal fondo tapForTitle al bordo inferiore
  },

  // Banner storia (L1) — panH fisso (contenuto dinamico); padBottom = margine target dal basso
  storyBanner: {
    panX: 20, panY: 22, panW: 280, panH: 156, wrapWidth: 220,
    padTop:        16,  // spazio dal bordo superiore al titolo
    titleH:        10, titleSpacing: 10,
    lineH:          8, lineSpacing:   4,
    spacerH:       10,                    // spazio vuoto prima di tapContinue
    tapH:           8,
    padBottom:     16,  // margine target dal fondo tapContinue al bordo inferiore
  },

  // Banner missione — panH fisso (contenuto dinamico); padBottom = margine target dal basso
  missionBanner: {
    panY: 64, panW: 260, panH: 72, wrapWidth: 200,
    padTop:        14,  // spazio dal bordo superiore al titolo
    titleH:        10, titleSpacing: 8,
    lineH:          8, lineSpacing:  4,
    padBottom:     14,  // margine target dal fondo ultima riga al bordo inferiore
  },
};

// Alias per retrocompatibilità con levels.js
var SHARED_LAYOUT = CONFIG.vis.shared;
