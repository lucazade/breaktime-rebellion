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
