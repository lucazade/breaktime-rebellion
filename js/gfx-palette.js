// ═══════════════════════════════════════════════════════════
//  GFX PALETTE — single source of truth for all colours
//  Sprite/env colours (Phase 3 recolouring reference)
//  UI/HUD colours (used by gfx-ui.js from Phase 2)
//  CONFIG.colors: C64 game palette, alias C = CONFIG.colors (state.js)
// ═══════════════════════════════════════════════════════════

const PAL = {
  // ── Sprite / environment (logo reference palette) ────────
  black:       '#000000',  // outline tutto
  white:       '#FFFFFF',  // highlights
  green:       '#33B84B',  // muri verdi
  greenDark:   '#039C5A',  // ombre muri verdi
  purple:      '#4E3699',  // muri viola/giacca Marco
  purpleDark:  '#423D7C',  // ombre viola
  yellow:      '#FEDC02',  // giallo testo/capelli
  blue:        '#1665DC',  // pavimento/pantaloni
  blueDark:    '#012A9F',  // pavimento scuro
  navy:        '#16202D',  // sfondo/ombre profonde
  brownDark:   '#822B14',  // banchi, porte
  brownMid:    '#875634',  // legno medio
  orange:      '#ED6A17',  // legno chiaro/pelle
  orangeDark:  '#E85606',  // pelle in ombra
  red:         '#D21C01',  // dettagli rossi
  redDark:     '#5F1D1B',  // ombre rosse
  lime:        '#D0E989',  // testo copyright
  beige:       '#E7B260',  // lavagna, pelle chiara

  // ── HUD / game ───────────────────────────────────────────
  hearts:       '#ff2244',  // lives hearts
  hudCounter:   '#44ee66',  // object counter text
  timerGreen:   '#22cc44',  // timer bar >= 60%
  timerYellow:  '#ddcc00',  // timer bar 30–60%
  timerRed:     '#dd1100',  // timer bar < 30%

  // ── Debug overlay (drawDebugOverlay only) ────────────────
  debugCyan:    '#00E8FF',  // floor line labels (TY/MY/GY)
  debugGreen:   '#00FF50',  // board hitbox labels
  debugBlue:    '#8888FF',  // bag hitbox labels
  debugOrange:  '#FF9900',  // stair coordinate labels
  debugOrangeR: '#FF4400',  // stair endpoint dots
  debugMagenta: '#FF66FF',  // player hitbox label
  debugYellow:  '#FFFF00',  // floor line colour

  // ── Bezel — mobile side panels ───────────────────────────
  bezelGlow:        'rgba(160,0,255,0.7)',          // panel inner border
  bezelBorder:      'rgba(160,0,255,0.85)',         // button borders
  bezelBtnBg:       'rgba(10,0,24,1)',              // button background (home/pause)
  bezelInfoBg:      'rgba(0,0,0,0.45)',             // info button background
  bezelPressed:     'rgba(160,0,255,0.28)',         // button pressed state
  bezelShadow:      '0 0 8px rgba(160,0,255,0.35)',// CSS box-shadow

  // ── Dialog panels ────────────────────────────────────────
  panelBg:     'rgba(0,0,40,0.90)',  // panel background
  panelBorder: '#FFD700',            // panel border (gold)
  btnYes:      'rgba(0,90,0,0.92)', // yes/OK/resume button
  btnNo:       'rgba(90,0,0,0.92)', // no button
  btnLabel:    '#b0b0b0',           // enabled button label (title screen)

  // ── HUD ──────────────────────────────────────────────────
  hudBg:       'rgba(0,4,75,0.55)', // HUD strip background

  // ── Progress bars (shared across all objects) ────────────
  barBg:         '#880000',  // progress bar background
  barDark:       '#2a0000',  // progress bar dark inner
  barFill:       '#cc1100',  // progress bar fill

  // ── Bell ─────────────────────────────────────────────────
  bellOutline:   '#554400',
  bellBody:      '#FFCC00',
  bellHighlight: '#FFE966',
  bellShadow:    '#CC9900',
  bellClapper:   '#332200',

  // ── Board ────────────────────────────────────────────────
  boardDark:     '#075b07',  // board dark green background
  boardChalk:    '#2c832c',  // chalk line hints

  // ── Ball / shared wood ───────────────────────────────────
  ballBody:      '#CC6600',  // basketball orange
  woodDark:      '#6b2200',  // dark reddish-brown wood (ball outline, bookcase spine)

  // ── Books / bookcase ─────────────────────────────────────
  woodOutline:   '#3a1000',  // book/bookcase dark wood outline
  pageColor:     '#F5E6C0',  // open book pages
  pageLines:     '#999999',  // page text lines

  // ── Register ─────────────────────────────────────────────
  registerCover: '#8B0000',  // register cover dark red
  registerSpine: '#6B0000',  // register spine darker red
  registerEdge:  '#AA2200',  // register top edge highlight
  registerPages: '#F0E8D0',  // register page color

  // ── Mirror / sink ────────────────────────────────────────
  mirrorFrame:   '#1a3a5c',
  mirrorGlass:   '#7ab8d8',
  waterDrop:     '#4488cc',  // dripping water

  // ── Grays (sink, sprinklers, misc fixtures) ───────────────
  charred:       '#2a1a00',  // charred debris
  gray1:         '#333333',  // charred debris dark
  gray3:         '#555555',  // sprinkler border
  gray4:         '#666666',  // sink basin outer
  gray5:         '#777777',  // sink tap
  gray6:         '#888888',  // sink drain, sprinkler inactive
  gray8:         '#aaaaaa',  // sink tap handle
  gray10:        '#d8d8d8',  // sink basin inner

  // ── Bins ─────────────────────────────────────────────────
  binBody:       '#228B22',  // bin body green
  binLid:        '#1a7a1a',  // bin lid darker green
  binShadow:     '#1a6e1a',  // bin left shadow
  binDark:       '#0d4d0d',  // bin rim/border darkest green

  // ── Fire / explosion ─────────────────────────────────────
  flame:         '#FF6600',  // lighter flame, fuse animation

  // ── Characters ───────────────────────────────────────────
  charOutline:    '#121212',           // sprite outline (CONFIG.vis.char.outlineColor)
  shadow:         'rgba(0,0,0,0.2)',   // character ground shadow
  speechBubble:   'rgba(255,255,255,0.9)', // NPC speech bubble fill
  speechBorder:   '#bcbcbc',           // NPC speech bubble border
  bubbleBorder:   '#aa7700',           // Luca speech bubble border (dark gold)
  guardUniform:   '#1a1a3a',           // Guardiano body/uniform
  guardTrousers:  '#111111',           // Guardiano dark trousers
  guardCap:       '#dddddd',           // Guardiano cap
  guardCapVisor:  '#bbbbbb',           // Guardiano cap visor
  backpack:       '#3e3e3e',           // Marco backpack
  neck:           '#825144',           // character neck colour
  sprayCanDark:   '#005050',           // spray can dark outline
  exclamation:    '#FF2222',           // student exclamation mark

  // HUD mechanic dot colours
  dotBoards:     '#588D43',
  dotBags:       '#4A3D8F',
  dotMachines:   '#B8C76F',
  dotBall:       '#CC6600',
  dotStudents:   '#FFFFFF',
  dotBooks:      '#6B2200',
  dotSink:       '#70A4B2',
  dotBins:       '#B8C76F',
  dotSprinklers: '#70A4B2',
  dotRegister:   '#FFD700',
};

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
