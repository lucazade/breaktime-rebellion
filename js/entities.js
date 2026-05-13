// Entities — teachers, janitors, bell, timer, particles, floating texts

function ringBell() {
  if (BELL.ringing || BELL.done) return;
  BELL.ringing = true;
  BELL.ringT = 120;
  score += 1000;
  addFloating(BELL.x - 20, BELL.y - 6, '+1000!', C.gold);
  addParticles(BELL.x, BELL.y, C.gold, 30);
  setMsg(STRINGS.ringMsg);
  GameAudio.playSfx('bell');
  pendingTransition = { t: 120, fn: function() { BELL.done = true; state = 'win'; GameAudio.stopMusic(); GameAudio.playJingle('win'); } };
}

function alertTeachers(bx, by) {
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    if (Math.abs(t.y - player.y) < 20 && Math.abs(t.x - bx) < t.sight) {
      t.alertT = 120; t.chasing = true; t.chaseX = player.x;
    }
  }
}

function updateTeachers() {
  if (state !== 'playing') return;
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    t.animT += 0.12;
    if (t.chasing) {
      t.alertT = Math.max(0, t.alertT - 1);
      const dx = t.chaseX - t.x;
      t.dir = dx > 0 ? 1 : -1;
      t.x += t.dir * t.speed * 1.8;
      t.animT += 0.1;
      if (Math.abs(t.y - player.y) < 12 && Math.abs(t.x - player.x) < 16 && player.stunT === 0) {
        caughtBy(t); t.chasing = false; t.alertT = 0;
      }
      if (t.alertT <= 0) t.chasing = false;
    } else {
      t.x += t.dir * t.speed;
      if (t.x >= t.maxX) { t.x = t.maxX; t.dir = -1; }
      if (t.x <= t.minX) { t.x = t.minX; t.dir =  1; }
    }
  }
}

function playerDied() {
  player.spraying = false; player.shaking = false; player.vy = 0;
  addParticles(player.x + PW/2, player.y, C.red, 20);
  GameAudio.playSfx('caught');
  deathFreeze = true;
  if (lives <= 0) {
    pendingTransition = { t: 108, fn: function() {
      state = 'gameover'; GameAudio.stopMusic(); GameAudio.playJingle('gameover');
    }};
  } else {
    pendingTransition = { t: 80, fn: function() {
      const ps = LEVELS[currentLevel - 1].playerStart;
      player.x = ps.x; player.y = ps.y; player.vy = 0;
      player.onStair = false; player.currentStair = null;
      player.stunT = 120;
      timerTicks = maxTimerTicks;
      deathFreeze = false;
    }};
  }
}

function caughtBy(t) {
  if (deathFreeze || player.stunT > 0) return;
  lives--;
  score = Math.max(0, score - 300);
  let msg = fmt(STRINGS.caughtBy, t.name);
  msg += lives > 0 ? '♥'.repeat(lives) : 'GAME OVER!';
  setMsg(msg);
  playerDied();
}

function updateJanitors() {
  if (state !== 'playing') return;
  for (let i = 0; i < janitors.length; i++) {
    const j = janitors[i];
    j.animT += 0.15;
    j.x += j.dir * j.speed;
    if (j.x >= j.maxX) { j.x = j.maxX; j.dir = -1; }
    if (j.x <= j.minX) { j.x = j.minX; j.dir =  1; }
    if (Math.abs(j.y - player.y) < 12 && Math.abs(j.x - player.x) < 14 && player.stunT === 0) {
      caughtBy(j);
    }
  }
}

function machineWin() {
  if (allMachines) return;
  allMachines = true;
  setMsg(STRINGS.allMachines);
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
    let msg = STRINGS.timesUp;
    msg += lives > 0 ? '♥'.repeat(lives) : 'GAME OVER!';
    setMsg(msg);
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
