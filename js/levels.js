// Level definitions — edit here to change mechanics and NPCs per level.
// Loaded after layout.js; SHARED_LAYOUT, CONFIG.layout and CONFIG.colors are available.
//
// mechanics: declares which player actions are active objectives in this level.
//   writeBoards  — spray all boards to tag them (boards are always drawn, writable only in L1)
//   stealBags    — collect all classmates' bags
//   shakeMachines — hold action near a vending machine to smash it
//   ringBell     — ring the bell to complete the level (required in every level)
//
// rooms: named zones for context-aware gameplay (populate when a level needs them).
//   { id, name, x, y, w, h, actions:[] }

var LEVELS = (function() {
  var C = CONFIG.colors;
  return [

    // ── LEVEL 1 — Tag all boards, ring the bell ──────────────────────────────
    Object.assign({}, SHARED_LAYOUT, {
      timer: 60,

      mechanics: {
        writeBoards: true,
        stealBags:   false,
        ringBell:    true,
      },


      bags: [],

      teachers: [
        {x:200, y:GY-PH-walkOffset, dir:1,  minX:10, maxX:305, speed:0.55, color:C.redprof, name:'Prof.Rossi', sight:90 },
        {x:80,  y:MY-PH-walkOffset, dir:-1, minX:10, maxX:305, speed:0.50, color:C.cyanprof, name:'Prof.Celeste', sight:80 },
        {x:230, y:TY-PH-walkOffset, dir:1,  minX:10, maxX:275, speed:0.60, color:C.grayprof, name:'Prof.Neri',  sight:100},
      ],

      janitors: [],
    }),

    // ── LEVEL 2 — Steal all classmates' bags, ring the bell ──────────────────
    Object.assign({}, SHARED_LAYOUT, {
      timer: 90,

      mechanics: {
        writeBoards: false,
        stealBags:   true,
        ringBell:    true,
      },



      bags: [
        {x:100, y:GY-10}, {x:220, y:GY-10},
        {x:130, y:MY-10}, {x:185, y:MY-10},
        {x:60,  y:TY-10}, {x:235, y:TY-10},
      ],

      teachers: [
        {x:200, y:GY-PH-walkOffset, dir:1,  minX:10, maxX:305, speed:0.55, color:C.redprof, name:'Prof.Rossi', sight:90 },
        {x:80,  y:MY-PH-walkOffset, dir:-1, minX:10, maxX:305, speed:0.50, color:C.cyanprof, name:'Prof.Celeste', sight:80 },
        {x:230, y:TY-PH-walkOffset, dir:1,  minX:10, maxX:275, speed:0.60, color:C.grayprof, name:'Prof.Neri',  sight:100},
      ],

      janitors: [
        {x:160, y:GY-PH-walkOffset, dir:1,  minX:90,  maxX:230, speed:0.65, name:'Bidello'},
        {x:140, y:TY-PH-walkOffset, dir:-1, minX:115, maxX:200, speed:0.65, name:'Bidello'},
      ],
    }),

    // ── LEVEL 3 — Smash all vending machines, ring the bell ─────────────────
    Object.assign({}, SHARED_LAYOUT, {
      timer: 90,

      mechanics: {
        writeBoards:   false,
        stealBags:     false,
        shakeMachines: true,
        ringBell:      true,
      },

      bags: [],

      machines: [
        {x:16,  y:GY-25},  // ground floor, left room (x < 107)
        {x:293, y:GY-25},  // ground floor, right room (x > 213)
        {x:293, y:MY-25},  // middle floor, right room (x > 213)
      ],

      teachers: [
        {x:200, y:GY-PH-walkOffset, dir:1,  minX:10, maxX:305, speed:0.55, color:C.redprof,  name:'Prof.Rossi',    sight:90 },
        {x:80,  y:MY-PH-walkOffset, dir:-1, minX:10, maxX:305, speed:0.50, color:C.cyanprof, name:'Prof.Celeste',  sight:80 },
        {x:230, y:TY-PH-walkOffset, dir:1,  minX:10, maxX:275, speed:0.60, color:C.grayprof, name:'Prof.Neri',     sight:100},
      ],

      janitors: [
        {x:160, y:GY-PH-walkOffset, dir:1,  minX:90,  maxX:230, speed:0.65, name:'Bidello'},
        {x:140, y:TY-PH-walkOffset, dir:-1, minX:115, maxX:200, speed:0.65, name:'Bidello'},
      ],
    }),

  ];
})();
