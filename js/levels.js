// Level definitions — edit here to change layout, enemies, objects, and mechanics per level.
// Loaded after config.js; CONFIG.layout and CONFIG.colors are available.
//
// mechanics: declares which player actions are active objectives in this level.
//   writeBoards — spray all boards to tag them
//   stealBags   — collect all classmates' bags
//   ringBell    — ring the bell to complete the level
//
// rooms: named zones for context-aware gameplay (populate when a level needs them).
//   { id, name, x, y, w, h, actions:[] }
//   physics.js keeps player.currentRoom updated; tryAction() checks room.actions.

var LEVELS = (function() {
  var L = CONFIG.layout;
  var C = CONFIG.colors;
  return [

    // ── LEVEL 1 — Tag all boards, ring the bell ──────────────────────────────
    {
      timer: 60,
      playerStart: { x: 40, y: L.GY - L.PH },

      mechanics: {
        writeBoards: true,
        stealBags:   false,
        ringBell:    true,
      },

      rooms: [],

      stairs: [
        {x1:80,  y1:L.GY, x2:30,  y2:L.MY},  // GY→MY left
        {x1:240, y1:L.GY, x2:290, y2:L.MY},  // GY→MY right
        {x1:60,  y1:L.MY, x2:110, y2:L.TY},  // MY→TY left
        {x1:210, y1:L.MY, x2:260, y2:L.TY},  // MY→TY right
      ],

      boards: [
        {x:14,  y:L.TY-34}, {x:142, y:L.TY-34}, {x:274, y:L.TY-34},
        {x:14,  y:L.MY-34}, {x:142, y:L.MY-34}, {x:274, y:L.MY-34},
      ],

      bags: [],

      desks: [
        // GY floor — clear of stairs (x30-80, x240-290)
        {x:92,  y:L.GY-12}, {x:116, y:L.GY-12}, {x:140, y:L.GY-12},
        {x:168, y:L.GY-12}, {x:192, y:L.GY-12}, {x:216, y:L.GY-12},
        // MY floor — clear of stairs (x30, x60-110, x210-260)
        {x:120, y:L.MY-12}, {x:144, y:L.MY-12},
        {x:164, y:L.MY-12}, {x:184, y:L.MY-12},
        // TY floor — clear of stairs (x110, x260)
        {x:52,  y:L.TY-12}, {x:76,  y:L.TY-12},
        {x:168, y:L.TY-12}, {x:196, y:L.TY-12},
      ],

      bell: { x: 304, y: L.TY - 32 },

      teachers: [
        {x:200, y:L.GY-L.PH, dir:1,  minX:10, maxX:305, speed:0.55, color:C.red,   name:'Prof.Rossi', sight:90 },
        {x:80,  y:L.MY-L.PH, dir:-1, minX:10, maxX:305, speed:0.50, color:C.green, name:'Prof.Verdi', sight:80 },
        {x:230, y:L.TY-L.PH, dir:1,  minX:10, maxX:275, speed:0.60, color:C.mgray, name:'Prof.Neri',  sight:100},
      ],

      janitors: [],
    },

  ];
})();
