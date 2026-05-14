// Level definitions — edit here to change mechanics and NPCs per level.
// Loaded after layout.js; SHARED_LAYOUT, CONFIG.layout and CONFIG.colors are available.
//
// mechanics: declares which player actions are active objectives in this level.
//   writeBoards   — spray all boards to tag them (boards are always drawn, writable only in L1)
//   stealBags     — collect all classmates' bags
//   shakeMachines — hold action near a vending machine to smash it
//   deflateBall   — hold action near the gym ball to deflate it (L4)
//   throwPaper    — press action to throw a paper ball at seated students (L5)
//   ringBell      — ring the bell to complete the level (required in every level)
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
        {x:120, y:GY-18}, {x:182, y:GY-18},
        {x:178, y:MY-18},
        {x:78,  y:TY-18}, {x:158,  y:TY-18},
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
        {x:91,  y:GY-38},
        {x:279, y:MY-38},
        {x:36, y:TY-36},
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

    // ── LEVEL 4 — Deflate the gym ball, ring the bell ────────────────────────
    Object.assign({}, SHARED_LAYOUT, {
      timer: 70,

      mechanics: {
        writeBoards:   false,
        stealBags:     false,
        shakeMachines: false,
        deflateBall:   true,
        ringBell:      true,
      },

      bags: [],
      gymBall: {x:255, y:MY-17},

      // PE teacher on the gym floor (MY), patrols ONLY the gym area so they are
      // always visible near the ball. Preside is reserved for L6.
      teachers: [
        {x:255, y:MY-PH-walkOffset, dir:1, minX:110, maxX:305, speed:0.80, color:C.green, name:'Prof.Ginnastica', sight:130},
        {x:200, y:GY-PH-walkOffset, dir:1, minX:10,  maxX:305, speed:0.55, color:C.redprof,  name:'Prof.Rossi', sight:90},
        {x:230, y:TY-PH-walkOffset, dir:1, minX:10,  maxX:275, speed:0.60, color:C.grayprof, name:'Prof.Neri',  sight:100},
      ],

      janitors: [
        {x:160, y:GY-PH-walkOffset, dir:1,  minX:90,  maxX:230, speed:0.65, name:'Bidello'},
      ],
    }),

    // ── LEVEL 5 — Throw paper balls at students, ring the bell ───────────────
    Object.assign({}, SHARED_LAYOUT, {
      timer: 90,

      mechanics: {
        writeBoards: false,
        stealBags:   false,
        throwPaper:  true,
        ringBell:    true,
      },

      bags: [],

      students: [
        {x:159, y:GY-19}, {x:183, y:GY-19},
        {x:159, y:MY-19}, {x:183, y:MY-19},
        {x:162, y:TY-17}, {x:186, y:TY-17},
      ],

      // Teachers near the blackboard (x≈130) simulating active lesson.
      // Limited patrol range so they look like they're teaching, not wandering.
      // No janitors — hallways are empty during class.
      teachers: [
        {x:138, y:GY-PH-walkOffset, dir:-1, minX:115, maxX:205, speed:0.40, color:C.redprof,  name:'Prof.Rossi',   sight:90},
        {x:138, y:MY-PH-walkOffset, dir:-1, minX:115, maxX:205, speed:0.40, color:C.cyanprof, name:'Prof.Celeste', sight:80},
        {x:100, y:TY-PH-walkOffset, dir:-1, minX:50,  maxX:195, speed:0.40, color:C.grayprof, name:'Prof.Neri',    sight:100},
      ],

      janitors: [],
    }),

  ];
})();
