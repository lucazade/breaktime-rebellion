// Level definitions — edit here to change layout, enemies, objects, and mechanics per level.
// Loaded after config.js; CONFIG.layout and CONFIG.colors are available.
//
// mechanics: declares which player actions are active objectives in this level.
//   writeBoards — spray all boards to tag them (boards are always drawn but only writable in L1)
//   stealBags   — collect all classmates' bags
//   ringBell    — ring the bell to complete the level (required in every level)
//
// rooms: named zones for context-aware gameplay (populate when a level needs them).
//   { id, name, x, y, w, h, actions:[] }

var LEVELS = (function() {
  var L = CONFIG.layout;
  var C = CONFIG.colors;

  // Shared across all levels — structural elements baked into bg.png
  var shared = {
    playerStart: { x: 30, y: L.GY - L.PH },

    stairs: [
      {x1:83,  y1:L.GY, x2:33,  y2:L.MY},  // GY→MY left
      {x1:239, y1:L.GY, x2:289, y2:L.MY},  // GY→MY right
      {x1:60,  y1:L.MY, x2:110, y2:L.TY},  // MY→TY left
      {x1:210, y1:L.MY, x2:260, y2:L.TY},  // MY→TY right
    ],

    boards: [
      {x:142, y:L.GY-43},
      {x:14,  y:L.MY-39}, {x:142, y:L.MY-39}, {x:274, y:L.MY-39},
      {x:14,  y:L.TY-35}, {x:142, y:L.TY-35},
    ],

    desks: [
      {x:116, y:L.GY-16}, {x:140, y:L.GY-16},
      {x:164, y:L.GY-16}, {x:188, y:L.GY-16},
      {x:128, y:L.MY-14}, {x:152, y:L.MY-14},
      {x:176, y:L.MY-14},
      {x:42,  y:L.TY-13}, {x:66,  y:L.TY-13},
      {x:162, y:L.TY-13}, {x:186, y:L.TY-13},
    ],

    bell: { x: 304, y: L.TY - 32 },
  };

  return [

    // ── LEVEL 1 — Tag all boards, ring the bell ──────────────────────────────
    Object.assign({}, shared, {
      timer: 60,

      mechanics: {
        writeBoards: true,
        stealBags:   false,
        ringBell:    true,
      },

      rooms: [],
      bags: [],

      teachers: [
        {x:200, y:L.GY-L.PH, dir:1,  minX:10, maxX:305, speed:0.55, color:C.red,   name:'Prof.Rossi', sight:90 },
        {x:80,  y:L.MY-L.PH, dir:-1, minX:10, maxX:305, speed:0.50, color:C.green, name:'Prof.Verdi', sight:80 },
        {x:230, y:L.TY-L.PH, dir:1,  minX:10, maxX:275, speed:0.60, color:C.mgray, name:'Prof.Neri',  sight:100},
      ],

      janitors: [],
    }),

    // ── LEVEL 2 — Steal all classmates' bags, ring the bell ──────────────────
    Object.assign({}, shared, {
      timer: 90,

      mechanics: {
        writeBoards: false,
        stealBags:   true,
        ringBell:    true,
      },

      rooms: [],

      bags: [
        {x:100, y:L.GY-10}, {x:220, y:L.GY-10},
        {x:130, y:L.MY-10}, {x:185, y:L.MY-10},
        {x:60,  y:L.TY-10}, {x:235, y:L.TY-10},
      ],

      teachers: [
        {x:200, y:L.GY-L.PH, dir:1,  minX:10, maxX:305, speed:0.55, color:C.red,   name:'Prof.Rossi', sight:90 },
        {x:80,  y:L.MY-L.PH, dir:-1, minX:10, maxX:305, speed:0.50, color:C.green, name:'Prof.Verdi', sight:80 },
        {x:230, y:L.TY-L.PH, dir:1,  minX:10, maxX:275, speed:0.60, color:C.mgray, name:'Prof.Neri',  sight:100},
      ],

      janitors: [
        {x:160, y:L.GY-L.PH, dir:1,  minX:90,  maxX:230, speed:0.65, name:'Bidello'},
        {x:140, y:L.TY-L.PH, dir:-1, minX:115, maxX:200, speed:0.65, name:'Bidello'},
      ],
    }),

  ];
})();
