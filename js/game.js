// Game loop and canvas setup

const CV = document.getElementById('c');
const ctx = CV.getContext('2d');
ctx.scale(2, 2); // 2× resolution: 640×400 canvas, 320×200 logical coordinates
ctx.imageSmoothingEnabled = false;

// Load optional hand-drawn background (640×400px, drawn bypassing ctx.scale)
(function() {
  if (!CONFIG.images.background) return;
  var img = new Image();
  img.onload = function() { bgImage = img; };
  img.src = CONFIG.images.background;
})();

var _lastLoopTime = 0;
var _accumulator  = 0;
var _STEP         = 1000 / 60; // fixed physics tick at 60Hz

function loop(ts) {
  if (_lastLoopTime === 0) _lastLoopTime = ts;
  var elapsed = ts - _lastLoopTime;
  _lastLoopTime = ts;
  if (elapsed > 250) elapsed = _STEP; // cap on hidden tab / lag spike
  _accumulator += elapsed;

  while (_accumulator >= _STEP) {
    frame++;
    if (state === 'playing') {
      if (missionBannerT > 0) missionBannerT--;
      updatePlayer();
      updateTeachers();
      if (!CONFIG.debug.disableJanitors) updateJanitors();
      updateBell();
      updateTimer();
      tickTransition();
    }
    _accumulator -= _STEP;
  }

  drawBg();
  drawDesks();
  drawBoards();
  if (levelMechanics.ringBell && !BELL.done) drawBell();
  drawBags();
  drawMachines();
  drawSight();

  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    drawChar(t.x, t.y, t.dir, t.animT, t.color, true, false, t.chasing);
  }
  if (!CONFIG.debug.disableJanitors) {
    for (let i = 0; i < janitors.length; i++) {
      const j = janitors[i];
      drawJanitor(j.x, j.y, j.dir, j.animT);
    }
  }
  if (!(player.stunT > 0 && Math.floor(frame/5)%2 === 1)) {
    drawChar(player.x, player.y, player.dir, player.animT, C.blue, false, player.spraying, false);
  }

  if (player.stunT > 120) { ctx.fillStyle = 'rgba(255,0,0,0.18)'; ctx.fillRect(0,0,W,H); }

  drawParticles();
  drawFloating();
  drawEndScreen();
  drawMissionBanner();
  drawDebugOverlay();
  updateHUD();
  requestAnimationFrame(loop);
}

CV.addEventListener('click', function() {
  if (state === 'win') {
    if (currentLevel < LEVELS.length) nextLevel(); else restartGame();
    return;
  }
  if (state === 'gameover') { restartGame(); }
});

requestAnimationFrame(loop);
