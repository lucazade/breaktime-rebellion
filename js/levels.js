// Level definitions — edit here to change mechanics and NPCs per level.
// Loaded after layout.js; SHARED_LAYOUT, CONFIG.layout and CONFIG.colors are available.
//
// mechanics: declares which player actions are active objectives in this level.
//   writeBoards   — spray all boards to tag them (boards are always drawn, writable only in L1)
//   stealBags     — collect all classmates' bags
//   shakeMachines — hold action near a vending machine to smash it
//   deflateBall   — hold action near the gym ball to deflate it (L4)
//   throwPaper    — press action to throw a paper ball at seated students (L5)
//   dropBook      — hold action near the bookcase to knock a book off the shelf (L6)
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
      timer: 60,

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
      timer:     60,
      shakeTime: 150, // frames to hold action near a machine (≈2.5s at 60fps)

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
      timer:       60,
      deflateTime: 80, // frames to hold action near the ball (≈1.3s at 60fps)

      mechanics: {
        writeBoards:   false,
        stealBags:     false,
        shakeMachines: false,
        deflateBall:   true,
        ringBell:      true,
      },

      bags: [],
      gymBall: {x:288, y:MY-15},

      // PE teacher on the gym floor (MY), patrols ONLY the gym area so they are
      // always visible near the ball. Preside is reserved for L6.
      teachers: [
        {x:255, y:MY-PH-walkOffset, dir:1, minX:110, maxX:305, speed:0.80, color:C.greenprof, name:'Prof.Ginnastica', sight:130},
        {x:200, y:GY-PH-walkOffset, dir:1, minX:10,  maxX:305, speed:0.55, color:C.redprof,  name:'Prof.Rossi', sight:90},
        {x:230, y:TY-PH-walkOffset, dir:1, minX:10,  maxX:275, speed:0.60, color:C.grayprof, name:'Prof.Neri',  sight:100},
      ],

      janitors: [
        {x:160, y:GY-PH-walkOffset, dir:1,  minX:90,  maxX:230, speed:0.65, name:'Bidello'},
      ],
    }),

    // ── LEVEL 5 — Throw paper balls at students, ring the bell ───────────────
    Object.assign({}, SHARED_LAYOUT, {
      timer: 60,

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

    // ── LEVEL 6 — Drop books in the principal's office, ring the bell ────────
    Object.assign({}, SHARED_LAYOUT, {
      timer:    75,
      dropTime: 40, // frames to hold action near the bookcase (≈0.7s at 60fps)

      mechanics: {
        writeBoards: false,
        dropBook: true,
        ringBell: true,
      },

      bags: [],
      // Bookcase is the rightmost fixture on the ground floor (yellow room).
      bookcase: {x:288, y:GY-43, fallDx:-30, fallDy:28},

      // Only the Preside patrols the ground floor — sole threat, full patrol range.
      teachers: [
        {x:260, y:GY-PH-walkOffset, dir:-1, minX:10, maxX:305, speed:1.0, color:'#1a1a4a', name:'Preside', sight:150},
      ],

      janitors: [],
    }),

    // ── LEVEL 7 — Flood the bathroom, ring the bell ──────────────────────────
    Object.assign({}, SHARED_LAYOUT, {
      timer:     75,
      floodTime: 80, // frames to hold action per pour (≈1.3s at 60fps)

      mechanics: {
        writeBoards: false,
        floodSink: true,
        ringBell:  true,
      },

      bags: [],
      // Sink in the leftmost room on the middle floor (bathroom)
      sink: {x:32, y:MY-21},

      teachers: [
        {x:200, y:GY-PH-walkOffset, dir: 1, minX:10, maxX:305, speed:0.55, color:C.redprof, name:'Prof.Rossi', sight:90},
      ],

      janitors: [
        {x:185, y:MY-PH-walkOffset, dir:-1, minX:10, maxX:220, speed:0.65, name:'Bidello'},
      ],
    }),

    // ── LEVEL 8 — Plant firecrackers in all trash bins, ring the bell ────────
    Object.assign({}, SHARED_LAYOUT, {
      timer: 90,

      mechanics: {
        writeBoards: false,
        plantBomb: true,
        ringBell:  true,
      },

      bags: [],
      bins: [
        {x:35,  y:GY-20}, // entrance — leftmost room, ground floor
        {x:278, y:MY-20}, // gym — rightmost room, middle floor
        {x:296, y:TY-3}, // terrace — rightmost room, top floor
      ],

      teachers: [
        {x:200, y:GY-PH-walkOffset, dir: 1, minX:10, maxX:305, speed:0.60, color:C.redprof,  name:'Prof.Rossi',      sight:90},
        {x:80,  y:MY-PH-walkOffset, dir:-1, minX:10, maxX:305, speed:0.55, color:C.greenprof,    name:'Prof.Ginnastica', sight:100},
        {x:230, y:TY-PH-walkOffset, dir: 1, minX:10, maxX:275, speed:0.60, color:C.grayprof, name:'Prof.Neri',       sight:90},
      ],

      janitors: [],
    }),

    // ── LEVEL 9 — Trigger fire sprinklers, ring the bell ─────────────────────
    Object.assign({}, SHARED_LAYOUT, {
      timer:       90,
      lighterTime: 80, // frames to hold lighter under sprinkler (≈1.3s at 60fps)

      mechanics: {
        writeBoards:       false,
        activateSprinkler: true,
        ringBell:          true,
      },

      bags: [],
      sprinklers: [
        {x:90,  y:GY-50, floor:'GY'}, // GY left room (entrance)
        {x:224, y:GY-50, floor:'GY'}, // GY right room
        {x:90,  y:MY-49, floor:'MY'}, // MY left room (bathroom)
        {x:224, y:MY-49, floor:'MY'}, // MY right room (gym)
      ],

      teachers: [
        {x:200, y:GY-PH-walkOffset, dir: 1, minX:10, maxX:305, speed:0.60, color:C.redprof,  name:'Prof.Rossi',   sight:90},
        {x:80,  y:MY-PH-walkOffset, dir:-1, minX:10, maxX:305, speed:0.60, color:C.cyanprof, name:'Prof.Celeste', sight:90},
        {x:230, y:TY-PH-walkOffset, dir: 1, minX:10, maxX:275, speed:0.55, color:C.grayprof, name:'Prof.Neri',    sight:90},
      ],

      janitors: [
        {x:120, y:GY-PH-walkOffset, dir: 1, minX:10, maxX:305, speed:0.65, name:'Bidello'},
        {x:140, y:MY-PH-walkOffset, dir:-1, minX:10, maxX:305, speed:0.65, name:'Bidello'},
      ],
    }),

    // ── LEVEL 10 — Steal the register and escape ─────────────────────────────
    Object.assign({}, SHARED_LAYOUT, {
      timer:        90,
      registerTime: 80,  // frames to steal the register (≈1.3s)
      nightMode:    true,

      playerStart: {x:20, y:TY-PH-walkOffset}, // enters from rightmost TY room

      mechanics: {
        writeBoards:   false,
        stealRegister: true,
        escapeExit:    true,  // win = reach exit door with register (no bell)
        ringBell:      false,
      },

      bags: [],
      // Register is in the principal's office (GY right / yellow room)
      register: {x:278, y:GY-16},
      // Exit door: GY left room entrance (the main door in bg.png)
      exitDoor:  {x:13,  y:GY-24},

      // Three night guards — larger catch radius (within torch light)
      teachers: [
        {x:200, y:GY-PH-walkOffset, dir: 1, minX:10, maxX:305, speed:0.50, color:'#1a1a3a', name:'Guardiano', sight:110, catchRadius:20},
        {x:80,  y:MY-PH-walkOffset, dir:-1, minX:10, maxX:305, speed:0.45, color:'#1a1a3a', name:'Guardiano', sight:110, catchRadius:20},
        {x:230, y:TY-PH-walkOffset, dir: 1, minX:10, maxX:275, speed:0.45, color:'#1a1a3a', name:'Guardiano', sight:100, catchRadius:20},
      ],

      janitors: [],
    }),

  ];
})();
