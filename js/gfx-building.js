// ═══════════════════════════════════════════════════════════
//  GFX BUILDING — school building geometry: canvas size, floors, stairs
//  Scene objects (boards, desks, bell, dashed) → gfx-objects.js
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

// Shared scene — stairs are structural (fixed in bg.png, same every level).
// boards, desks, bell and dashed are defined in gfx-objects.js.
// playerStart is defined in gfx-chars.js (needs PH, which is defined there).
CONFIG.vis.shared = {

  // fdTop: px above the walking surface where the sprite starts to appear
  // fdBot: px below the walking surface where the sprite disappears
  stairs: [
    {x1:90,  y1:GY-walkOffset, x2:37,  y2:MY-walkOffset, fdTop:4, fdBot:12},  // GY→MY sx
    {x1:232, y1:GY-walkOffset, x2:285, y2:MY-walkOffset, fdTop:4, fdBot:12},  // GY→MY dx
    {x1:92,  y1:MY-walkOffset, x2:35,  y2:TY-walkOffset, fdTop:4, fdBot:12},  // MY→TY sx
    {x1:232, y1:MY-walkOffset, x2:285, y2:TY-walkOffset, fdTop:4, fdBot:12},  // MY→TY dx
  ],

};

// Alias for backwards compatibility with levels.js
var SHARED_LAYOUT = CONFIG.vis.shared;

// CSS custom properties — zoom (display config) and font-family are set elsewhere
document.documentElement.style.setProperty('--btr-zoom', CONFIG.display.desktopZoom);
