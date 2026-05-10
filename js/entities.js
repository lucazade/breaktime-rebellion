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
  setTimeout(function() { BELL.done = true; state = 'win'; GameAudio.stopMusic(); GameAudio.playSfx('win'); }, 2000);
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

function caughtBy(t) {
  lives--;
  score = Math.max(0, score - 300);
  player.stunT = 160; player.spraying = false;
  addParticles(player.x + PW/2, player.y, C.red, 20);
  let msg = fmt(STRINGS.caughtBy, t.name);
  msg += lives > 0 ? '♥'.repeat(lives) : 'GAME OVER!';
  setMsg(msg);
  var ps = LEVELS[currentLevel - 1].playerStart;
  player.x = ps.x; player.y = ps.y; player.vy = 0;
  GameAudio.playSfx('caught');
  if (lives <= 0) setTimeout(function() { state = 'gameover'; GameAudio.stopMusic(); GameAudio.playSfx('gameover'); }, 1800);
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

function updateBell() {
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
    addParticles(player.x + PW/2, player.y, C.red, 20);
    var msg = STRINGS.timesUp;
    msg += lives > 0 ? '♥'.repeat(lives) : 'GAME OVER!';
    setMsg(msg);
    player.stunT = 160; player.spraying = false;
    var ps = LEVELS[currentLevel - 1].playerStart;
    player.x = ps.x; player.y = ps.y; player.vy = 0;
    GameAudio.playSfx('caught');
    if (lives <= 0) {
      setTimeout(function() { state = 'gameover'; GameAudio.stopMusic(); GameAudio.playSfx('gameover'); }, 1800);
    } else {
      timerTicks = maxTimerTicks;
    }
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
