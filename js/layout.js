// ═══════════════════════════════════════════════════════════
//  LAYOUT — game world dimensions, palette, and scene structure
//  Edit here to change the look of the school building.
// ═══════════════════════════════════════════════════════════

// Prima parte di CONFIG.vis: layout e colori (devono stare prima dei const)
CONFIG.vis = {

  layout: {
    W: 320, H: 200,       // dimensioni canvas logiche (px)
    PW: 8, PH: 16,        // player width × height
    GY: 185, MY: 127, TY: 70,  // Y pavimento Ground / Middle / Top floor
    BW: 22, BH: 14,       // board (lavagna) width × height
    walkOffset: 6,        // px sopra la superficie dove cammina il personaggio
    wallLeft: 10, wallRight: 10, // #78 — margini muro sx/dx (pixel logici)
    desktopZoom: 1.0,            // zoom canvas su desktop (pointer:fine) — 1.5 = 400→600px
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

// Resto di CONFIG.vis — usa i shortcut constants sopra
// All canvas coords are in logical 320×200 space (ctx.scale 2×).
Object.assign(CONFIG.vis, {

  // Title screen — logo + tap to start + level chooser + audio toggle + keyboard legend
  titleScreen: {
    logo:     { w: 320, borderW: 1, borderR: 5 }, // larghezza logo; y calcolato (centratura verticale); borderW=spessore bordino, borderR=raggio angoli clip
    tapText:  { fontSize: 4, gapY: 3 },// font e gap sotto il logo
    controls: {
      fontSize: 8,       // ⚠ solo 4px e 8px sono crispini
      gapY:     8,       // gap dopo tapText prima della riga controlli
      btnH:    10,       // altezza clickable dei pulsanti
      boxR:     2,       // raggio angoli box pulsanti
      btnColor: '#b0b0b0', // colore pulsanti abilitati (meno saturo di white)
      prevX:   10, prevW: 14,    // pulsante ‹ livello
      nextX:   76, nextW: 14,    // pulsante › o lock
      labelX:  50,               // x centro label "LVL N"
      langX:  135, langW: 20,    // pulsanti EN / IT (solo se showLangChooser)
      audioRightX: 310, audioPadX: 6, // pulsante audio: bordo dx fisso, larghezza calcolata da label più lunga
    },
    legend: { fontSize: 4, gapY: 4 },  // keyboard legend (solo desktop) — ⚠ solo 4px o 8px
  },

  // Sprite personaggi — outline e colore
  char: {
    outline:      true,         // abilita outline intorno agli sprite
    outlineSize:  1.0,          // spessore outline (px logici)
    outlineColor: '#121212',    // colore outline
  },

  // HUD — strip in cima al canvas
  hud: {
    rowH:      10,                   // altezza strip HUD
    textY:     1,                    // y baseline testo/cuori
    heartsX:   4,                    // x primo cuore
    heartStep: 9,                    // px per cuore (8 wide + 1 gap)
    centerX:   160,                  // x centro per counter/msg
    scoreX:    316,                  // x destro per punteggio
    timerH:    1,                    // altezza barra timer
    fontSize:  8,                    // ⚠ solo 4px e 8px sono crispini su questo canvas (scale 2×)
    dotW:      7,                    // lato quadratino indicatore meccanica
    dotGap:    5,                    // gap tra quadratino e testo counter
    dotOffsetY: 0,                   // offset y del dot rispetto a textY (negativo = su)
    bgColor:   'rgba(0,0,0,0.55)',
    // Colore quadratino indicatore per ogni meccanica
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

  // Banner storia (L1) — panH calcolato: padTop+titleH+titleSpacing+lineBlock+spacerH+tapH+padBottom
  storyBanner: {
    panW: 280, wrapWidth: 220,  // larghezza pannello; wrapWidth = larghezza testo
    fontSize:       8,
    padTop:        16,          // spazio dal bordo superiore al titolo
    titleH:        10, titleSpacing: 10, // altezza titolo, spacing dopo titolo
    lineH:          8, lineSpacing:   4, // altezza riga, spacing tra righe
    spacerH:       10,          // spazio vuoto prima del tap
    tapH:           8,          // altezza tapContinue
    padBottom:     16,          // spazio dal fondo al bordo inferiore
  },

  // Banner missione — panH calcolato: padTop+titleH+titleSpacing+lineBlock+padBottom
  missionBanner: {
    panW: 260, wrapWidth: 200,  // larghezza pannello; wrapWidth = larghezza testo
    fontSize:       8,
    padTop:        14,          // spazio dal bordo superiore al titolo
    titleH:        10, titleSpacing: 8, // altezza titolo, spacing dopo titolo
    lineH:          8, lineSpacing:  4, // altezza riga, spacing tra righe
    padBottom:     14,          // spazio dal fondo al bordo inferiore
  },

  // Banner livello superato — panH calcolato: padTop+stepTitle+stepScore+tapH+padBottom
  levelComplete: {
    panW: 260,  // panY e bx centrati automaticamente
    fontSize:   8,   // px font corpo
    padTop:    11,   // spazio dal bordo superiore al primo testo
    stepTitle: 20,   // avanzamento dopo titolo (h=10 + spacing=10)
    stepScore: 22,   // avanzamento dopo punteggio (h=8 + spacing=14)
    tapH:       8,   // altezza tapContinue
    padBottom: 11,   // spazio dal fondo tapContinue al bordo inferiore
  },

  // Banner fine gioco (L10) — panH calcolato: padTop+stepTitle+stepScore+stepBest+tapH+padBottom
  gameWin: {
    panW: 260,  // panY e bx centrati automaticamente
    fontSize:   8,   // px font corpo
    padTop:    23,   // spazio dal bordo superiore al primo testo
    stepTitle: 22,   // avanzamento dopo titolo win (h=12 + spacing=10)
    stepScore: 12,   // avanzamento dopo punteggio (h=8 + spacing=4)
    stepBest:  16,   // avanzamento dopo riga miglior punteggio (h=8 + spacing=8)
    tapH:       8,   // altezza tapForTitle
    padBottom: 23,   // spazio dal fondo tapForTitle al bordo inferiore
  },

  // Banner gameover — panH calcolato: padTop+stepTitle+stepLevel+stepScore+stepConfirm+btnH+padBottom
  gameover: {
    panW: 260,       // panY e bx centrati automaticamente
    fontSize:     8, // px font corpo
    padTop:      12, // spazio dal bordo superiore al primo testo
    stepTitle:   18, // avanzamento dopo "ESPULSO!"
    stepLevel:   12, // avanzamento dopo livello raggiunto
    stepScore:   20, // avanzamento dopo punteggio
    stepConfirm: 16, // avanzamento dopo "VUOI RIGIOCARE?" → top pulsanti
    btnH:        14,
    padBottom:   12, // spazio dal fondo pulsanti al bordo inferiore
    siOx: 30, siW: 70,   // SI: bx+siOx, larghezza siW
    noOx: 160, noW: 70,  // NO: bx+noOx, larghezza noW
  },

  // Fumetto di Luca (L10 fine livello) — bh calcolato: headerH + lineCount*lineH + gapTap + tapH + padBottom
  lucaFumetto: {
    bw:        190,  // larghezza fumetto
    fontSize:    4,  // ⚠ solo 4px e 8px sono crispini
    offsetX:    10,  // offset orizzontale da Luca (PW+2)
    tailOffY:   14,  // distanza verticale della coda da ly (by2 = ly - tailOffY - bh)
    headerH:    14,  // altezza riga "Luca:" in cima
    lineH:      10,  // altezza di ogni riga di testo
    gapTap:      4,  // gap tra testo e label tap
    tapH:        8,  // altezza label tapContinue
    padBottom:   6,  // margine inferiore
    tailW: 3, tailH: 5,  // dimensione coda del fumetto
  },

  // Overlay pausa — panH calcolato: padTop+stepTitle+btnH+padBottom
  pauseOverlay: {
    panW: 200,  // panY e bx centrati automaticamente
    fontSize:   8,   // ⚠ solo 4px e 8px sono crispini
    padTop:    14,   // spazio dal bordo superiore al titolo
    stepTitle: 22,   // avanzamento dopo "— PAUSA —" (h=10 + spacing=12)
    btnH:      14,   // altezza pulsante RIPRENDI
    padBottom: 14,   // spazio dal fondo pulsante al bordo inferiore
    resumeOx:  65, resumeW: 70,  // pulsante RIPRENDI: bx+resumeOx, larghezza resumeW
  },

  // Overlay home confirm — panH calcolato: padTop+stepTitle+btnH+padBottom
  homeConfirm: {
    panW: 200,  // panY e bx centrati automaticamente
    fontSize:   8,   // ⚠ solo 4px e 8px sono crispini
    padTop:    14,   // spazio dal bordo superiore alla domanda
    stepTitle: 20,   // avanzamento dopo "TORNARE ALLA HOME?" (h=8 + spacing=12)
    btnH:      14,   // altezza pulsanti SI/NO
    padBottom: 14,   // spazio dal fondo pulsanti al bordo inferiore
    siOx: 20, siW: 70,   // SI: bx+siOx, larghezza siW
    noOx: 110, noW: 70,  // NO: bx+noOx, larghezza noW
  },

  // Credits — panH calcolato: padTop+stepTitle+stepTeam+5*(nameH+nameGap+roleH+roleGap)+btnGapAbove+btnH+padBottom
  credits: {
    panW: 240,  // panY e bx centrati automaticamente
    fontTitle:    8, // ⚠ solo 4px e 8px — era 6px (non crisp), portato a 8
    fontBody:     4, // nomi e ruoli
    padTop:       8,
    stepTitle:   14, // dopo "— CREDITS —" (h=6 + spacing=8)
    stepTeam:    12, // dopo nome team (h=4 + spacing=8)
    nameH:        4, nameGap:  2,  // altezza nome, gap nome→ruolo
    roleH:        4, roleGap:  6,  // altezza ruolo, gap tra membri
    btnGapAbove:  2,               // gap prima del pulsante OK
    btnH:        12, btnW: 60,     // pulsante OK
    padBottom:    10,
  },

});

// Alias per retrocompatibilità con levels.js
var SHARED_LAYOUT = CONFIG.vis.shared;

// Applica zoom desktop come CSS custom property (letto da style.css)
document.documentElement.style.setProperty('--btr-zoom', CONFIG.vis.layout.desktopZoom);
