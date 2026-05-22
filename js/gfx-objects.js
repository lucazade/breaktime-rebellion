// ═══════════════════════════════════════════════════════════
//  GFX OBJECTS — sprite draw functions for map objects
//  Extracted from draw.js. Depends on: gfx-palette, gfx-layout, draw (FF, _canvasScale vars).
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
      _octx.fillStyle = '#2c1800'; _octx.fillRect(_d.x-1, _d.y-1, 22, 8);
      _octx.fillStyle = C.desklt;  _octx.fillRect(_d.x,   _d.y,   20, 6);
      _octx.fillStyle = C.desk;    _octx.fillRect(_d.x,   _d.y+5, 20, 2);
      _octx.fillStyle = C.brown;
      _octx.fillRect(_d.x+1,  _d.y+6, 2, 5);
      _octx.fillRect(_d.x+17, _d.y+6, 2, 5);
      _octx.fillStyle = C.red;   _octx.fillRect(_d.x+5, _d.y-2, 8, 3);
      _octx.fillStyle = C.white; _octx.fillRect(_d.x+6, _d.y-2, 6, 2);
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
      _octx.fillStyle = C.brown;   _octx.fillRect(_b.x-1, _b.y-1, BW+2, BH+2);
      _octx.fillStyle = '#075b07'; _octx.fillRect(_b.x, _b.y, BW, BH);
      if (!_b.done) {
        _octx.fillStyle = '#2c832c';
        _octx.fillRect(_b.x+2, _b.y+3, BW-4, 2);
        _octx.fillRect(_b.x+2, _b.y+8, BW-4, 2);
      } else {
        _octx.fillStyle = 'rgba(255,255,255,0.9)';
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
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
    ctx.setLineDash([2,2]);
    ctx.strokeRect(b.x-2, b.y-2, BW+4, BH+4);
    ctx.setLineDash([]);
  }
}

function drawBell() {
  const bx = BELL.x, by = BELL.y;
  const sw = BELL.ringing ? Math.round(Math.sin(frame * 0.6) * 3) : 0;
  const X  = bx + sw;

  const out = '#554400';
  const col = '#FFCC00';
  const hi  = '#FFE966';
  const shd = '#CC9900';
  const drk = '#332200';

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

  // Pulsing glow when the objective is complete — blit pre-rendered circle, vary only globalAlpha
  if ((allBoards || allBags || allMachines || allBall || allStudents || allBooks || allSink || allBins || allSprinklers) && !BELL.done) {
    if (!_bellGlowCache) {
      var _gc = document.createElement('canvas'); _gc.width = 16 * _canvasScale; _gc.height = 16 * _canvasScale;
      var _gctx = _gc.getContext('2d');
      _gctx.scale(_canvasScale, _canvasScale);
      _gctx.fillStyle = '#FFD700';
      _gctx.beginPath(); _gctx.arc(8, 8, 7, 0, Math.PI*2); _gctx.fill();
      _bellGlowCache = _gc;
    }
    ctx.globalAlpha = 0.12 + 0.08 * Math.sin(frame * 0.15);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(_bellGlowCache, Math.round((bx - 5) * _canvasScale), Math.round((by - 5) * _canvasScale));
    ctx.setTransform(_canvasScale, 0, 0, _canvasScale, 0, 0);
    ctx.globalAlpha = 1;
  }

  // Sound waves when ringing
  if (BELL.ringing) {
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = 'rgba(255,215,0,' + (0.6 - i*0.15) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(bx+3, by+3, 4+i*3, 0, Math.PI*2); ctx.stroke();
    }
  }
}

function drawGymBall() {
  if (!gymBall) return;
  const bx = Math.round(gymBall.x), by = Math.round(gymBall.y);
  if (gymBall.deflated) {
    ctx.fillStyle = '#6c2200';
    ctx.fillRect(bx, by+5, 9, 3);
    ctx.fillStyle = '#CC6600';
    ctx.fillRect(bx+1, by+6, 7, 1);
    return;
  }
  if (gymBall.shakeT > 0) {
    const pct = gymBall.shakeT / deflateTime;
    ctx.fillStyle = '#880000'; ctx.fillRect(bx-2, by-9, 13, 5);
    ctx.fillStyle = '#2a0000'; ctx.fillRect(bx-1, by-8, 11, 3);
    ctx.fillStyle = '#cc1100'; ctx.fillRect(bx-1, by-8, Math.round(11 * pct), 3);
  }
  // Basketball — proper pixel circle body + matching circular outline
  ctx.fillStyle = '#6b2200';
  ctx.fillRect(bx+2, by-1, 5, 1);                                              // top arc
  ctx.fillRect(bx+1, by,   1, 1); ctx.fillRect(bx+7, by,   1, 1);             // top shoulders
  ctx.fillRect(bx,   by+1, 1, 1); ctx.fillRect(bx+8, by+1, 1, 1);            // upper sides
  ctx.fillRect(bx-1, by+2, 1, 5); ctx.fillRect(bx+9, by+2, 1, 5);            // mid sides
  ctx.fillRect(bx,   by+7, 1, 1); ctx.fillRect(bx+8, by+7, 1, 1);            // lower sides
  ctx.fillRect(bx+1, by+8, 1, 1); ctx.fillRect(bx+7, by+8, 1, 1);            // bottom shoulders
  ctx.fillRect(bx+2, by+9, 5, 1);                                              // bottom arc
  ctx.fillStyle = '#CC6600';
  ctx.fillRect(bx+2, by,   5, 1);                                              // body row 0
  ctx.fillRect(bx+1, by+1, 7, 1);                                              // body row 1
  ctx.fillRect(bx,   by+2, 9, 5);                                              // body rows 2-6
  ctx.fillRect(bx+1, by+7, 7, 1);                                              // body row 7
  ctx.fillRect(bx+2, by+8, 5, 1);                                              // body row 8
  ctx.fillStyle = '#6b2200';
  ctx.fillRect(bx+4, by, 1, 9); ctx.fillRect(bx, by+4, 9, 1);
  ctx.fillStyle = 'rgba(255,200,100,0.5)'; ctx.fillRect(bx+1, by+1, 2, 2);
  if (!allBall) {
    const pdx = Math.abs(player.x + PW/2 - gymBall.x - 4);
    const pdy = Math.abs(player.y + PH  - gymBall.y - 9);
    if (pdx < 14 && pdy < 14) {
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _dg = CONFIG.vis.dashed.gymBall; ctx.strokeRect(bx+_dg.x, by+_dg.y, _dg.w, _dg.h);
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
      ctx.fillStyle = '#3a1000'; ctx.fillRect(fx-1, fy, 1, 9); ctx.fillRect(fx-1, fy+9, 10, 1); ctx.fillRect(fx, fy, 9, 1);
      ctx.fillStyle = '#F5E6C0'; ctx.fillRect(fx,   fy+1, 7, 8);
      ctx.fillStyle = '#6B2200'; ctx.fillRect(fx+7, fy,   2, 9);
      ctx.fillStyle = '#999999'; ctx.fillRect(fx+1, fy+3, 5, 1); ctx.fillRect(fx+1, fy+5, 5, 1);
      // Right half (half spine + pages) — shifted 3px right, 2px down
      ctx.fillStyle = '#6B2200'; ctx.fillRect(fx+12, fy+2, 2, 9);
      ctx.fillStyle = '#3a1000'; ctx.fillRect(fx+12, fy+2, 9, 1); ctx.fillRect(fx+20, fy+2, 1, 9); ctx.fillRect(fx+12, fy+11, 9, 1);
      ctx.fillStyle = '#F5E6C0'; ctx.fillRect(fx+14, fy+3, 6, 8);
      ctx.fillStyle = '#999999'; ctx.fillRect(fx+15, fy+5, 4, 1); ctx.fillRect(fx+15, fy+7, 4, 1);
    } else {
      // 1st/2nd drop: open book lying flat
      ctx.fillStyle = '#3a1000';
      ctx.fillRect(fx-1, fy, 1, 9); ctx.fillRect(fx+18, fy, 1, 9);
      ctx.fillRect(fx-1, fy+9, 20, 1);
      ctx.fillRect(fx,    fy,   18, 1);
      ctx.fillStyle = '#F5E6C0'; ctx.fillRect(fx,    fy+1,  7, 8);
      ctx.fillStyle = '#F5E6C0'; ctx.fillRect(fx+11, fy+1,  7, 8);
      ctx.fillStyle = '#6B2200'; ctx.fillRect(fx+7,  fy,    4, 9);
      ctx.fillStyle = '#999999'; ctx.fillRect(fx+1,  fy+3,  5, 1); ctx.fillRect(fx+1,  fy+5, 5, 1);
      ctx.fillStyle = '#999999'; ctx.fillRect(fx+12, fy+3,  5, 1); ctx.fillRect(fx+12, fy+5, 5, 1);
    }
    return;
  }

  // Progress bar while shaking; no book sprite (bg.png shows it in place)
  if (bookcase.shakeT > 0) {
    const pct = bookcase.shakeT / dropTime;
    ctx.fillStyle = '#880000'; ctx.fillRect(bx-14, by-6, 9, 5);
    ctx.fillStyle = '#2a0000'; ctx.fillRect(bx-13, by-5, 7, 3);
    ctx.fillStyle = '#cc1100'; ctx.fillRect(bx-13, by-5, Math.round(7 * pct), 3);
  }

  // Proximity dashed border — full bookcase area
  if (!allBooks) {
    const pdx = Math.abs(player.x + PW/2 - bookcase.x - 12);
    const pdy = Math.abs(player.y + PH  - bookcase.y - 26);
    if (pdx < 20 && pdy < 36) {
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _db = CONFIG.vis.dashed.bookcase; ctx.strokeRect(bx+_db.x, by+_db.y, _db.w, _db.h);
      ctx.setLineDash([]);
    }
  }
}

function drawRegister() {
  if (!register || register.stolen) return;
  const bx = Math.round(register.x), by = Math.round(register.y);
  // Book cover (dark red register)
  ctx.fillStyle = '#8B0000'; ctx.fillRect(bx, by-2, 10, 14);
  ctx.fillStyle = '#6B0000'; ctx.fillRect(bx, by-2, 1, 14);  // spine
  ctx.fillStyle = '#AA2200'; ctx.fillRect(bx+1, by-2, 9, 1); // top edge
  // Pages
  ctx.fillStyle = '#F0E8D0'; ctx.fillRect(bx+2, by-1, 7, 12);
  // Grade lines
  ctx.fillStyle = '#888'; ctx.fillRect(bx+3, by+2, 5, 1);
  ctx.fillStyle = C.red;   ctx.fillRect(bx+3, by+4, 5, 1);
  ctx.fillStyle = '#888'; ctx.fillRect(bx+3, by+6, 5, 1);
  ctx.fillStyle = C.red;   ctx.fillRect(bx+3, by+8, 5, 1);

  // Progress bar while stealing
  if (register.stealT > 0) {
    const pct = register.stealT / registerTime;
    ctx.fillStyle = '#880000'; ctx.fillRect(bx-2, by-7, 14, 4);
    ctx.fillStyle = '#2a0000'; ctx.fillRect(bx-1, by-6, 12, 2);
    ctx.fillStyle = '#cc1100'; ctx.fillRect(bx-1, by-6, Math.round(12 * pct), 2);
  }

  // Proximity border
  if (!allRegister) {
    const pdx = Math.abs(player.x + PW/2 - register.x - 5);
    const pdy = Math.abs(player.y + PH  - register.y - 8);
    if (pdx < 16 && pdy < 20) {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _dr = CONFIG.vis.dashed.register; ctx.strokeRect(bx+_dr.x, by+_dr.y, _dr.w, _dr.h);
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
    ctx.strokeStyle = blink ? C.gold : C.green; ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    const _de = CONFIG.vis.dashed.exitDoor; ctx.strokeRect(bx+_de.x, by+_de.y, _de.w, _de.h);
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
      ctx.fillStyle = 'rgba(60,140,255,0.45)';
      for (let wy = by + 4; wy < floorY; wy += 4) {
        const spread = Math.floor((wy - by - 4) / range * 5); // 0→5 spread
        const wx = Math.floor(Math.sin((wy + frame * 0.5) * 0.6) * 1);
        ctx.fillRect(bx + 1 - spread + wx, wy, 2, 3); // left stream
        ctx.fillRect(bx + 5 + spread + wx, wy, 2, 3); // right stream
        if (spread >= 2) ctx.fillRect(bx + 3 + wx, wy, 2, 3); // centre
      }
      // Floor splash (wider at base)
      ctx.fillStyle = 'rgba(100,180,255,0.38)';
      ctx.fillRect(bx - 6, floorY - 2, 20, 3);
    }

    // Sprinkler fixture — disc + head only (no stem above ceiling)
    ctx.fillStyle = '#bbb'; ctx.fillRect(bx,   by-2, 8, 2);    // deflector disc
    ctx.fillStyle = sp.active ? C.red : '#888';
    ctx.fillRect(bx+2, by, 4, 3);                              // head (red = active)
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1;               // T-border (no top)
    ctx.beginPath();
    ctx.moveTo(bx,   by-2); ctx.lineTo(bx,   by);   // left side of disc
    ctx.lineTo(bx+2, by);   ctx.lineTo(bx+2, by+3); // step in + left side of head
    ctx.lineTo(bx+6, by+3); ctx.lineTo(bx+6, by);   // bottom of head + right side of head
    ctx.lineTo(bx+8, by);   ctx.lineTo(bx+8, by-2); // step out + right side of disc
    ctx.stroke();

    // Progress bar just below the sprinkler head
    if (sp.lighterT > 0 && !sp.active) {
      const pct = sp.lighterT / lighterTime;
      ctx.fillStyle = '#880000'; ctx.fillRect(bx-1, by+8, 10, 4);
      ctx.fillStyle = '#2a0000'; ctx.fillRect(bx, by+9, 8, 2);
      ctx.fillStyle = '#cc1100'; ctx.fillRect(bx, by+9, Math.round(8 * pct), 2);
    }

    // Proximity dashed border — same floor only
    if (!allSprinklers && !sp.active) {
      const pdFloor = player.y > (MY+GY)/2 ? 'GY' : player.y > (TY+MY)/2 ? 'MY' : 'TY';
      if (!sp.floor || sp.floor === pdFloor) {
        const pdx = Math.abs(player.x + PW/2 - sp.x - 4);
        const pdy = Math.abs(player.y - sp.y);
        if (pdx < 16 && pdy < 50) {
          ctx.strokeStyle = '#FF6600'; ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          const _ds = CONFIG.vis.dashed.sprinklers; ctx.strokeRect(bx+_ds.x, by+_ds.y, _ds.w, _ds.h);
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
    ctx.fillStyle = '#FF6600'; ctx.fillRect(fx, fy - flicker,     2, 3);
    ctx.fillStyle = C.yellow;  ctx.fillRect(fx, fy - flicker - 2, 2, 2);
  }
}

function drawBins() {
  for (let i = 0; i < bins.length; i++) {
    const b = bins[i];
    const bx = Math.round(b.x), by = Math.round(b.y);

    if (b.exploded) {
      // Charred debris
      ctx.fillStyle = '#2a1a00'; ctx.fillRect(bx-2, by-5, 13, 5);
      ctx.fillStyle = '#444';    ctx.fillRect(bx-4, by-7,  3, 2);
      ctx.fillStyle = '#444';    ctx.fillRect(bx+11,by-8,  3, 2);
      ctx.fillStyle = '#333';    ctx.fillRect(bx+2, by-9,  2, 3);
      continue;
    }

    // Lid
    ctx.fillStyle = '#1a7a1a'; ctx.fillRect(bx, by-14, 10, 3);
    ctx.fillStyle = '#0d4d0d'; ctx.fillRect(bx+1, by-15, 8, 1); // top rim
    // Body
    ctx.fillStyle = '#228B22'; ctx.fillRect(bx, by-11, 10, 11);
    ctx.fillStyle = '#1a6e1a'; ctx.fillRect(bx, by-11, 1, 11); // left shadow
    // Dark green border (overwrite existing edge pixels, no external expansion)
    ctx.fillStyle = '#0d4d0d';
    ctx.fillRect(bx,   by-14, 1,  14); // left
    ctx.fillRect(bx+9, by-14, 1,  14); // right
    ctx.fillRect(bx,   by-1,  10,  1); // bottom

    // Triangle (vertex up) as recycle symbol
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(bx+4, by-9, 2, 1); // top vertex
    ctx.fillRect(bx+3, by-8, 4, 1); // middle
    ctx.fillRect(bx+2, by-7, 6, 1); // base

    // Fuse animation (speeds up as timer runs out)
    if (b.lit) {
      const speed = b.fuseT > 90 ? 8 : b.fuseT > 40 ? 5 : 2;
      if (Math.floor(frame / speed) % 2 === 0) {
        ctx.fillStyle = '#FF6600'; ctx.fillRect(bx+4, by-16, 2, 3);
        ctx.fillStyle = C.yellow;  ctx.fillRect(bx+4, by-17, 2, 1);
      }
      // Fuse countdown bar
      const pct = b.fuseT / 180;
      ctx.fillStyle = '#880000'; ctx.fillRect(bx-2, by-25, 14, 4);
      ctx.fillStyle = '#2a0000'; ctx.fillRect(bx-1, by-24, 12, 2);
      ctx.fillStyle = '#cc1100'; ctx.fillRect(bx-1, by-24, Math.round(12 * pct), 2);
    }

    // Proximity dashed border
    if (!allBins && !b.lit) {
      const pdx = Math.abs(player.x + PW/2 - b.x - 5);
      const pdy = Math.abs(player.y + PH  - b.y - 7);
      if (pdx < 16 && pdy < 20) {
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        const _dbn = CONFIG.vis.dashed.bins; ctx.strokeRect(bx+_dbn.x, by+_dbn.y, _dbn.w, _dbn.h);
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
      ctx.fillStyle = 'rgba(30,90,200,0.22)';
      ctx.fillRect(wx, fy-2, Math.min(w, 8), 2);
      ctx.fillStyle = 'rgba(30,90,200,0.28)';
      ctx.fillRect(wx, fy, w, 4);
      ctx.fillStyle = 'rgba(100,170,255,0.55)';
      ctx.fillRect(wx, fy, w, 1);
      ctx.fillStyle = 'rgba(130,200,255,0.5)';
      const rOff = Math.floor(frame / 6) % 12;
      for (let rx = wx + rOff; rx < wx + w; rx += 12) ctx.fillRect(rx, fy+2, 5, 1);
    }
  }

  // Mirror — small, centered over the 12px-wide basin (bx+1 to bx+11)
  ctx.fillStyle = '#1a3a5c'; ctx.fillRect(bx+1, by-20, 10,  8); // dark frame
  ctx.fillStyle = '#7ab8d8'; ctx.fillRect(bx+2, by-19,  8,  6); // glass
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(bx+3, by-18, 2, 3); // highlight

  // Tap (wall pipe below mirror gap)
  ctx.fillStyle = '#777'; ctx.fillRect(bx+5, by-10, 2, 3);
  ctx.fillStyle = '#aaa'; ctx.fillRect(bx+4, by-10, 1, 1);

  // Sink basin
  ctx.fillStyle = '#666'; ctx.fillRect(bx-1, by-9, 14, 10);
  ctx.fillStyle = '#b0b0b0'; ctx.fillRect(bx,   by-8, 12, 8);
  ctx.fillStyle = '#d8d8d8'; ctx.fillRect(bx+1, by-7, 10, 6);
  ctx.fillStyle = '#888';    ctx.fillRect(bx+5, by-2,  2, 1); // drain

  // Dripping animation while pouring
  if (sink.pourT > 0) {
    const drop = Math.floor(frame / 3) % 5;
    ctx.fillStyle = '#4488cc';
    ctx.fillRect(bx+5, by-8+drop, 2, 2);
    if (drop >= 3) {
      ctx.fillStyle = 'rgba(68,136,204,0.6)';
      ctx.fillRect(bx+3, by-3, 2, 1); ctx.fillRect(bx+7, by-3, 2, 1);
    }
  }

  // Progress bar (left of sink) while pouring
  if (sink.pourT > 0) {
    const pct = sink.pourT / floodTime;
    ctx.fillStyle = '#880000'; ctx.fillRect(bx+2, by-26, 9, 5);
    ctx.fillStyle = '#2a0000'; ctx.fillRect(bx+3, by-25, 7, 3);
    ctx.fillStyle = '#cc1100'; ctx.fillRect(bx+3, by-25, Math.round(7 * pct), 3);
  }

  // Proximity dashed border — tight around basin only
  if (!allSink && sink.pourCount < 3 && sink.waterLevel === 0) {
    const pdx = Math.abs(player.x + PW/2 - sink.x - 6);
    const pdy = Math.abs(player.y + PH  - sink.y - 10);
    if (pdx < 14 && pdy < 20) {
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _dsk = CONFIG.vis.dashed.sink; ctx.strokeRect(bx+_dsk.x, by+_dsk.y, _dsk.w, _dsk.h);
      ctx.setLineDash([]);
    }
  }
}

function drawPaperBalls() {
  for (let i = 0; i < paperBalls.length; i++) {
    const b = paperBalls[i];
    ctx.fillStyle = C.white; ctx.fillRect(Math.round(b.x), Math.round(b.y), 3, 3);
    ctx.fillStyle = C.lgray; ctx.fillRect(Math.round(b.x)+1, Math.round(b.y)+1, 1, 1);
  }
}

function drawBags() {
  for (let i = 0; i < bags.length; i++) {
    const b = bags[i];
    if (b.collected) continue;
    ctx.fillStyle = C.bagborder; ctx.fillRect(b.x, b.y, 14, 10);
    ctx.fillStyle = C.bagbody;   ctx.fillRect(b.x+1, b.y+1, 12, 8);
    ctx.fillStyle = C.bagborder; ctx.fillRect(b.x+4, b.y-3, 6, 3);
    ctx.fillRect(b.x+6, b.y+3, 2, 4);

  }
}

function drawMachines() {
  for (let i = 0; i < machines.length; i++) {
    const m = machines[i];
    const wobble = (!m.broken && m.shakeT > 0) ? Math.round(Math.sin(frame * 1.5) * 1) : 0;
    const mx = Math.round(m.x) + wobble, my = Math.round(m.y);

    ctx.fillStyle = C.blue;   ctx.fillRect(mx,   my,    10, 18); // body
    ctx.fillStyle = m.broken ? C.dgray : C.lgreen;
                              ctx.fillRect(mx+1, my+1,   8,  6); // screen
    if (!m.broken) {
      ctx.fillStyle = C.blue; ctx.fillRect(mx+4, my+2,   2,  4); // can icon on screen
    }
    ctx.fillStyle = C.mgray;  ctx.fillRect(mx,   my+7,  10,  1); // divider
    ctx.fillStyle = C.lblue;  ctx.fillRect(mx+1, my+8,   8,  6); // button panel bg
    ctx.fillStyle = C.red;    ctx.fillRect(mx+2, my+9,   2,  2); // button A
    ctx.fillStyle = C.yellow; ctx.fillRect(mx+5, my+9,   2,  2); // button B
    ctx.fillStyle = C.lgreen; ctx.fillRect(mx+2, my+12,  2,  2); // button C
    ctx.fillStyle = C.black;  ctx.fillRect(mx+3, my+15,  4,  1); // coin slot
    if (m.broken) {
      ctx.fillStyle = C.black; ctx.fillRect(mx+2, my+14, 5, 3);  // open hatch
    }

    // Progress bar while shaking
    if (!m.broken && m.shakeT > 0) {
      const pct = m.shakeT / shakeTime;
      ctx.fillStyle = '#880000'; ctx.fillRect(mx-2, my-9, 14, 5);
      ctx.fillStyle = '#2a0000'; ctx.fillRect(mx-1, my-8, 12, 3);
      ctx.fillStyle = '#cc1100'; ctx.fillRect(mx-1, my-8, Math.round(12 * pct), 3);
    }

    // Proximity highlight (dashed border)
    if (!m.broken && !allMachines) {
      const pdx = Math.abs(player.x + PW/2 - m.x - 5);
      const pdy = Math.abs(player.y + PH  - m.y - 18);
      if (pdx < 14 && pdy < 20) {
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        const _dm = CONFIG.vis.dashed.machines; ctx.strokeRect(mx+_dm.x, my+_dm.y, _dm.w, _dm.h);
        ctx.setLineDash([]);
      }
    }
  }
}
