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
  presideShoes:      '#862c00',
  presideCuff:       '#FFFFFF',  // white shirt cuff visible at sleeve end  // dark brown

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
  janitorMopTip:     '#FFFFFF',  // white bristle tip row

  // ── Guards (guardiani) ────────────────────────────────────
  guardSkin:         '#faa462',  // face, hands
  guardSkinShadow:   '#fd6935',  // neck, collar shadow
  guardUniform:      '#1665DC',  // jacket / body
  guardTrousers:     '#2f2e2d',  // dark trousers
  guardCap:          '#2f2e2d',  // cap (same as trousers)
  guardBadge:        '#FEDC02',  // chest badge
  guardShoes:        '#000000',  // shoes

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
  charEye:        '#000000',              // eye colour (all characters)
  speechBubble:   'rgba(255,255,255,0.9)', // NPC speech bubble fill
  speechBorder:   '#bcbcbc',              // NPC speech bubble border
  speechText:     '#000000',              // NPC speech bubble text / tap-to-continue
  bubbleBorder:   '#aa7700',              // Luca speech bubble border (dark gold)
  sprayCanDark:   '#005050',              // spray can dark outline
  sprayCanBody:   '#1665DC',              // spray can body
  exclamation:    '#FF2222',              // student exclamation mark
  deathParticle:  '#5F1D1B',              // player caught — death particles

// ═══════════════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════════════

  transparent:       'rgba(0,0,0,0)',      // invisible (blinking text off state)
  hudBg:             'rgba(0,4,75,0.55)', // HUD strip background
  hudText:           '#FFFFFF',           // score and proximity message text
  hearts:            '#ff2244',           // lives hearts
  hudCounter:        '#44ee66',           // object counter text
  timerGreen:        '#22cc44',           // timer bar >= 60%
  timerYellow:       '#ddcc00',           // timer bar 30–60%
  timerRed:          '#dd1100',           // timer bar < 30%
  hudIconDetail:     '#000000',           // dark detail lines in mechanic icons
  hudIconHighlight:  '#FFFFFF',           // light detail lines in mechanic icons

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

  // ── In-game banners (story, mission, win, gameover, pause) ─
  gold:               '#FFD700',  // banner title / overlay text colour
  bannerText:         '#FFFFFF',  // story / mission / gameover / win / level-complete text
  scoreParticle:      '#FEDC02',  // floating score text and particles
  bestScoreHighlight: '#FEDC02',  // best score / level text in win screen
  livesBonusText:     '#33B84B',  // lives bonus line in win screen
  tapContinueColor:   '#33B84B',  // "tap to continue" in level-complete screen
  chalkParticle:      '#FFFFFF',  // chalk particles when board is tagged

  // ── Dialog panels ─────────────────────────────────────────
  panelBg:     'rgba(0,0,40,0.90)', // dialog panel background
  panelBorder: '#FFD700',            // dialog panel border (gold)
  btnYes:      'rgba(0,90,0,0.92)', // yes / OK / resume button
  btnNo:       'rgba(90,0,0,0.92)', // no / cancel button
  btnText:     '#FFFFFF',            // dialog button labels (yes / no / resume / OK)
  creditsText: '#FFFFFF',            // credits member names and OK button

  // ── Title screen ──────────────────────────────────────────
  dgray:          '#444444',  // disabled level chooser button
  lgreen:         '#9AD284',  // audio button (full mode) / credits roles
  lgray:          '#959595',  // keyboard legend text
  mgray:          '#6C6C6C',  // audio muted button
  btnLabel:       '#b0b0b0',  // enabled level chooser button label
  titleHighlight: '#FEDC02',  // active next-level button / SFX audio mode
  logoBorder:     '#000000',  // title screen logo border
  lockIconDetail: '#000000',  // keyhole detail in lock icon

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
  ballBody:          '#CC6600',               // basketball orange
  ballHighlight:     'rgba(255,200,100,0.5)', // ball shine
  objectActiveBorder:'#FEDC02',               // yellow border on interactive objects (boards, ball, bookcase, bins, machines)
  paperBall:         '#FFFFFF',               // paper ball thrown at students

  // ── Desks ─────────────────────────────────────────────────
  brown:         '#433900',  // chair wood (dark brown)
  desk:          '#2C1800',  // desk top dark
  desklt:        '#4E2A00',  // desk top light
  deskHighlight: '#FFFFFF',  // desk surface highlight (white top stripe)
  chairSeat:     '#5F1D1B',  // chair seat (dark red-brown)
  woodDark:      '#6b2200',  // shared dark wood (ball outline, bookcase spine)

  // ── Vending machines ──────────────────────────────────────
  machineBody:        '#1665DC',  // machine body (blue)
  machineButtonPanel: '#6C5EB5',  // button panel background
  machineButtonA:     '#5F1D1B',  // button A (dark red)
  machineButtonB:     '#FEDC02',  // button B (yellow)
  machineButtonC:     '#9AD284',  // button C (green)
  machineInk:         '#000000',  // coin slot / open hatch

  // ── Books / bookcase ──────────────────────────────────────
  woodOutline: '#3a1000',  // dark wood outline
  pageColor:   '#F5E6C0',  // open book pages
  pageLines:   '#999999',  // page text lines

  // ── Class register ────────────────────────────────────────
  registerCover: '#8B0000',  // cover (dark red)
  registerSpine: '#6B0000',  // spine (darker red)
  registerEdge:  '#AA2200',  // top edge highlight
  registerPages: '#F0E8D0',  // page colour
  registerLine:  '#888888',  // grey grade lines on pages
  registerGrade: '#5F1D1B',  // red grade lines (bad marks)

  // ── Sink / mirror ─────────────────────────────────────────
  mirrorFrame:     '#1a3a5c',               // frame (dark blue)
  mirrorGlass:     '#7ab8d8',               // glass reflection
  mirrorHighlight: 'rgba(255,255,255,0.45)', // glass shine
  waterDrop:       '#4488cc',               // dripping water drop
  sinkBasinOuter:  '#666666',               // basin outer shell
  sinkTap:         '#777777',               // tap body
  sinkTapHandle:   '#aaaaaa',               // tap handle
  sinkBasinMid:    '#b0b0b0',               // basin mid layer
  sinkBasinInner:  '#d8d8d8',               // basin inner (light)
  sinkDrain:       '#888888',               // drain

  // ── Bins ──────────────────────────────────────────────────
  binBody:           '#228B22',               // body (green)
  binLid:            '#1a7a1a',               // lid (darker green)
  binShadow:         '#1a6e1a',               // left shadow
  binDark:           '#0d4d0d',               // rim / border
  binRecycle:        'rgba(255,255,255,0.75)', // recycle symbol
  charred:           '#2a1a00',               // explosion debris (dark brown)
  binCharredDark:    '#333333',               // explosion debris dark layer
  explosionParticle: '#5F1D1B',               // bin explosion particles

  // ── Fire / explosion ──────────────────────────────────────
  flame:        '#FF6600',  // lighter / fuse flame (orange)
  lighterSpark: '#FEDC02',  // lighter flame tip / fuse spark (yellow)

  // ── Water (sink / sprinklers) ─────────────────────────────
  cyan:            '#70A4B2',                // sprinkler / water particles
  waterPuddleDark: 'rgba(30,90,200,0.22)',   // puddle dark layer
  waterPuddleMain: 'rgba(30,90,200,0.28)',   // puddle main layer
  waterHighlight:  'rgba(100,170,255,0.55)', // puddle highlight
  waterRipple:     'rgba(130,200,255,0.5)',  // ripple ring
  waterStream:     'rgba(60,140,255,0.45)',  // falling stream
  waterSplash:     'rgba(100,180,255,0.38)', // splash droplet
  waterDrip:       'rgba(68,136,204,0.6)',   // drip from ceiling

  // ── Sprinklers ────────────────────────────────────────────
  sprinklerDisc:        '#bbbbbb',  // deflector disc (light grey)
  sprinklerBorder:      '#555555',  // T-pipe border
  sprinklerInactive:    '#888888',  // head colour when inactive
  sprinklerActive:      '#5F1D1B',  // head colour when active (red)
  sprinklerActiveBorder:'#33B84B',  // active border blink (green)

  // ── Bags ──────────────────────────────────────────────────
  bagborder: '#2A1F5E',  // bag border (dark blue)

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
