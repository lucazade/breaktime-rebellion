// ═══════════════════════════════════════════════════════════
//  LAYOUT — game world dimensions, palette, and scene structure
//  Edit here to change the look of the school building.
// ═══════════════════════════════════════════════════════════

// First section of CONFIG.vis: layout and colours (must come before the shortcut constants)
CONFIG.vis = {

  layout: {
    W: 320, H: 200,              // dimensioni canvas logiche (px)
    PW: 8, PH: 16,               // player width × height
    GY: 185, MY: 127, TY: 70,    // Y pavimento Ground / Middle / Top floor
    BW: 22, BH: 14,              // board (lavagna) width × height
    walkOffset: 6,               // px sopra la superficie dove cammina il personaggio
    wallLeft: 10, wallRight: 10, // #78 — margini muro sx/dx (pixel logici)
    desktopZoom: 2.0,            // desktop CSS display height = 400px × zoom (2.0 → 800px = 4x canvas native height, no upscaling)
  },

  colors: {
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
  },

};

// Shortcut constants — usati in tutti i moduli
const W = CONFIG.vis.layout.W, H = CONFIG.vis.layout.H;
const PW = CONFIG.vis.layout.PW, PH = CONFIG.vis.layout.PH;
const GY = CONFIG.vis.layout.GY, MY = CONFIG.vis.layout.MY, TY = CONFIG.vis.layout.TY;
const BW = CONFIG.vis.layout.BW, BH = CONFIG.vis.layout.BH;
const walkOffset = CONFIG.vis.layout.walkOffset;
const wallLeft = CONFIG.vis.layout.wallLeft, wallRight = CONFIG.vis.layout.wallRight;

// Rest of CONFIG.vis — uses the shortcut constants defined above
// All canvas coords are in logical 320×200 space (ctx.scale 2×).
Object.assign(CONFIG.vis, {

  fontFamily: '"Press Start 2P"',  // font used - alternatives: Press Start 2P or Silkscreen (both free on Google Fonts) — set as CSS variable for use in CSS too

  // ── Bezel — mobile side panels ────────────────────
  bezel: {
    panelInnerBorder:  'rgba(160,0,255,0.7)',
    btnHomeBorder:     'rgba(160,0,255,0.85)',
    btnPauseBorder:    'rgba(160,0,255,0.85)',
    btnInfoBorder:     'rgba(160,0,255,0.85)',
    btnHomeBg:         'rgba(10,0,24,1)',
    btnPauseBg:        'rgba(10,0,24,1)',
    btnInfoBg:         'rgba(0,0,0,0.45)',
    btnHomeBgPressed:  'rgba(160,0,255,0.28)',
    btnPauseBgPressed: 'rgba(160,0,255,0.28)',
    btnInfoBgPressed:  'rgba(160,0,255,0.28)',
    btnGlow:           '0 0 8px rgba(160,0,255,0.35)',
  },

  // Shared style for all dialog panels (banners, buttons)
  dialog: {
    panBg:       'rgba(0,0,40,0.90)',         // panel background (default)
    panBorder:   '#FFD700',                   // panel border colour
    panBorderW:  1,                             // panel border thickness
    panR:        4,                             // panel corner radius
    btnR:        2,                             // button corner radius
    btnColorYes: 'rgba(0,90,0,0.92)',         // positive button (YES / OK / RESUME)
    btnColorNo:  'rgba(90,0,0,0.92)',         // negative button (NO)
    btnStroke:   '#FFD700',                   // button border colour
  },

  // Title screen — logo + tap to start + level chooser + audio toggle + keyboard legend
  titleScreen: {
    // title background follows the body synthwave gradient
    logo:     { w: 300, borderW: 1, borderR: 5 }, // logo width; y computed (vertical centering); borderW=border thickness, borderR=corner clip radius
    tapToStart: { fontSize: 6, alignX: 'center', alignY: 'middle' }, // font and alignment in the controls bar (alignX: left|center|right; alignY: top|middle|bottom)
    controls: {
      fontSize: 8,
      gapY:     8,                    // gap between logo and controls row
      btnH:    10,                    // button clickable height
      boxR:     2,                    // button box corner radius
      btnColor: '#b0b0b0',          // enabled button colour (less saturated than white)
      prevX:   10, prevW: 14,         // ‹ level button
      nextX:   76, nextW: 14,         // › or lock button
      labelX:  50,                    // x centre of "LVL N" label
      audioRightX: 310, audioPadX: 6, // audio button: fixed right edge, width computed from longest label
    },
    legend: { fontSize: 4, gapY: 6 },  // keyboard legend (desktop only)
  },

  // Character sprites — outline and colour
  char: {
    outline:      true,         // enables outline around sprites
    outlineSize:  1.0,          // outline thickness (logical px)
    outlineColor: '#121212',  // outline colour
  },

  // HUD — strip in cima al canvas
  hud: {
    rowH:      8,                    // HUD strip height
    heartsX:   4,                    // x position of first heart
    heartSize:  0.5,                 // heart: 0.5 = 7×5px (font 6), 1 = 8×7px (font 8)
    iconScale:  0.5,                 // icon:  0.5 = 6×5px (font 6), 1 = 7×7px (font 8)
    msgFadeFrames: 20,               // frames for the msg↔HUD crossfade (20 ≈ 0.33s at 60fps)
    centerX:   160,                  // x centre for counter/message
    scoreX:    316,                  // right x for score
    timerH:    1,                    // timer bar height
    fontSize:  6,
    dotGap:    5,                    // gap between icon and counter text
    bgColor:   'rgba(0,0,0,0.55)',
    // Mechanic indicator colour per mechanic type
    dotColors: {
      boards:     '#588D43',
      bags:       '#4A3D8F',
      machines:   '#B8C76F',
      ball:       '#CC6600',
      students:   '#FFFFFF',
      books:      '#6B2200',
      sink:       '#70A4B2',
      bins:       '#B8C76F',
      sprinklers: '#70A4B2',
      register:   '#FFD700',
    },
  },

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

  // Story banner (L1) — panH computed: padTop+titleH+titleSpacing+lineBlock+spacerH+tapH+padBottom
  storyBanner: {
    panW: 280, wrapWidth: 220,  // panel width; wrapWidth = text wrap width
    fontTitle:      8,
    fontBody:       6,
    padTop:        14,          // space from top edge to title
    titleH:        10, titleSpacing: 10, // title height, spacing after title
    lineH:          9, lineSpacing:   4, // line height, spacing between lines
    spacerH:       10,          // blank space before tap label
    tapH:           8,          // tapContinue label height
    padBottom:     14,          // space from content bottom to panel edge
  },

  // Mission banner — panH computed: padTop+titleH+titleSpacing+lineBlock+padBottom
  missionBanner: {
    panW: 260, wrapWidth: 200,  // panel width; wrapWidth = text wrap width
    fontTitle:      8,
    fontBody:       6,
    padTop:        14,          // space from top edge to title
    titleH:        10, titleSpacing: 8, // title height, spacing after title
    lineH:          9, lineSpacing:  4, // line height, spacing between lines
    padBottom:     14,          // space from content bottom to panel edge
  },

  // Level complete banner — panH computed: padTop+stepTitle+stepScore+tapH+padBottom
  levelComplete: {
    panW: 260,       // panY and bx are centred automatically
    fontTitle:  8,
    fontBody:   6,
    padTop:    14,   // space from top edge to first text
    stepTitle: 18,   // advance after title (h=10 + spacing=10)
    stepScore: 15,   // advance after score (h=8 + spacing=14)
    tapH:       8,   // tapContinue label height
    padBottom:  11,  // space from tapContinue to panel edge
  },

  // Game win banner (L10) — panH computed: padTop+stepTitle+stepScore+stepBest+tapH+padBottom
  gameWin: {
    panW: 260,       // panY and bx are centred automatically
    fontTitle:  8,
    fontBody:   6,
    padTop:    14,   // space from top edge to first text
    stepTitle: 22,   // advance after win title (h=12 + spacing=10)
    stepScore: 12,   // advance after score (h=8 + spacing=4)
    stepBest:  18,   // advance after best score row (h=8 + spacing=8)
    tapH:       8,   // tapForTitle label height
    padBottom: 12,   // space from tapForTitle to panel edge
  },

  // Game over banner — panH computed: padTop+stepTitle+stepLevel+stepScore+stepConfirm+btnH+padBottom
  gameover: {
    panW: 260,       // panY and bx are centred automatically
    fontTitle:    8,
    fontBody:     6,
    fontBtn:      6,
    padTop:      12, // space from top edge to first text
    stepTitle:   18, // advance after "EXPELLED!"
    stepLevel:   12, // advance after level reached
    stepScore:   20, // advance after score
    stepConfirm: 16, // advance after "PLAY AGAIN?" → button tops
    btnH:        14,
    padBottom:   12, // space from button bottoms to panel edge
    siOx: 30, siW: 70,   // YES: bx+siOx, width siW
    noOx: 160, noW: 70,  // NO: bx+noOx, width noW
  },

  // Luca speech bubble (L10 level end) — bh computed: headerH + lineCount*lineH + gapTap + tapH + padBottom
  lucaFumetto: {
    bw:        190,  // bubble width
    fontTitle:   8,
    fontBody:    6,  // body text and tap label
    offsetX:    10,  // horizontal offset from Luca (PW+2)
    tailOffY:   14,  // vertical distance from tail to ly (by2 = ly - tailOffY - bh)
    headerH:    14,  // height of "Luca:" header row
    lineH:      10,  // height of each text line
    gapTap:      4,  // gap between text and tap label
    tapH:        8,  // tapContinue label height
    padBottom:   6,  // bottom margin
    tailW: 3, tailH: 5,  // speech bubble tail dimensions
  },

  // Pause overlay — panH computed: padTop+stepTitle+btnH+padBottom
  pauseOverlay: {
    panW: 200,       // panY and bx are centred automatically
    fontTitle:  8,
    fontBtn:    6,
    padTop:    14,   // space from top edge to title
    stepTitle: 22,   // advance after "— PAUSE —" (h=10 + spacing=12)
    btnH:      14,   // RESUME button height
    padBottom: 14,   // space from button bottom to panel edge
    resumeOx:  65, resumeW: 70,  // RESUME button: bx+resumeOx, width resumeW
  },

  // Home confirm overlay — panH computed: padTop+stepTitle+btnH+padBottom
  homeConfirm: {
    panW: 200,       // panY and bx are centred automatically
    fontTitle:  8,
    fontBtn:    6,
    padTop:    14,   // space from top edge to question
    stepTitle: 20,   // advance after "GO TO HOME?" (h=8 + spacing=12)
    btnH:      14,   // YES/NO button height
    padBottom: 14,   // space from button bottoms to panel edge
    siOx: 20, siW: 70,   // YES: bx+siOx, width siW
    noOx: 110, noW: 70,  // NO: bx+noOx, width noW
  },

  // Credits — panH computed: padTop+stepTitle+stepTeam+5*(nameH+nameGap+roleH+roleGap)+btnGapAbove+btnH+padBottom
  credits: {
    panW: 240,       // panY and bx are centred automatically
    fontTitle:    8,
    fontBody:     6, // names and roles
    fontBtn:      6, // OK button
    padTop:       8,
    stepTitle:   14, // after "— CREDITS —" (h=6 + spacing=8)
    stepTeam:    12, // after team name (h=4 + spacing=8)
    nameH:        4, nameGap:  2,  // name height, gap name→role
    roleH:        4, roleGap:  6,  // role height, gap between members
    btnGapAbove:  2,               // gap above OK button
    btnH:        12, btnW: 60,     // OK button
    padBottom:    10,
  },

});

// Alias for backwards compatibility with levels.js
var SHARED_LAYOUT = CONFIG.vis.shared;

// Apply CSS custom properties from layout
var _L = CONFIG.vis.layout;
var _B = CONFIG.vis.bezel;
document.documentElement.style.setProperty('--btr-zoom',                 _L.desktopZoom);
document.documentElement.style.setProperty('--btr-panel-inner-border',   _B.panelInnerBorder);
document.documentElement.style.setProperty('--btr-btn-home-border',      _B.btnHomeBorder);
document.documentElement.style.setProperty('--btr-btn-pause-border',     _B.btnPauseBorder);
document.documentElement.style.setProperty('--btr-btn-info-border',      _B.btnInfoBorder);
document.documentElement.style.setProperty('--btr-btn-home-bg',          _B.btnHomeBg);
document.documentElement.style.setProperty('--btr-btn-pause-bg',         _B.btnPauseBg);
document.documentElement.style.setProperty('--btr-btn-info-bg',          _B.btnInfoBg);
document.documentElement.style.setProperty('--btr-btn-home-bg-pressed',  _B.btnHomeBgPressed);
document.documentElement.style.setProperty('--btr-btn-pause-bg-pressed', _B.btnPauseBgPressed);
document.documentElement.style.setProperty('--btr-btn-info-bg-pressed',  _B.btnInfoBgPressed);
document.documentElement.style.setProperty('--btr-btn-glow',             _B.btnGlow);
document.documentElement.style.setProperty('--btr-font-family',          CONFIG.vis.fontFamily);
