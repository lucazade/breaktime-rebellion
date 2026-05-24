// ═══════════════════════════════════════════════════════════
//  GFX PALETTE — single source of truth for all colours
// ═══════════════════════════════════════════════════════════

const PAL = {

// ═══════════════════════════════════════════════════════════
//  CHARACTERS
// ═══════════════════════════════════════════════════════════

  // ── Marco ─────────────────────────────────────────────────
  marcoSkin:        '#faa462',  // face, hands
  marcoSkinShadow:  '#fd6935',  // neck, collar shadow
  marcoHair:        '#581e00',  // hair
  marcoShirt:       '#6121ac',  // shirt / jacket body colour
  marcoShirtStripe: '#FFFFFF',  // centre vertical stripe on shirt
  marcoTrousers:    '#015dca',  // trousers
  marcoShoes:       '#ba0200',  // shoes
  marcoShoeSole:    '#FFFFFF',  // white stripe at shoe base
  marcoBackpack:    '#7f2001',  // backpack

  // ── Teachers ─────────────────────────────────────────────
  teacherSkin:       '#faa462',  // face, hands
  teacherSkinShadow: '#fd6935',  // neck, collar shadow
  teacherHair:       '#72706e',  // hair, shared by all teacher types
  teacherTrousers:   '#706f6e',  // trousers, shared by all teacher types
  teacherShoes:      '#862c00',  // shoes, shared by all teacher types
  teacherTie:        '#FEDC02',  // tie, shared by all teacher types
  sightCone:         'rgba(255,200,0,0.18)',  // NPC sight cone fill
  speechBubble:      'rgba(255,255,255,0.9)', // NPC speech bubble fill
  speechBorder:      '#bcbcbc', // NPC speech bubble border
  speechText:        '#000000', // NPC speech bubble text / tap-to-continue label

  // ── Prof.Rossi ────────────────────────────────────────────
  profRossiBody:    '#D21C01',  // jacket

  // ── Prof.Celeste ──────────────────────────────────────────
  profCelesteBody:  '#1665DC',  // jacket

  // ── Prof.Neri ─────────────────────────────────────────────
  profNeriBody:     '#2f2e2d',  // jacket

  // ── Janitor ───────────────────────────────────────────────
  janitorSkin:       '#faa462',  // face, hands
  janitorSkinShadow: '#fd6935',  // neck, collar shadow
  janitorHair:       '#581e00',  // hair
  janitorSalopette:  '#1665DC',  // overalls and cap
  janitorShirt:      '#FFFFFF',  // undershirt (bodyCol)
  janitorShoes:      '#FFFFFF',  // shoes
  janitorMopHandle:  '#862c00',  // broom handle
  janitorMopHead:    '#959595',  // bristles
  janitorMopTip:     '#FFFFFF',  // white bristle tip row

  // ── Prof.Ginnastica ───────────────────────────────────────
  profGinnasticaSkin:       '#faa462',  // face, hands
  profGinnasticaSkinShadow: '#fd6935',  // neck, collar shadow
  profGinnasticaBody:       '#33B84B',  // shirt / jacket body colour
  profGinnasticaStripe:     '#FFFFFF',  // vertical shirt stripes
  profGinnasticaTrousers:   '#706f6e',  // trousers
  profGinnasticaShoes:      '#862c00',  // shoes
  profGinnasticaCap:        '#33B84B',  // cap (same colour as shirt)

  // ── Seated students ───────────────────────────────────────
  studentSkin:       '#faa462',  // face, arms
  studentSkinShadow: '#fd6935',  // neck shadow
  studentHair:       '#581e00',  // hair
  studentShirt:      '#FFFFFF',  // shirt
  exclamation:       '#FF2222',  // student exclamation mark when disturbed

  // ── Preside ───────────────────────────────────────────────
  presideSkin:       '#faa462',  // face, hands
  presideSkinShadow: '#fd6935',  // neck, collar shadow
  presideHair:       '#FFFFFF',  // hair (white)
  presideBody:       '#2f2e2d',  // suit jacket
  presideTrousers:   '#706f6e',  // trousers
  presideShoes:      '#862c00',  // shoes
  presideCuff:       '#FFFFFF',  // white shirt cuff visible at sleeve end

  // ── Guards ────────────────────────────────────────────────
  guardSkin:         '#faa462',  // face, hands
  guardSkinShadow:   '#fd6935',  // neck, collar shadow
  guardUniform:      '#1665DC',  // jacket / body
  guardTrousers:     '#2f2e2d',  // trousers
  guardCap:          '#2f2e2d',  // cap (same colour as trousers)
  guardBadge:        '#FEDC02',  // chest badge
  guardShoes:        '#000000',  // shoes

  // ── Luca ──────────────────────────────────────────────────
  lucaSkin:          '#faa462',  // face, hands
  lucaSkinShadow:    '#fd6935',  // neck, collar shadow
  lucaHair:          '#581e00',  // hair
  lucaBody:          '#FFFFFF',  // shirt (bodyCol)
  lucaTie:           '#000000',  // tie
  lucaTrousers:      '#012A9F',  // trousers
  lucaShoes:         '#000000',  // shoes
  bubbleBorder:      '#aa7700',  // Luca speech bubble border (dark gold)

  // ── Characters — shared elements ──────────────────────────
  charEye:      '#000000',               // eye colour (all characters)
  charOutline:  '#121212',               // sprite outline (near-black)
  shadow:       'rgba(0,0,0,0.2)',       // ground shadow under characters

// ═══════════════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════════════

  // ── HUD ──────────────────────────────────────────────────
  transparent:      'rgba(0,0,0,0)',      // invisible — used for blinking text off-state
  hudBg:            'rgba(0,4,75,0.55)', // HUD strip background
  hudText:          '#FFFFFF',           // score and proximity message text
  hearts:           '#ff2244',           // lives hearts
  hudCounter:       '#44ee66',           // object counter text
  timerGreen:       '#22cc44',           // timer bar >= 60%
  timerYellow:      '#ddcc00',           // timer bar 30–60%
  timerRed:         '#dd1100',           // timer bar < 30%
  hudIconDetail:    '#000000',           // dark detail lines in mechanic icons
  hudIconHighlight: '#FFFFFF',           // light detail lines in mechanic icons (chalk, page lines)

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

  // ── Title screen ──────────────────────────────────────────
  logoBorder:     '#000000',  // logo - image border
  logoGlow:       '#FFD700',  // logo - pulsing glow stroke colour

  btnDisabled:    '#444444',  // level - disabled level chooser button
  btnLabel:       '#FEDC02',  // level - enabled level chooser button label
  levelLocked:    '#444444',  // level - locked next-level button / lock icon

  diffEasy:       '#00ff00',  // difficulty selector — easy
  diffMedium:     '#FEDC02',  // difficulty selector — medium
  diffHard:       '#ff0000',  // difficulty selector — hard

  audioFull:      '#16c0fc',  // audio - audio button (full mode)
  audioSfx:       '#0076fd',  // audio - SFX-only mode button highlight
  audioMute:      '#444444',  // audio - audio muted button

  // ── Bezel (mobile side panels) ────────────────────────────
  bezelGlow:    'rgba(160,0,255,0.7)',           // panel inner glow border
  bezelBorder:  'rgba(160,0,255,0.85)',          // action button borders
  bezelBtnBg:   'rgba(10,0,24,1)',               // button background (home / pause)
  bezelInfoBg:  'rgba(0,0,0,0.45)',              // info button background
  bezelPressed: 'rgba(160,0,255,0.28)',          // button pressed state overlay
  bezelShadow:  '0 0 8px rgba(160,0,255,0.35)', // CSS box-shadow on panels

  // ── In-game banners (story, mission, win, gameover, pause) ─
  panelBg:            'rgba(0,0,40,0.90)', // dialog panel background
  panelBorder:        '#FFD700',           // dialog panel border / HUD icon gold accent
  btnYes:             'rgba(0,90,0,0.92)', // yes / OK / resume button background
  btnNo:              'rgba(90,0,0,0.92)', // no / cancel button background
  btnText:            '#FFFFFF',  // dialog button labels (yes / no / resume / OK)
  gold:               '#FFD700',  // banner title / overlay accent colour
  bannerText:         '#FFFFFF',  // story / mission / gameover / win / level-complete body text
  bestScoreHighlight: '#FEDC02',  // best score / level text in win screen
  livesBonusText:     '#33B84B',  // lives bonus line in win screen
  tapContinueColor:   '#33B84B',  // "tap to continue" prompt in level-complete screen
  creditsText:        '#FFFFFF',  // credits member names and OK button
  creditsRole:        '#9AD284',  // credits team name / member role text

// ═══════════════════════════════════════════════════════════
//  GAME OBJECTS
// ═══════════════════════════════════════════════════════════

  // ── Object interaction ────────────────────────────────────
  objectActiveBorder: '#FEDC02',  // dashed yellow border shown when object is interactive

  // ── Progress bars ─────────────────────────────────────────
  barBg:   '#880000',  // progress bar track background
  barDark: '#2a0000',  // progress bar track inner dark
  barFill: '#cc1100',  // progress bar fill (action in progress)

  // ── Particles / effects ───────────────────────────────────
  scoreParticle:     '#FEDC02',  // floating score text and particles on mechanic completion
  deathParticle:     '#5F1D1B',  // red particles when Marco is caught
  explosionParticle: '#5F1D1B',  // red particles from bin explosion

  // ── Bell ──────────────────────────────────────────────────
  bellOutline:   '#554400',  // dark outline
  bellBody:      '#FFCC00',  // main body
  bellHighlight: '#FFE966',  // top highlight
  bellClapper:   '#332200',  // clapper

  // ── Desks ─────────────────────────────────────────────────
  brown:         '#433900',  // chair wood
  desk:          '#2C1800',  // desk top dark layer
  desklt:        '#4E2A00',  // desk top light layer
  deskHighlight: '#FFFFFF',  // desk surface white highlight stripe
  chairSeat:     '#5F1D1B',  // chair seat (dark red-brown)

  // ── Chalkboard ────────────────────────────────────────────
  boardDark:     '#075b07',  // board background (dark green)
  boardChalk:    '#2c832c',  // chalk line hints on board surface
  chalkParticle: '#FFFFFF',  // chalk particles when a board is tagged

  // ── Spray ────────────────────────────────────────────
  sprayCanDark: '#005050',   // spray can dark outline
  sprayCanBody: '#1665DC',   // spray can body

  // ── Bags ──────────────────────────────────────────────────
  bagborder: '#2A1F5E',      // bag border stripe

  // ── Vending machines ──────────────────────────────────────
  machineScreen:       '#9AD284',  // screen when active (intact)
  machineScreenBroken: '#444444',  // screen when broken
  machineDivider:      '#444444',  // horizontal divider between screen and button panel
  machineBody:         '#1665DC',  // machine body
  machineButtonPanel: '#6C5EB5',  // button panel background
  machineButtonA:     '#5F1D1B',  // button A (red — damages machines)
  machineButtonB:     '#FEDC02',  // button B (yellow)
  machineButtonC:     '#9AD284',  // button C (green)
  machineInk:         '#000000',  // coin slot / open hatch when broken

  // ── Ball ──────────────────────────────────────────────────
  ballBody:      '#CC6600',               // basketball body
  ballHighlight: 'rgba(255,200,100,0.5)', // ball shine overlay
  ballWood:      '#6b2200',               // ball outline and seam lines

  // ── Paper balls ───────────────────────────────────────────
  paperBall:       '#FFFFFF',  // paper ball thrown at students (L5)
  paperBallShadow: '#959595',  // shadow pixel on paper ball

  // ── Books / bookcase ──────────────────────────────────────
  bookcaseWood:    '#6b2200',  // bookcase spine and book covers
  bookcaseOutline: '#3a1000',  // darkest wood outline
  pageColor:       '#F5E6C0',  // open book pages
  pageLines:       '#999999',  // page text lines

  // ── Sink / mirror ─────────────────────────────────────────
  mirrorFrame:      '#1a3a5c',               // mirror frame
  mirrorGlass:      '#7ab8d8',               // mirror glass reflection
  mirrorHighlight:  'rgba(255,255,255,0.45)', // mirror glass shine overlay
  waterDrop:        '#4488cc',               // water drop dripping from tap
  sinkBasinOuter:   '#666666',               // basin outer shell
  sinkTap:          '#777777',               // tap body
  sinkTapHandle:    '#aaaaaa',               // tap handle
  sinkBasinMid:     '#b0b0b0',               // basin mid layer
  sinkBasinInner:   '#d8d8d8',               // basin inner (lightest)
  sinkDrain:        '#888888',               // drain at basin bottom
  sinkActiveBorder: '#70A4B2',               // dashed border when sink is interactive
  waterPuddleDark:  'rgba(30,90,200,0.22)',  // flood puddle dark layer
  waterPuddleMain:  'rgba(30,90,200,0.28)',  // flood puddle main layer
  waterHighlight:   'rgba(100,170,255,0.55)', // flood puddle surface highlight
  waterRipple:      'rgba(130,200,255,0.5)', // flood ripple ring
  waterDrip:        'rgba(68,136,204,0.6)',  // water drip from ceiling during flood

  // ── Bins ──────────────────────────────────────────────────
  binBody:        '#228B22',               // body
  binLid:         '#1a7a1a',               // lid (slightly darker)
  binShadow:      '#1a6e1a',               // left-side shadow
  binDark:        '#0d4d0d',               // rim / border
  binRecycle:     'rgba(255,255,255,0.75)', // recycle symbol overlay
  charred:        '#2a1a00',               // charred debris after explosion (dark brown)
  charredGray:    '#444444',               // charred debris grey accent pieces
  binCharredDark: '#333333',               // charred debris dark layer

  // ── Fire / explosion ──────────────────────────────────────
  flame:        '#FF6600',  // lighter / fuse flame
  lighterSpark: '#FEDC02',  // lighter flame tip / fuse spark

  // ── Sprinklers ────────────────────────────────────────────
  sprinklerDisc:        '#bbbbbb',               // deflector disc
  sprinklerBorder:      '#555555',               // T-pipe border
  sprinklerInactive:    '#888888',               // head when inactive
  sprinklerActive:      '#5F1D1B',               // head when triggered (red)
  sprinklerActiveBorder:'#33B84B',               // dashed border blink when active
  waterStream:          'rgba(60,140,255,0.45)', // water stream spraying from head
  waterSplash:          'rgba(100,180,255,0.38)', // splash droplet on floor

  // ── Class register ────────────────────────────────────────
  registerCover: '#8B0000',  // cover
  registerSpine: '#6B0000',  // spine (slightly darker)
  registerEdge:  '#AA2200',  // top edge highlight
  registerPages: '#F0E8D0',  // page area
  registerLine:  '#888888',  // grey grade lines on pages
  registerGrade: '#5F1D1B',  // red grade lines (bad marks)

// ═══════════════════════════════════════════════════════════
//  DEBUG
// ═══════════════════════════════════════════════════════════

  // ── Debug ─────────────────────────────────────────────────
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
