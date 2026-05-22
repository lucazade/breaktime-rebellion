// ═══════════════════════════════════════════════════════════
//  GFX PALETTE — logo reference palette (PAL) + C64 game colours
//  PAL: reference for Phase 2 recolouring — not yet applied
//  CONFIG.colors: game palette used via alias C = CONFIG.colors (state.js)
// ═══════════════════════════════════════════════════════════

const PAL = {
  // Structure
  black:       '#000000',  // outline tutto
  white:       '#FFFFFF',  // highlights

  // Environment
  green:       '#33B84B',  // muri verdi
  greenDark:   '#039C5A',  // ombre muri verdi
  purple:      '#4E3699',  // muri viola/giacca Marco
  purpleDark:  '#423D7C',  // ombre viola
  yellow:      '#FEDC02',  // giallo testo/capelli
  blue:        '#1665DC',  // pavimento/pantaloni
  blueDark:    '#012A9F',  // pavimento scuro
  navy:        '#16202D',  // sfondo/ombre profonde

  // Wood/objects
  brownDark:   '#822B14',  // banchi, porte
  brownMid:    '#875634',  // legno medio
  orange:      '#ED6A17',  // legno chiaro/pelle
  orangeDark:  '#E85606',  // pelle in ombra

  // Accents
  red:         '#D21C01',  // dettagli rossi
  redDark:     '#5F1D1B',  // ombre rosse
  lime:        '#D0E989',  // testo copyright
  beige:       '#E7B260',  // lavagna, pelle chiara
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
