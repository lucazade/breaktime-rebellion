// ═══════════════════════════════════════════════════════════
//  DRAW OBJECTS — sprite draw functions for scene objects
//  Layout data (positions, dashed) → scene.js
//  Colors → palette.js
// ═══════════════════════════════════════════════════════════

function drawDesks() {
  if (!_desksCache && DESKS.length > 0) {
    var _oc = document.createElement('canvas');
    _oc.width = CV.width; _oc.height = CV.height;
    var _octx = _oc.getContext('2d');
    _octx.imageSmoothingEnabled = false;
    _octx.scale(_canvasScale, _canvasScale);
    for (var _i = 0; _i < DESKS.length; _i++) {
      var _d = DESKS[_i];
      _octx.fillStyle = PAL.desk; _octx.fillRect(_d.x-1, _d.y-1, 22, 8);
      _octx.fillStyle = PAL.desklt;  _octx.fillRect(_d.x,   _d.y,   20, 6);
      _octx.fillStyle = PAL.desk;    _octx.fillRect(_d.x,   _d.y+5, 20, 2);
      _octx.fillStyle = PAL.chairWood;
      _octx.fillRect(_d.x+1,  _d.y+6, 2, 5);
      _octx.fillRect(_d.x+17, _d.y+6, 2, 5);
    }
    _desksCache = _oc;
  }
  if (_desksCache) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(_desksCache, 0, 0);
    ctx.setTransform(_canvasScale, 0, 0, _canvasScale, 0, 0);
  }
}

function drawBoards() {
  // Proximity highlight — dynamic, depends on player position each frame
  let nearestIdx = -1, nd = 9999;
  if (levelMechanics.writeBoards) {
    for (let i = 0; i < BOARDS.length; i++) {
      if (BOARDS[i].done) continue;
      const d = Math.abs(player.x+PW/2 - BOARDS[i].x-BW/2) + Math.abs(player.y - BOARDS[i].y-BH);
      if (d < nd) { nd = d; nearestIdx = i; }
    }
  }

  // Static boards — rebuild cache only when done states change
  var _key = '';
  for (var _i = 0; _i < BOARDS.length; _i++) _key += BOARDS[_i].done ? '1' : '0';
  if (_key !== _boardsCacheKey) {
    var _oc = document.createElement('canvas'); _oc.width = CV.width; _oc.height = CV.height;
    var _octx = _oc.getContext('2d');
    _octx.imageSmoothingEnabled = false;
    _octx.scale(_canvasScale, _canvasScale);
    _octx.font = '4px ' + FF;
    for (var _j = 0; _j < BOARDS.length; _j++) {
      var _b = BOARDS[_j];
      _octx.fillStyle = PAL.boardFrame;   _octx.fillRect(_b.x-1, _b.y-1, BW+2, BH+2);
      _octx.fillStyle = PAL.boardDark; _octx.fillRect(_b.x, _b.y, BW, BH);
      if (!_b.done) {
        _octx.fillStyle = PAL.boardChalk;
        _octx.fillRect(_b.x+2, _b.y+3, BW-4, 2);
        _octx.fillRect(_b.x+2, _b.y+8, BW-4, 2);
      } else {
        _octx.fillStyle = PAL.speechBubble;
        _octx.fillText('MARCO', _b.x+1, _b.y+9);
        _octx.fillRect(_b.x+1, _b.y+10, BW-2, 1);
      }
    }
    _boardsCache = _oc; _boardsCacheKey = _key;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(_boardsCache, 0, 0);
  ctx.setTransform(_canvasScale, 0, 0, _canvasScale, 0, 0);

  // Proximity dashed border — drawn live on top of cache
  if (nearestIdx >= 0 && nd < 36) {
    const b = BOARDS[nearestIdx];
    ctx.strokeStyle = PAL.objectActiveBorder; ctx.lineWidth = 1;
    ctx.setLineDash([2,2]);
    ctx.strokeRect(b.x-2, b.y-2, BW+4, BH+4);
    ctx.setLineDash([]);
  }
}

function drawBell() {
  const bx = BELL.x, by = BELL.y;
  const sw = BELL.ringing ? Math.round(Math.sin(frame * 0.6) * 3) : 0;
  const X  = bx + sw;

  const out = PAL.bellOutline;
  const col = PAL.bellBody;
  const hi  = PAL.bellHighlight;
  const drk = PAL.bellClapper;

  // Top cap (closes the border)
  ctx.fillStyle = out; ctx.fillRect(X+2, by-1, 2, 1);

  // Knob (2px)
  ctx.fillStyle = out; ctx.fillRect(X+1, by,   4, 1);
  ctx.fillStyle = col; ctx.fillRect(X+2, by,   2, 1);

  // Cap (4px)
  ctx.fillStyle = out; ctx.fillRect(X+0, by+1, 6, 1);
  ctx.fillStyle = col; ctx.fillRect(X+1, by+1, 4, 1);

  // Dome (4px × 1 row)
  ctx.fillStyle = out; ctx.fillRect(X+0, by+2, 6, 1);
  ctx.fillStyle = col; ctx.fillRect(X+1, by+2, 4, 1);
  ctx.fillStyle = hi;  ctx.fillRect(X+1, by+2, 1, 1);
  ctx.fillStyle = col; ctx.fillRect(X+4, by+2, 1, 1);

  // Flare / skirt (6px × 2 rows)
  ctx.fillStyle = out; ctx.fillRect(X-1, by+3, 8, 2);
  ctx.fillStyle = col; ctx.fillRect(X+0, by+3, 6, 1);
  ctx.fillStyle = col; ctx.fillRect(X+0, by+4, 6, 1);
  ctx.fillStyle = hi;  ctx.fillRect(X+0, by+3, 1, 2);

  // Bottom outline
  ctx.fillStyle = out; ctx.fillRect(X-1, by+5, 8, 1);

  // Clapper (2px × 1 row)
  ctx.fillStyle = drk; ctx.fillRect(X+2, by+6, 2, 1);

  // Pulsing glow when the objective is complete — outer halo brighter than inner core
  if ((allBoards || allBags || allMachines || allBall || allStudents || allBooks || allSink || allBins || allSprinklers) && !BELL.done) {
    var _bcx = bx + 3, _bcy = by + 3;
    var _pulse = (1 + Math.sin(frame * 0.14)) / 2;
    ctx.fillStyle = PAL.bellGlow;
    ctx.globalAlpha = 0.13 + 0.14 * _pulse;
    ctx.beginPath(); ctx.arc(_bcx, _bcy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.08 + 0.10 * _pulse;
    ctx.beginPath(); ctx.arc(_bcx, _bcy, 6,  0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawGymBall() {
  if (!gymBall) return;
  const bx = Math.round(gymBall.x), by = Math.round(gymBall.y);
  if (gymBall.deflated) {
    ctx.fillStyle = PAL.ballWood;
    ctx.fillRect(bx, by+5, 9, 3);
    ctx.fillStyle = PAL.ballBody;
    ctx.fillRect(bx+1, by+6, 7, 1);
    return;
  }
  if (gymBall.shakeT > 0) {
    const pct = gymBall.shakeT / deflateTime;
    ctx.fillStyle = PAL.barBg; ctx.fillRect(bx-18, by+2, 14, 5);
    ctx.fillStyle = PAL.barDark; ctx.fillRect(bx-17, by+3, 12, 3);
    ctx.fillStyle = PAL.barFill; ctx.fillRect(bx-17, by+3, Math.round(12 * pct), 3);
  }
  // Basketball — proper pixel circle body + matching circular outline
  ctx.fillStyle = PAL.ballWood;
  ctx.fillRect(bx+2, by-1, 5, 1);                                              // top arc
  ctx.fillRect(bx+1, by,   1, 1); ctx.fillRect(bx+7, by,   1, 1);             // top shoulders
  ctx.fillRect(bx,   by+1, 1, 1); ctx.fillRect(bx+8, by+1, 1, 1);            // upper sides
  ctx.fillRect(bx-1, by+2, 1, 5); ctx.fillRect(bx+9, by+2, 1, 5);            // mid sides
  ctx.fillRect(bx,   by+7, 1, 1); ctx.fillRect(bx+8, by+7, 1, 1);            // lower sides
  ctx.fillRect(bx+1, by+8, 1, 1); ctx.fillRect(bx+7, by+8, 1, 1);            // bottom shoulders
  ctx.fillRect(bx+2, by+9, 5, 1);                                              // bottom arc
  ctx.fillStyle = PAL.ballBody;
  ctx.fillRect(bx+2, by,   5, 1);                                              // body row 0
  ctx.fillRect(bx+1, by+1, 7, 1);                                              // body row 1
  ctx.fillRect(bx,   by+2, 9, 5);                                              // body rows 2-6
  ctx.fillRect(bx+1, by+7, 7, 1);                                              // body row 7
  ctx.fillRect(bx+2, by+8, 5, 1);                                              // body row 8
  ctx.fillStyle = PAL.ballWood;
  ctx.fillRect(bx+4, by, 1, 9); ctx.fillRect(bx, by+4, 9, 1);
  ctx.fillStyle = PAL.ballHighlight; ctx.fillRect(bx+1, by+1, 2, 2);
  if (!allBall) {
    const pdx = Math.abs(player.x + PW/2 - gymBall.x - 4);
    const pdy = Math.abs(player.y + PH  - gymBall.y - 9);
    if (pdx < 14 && pdy < 14) {
      ctx.strokeStyle = PAL.objectActiveBorder; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _dg = CONFIG.scene.dashed.gymBall; ctx.strokeRect(bx+_dg.x, by+_dg.y, _dg.w, _dg.h);
      ctx.setLineDash([]);
    }
  }
}

function drawBookcase() {
  if (!bookcase) return;
  const bx = Math.round(bookcase.x), by = Math.round(bookcase.y);

  if (bookcase.dropped) {
    const fx = bx + bookcase.fallDx, fy = by + bookcase.fallDy;
    if (allBooks) {
      // 3rd drop: book split in two pieces
      // Left half (pages + half spine)
      ctx.fillStyle = PAL.bookcaseOutline; ctx.fillRect(fx-1, fy, 1, 9); ctx.fillRect(fx-1, fy+9, 10, 1); ctx.fillRect(fx, fy, 9, 1);
      ctx.fillStyle = PAL.pageColor; ctx.fillRect(fx,   fy+1, 7, 8);
      ctx.fillStyle = PAL.bookcaseWood; ctx.fillRect(fx+7, fy,   2, 9);
      ctx.fillStyle = PAL.pageLines; ctx.fillRect(fx+1, fy+3, 5, 1); ctx.fillRect(fx+1, fy+5, 5, 1);
      // Right half (half spine + pages) — shifted 3px right, 2px down
      ctx.fillStyle = PAL.bookcaseWood; ctx.fillRect(fx+12, fy+2, 2, 9);
      ctx.fillStyle = PAL.bookcaseOutline; ctx.fillRect(fx+12, fy+2, 9, 1); ctx.fillRect(fx+20, fy+2, 1, 9); ctx.fillRect(fx+12, fy+11, 9, 1);
      ctx.fillStyle = PAL.pageColor; ctx.fillRect(fx+14, fy+3, 6, 8);
      ctx.fillStyle = PAL.pageLines; ctx.fillRect(fx+15, fy+5, 4, 1); ctx.fillRect(fx+15, fy+7, 4, 1);
    } else {
      // 1st/2nd drop: open book lying flat
      ctx.fillStyle = PAL.bookcaseOutline;
      ctx.fillRect(fx-1, fy, 1, 9); ctx.fillRect(fx+18, fy, 1, 9);
      ctx.fillRect(fx-1, fy+9, 20, 1);
      ctx.fillRect(fx,    fy,   18, 1);
      ctx.fillStyle = PAL.pageColor; ctx.fillRect(fx,    fy+1,  7, 8);
      ctx.fillStyle = PAL.pageColor; ctx.fillRect(fx+11, fy+1,  7, 8);
      ctx.fillStyle = PAL.bookcaseWood; ctx.fillRect(fx+7,  fy,    4, 9);
      ctx.fillStyle = PAL.pageLines; ctx.fillRect(fx+1,  fy+3,  5, 1); ctx.fillRect(fx+1,  fy+5, 5, 1);
      ctx.fillStyle = PAL.pageLines; ctx.fillRect(fx+12, fy+3,  5, 1); ctx.fillRect(fx+12, fy+5, 5, 1);
    }
    return;
  }

  // Progress bar while shaking; no book sprite (bg.png shows it in place)
  if (bookcase.shakeT > 0) {
    const pct = bookcase.shakeT / dropTime;
    ctx.fillStyle = PAL.barBg; ctx.fillRect(bx-16, by-6, 14, 5);
    ctx.fillStyle = PAL.barDark; ctx.fillRect(bx-15, by-5, 12, 3);
    ctx.fillStyle = PAL.barFill; ctx.fillRect(bx-15, by-5, Math.round(12 * pct), 3);
  }

  // Proximity dashed border — full bookcase area
  if (!allBooks) {
    const pdx = Math.abs(player.x + PW/2 - bookcase.x - 12);
    const pdy = Math.abs(player.y + PH  - bookcase.y - 26);
    if (pdx < 20 && pdy < 36) {
      ctx.strokeStyle = PAL.objectActiveBorder; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _db = CONFIG.scene.dashed.bookcase; ctx.strokeRect(bx+_db.x, by+_db.y, _db.w, _db.h);
      ctx.setLineDash([]);
    }
  }
}

function drawRegister() {
  if (!register || register.stolen) return;
  const bx = Math.round(register.x), by = Math.round(register.y);
  // Book cover (dark red register)
  ctx.fillStyle = PAL.registerCover; ctx.fillRect(bx, by-2, 10, 14);
  ctx.fillStyle = PAL.registerSpine; ctx.fillRect(bx, by-2, 1, 14);  // spine
  ctx.fillStyle = PAL.registerEdge; ctx.fillRect(bx+1, by-2, 9, 1); // top edge
  // Pages
  ctx.fillStyle = PAL.registerPages; ctx.fillRect(bx+2, by-1, 7, 12);
  // Grade lines
  ctx.fillStyle = PAL.registerLine; ctx.fillRect(bx+3, by+2, 5, 1);
  ctx.fillStyle = PAL.registerGrade; ctx.fillRect(bx+3, by+4, 5, 1);
  ctx.fillStyle = PAL.registerLine; ctx.fillRect(bx+3, by+6, 5, 1);
  ctx.fillStyle = PAL.registerGrade; ctx.fillRect(bx+3, by+8, 5, 1);

  // Progress bar while stealing
  if (register.stealT > 0) {
    const pct = register.stealT / registerTime;
    ctx.fillStyle = PAL.barBg; ctx.fillRect(bx-2, by-26, 14, 5);
    ctx.fillStyle = PAL.barDark; ctx.fillRect(bx-1, by-25, 12, 3);
    ctx.fillStyle = PAL.barFill; ctx.fillRect(bx-1, by-25, Math.round(12 * pct), 3);
  }

  // Proximity border
  if (!allRegister) {
    const pdx = Math.abs(player.x + PW/2 - register.x - 5);
    const pdy = Math.abs(player.y + PH  - register.y - 8);
    if (pdx < 16 && pdy < 20) {
      ctx.strokeStyle = PAL.proximityBorder; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _dr = CONFIG.scene.dashed.register; ctx.strokeRect(bx+_dr.x, by+_dr.y, _dr.w, _dr.h);
      ctx.setLineDash([]);
    }
  }
}

function drawExitDoor() {
  if (!exitDoor || !allRegister) return;
  const bx = Math.round(exitDoor.x), by = Math.round(exitDoor.y);
  const pdx = Math.abs(player.x + PW/2 - exitDoor.x - 6);
  const pdy = Math.abs(player.y + PH  - exitDoor.y - 10);
  if (pdx < 22 && pdy < 30) {
    const blink = Math.floor(frame / 10) % 2 === 0;
    ctx.strokeStyle = blink ? PAL.proximityBorder : PAL.sprinklerActiveBorder; ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    const _de = CONFIG.scene.dashed.exitDoor; ctx.strokeRect(bx+_de.x, by+_de.y, _de.w, _de.h);
    ctx.setLineDash([]);
  }
}

function drawSprinklers() {
  for (let i = 0; i < sprinklers.length; i++) {
    const sp = sprinklers[i];
    const bx = Math.round(sp.x), by = Math.round(sp.y);
    const floorY = by > 110 ? Math.round(GY - walkOffset) : Math.round(MY - walkOffset);

    // Water umbrella when active (widens toward floor)
    if (sp.active) {
      const range = floorY - by - 4;
      ctx.fillStyle = PAL.waterStream;
      for (let wy = by + 4; wy < floorY; wy += 4) {
        const spread = Math.floor((wy - by - 4) / range * 5); // 0→5 spread
        const wx = Math.floor(Math.sin((wy + frame * 0.5) * 0.6) * 1);
        ctx.fillRect(bx + 1 - spread + wx, wy, 2, 3); // left stream
        ctx.fillRect(bx + 5 + spread + wx, wy, 2, 3); // right stream
        if (spread >= 2) ctx.fillRect(bx + 3 + wx, wy, 2, 3); // centre
      }
      // Floor splash (wider at base)
      ctx.fillStyle = PAL.waterSplash;
      ctx.fillRect(bx - 6, floorY - 2, 20, 3);
    }

    // Sprinkler fixture — disc + head only (no stem above ceiling)
    ctx.fillStyle = PAL.sprinklerDisc; ctx.fillRect(bx,   by-2, 8, 2);    // deflector disc
    ctx.fillStyle = sp.active ? PAL.sprinklerActive : PAL.sprinklerInactive;
    ctx.fillRect(bx+2, by, 4, 3);                              // head (red = active)
    ctx.strokeStyle = PAL.sprinklerBorder; ctx.lineWidth = 1;               // T-border (no top)
    ctx.beginPath();
    ctx.moveTo(bx,   by-2); ctx.lineTo(bx,   by);   // left side of disc
    ctx.lineTo(bx+2, by);   ctx.lineTo(bx+2, by+3); // step in + left side of head
    ctx.lineTo(bx+6, by+3); ctx.lineTo(bx+6, by);   // bottom of head + right side of head
    ctx.lineTo(bx+8, by);   ctx.lineTo(bx+8, by-2); // step out + right side of disc
    ctx.stroke();

    // Progress bar just below the sprinkler head
    if (sp.lighterT > 0 && !sp.active) {
      const pct = sp.lighterT / lighterTime;
      ctx.fillStyle = PAL.barBg; ctx.fillRect(bx-3, by+8, 14, 5);
      ctx.fillStyle = PAL.barDark; ctx.fillRect(bx-2, by+9, 12, 3);
      ctx.fillStyle = PAL.barFill; ctx.fillRect(bx-2, by+9, Math.round(12 * pct), 3);
    }

    // Proximity dashed border — same floor only
    if (!allSprinklers && !sp.active) {
      const pdFloor = player.y > (MY+GY)/2 ? 'GY' : player.y > (TY+MY)/2 ? 'MY' : 'TY';
      if (!sp.floor || sp.floor === pdFloor) {
        const pdx = Math.abs(player.x + PW/2 - sp.x - 4);
        const pdy = Math.abs(player.y - sp.y);
        if (pdx < 16 && pdy < 50) {
          ctx.strokeStyle = PAL.objectActiveBorder; ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          const _ds = CONFIG.scene.dashed.sprinklers; ctx.strokeRect(bx+_ds.x, by+_ds.y, _ds.w, _ds.h);
          ctx.setLineDash([]);
        }
      }
    }
  }

  // Lighter flame above Marco when shaking near a sprinkler
  if (player.shaking && levelMechanics.activateSprinkler) {
    const fx = Math.round(player.x + PW/2 - 1);
    const fy = Math.round(player.y) - 4;
    const flicker = Math.floor(frame / 2) % 3;
    ctx.fillStyle = PAL.flame; ctx.fillRect(fx, fy - flicker,     2, 3);
    ctx.fillStyle = PAL.lighterSpark;  ctx.fillRect(fx, fy - flicker - 2, 2, 2);
  }
}

function drawBins() {
  for (let i = 0; i < bins.length; i++) {
    const b = bins[i];
    const bx = Math.round(b.x), by = Math.round(b.y);

    if (b.exploded) {
      // Charred debris
      ctx.fillStyle = PAL.charred; ctx.fillRect(bx-2, by-5, 13, 5);
      ctx.fillStyle = PAL.charredGray;    ctx.fillRect(bx-4, by-7,  3, 2);
      ctx.fillStyle = PAL.charredGray;    ctx.fillRect(bx+11,by-8,  3, 2);
      ctx.fillStyle = PAL.binCharredDark;    ctx.fillRect(bx+2, by-9,  2, 3);
      continue;
    }

    // Lid
    ctx.fillStyle = PAL.binLid; ctx.fillRect(bx, by-14, 10, 3);
    ctx.fillStyle = PAL.binDark; ctx.fillRect(bx+1, by-15, 8, 1); // top rim
    // Body
    ctx.fillStyle = PAL.binBody; ctx.fillRect(bx, by-11, 10, 11);
    ctx.fillStyle = PAL.binShadow; ctx.fillRect(bx, by-11, 1, 11); // left shadow
    // Dark green border (overwrite existing edge pixels, no external expansion)
    ctx.fillStyle = PAL.binDark;
    ctx.fillRect(bx,   by-14, 1,  14); // left
    ctx.fillRect(bx+9, by-14, 1,  14); // right
    ctx.fillRect(bx,   by-1,  10,  1); // bottom

    // Triangle (vertex down) as recycle symbol
    ctx.fillStyle = PAL.binRecycle;
    ctx.fillRect(bx+2, by-9, 6, 1); // base
    ctx.fillRect(bx+3, by-8, 4, 1); // middle
    ctx.fillRect(bx+4, by-7, 2, 1); // bottom vertex

    // Fuse animation (speeds up as timer runs out)
    if (b.lit) {
      const speed = b.fuseT > 90 ? 8 : b.fuseT > 40 ? 5 : 2;
      if (Math.floor(frame / speed) % 2 === 0) {
        ctx.fillStyle = PAL.flame; ctx.fillRect(bx+4, by-16, 2, 3);
        ctx.fillStyle = PAL.lighterSpark;  ctx.fillRect(bx+4, by-17, 2, 1);
      }
      // Fuse countdown bar
      const pct = b.fuseT / 180;
      ctx.fillStyle = PAL.barBg; ctx.fillRect(bx-2, by-25, 14, 5);
      ctx.fillStyle = PAL.barDark; ctx.fillRect(bx-1, by-24, 12, 3);
      ctx.fillStyle = PAL.barFill; ctx.fillRect(bx-1, by-24, Math.round(12 * pct), 3);
    }

    // Proximity dashed border
    if (!allBins && !b.lit) {
      const pdx = Math.abs(player.x + PW/2 - b.x - 5);
      const pdy = Math.abs(player.y + PH  - b.y - 7);
      if (pdx < 16 && pdy < 20) {
        ctx.strokeStyle = PAL.objectActiveBorder; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        const _dbn = CONFIG.scene.dashed.bins; ctx.strokeRect(bx+_dbn.x, by+_dbn.y, _dbn.w, _dbn.h);
        ctx.setLineDash([]);
      }
    }
  }
}

function drawSink() {
  if (!sink) return;
  const bx = Math.round(sink.x), by = Math.round(sink.y);
  const fy = Math.round(MY - walkOffset + 1); // floor level

  // Water puddle on floor — starts past the wall (x=12), grows rightward
  if (sink.waterLevel > 0 || allSink) {
    const wx = 12;
    const w = Math.min(Math.floor(sink.floodSpread), W - 10 - wx); // grows from 0 to full floor
    if (w > 0) {
      ctx.fillStyle = PAL.waterPuddleDark;
      ctx.fillRect(wx, fy-2, Math.min(w, 8), 2);
      ctx.fillStyle = PAL.waterPuddleMain;
      ctx.fillRect(wx, fy, w, 4);
      ctx.fillStyle = PAL.waterHighlight;
      ctx.fillRect(wx, fy, w, 1);
      ctx.fillStyle = PAL.waterRipple;
      const rOff = Math.floor(frame / 6) % 12;
      for (let rx = wx + rOff; rx < wx + w; rx += 12) ctx.fillRect(rx, fy+2, 5, 1);
    }
  }

  // Mirror — small, centered over the 12px-wide basin (bx+1 to bx+11)
  ctx.fillStyle = PAL.mirrorFrame; ctx.fillRect(bx+1, by-20, 10,  8); // dark frame
  ctx.fillStyle = PAL.mirrorGlass; ctx.fillRect(bx+2, by-19,  8,  6); // glass
  ctx.fillStyle = PAL.mirrorHighlight; ctx.fillRect(bx+3, by-18, 2, 3); // highlight

  // Tap (wall pipe below mirror gap)
  ctx.fillStyle = PAL.sinkTap; ctx.fillRect(bx+5, by-10, 2, 3);
  ctx.fillStyle = PAL.sinkTapHandle; ctx.fillRect(bx+4, by-10, 1, 1);

  // Sink basin
  ctx.fillStyle = PAL.sinkBasinOuter; ctx.fillRect(bx-1, by-9, 14, 10);
  ctx.fillStyle = PAL.sinkBasinMid; ctx.fillRect(bx,   by-8, 12, 8);
  ctx.fillStyle = PAL.sinkBasinInner; ctx.fillRect(bx+1, by-7, 10, 6);
  ctx.fillStyle = PAL.sinkDrain; ctx.fillRect(bx+5, by-2,  2, 1); // drain

  // Dripping animation while pouring
  if (sink.pourT > 0) {
    const drop = Math.floor(frame / 3) % 5;
    ctx.fillStyle = PAL.waterDrop;
    ctx.fillRect(bx+5, by-8+drop, 2, 2);
    if (drop >= 3) {
      ctx.fillStyle = PAL.waterDrip;
      ctx.fillRect(bx+3, by-3, 2, 1); ctx.fillRect(bx+7, by-3, 2, 1);
    }
  }

  // Progress bar (left of sink) while pouring
  if (sink.pourT > 0) {
    const pct = sink.pourT / floodTime;
    ctx.fillStyle = PAL.barBg; ctx.fillRect(bx-1, by-27, 14, 5);
    ctx.fillStyle = PAL.barDark; ctx.fillRect(bx, by-26, 12, 3);
    ctx.fillStyle = PAL.barFill; ctx.fillRect(bx, by-26, Math.round(12 * pct), 3);
  }

  // Proximity dashed border — tight around basin only
  if (!allSink && sink.pourCount < 3 && sink.waterLevel === 0) {
    const pdx = Math.abs(player.x + PW/2 - sink.x - 6);
    const pdy = Math.abs(player.y + PH  - sink.y - 10);
    if (pdx < 14 && pdy < 20) {
      ctx.strokeStyle = PAL.objectActiveBorder; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _dsk = CONFIG.scene.dashed.sink; ctx.strokeRect(bx+_dsk.x, by+_dsk.y, _dsk.w, _dsk.h);
      ctx.setLineDash([]);
    }
  }
}

function drawPaperBalls() {
  for (let i = 0; i < paperBalls.length; i++) {
    const b = paperBalls[i];
    ctx.fillStyle = PAL.paperBall; ctx.fillRect(Math.round(b.x), Math.round(b.y), 3, 3);
    ctx.fillStyle = PAL.paperBallShadow; ctx.fillRect(Math.round(b.x)+1, Math.round(b.y)+1, 1, 1);
  }
}

function drawBags() {
  for (let i = 0; i < bags.length; i++) {
    const b = bags[i];
    if (b.collected) continue;
    ctx.fillStyle = PAL.bagborder; ctx.fillRect(b.x, b.y, 14, 10);
    ctx.fillStyle = PAL.bagBody;   ctx.fillRect(b.x+1, b.y+1, 12, 8);
    ctx.fillStyle = PAL.bagborder; ctx.fillRect(b.x+4, b.y-3, 6, 3);
    ctx.fillRect(b.x+6, b.y+3, 2, 4);

  }
}

function drawMachines() {
  for (let i = 0; i < machines.length; i++) {
    const m = machines[i];
    const wobble = (!m.broken && m.shakeT > 0) ? Math.round(Math.sin(frame * 1.5) * 1) : 0;
    const mx = Math.round(m.x) + wobble, my = Math.round(m.y);

    ctx.fillStyle = PAL.machineBody;   ctx.fillRect(mx,   my,    10, 18); // body
    ctx.fillStyle = m.broken ? PAL.machineScreenBroken : PAL.machineScreen;
                              ctx.fillRect(mx+1, my+1,   8,  6); // screen
    if (!m.broken) {
      ctx.fillStyle = PAL.machineBody; ctx.fillRect(mx+4, my+2,   2,  4); // can icon on screen
    }
    ctx.fillStyle = PAL.machineDivider;  ctx.fillRect(mx,   my+7,  10,  1); // divider
    ctx.fillStyle = PAL.machineButtonPanel;  ctx.fillRect(mx+1, my+8,   8,  6); // button panel bg
    ctx.fillStyle = PAL.machineButtonA; ctx.fillRect(mx+2, my+8,   2,  2); // button A
    ctx.fillStyle = PAL.machineButtonB; ctx.fillRect(mx+5, my+8,   2,  2); // button B
    ctx.fillStyle = PAL.machineButtonC; ctx.fillRect(mx+2, my+11,  2,  2); // button C
    ctx.fillStyle = PAL.machineInk;  ctx.fillRect(mx+3, my+15,  4,  1); // coin slot
    if (m.broken) {
      ctx.fillStyle = PAL.machineInk; ctx.fillRect(mx+2, my+14, 5, 3);  // open hatch
    }

    // Progress bar while shaking
    if (!m.broken && m.shakeT > 0) {
      const pct = m.shakeT / shakeTime;
      ctx.fillStyle = PAL.barBg; ctx.fillRect(mx-2, my-9, 14, 5);
      ctx.fillStyle = PAL.barDark; ctx.fillRect(mx-1, my-8, 12, 3);
      ctx.fillStyle = PAL.barFill; ctx.fillRect(mx-1, my-8, Math.round(12 * pct), 3);
    }

    // Proximity highlight (dashed border)
    if (!m.broken && !allMachines) {
      const pdx = Math.abs(player.x + PW/2 - m.x - 5);
      const pdy = Math.abs(player.y + PH  - m.y - 18);
      if (pdx < 14 && pdy < 20) {
        ctx.strokeStyle = PAL.objectActiveBorder; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        const _dm = CONFIG.scene.dashed.machines; ctx.strokeRect(mx+_dm.x, my+_dm.y, _dm.w, _dm.h);
        ctx.setLineDash([]);
      }
    }
  }
}

// ── Bonus level draw functions ────────────────────────────────────────────────

function drawPaperProjectiles() {
  for (var i = 0; i < paperProjectiles.length; i++) {
    var p = paperProjectiles[i];
    var px = Math.round(p.x), py = Math.round(p.y);
    // Small 3×3 crumpled paper projectile — slightly different look from L5 paperBall
    ctx.fillStyle = PAL.paperBall;
    ctx.fillRect(px, py, 3, 3);
    ctx.fillStyle = PAL.paperBallShadow;
    ctx.fillRect(px + (p.dir > 0 ? 0 : 2), py + 2, 1, 1);
  }
}

function drawBonusWanderer(w) {
  // Draw at 0.8 scale (shorter than teachers) with feet anchored to the floor.
  var s = 0.8;
  var fx = Math.round(w.x + PW / 2);
  var fy = Math.round(w.y + PH);
  ctx.save();
  ctx.translate(fx, fy);
  ctx.scale(s, s);
  ctx.translate(-fx, -fy);
  drawChar(w.x, w.y, w.dir, w.animT, w.shirtColor, COLOURS_WANDERER, false, false, w.knockedT);
  ctx.restore();
}

function drawThrowChargeBar() {
  if (!bonusActive || !player.throwCharging || player.throwChargeT < 24) return;
  var pct = player.throwChargeT / throwChargeTime;
  var bx = Math.round(player.x) - 1;
  var by = Math.round(player.y) - 15;
  var bw = PW + 2;  // 10px
  ctx.fillStyle = PAL.barBg;   ctx.fillRect(bx,   by,   bw, 3);
  ctx.fillStyle = PAL.barDark; ctx.fillRect(bx+1, by+1, bw-2, 1);
  ctx.fillStyle = PAL.bonusBannerTitle; ctx.fillRect(bx+1, by+1, Math.round((bw-2) * pct), 1);
}

function drawBonusWanderers() {
  if (!bonusActive) return;
  for (var i = 0; i < bonusWanderers.length; i++) {
    drawBonusWanderer(bonusWanderers[i]);
  }
}
