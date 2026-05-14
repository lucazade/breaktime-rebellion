// Physics — player movement, gravity, stair and floor collision

function getFloorBelow(px, py) {
  const b = py + PH;
  for (let i = 0; i < floors.length; i++) {
    const f = floors[i];
    if (b >= f.y-1 && b <= f.y+6 && px+PW > f.x+2 && px < f.x+f.w-2) return f.y;
  }
  return null;
}

function getStairAt(px, py) {
  const cx = px + PW/2, cy = py + PH;
  for (let i = 0; i < stairs.length; i++) {
    const s = stairs[i];
    const minX = Math.min(s.x1,s.x2)-6, maxX = Math.max(s.x1,s.x2)+6;
    const minY = Math.min(s.y1,s.y2)-4, maxY = Math.max(s.y1,s.y2)+4;
    if (cx >= minX && cx <= maxX && cy >= minY && cy <= maxY) {
      let t = (cx - s.x1) / (s.x2 - s.x1);
      t = Math.max(0, Math.min(1, t));
      const expectedY = s.y1 + (s.y2 - s.y1) * t;
      if (Math.abs(cy - expectedY) < 14) return {stair:s, t:t};
    }
  }
  return null;
}

function clampX(x) { return Math.max(4, Math.min(W - PW - 4, x)); }

function updatePlayer() {
  if (state !== 'playing') return;
  if (player.stunT > 0) { player.stunT--; return; }
  if (player.spraying) { player.sprayT--; if (player.sprayT <= 0) player.spraying = false; return; }

  // Vending machine shake — hold action near machine to smash it
  player.shaking = false;
  if (levelMechanics.shakeMachines && K.action && !player.onStair) {
    for (let mi = 0; mi < machines.length; mi++) {
      const m = machines[mi];
      if (m.broken) continue;
      const dx = Math.abs(player.x + PW/2 - m.x - 5);
      const dy = Math.abs(player.y + PH  - m.y - 18);
      if (dx < 14 && dy < 20) {
        player.shaking = true;
        actionPressed = false;
        player.dir = (player.x + PW/2 < m.x + 5) ? 1 : -1;
        m.shakeT++;
        if (m.shakeT >= CONFIG.shakeTime) {
          m.broken = true;
          score += 500;
          addFloating(m.x + 5, m.y, '+500', C.yellow);
          addParticles(m.x + 5, m.y + 9, C.yellow, 18);
          alertTeachers(m.x + 5, m.y + 9);
          let broken = 0;
          for (let j = 0; j < machines.length; j++) if (machines[j].broken) broken++;
          if (broken === machines.length) {
            machineWin();
          } else {
            setMsg(fmt(STRINGS.machineBroken, broken, machines.length));
          }
        }
        break;
      }
    }
  }
  if (!player.shaking && levelMechanics.deflateBall && gymBall && !gymBall.deflated && K.action && !player.onStair) {
    const dx = Math.abs(player.x + PW/2 - gymBall.x - 4);
    const dy = Math.abs(player.y + PH  - gymBall.y - 9);
    if (dx < 14 && dy < 14) {
      player.shaking = true;
      actionPressed = false;
      player.dir = (player.x + PW/2 < gymBall.x + 4) ? 1 : -1;
      gymBall.shakeT++;
      if (gymBall.shakeT >= CONFIG.deflateTime) {
        gymBall.deflated = true;
        gymBall.shakeT = 0;
        gymBall.deflateCount++;
        score += 300;
        addFloating(gymBall.x + 4, gymBall.y, '+300', C.yellow);
        addParticles(gymBall.x + 4, gymBall.y + 4, C.yellow, 18);
        alertTeachers(gymBall.x + 4, gymBall.y + 4);
        if (gymBall.deflateCount >= 3) {
          ballDeflatedWin();
        } else {
          gymBall.reinflateT = 240;
          setMsg(gymBall.deflateCount === 1 ? STRINGS.ballFirstDeflate : STRINGS.ballSecondDeflate);
        }
      }
    }
  }
  if (player.shaking) return;

  const stairResult = getStairAt(player.x, player.y);

  if (!player.onStair && stairResult) {
    const s0 = stairResult.stair, t0 = stairResult.t;
    const nearBottom = t0 < 0.15;
    const nearTop    = t0 > 0.85;
    const gr = s0.x2 > s0.x1;
    const okUp   = gr ? (K.right && !K.left) : (K.left && !K.right);
    const okDown = gr ? (K.left && !K.right) : (K.right && !K.left);
    if ((nearBottom && K.up && okUp) || (nearTop && K.down && okDown)) {
      player.onStair = true;
      player.currentStair = s0;
    }
  }

  if (player.onStair) {
    const s = player.currentStair;
    const goesRight = s.x2 > s.x1;
    player.vy = 0;
    // K.up/K.down take priority over K.left/K.right to avoid oscillation at stair entry
    var sm = 0;
    if      (K.up   && !K.down)   sm =  1;
    else if (K.down && !K.up)     sm = -1;
    else if (K.right && !K.left)  sm = goesRight ?  1 : -1;
    else if (K.left  && !K.right) sm = goesRight ? -1 :  1;
    if (sm !== 0) {
      player.x += sm * player.speed * 0.85 * (goesRight ? 1 : -1);
      player.dir = sm * (goesRight ? 1 : -1);
      player.animT += 0.25;
    }
    player.x = clampX(player.x);
    let t2 = (player.x + PW/2 - s.x1) / (s.x2 - s.x1);
    t2 = Math.max(0, Math.min(1, t2));
    player.y = s.y1 + (s.y2 - s.y1) * t2 - PH;
    player.onGround = true;
    player.onLadder = true;
    if (t2 <= 0.02 || t2 >= 0.98) {
      player.onStair = false;
      player.currentStair = null;
    }
  } else {
    player.onLadder = false;
    player.vy += 0.35;
    player.y  += player.vy;
    if (K.left)  { player.x -= player.speed; player.dir = -1; player.animT += 0.25; }
    if (K.right) { player.x += player.speed; player.dir =  1; player.animT += 0.25; }
    player.x = clampX(player.x);
    const gFy = getFloorBelow(player.x, player.y);
    if (gFy !== null && player.vy >= 0) { player.y = gFy - PH; player.vy = 0; player.onGround = true; }
    else { player.onGround = false; }
  }

  if (player.y < 2) player.y = 2;

  // Collect bags
  for (let bi = 0; bi < bags.length; bi++) {
    const bag = bags[bi];
    if (bag.collected) continue;
    if (Math.abs(player.x - bag.x) < 14 && Math.abs(player.y - bag.y) < 14) {
      bag.collected = true;
      score += 200;
      addFloating(bag.x, bag.y, '+200', C.gold);
      addParticles(bag.x, bag.y, C.gold, 10);
      GameAudio.playSfx('bag');
      if (levelMechanics.stealBags) {
        alertTeachers(bag.x, bag.y);
        let remaining = 0;
        for (let bj = 0; bj < bags.length; bj++) if (!bags[bj].collected) remaining++;
        if (remaining === 0) {
          bagWin();
        } else {
          let collected = bags.length - remaining;
          setMsg(fmt(STRINGS.bagStolen, collected, bags.length));
        }
      } else {
        setMsg(STRINGS.bagCollected);
      }
    }
  }

  // Auto-ring bell on proximity — triggers when level objective is complete.
  // player.y > MY ensures the bell can only be rung from the ground floor,
  // not from the floor above where the player passes directly overhead.
  if (levelMechanics.ringBell && (allBoards || allBags || allMachines || allBall || allStudents) && !BELL.ringing && !BELL.done) {
    const bdx = Math.abs(player.x + PW/2 - BELL.x - 2);
    const bdy = Math.abs(player.y + PH/2 - BELL.y - 3);
    if (bdx < 22 && bdy < 40 && player.y > MY) ringBell();
  }

  if (actionPressed) { actionPressed = false; tryAction(); }

  // Proximity hints — show only when the message bar is clear
  if (!player.spraying && !player.shaking && player.stunT === 0 && msgT <= 10) {
    if (levelMechanics.writeBoards && !allBoards) {
      let nd = 9999;
      for (let i = 0; i < BOARDS.length; i++) {
        if (BOARDS[i].done) continue;
        const d = Math.abs(player.x + PW/2 - BOARDS[i].x - BW/2) + Math.abs(player.y - BOARDS[i].y - BH);
        if (d < nd) nd = d;
      }
      if (nd < 36) setMsg(STRINGS.getCloser, 60);
    } else if (levelMechanics.stealBags && !allBags) {
      for (let bi = 0; bi < bags.length; bi++) {
        if (bags[bi].collected) continue;
        const dd = Math.abs(player.x - bags[bi].x) + Math.abs(player.y - bags[bi].y);
        if (dd < 40) { setMsg(STRINGS.bagHint, 60); break; }
      }
    } else if (levelMechanics.shakeMachines && !allMachines) {
      for (let mi = 0; mi < machines.length; mi++) {
        const m = machines[mi];
        if (m.broken) continue;
        const mdx = Math.abs(player.x + PW/2 - m.x - 5);
        const mdy = Math.abs(player.y + PH  - m.y - 18);
        if (mdx < 14 && mdy < 20) { setMsg(STRINGS.machineHint, 60); break; }
      }
    } else if (levelMechanics.deflateBall && gymBall && !gymBall.deflated) {
      const gdx = Math.abs(player.x + PW/2 - gymBall.x - 4);
      const gdy = Math.abs(player.y + PH  - gymBall.y - 9);
      if (gdx < 18 && gdy < 18) setMsg(STRINGS.deflateHint, 60);
    } else if (levelMechanics.throwPaper && !allStudents) {
      // Show hint only when Marco is in the classroom area (not in the corridor)
      if (player.x > 80 && player.x < 250) {
        for (let si = 0; si < students.length; si++) {
          if (students[si].disturbed) continue;
          if (Math.abs(students[si].y - (player.y + PH)) < 30) { setMsg(STRINGS.throwHint, 60); break; }
        }
      }
    }
  }
}

function updatePaperBalls() {
  if (throwCooldown > 0) throwCooldown--;
  for (let si = 0; si < students.length; si++) { if (students[si].shakeT > 0) students[si].shakeT--; }
  const SPEED = 4, MAX_DIST = 180;
  for (let i = paperBalls.length - 1; i >= 0; i--) {
    const b = paperBalls[i];
    b.x += b.dir * SPEED;
    b.dist += SPEED;
    if (b.dist > MAX_DIST || b.x < 0 || b.x > W) { paperBalls.splice(i, 1); continue; }
    let hit = false;
    // Teacher hit — ball hitting teacher knocks them down and costs Marco a life
    for (let ti = 0; ti < teachers.length; ti++) {
      const t = teachers[ti];
      if (t.knockedT > 0) continue;
      if (Math.abs(b.x - t.x - PW/2) < 10 && Math.abs(b.y - t.y - PH/2) < 14) {
        paperBalls.splice(i, 1);
        t.knockedT = 150; t.chasing = false; t.alertT = 0;
        caughtBy(t);
        hit = true; break;
      }
    }
    if (hit) continue;
    // Student hit
    for (let j = 0; j < students.length; j++) {
      const s = students[j];
      if (s.disturbed) continue;
      if (Math.abs(b.x - (s.x + 5)) < 12 && Math.abs(b.y - (s.y - 10)) < 16) {
        s.disturbed = true;
        s.shakeT = 25;
        score += 300;
        addFloating(s.x + 5, s.y - 18, '+300', C.yellow);
        addParticles(s.x + 5, s.y - 10, C.yellow, 8);
        alertTeachers(s.x + 5, s.y - 10);
        let done = 0;
        for (let k = 0; k < students.length; k++) if (students[k].disturbed) done++;
        if (done === students.length) {
          allStudentsWin();
        } else {
          setMsg(fmt(STRINGS.studentHit, done, students.length));
        }
        hit = true; break;
      }
    }
    if (hit) paperBalls.splice(i, 1);
  }
}

function tryAction() {
  if (state !== 'playing') return;

  if (levelMechanics.writeBoards) {
    let nearest = null, nd = 9999;
    for (let i = 0; i < BOARDS.length; i++) {
      const b = BOARDS[i];
      if (b.done) continue;
      const d = Math.abs(player.x + PW/2 - b.x - BW/2) + Math.abs(player.y - b.y - BH);
      if (d < nd) { nd = d; nearest = b; }
    }

    if (nearest && nd < 36) {
      player.spraying = true;
      player.sprayT = 70;
      player.dir = (player.x + PW/2 < nearest.x + BW/2) ? 1 : -1;
      GameAudio.playSfx('spray');
      const capturedBoard = nearest;
      setTimeout(function() {
        if (!capturedBoard.done) {
          capturedBoard.done = true;
          score += 500;
          addFloating(capturedBoard.x + BW/2, capturedBoard.y, '+500', C.chalk);
          addParticles(capturedBoard.x + BW/2, capturedBoard.y + BH, C.chalk, 14);
          alertTeachers(capturedBoard.x + BW/2, capturedBoard.y);
          let done = 0;
          for (let j = 0; j < BOARDS.length; j++) if (BOARDS[j].done) done++;
          if (done === BOARDS.length) {
            allBoards = true;
            setMsg(STRINGS.allBoards);
          } else {
            setMsg(fmt(STRINGS.boardTagged, done, BOARDS.length));
          }
        }
        actionPressed = false;
        player.spraying = false;
      }, 750);
    }
    // No message when action pressed far from a board — proximity hints handle it.
  } else if (levelMechanics.throwPaper && !allStudents) {
    if (throwCooldown <= 0) {
      paperBalls.push({
        x: player.dir > 0 ? player.x + PW : player.x - 3,
        y: player.y + 2,
        dir: player.dir,
        dist: 0,
      });
      throwCooldown = 40;
    }
  }
  // No fallback message — win messages and proximity hints keep the player informed.
}
