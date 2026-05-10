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
        ctx.fillStyle = C.yellow; ctx.font = '5px "Press Start 2P"';
        ctx.fillText('✏', b.x+BW/2-4, b.y+BH+8);
      }
    } else {
      ctx.fillStyle = C.pink; ctx.font = '4px "Press Start 2P"';
      ctx.fillText('MARCO', b.x+2, b.y+9);
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

  if (allBoards && !BELL.done) {
    const pulse = 0.12 + 0.08 * Math.sin(frame * 0.15);
    ctx.fillStyle = 'rgba(255,215,0,' + pulse + ')';
    ctx.beginPath(); ctx.arc(bx+3, by+5, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = C.gold; ctx.font = '5px "Press Start 2P"';
    ctx.fillText('🔔', bx-5, by+14);
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

function drawChar(x, y, dir, animT, bodyCol, isTeacher, spraying, stunned, chasing) {
  const bx = Math.round(x), by = Math.round(y);
  if (stunned && Math.floor(frame/5)%2 === 1) return;
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
  drawChar(x, y, dir, animT, C.mgray, false, false, false, false);
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

function drawEndScreen() {
  ctx.save();
  ctx.textAlign = 'center';
  if (state === 'win') {
    ctx.fillStyle = 'rgba(0,0,60,0.88)'; ctx.fillRect(20, 60, 280, 80);
    ctx.fillStyle = C.gold;  ctx.font = '8px "Press Start 2P"';
    ctx.fillText(STRINGS.winTitle, 160, 85);
    ctx.fillStyle = C.white; ctx.font = '7px "Press Start 2P"';
    ctx.fillText(STRINGS.scoreLabel + String(score).padStart(5,'0'), 160, 103);
    if (Math.floor(frame/20)%2 === 0) {
      ctx.fillStyle = C.lgreen; ctx.font = '6px "Press Start 2P"';
      ctx.fillText(STRINGS.reloadWin, 160, 124);
    }
  }
  if (state === 'gameover') {
    ctx.fillStyle = 'rgba(60,0,0,0.88)'; ctx.fillRect(40, 65, 240, 70);
    ctx.fillStyle = C.red;   ctx.font = '10px "Press Start 2P"';
    ctx.fillText(STRINGS.gameoverTitle, 160, 92);
    ctx.fillStyle = C.white; ctx.font = '7px "Press Start 2P"';
    ctx.fillText(STRINGS.scoreLabel + String(score).padStart(5,'0'), 160, 110);
    if (Math.floor(frame/20)%2 === 0) {
      ctx.fillStyle = C.yellow; ctx.font = '6px "Press Start 2P"';
      ctx.fillText(STRINGS.reloadLose, 160, 128);
    }
  }
  ctx.restore();
}

function drawMissionBanner() {
  if (missionBannerT <= 0) return;
  var alpha = missionBannerT < 40 ? missionBannerT / 40 : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,40,0.88)'; ctx.fillRect(20, 72, 280, 56);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
  ctx.strokeRect(21, 73, 278, 54);
  ctx.font = '6px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = C.gold;
  ctx.fillText(fmt(STRINGS.missionLabel, currentLevel), 160, 91);
  ctx.fillStyle = C.white; ctx.font = '5px "Press Start 2P"';
  var missionText = STRINGS['mission' + currentLevel] || STRINGS.mission1;
  var words = missionText.split(' '), line = '', lines = [];
  for (var i = 0; i < words.length; i++) {
    var test = line + (line ? ' ' : '') + words[i];
    if (ctx.measureText(test).width > 240) { lines.push(line); line = words[i]; }
    else line = test;
  }
  if (line) lines.push(line);
  for (var li = 0; li < lines.length; li++)
    ctx.fillText(lines[li], 160, 107 + li * 10);
  ctx.textAlign = 'left';
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

function updateHUD() {
  document.getElementById('hL').textContent = '♥'.repeat(Math.max(0, lives));
  let done = 0;
  for (let i = 0; i < BOARDS.length; i++) if (BOARDS[i].done) done++;
  document.getElementById('hW').textContent = done + '/' + BOARDS.length;
  document.getElementById('hS').textContent = String(score).padStart(5,'0');
  if (msgT > 0) { msgT--; document.getElementById('msg').textContent = msgText; }
  // Objective counter and icon — bags (stealBags) or boards (writeBoards)
  var objDone = 0, objTotal = 0;
  if (levelMechanics.stealBags) {
    for (let i = 0; i < bags.length; i++) if (bags[i].collected) objDone++;
    objTotal = bags.length;
    var icon = document.getElementById('hud-obj-icon');
    if (icon && !icon.classList.contains('fa-bag-shopping')) {
      icon.className = 'fa-solid fa-bag-shopping hud-icon hud-spray';
    }
  } else {
    for (let i = 0; i < BOARDS.length; i++) if (BOARDS[i].done) objDone++;
    objTotal = BOARDS.length;
    var icon = document.getElementById('hud-obj-icon');
    if (icon && !icon.classList.contains('fa-spray-can')) {
      icon.className = 'fa-solid fa-spray-can hud-icon hud-spray';
    }
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
