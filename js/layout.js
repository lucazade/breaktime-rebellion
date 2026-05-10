// ═══════════════════════════════════════════════════════════
//  LAYOUT — game world dimensions, palette, and scene structure
//  Edit here to change the look of the school building.
// ═══════════════════════════════════════════════════════════

CONFIG.layout = {
  W: 320, H: 200,
  PW: 8, PH: 16,
  GY: 188, MY: 123, TY: 58,
  BW: 22, BH: 14,
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
};

// Layout shortcut constants — used throughout all modules
const W = CONFIG.layout.W, H = CONFIG.layout.H;
const PW = CONFIG.layout.PW, PH = CONFIG.layout.PH;
const GY = CONFIG.layout.GY, MY = CONFIG.layout.MY, TY = CONFIG.layout.TY;
const BW = CONFIG.layout.BW, BH = CONFIG.layout.BH;

// ── Shared scene ─────────────────────────────────────────────────────────────
// Stairs, boards, desks, bell and player start are the same in every level —
// they are physical elements of the building fixed in bg.png.
// Only mechanics (what Marco can do) and NPCs change per level.

var SHARED_LAYOUT = {
  playerStart: { x: 30, y: GY - PH },

  stairs: [
    {x1:83,  y1:GY, x2:33,  y2:MY},  // GY→MY left
    {x1:239, y1:GY, x2:289, y2:MY},  // GY→MY right
    {x1:60,  y1:MY, x2:110, y2:TY},  // MY→TY left
    {x1:210, y1:MY, x2:260, y2:TY},  // MY→TY right
  ],

  boards: [
    {x:142, y:GY-43},
    {x:14,  y:MY-39}, {x:142, y:MY-39}, {x:274, y:MY-39},
    {x:14,  y:TY-35}, {x:142, y:TY-35},
  ],

  desks: [
    {x:116, y:GY-16}, {x:140, y:GY-16},
    {x:164, y:GY-16}, {x:188, y:GY-16},
    {x:128, y:MY-14}, {x:152, y:MY-14},
    {x:176, y:MY-14},
    {x:42,  y:TY-13}, {x:66,  y:TY-13},
    {x:162, y:TY-13}, {x:186, y:TY-13},
  ],

  bell: { x: 304, y: TY - 32 },
};
