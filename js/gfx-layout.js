// ═══════════════════════════════════════════════════════════
//  GFX LAYOUT — game world dimensions and scene structure
//  Edit here to change canvas coordinates and shared scene data.
//  Colors → gfx-palette.js  |  UI/banners → gfx-ui.js
// ═══════════════════════════════════════════════════════════

// First section of CONFIG.vis: layout (must come before the shortcut constants)
CONFIG.vis = {

  layout: {
    W: 320, H: 200,              // dimensioni canvas logiche (px)
    GY: 185, MY: 127, TY: 70,    // Y pavimento Ground / Middle / Top floor
    BW: 22, BH: 14,              // board (lavagna) width × height
    walkOffset: 6,               // px sopra la superficie dove cammina il personaggio
    wallLeft: 10, wallRight: 10, // #78 — margini muro sx/dx (pixel logici)
  },

};

// Shortcut constants — usati in tutti i moduli
const W = CONFIG.vis.layout.W, H = CONFIG.vis.layout.H;
const GY = CONFIG.vis.layout.GY, MY = CONFIG.vis.layout.MY, TY = CONFIG.vis.layout.TY;
const BW = CONFIG.vis.layout.BW, BH = CONFIG.vis.layout.BH;
const walkOffset = CONFIG.vis.layout.walkOffset;
const wallLeft = CONFIG.vis.layout.wallLeft, wallRight = CONFIG.vis.layout.wallRight;

// Rest of CONFIG.vis — uses the shortcut constants defined above
// All canvas coords are in logical 320×200 space (ctx.scale 2×).
Object.assign(CONFIG.vis, {

  // Shared scene — stairs, boards, desks, bell are the same in every level.
  // Physical elements fixed in bg.png; only mechanics and NPCs change per level.
  // playerStart is defined in gfx-chars.js (needs PH, which is defined there).
  shared: {

    // fdTop: px above the walking surface where the sprite starts to appear
    // fdBot: px below the walking surface where the sprite disappears
    stairs: [
      {x1:90,  y1:GY-walkOffset, x2:37,  y2:MY-walkOffset, fdTop:4, fdBot:12},  // GY→MY sx
      {x1:232, y1:GY-walkOffset, x2:285, y2:MY-walkOffset, fdTop:4, fdBot:12},  // GY→MY dx
      {x1:92,  y1:MY-walkOffset, x2:35,  y2:TY-walkOffset, fdTop:4, fdBot:12},  // MY→TY sx
      {x1:232, y1:MY-walkOffset, x2:285, y2:TY-walkOffset, fdTop:4, fdBot:12},  // MY→TY dx
    ],

    boards: [
      {x:130, y:GY-44},
      {x:130, y:MY-43},
      {x:72,  y:TY-41}, {x:130, y:TY-41},
    ],

    desks: [
      {x:155, y:GY-22}, {x:179, y:GY-22},
      {x:155, y:MY-22}, {x:179, y:MY-22},
      {x:62,  y:TY-20}, {x:85,  y:TY-20}, {x:158, y:TY-20}, {x:182, y:TY-20},
    ],

    bell: { x: 7, y: GY - 49 },
  },

  // Proximity dashed borders — { x, y, w, h } offset from object's top-left (bx, by)
  dashed: {
    gymBall:    { x:-2, y:-2,  w:13, h:13 },
    bookcase:   { x:0,  y:-8,  w:28, h:46 },
    sprinklers: { x:-2, y:-4,  w:12, h:9  },
    bins:       { x:-2, y:-16, w:14, h:18 },
    sink:       { x:-2, y:-11, w:16, h:13 },
    bags:       { x:-1, y:-1,  w:16, h:12 },
    machines:   { x:-2, y:-2,  w:14, h:22 },
    register:   { x:-2, y:-4,  w:14, h:18 },
    exitDoor:   { x:-2, y:-14, w:14, h:30 },
  },

});

// Alias for backwards compatibility with levels.js
var SHARED_LAYOUT = CONFIG.vis.shared;

// CSS custom properties — layout only (bezel vars → gfx-ui.js)
document.documentElement.style.setProperty('--btr-zoom', CONFIG.display.desktopZoom);
