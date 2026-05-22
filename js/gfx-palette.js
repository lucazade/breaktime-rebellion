// ═══════════════════════════════════════════════════════════
//  GFX PALETTE — single source of truth for all colours
// ═══════════════════════════════════════════════════════════

const PAL = {
  // sprite / environment
  black:       '#000000',  // sprite outline
  white:       '#FFFFFF',  // highlights
  green:       '#33B84B',  // green walls / bottone C macchina
  greenDark:   '#039C5A',  // green wall shadows
  purple:      '#4E3699',  // muri viola / giacca Marco / bag
  purpleDark:  '#423D7C',  // purple shadows / Marco shirt / bag border
  yellow:      '#FEDC02',  // teacher tie / button B
  blue:        '#1665DC',  // floor / teacher legs / machine body
  blueDark:    '#012A9F',  // floor dark
  navy:        '#16202D',  // background / Preside / Prof.Neri
  brownDark:   '#822B14',  // hair / desk wood / doors
  brownMid:    '#875634',  // desk wood mid
  orange:      '#ED6A17',  // skin (face, hands)
  orangeDark:  '#E85606',  // skin shadow / collar
  red:         '#D21C01',  // button A / red details / Prof.Rossi
  redDark:     '#5F1D1B',  // red shadows
  lime:        '#D0E989',  // active machine screen / timer
  beige:       '#E7B260',  // light skin (janitor cap) / board skin

  // ── Marco ────────────────────────────────────────────────
  marcoSkin:        '#faa462',
  marcoSkinShadow:  '#fd6935',
  marcoHair:        '#581e00',
  marcoShirt:       '#6121ac',
  marcoShirtStripe: '#FFFFFF',  // centre vertical stripe on Marco's shirt
  marcoTrousers:    '#015dca',
  marcoShoes:       '#ba0200',
  marcoShoeSole:    '#FFFFFF',  // white stripe at shoe base
  marcoBackpack:    '#7f2001',

  // ── Teachers (shared anatomy) ─────────────────────────
  teacherSkin:       '#faa462',
  teacherSkinShadow: '#fd6935',
  teacherHair:       '#72706e',
  teacherTrousers:   '#706f6e',
  teacherShoes:      '#862c00',
  teacherTie:        '#FEDC02',

  // ── Bidello (janitor) ─────────────────────────────────
  janitorSkin:       '#faa462',
  janitorSkinShadow: '#fd6935',
  janitorHair:       '#581e00',
  janitorSalopette:  '#1665DC',  // overalls and cap
  janitorShirt:      '#FFFFFF',  // undershirt (bodyCol)
  janitorShoes:      '#FFFFFF',
  janitorMopHandle:  '#862c00',
  janitorMopHead:    '#959595',  // grey bristles

  // ── Alunni seduti (seated students) ──────────────────
  studentSkin:       '#faa462',
  studentSkinShadow: '#fd6935',
  studentHair:       '#581e00',
  studentShirt:      '#FFFFFF',

  // ── Prof.Rossi ────────────────────────────────────────
  profRossiBody:    '#D21C01',

  // ── Prof.Celeste ──────────────────────────────────────
  profCelesteBody:  '#1665DC',

  // ── Prof.Neri ─────────────────────────────────────────
  profNeriBody:     '#2f2e2d',

  // ── Preside ───────────────────────────────────────────
  presideSkin:       '#faa462',
  presideSkinShadow: '#fd6935',
  presideHair:       '#706f6e',
  presideBody:       '#2f2e2d',  // suit/jacket
  presideTrousers:   '#706f6e',
  presideShoes:      '#862c00',

  // ── Guardiani ─────────────────────────────────────────
  guardSkin:         '#faa462',
  guardSkinShadow:   '#fd6935',
  guardUniform:      '#1665DC',  // body/jacket
  guardTrousers:     '#2f2e2d',  // dark trousers
  guardCap:          '#2f2e2d',  // cappellino (same as trousers)
  guardBadge:        '#FEDC02',  // chest badge (yellow)

  // ── Prof.Ginnastica ───────────────────────────────────
  profGinnasticaSkin:       '#faa462',
  profGinnasticaSkinShadow: '#fd6935',
  profGinnasticaBody:       '#33B84B',  // shirt base colour
  profGinnasticaStripe:     '#FFFFFF',  // vertical shirt stripes
  profGinnasticaTrousers:   '#706f6e',
  profGinnasticaShoes:      '#862c00',
  profGinnasticaCap:        '#33B84B',  // cap

  // ── Luca ──────────────────────────────────────────────
  lucaSkin:          '#faa462',
  lucaSkinShadow:    '#fd6935',
  lucaHair:          '#581e00',
  lucaBody:          '#FFFFFF',  // white shirt (bodyCol)
  lucaTie:           '#000000',  // tie
  lucaTrousers:      '#012A9F',  // dark blue
  lucaShoes:         '#000000',

  // ── UI / HUD / objects ───────────────────────────────────

  // ── Transparency ─────────────────────────────────────────
  transparent:        'rgba(0,0,0,0)',       // invisible state for blinking text

  // ── Sight cone ───────────────────────────────────────────
  sightCone:          'rgba(255,200,0,0.18)',// teacher sight cone fill

  // ── Water effects (sink / sprinklers) ────────────────────
  waterPuddleDark:    'rgba(30,90,200,0.22)',
  waterPuddleMain:    'rgba(30,90,200,0.28)',
  waterHighlight:     'rgba(100,170,255,0.55)',
  waterRipple:        'rgba(130,200,255,0.5)',
  waterStream:        'rgba(60,140,255,0.45)',
  waterSplash:        'rgba(100,180,255,0.38)',
  waterDrip:          'rgba(68,136,204,0.6)',

  // ── Object overlays ──────────────────────────────────────
  ballHighlight:      'rgba(255,200,100,0.5)', // ball shine
  mirrorHighlight:    'rgba(255,255,255,0.45)',  // mirror glass shine
  binRecycle:         'rgba(255,255,255,0.75)',  // recycle symbol on bin

  // ── Debug overlay rgba ───────────────────────────────────
  debugOverlayBg:     'rgba(0,0,0,0.6)',
  debugStairFill:     'rgba(255,120,0,0.22)',
  debugStairOutline:  'rgba(255,140,0,0.85)',
  debugStairCyan:     'rgba(0,200,255,0.6)',
  debugBoardGreen:    'rgba(0,255,80,0.85)',
  debugBagPurple:     'rgba(100,100,255,0.9)',
  debugBellGold:      'rgba(255,215,0,0.9)',
  debugDeskYellow:    'rgba(255,220,0,0.65)',
  debugFloorYellow:   'rgba(255,255,0,0.7)',
  debugPlayerPink:    'rgba(255,80,255,0.9)',

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

  // ── UI colours ───────────────────────────────────────────
  gold:           '#FFD700',  // floating text, win/score banners, Luca bubble
  dgray:          '#444444',  // disabled buttons, dim UI elements
  cyan:           '#70A4B2',  // sprinkler/water particles, keyboard legend
  lgreen:         '#9AD284',  // credits roles, audio button
  lgray:          '#959595',  // keyboard legend, paper ball highlight
  mgray:          '#6C6C6C',  // audio muted button

  // ── Object colours (legacy — to be revised in fase 4) ───
  brown:          '#433900',  // desk chair wood
  desk:           '#2C1800',  // desk top dark
  desklt:         '#4E2A00',  // desk top light
  bagborder:      '#2A1F5E',  // bag border

  // ── Characters ───────────────────────────────────────────
  charOutline:    '#121212',           // sprite outline (CONFIG.vis.char.outlineColor)
  shadow:         'rgba(0,0,0,0.2)',   // character ground shadow
  speechBubble:   'rgba(255,255,255,0.9)', // NPC speech bubble fill
  speechBorder:   '#bcbcbc',           // NPC speech bubble border
  bubbleBorder:   '#aa7700',           // Luca speech bubble border (dark gold)
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

