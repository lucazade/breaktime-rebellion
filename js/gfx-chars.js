// ═══════════════════════════════════════════════════════════
//  GFX CHARS — player/char config + sprite draw functions
//  Depends on: gfx-palette, gfx-building. FF defined in config.js.
// ═══════════════════════════════════════════════════════════

// Player dimensions — defined here so PH is available for playerStart
const PW = 8, PH = 16;

// Player start position — added to shared (defined in gfx-building.js) now that PH is available
CONFIG.vis.shared.playerStart = { x: 18, y: GY - PH - walkOffset };

// Character sprite config — outline settings
Object.assign(CONFIG.vis, {
  char: {
    outline:      true,
    outlineSize:  1.0,
    outlineColor: PAL.charOutline,
  },
});

function drawGuard(x, y, dir, animT, knockedT) {
  const bx = Math.round(x), by = Math.round(y);
  if (knockedT > 0) {
    const fy = by + PH - 1;
    ctx.fillStyle = PAL.shadow; ctx.fillRect(bx-4, fy+2, 18, 2);
    if (CONFIG.vis.char.outline) {
      const s = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-s, fy-3-s, 14+s*2, 4+s*2);
      ctx.fillRect((dir>0 ? bx+12 : bx-6)-s, fy-4-s, 6+s*2, 5+s*2);
    }
    ctx.fillStyle = PAL.guardUniform; ctx.fillRect(bx-2, fy-3, 14, 4);
    ctx.fillStyle = PAL.skin;   ctx.fillRect(dir > 0 ? bx+12 : bx-6, fy-4, 6, 5);
    return;
  }
  const leg = Math.sin(animT) * 2.5;
  ctx.fillStyle = PAL.shadow; ctx.fillRect(bx-1, by+PH, PW, 2);
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
  ctx.fillStyle = PAL.guardTrousers; ctx.fillRect(bx+1, by+10, 3, 4+leg); ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = PAL.black; ctx.fillRect(bx, by+13+leg, 4, 2); ctx.fillRect(bx+3, by+13-leg, 4, 2);
  // Dark uniform body
  ctx.fillStyle = PAL.guardUniform; ctx.fillRect(bx, by+2, PW, 8);
  // Arms
  ctx.fillStyle = PAL.skin; ctx.fillRect(dir>0 ? bx-2 : bx+PW, by+5, 2, 4); ctx.fillRect(dir>0 ? bx+PW : bx-2, by+5, 2, 4);
  // Head
  ctx.fillStyle = PAL.skin; ctx.fillRect(bx+1, by-7, PW-2, 8);
  // White cap
  ctx.fillStyle = PAL.guardCap; ctx.fillRect(bx, by-8, PW, 3);
  ctx.fillStyle = PAL.guardCapVisor; ctx.fillRect(dir>0 ? bx-2 : bx+PW-1, by-7, 3, 2); // cap visor
  // Eye
  ctx.fillStyle = PAL.black; ctx.fillRect(dir>0 ? bx+4 : bx+2, by-5, 2, 2);
  ctx.fillStyle = PAL.skinShadow; ctx.fillRect(bx+2, by+1, PW-4, 1);
}

function drawPreside(x, y, dir, animT, bodyCol, chasing, knockedT) {
  const bx = Math.round(x), by = Math.round(y);

  if (knockedT > 0) {
    const fy = by + PH - 1;
    ctx.fillStyle = PAL.shadow; ctx.fillRect(bx-4, fy+2, 18, 2);
    if (CONFIG.vis.char.outline) {
      const s = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-s, fy-3-s, 14+s*2, 4+s*2);
      ctx.fillRect((dir>0 ? bx+12 : bx-6)-s, fy-4-s, 6+s*2, 5+s*2);
      ctx.fillRect((dir>0 ? bx-4 : bx+8)-s, fy-2-s, 4+s*2, 3+s*2);
    }
    ctx.fillStyle = bodyCol; ctx.fillRect(bx-2, fy-3, 14, 4);
    ctx.fillStyle = PAL.skin;  ctx.fillRect(dir > 0 ? bx+12 : bx-6, fy-4, 6, 5);
    ctx.fillStyle = PAL.trousersGray; ctx.fillRect(dir > 0 ? bx-4 : bx+8, fy-2, 4, 3);
    return;
  }

  const leg = Math.sin(animT) * 2.5;

  // Shadow slightly wider for heavier build
  ctx.fillStyle = PAL.shadow; ctx.fillRect(bx-2, by+PH, PW+4, 2);

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
  ctx.fillStyle = PAL.trousersGray;
  ctx.fillRect(bx+1, by+10, 3, 4+leg);
  ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = PAL.profShoes;
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
  ctx.fillStyle = PAL.white;          // cuff
  ctx.fillRect(frontX, by+11, 2, 1);
  ctx.fillRect(backX,  by+11, 2, 1);
  ctx.fillStyle = PAL.skin;           // hand
  ctx.fillRect(frontX, by+12, 2, 2);
  ctx.fillRect(backX,  by+12, 2, 2);

  // Head
  ctx.fillStyle = PAL.skin;  ctx.fillRect(bx+1, by-7, PW-2, 8);
  ctx.fillStyle = PAL.white; ctx.fillRect(bx+1, by-8, PW-2, 2); // white hair — older
  ctx.fillStyle = PAL.black; ctx.fillRect(dir > 0 ? bx+4 : bx+2, by-5, 2, 2); // eye, no glasses
  ctx.fillStyle = PAL.skinShadow; ctx.fillRect(bx+2, by+1, PW-4, 1);

  if (chasing) {
    const bub = dir > 0 ? bx+PW+1 : bx-27;
    const tailX = dir > 0 ? bub : bub+23;
    ctx.fillStyle = PAL.speechBubble;
    ctx.fillRect(tailX, by-4, 3, 4); ctx.fillRect(bub, by-14, 26, 10);
    ctx.strokeStyle = PAL.speechBorder; ctx.lineWidth = 1; ctx.strokeRect(bub, by-14, 26, 10);
    ctx.beginPath(); ctx.moveTo(tailX, by-4); ctx.lineTo(tailX, by); ctx.lineTo(tailX+3, by); ctx.lineTo(tailX+3, by-4); ctx.stroke();
    ctx.fillStyle = PAL.black; ctx.font = '4px ' + FF;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(STRINGS.hey, bub + 13, by - 9);
  }
}

function drawChar(x, y, dir, animT, bodyCol, isTeacher, spraying, chasing, knockedT) {
  const bx = Math.round(x), by = Math.round(y);

  // Knocked-down state — draw teacher lying flat on floor
  if (isTeacher && knockedT > 0) {
    const fy = by + PH - 1; // floor level
    ctx.fillStyle = PAL.shadow; ctx.fillRect(bx-4, fy+2, 18, 2); // shadow
    if (CONFIG.vis.char.outline) {
      const s = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-s, fy-3-s, 14+s*2, 4+s*2);
      ctx.fillRect((dir>0 ? bx+12 : bx-6)-s, fy-4-s, 6+s*2, 5+s*2);
      ctx.fillRect((dir>0 ? bx-4 : bx+8)-s, fy-2-s, 4+s*2, 3+s*2);
    }
    ctx.fillStyle = bodyCol;         ctx.fillRect(bx-2, fy-3, 14, 4); // body horizontal
    ctx.fillStyle = PAL.skin;        ctx.fillRect(dir > 0 ? bx+12 : bx-6, fy-4, 6, 5); // head
    ctx.fillStyle = PAL.trousersGray; ctx.fillRect(dir > 0 ? bx-4 : bx+8, fy-2, 4, 3); // feet
    return;
  }

  const leg = Math.sin(animT) * 2.5;

  ctx.fillStyle = PAL.shadow; ctx.fillRect(bx-1, by+PH, PW, 2);

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

  ctx.fillStyle = isTeacher ? PAL.trousersGray : PAL.marcoTrousers;
  ctx.fillRect(bx+1, by+10, 3, 4+leg);
  ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = isTeacher ? PAL.profShoes : PAL.marcoShoes;
  ctx.fillRect(bx,   by+13+leg, 4, 2);
  ctx.fillRect(bx+3, by+13-leg, 4, 2);

  ctx.fillStyle = bodyCol; ctx.fillRect(bx, by+2, PW, 8);
  if (isTeacher) { ctx.fillStyle = PAL.yellow; ctx.fillRect(bx+3, by+2, 2, 6); }
  // Marco: no shirt stripes

  ctx.fillStyle = PAL.skin;
  ctx.fillRect(dir>0 ? bx-2 : bx+PW, by+5, 2, 4);
  ctx.fillRect(dir>0 ? bx+PW : bx-2, by+5, 2, 4);

  ctx.fillStyle = PAL.skin;       ctx.fillRect(bx+1, by-7, PW-2, 8);
  ctx.fillStyle = isTeacher ? PAL.hairGray : PAL.hairDark; ctx.fillRect(bx+1, by-8, PW-2, 2);
  ctx.fillStyle = PAL.black;      ctx.fillRect(dir>0 ? bx+4 : bx+2, by-5, 2, 2);
  ctx.fillStyle = PAL.skinShadow; ctx.fillRect(bx+2, by+1, PW-4, 1);

  if (spraying) {
    const sx = dir>0 ? bx+PW+2 : bx-6;
    ctx.fillStyle = PAL.sprayCanDark; ctx.fillRect(sx-1, by+2, 6, 7); // dark outline
    ctx.fillStyle = PAL.blue;   ctx.fillRect(sx,   by+3, 4, 5); // can
    for (let i = 0; i < 8; i++) {
      const t = (frame * 5 + i * 11) % 19;
      const dist = 2 + i * 2 + (t % 3);
      const oy = Math.round(((t % 5) - 2) * (1 + i / 4));
      const lift = Math.round(dist * 0.35);
      ctx.fillStyle = 'rgba(140,220,140,' + (0.9 - i * 0.09).toFixed(2) + ')';
      ctx.fillRect(sx + (dir>0 ? 4+dist : -1-dist), by+5+oy-lift, 1, 1);
    }
  }
  if (!isTeacher) { ctx.fillStyle = PAL.marcoBackpack; ctx.fillRect(dir>0 ? bx-3 : bx+PW, by+2, 3, 6); }

  if (chasing) {
    const bub = dir>0 ? bx+PW+1 : bx-27;
    const tailX = dir>0 ? bub : bub+23;
    ctx.fillStyle = PAL.speechBubble;
    ctx.fillRect(tailX, by-4, 3, 4); ctx.fillRect(bub, by-14, 26, 10);
    ctx.strokeStyle = PAL.speechBorder; ctx.lineWidth = 1; ctx.strokeRect(bub, by-14, 26, 10);
    ctx.beginPath(); ctx.moveTo(tailX, by-4); ctx.lineTo(tailX, by); ctx.lineTo(tailX+3, by); ctx.lineTo(tailX+3, by-4); ctx.stroke();
    ctx.fillStyle = PAL.black; ctx.font = '4px ' + FF;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(STRINGS.hey, bub + 13, by - 9);
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
  ctx.fillStyle = PAL.white;
  ctx.fillRect(mx-2, by+16, 5, 1);
}

function drawLucaEnd() {
  if (!exitDone || !levelMechanics.escapeExit) return;
  // Luca stands at the exit door
  const lx = Math.round(exitDoor.x) + 1;
  const ly = Math.round(GY - PH - walkOffset);
  drawChar(lx, ly, 1, 0, PAL.white, false, false, false, 0);

  // Speech bubble — hidden once win banner appears
  if (state === 'win') return;
  const VF = CONFIG.vis.lucaFumetto;
  ctx.font = VF.fontBody + 'px ' + FF;
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
  ctx.strokeStyle = PAL.bubbleBorder; ctx.lineWidth = 1;
  ctx.strokeRect(bx, by2, VF.bw, bh);
  ctx.fillStyle = C.gold; ctx.fillRect(bx, by2 + bh, VF.tailW, VF.tailH);
  ctx.strokeStyle = PAL.bubbleBorder; ctx.strokeRect(bx, by2 + bh, VF.tailW, VF.tailH);
  ctx.fillStyle = C.redprof; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Luca:', bx + 4, by2 + 4);
  ctx.fillStyle = PAL.black;
  for (let i = 0; i < lineCount; i++) {
    ctx.fillText(lines[i], bx + 4, by2 + VF.headerH + i * VF.lineH);
  }
  const tapY = by2 + VF.headerH + lineCount * VF.lineH + VF.gapTap;
  const blink = Math.floor(frame / 25) % 2 === 0;
  ctx.fillStyle = blink ? PAL.black : PAL.transparent;
  ctx.textAlign = 'center';
  ctx.fillText(STRINGS.tapContinue, bx + VF.bw / 2, tapY);
  ctx.textAlign = 'left';
}

function drawStudents() {
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const wobble = s.shakeT > 0 ? Math.round(Math.sin(s.shakeT * 0.9) * 2) : 0;
    const bx = Math.round(s.x + 5) + wobble;
    const by = Math.round(s.y);
    if (CONFIG.vis.char.outline) {
      const so = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-so, by-17-so, 5+so*2, 9+so*2);
      ctx.fillRect(bx-3-so, by-8-so,  7+so*2, 6+so*2);
      ctx.fillRect(bx-4-so, by-3-so,  2+so*2, 3+so*2);
      ctx.fillRect(bx+2-so, by-3-so,  2+so*2, 3+so*2);
    }
    ctx.fillStyle = C.brown; ctx.fillRect(bx-2, by-17, 5, 2);
    ctx.fillStyle = PAL.skin;  ctx.fillRect(bx-2, by-15, 5, 7);
    ctx.fillStyle = PAL.black; ctx.fillRect(bx-2, by-13, 2, 2);
    ctx.fillStyle = PAL.white; ctx.fillRect(bx-3, by-8, 7, 6);
    ctx.fillStyle = PAL.skin;
    ctx.fillRect(bx-4, by-3, 2, 3);
    ctx.fillRect(bx+2, by-3, 2, 3);
    if (s.disturbed) {
      ctx.fillStyle = PAL.exclamation;
      ctx.save(); ctx.textAlign = 'center';
      ctx.font = '8px ' + FF;
      ctx.fillText('!', bx+4, by-19);
      ctx.restore();
    }
  }
}
