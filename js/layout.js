// ═══════════════════════════════════════════════════════════
//  LAYOUT — game world dimensions, palette, and scene structure
//  Edit here to change the look of the school building.
// ═══════════════════════════════════════════════════════════

/*CONFIG.layout = {
  W: 320, H: 200,
  PW: 8, PH: 16,
  GY: 186, MY: 123, TY: 58,
  BW: 22, BH: 14,
};*/

CONFIG.layout = {
  W: 320, H: 200,
  PW: 8, PH: 16,
  GY: 185, MY: 127, TY: 70,
  BW: 22, BH: 14,
  walkOffset: 6,
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
  redprof:'#cb5226', greenprof:'#4a7c2b', grayprof:'#464646', whiteprof:'#dcdcdc', cyanprof:'#2d92a3',
};

// Layout shortcut constants — used throughout all modules
const W = CONFIG.layout.W, H = CONFIG.layout.H;
const PW = CONFIG.layout.PW, PH = CONFIG.layout.PH;
const GY = CONFIG.layout.GY, MY = CONFIG.layout.MY, TY = CONFIG.layout.TY;
const BW = CONFIG.layout.BW, BH = CONFIG.layout.BH;
const walkOffset = CONFIG.layout.walkOffset;

// ── Shared scene ─────────────────────────────────────────────────────────────
// Stairs, boards, desks, bell and player start are the same in every level —
// they are physical elements of the building fixed in bg.png.
// Only mechanics (what Marco can do) and NPCs change per level.

var SHARED_LAYOUT = {
  playerStart: { x: 35, y: GY - PH - walkOffset },

  /*stairs: [
    {x1:87,  y1:GY, x2:27,  y2:MY},  // GY→MY left
    {x1:235, y1:GY, x2:285, y2:MY},  // GY→MY right
    {x1:95,  y1:MY, x2:35, y2:TY},  // MY→TY left
    {x1:225, y1:MY, x2:285, y2:TY},  // MY→TY right
  ],*/

  stairs: [
    {x1:88,  y1:GY-walkOffset, x2:35,  y2:MY-walkOffset},  // GY→MY sx
    {x1:232, y1:GY-walkOffset, x2:285, y2:MY-walkOffset},  // GY→MY dx
    {x1:90,  y1:MY-walkOffset, x2:33,  y2:TY-walkOffset},  // MY→TY sx
    {x1:232, y1:MY-walkOffset, x2:285, y2:TY-walkOffset},  // MY→TY dx
  ],

  boards: [
    {x:130, y:GY-44},
    {x:130, y:MY-43},
    {x:72,  y:TY-41}, {x:130, y:TY-41},
  ],

  desks: [
    {x:131, y:GY-22}, {x:155, y:GY-22},
    {x:179, y:GY-22},
    {x:155, y:MY-22},
    {x:179, y:MY-22},
    {x:61,  y:TY-20}, {x:84,  y:TY-20},
    {x:158, y:TY-20}, {x:182, y:TY-20},
  ],
  //{x:131, y:MY-22}, 

  bell: { x: 14, y: GY - 51 },

  machines: [],  // override per-level; default empty
};
