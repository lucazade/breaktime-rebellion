// Entities — teachers, janitors, bell, timer, particles, floating texts

function ringBell() {
  if (BELL.ringing || BELL.done) return;
  BELL.ringing = true;
  BELL.ringT = 120;
  var _mult = gameDifficulty === 'hard' ? 2.0 : gameDifficulty === 'medium' ? 1.5 : 1.0;
  score += 1000;
  lastTimeBonus = Math.round(Math.floor(timerTicks / 60) * 10 * _mult);
  score += lastTimeBonus;
  addFloating(Math.max(50, Math.min(W - 50, BELL.x + 10)), BELL.y - 6, '+1000!', PAL.celebrationColor);
  addParticles(BELL.x, BELL.y, PAL.celebrationColor, 30);
  msgT = 0;
  GameAudio.playSfx('bell');
  deathFreeze = true; // freeze NPCs immediately so they can't catch Marco after ringing
  pendingTransition = { t: 70, fn: function() { deathFreeze = false; BELL.done = true; state = 'win'; endScreenT = 0; _endBonusT = 0; GameAudio.stopMusic(); GameAudio.playJingle('win'); } };
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
    // Bonus: patrol only — no sight cone, no chasing, no catching Luca
    if (bonusActive) {
      t.x += t.dir * t.speed;
      if (t.x >= t.maxX) { t.x = t.maxX; t.dir = -1; }
      if (t.x <= t.minX) { t.x = t.minX; t.dir =  1; }
      continue;
    }
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
    _addHighScore(score, currentLevel, gameDifficulty);
    pendingTransition = { t: 22, fn: function() {
      msgT = 0; state = 'gameover'; endScreenT = 0; GameAudio.playJingle('gameover');
    }};
  } else {
    // Lost a life but game continues: immediate respawn, teachers keep moving
    const ps = LEVELS[currentLevel - 1].playerStart;
    player.x = ps.x; player.y = ps.y; player.vy = 0;
    player.onStair = false; player.currentStair = null;
    player.stunT = 50;
    timerTicks = maxTimerTicks;
    // Stop all teachers from chasing on respawn (player.stunT=120 prevents re-catch; direction already reversed in caughtBy)
    for (let i = 0; i < teachers.length; i++) {
      teachers[i].chasing = false; teachers[i].alertT = 0;
    }
  }
}

function caughtBy(t) {
  if (deathFreeze || player.stunT > 0 || frame === player.stunEndedT) return;
  if (CONFIG.debug.godMode) return;
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
  var _mult = gameDifficulty === 'hard' ? 2.0 : gameDifficulty === 'medium' ? 1.5 : 1.0;
  score += 5000;
  lastTimeBonus = Math.round(Math.floor(timerTicks / 60) * 10 * _mult);
  lastLivesBonus = Math.round(lives * 500 * _mult);
  score += lastTimeBonus + lastLivesBonus;
  addParticles(exitDoor.x + 5, exitDoor.y, PAL.celebrationColor, 30);
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
    addFloating(b.x - 8, b.y - 26, 'BOOM!', PAL.celebrationColor);
    // Determine if this is the last bin so we can decide which sfx call to use below
    var _binsAllDone = 0;
    for (var _bk = 0; _bk < bins.length; _bk++) if (bins[_bk].exploded) _binsAllDone++;
    var _isLastBin = (_binsAllDone >= bins.length);
    if (_isLastBin) {
      GameAudio.playSfxThen('explosion', function() { setTimeout(function() { GameAudio.playSfx('mechCompleted'); }, 250); });
    } else {
      GameAudio.playSfx('explosion');
    }

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

    // Win check first — must run even if Marco is caught in the blast
    score += 300;
    addFloating(b.x + 5, b.y - 18, '+300', PAL.scoreParticle);
    if (_isLastBin) {
      binExplodeWin();
    } else {
      setMsg(fmt(STRINGS.binExploded, _binsAllDone, bins.length));
    }

    // Blast Marco if too close (after win check — avoids skipping binExplodeWin on last bin)
    if (!deathFreeze && player.stunT === 0 && Math.abs(player.y - b.y) < 20 && Math.abs(player.x + PW/2 - b.x - 5) < 24) {
      lives--;
      score = Math.max(0, score - 300);
      if (lives > 0) setMsg(STRINGS.binBlastHit);
      else msgT = 0;
      playerDied();
      return;
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
  var _pct = timerTicks / maxTimerTicks;
  GameAudio.setMusicRate(_pct >= 0.5 ? 1.0 : 1.0 + (0.5 - _pct) * 0.6);
  if (timerTicks <= 0) {
    timerTicks = 0;
    GameAudio.setMusicRate(1.0);
    if (bonusActive) { endBonusLevel(); return; }
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

// ── Bonus level logic ─────────────────────────────────────────────────────────

function endBonusLevel() {
  deathFreeze = true;
  bonusResultActive = true;
  GameAudio.stopMusic();
}

function updateBonusPaperProjectiles() {
  for (let i = paperProjectiles.length - 1; i >= 0; i--) {
    const p = paperProjectiles[i];
    p.x += p.dir * 2;
    p.decay--;
    if (p.decay <= 0 || p.x < 0 || p.x > W) { paperProjectiles.splice(i, 1); continue; }
    let hit = false;
    // Teacher hit — knocked for 3s; triggers wanderer tripping
    for (let ti = 0; ti < teachers.length; ti++) {
      const t = teachers[ti];
      if (t.knockedT > 0) continue;
      if (Math.abs(p.x - t.x - PW/2) < 10 && Math.abs(p.y - t.y - PH/2) < 14) {
        t.knockedT = 180;
        paperProjectiles.splice(i, 1);
        hit = true;
        addParticles(t.x + PW/2, t.y, PAL.scoreParticle, 6);
        GameAudio.playSfx('hit');
        break;
      }
    }
    if (hit) continue;
    // Wanderer hit directly by projectile
    for (let wi = 0; wi < bonusWanderers.length; wi++) {
      const w = bonusWanderers[wi];
      if (w.state !== 'walking') continue;
      if (Math.abs(p.x - w.x - PW/2) < 10 && Math.abs(p.y - w.y - PH/2) < 14) {
        _tripWanderer(w);
        paperProjectiles.splice(i, 1);
        hit = true;
        break;
      }
    }
    if (hit) paperProjectiles.splice(i, 1);
  }
}

function _nearStair(wx, wy) {
  for (let si = 0; si < stairs.length; si++) {
    const s = stairs[si];
    const sx1 = Math.min(s.x1, s.x2), sx2 = Math.max(s.x1, s.x2);
    const sy1 = Math.min(s.y1, s.y2), sy2 = Math.max(s.y1, s.y2);
    if (Math.abs(wx - sx1) < 30 && Math.abs(wy + PH - sy1) < 20) return s;
    if (Math.abs(wx - sx2) < 30 && Math.abs(wy + PH - sy2) < 20) return s;
  }
  return null;
}

function _tripWanderer(w) {
  if (w.state !== 'walking') return;
  // Chain multiplier: reset timer; if chain was already active, award x2
  var mult = bonusChainMult;
  bonusChainResetT = 90;
  bonusChainMult = 2;
  var nearStair = _nearStair(w.x, w.y);
  if (nearStair) {
    // Rolling — descend to lower floor, +1 life
    w.state = 'rolling';
    w.rollT = 90;
    w.rollDir = (nearStair.y2 > nearStair.y1) ? 1 : -1; // direction of descent
    w._rollStair = nearStair;
    bonusBonusLives++;
    addFloating(Math.round(w.x), Math.round(w.y - 12), '+1 VITA!', PAL.bonusResultLives);
    GameAudio.playSfx('hit');
  } else {
    // Tripped on same floor — score + floating text
    w.state = 'tripped';
    w.knockedT = 60;
    var pts = 500 * mult;
    bonusBonusScore += pts;
    bonusCarambole++;
    w.chainHit = mult > 1;
    addFloating(Math.round(w.x), Math.round(w.y - 14), 'CARAMBOLA!', PAL.bonusBannerTitle);
    addFloating(Math.round(w.x), Math.round(w.y - 22), '+' + pts, PAL.scoreParticle);
    addParticles(Math.round(w.x + PW/2), Math.round(w.y), PAL.scoreParticle, 10);
    GameAudio.playSfx('hit');
  }
}

function updateWanderers() {
  if (!bonusActive) return;
  // Decay chain multiplier
  if (bonusChainResetT > 0) {
    bonusChainResetT--;
    if (bonusChainResetT === 0) bonusChainMult = 1;
  }
  for (let i = 0; i < bonusWanderers.length; i++) {
    const w = bonusWanderers[i];
    if (w.state === 'rolling') {
      w.rollT--;
      // Move along the stair visually
      if (w._rollStair) {
        const s = w._rollStair;
        const spd = 1.0;
        w.x += (s.x2 > s.x1 ? 1 : -1) * spd;
        const t2 = Math.max(0, Math.min(1, (w.x + PW/2 - s.x1) / (s.x2 - s.x1)));
        w.y = s.y1 + (s.y2 - s.y1) * t2 - PH;
      }
      w.animT += 0.3;
      if (w.rollT <= 0) {
        w.state = 'walking';
        w.knockedT = 0;
        w._rollStair = null;
        // Clamp to nearest floor
        const _gy = GY - PH - walkOffset, _my = MY - PH - walkOffset, _ty = TY - PH - walkOffset;
        const _dist = [Math.abs(w.y - _gy), Math.abs(w.y - _my), Math.abs(w.y - _ty)];
        const _minD = Math.min(_dist[0], _dist[1], _dist[2]);
        if (_minD === _dist[0]) w.y = _gy;
        else if (_minD === _dist[1]) w.y = _my;
        else w.y = _ty;
        w.wanderTimer = 60 + Math.round(Math.random() * 60);
      }
    } else if (w.state === 'tripped') {
      if (w.knockedT > 0) w.knockedT--;
      if (w.knockedT <= 0) {
        w.state = 'walking';
        w.wanderTimer = 60 + Math.round(Math.random() * 60);
      }
    } else {
      // walking
      w.x += w.dir * 0.5;
      w.animT += 0.1;
      w.wanderTimer--;
      if (w.wanderTimer <= 0) {
        w.dir *= -1;
        w.wanderTimer = 120 + Math.round(Math.random() * 60);
      }
      if (w.x >= w.maxX) { w.x = w.maxX; w.dir = -1; }
      if (w.x <= w.minX) { w.x = w.minX; w.dir =  1; }
    }
  }
  // Trigger wanderers near knocked teachers
  for (let ti = 0; ti < teachers.length; ti++) {
    const t = teachers[ti];
    if (t.knockedT <= 0) continue;
    for (let wi = 0; wi < bonusWanderers.length; wi++) {
      const w = bonusWanderers[wi];
      if (w.state !== 'walking') continue;
      if (Math.abs(w.y - t.y) < 20 && Math.abs(w.x - t.x) < 8) {
        _tripWanderer(w);
      }
    }
  }
}
