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

function clampX(x) { return Math.max(wallLeft, Math.min(W - PW - wallRight, x)); }

function updatePlayer() {
  if (state !== 'playing') return;
  if (player.stunT > 0) {
    if (--player.stunT === 0) {
      // Extend stun if any NPC is still dangerously close to Marco's position
      const _dangerR = 30;
      let _danger = false;
      for (let _i = 0; _i < teachers.length && !_danger; _i++) {
        if (Math.abs(teachers[_i].y - player.y) < 16 && Math.abs(teachers[_i].x - player.x) < _dangerR) _danger = true;
      }
      for (let _i = 0; _i < janitors.length && !_danger; _i++) {
        if (Math.abs(janitors[_i].y - player.y) < 16 && Math.abs(janitors[_i].x - player.x) < _dangerR) _danger = true;
      }
      if (_danger) { player.stunT = 10; } else { player.stunEndedT = frame; }
    }
    return;
  }
  if (player.spraying) {
    player.sprayT--;
    if (player.boardCommitT > 0) {
      player.boardCommitT--;
      if (player.boardCommitT === 0 && player.boardCommitTarget && !deathFreeze) {
        const capturedBoard = player.boardCommitTarget;
        player.boardCommitTarget = null;
        if (!capturedBoard.done) {
          capturedBoard.done = true;
          score += 500;
          addFloating(capturedBoard.x + BW/2, capturedBoard.y, '+500', PAL.chalkParticle);
          addParticles(capturedBoard.x + BW/2, capturedBoard.y + BH, PAL.chalkParticle, 14);
          alertTeachers(capturedBoard.x + BW/2, capturedBoard.y);
          let done = 0;
          for (let j = 0; j < BOARDS.length; j++) if (BOARDS[j].done) done++;
          if (done === BOARDS.length) {
            allBoards = true;
            setMsg(STRINGS.allBoards);
            setTimeout(function() { GameAudio.playSfx('mechCompleted'); }, 250);
          } else {
            setMsg(fmt(STRINGS.boardTagged, done, BOARDS.length));
          }
        }
        actionPressed = false;
        player.spraying = false;
      }
    }
    if (player.sprayT <= 0) player.spraying = false;
    return;
  }

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
        if (m.shakeT >= shakeTime) {
          m.broken = true;
          score += 500;
          addFloating(m.x + 5, m.y, '+500', PAL.scoreParticle);
          addParticles(m.x + 5, m.y + 9, PAL.scoreParticle, 18);
          alertTeachers(m.x + 5, m.y + 9);
          let broken = 0;
          for (let j = 0; j < machines.length; j++) if (machines[j].broken) broken++;
          if (broken === machines.length) {
            GameAudio.playSfxThen('machine', function() { setTimeout(function() { GameAudio.playSfx('mechCompleted'); }, 250); });
            machineWin();
          } else {
            GameAudio.playSfx('machine');
            setMsg(fmt(STRINGS.machineBroken, broken, machines.length));
          }
        }
        break;
      }
    }
  }
  if (levelMechanics.deflateBall && gymBall && !gymBall.deflated) {
    const dx = Math.abs(player.x + PW/2 - gymBall.x - 4);
    const dy = Math.abs(player.y + PH  - gymBall.y - 9);
    if (!player.shaking && !player.onStair && K.action && dx < 14 && dy < 14) {
      player.shaking = true;
      actionPressed = false;
      player.dir = (player.x + PW/2 < gymBall.x + 4) ? 1 : -1;
      gymBall.shakeT++;
      if (gymBall.shakeT >= deflateTime) {
        gymBall.deflated = true;
        gymBall.shakeT = 0;
        gymBall.deflateCount++;
        score += 300;
        addFloating(gymBall.x + 4, gymBall.y, '+300', PAL.scoreParticle);
        alertTeachers(gymBall.x + 4, gymBall.y + 4);
        if (gymBall.deflateCount >= 3) {
          GameAudio.playSfxThen('deflate', function() { setTimeout(function() { GameAudio.playSfx('mechCompleted'); }, 250); });
          ballDeflatedWin();
        } else {
          GameAudio.playSfx('deflate');
          gymBall.reinflateT = 240;
          setMsg(fmt(STRINGS.ballProgress, gymBall.deflateCount, 3));
        }
      }
    } else {
      gymBall.shakeT = 0;
    }
  }
  if (!player.shaking && levelMechanics.dropBook && bookcase && !bookcase.dropped && !allBooks && !player.onStair) {
    const dx = Math.abs(player.x + PW/2 - bookcase.x - 12);
    const dy = Math.abs(player.y + PH  - bookcase.y - 26);
    if (K.action && dx < 20 && dy < 36) {
      player.shaking = true;
      actionPressed = false;
      player.dir = (player.x + PW/2 < bookcase.x + 12) ? 1 : -1;
      bookcase.shakeT++;
      if (bookcase.shakeT >= dropTime) {
        bookcase.dropped = true;
        bookcase.shakeT = 0;
        bookcase.dropCount++;
        score += 300;
        addFloating(bookcase.x + 3, bookcase.y, '+300', PAL.scoreParticle);
        addParticles(bookcase.x + 3, bookcase.y + 6, PAL.scoreParticle, 12);
        alertTeachers(bookcase.x + 3, bookcase.y + 6);
        if (bookcase.dropCount >= 3) {
          GameAudio.playSfxThen('book', function() { setTimeout(function() { GameAudio.playSfx('mechCompleted'); }, 250); });
          bookDropWin();
        } else {
          GameAudio.playSfx('book');
          setMsg(fmt(STRINGS.bookProgress, bookcase.dropCount, 3));
        }
      }
    } else {
      bookcase.shakeT = 0;
    }
  }
  if (!player.shaking && levelMechanics.stealRegister && register && !register.stolen && !player.onStair) {
    const dx = Math.abs(player.x + PW/2 - register.x - 5);
    const dy = Math.abs(player.y + PH  - register.y - 8);
    if (K.action && dx < 16 && dy < 20) {
      player.shaking = true;
      actionPressed = false;
      player.dir = (player.x + PW/2 < register.x + 5) ? 1 : -1;
      register.stealT++;
      if (register.stealT >= registerTime) {
        register.stolen = true;
        register.stealT = 0;
        score += 500;
        addFloating(register.x, register.y - 10, '+500', PAL.celebrationColor);
        GameAudio.playSfxThen('register', function() { setTimeout(function() { GameAudio.playSfx('mechCompleted'); }, 250); });
        alertTeachers(register.x + 5, register.y);
        allRegisterWin();
      }
    } else {
      register.stealT = 0;
    }
  }
  if (!player.shaking && levelMechanics.activateSprinkler && K.action && !player.onStair) {
    for (let si = 0; si < sprinklers.length; si++) {
      const sp = sprinklers[si];
      if (sp.active) continue;
      if (sp.floor) {
        const pFloor = player.y > (MY+GY)/2 ? 'GY' : player.y > (TY+MY)/2 ? 'MY' : 'TY';
        if (sp.floor !== pFloor) continue;
      }
      const dx = Math.abs(player.x + PW/2 - sp.x - 4);
      const dy = Math.abs(player.y - sp.y);
      if (dx < 16 && dy < 50) {
        player.shaking = true;
        actionPressed = false;
        player.dir = (player.x + PW/2 < sp.x + 4) ? 1 : -1;
        sp.lighterT++;
        if (sp.lighterT >= lighterTime) {
          sp.lighterT = 0;
          sp.active = true;
          score += 300;
          addFloating(sp.x, sp.y - 8, '+300', PAL.scoreParticle);
          addParticles(sp.x + 4, sp.y, PAL.scoreParticle, 15);
          for (let ti = 0; ti < teachers.length; ti++) {
            const t = teachers[ti];
            const tFloor = t.y > (MY+GY)/2 ? 'GY' : t.y > (TY+MY)/2 ? 'MY' : 'TY';
            if (sp.floor && sp.floor !== tFloor) continue;
            t.alertT = 200; t.chasing = true; t.chaseX = player.x; t.reactionT = 15;
          }
          let done = 0;
          for (let k = 0; k < sprinklers.length; k++) if (sprinklers[k].active) done++;
          if (done >= sprinklers.length) {
            GameAudio.playSfxThen('sprinkler', function() { setTimeout(function() { GameAudio.playSfx('mechCompleted'); }, 250); });
            allSprinklersWin();
          } else {
            GameAudio.playSfx('sprinkler');
            setMsg(fmt(STRINGS.sprinklerLit, done, sprinklers.length));
          }
        }
        break;
      }
    }
  }
  if (!player.shaking && levelMechanics.floodSink && sink && sink.pourCount < 3 && sink.waterLevel === 0 && K.action && !player.onStair) {
    const dx = Math.abs(player.x + PW/2 - sink.x - 6);
    const dy = Math.abs(player.y + PH  - sink.y - 10);
    if (dx < 14 && dy < 20) {
      player.shaking = true;
      actionPressed = false;
      player.dir = (player.x + PW/2 < sink.x + 6) ? 1 : -1;
      sink.pourT++;
      if (sink.pourT >= floodTime) {
        sink.pourT = 0;
        sink.pourCount++;
        sink.waterLevel = 3;
        sink.floodSpread = 0;
        score += 300;
        addFloating(sink.x + 6, sink.y - 8, '+300', PAL.scoreParticle);
        addParticles(sink.x + 6, sink.y, PAL.scoreParticle, 12);
        alertTeachers(107, sink.y);
        if (sink.pourCount >= 3) {
          GameAudio.playSfxThen('sink', function() { setTimeout(function() { GameAudio.playSfx('mechCompleted'); }, 250); });
          sinkFloodWin();
        } else {
          GameAudio.playSfx('sink');
          setMsg(fmt(STRINGS.sinkProgress, sink.pourCount, 3));
        }
      }
    }
  }
  // Bonus throw: hold to charge (range ∝ charge), release or max → fire.
  // Bar appears after 24 frames (tap stays invisible, hold shows bar).
  if (bonusActive && player.throwCharging) {
    if (K.action && player.throwChargeT < throwChargeTime) {
      player.throwChargeT++;
      actionPressed = false;
    }
    if (!K.action || player.throwChargeT >= throwChargeTime) {
      var _isTap = player.throwChargeT < throwBarThreshold;  // below bar-visible threshold → tap
      var _decay, _spd, _vy, _g;
      if (_isTap) {
        _decay = 20;   _spd = 2.0;  _vy = 0;     _g = 0;        // tap: lancio orizzontale (~40px)
      } else {
        var _bp = (player.throwChargeT - throwBarThreshold) / (throwChargeTime - throwBarThreshold); // 0→1 as bar fills
        _decay = Math.round(30 + 23 * _bp);   // hold min≈30(~75px), full=53(~185px)
        _spd   = 2.5 + 1.0 * _bp;            // hold min=2.5px/f, full=3.5px/f
        _vy    = 0.05 - 0.45 * _bp;          // hold min=+0.05, full=-0.4
        _g     = 0.025 - 0.01 * _bp;         // hold min=0.025, full=0.015
      }
      player.throwCharging = false;
      player.throwChargeT = 0;
      paperProjectiles.push({
        x: player.dir > 0 ? player.x + PW + 1 : player.x - 4,
        y: player.y - 4,
        dir: player.dir,
        decay: _decay,
        spd: _spd,
        vy: _vy,
        g:  _g,
      });
    }
  }

  if (player.shaking) return;

  const stairResult = getStairAt(player.x, player.y);

  if (!player.onStair && stairResult) {
    const s0 = stairResult.stair, t0 = stairResult.t;
    const nearBottom = t0 < 0.15;
    const nearTop    = t0 > 0.85;
    if ((nearBottom && K.up) || (nearTop && K.down)) {
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
    if (t2 <= 0.02 || t2 >= 0.98) {
      player.onStair = false;
      player.currentStair = null;
    }
  } else {
    player.vy += 0.35;
    player.y  += player.vy;
    if (K.left)  { player.x -= player.speed; player.dir = -1; player.animT += 0.25; }
    if (K.right) { player.x += player.speed; player.dir =  1; player.animT += 0.25; }
    player.x = clampX(player.x);
    const gFy = getFloorBelow(player.x, player.y);
    if (gFy !== null && player.vy >= 0) { player.y = gFy - PH; player.vy = 0; }
  }

  if (player.y < 2) player.y = 2;

  // Steal bags — instant touch
  for (let bi = 0; bi < bags.length; bi++) {
    const bag = bags[bi];
    if (bag.collected) continue;
    const bdx = Math.abs(player.x + PW/2 - bag.x - 7);
    const bdy = Math.abs(player.y + PH  - bag.y - 10);
    if (bdx < 14 && bdy < 14) {
      bag.collected = true;
      score += 200;
      addFloating(bag.x, bag.y, '+200', PAL.celebrationColor);
      addParticles(bag.x, bag.y, PAL.celebrationColor, 10);
      alertTeachers(bag.x, bag.y);
      let remaining = 0;
      for (let bj = 0; bj < bags.length; bj++) if (!bags[bj].collected) remaining++;
      if (remaining === 0) {
        GameAudio.playSfxThen('bag', function() { setTimeout(function() { GameAudio.playSfx('mechCompleted'); }, 250); });
        bagWin();
      } else {
        GameAudio.playSfx('bag');
        setMsg(fmt(STRINGS.bagStolen, bags.length - remaining, bags.length));
      }
      break;
    }
  }

  // Auto-ring bell on proximity — triggers when level objective is complete.
  // player.y > MY ensures the bell can only be rung from the ground floor,
  // not from the floor above where the player passes directly overhead.
  // Escape exit (L10): reach exit door with register → escapeWin
  if (levelMechanics.escapeExit && register && register.stolen && exitDoor && !exitDone) {
    const ddx = Math.abs(player.x + PW/2 - exitDoor.x - 6);
    const ddy = Math.abs(player.y + PH  - exitDoor.y - 10);
    if (ddx < 24 && ddy < 32 && player.y > MY) escapeWin();
  }
  if (levelMechanics.ringBell && (allBoards || allBags || allMachines || allBall || allStudents || allBooks || allSink || allBins || allSprinklers || allRegister) && !BELL.ringing && !BELL.done) {
    const bdx = Math.abs(player.x + PW/2 - BELL.x - 2);
    const bdy = Math.abs(player.y + PH/2 - BELL.y - 3);
    if (bdx < 8 && bdy < 40 && player.y > MY) ringBell();
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
    } else if (levelMechanics.dropBook && bookcase && !bookcase.dropped) {
      const bdx = Math.abs(player.x + PW/2 - bookcase.x - 12);
      const bdy = Math.abs(player.y + PH  - bookcase.y - 26);
      if (bdx < 20 && bdy < 36) setMsg(STRINGS.bookDropHint, 60);
    } else if (levelMechanics.floodSink && sink && sink.pourCount < 3 && sink.resetT <= 0) {
      const sdx = Math.abs(player.x + PW/2 - sink.x - 6);
      const sdy = Math.abs(player.y + PH  - sink.y - 10);
      if (sdx < 14 && sdy < 20) setMsg(STRINGS.sinkHint, 60);
    } else if (levelMechanics.stealRegister && register && !register.stolen) {
      const rdx = Math.abs(player.x + PW/2 - register.x - 5);
      const rdy = Math.abs(player.y + PH  - register.y - 8);
      if (rdx < 16 && rdy < 20) setMsg(STRINGS.registerHint, 60);
    } else if (levelMechanics.stealRegister && register && register.stolen && exitDoor) {
      const edx = Math.abs(player.x + PW/2 - exitDoor.x - 6);
      const edy = Math.abs(player.y + PH  - exitDoor.y - 10);
      if (edx < 22 && edy < 30) setMsg(STRINGS.exitHint, 60);
    } else if (levelMechanics.activateSprinkler && !allSprinklers) {
      const _pFloor = player.y > (MY+GY)/2 ? 'GY' : player.y > (TY+MY)/2 ? 'MY' : 'TY';
      for (let si = 0; si < sprinklers.length; si++) {
        const sp = sprinklers[si];
        if (sp.active || (sp.floor && sp.floor !== _pFloor)) continue;
        const sdx = Math.abs(player.x + PW/2 - sp.x - 4);
        const sdy = Math.abs(player.y - sp.y);
        if (sdx < 16 && sdy < 50) { setMsg(STRINGS.sprinklerHint, 60); break; }
      }
    } else if (levelMechanics.plantBomb && !allBins) {
      for (let bi = 0; bi < bins.length; bi++) {
        const b = bins[bi];
        if (b.lit || b.exploded) continue;
        const bdx = Math.abs(player.x + PW/2 - b.x - 5);
        const bdy = Math.abs(player.y + PH  - b.y - 7);
        if (bdx < 16 && bdy < 20) { setMsg(STRINGS.binHint, 60); break; }
      }
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
        addFloating(s.x + 5, s.y - 18, '+300', PAL.scoreParticle);
        addParticles(s.x + 5, s.y - 10, PAL.scoreParticle, 8);
        alertTeachers(s.x + 5, s.y - 10);
        let done = 0;
        for (let k = 0; k < students.length; k++) if (students[k].disturbed) done++;
        if (done === students.length) {
          GameAudio.playSfxThen('hit', function() { setTimeout(function() { GameAudio.playSfx('mechCompleted'); }, 250); });
          allStudentsWin();
        } else {
          GameAudio.playSfx('hit');
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
      player.boardCommitT = 45;
      player.boardCommitTarget = nearest;
      player.dir = (player.x + PW/2 < nearest.x + BW/2) ? 1 : -1;
      alertTeachers(player.x + PW/2, player.y);
      GameAudio.playSfx('spray');
    }
    // No message when action pressed far from a board — proximity hints handle it.
  } else if (levelMechanics.isBonusLevel) {
    // Start charge on press — fire on release (short) or at max charge (long)
    if (paperProjectiles.length === 0 && !player.throwCharging) {
      player.throwCharging = true;
      player.throwChargeT = 1;
    }
  } else if (levelMechanics.throwPaper && !allStudents) {
    if (throwCooldown <= 0) {
      paperBalls.push({
        x: player.dir > 0 ? player.x + PW : player.x - 3,
        y: player.y - 3,
        dir: player.dir,
        dist: 0,
      });
      throwCooldown = 40;
    }
  } else if (levelMechanics.plantBomb && !allBins) {
    for (let bi = 0; bi < bins.length; bi++) {
      const b = bins[bi];
      if (b.lit || b.exploded) continue;
      const dx = Math.abs(player.x + PW/2 - b.x - 5);
      const dy = Math.abs(player.y + PH  - b.y - 7);
      if (dx < 16 && dy < 20) {
        b.lit = true;
        b.fuseT = 180;
        player.dir = (player.x + PW/2 < b.x + 5) ? 1 : -1;
        setMsg(STRINGS.binLit);
        GameAudio.playSfx('fuse');
        alertTeachers(b.x + 5, b.y);
        break;
      }
    }
  }
  // No fallback message — win messages and proximity hints keep the player informed.
}
