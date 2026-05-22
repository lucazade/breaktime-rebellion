// ═══════════════════════════════════════════════════════════
//  GFX PALETTE — single source of truth for all colours
// ═══════════════════════════════════════════════════════════

const PAL = {

  // ── Ambiente / sprite base ────────────────────────────────
  black:       '#000000',  // sprite outline
  white:       '#FFFFFF',  // highlights
  green:       '#33B84B',  // green walls / bottone C macchina
  greenDark:   '#039C5A',  // green wall shadows
  purple:      '#4E3699',  // muri viola / giacca Marco / bag
  purpleDark:  '#423D7C',  // purple shadows / Marco shirt / bag border
  yellow:      '#FEDC02',  // teacher tie / button B
  blue:        '#1665DC',  // floor / teacher legs / machine body
  blueDark:    '#012A9F',  // floor dark
  navy:        '#16202D',  // background
  brownDark:   '#822B14',  // hair / desk wood / doors
  brownMid:    '#875634',  // desk wood mid
  orange:      '#ED6A17',  // skin (face, hands)
  orangeDark:  '#E85606',  // skin shadow / collar
  red:         '#D21C01',  // button A / red details / Prof.Rossi
  redDark:     '#5F1D1B',  // red shadows
  lime:        '#D0E989',  // active machine screen / timer
  beige:       '#E7B260',  // light skin (janitor cap) / board skin

// ═══════════════════════════════════════════════════════════
//  PERSONAGGI
// ═══════════════════════════════════════════════════════════

  // ── Marco ─────────────────────────────────────────────────
  marcoSkin:        '#faa462',
  marcoSkinShadow:  '#fd6935',
  marcoHair:        '#581e00',
  marcoShirt:       '#6121ac',
  marcoShirtStripe: '#FFFFFF',  // centre vertical stripe on Marco's shirt
  marcoTrousers:    '#015dca',
  marcoShoes:       '#ba0200',
  marcoShoeSole:    '#FFFFFF',  // white stripe at shoe base
  marcoBackpack:    '#7f2001',

  // ── Teachers (shared anatomy) ─────────────────────────────
  teacherSkin:       '#faa462',
  teacherSkinShadow: '#fd6935',
  teacherHair:       '#72706e',
  teacherTrousers:   '#706f6e',
  teacherShoes:      '#862c00',
  teacherTie:        '#FEDC02',

  // ── Prof.Rossi ────────────────────────────────────────────
  profRossiBody:    '#D21C01',

  // ── Prof.Celeste ──────────────────────────────────────────
  profCelesteBody:  '#1665DC',

  // ── Prof.Neri ─────────────────────────────────────────────
  profNeriBody:     '#2f2e2d',

  // ── Preside ───────────────────────────────────────────────
  presideSkin:       '#faa462',
  presideSkinShadow: '#fd6935',
  presideHair:       '#706f6e',
  presideBody:       '#2f2e2d',
  presideTrousers:   '#706f6e',
  presideShoes:      '#862c00',

  // ── Prof.Ginnastica ───────────────────────────────────────
  profGinnasticaSkin:       '#faa462',
  profGinnasticaSkinShadow: '#fd6935',
  profGinnasticaBody:       '#33B84B',
  profGinnasticaStripe:     '#FFFFFF',  // vertical shirt stripes
  profGinnasticaTrousers:   '#706f6e',
  profGinnasticaShoes:      '#862c00',
  profGinnasticaCap:        '#33B84B',

  // ── Bidello ───────────────────────────────────────────────
  janitorSkin:       '#faa462',
  janitorSkinShadow: '#fd6935',
  janitorHair:       '#581e00',
  janitorSalopette:  '#1665DC',  // overalls and cap
  janitorShirt:      '#FFFFFF',  // undershirt (bodyCol)
  janitorShoes:      '#FFFFFF',
  janitorMopHandle:  '#862c00',
  janitorMopHead:    '#959595',  // grey bristles

  // ── Guardiani ─────────────────────────────────────────────
  guardSkin:         '#faa462',
  guardSkinShadow:   '#fd6935',
  guardUniform:      '#1665DC',
  guardTrousers:     '#2f2e2d',
  guardCap:          '#2f2e2d',
  guardBadge:        '#FEDC02',  // chest badge

  // ── Alunni seduti ─────────────────────────────────────────
  studentSkin:       '#faa462',
  studentSkinShadow: '#fd6935',
  studentHair:       '#581e00',
  studentShirt:      '#FFFFFF',

  // ── Luca ──────────────────────────────────────────────────
  lucaSkin:          '#faa462',
  lucaSkinShadow:    '#fd6935',
  lucaHair:          '#581e00',
  lucaBody:          '#FFFFFF',  // white shirt (bodyCol)
  lucaTie:           '#000000',
  lucaTrousers:      '#012A9F',
  lucaShoes:         '#000000',

  // ── Personaggi — elementi condivisi ───────────────────────
  charOutline:    '#121212',               // sprite outline
  shadow:         'rgba(0,0,0,0.2)',       // character ground shadow
  sightCone:      'rgba(255,200,0,0.18)',  // NPC sight cone fill
  speechBubble:   'rgba(255,255,255,0.9)', // NPC speech bubble fill
  speechBorder:   '#bcbcbc',              // NPC speech bubble border
  bubbleBorder:   '#aa7700',              // Luca speech bubble border
  sprayCanDark:   '#005050',              // spray can dark outline
  exclamation:    '#FF2222',              // student exclamation mark

// ═══════════════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════════════

  transparent:    'rgba(0,0,0,0)',     // invisible state for blinking text
  hudBg:          'rgba(0,4,75,0.55)',
  hearts:         '#ff2244',
  hudCounter:     '#44ee66',
  timerGreen:     '#22cc44',           // timer bar >= 60%
  timerYellow:    '#ddcc00',           // timer bar 30–60%
  timerRed:       '#dd1100',           // timer bar < 30%

  // ── Dot colours (mechanic indicators) ─────────────────────
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

// ═══════════════════════════════════════════════════════════
//  UI / DIALOGS
// ═══════════════════════════════════════════════════════════

  gold:           '#FFD700',           // floating text, win/score banners
  dgray:          '#444444',           // disabled buttons
  lgreen:         '#9AD284',           // credits roles, audio button (full)
  lgray:          '#959595',           // keyboard legend
  mgray:          '#6C6C6C',           // audio muted button
  panelBg:        'rgba(0,0,40,0.90)',
  panelBorder:    '#FFD700',
  btnYes:         'rgba(0,90,0,0.92)',
  btnNo:          'rgba(90,0,0,0.92)',
  btnLabel:       '#b0b0b0',           // enabled button label (title screen)

  // ── Bezel (mobile side panels) ────────────────────────────
  bezelGlow:      'rgba(160,0,255,0.7)',
  bezelBorder:    'rgba(160,0,255,0.85)',
  bezelBtnBg:     'rgba(10,0,24,1)',
  bezelInfoBg:    'rgba(0,0,0,0.45)',
  bezelPressed:   'rgba(160,0,255,0.28)',
  bezelShadow:    '0 0 8px rgba(160,0,255,0.35)',

// ═══════════════════════════════════════════════════════════
//  OGGETTI DI GIOCO
// ═══════════════════════════════════════════════════════════

  // ── Progress bars ─────────────────────────────────────────
  barBg:          '#880000',
  barDark:        '#2a0000',
  barFill:        '#cc1100',

  // ── Campanella ────────────────────────────────────────────
  bellOutline:    '#554400',
  bellBody:       '#FFCC00',
  bellHighlight:  '#FFE966',
  bellShadow:     '#CC9900',
  bellClapper:    '#332200',

  // ── Lavagna ───────────────────────────────────────────────
  boardDark:      '#075b07',
  boardChalk:     '#2c832c',

  // ── Pallone / legno / libri ───────────────────────────────
  ballBody:       '#CC6600',
  woodDark:       '#6b2200',
  woodOutline:    '#3a1000',
  pageColor:      '#F5E6C0',
  pageLines:      '#999999',

  // ── Registro ──────────────────────────────────────────────
  registerCover:  '#8B0000',
  registerSpine:  '#6B0000',
  registerEdge:   '#AA2200',
  registerPages:  '#F0E8D0',

  // ── Lavandino / specchio ──────────────────────────────────
  mirrorFrame:    '#1a3a5c',
  mirrorGlass:    '#7ab8d8',
  waterDrop:      '#4488cc',

  // ── Secchi ────────────────────────────────────────────────
  binBody:        '#228B22',
  binLid:         '#1a7a1a',
  binShadow:      '#1a6e1a',
  binDark:        '#0d4d0d',

  // ── Fuoco / esplosione ────────────────────────────────────
  flame:          '#FF6600',

  // ── Acqua (sink / sprinklers) ─────────────────────────────
  waterPuddleDark:  'rgba(30,90,200,0.22)',
  waterPuddleMain:  'rgba(30,90,200,0.28)',
  waterHighlight:   'rgba(100,170,255,0.55)',
  waterRipple:      'rgba(130,200,255,0.5)',
  waterStream:      'rgba(60,140,255,0.45)',
  waterSplash:      'rgba(100,180,255,0.38)',
  waterDrip:        'rgba(68,136,204,0.6)',

  // ── Overlay oggetti ───────────────────────────────────────
  ballHighlight:    'rgba(255,200,100,0.5)',
  mirrorHighlight:  'rgba(255,255,255,0.45)',
  binRecycle:       'rgba(255,255,255,0.75)',
  cyan:             '#70A4B2',  // sprinkler/water particles

  // ── Grigi (fixtures) ──────────────────────────────────────
  charred:        '#2a1a00',
  gray1:          '#333333',
  gray3:          '#555555',
  gray4:          '#666666',
  gray5:          '#777777',
  gray6:          '#888888',
  gray8:          '#aaaaaa',
  gray10:         '#d8d8d8',

  // ── Legacy (da aggiornare in fase 4) ──────────────────────
  brown:          '#433900',  // desk chair wood
  desk:           '#2C1800',  // desk top dark
  desklt:         '#4E2A00',  // desk top light
  bagborder:      '#2A1F5E',  // bag border

// ═══════════════════════════════════════════════════════════
//  DEBUG
// ═══════════════════════════════════════════════════════════

  debugOverlayBg:   'rgba(0,0,0,0.6)',
  debugStairFill:   'rgba(255,120,0,0.22)',
  debugStairOutline:'rgba(255,140,0,0.85)',
  debugStairCyan:   'rgba(0,200,255,0.6)',
  debugBoardGreen:  'rgba(0,255,80,0.85)',
  debugBagPurple:   'rgba(100,100,255,0.9)',
  debugBellGold:    'rgba(255,215,0,0.9)',
  debugDeskYellow:  'rgba(255,220,0,0.65)',
  debugFloorYellow: 'rgba(255,255,0,0.7)',
  debugPlayerPink:  'rgba(255,80,255,0.9)',
  debugCyan:        '#00E8FF',
  debugGreen:       '#00FF50',
  debugBlue:        '#8888FF',
  debugOrange:      '#FF9900',
  debugOrangeR:     '#FF4400',
  debugMagenta:     '#FF66FF',
  debugYellow:      '#FFFF00',
};
