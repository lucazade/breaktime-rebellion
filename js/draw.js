// Rendering — all draw functions and HUD update

function drawBg() {
  // Hand-drawn background: 640×400px, drawn at 1:1 canvas pixels (bypasses ctx.scale)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) ctx.drawImage(bgImage, 0, 0);
  ctx.setTransform(2, 0, 0, 2, 0, 0);
}


function drawDesks() {
  for (let i = 0; i < DESKS.length; i++) {
    const d = DESKS[i];
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
    ctx.fillStyle = C.chalkbg; ctx.fillRect(b.x, b.y, BW, BH);
    if (!b.done) {
      ctx.fillStyle = 'rgba(200,220,200,0.18)';
      ctx.fillRect(b.x+2, b.y+3, BW-4, 2);
      ctx.fillRect(b.x+2, b.y+8, BW-4, 2);
      if (i === nearestIdx && nd < 36) {
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
        ctx.setLineDash([2,2]);
        ctx.strokeRect(b.x-2, b.y-2, BW+4, BH+4);
        ctx.setLineDash([]);
      }
    } else {
      ctx.fillStyle = C.pink; ctx.font = '4px "Press Start 2P"';
      ctx.fillText('MARCO', b.x+1, b.y+9);
      ctx.fillStyle = C.yellow; ctx.fillRect(b.x+1, b.y+10, BW-2, 1);
    }
  }
}

function drawBell() {
  const bx = BELL.x, by = BELL.y;
  const sx = BELL.ringing ? Math.round(Math.sin(frame * 0.6) * 2) : 0;
  const gold = BELL.ringing ? '#FFE000' : C.bell;

  ctx.fillStyle = C.dgray;
  ctx.fillRect(bx+1, by, 3, 2);

  ctx.fillStyle = gold;
  ctx.fillRect(bx+0+sx, by+2, 5, 1);
  ctx.fillRect(bx-1+sx, by+3, 7, 2);
  ctx.fillRect(bx-2+sx, by+5, 9, 1);

  ctx.fillStyle = 'rgba(255,255,200,0.6)';
  ctx.fillRect(bx+1+sx, by+3, 1, 1);

  ctx.fillStyle = C.brown;
  ctx.fillRect(bx+2+sx, by+6, 1, 2);
  ctx.fillRect(bx+1+sx, by+8, 3, 1);

  if ((allBoards || allBags) && !BELL.done) {
    const pulse = 0.12 + 0.08 * Math.sin(frame * 0.15);
    ctx.fillStyle = 'rgba(255,215,0,' + pulse + ')';
    ctx.beginPath(); ctx.arc(bx+3, by+5, 7, 0, Math.PI*2); ctx.fill();
  }

  if (BELL.ringing) {
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = 'rgba(255,215,0,' + (0.6 - i*0.15) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(bx+3, by+5, 4+i*3, 0, Math.PI*2); ctx.stroke();
    }
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
    if (Math.floor(frame/10)%2 === 0) {
      ctx.fillStyle = C.gold;
      ctx.fillRect(b.x+12, b.y-1, 2, 2);
      ctx.fillRect(b.x-1, b.y+8, 2, 2);
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
      const pct = m.shakeT / CONFIG.shakeTime;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(mx-1, my-5, 12, 3);
      ctx.fillStyle = C.yellow;
      ctx.fillRect(mx-1, my-5, Math.round(12 * pct), 3);
    }

    // Proximity highlight (dashed border)
    if (!m.broken && !allMachines) {
      const pdx = Math.abs(player.x + PW/2 - m.x - 5);
      const pdy = Math.abs(player.y + PH  - m.y - 18);
      if (pdx < 14 && pdy < 8) {
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(mx-2, my-2, 14, 22);
        ctx.setLineDash([]);
      }
    }
  }
}

function drawChar(x, y, dir, animT, bodyCol, isTeacher, spraying, chasing) {
  const bx = Math.round(x), by = Math.round(y);
  const leg = Math.sin(animT) * 2.5;

  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-1, by+PH, PW, 2);

  ctx.fillStyle = isTeacher ? C.blue : C.mgray;
  ctx.fillRect(bx+1, by+10, 3, 4+leg);
  ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = C.black;
  ctx.fillRect(bx,   by+13+leg, 4, 2);
  ctx.fillRect(bx+3, by+13-leg, 4, 2);

  ctx.fillStyle = bodyCol; ctx.fillRect(bx, by+4, PW, 8);
  if (isTeacher) { ctx.fillStyle = C.yellow; ctx.fillRect(bx+3, by+5, 2, 6); }
  else { ctx.fillStyle = C.lblue; ctx.fillRect(bx+1, by+4, 1, 8); ctx.fillRect(bx+5, by+4, 1, 8); }

  ctx.fillStyle = C.pink;
  ctx.fillRect(dir>0 ? bx-2 : bx+PW, by+5, 2, 4);
  ctx.fillRect(dir>0 ? bx+PW : bx-2, by+5, 2, 4);
  if (isTeacher) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(dir>0 ? bx-4 : bx+PW+1, by+7, 3, 4);
  }

  ctx.fillStyle = C.pink; ctx.fillRect(bx+1, by-7, PW-2, 8);
  ctx.fillStyle = isTeacher ? C.lgray : C.brown; ctx.fillRect(bx+1, by-8, PW-2, 2);
  ctx.fillStyle = C.black; ctx.fillRect(dir>0 ? bx+4 : bx+2, by-5, 2, 2);
  if (isTeacher) { ctx.fillStyle = C.black; ctx.fillRect(bx+1, by-5, 3, 1); ctx.fillRect(bx+5, by-5, 3, 1); }

  if (spraying) {
    const sx = dir>0 ? bx+PW : bx-5;
    ctx.fillStyle = C.cyan; ctx.fillRect(sx, by+4, 4, 6);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(180,230,180,' + (0.4+Math.random()*0.3) + ')';
      ctx.fillRect(sx + (dir>0 ? 4+i*3 : -i*3-3), by+4+i%3, 3, 3);
    }
  }
  if (!isTeacher) { ctx.fillStyle = C.blue; ctx.fillRect(dir>0 ? bx-3 : bx+PW, by+4, 3, 6); }

  if (chasing) {
    const bub = dir>0 ? bx+PW : bx-26;
    ctx.fillStyle = C.yellow; ctx.fillRect(bub, by-14, 26, 10);
    ctx.fillStyle = C.black; ctx.font = '5px "Press Start 2P"';
    ctx.fillText(STRINGS.hey, bub+1, by-7);
  }
}

function drawJanitor(x, y, dir, animT) {
  drawChar(x, y, dir, animT, C.mgray, false, false, false);
  const bx = Math.round(x), by = Math.round(y);
  ctx.fillStyle = C.blue;
  ctx.fillRect(bx+1, by-9, PW-2, 3);
  ctx.fillRect(dir>0 ? bx+PW-1 : bx-1, by-7, 3, 1);
  const mx = dir > 0 ? bx+PW : bx-1;
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
    if (t.chasing) continue;
    ctx.fillStyle = 'rgba(255,200,0,0.05)';
    const rx = t.dir>0 ? t.x+PW : t.x-t.sight;
    ctx.fillRect(rx, t.y-2, t.sight, PH+4);
  }
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
    ctx.fillStyle = t.color; ctx.font = '6px "Press Start 2P"';
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
  const bx = 160 - 130;
  const by = 64;
  const bw = 260;
  const bh = 72;
  const isWin = state === 'win';
  const scoreText = STRINGS.scoreLabel + String(score).padStart(5, '0');
  const actionText = isWin
    ? (currentLevel < LEVELS.length ? STRINGS.reloadNext : STRINGS.reloadWin)
    : STRINGS.reloadLose;
  const actionVisible = Math.floor(frame / 20) % 2 === 0;
  drawOverlayPanel(bx, by, bw, bh, isWin ? 'rgba(0,0,60,0.88)' : 'rgba(60,0,0,0.88)', C.gold, [
    {
      text: isWin ? STRINGS.winTitle : STRINGS.gameoverTitle,
      font: isWin ? '8px "Press Start 2P"' : '10px "Press Start 2P"',
      color: isWin ? C.gold : C.redprof,
      height: 10,
      spacing: 10,
    },
    {
      text: scoreText,
      font: '7px "Press Start 2P"',
      color: C.white,
      height: 10,
      spacing: 6,
    },
    {
      text: actionText,
      font: '6px "Press Start 2P"',
      color: actionVisible ? (isWin ? C.green : C.gold) : 'rgba(255,255,255,0)',
      height: 10,
      spacing: 0,
    },
  ]);
}

function drawMissionBanner() {
  if (missionBannerT <= 0) return;
  if (!missionBannerLines) {
    ctx.font = '7px "Press Start 2P"';
    const text = STRINGS['mission' + currentLevel] || STRINGS.mission1;
    const words = text.split(' ');
    let line = '', lines = [];
    for (let i = 0; i < words.length; i++) {
      const test = line + (line ? ' ' : '') + words[i];
      if (ctx.measureText(test).width > 220) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    missionBannerLines = lines;
  }
  const alpha = missionBannerT < 40 ? missionBannerT / 40 : 1;
  const bx = 160 - 130;
  const by = 64;
  const bw = 260;
  const bh = 72;
  const lines = [
    {
      text: fmt(STRINGS.missionLabel, currentLevel),
      font: '7px "Press Start 2P"',
      color: C.gold,
      height: 10,
      spacing: 8,
    },
  ];
  for (let i = 0; i < missionBannerLines.length; i++) {
    lines.push({
      text: missionBannerLines[i],
      font: '7px "Press Start 2P"',
      color: C.white,
      height: 10,
      spacing: i < missionBannerLines.length - 1 ? 4 : 0,
    });
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  drawOverlayPanel(bx, by, bw, bh, 'rgba(0,0,40,0.88)', C.gold, lines);
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
  ctx.strokeRect(BELL.x-4, BELL.y-4, 14, 14);
  ctx.fillStyle = '#FFD700'; ctx.fillText('bell', BELL.x-4, BELL.y-5);

  ctx.strokeStyle = 'rgba(255,80,255,0.9)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(player.x, player.y, PW, PH);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(player.x, player.y-8, 36, 7);
  ctx.fillStyle = '#FF66FF';
  ctx.fillText('P('+Math.round(player.x)+','+Math.round(player.y)+')', player.x+1, player.y-2);

  ctx.restore();
}

var _HEART_SVG = '<svg width="14" height="12" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg" style="shape-rendering:crispEdges;display:inline-block;vertical-align:middle;margin-right:2px;filter:drop-shadow(1px 1px 1px rgba(0,0,0,0.2))"><rect x="2" y="0" width="4" height="2" fill="currentColor"/><rect x="8" y="0" width="4" height="2" fill="currentColor"/><rect x="0" y="2" width="14" height="2" fill="currentColor"/><rect x="0" y="4" width="14" height="2" fill="currentColor"/><rect x="2" y="6" width="10" height="2" fill="currentColor"/><rect x="4" y="8" width="6" height="2" fill="currentColor"/><rect x="6" y="10" width="2" height="2" fill="currentColor"/></svg>';

function updateHUD() {
  var h = ''; for (var _i = 0; _i < Math.max(0, lives); _i++) h += _HEART_SVG;
  document.getElementById('hL').innerHTML = h;
  let done = 0;
  for (let i = 0; i < BOARDS.length; i++) if (BOARDS[i].done) done++;
  document.getElementById('hW').textContent = done + '/' + BOARDS.length;
  document.getElementById('hS').textContent = String(score).padStart(5,'0');
  var msgEl = document.getElementById('msg');
  if (msgT > 0) { msgT--; msgEl.textContent = msgText; }
  else { msgEl.textContent = ''; }
  // Objective counter and icon — switches per active mechanic
  var objDone = 0, objTotal = 0, iconClass = 'fa-spray-can';
  if (levelMechanics.stealBags) {
    for (let i = 0; i < bags.length; i++) if (bags[i].collected) objDone++;
    objTotal = bags.length;
    iconClass = 'fa-bag-shopping';
  } else if (levelMechanics.shakeMachines) {
    for (let i = 0; i < machines.length; i++) if (machines[i].broken) objDone++;
    objTotal = machines.length;
    iconClass = 'fa-box';
  } else {
    for (let i = 0; i < BOARDS.length; i++) if (BOARDS[i].done) objDone++;
    objTotal = BOARDS.length;
  }
  var icon = document.getElementById('hud-obj-icon');
  if (icon && !icon.classList.contains(iconClass)) {
    icon.className = 'fa-solid ' + iconClass + ' hud-icon hud-spray';
  }
  document.getElementById('hW').textContent = objDone + '/' + objTotal;
  if (maxTimerTicks > 0) {
    var pct = Math.max(0, timerTicks / maxTimerTicks);
    var bar = document.getElementById('timer-bar');
    if (bar) {
      bar.style.width = (pct * 100) + '%';
      bar.style.background = pct > 0.6 ? C.lgreen : pct > 0.3 ? C.yellow : C.red;
    }
  }
}
