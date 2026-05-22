// ═══════════════════════════════════════════════════════════
//  GFX PALETTE — single source of truth for all colours
// ═══════════════════════════════════════════════════════════

const PAL = {

  // ── Environment / sprite base ─────────────────────────────
  black:       '#000000',  // sprite outline
  white:       '#FFFFFF',  // highlights
  green:       '#33B84B',  // green walls / vending machine button C
  greenDark:   '#039C5A',  // green wall shadows
  purple:      '#4E3699',  // purple walls / Marco jacket / bag
  purpleDark:  '#423D7C',  // purple shadows / Marco shirt / bag border
  yellow:      '#FEDC02',  // teacher tie / vending machine button B
  blue:        '#1665DC',  // floor / teacher legs / machine body
  blueDark:    '#012A9F',  // floor dark stripe
  navy:        '#16202D',  // background
  brownDark:   '#822B14',  // hair / desk wood / doors
  brownMid:    '#875634',  // desk wood mid tone
  orange:      '#ED6A17',  // skin (face, hands)
  orangeDark:  '#E85606',  // skin shadow / collar
  red:         '#D21C01',  // vending machine button A / Prof.Rossi jacket
  redDark:     '#5F1D1B',  // red shadows
  lime:        '#D0E989',  // active machine screen / timer bar
  beige:       '#E7B260',  // light skin / board frame

// ═══════════════════════════════════════════════════════════
//  CHARACTERS
// ═══════════════════════════════════════════════════════════

  // ── Marco ─────────────────────────────────────────────────
  marcoSkin:        '#faa462',  // face, hands
  marcoSkinShadow:  '#fd6935',  // neck, collar shadow
  marcoHair:        '#581e00',  // dark brown
  marcoShirt:       '#6121ac',  // shirt / jacket body colour
  marcoShirtStripe: '#FFFFFF',  // centre vertical stripe on shirt
  marcoTrousers:    '#015dca',  // blue jeans
  marcoShoes:       '#ba0200',  // red shoes
  marcoShoeSole:    '#FFFFFF',  // white stripe at shoe base
  marcoBackpack:    '#7f2001',  // dark red backpack

  // ── Teachers (shared anatomy) ─────────────────────────────
  teacherSkin:       '#faa462',  // face, hands
  teacherSkinShadow: '#fd6935',  // neck, collar shadow
  teacherHair:       '#72706e',  // grey hair
  teacherTrousers:   '#706f6e',  // grey
  teacherShoes:      '#862c00',  // dark brown
  teacherTie:        '#FEDC02',  // yellow

  // ── Prof.Rossi ────────────────────────────────────────────
  profRossiBody:    '#D21C01',  // jacket

  // ── Prof.Celeste ──────────────────────────────────────────
  profCelesteBody:  '#1665DC',  // jacket

  // ── Prof.Neri ─────────────────────────────────────────────
  profNeriBody:     '#2f2e2d',  // jacket

  // ── Preside ───────────────────────────────────────────────
  presideSkin:       '#faa462',  // face, hands
  presideSkinShadow: '#fd6935',  // neck, collar shadow
  presideHair:       '#706f6e',  // grey hair
  presideBody:       '#2f2e2d',  // suit jacket
  presideTrousers:   '#706f6e',  // grey
  presideShoes:      '#862c00',  // dark brown

  // ── Prof.Ginnastica ───────────────────────────────────────
  profGinnasticaSkin:       '#faa462',  // face, hands
  profGinnasticaSkinShadow: '#fd6935',  // neck, collar shadow
  profGinnasticaBody:       '#33B84B',  // shirt base colour
  profGinnasticaStripe:     '#FFFFFF',  // vertical shirt stripes
  profGinnasticaTrousers:   '#706f6e',  // grey
  profGinnasticaShoes:      '#862c00',  // dark brown
  profGinnasticaCap:        '#33B84B',  // cap (same as shirt)

  // ── Janitor (bidello) ─────────────────────────────────────
  janitorSkin:       '#faa462',  // face, hands
  janitorSkinShadow: '#fd6935',  // neck, collar shadow
  janitorHair:       '#581e00',  // dark brown
  janitorSalopette:  '#1665DC',  // overalls and cap
  janitorShirt:      '#FFFFFF',  // undershirt (bodyCol)
  janitorShoes:      '#FFFFFF',  // white
  janitorMopHandle:  '#862c00',  // broom handle
  janitorMopHead:    '#959595',  // grey bristles

  // ── Guards (guardiani) ────────────────────────────────────
  guardSkin:         '#faa462',  // face, hands
  guardSkinShadow:   '#fd6935',  // neck, collar shadow
  guardUniform:      '#1665DC',  // jacket / body
  guardTrousers:     '#2f2e2d',  // dark trousers
  guardCap:          '#2f2e2d',  // cap (same as trousers)
  guardBadge:        '#FEDC02',  // chest badge

  // ── Seated students (alunni seduti) ───────────────────────
  studentSkin:       '#faa462',  // face, arms
  studentSkinShadow: '#fd6935',  // neck shadow
  studentHair:       '#581e00',  // dark brown
  studentShirt:      '#FFFFFF',  // white shirt

  // ── Luca ──────────────────────────────────────────────────
  lucaSkin:          '#faa462',  // face, hands
  lucaSkinShadow:    '#fd6935',  // neck, collar shadow
  lucaHair:          '#581e00',  // dark brown
  lucaBody:          '#FFFFFF',  // shirt (bodyCol)
  lucaTie:           '#000000',  // black tie
  lucaTrousers:      '#012A9F',  // dark blue
  lucaShoes:         '#000000',  // black

  // ── Characters — shared elements ──────────────────────────
  charOutline:    '#121212',               // sprite outline (near-black)
  shadow:         'rgba(0,0,0,0.2)',       // ground shadow under characters
  sightCone:      'rgba(255,200,0,0.18)',  // NPC sight cone fill
  speechBubble:   'rgba(255,255,255,0.9)', // NPC speech bubble fill
  speechBorder:   '#bcbcbc',              // NPC speech bubble border
  bubbleBorder:   '#aa7700',              // Luca speech bubble border (dark gold)
  sprayCanDark:   '#005050',              // spray can dark outline
  exclamation:    '#FF2222',              // student exclamation mark

// ═══════════════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════════════

  transparent:    'rgba(0,0,0,0)',      // invisible (blinking text off state)
  hudBg:          'rgba(0,4,75,0.55)', // HUD strip background
  hearts:         '#ff2244',            // lives hearts
  hudCounter:     '#44ee66',            // object counter text
  timerGreen:     '#22cc44',            // timer bar >= 60%
  timerYellow:    '#ddcc00',            // timer bar 30–60%
  timerRed:       '#dd1100',            // timer bar < 30%

  // ── Mechanic dot indicators ───────────────────────────────
  dotBoards:     '#588D43',  // L1 boards mechanic
  dotBags:       '#4A3D8F',  // L2 bags mechanic
  dotMachines:   '#B8C76F',  // L3 vending machines mechanic
  dotBall:       '#CC6600',  // L4 gym ball mechanic
  dotStudents:   '#FFFFFF',  // L5 students mechanic
  dotBooks:      '#6B2200',  // L6 bookcase mechanic
  dotSink:       '#70A4B2',  // L7 sink mechanic
  dotBins:       '#B8C76F',  // L8 bins mechanic
  dotSprinklers: '#70A4B2',  // L9 sprinklers mechanic
  dotRegister:   '#FFD700',  // L10 register mechanic

// ═══════════════════════════════════════════════════════════
//  UI / DIALOGS
// ═══════════════════════════════════════════════════════════

  gold:        '#FFD700',            // floating score text, win/gameover banners
  dgray:       '#444444',            // disabled buttons
  lgreen:      '#9AD284',            // credits roles, audio button (full mode)
  lgray:       '#959595',            // keyboard legend text
  mgray:       '#6C6C6C',            // audio muted button
  panelBg:     'rgba(0,0,40,0.90)', // dialog panel background
  panelBorder: '#FFD700',            // dialog panel border (gold)
  btnYes:      'rgba(0,90,0,0.92)', // yes / OK / resume button
  btnNo:       'rgba(90,0,0,0.92)', // no / cancel button
  btnLabel:    '#b0b0b0',            // enabled button label (title screen)

  // ── Bezel (mobile side panels) ────────────────────────────
  bezelGlow:    'rgba(160,0,255,0.7)',           // panel inner glow border
  bezelBorder:  'rgba(160,0,255,0.85)',          // button borders
  bezelBtnBg:   'rgba(10,0,24,1)',               // button background (home / pause)
  bezelInfoBg:  'rgba(0,0,0,0.45)',              // info button background
  bezelPressed: 'rgba(160,0,255,0.28)',          // button pressed state
  bezelShadow:  '0 0 8px rgba(160,0,255,0.35)', // CSS box-shadow

// ═══════════════════════════════════════════════════════════
//  GAME OBJECTS
// ═══════════════════════════════════════════════════════════

  // ── Progress bars ─────────────────────────────────────────
  barBg:   '#880000',  // progress bar background
  barDark: '#2a0000',  // progress bar dark inner
  barFill: '#cc1100',  // progress bar fill

  // ── Bell ──────────────────────────────────────────────────
  bellOutline:   '#554400',  // dark outline
  bellBody:      '#FFCC00',  // main body
  bellHighlight: '#FFE966',  // top highlight
  bellShadow:    '#CC9900',  // shadow
  bellClapper:   '#332200',  // clapper (dark)

  // ── Chalkboard ────────────────────────────────────────────
  boardDark:  '#075b07',  // board background (dark green)
  boardChalk: '#2c832c',  // chalk line hints

  // ── Ball ──────────────────────────────────────────────────
  ballBody:      '#CC6600',              // basketball orange
  ballHighlight: 'rgba(255,200,100,0.5)', // ball shine

  // ── Desks ─────────────────────────────────────────────────
  brown:       '#433900',  // chair wood (dark brown)
  desk:        '#2C1800',  // desk top dark
  desklt:      '#4E2A00',  // desk top light
  woodDark:    '#6b2200',  // shared dark wood (ball outline, bookcase spine)

  // ── Books / bookcase ──────────────────────────────────────
  woodOutline: '#3a1000',  // dark wood outline
  pageColor:   '#F5E6C0',  // open book pages
  pageLines:   '#999999',  // page text lines

  // ── Class register ────────────────────────────────────────
  registerCover: '#8B0000',  // cover (dark red)
  registerSpine: '#6B0000',  // spine (darker red)
  registerEdge:  '#AA2200',  // top edge highlight
  registerPages: '#F0E8D0',  // page colour

  // ── Sink / mirror ─────────────────────────────────────────
  mirrorFrame:     '#1a3a5c',              // frame (dark blue)
  mirrorGlass:     '#7ab8d8',              // glass reflection
  mirrorHighlight: 'rgba(255,255,255,0.45)', // glass shine
  waterDrop:       '#4488cc',              // dripping water drop

  // ── Bins ──────────────────────────────────────────────────
  binBody:     '#228B22',              // body (green)
  binLid:      '#1a7a1a',              // lid (darker green)
  binShadow:   '#1a6e1a',              // left shadow
  binDark:     '#0d4d0d',              // rim / border
  binRecycle:  'rgba(255,255,255,0.75)', // recycle symbol

  // ── Fire / explosion ──────────────────────────────────────
  flame: '#FF6600',  // lighter flame, fuse animation

  // ── Water (sink / sprinklers) ─────────────────────────────
  cyan:            '#70A4B2',                // sprinkler / water particles
  waterPuddleDark: 'rgba(30,90,200,0.22)',   // puddle dark layer
  waterPuddleMain: 'rgba(30,90,200,0.28)',   // puddle main layer
  waterHighlight:  'rgba(100,170,255,0.55)', // puddle highlight
  waterRipple:     'rgba(130,200,255,0.5)',  // ripple ring
  waterStream:     'rgba(60,140,255,0.45)',  // falling stream
  waterSplash:     'rgba(100,180,255,0.38)', // splash droplet
  waterDrip:       'rgba(68,136,204,0.6)',   // drip from ceiling

  // ── Bags ──────────────────────────────────────────────────
  bagborder: '#2A1F5E',  // bag border (dark blue)

  // ── Grays (fixtures) ──────────────────────────────────────
  charred: '#2a1a00',  // charred debris (dark brown)
  gray1:   '#333333',  // charred debris dark
  gray3:   '#555555',  // sprinkler border
  gray4:   '#666666',  // sink basin outer
  gray5:   '#777777',  // sink tap
  gray6:   '#888888',  // sink drain / sprinkler inactive
  gray8:   '#aaaaaa',  // sink tap handle
  gray10:  '#d8d8d8',  // sink basin inner

// ═══════════════════════════════════════════════════════════
//  DEBUG
// ═══════════════════════════════════════════════════════════

  debugOverlayBg:    'rgba(0,0,0,0.6)',      // debug panel background
  debugStairFill:    'rgba(255,120,0,0.22)', // stair zone fill
  debugStairOutline: 'rgba(255,140,0,0.85)', // stair zone border
  debugStairCyan:    'rgba(0,200,255,0.6)',  // stair endpoint marker
  debugBoardGreen:   'rgba(0,255,80,0.85)',  // board hitbox
  debugBagPurple:    'rgba(100,100,255,0.9)',// bag hitbox
  debugBellGold:     'rgba(255,215,0,0.9)',  // bell hitbox
  debugDeskYellow:   'rgba(255,220,0,0.65)', // desk hitbox
  debugFloorYellow:  'rgba(255,255,0,0.7)',  // floor line colour
  debugPlayerPink:   'rgba(255,80,255,0.9)', // player hitbox
  debugCyan:         '#00E8FF',              // floor line labels (TY/MY/GY)
  debugGreen:        '#00FF50',              // board hitbox label
  debugBlue:         '#8888FF',              // bag hitbox label
  debugOrange:       '#FF9900',              // stair coordinate label
  debugOrangeR:      '#FF4400',              // stair endpoint dot
  debugMagenta:      '#FF66FF',              // player hitbox label
  debugYellow:       '#FFFF00',              // floor line stroke
};
