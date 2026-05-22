// Entities — teachers, janitors, bell, timer, particles, floating texts

function ringBell() {
  if (BELL.ringing || BELL.done) return;
  BELL.ringing = true;
  BELL.ringT = 120;
  score += 1000;
  lastTimeBonus = Math.floor(timerTicks / 60) * 10;
  score += lastTimeBonus;
  addFloating(Math.max(50, Math.min(W - 50, BELL.x + 10)), BELL.y - 6, '+1000!', PAL.gold);
  addParticles(BELL.x, BELL.y, PAL.gold, 30);
  msgT = 0;
  GameAudio.playSfx('bell');
  deathFreeze = true; // freeze NPCs immediately so they can't catch Marco after ringing
  pendingTransition = { t: 70, fn: function() { deathFreeze = false; BELL.done = true; state = 'win'; endScreenT = 0; GameAudio.stopMusic(); GameAudio.playJingle('win'); } };
}

function alertTeachers(bx, by) {
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    if (Math.abs(t.y - player.y) < 20 && Math.abs(t.x - bx) < t.sight) {
      t.alertT = 120; t.chasing = true; t.chaseX = player.x; t.reactionT = 15;
    }
  }
}

function updateTeachers() {
  if (state !== 'playing') return;
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    if (t.knockedT > 0) { t.knockedT--; continue; } // lying on the floor, skip movement
    t.animT += 0.12;
    if (t.chasing) {
      t.alertT = Math.max(0, t.alertT - 1);
      if (t.reactionT > 0) {
        t.reactionT--;  // brief freeze before chasing — eliminates the visual lurch on alert
      } else {
        const dx = t.chaseX - t.x;
        t.dir = dx > 0 ? 1 : -1;
        t.x += t.dir * t.speed * 1.8;
        t.animT += 0.1;
      }
      const catchX = t.catchRadius || 16;
      const catchY = t.catchRadius ? Math.round(t.catchRadius * 0.7) : 12;
      if (Math.abs(t.y - player.y) < catchY && Math.abs(t.x - player.x) < catchX && player.stunT === 0 && frame !== player.stunEndedT) {
        caughtBy(t); t.chasing = false; t.alertT = 0;
      }
      if (t.alertT <= 0) t.chasing = false;
    } else {
      t.x += t.dir * t.speed;
      if (t.x >= t.maxX) { t.x = t.maxX; t.dir = -1; }
      if (t.x <= t.minX) { t.x = t.minX; t.dir =  1; }
      // Guards catch Marco on patrol too (no sight cone needed)
      if (t.catchRadius) {
        const cx = t.catchRadius, cy = Math.round(t.catchRadius * 0.7);
        if (Math.abs(t.y - player.y) < cy && Math.abs(t.x - player.x) < cx && player.stunT === 0 && frame !== player.stunEndedT) {
          caughtBy(t);
        }
      }
    }
    // L4: Prof.Ginnastica walks over the deflated ball → reinflates it
    if (t.name === 'Prof.Ginnastica' && gymBall && gymBall.deflated && !allBall) {
      if (Math.abs(t.x + PW/2 - gymBall.x - 4) < 12) {
        gymBall.deflated = false; gymBall.shakeT = 0; gymBall.reinflateT = 0;
        setMsg(STRINGS.ballReinflated);
      }
    }
    // L6: Preside walks over the dropped book → puts it back on the shelf
    if (t.name === 'Preside' && bookcase && bookcase.dropped && !allBooks) {
      if (Math.abs(t.x + PW/2 - (bookcase.x + bookcase.fallDx + 9)) < 14) {
        bookcase.dropped = false; bookcase.shakeT = 0; bookcase.resetT = 0;
        setMsg(STRINGS.bookReset);
      }
    }
  }
}

function playerDied() {
  player.spraying = false; player.shaking = false; player.vy = 0;
  addParticles(player.x + PW/2, player.y, PAL.deathParticle, 20);
  GameAudio.playSfx('caught');
  if (lives <= 0) {
    // Game over: freeze everything, fade out music, then show banner + gameover jingle
    deathFreeze = true;
    GameAudio.fadeOutMusic(900);
    // Save high scores
    var bs = parseInt(localStorage.getItem('btr_best_score') || '0');
    var bl = parseInt(localStorage.getItem('btr_best_level') || '0');
    if (score > bs) localStorage.setItem('btr_best_score', score);
    if (currentLevel > bl) localStorage.setItem('btr_best_level', currentLevel);
    pendingTransition = { t: 22, fn: function() {
      msgT = 0; state = 'gameover'; endScreenT = 0; GameAudio.playJingle('gameover');
    }};
  } else {
    // Lost a life but game continues: immediate respawn, teachers keep moving
    const ps = LEVELS[currentLevel - 1].playerStart;
    player.x = ps.x; player.y = ps.y; player.vy = 0;
    player.onStair = false; player.currentStair = null;
    player.stunT = 120;
    timerTicks = maxTimerTicks;
    // Stop all teachers from chasing on respawn (player.stunT=120 prevents re-catch; direction already reversed in caughtBy)
    for (let i = 0; i < teachers.length; i++) {
      teachers[i].chasing = false; teachers[i].alertT = 0;
    }
    // #113: push any NPC within 50px of respawn zone away so Marco can't die immediately after stun ends
    var _safeR = 50;
    for (let i = 0; i < teachers.length; i++) {
      var _t = teachers[i];
      if (Math.abs(_t.y - ps.y) < 16 && Math.abs(_t.x - ps.x) < _safeR) {
        _t.x = ps.x < (_t.minX + _t.maxX) / 2 ? Math.min(_t.maxX, ps.x + _safeR) : Math.max(_t.minX, ps.x - _safeR);
        _t.dir = _t.x > ps.x ? 1 : -1;
      }
    }
    for (let i = 0; i < janitors.length; i++) {
      var _j = janitors[i];
      if (Math.abs(_j.y - ps.y) < 16 && Math.abs(_j.x - ps.x) < _safeR) {
        _j.x = ps.x < (_j.minX + _j.maxX) / 2 ? Math.min(_j.maxX, ps.x + _safeR) : Math.max(_j.minX, ps.x - _safeR);
        _j.dir = _j.x > ps.x ? 1 : -1;
      }
    }
  }
}

function caughtBy(t) {
  if (deathFreeze || player.stunT > 0 || frame === player.stunEndedT) return;
  if (CONFIG.debug.godMode) return;
  t.dir = -t.dir; // bounce away after catch so they don't follow Marco to respawn
  t.chasing = false; t.alertT = 0;
  lives--;
  score = Math.max(0, score - 300);
  if (lives > 0) setMsg(fmt(STRINGS.caughtBy, t.name), 70);
  else msgT = 0;
  playerDied();
}

function updateJanitors() {
  if (state !== 'playing') return;
  for (let i = 0; i < janitors.length; i++) {
    const j = janitors[i];
    if (j.knockedT > 0) {
      j.knockedT--;
      if (j.knockedT === 0) j.soakCooldownT = 90; // immunity after recovery
      continue;
    }
    if (j.soakCooldownT > 0) j.soakCooldownT--; // decrement immunity (janitor moves freely)
    j.animT += 0.15;
    j.x += j.dir * j.speed;
    if (j.x >= j.maxX) { j.x = j.maxX; j.dir = -1; }
    if (j.x <= j.minX) { j.x = j.minX; j.dir =  1; }
    if (Math.abs(j.y - player.y) < 12 && Math.abs(j.x - player.x) < 14 && player.stunT === 0) {
      caughtBy(j);
    }
    // L7: janitor dries water only when in front of the sink (not anywhere on floor)
    if (levelMechanics.floodSink && sink && sink.waterLevel > 0 && !allSink && j.y < (MY + GY) / 2 && Math.abs(j.x - (sink.x + 6)) < 30) {
      j.dryT++;
      if (j.dryT >= 25) { j.dryT = 0; sink.waterLevel = 0; sink.pourT = 0; sink.floodSpread = 0; setMsg(STRINGS.sinkReady); }
    } else {
      j.dryT = 0;
    }
  }
}

function allRegisterWin() {
  if (allRegister) return;
  allRegister = true;
  setMsg(STRINGS.registerStolen);
}

function escapeWin() {
  if (exitDone) return;
  exitDone = true;
  score += 5000;
  lastTimeBonus = Math.floor(timerTicks / 60) * 10;
  lastLivesBonus = lives * 500;
  score += lastTimeBonus + lastLivesBonus;
  addParticles(exitDoor.x + 5, exitDoor.y, PAL.gold, 30);
  GameAudio.playSfx('door');
  deathFreeze = true;
  exitWinReady = false;
  pendingTransition = { t: 90, fn: function() { exitWinReady = true; pendingTransition = null; } };
}

function allSprinklersWin() {
  if (allSprinklers) return;
  allSprinklers = true;
  setMsg(STRINGS.allSprinklersLit);
}

function updateSprinklers() {
  for (let i = 0; i < sprinklers.length; i++) {
    const sp = sprinklers[i];
    if (!sp.active) continue;
    // Soak janitors standing under active water column
    for (let j = 0; j < janitors.length; j++) {
      const jan = janitors[j];
      if (jan.knockedT > 0) continue;
      const janFloor = jan.y > (MY+GY)/2 ? 'GY' : jan.y > (TY+MY)/2 ? 'MY' : 'TY';
      if (jan.knockedT > 0 || jan.soakCooldownT > 0) continue;
      if (sp.floor === janFloor && Math.abs(jan.x + PW/2 - sp.x - 4) < 10) {
        jan.knockedT = 120;
        addParticles(jan.x + 4, jan.y, PAL.cyan, 10);
      }
    }
  }
}

function machineWin() {
  if (allMachines) return;
  allMachines = true;
  setMsg(STRINGS.allMachines);
}

function updateGymBall() {
  if (!gymBall || !gymBall.deflated || gymBall.reinflateT <= 0) return;
  gymBall.reinflateT--;
  if (gymBall.reinflateT === 0) {
    gymBall.deflated = false;
    gymBall.shakeT = 0;
    setMsg(STRINGS.ballReinflated);
  }
}

function ballDeflatedWin() {
  if (allBall) return;
  allBall = true;
  setMsg(STRINGS.ballDeflated);
}

function allStudentsWin() {
  if (allStudents) return;
  allStudents = true;
  setMsg(STRINGS.allStudentsDisturbed);
}

function updateBookcase() {
  if (!bookcase || !bookcase.dropped || bookcase.resetT <= 0) return;
  bookcase.resetT--;
  if (bookcase.resetT === 0) {
    bookcase.dropped = false;
    bookcase.shakeT = 0;
    setMsg(STRINGS.bookReset);
  }
}

function bookDropWin() {
  if (allBooks) return;
  allBooks = true;
  setMsg(STRINGS.bookDropped);
}

function binExplodeWin() {
  if (allBins) return;
  allBins = true;
  setMsg(STRINGS.allBinsExploded);
}

function updateBins() {
  for (let i = 0; i < bins.length; i++) {
    const b = bins[i];
    if (!b.lit || b.fuseT <= 0) continue;
    b.fuseT--;
    if (b.fuseT > 0) continue;

    b.lit = false;
    b.exploded = true;
    addParticles(b.x + 5, b.y - 7, '#FF6600', 18);
    addParticles(b.x + 5, b.y - 7, PAL.scoreParticle, 12);
    addParticles(b.x + 5, b.y - 7, PAL.explosionParticle,    8);
    addFloating(b.x - 8, b.y - 26, 'BOOM!', PAL.gold);
    GameAudio.playSfx('explosion');

    // Teachers on same floor: knocked if close, alerted if far
    for (let j = 0; j < teachers.length; j++) {
      const t = teachers[j];
      if (Math.abs(t.y - b.y) > 20) continue;
      if (Math.abs(t.x - b.x - 5) < 30) {
        t.knockedT = 90; t.chasing = false; t.alertT = 0; // knocked out
      } else {
        t.alertT = 200; t.chasing = true; t.chaseX = b.x + 5; t.reactionT = 15; // rushes toward the bin
      }
    }

    // Blast Marco if too close
    if (!deathFreeze && player.stunT === 0 && Math.abs(player.y - b.y) < 20 && Math.abs(player.x + PW/2 - b.x - 5) < 24) {
      lives--;
      score = Math.max(0, score - 300);
      if (lives > 0) setMsg(STRINGS.binBlastHit);
      else msgT = 0;
      playerDied();
      return; // skip win check this frame
    }

    let done = 0;
    for (let k = 0; k < bins.length; k++) if (bins[k].exploded) done++;
    score += 300;
    addFloating(b.x + 5, b.y - 18, '+300', PAL.scoreParticle);
    if (done >= bins.length) {
      binExplodeWin();
    } else {
      setMsg(fmt(STRINGS.binExploded, done, bins.length));
    }
  }
}

function sinkFloodWin() {
  if (allSink) return;
  allSink = true;
  setMsg(STRINGS.sinkFlooded);
}

function updateSink() {
  if (!sink) return;
  if (sink.waterLevel > 0 || allSink) {
    if (sink.floodSpread < W - 10) sink.floodSpread = Math.min(W - 10, sink.floodSpread + 0.35);
  }
}

function bagWin() {
  if (allBags) return;
  allBags = true;
  setMsg(STRINGS.allBagsStolen);
}

function updateBell() {
  if (!levelMechanics.ringBell) return;
  if (BELL.ringing && BELL.ringT > 0) { BELL.ringT--; if (BELL.ringT === 0) BELL.ringing = false; }
}

function updateTimer() {
  if (maxTimerTicks === 0 || BELL.done) return;
  if (missionBannerT > 0) return;
  if (player.stunT > 0) return;
  timerTicks--;
  if (timerTicks <= 0) {
    timerTicks = 0;
    lives--;
    if (lives > 0) setMsg(STRINGS.timesUp);
    else msgT = 0;
    playerDied();
  }
}

function addParticles(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    particles.push({x:x, y:y,
      vx:(Math.random()-.5)*2.5, vy:(Math.random()-.5)*2-1,
      color:color, life:45, max:45});
  }
}

function addFloating(x, y, text, color) {
  floatingTexts.push({x:x, y:y, text:text, color:color, life:80, max:80});
}

function tickTransition() {
  if (!pendingTransition) return;
  if (--pendingTransition.t <= 0) { pendingTransition.fn(); pendingTransition = null; }
}
