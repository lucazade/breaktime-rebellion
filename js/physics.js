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
      setMsg(STRINGS.bagCollected);
      GameAudio.playSfx('bag');
    }
  }

  // Auto-ring bell on proximity
  if (allBoards && !BELL.ringing && !BELL.done) {
    const bdx = Math.abs(player.x + PW/2 - BELL.x - 3);
    const bdy = Math.abs(player.y + PH/2 - BELL.y - 5);
    if (bdx < 18 && bdy < 22) ringBell();
  }

  if (actionPressed) { actionPressed = false; tryAction(); }
}

function tryAction() {
  if (state !== 'playing') return;

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
      player.spraying = false;
    }, 750);
  } else {
    if (allBoards && !BELL.done) setMsg(STRINGS.goBell);
    else setMsg(STRINGS.getCloser);
  }
}
