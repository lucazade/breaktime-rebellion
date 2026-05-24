// Game world rendering — background, environment effects, debug overlay

var _bgCache        = null; // offscreen canvas: bgImage pre-scaled to CV size, rebuilt on first draw
var _desksCache     = null; // offscreen canvas: all desks pre-rendered at physical resolution
var _bellGlowCache  = null; // offscreen canvas: bell glow circle at r=7, drawn once
var _boardsCache    = null; // offscreen canvas: all boards (static + done state), keyed by _boardsCacheKey
var _boardsCacheKey = null; // serialized done states e.g. "0101" — rebuild on change

function resetBgCache() { _bgCache = null; }

function drawBg() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!_bgCache && bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
    if (window.createImageBitmap) {
      createImageBitmap(bgImage, {resizeWidth: CV.width, resizeHeight: CV.height, resizeQuality: 'high'})
        .then(function(bmp) { _bgCache = bmp; }).catch(function() {
          var _oc = document.createElement('canvas');
          _oc.width = CV.width; _oc.height = CV.height;
          var _octx = _oc.getContext('2d');
          _octx.imageSmoothingEnabled = true;
          _octx.drawImage(bgImage, 0, 0, CV.width, CV.height);
          _bgCache = _oc;
        });
      _bgCache = 'pending'; // prevent re-entry while promise resolves
    } else {
      var _oc = document.createElement('canvas');
      _oc.width = CV.width; _oc.height = CV.height;
      var _octx = _oc.getContext('2d');
      _octx.imageSmoothingEnabled = true;
      _octx.drawImage(bgImage, 0, 0, CV.width, CV.height);
      _bgCache = _oc;
    }
  }
  if (_bgCache && _bgCache !== 'pending') ctx.drawImage(_bgCache, 0, 0);
  else if (!_bgCache && bgImage && bgImage.complete) ctx.drawImage(bgImage, 0, 0, CV.width, CV.height);
  ctx.setTransform(_canvasScale, 0, 0, _canvasScale, 0, 0);
}

function drawNightOverlay() {
  if (!nightMode) return;
  const px = Math.round(player.x + PW/2);
  const py = Math.round(player.y + PH/2 - 2);
  const t = exitDone ? Math.min(nightExpandT / 120, 1) : 0;
  const ease = t * t * (3 - 2 * t);
  const outerR = 45 + ease * 335;
  const a1 = (0.80 * (1 - ease)).toFixed(2);
  const a2 = (0.96 * (1 - ease)).toFixed(2);
  const gradient = ctx.createRadialGradient(px, py, 10, px, py, outerR);
  gradient.addColorStop(0,    'rgba(0,0,8,0)');
  gradient.addColorStop(0.45, 'rgba(0,0,8,0)');
  gradient.addColorStop(0.72, 'rgba(0,0,8,' + a1 + ')');
  gradient.addColorStop(1,    'rgba(0,0,8,' + a2 + ')');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function drawSight() {
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    if (t.chasing || t.name === 'Guardiano') continue; // guards have no visible sight cone
    ctx.fillStyle = PAL.sightCone;
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
    ctx.fillStyle = t.color; ctx.font = '8px ' + FF;
    ctx.fillText(t.text, t.x - ctx.measureText(t.text).width/2, t.y);
    t.y -= 0.5; t.life--;
  }
  ctx.globalAlpha = 1;
}

function drawDebugOverlay() {
  if (!DEBUG) return;
  ctx.save();
  ctx.font = '4px monospace';
  ctx.textAlign = 'left';

  [{y:TY, label:'TY='+TY}, {y:MY, label:'MY='+MY}, {y:GY, label:'GY='+GY}].forEach(function(fl) {
    ctx.strokeStyle = PAL.debugFloorYellow;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(0, fl.y); ctx.lineTo(W, fl.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(1, fl.y-6, 26, 7);
    ctx.fillStyle = PAL.debugYellow; ctx.fillText(fl.label, 2, fl.y-1);
  });

  [107, 213].forEach(function(dx) {
    ctx.strokeStyle = PAL.debugStairCyan;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(dx+1, 2, 20, 7);
    ctx.fillStyle = PAL.debugCyan; ctx.fillText('x='+dx, dx+2, 8);
  });

  stairs.forEach(function(s, i) {
    var lx = Math.min(s.x1,s.x2), rx = Math.max(s.x1,s.x2);
    var ty = Math.min(s.y1,s.y2), by2 = Math.max(s.y1,s.y2);
    ctx.fillStyle = PAL.debugStairFill;
    ctx.fillRect(lx-2, ty, rx-lx+4, by2-ty);
    ctx.strokeStyle = PAL.debugStairOutline;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(lx-2, ty, rx-lx+4, by2-ty);
    ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(lx-2, ty-8, 55, 7);
    ctx.fillStyle = PAL.debugOrange;
    ctx.fillText('S'+i+' ('+s.x1+','+s.y1+')→('+s.x2+','+s.y2+')', lx-1, ty-2);
    ctx.fillStyle = PAL.debugOrangeR;
    ctx.fillRect(s.x1-1, s.y1-1, 3, 3);
    ctx.fillRect(s.x2-1, s.y2-1, 3, 3);
  });

  bags.forEach(function(b) {
    ctx.strokeStyle = PAL.debugBagPurple;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(b.x, b.y, 14, 10);
    ctx.fillStyle = PAL.debugBlue; ctx.fillText('bag', b.x, b.y-2);
  });

  BOARDS.forEach(function(b) {
    ctx.strokeStyle = PAL.debugBoardGreen;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(b.x, b.y, BW, BH);
    ctx.fillStyle = PAL.debugGreen; ctx.fillText('brd', b.x, b.y-2);
  });

  DESKS.forEach(function(d) {
    ctx.strokeStyle = PAL.debugDeskYellow;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(d.x, d.y, 20, 11);
  });

  ctx.strokeStyle = PAL.debugBellGold;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(BELL.x-2, BELL.y-1, 10, 9);
  ctx.fillStyle = PAL.panelBorder; ctx.fillText('bell', BELL.x-2, BELL.y-2);

  ctx.strokeStyle = PAL.debugPlayerPink;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(player.x, player.y, PW, PH);
  ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(player.x, player.y-8, 36, 7);
  ctx.fillStyle = PAL.debugMagenta;
  ctx.fillText('P('+Math.round(player.x)+','+Math.round(player.y)+')', player.x+1, player.y-2);

  ctx.restore();
}
