// Rendering — all draw functions and HUD update

var _logoImage = null; // caricato da game.js come bgImage

// ── Title screen helpers ──────────────────────────────────────────────────────

function _drawAudioIcon(x, y, mode, color) {
  ctx.fillStyle = color;
  // speaker body
  ctx.fillRect(x+2,y,   2,1); ctx.fillRect(x+1,y+1, 3,1);
  ctx.fillRect(x,  y+2, 4,4);
  ctx.fillRect(x+1,y+6, 3,1); ctx.fillRect(x+2,y+7, 2,1);
  if (mode === 'mute') {
    ctx.fillRect(x+5,y+2,1,1); ctx.fillRect(x+7,y+2,1,1);
    ctx.fillRect(x+6,y+3,1,2);
    ctx.fillRect(x+5,y+5,1,1); ctx.fillRect(x+7,y+5,1,1);
  } else if (mode === 'sfx') {
    ctx.fillRect(x+5,y+2,1,4);
  } else {
    ctx.fillRect(x+5,y+2,1,4); ctx.fillRect(x+7,y+1,1,6);
  }
}

function _drawLockIcon(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x+1,y,  3,1);
  ctx.fillRect(x,  y+1,1,2); ctx.fillRect(x+4,y+1,1,2);
  ctx.fillRect(x,  y+3,5,3);
  ctx.fillStyle = '#000'; ctx.fillRect(x+2,y+4,1,2);
}

function drawTitleScreen() {
  var VT = CONFIG.vis.titleScreen;
  ctx.clearRect(0, 0, W, H);

  var ct = VT.controls;
  var isDesktop = !CONFIG.debug.simulateMobile && window.matchMedia('(pointer:fine)').matches;
  var showTap    = !isDesktop;   // tap solo su touch — su desktop c'è la legend
  var showLegend = isDesktop;

  // Altezza logo
  var logoW = VT.logo.w;
  var logoX = Math.round((W - logoW) / 2);
  var logoH = 0;
  if (_logoImage && _logoImage.complete && _logoImage.naturalWidth > 0) {
    logoH = Math.round(_logoImage.naturalHeight / _logoImage.naturalWidth * logoW);
  }

  // Centratura verticale: calcola altezza totale del blocco contenuto
  var tapBlockH = showTap    ? (VT.tapText.gapY + VT.tapText.fontSize) : 0;
  var ctrlBlockH = ct.gapY + ct.btnH;
  var legBlockH  = showLegend ? (VT.legend.gapY  + VT.legend.fontSize)  : 0;
  var totalH = logoH + tapBlockH + ctrlBlockH + legBlockH;
  var logoY  = Math.round((H - totalH) / 2);

  // Logo clippato con angoli stondati + bordino
  if (logoH > 0) {
    var r = VT.logo.borderR;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoW, logoH, r);
    ctx.clip();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(_logoImage, logoX*2, logoY*2, logoW*2, logoH*2);
    ctx.restore();
    if (VT.logo.borderW > 0) {
      ctx.save();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = VT.logo.borderW;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoW, logoH, r);
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';

  var nextY = logoY + logoH;

  // Tap to start — solo su non-desktop (blinking)
  if (showTap) {
    var tapY = nextY + VT.tapText.gapY;
    if (!_titleStarting && Math.floor(frame / 20) % 2 === 0) {
      ctx.font = VT.tapText.fontSize + 'px "Press Start 2P"';
      ctx.fillStyle = C.gold;
      ctx.fillText(STRINGS.tapToStart, W / 2, tapY);
    }
    nextY = tapY + VT.tapText.fontSize;
  }

  // Controls row
  var ctrlY = nextY + ct.gapY;
  _titleCtrlY = ctrlY;
  ctx.font = ct.fontSize + 'px "Press Start 2P"';

  // Level chooser
  if (LEVELS.length > 1) {
    ctx.fillStyle = currentLevel <= 1 ? C.dgray : C.white;
    ctx.fillText('‹', ct.prevX + ct.prevW/2, ctrlY + 2);
    ctx.fillStyle = C.gold;
    ctx.fillText(STRINGS.levelLabel + ' ' + currentLevel, ct.labelX, ctrlY + 2);
    var atCeiling = currentLevel >= _btrMax, moreExist = _btrMax < LEVELS.length;
    if (atCeiling && moreExist) { _drawLockIcon(ct.nextX + 2, ctrlY + 1, C.yellow); }
    else { ctx.fillStyle = (atCeiling && !moreExist) ? C.dgray : C.white; ctx.fillText('›', ct.nextX + ct.nextW/2, ctrlY + 2); }
  }

  // Language buttons (solo se debug)
  if (CONFIG.debug.showLangChooser) {
    var curLang = document.documentElement.lang;
    ['en','it'].forEach(function(lg, idx) {
      var lx = ct.langX + idx * (ct.langW + 4);
      var isActive = curLang === lg;
      ctx.fillStyle = isActive ? C.gold : C.mgray;
      ctx.fillText(lg.toUpperCase(), lx + ct.langW/2, ctrlY + 2);
      if (isActive) { ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(lx, ctrlY, ct.langW, 8); }
    });
  }

  // Audio toggle
  var audioMode = GameAudio.getMode();
  _drawAudioIcon(ct.audioX, ctrlY, audioMode, audioMode==='full'?C.lgreen:audioMode==='sfx'?C.yellow:C.mgray);

  // Keyboard legend — solo su desktop
  if (showLegend) {
    var legY = ctrlY + ct.btnH + VT.legend.gapY;
    ctx.font = VT.legend.fontSize + 'px "Press Start 2P"';
    ctx.fillStyle = C.lgray;
    ctx.fillText('↑↓←→ '+(STRINGS.keyMove||'Move')+' · Z '+(STRINGS.keyAction||'Action')+' · P '+(STRINGS.keyPause||'Pause')+' · ESC '+(STRINGS.keyHome||'Home'), W/2, legY);
  }

  ctx.restore();
}

function drawBg() {
  // Hand-drawn background: 640×400px, drawn at 1:1 canvas pixels (bypasses ctx.scale)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) ctx.drawImage(bgImage, 0, 0);
  ctx.setTransform(2, 0, 0, 2, 0, 0);
}

function drawDesks() {
  for (let i = 0; i < DESKS.length; i++) {
    const d = DESKS[i];
    ctx.fillStyle = '#2c1800'; ctx.fillRect(d.x-1, d.y-1, 22, 8);
    ctx.fillStyle = C.desklt; ctx.fillRect(d.x, d.y, 20, 6);
    ctx.fillStyle = C.desk;   ctx.fillRect(d.x, d.y+5, 20, 2);
    ctx.fillStyle = C.brown;
    ctx.fillRect(d.x+1, d.y+6, 2, 5);
    ctx.fillRect(d.x+17, d.y+6, 2, 5);
    ctx.fillStyle = C.red;   ctx.fillRect(d.x+5, d.y-2, 8, 3);
    ctx.fillStyle = C.white; ctx.fillRect(d.x+6, d.y-2, 6, 2);
  }
}

function drawBoards() {
  let nearestIdx = -1, nd = 9999;
  if (levelMechanics.writeBoards) {
    for (let i = 0; i < BOARDS.length; i++) {
      if (BOARDS[i].done) continue;
      const d = Math.abs(player.x+PW/2 - BOARDS[i].x-BW/2) + Math.abs(player.y - BOARDS[i].y-BH);
      if (d < nd) { nd = d; nearestIdx = i; }
    }
  }
  for (let i = 0; i < BOARDS.length; i++) {
    const b = BOARDS[i];
    ctx.fillStyle = C.brown;   ctx.fillRect(b.x-1, b.y-1, BW+2, BH+2);
    ctx.fillStyle = '#075b07'; ctx.fillRect(b.x, b.y, BW, BH);
    if (!b.done) {
      ctx.fillStyle = '#2c832c';
      ctx.fillRect(b.x+2, b.y+3, BW-4, 2);
      ctx.fillRect(b.x+2, b.y+8, BW-4, 2);
      if (i === nearestIdx && nd < 36) {
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
        ctx.setLineDash([2,2]);
        ctx.strokeRect(b.x-2, b.y-2, BW+4, BH+4);
        ctx.setLineDash([]);
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '4px "Press Start 2P"';
      ctx.fillText('MARCO', b.x+1, b.y+9);
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(b.x+1, b.y+10, BW-2, 1);
    }
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

  // Top cap (chiude il bordo)
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

  // Glow pulsante quando obiettivo completato
  if ((allBoards || allBags || allMachines || allBall || allStudents || allBooks || allSink || allBins || allSprinklers) && !BELL.done) {
    const pulse = 0.12 + 0.08 * Math.sin(frame * 0.15);
    ctx.fillStyle = 'rgba(255,215,0,' + pulse + ')';
    ctx.beginPath(); ctx.arc(bx+3, by+3, 7, 0, Math.PI*2); ctx.fill();
  }

  // Onde sonore quando suona
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
    ctx.fillStyle = '#CC6600';
    ctx.fillRect(bx, by+5, 9, 3);
    ctx.fillStyle = '#993300';
    ctx.fillRect(bx+1, by+6, 7, 1);
    return;
  }
  if (gymBall.shakeT > 0) {
    const pct = gymBall.shakeT / deflateTime;
    ctx.fillStyle = '#880000'; ctx.fillRect(bx-2, by-9, 13, 5);
    ctx.fillStyle = '#2a0000'; ctx.fillRect(bx-1, by-8, 11, 3);
    ctx.fillStyle = '#cc1100'; ctx.fillRect(bx-1, by-8, Math.round(11 * pct), 3);
  }
  // Basketball
  ctx.fillStyle = '#6b2200';
  ctx.fillRect(bx+1, by-1, 7, 1); ctx.fillRect(bx+1, by+9, 7, 1); // top/bottom
  ctx.fillRect(bx-1, by+1, 1, 7); ctx.fillRect(bx+9, by+1, 1, 7); // left/right
  ctx.fillStyle = '#CC6600';
  ctx.fillRect(bx+1, by, 7, 9); ctx.fillRect(bx, by+1, 9, 7);
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
    // Open book lying flat on the floor (two pages + spine)
    const fx = bx + bookcase.fallDx, fy = by + bookcase.fallDy;
    ctx.fillStyle = '#3a1000';
    ctx.fillRect(fx-1, fy, 1, 9); ctx.fillRect(fx+18, fy, 1, 9); // vertical borders
    ctx.fillRect(fx-1, fy+9, 20, 1);                               // bottom border
    ctx.fillStyle = '#3a1000'; ctx.fillRect(fx,    fy,   18, 1); // binding top
    ctx.fillStyle = '#F5E6C0'; ctx.fillRect(fx,    fy+1,  7, 8); // left page
    ctx.fillStyle = '#F5E6C0'; ctx.fillRect(fx+11, fy+1,  7, 8); // right page
    ctx.fillStyle = '#6B2200'; ctx.fillRect(fx+7,  fy,    4, 9); // spine
    ctx.fillStyle = '#999999'; ctx.fillRect(fx+1,  fy+3,  5, 1); // text lines L
    ctx.fillStyle = '#999999'; ctx.fillRect(fx+1,  fy+5,  5, 1);
    ctx.fillStyle = '#999999'; ctx.fillRect(fx+12, fy+3,  5, 1); // text lines R
    ctx.fillStyle = '#999999'; ctx.fillRect(fx+12, fy+5,  5, 1);
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

function drawNightOverlay() {
  if (!nightMode) return;
  const px = Math.round(player.x + PW/2);
  const py = Math.round(player.y + PH/2 - 2);
  const gradient = ctx.createRadialGradient(px, py, 10, px, py, 70);
  gradient.addColorStop(0,    'rgba(0,0,8,0)');
  gradient.addColorStop(0.45, 'rgba(0,0,8,0)');
  gradient.addColorStop(0.72, 'rgba(0,0,8,0.80)');
  gradient.addColorStop(1,    'rgba(0,0,8,0.96)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function drawGuard(x, y, dir, animT, chasing, knockedT) {
  const bx = Math.round(x), by = Math.round(y);
  if (knockedT > 0) {
    const fy = by + PH - 1;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-4, fy+2, 18, 2);
    if (CONFIG.vis.char.outline) {
      const s = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-s, fy-3-s, 14+s*2, 4+s*2);
      ctx.fillRect((dir>0 ? bx+12 : bx-6)-s, fy-4-s, 6+s*2, 5+s*2);
    }
    ctx.fillStyle = '#1a1a3a'; ctx.fillRect(bx-2, fy-3, 14, 4);
    ctx.fillStyle = C.pink;   ctx.fillRect(dir > 0 ? bx+12 : bx-6, fy-4, 6, 5);
    return;
  }
  const leg = Math.sin(animT) * 2.5;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-1, by+PH, PW, 2);
  if (CONFIG.vis.char.outline) {
    const s = CONFIG.vis.char.outlineSize || 1;
    ctx.fillStyle = CONFIG.vis.char.outlineColor;
    ctx.fillRect(bx+1-s, by+10-s, 3+s*2, 4+leg+s*2);
    ctx.fillRect(bx+4-s, by+10-s, 3+s*2, 4-leg+s*2);
    ctx.fillRect(bx-s,   by+13+leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx+3-s, by+13-leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx-s, by+2-s, PW+s*2, 8+s*2);
    ctx.fillRect((dir>0 ? bx-2 : bx+PW)-s, by+5-s, 2+s*2, 4+s*2);
    ctx.fillRect((dir>0 ? bx+PW : bx-2)-s, by+5-s, 2+s*2, 4+s*2);
    ctx.fillRect(bx+2-s, by+1-s, PW-4+s*2, 1+s*2);
    ctx.fillRect(bx-s, by-8-s, PW+s*2, 11+s*2);
    ctx.fillRect((dir>0 ? bx-2 : bx+PW-1)-s, by-7-s, 3+s*2, 2+s*2);
  }
  // Dark trousers
  ctx.fillStyle = '#111'; ctx.fillRect(bx+1, by+10, 3, 4+leg); ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = C.black; ctx.fillRect(bx, by+13+leg, 4, 2); ctx.fillRect(bx+3, by+13-leg, 4, 2);
  // Dark uniform body
  ctx.fillStyle = '#1a1a3a'; ctx.fillRect(bx, by+2, PW, 8);
  // Arms
  ctx.fillStyle = C.pink; ctx.fillRect(dir>0 ? bx-2 : bx+PW, by+5, 2, 4); ctx.fillRect(dir>0 ? bx+PW : bx-2, by+5, 2, 4);
  // Head
  ctx.fillStyle = C.pink; ctx.fillRect(bx+1, by-7, PW-2, 8);
  // White cap
  ctx.fillStyle = '#ddd'; ctx.fillRect(bx, by-8, PW, 3);
  ctx.fillStyle = '#bbb'; ctx.fillRect(dir>0 ? bx-2 : bx+PW-1, by-7, 3, 2); // cap visor
  // Eye
  ctx.fillStyle = C.black; ctx.fillRect(dir>0 ? bx+4 : bx+2, by-5, 2, 2);
  ctx.fillStyle = '#825144'; ctx.fillRect(bx+2, by+1, PW-4, 1);
  if (chasing) {
    const bub = dir>0 ? bx+PW : bx-26;
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(bub, by-14, 26, 10);
    ctx.fillStyle = C.black; ctx.font = '4px "Press Start 2P"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('STOP!', bub + 13, by - 12);
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
  if (sink.waterLevel > 0) {
    const wx = 12; // left offset to avoid drawing over the wall
    const rights = [0, 62, 107, 130]; // level 3: water spills into corridor
    const w = Math.max(0, rights[sink.waterLevel] - wx);
    // Perspective wedge (angled near origin)
    ctx.fillStyle = 'rgba(30,90,200,0.22)';
    ctx.fillRect(wx, fy-2, Math.min(w, 8), 2);
    // Main body
    ctx.fillStyle = 'rgba(30,90,200,0.28)';
    ctx.fillRect(wx, fy, w, 4);
    // Bright top edge (reflection)
    ctx.fillStyle = 'rgba(100,170,255,0.55)';
    ctx.fillRect(wx, fy, w, 1);
    // Animated ripple lines
    ctx.fillStyle = 'rgba(130,200,255,0.5)';
    const rOff = Math.floor(frame / 6) % 12;
    for (let rx = wx + rOff; rx < wx + w; rx += 12) ctx.fillRect(rx, fy+2, 5, 1);
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

function drawStudents() {
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const wobble = s.shakeT > 0 ? Math.round(Math.sin(s.shakeT * 0.9) * 2) : 0;
    const bx = Math.round(s.x + 5) + wobble; // shake offset when hit
    const by = Math.round(s.y);
    if (CONFIG.vis.char.outline) {
      const so = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-so, by-17-so, 5+so*2, 9+so*2);
      ctx.fillRect(bx-3-so, by-8-so,  7+so*2, 6+so*2);
      ctx.fillRect(bx-4-so, by-3-so,  2+so*2, 3+so*2);
      ctx.fillRect(bx+2-so, by-3-so,  2+so*2, 3+so*2);
    }
    ctx.fillStyle = C.brown;
    ctx.fillRect(bx-2, by-17, 5, 2);
    ctx.fillStyle = C.pink;
    ctx.fillRect(bx-2, by-15, 5, 7);
    ctx.fillStyle = C.black;
    ctx.fillRect(bx-2, by-13, 2, 2); // eye facing left (toward board)
    ctx.fillStyle = C.white;
    ctx.fillRect(bx-3, by-8, 7, 6);  // shirt
    ctx.fillStyle = C.pink;
    ctx.fillRect(bx-4, by-3, 2, 3);  // left hand
    ctx.fillRect(bx+2, by-3, 2, 3);  // right hand
    if (s.disturbed) {
      ctx.fillStyle = '#FF2222';
      ctx.save(); ctx.textAlign = 'center';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText('!', bx+4, by-19);
      ctx.restore();
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

    // Progressbar hold-to-steal
    if (b.stealT > 0) {
      const pct = b.stealT / bagStealTime;
      ctx.fillStyle = '#880000'; ctx.fillRect(b.x-1, b.y-8, 16, 5);
      ctx.fillStyle = '#2a0000'; ctx.fillRect(b.x,   b.y-7, 14, 3);
      ctx.fillStyle = '#cc1100'; ctx.fillRect(b.x,   b.y-7, Math.round(14 * pct), 3);
    }

    // Proximity dashed border
    if (levelMechanics.stealBags && !allBags) {
      const pdx = Math.abs(player.x + PW/2 - b.x - 7);
      const pdy = Math.abs(player.y + PH  - b.y - 10);
      if (pdx < 14 && pdy < 14) {
        ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        const _dbg = CONFIG.vis.dashed.bags; ctx.strokeRect(b.x+_dbg.x, b.y+_dbg.y, _dbg.w, _dbg.h);
        ctx.setLineDash([]);
      }
    }
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

function drawPreside(x, y, dir, animT, bodyCol, chasing, knockedT) {
  const bx = Math.round(x), by = Math.round(y);

  if (knockedT > 0) {
    const fy = by + PH - 1;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-4, fy+2, 18, 2);
    if (CONFIG.vis.char.outline) {
      const s = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-s, fy-3-s, 14+s*2, 4+s*2);
      ctx.fillRect((dir>0 ? bx+12 : bx-6)-s, fy-4-s, 6+s*2, 5+s*2);
      ctx.fillRect((dir>0 ? bx-4 : bx+8)-s, fy-2-s, 4+s*2, 3+s*2);
    }
    ctx.fillStyle = bodyCol; ctx.fillRect(bx-2, fy-3, 14, 4);
    ctx.fillStyle = C.pink;  ctx.fillRect(dir > 0 ? bx+12 : bx-6, fy-4, 6, 5);
    ctx.fillStyle = C.blue;  ctx.fillRect(dir > 0 ? bx-4 : bx+8, fy-2, 4, 3);
    return;
  }

  const leg = Math.sin(animT) * 2.5;

  // Shadow slightly wider for heavier build
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-2, by+PH, PW+4, 2);

  if (CONFIG.vis.char.outline) {
    const s = CONFIG.vis.char.outlineSize || 1;
    const fX = dir>0 ? bx-2 : bx+PW;
    const bkX = dir>0 ? bx+PW : bx-2;
    ctx.fillStyle = CONFIG.vis.char.outlineColor;
    ctx.fillRect(bx+1-s, by+10-s, 3+s*2, 4+leg+s*2);
    ctx.fillRect(bx+4-s, by+10-s, 3+s*2, 4-leg+s*2);
    ctx.fillRect(bx-s,   by+13+leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx+3-s, by+13-leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx-1-s, by+2-s, PW+2+s*2, 8+s*2);
    ctx.fillRect(fX-s, by+5-s, 2+s*2, 9+s*2);
    ctx.fillRect(bkX-s, by+5-s, 2+s*2, 9+s*2);
    ctx.fillRect(bx+2-s, by+1-s, PW-4+s*2, 1+s*2);
    ctx.fillRect(bx+1-s, by-8-s, PW-2+s*2, 10+s*2);
  }

  // Legs — same as teacher
  ctx.fillStyle = C.blue;
  ctx.fillRect(bx+1, by+10, 3, 4+leg);
  ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = C.black;
  ctx.fillRect(bx,   by+13+leg, 4, 2);
  ctx.fillRect(bx+3, by+13-leg, 4, 2);

  // Body 2px wider — no tie
  ctx.fillStyle = bodyCol;
  ctx.fillRect(bx-1, by+2, PW+2, 8);

  // Long sleeves: jacket colour + white shirt cuff + pink hand
  const frontX = dir > 0 ? bx-2 : bx+PW;
  const backX  = dir > 0 ? bx+PW : bx-2;
  ctx.fillStyle = bodyCol;
  ctx.fillRect(frontX, by+5, 2, 7);
  ctx.fillRect(backX,  by+5, 2, 7);
  ctx.fillStyle = C.white;          // cuff
  ctx.fillRect(frontX, by+11, 2, 1);
  ctx.fillRect(backX,  by+11, 2, 1);
  ctx.fillStyle = C.pink;           // hand
  ctx.fillRect(frontX, by+12, 2, 2);
  ctx.fillRect(backX,  by+12, 2, 2);

  // Head
  ctx.fillStyle = C.pink;  ctx.fillRect(bx+1, by-7, PW-2, 8);
  ctx.fillStyle = C.white; ctx.fillRect(bx+1, by-8, PW-2, 2); // white hair — older
  ctx.fillStyle = C.black; ctx.fillRect(dir > 0 ? bx+4 : bx+2, by-5, 2, 2); // eye, no glasses
  ctx.fillStyle = C.pink;  ctx.fillRect(bx+2, by+1, PW-4, 1);

  if (chasing) {
    const bub = dir > 0 ? bx+PW : bx-26;
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(bub, by-14, 26, 10);
    ctx.fillStyle = C.black; ctx.font = '4px "Press Start 2P"';
    ctx.fillText(STRINGS.hey, bub+1, by-7);
  }
}

function drawChar(x, y, dir, animT, bodyCol, isTeacher, spraying, chasing, knockedT) {
  const bx = Math.round(x), by = Math.round(y);

  // Knocked-down state — draw teacher lying flat on floor
  if (isTeacher && knockedT > 0) {
    const fy = by + PH - 1; // floor level
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-4, fy+2, 18, 2); // shadow
    if (CONFIG.vis.char.outline) {
      const s = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-s, fy-3-s, 14+s*2, 4+s*2);
      ctx.fillRect((dir>0 ? bx+12 : bx-6)-s, fy-4-s, 6+s*2, 5+s*2);
      ctx.fillRect((dir>0 ? bx-4 : bx+8)-s, fy-2-s, 4+s*2, 3+s*2);
    }
    ctx.fillStyle = bodyCol; ctx.fillRect(bx-2, fy-3, 14, 4); // body horizontal
    ctx.fillStyle = C.pink;  ctx.fillRect(dir > 0 ? bx+12 : bx-6, fy-4, 6, 5); // head
    ctx.fillStyle = C.blue;  ctx.fillRect(dir > 0 ? bx-4 : bx+8, fy-2, 4, 3);  // feet
    return;
  }

  const leg = Math.sin(animT) * 2.5;

  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-1, by+PH, PW, 2);

  if (CONFIG.vis.char.outline) {
    const s = CONFIG.vis.char.outlineSize || 1;
    ctx.fillStyle = CONFIG.vis.char.outlineColor;
    ctx.fillRect(bx+1-s, by+10-s, 3+s*2, 4+leg+s*2);
    ctx.fillRect(bx+4-s, by+10-s, 3+s*2, 4-leg+s*2);
    ctx.fillRect(bx-s,   by+13+leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx+3-s, by+13-leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx-s, by+2-s, PW+s*2, 8+s*2);
    ctx.fillRect((dir>0 ? bx-2 : bx+PW)-s, by+5-s, 2+s*2, 4+s*2);
    ctx.fillRect((dir>0 ? bx+PW : bx-2)-s, by+5-s, 2+s*2, 4+s*2);
    if (!isTeacher) ctx.fillRect((dir>0 ? bx-3 : bx+PW)-s, by+2-s, 3+s*2, 6+s*2);
    ctx.fillRect(bx+2-s, by+1-s, PW-4+s*2, 1+s*2);
    ctx.fillRect(bx+1-s, by-8-s, PW-2+s*2, 10+s*2);
  }

  ctx.fillStyle = isTeacher ? C.blue : C.mgray;
  ctx.fillRect(bx+1, by+10, 3, 4+leg);
  ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = C.black;
  ctx.fillRect(bx,   by+13+leg, 4, 2);
  ctx.fillRect(bx+3, by+13-leg, 4, 2);

  ctx.fillStyle = bodyCol; ctx.fillRect(bx, by+2, PW, 8);
  if (isTeacher) { ctx.fillStyle = C.yellow; ctx.fillRect(bx+3, by+2, 2, 6); }
  else { ctx.fillStyle = C.lblue; ctx.fillRect(bx+1, by+2, 1, 8); ctx.fillRect(bx+5, by+2, 1, 8); }

  ctx.fillStyle = C.pink;
  ctx.fillRect(dir>0 ? bx-2 : bx+PW, by+5, 2, 4);
  ctx.fillRect(dir>0 ? bx+PW : bx-2, by+5, 2, 4);

  ctx.fillStyle = C.pink; ctx.fillRect(bx+1, by-7, PW-2, 8);
  ctx.fillStyle = isTeacher ? C.lgray : C.brown; ctx.fillRect(bx+1, by-8, PW-2, 2);
  ctx.fillStyle = C.black; ctx.fillRect(dir>0 ? bx+4 : bx+2, by-5, 2, 2);
  ctx.fillStyle = '#825144'; ctx.fillRect(bx+2, by+1, PW-4, 1);

  if (spraying) {
    const sx = dir>0 ? bx+PW+2 : bx-6;
    ctx.fillStyle = '#005050'; ctx.fillRect(sx-1, by+2, 6, 7); // bordino scuro
    ctx.fillStyle = C.cyan;   ctx.fillRect(sx,   by+3, 4, 5); // can
    for (let i = 0; i < 8; i++) {
      const t = (frame * 5 + i * 11) % 19;
      const dist = 2 + i * 2 + (t % 3);
      const oy = Math.round(((t % 5) - 2) * (1 + i / 4));
      const lift = Math.round(dist * 0.35);
      ctx.fillStyle = 'rgba(140,220,140,' + (0.9 - i * 0.09).toFixed(2) + ')';
      ctx.fillRect(sx + (dir>0 ? 4+dist : -1-dist), by+5+oy-lift, 1, 1);
    }
  }
  if (!isTeacher) { ctx.fillStyle = '#3e3e3e'; ctx.fillRect(dir>0 ? bx-3 : bx+PW, by+2, 3, 6); }

  if (chasing) {
    const bub = dir>0 ? bx+PW : bx-26;
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(bub, by-14, 26, 10);
    ctx.fillStyle = C.black; ctx.font = '4px "Press Start 2P"';
    ctx.fillText(STRINGS.hey, bub+1, by-7);
  }
}

// Draw a character clipped to exclude the floor band [bandTop, bandBottom].
// Used when Marco is on a stair and his body crosses a floor.
function drawCharClipped(x, y, dir, animT, bodyCol, isTeacher, spraying, chasing, knockedT, bandTop, bandBottom) {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, bandTop); ctx.clip();
  drawChar(x, y, dir, animT, bodyCol, isTeacher, spraying, chasing, knockedT);
  ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.rect(0, bandBottom, W, H - bandBottom); ctx.clip();
  drawChar(x, y, dir, animT, bodyCol, isTeacher, spraying, chasing, knockedT);
  ctx.restore();
}

function drawJanitor(x, y, dir, animT) {
  drawChar(x, y, dir, animT, C.mgray, false, false, false);
  const bx = Math.round(x), by = Math.round(y);
  const mx = dir > 0 ? bx+PW : bx-1;
  if (CONFIG.vis.char.outline) {
    const s = CONFIG.vis.char.outlineSize || 1;
    ctx.fillStyle = CONFIG.vis.char.outlineColor;
    ctx.fillRect(bx+1-s, by-9-s, PW-2+s*2, 3+s*2);
    ctx.fillRect((dir>0 ? bx+PW-1 : bx-1)-s, by-7-s, 3+s*2, 1+s*2);
    ctx.fillRect(mx-s, by+4-s, 1+s*2, 12+s*2);
    ctx.fillRect(mx-1-s, by+14-s, 3+s*2, 2+s*2);
    ctx.fillRect(mx-2-s, by+16-s, 5+s*2, 1+s*2);
  }
  ctx.fillStyle = C.blue;
  ctx.fillRect(bx+1, by-9, PW-2, 3);
  ctx.fillRect(dir>0 ? bx+PW-1 : bx-1, by-7, 3, 1);
  ctx.fillStyle = C.brown;
  ctx.fillRect(mx, by+4, 1, 12);
  ctx.fillStyle = C.lgray;
  ctx.fillRect(mx-1, by+14, 3, 2);
  ctx.fillStyle = C.white;
  ctx.fillRect(mx-2, by+16, 5, 1);
}

function drawSight() {
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    if (t.chasing || t.name === 'Guardiano') continue; // guards have no visible sight cone
    ctx.fillStyle = 'rgba(255,200,0,0.18)';
    const rx = t.dir>0 ? t.x+PW : t.x-t.sight;
    ctx.fillRect(rx, t.y-2, t.sight, PH+4);
  }
}

function drawLucaEnd() {
  if (!exitDone || !levelMechanics.escapeExit || state === 'win') return;
  // Luca stands at the exit door
  const lx = Math.round(exitDoor.x) + 1;
  const ly = Math.round(GY - PH - walkOffset);
  drawChar(lx, ly, 1, 0, C.white, false, false, false, 0);

  // Speech bubble — bh calcolato da CONFIG.vis.lucaFumetto
  const VF = CONFIG.vis.lucaFumetto;
  ctx.font = VF.fontSize + 'px "Press Start 2P"';
  const raw = STRINGS.lucaAppears.replace(/^[^"]*"?/, '').replace(/".*$/, '');
  const parts = raw.split('|');
  let lines = [];
  for (let p = 0; p < parts.length; p++) {
    const words = parts[p].trim().split(' ');
    let cur = '';
    for (let i = 0; i < words.length; i++) {
      const test = cur + (cur ? ' ' : '') + words[i];
      if (ctx.measureText(test).width > VF.bw - 8) { if (cur) lines.push(cur); cur = words[i]; }
      else cur = test;
    }
    if (cur) lines.push(cur);
  }
  const lineCount = Math.min(lines.length, 4);
  const bh = VF.headerH + lineCount * VF.lineH + VF.gapTap + VF.tapH + VF.padBottom;
  const bx = lx + VF.offsetX, by2 = ly - VF.tailOffY - bh;
  ctx.fillStyle = C.gold; ctx.fillRect(bx, by2, VF.bw, bh);
  ctx.strokeStyle = '#aa7700'; ctx.lineWidth = 1;
  ctx.strokeRect(bx, by2, VF.bw, bh);
  ctx.fillStyle = C.gold; ctx.fillRect(bx, by2 + bh, VF.tailW, VF.tailH);
  ctx.strokeStyle = '#aa7700'; ctx.strokeRect(bx, by2 + bh, VF.tailW, VF.tailH);
  ctx.fillStyle = '#000'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Luca:', bx + 4, by2 + 4);
  for (let i = 0; i < lineCount; i++) {
    ctx.fillStyle = i === lineCount - 1 ? C.redprof : '#000';
    ctx.fillText(lines[i], bx + 4, by2 + VF.headerH + i * VF.lineH);
  }
  const tapY = by2 + VF.headerH + lineCount * VF.lineH + VF.gapTap;
  const blink = Math.floor(frame / 25) % 2 === 0;
  ctx.fillStyle = blink ? '#554400' : 'rgba(0,0,0,0)';
  ctx.textAlign = 'center';
  ctx.fillText(STRINGS.tapContinue, bx + VF.bw / 2, tapY);
  ctx.textAlign = 'left';
}

function drawParticles() {
  particles = particles.filter(function(p) { return p.life > 0; });
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.globalAlpha = p.life/p.max;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
  }
  ctx.globalAlpha = 1;
}

function drawFloating() {
  floatingTexts = floatingTexts.filter(function(t) { return t.life > 0; });
  for (let i = 0; i < floatingTexts.length; i++) {
    const t = floatingTexts[i];
    ctx.globalAlpha = Math.min(1, t.life/20);
    ctx.fillStyle = t.color; ctx.font = '8px "Press Start 2P"';
    ctx.fillText(t.text, t.x - ctx.measureText(t.text).width/2, t.y);
    t.y -= 0.5; t.life--;
  }
  ctx.globalAlpha = 1;
}

function drawOverlayPanel(bx, by, bw, bh, bgColor, borderColor, lines) {
  ctx.fillStyle = bgColor; ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = borderColor; ctx.lineWidth = 1;
  ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let totalHeight = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].visible === false) continue;
    totalHeight += lines[i].height || 10;
    if (i < lines.length - 1) totalHeight += lines[i].spacing != null ? lines[i].spacing : 4;
  }
  let y = by + Math.round((bh - totalHeight) / 2);
  const x = bx + bw / 2;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.visible === false) continue;
    ctx.font = line.font;
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, x, y);
    y += (line.height || 10) + (line.spacing != null ? line.spacing : 4);
  }
  ctx.restore();
}

function drawEndScreen() {
  if (state !== 'win' && state !== 'gameover') return;
  const fadeAlpha = Math.min(1, endScreenT / 20);
  ctx.save();
  ctx.globalAlpha = fadeAlpha;
  const bx = Math.round(W / 2 - CONFIG.vis.gameover.panW / 2);
  const isWin = state === 'win';
  const scoreText = STRINGS.scoreLabel + String(score).padStart(5, '0');
  const actionText = isWin
    ? (currentLevel < LEVELS.length ? STRINGS.reloadNext : STRINGS.reloadWin)
    : STRINGS.reloadLose;
  const actionVisible = Math.floor(frame / 20) % 2 === 0;

  if (!isWin) {
    const VG = CONFIG.vis.gameover;
    const _gH = VG.padTop + VG.stepTitle + VG.stepLevel + VG.stepScore + VG.stepConfirm + VG.btnH + VG.padBottom;
    const {bx:gX, by:gY} = _panPos(VG.panW, _gH);
    ctx.fillStyle = 'rgba(60,0,0,0.88)'; ctx.fillRect(gX, gY, VG.panW, _gH);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(gX+1, gY+1, VG.panW-2, _gH-2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cx = gX + VG.panW / 2;
    let ty = gY + VG.padTop;
    ctx.font = VG.fontSize + 'px "Press Start 2P"';
    ctx.fillStyle = C.redprof; ctx.fillText(STRINGS.gameoverTitle,                  cx, ty); ty += VG.stepTitle;
    ctx.fillStyle = C.white;   ctx.fillText(fmt(STRINGS.levelReached, currentLevel), cx, ty); ty += VG.stepLevel;
    ctx.fillStyle = C.white;   ctx.fillText(scoreText,                               cx, ty); ty += VG.stepScore;
    ctx.fillStyle = C.gold;    ctx.fillText(STRINGS.gameoverConfirm,                 cx, ty); ty += VG.stepConfirm;
    const siX = gX + VG.siOx, noX = gX + VG.noOx;
    ctx.fillStyle = 'rgba(0,90,0,0.92)'; ctx.fillRect(siX, ty, VG.siW, VG.btnH);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(siX+1, ty+1, VG.siW-2, VG.btnH-2);
    ctx.fillStyle = C.white; ctx.fillText(STRINGS.btnYes, siX + VG.siW/2, ty + 3);
    ctx.fillStyle = 'rgba(90,0,0,0.92)'; ctx.fillRect(noX, ty, VG.noW, VG.btnH);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(noX+1, ty+1, VG.noW-2, VG.btnH-2);
    ctx.fillStyle = C.white; ctx.fillText(STRINGS.btnNo, noX + VG.noW/2, ty + 3);
  } else if (currentLevel === LEVELS.length) {
    const bestScore = parseInt(localStorage.getItem('btr_best_score') || '0');
    const bestLevel = parseInt(localStorage.getItem('btr_best_level') || '1');
    const VW = CONFIG.vis.gameWin;
    const _wH = VW.padTop + VW.stepTitle + VW.stepScore + VW.stepBest + VW.tapH + VW.padBottom;
    const {bx:wX, by:wY} = _panPos(VW.panW, _wH);
    ctx.fillStyle = 'rgba(0,0,40,0.92)'; ctx.fillRect(wX, wY, VW.panW, _wH);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(wX+1, wY+1, VW.panW-2, _wH-2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cxW = wX + VW.panW / 2;
    let tyW = wY + VW.padTop;
    ctx.font = VW.fontSize + 'px "Press Start 2P"';
    ctx.fillStyle = C.gold;   ctx.fillText(STRINGS.winTitle, cxW, tyW); tyW += VW.stepTitle;
    ctx.fillStyle = C.white;  ctx.fillText(scoreText, cxW, tyW); tyW += VW.stepScore;
    ctx.fillStyle = C.yellow; ctx.fillText(STRINGS.bestLabel + ' LVL ' + bestLevel + ' — ' + String(bestScore).padStart(5,'0'), cxW, tyW); tyW += VW.stepBest;
    ctx.fillStyle = actionVisible ? C.gold : 'rgba(0,0,0,0)'; ctx.fillText(STRINGS.tapForTitle, cxW, tyW);
  } else {
    const VL = CONFIG.vis.levelComplete;
    const _lH = VL.padTop + VL.stepTitle + VL.stepScore + VL.tapH + VL.padBottom;
    const {bx:lX, by:lY} = _panPos(VL.panW, _lH);
    ctx.fillStyle = 'rgba(0,0,60,0.88)'; ctx.fillRect(lX, lY, VL.panW, _lH);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(lX+1, lY+1, VL.panW-2, _lH-2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cxL = lX + VL.panW / 2;
    let tyL = lY + VL.padTop;
    ctx.font = VL.fontSize + 'px "Press Start 2P"';
    ctx.fillStyle = C.gold;  ctx.fillText(STRINGS.levelComplete, cxL, tyL); tyL += VL.stepTitle;
    ctx.fillStyle = C.white; ctx.fillText(scoreText, cxL, tyL); tyL += VL.stepScore;
    ctx.fillStyle = actionVisible ? C.green : 'rgba(0,0,0,0)'; ctx.fillText(STRINGS.tapContinue, cxL, tyL);
  }
  ctx.restore();
}

function drawStoryBanner() {
  if (storyBannerT <= 0 || state !== 'playing') return;
  if (!storyBannerLines) {
    ctx.font = '8px "Press Start 2P"';
    const parts = STRINGS.storyText.split('|');
    let lines = [];
    for (let p = 0; p < parts.length; p++) {
      const words = parts[p].trim().split(' ');
      let line = '';
      for (let i = 0; i < words.length; i++) {
        const test = line + (line ? ' ' : '') + words[i];
        if (ctx.measureText(test).width > CONFIG.vis.storyBanner.wrapWidth) { lines.push(line); line = words[i]; }
        else line = test;
      }
      if (line) lines.push(line);
    }
    storyBannerLines = lines;
  }
  const storyPanelAlpha = storyBannerFading ? Math.max(0, storyBannerT / 20) : Math.min(1, storyFadeInT / 40);
  ctx.save();
  ctx.globalAlpha = storyPanelAlpha;
  const VS = CONFIG.vis.storyBanner;
  const bw = VS.panW;
  const _stLineH = storyBannerLines.length * VS.lineH + Math.max(0, storyBannerLines.length - 1) * VS.lineSpacing;
  const bh = VS.padTop + VS.titleH + VS.titleSpacing + _stLineH + VS.spacerH + VS.tapH + VS.padBottom;
  const {bx, by} = _panPos(bw, bh);
  ctx.fillStyle = 'rgba(0,0,40,0.92)'; ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(bx+1, by+1, bw-2, bh-2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VS.fontSize + 'px "Press Start 2P"';
  const cxSt = bx + bw / 2;
  let tySt = by + VS.padTop;
  ctx.fillStyle = C.gold;  ctx.fillText(STRINGS.storyTitle, cxSt, tySt); tySt += VS.titleH + VS.titleSpacing;
  ctx.fillStyle = C.white;
  for (let i = 0; i < storyBannerLines.length; i++) {
    ctx.fillText(storyBannerLines[i], cxSt, tySt);
    tySt += VS.lineH + (i < storyBannerLines.length - 1 ? VS.lineSpacing : VS.spacerH);
  }
  const blink = Math.floor(frame / 25) % 2 === 0;
  ctx.fillStyle = blink ? C.gold : 'rgba(0,0,0,0)'; ctx.fillText(STRINGS.tapContinue, cxSt, tySt);
  ctx.restore();
}

function drawMissionBanner() {
  if (missionBannerT <= 0 || state !== 'playing') return;
  if (!missionBannerLines) {
    ctx.font = CONFIG.vis.missionBanner.fontSize + 'px "Press Start 2P"';
    const text = STRINGS['mission' + currentLevel] || STRINGS.mission1;
    const words = text.split(' ');
    let line = '', lines = [];
    for (let i = 0; i < words.length; i++) {
      const test = line + (line ? ' ' : '') + words[i];
      if (ctx.measureText(test).width > CONFIG.vis.missionBanner.wrapWidth) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    missionBannerLines = lines;
  }
  const alpha = missionBannerT < 40 ? missionBannerT / 40 : missionBannerT > 170 ? (210 - missionBannerT) / 40 : 1;
  const VM = CONFIG.vis.missionBanner;
  const bw = VM.panW;
  const _msLineH = missionBannerLines.length * VM.lineH + Math.max(0, missionBannerLines.length - 1) * VM.lineSpacing;
  const bh = VM.padTop + VM.titleH + VM.titleSpacing + _msLineH + VM.padBottom;
  const {bx, by} = _panPos(bw, bh);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,40,0.88)'; ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(bx+1, by+1, bw-2, bh-2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VM.fontSize + 'px "Press Start 2P"';
  const cxM = bx + bw / 2;
  let tyM = by + VM.padTop;
  ctx.fillStyle = C.gold;  ctx.fillText(fmt(STRINGS.missionLabel, currentLevel), cxM, tyM); tyM += VM.titleH + VM.titleSpacing;
  ctx.fillStyle = C.white;
  for (let i = 0; i < missionBannerLines.length; i++) {
    ctx.fillText(missionBannerLines[i], cxM, tyM);
    if (i < missionBannerLines.length - 1) tyM += VM.lineH + VM.lineSpacing;
  }
  ctx.restore();
}

function drawPauseOverlay() {
  if (state !== 'paused' || !_pauseActive) return;
  ctx.save();
  const VP = CONFIG.vis.pauseOverlay;
  const pH = VP.padTop + VP.stepTitle + VP.btnH + VP.padBottom;
  const {bx, by} = _panPos(VP.panW, pH);
  ctx.fillStyle = 'rgba(0,0,40,0.92)'; ctx.fillRect(bx, by, VP.panW, pH);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(bx+1, by+1, VP.panW-2, pH-2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VP.fontSize + 'px "Press Start 2P"';
  const cx = bx + VP.panW / 2;
  let ty = by + VP.padTop;
  ctx.fillStyle = C.gold; ctx.fillText(STRINGS.pauseTitle, cx, ty); ty += VP.stepTitle;
  const rx = bx + VP.resumeOx;
  ctx.fillStyle = 'rgba(0,90,0,0.92)'; ctx.fillRect(rx, ty, VP.resumeW, VP.btnH);
  ctx.strokeStyle = C.gold; ctx.strokeRect(rx+1, ty+1, VP.resumeW-2, VP.btnH-2);
  ctx.fillStyle = C.white; ctx.fillText(STRINGS.btnResume, rx + VP.resumeW/2, ty + 3);
  ctx.restore();
}

function drawHomeConfirm() {
  if (!_homeConfirmActive) return;
  ctx.save();
  const VH = CONFIG.vis.homeConfirm;
  const hH = VH.padTop + VH.stepTitle + VH.btnH + VH.padBottom;
  const {bx, by} = _panPos(VH.panW, hH);
  ctx.fillStyle = 'rgba(0,0,40,0.92)'; ctx.fillRect(bx, by, VH.panW, hH);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(bx+1, by+1, VH.panW-2, hH-2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VH.fontSize + 'px "Press Start 2P"';
  const cx = bx + VH.panW / 2;
  let ty = by + VH.padTop;
  ctx.fillStyle = C.gold; ctx.fillText(STRINGS.homeConfirm, cx, ty); ty += VH.stepTitle;
  const siX = bx + VH.siOx, noX = bx + VH.noOx;
  ctx.fillStyle = 'rgba(0,90,0,0.92)'; ctx.fillRect(siX, ty, VH.siW, VH.btnH);
  ctx.strokeStyle = C.gold; ctx.strokeRect(siX+1, ty+1, VH.siW-2, VH.btnH-2);
  ctx.fillStyle = C.white; ctx.fillText(STRINGS.btnYes, siX + VH.siW/2, ty + 3);
  ctx.fillStyle = 'rgba(90,0,0,0.92)'; ctx.fillRect(noX, ty, VH.noW, VH.btnH);
  ctx.strokeStyle = C.gold; ctx.strokeRect(noX+1, ty+1, VH.noW-2, VH.btnH-2);
  ctx.fillStyle = C.white; ctx.fillText(STRINGS.btnNo, noX + VH.noW/2, ty + 3);
  ctx.restore();
}

function drawDebugOverlay() {
  if (!DEBUG) return;
  ctx.save();
  ctx.font = '4px monospace';
  ctx.textAlign = 'left';

  [{y:TY, label:'TY='+TY}, {y:MY, label:'MY='+MY}, {y:GY, label:'GY='+GY}].forEach(function(fl) {
    ctx.strokeStyle = 'rgba(255,255,0,0.7)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(0, fl.y); ctx.lineTo(W, fl.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(1, fl.y-6, 26, 7);
    ctx.fillStyle = '#FFFF00'; ctx.fillText(fl.label, 2, fl.y-1);
  });

  [107, 213].forEach(function(dx) {
    ctx.strokeStyle = 'rgba(0,200,255,0.6)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(dx+1, 2, 20, 7);
    ctx.fillStyle = '#00E8FF'; ctx.fillText('x='+dx, dx+2, 8);
  });

  stairs.forEach(function(s, i) {
    var lx = Math.min(s.x1,s.x2), rx = Math.max(s.x1,s.x2);
    var ty = Math.min(s.y1,s.y2), by2 = Math.max(s.y1,s.y2);
    ctx.fillStyle = 'rgba(255,120,0,0.22)';
    ctx.fillRect(lx-2, ty, rx-lx+4, by2-ty);
    ctx.strokeStyle = 'rgba(255,140,0,0.85)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(lx-2, ty, rx-lx+4, by2-ty);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(lx-2, ty-8, 55, 7);
    ctx.fillStyle = '#FF9900';
    ctx.fillText('S'+i+' ('+s.x1+','+s.y1+')→('+s.x2+','+s.y2+')', lx-1, ty-2);
    ctx.fillStyle = '#FF4400';
    ctx.fillRect(s.x1-1, s.y1-1, 3, 3);
    ctx.fillRect(s.x2-1, s.y2-1, 3, 3);
  });

  bags.forEach(function(b) {
    ctx.strokeStyle = 'rgba(100,100,255,0.9)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(b.x, b.y, 14, 10);
    ctx.fillStyle = '#8888FF'; ctx.fillText('bag', b.x, b.y-2);
  });

  BOARDS.forEach(function(b) {
    ctx.strokeStyle = 'rgba(0,255,80,0.85)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(b.x, b.y, BW, BH);
    ctx.fillStyle = '#00FF50'; ctx.fillText('brd', b.x, b.y-2);
  });

  DESKS.forEach(function(d) {
    ctx.strokeStyle = 'rgba(255,220,0,0.65)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(d.x, d.y, 20, 11);
  });

  ctx.strokeStyle = 'rgba(255,215,0,0.9)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(BELL.x-2, BELL.y-1, 10, 9);
  ctx.fillStyle = '#FFD700'; ctx.fillText('bell', BELL.x-2, BELL.y-2);

  ctx.strokeStyle = 'rgba(255,80,255,0.9)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(player.x, player.y, PW, PH);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(player.x, player.y-8, 36, 7);
  ctx.fillStyle = '#FF66FF';
  ctx.fillText('P('+Math.round(player.x)+','+Math.round(player.y)+')', player.x+1, player.y-2);

  ctx.restore();
}

function _panPos(panW, panH) {
  return { bx: Math.round((W - panW) / 2), by: Math.round((H - panH) / 2) };
}

function _drawHeart(x, y) {
  // 8×7 pixel art heart
  ctx.fillRect(x+1,y,  2,1); ctx.fillRect(x+5,y,  2,1);
  ctx.fillRect(x,  y+1,8,1); ctx.fillRect(x,  y+2,8,1); ctx.fillRect(x,  y+3,8,1);
  ctx.fillRect(x+1,y+4,6,1); ctx.fillRect(x+2,y+5,4,1); ctx.fillRect(x+3,y+6,2,1);
}

// Pixel-art icons for HUD mechanic indicator — all 7×7, drawn with fillRect
function _drawHudIcon(type, x, y, color) {
  ctx.fillStyle = color;
  switch (type) {
    case 'boards':   // lavagna: outline 7×7 + 2 righe gesso
      ctx.fillRect(x,   y,   7,1); ctx.fillRect(x,   y+6, 7,1); // top/bottom
      ctx.fillRect(x,   y+1, 1,5); ctx.fillRect(x+6, y+1, 1,5); // sides
      ctx.fillStyle = '#fff'; ctx.fillRect(x+1, y+2, 5,1);       // chalk line 1
                              ctx.fillRect(x+1, y+4, 5,1);       // chalk line 2
      break;
    case 'bags':     // cartella: corpo + manico
      ctx.fillRect(x+2, y,   3,1);                               // handle
      ctx.fillRect(x,   y+1, 7,1); ctx.fillRect(x,   y+6, 7,1); // top/bottom
      ctx.fillRect(x,   y+2, 1,4); ctx.fillRect(x+6, y+2, 1,4); // sides
      ctx.fillStyle = '#2A1F5E'; ctx.fillRect(x+2, y+3, 3,1);   // clasp
      break;
    case 'machines': // distributore: rettangolo con schermo e tasto
      ctx.fillRect(x,   y,   6,7);
      ctx.fillStyle = '#000'; ctx.fillRect(x+1, y+1, 4,2);      // screen
      ctx.fillStyle = '#FFD700'; ctx.fillRect(x+2, y+5, 2,1);   // button
      break;
    case 'ball':     // pallone: cerchio con cuciture
      ctx.fillRect(x+1, y,   5,1); ctx.fillRect(x+1, y+6, 5,1);
      ctx.fillRect(x,   y+1, 7,5);
      ctx.fillStyle = '#000'; ctx.fillRect(x+3, y+1, 1,5);      // vertical seam
      ctx.fillRect(x+1, y+3, 5,1);                              // horizontal seam
      break;
    case 'students': // alunno: testa + corpo + gambe
      ctx.fillRect(x+2, y,   3,3);                              // head
      ctx.fillRect(x+1, y+3, 5,2);                              // body
      ctx.fillRect(x+1, y+5, 2,2); ctx.fillRect(x+4, y+5, 2,2);// legs
      break;
    case 'books':    // libro: rettangolo con costa e righe
      ctx.fillRect(x,   y,   7,7);
      ctx.fillStyle = '#000'; ctx.fillRect(x+1, y,   1,7);      // spine
      ctx.fillStyle = '#fff'; ctx.fillRect(x+2, y+2, 4,1);      // page lines
                              ctx.fillRect(x+2, y+4, 4,1);
      break;
    case 'sink':     // lavandino: gocce + vasca
      ctx.fillRect(x+1, y,   1,2); ctx.fillRect(x+5, y,   1,2);// drops
      ctx.fillRect(x,   y+3, 7,1); ctx.fillRect(x,   y+6, 7,1);// basin top/bottom
      ctx.fillRect(x,   y+4, 1,2); ctx.fillRect(x+6, y+4, 1,2);// basin sides
      break;
    case 'bins':     // secchio: coperchio + corpo + miccia
      ctx.fillRect(x+1, y+1, 5,1);                              // lid
      ctx.fillRect(x,   y+2, 7,5);                              // body
      ctx.fillStyle = '#FFD700'; ctx.fillRect(x+3, y,   1,2);   // fuse
      ctx.fillStyle = '#000'; ctx.fillRect(x+2, y+4, 1,2);      // lines
                              ctx.fillRect(x+4, y+4, 1,2);
      break;
    case 'sprinklers': // fiamma: silhouette fuoco
      ctx.fillRect(x+3, y,   1,1);
      ctx.fillRect(x+2, y+1, 3,1); ctx.fillRect(x+1, y+2, 5,2);
      ctx.fillRect(x,   y+4, 7,1); ctx.fillRect(x+1, y+5, 5,1); ctx.fillRect(x+2, y+6, 3,1);
      break;
    case 'register': // registro: libro con angolo dorato
      ctx.fillRect(x,   y,   7,7);
      ctx.fillStyle = '#000'; ctx.fillRect(x+1, y+1, 5,1);      // lines
                              ctx.fillRect(x+1, y+3, 5,1);
                              ctx.fillRect(x+1, y+5, 3,1);
      ctx.fillStyle = '#FFD700'; ctx.fillRect(x+5, y+5, 2,2);   // gold corner
      break;
    default:
      ctx.fillRect(x, y, 7, 7);
  }
}

function _hudObjInfo() {
  var done = 0, total = 0, mechanic = 'boards';
  var dc = CONFIG.vis.hud.dotColors;
  if (bags.length > 0) {
    for (var i=0;i<bags.length;i++) if(bags[i].collected) done++; total=bags.length; mechanic='bags';
  } else if (levelMechanics.shakeMachines) {
    for (var i=0;i<machines.length;i++) if(machines[i].broken) done++; total=machines.length; mechanic='machines';
  } else if (levelMechanics.deflateBall) {
    done=gymBall?gymBall.deflateCount:0; total=3; mechanic='ball';
  } else if (levelMechanics.throwPaper) {
    for (var i=0;i<students.length;i++) if(students[i].disturbed) done++; total=students.length; mechanic='students';
  } else if (levelMechanics.dropBook) {
    done=bookcase?bookcase.dropCount:0; total=3; mechanic='books';
  } else if (levelMechanics.floodSink) {
    done=sink?sink.pourCount:0; total=3; mechanic='sink';
  } else if (levelMechanics.plantBomb) {
    for (var i=0;i<bins.length;i++) if(bins[i].exploded) done++; total=bins.length; mechanic='bins';
  } else if (levelMechanics.stealRegister) {
    done=register&&register.stolen?1:0; total=1; mechanic='register';
  } else if (levelMechanics.activateSprinkler) {
    for (var i=0;i<sprinklers.length;i++) if(sprinklers[i].active) done++; total=sprinklers.length; mechanic='sprinklers';
  } else {
    for (var i=0;i<BOARDS.length;i++) if(BOARDS[i].done) done++; total=BOARDS.length; mechanic='boards';
  }
  return { done:done, total:total, color:dc[mechanic]||'#44ee66', mechanic:mechanic };
}

function drawHUD() {
  if (state === 'title') return;
  var VH = CONFIG.vis.hud;
  ctx.save();
  var _f = VH.fontSize + 'px "Press Start 2P"';
  ctx.fillStyle = VH.bgColor; ctx.fillRect(0, 0, W, VH.rowH);
  // Hearts
  ctx.fillStyle = '#ff2244';
  for (var _i = 0; _i < Math.max(0, lives); _i++) _drawHeart(VH.heartsX + _i * VH.heartStep, VH.textY);
  // Score
  ctx.font = _f; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff'; ctx.fillText(String(score).padStart(5,'0'), VH.scoreX, VH.textY);
  // Counter or message
  ctx.textAlign = 'center';
  if (msgT > 0) {
    var _el = msgDuration - msgT, _ao = Math.min(_el/15,1) * (msgT<25 ? msgT/25 : 1);
    ctx.globalAlpha = _ao; ctx.fillStyle = '#ffffff';
    ctx.fillText(msgText, VH.centerX, VH.textY);
  } else if (state === 'playing') {
    var _oi = _hudObjInfo();
    var _txt = _oi.done + '/' + _oi.total;
    var _tw  = ctx.measureText(_txt).width;
    var _grpW = VH.dotW + VH.dotGap + _tw;
    var _sx = Math.round(VH.centerX - _grpW / 2);
    _drawHudIcon(_oi.mechanic, _sx, VH.textY + VH.dotOffsetY, _oi.color);
    ctx.textAlign = 'left'; ctx.fillStyle = '#44ee66';
    ctx.fillText(_txt, _sx + VH.dotW + VH.dotGap, VH.textY);
  }
  // Timer bar
  if (maxTimerTicks > 0) {
    var _pct = Math.max(0, timerTicks / maxTimerTicks);
    ctx.fillStyle = _pct > 0.6 ? '#22cc44' : _pct > 0.3 ? '#ddcc00' : '#dd1100';
    ctx.fillRect(0, VH.rowH, Math.round(W * _pct), VH.timerH);
  }
  ctx.restore();
}

var _CREDITS_MEMBERS = [
  { name: 'Luca Forina',        role: 'Orchestrator'         },
  { name: 'Claude / Anthropic', role: 'Lead Developer'       },
  { name: 'ChatGPT',            role: 'Graphics'             },
  { name: 'OpenGameArt.org',    role: 'Music & Effects'      },
  { name: 'Family',             role: 'Beta Testing & Ideas' },
];

function drawCredits() {
  if (!_creditsActive) return;
  ctx.save();
  var VC = CONFIG.vis.credits;
  var n = _CREDITS_MEMBERS.length;
  var panH = VC.padTop + VC.stepTitle + VC.stepTeam
           + n * (VC.nameH + VC.nameGap + VC.roleH + VC.roleGap)
           + VC.btnGapAbove + VC.btnH + VC.padBottom;
  var _cp = _panPos(VC.panW, panH); var bx = _cp.bx, by = _cp.by;
  ctx.fillStyle = 'rgba(0,0,40,0.96)'; ctx.fillRect(bx, by, VC.panW, panH);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(bx+1, by+1, VC.panW-2, panH-2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  var cx = bx + VC.panW / 2;
  var ty = by + VC.padTop;
  ctx.font = VC.fontTitle + 'px "Press Start 2P"'; ctx.fillStyle = C.gold;
  ctx.fillText('— CREDITS —', cx, ty); ty += VC.stepTitle;
  ctx.font = VC.fontBody + 'px "Press Start 2P"'; ctx.fillStyle = C.lgreen;
  ctx.fillText('LucazadeSoft Team', cx, ty); ty += VC.stepTeam;
  for (var i = 0; i < n; i++) {
    ctx.fillStyle = C.white; ctx.fillText(_CREDITS_MEMBERS[i].name, cx, ty); ty += VC.nameH + VC.nameGap;
    ctx.fillStyle = C.cyan;  ctx.fillText(_CREDITS_MEMBERS[i].role, cx, ty); ty += VC.roleH + VC.roleGap;
  }
  ty += VC.btnGapAbove;
  var btnX = bx + Math.round((VC.panW - VC.btnW) / 2);
  ctx.fillStyle = 'rgba(0,90,0,0.92)'; ctx.fillRect(btnX, ty, VC.btnW, VC.btnH);
  ctx.strokeStyle = C.gold; ctx.strokeRect(btnX+1, ty+1, VC.btnW-2, VC.btnH-2);
  ctx.fillStyle = C.white; ctx.fillText('OK', bx + VC.panW/2, ty + Math.round((VC.btnH - VC.fontBody) / 2));
  ctx.restore();
}

function updateHUD() {} // sostituita da drawHUD() su canvas
