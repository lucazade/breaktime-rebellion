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
  const outerR = 55 + ease * 325;
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
    if (t.chasing || t.name === 'Guardiano') continue;
    const eyeY   = t.y - 5;
    const feetY  = t.y + PH;
    const nearH  = 4;
    const _nearX = t.dir > 0 ? t.x + PW + 1        : t.x - 1;
    const _farX  = t.dir > 0 ? t.x + PW + t.sight : t.x - t.sight;
    const _grad  = ctx.createLinearGradient(_nearX, 0, _farX, 0);
    _grad.addColorStop(0,   'rgba(255,255,255,0.12)');
    _grad.addColorStop(1,   'rgba(255,255,255,0.06)');
    ctx.fillStyle = _grad;
    ctx.beginPath();
    ctx.moveTo(_nearX, eyeY);
    ctx.lineTo(_farX,  eyeY);
    ctx.lineTo(_farX,  feetY);
    ctx.lineTo(_nearX, eyeY + nearH);
    ctx.closePath();
    ctx.fill();
    if (CONFIG.debug.sightDebug) {
      const rearSight = Math.round(t.sight * 0.4);
      const rrx = t.dir>0 ? t.x-rearSight : t.x+PW;
      ctx.fillStyle = 'rgba(255,0,0,0.3)';
      ctx.fillRect(rrx, t.y-2, rearSight, PH+4);
    }
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

// Noop stub — overridden by dev/debug/scene-overlay.js when ?scene=1
function drawDebugOverlay() {}
