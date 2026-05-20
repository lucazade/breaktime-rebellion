// Rendering — all draw functions and HUD update

var _logoImage = null; // loaded by game.js alongside bgImage
var FF = CONFIG.vis.fontFamily;  // font family shortcut — editable in layout.js
var _hudMsgAlpha = 0; // HUD crossfade alpha: rises to 1 when a message is active, falls back to 0 otherwise
var _bgCache    = null; // offscreen canvas: bgImage pre-scaled to CV size, rebuilt on first draw
var _desksCache = null; // offscreen canvas: all desks pre-rendered at physical resolution
var _bellGlowCache = null; // offscreen canvas: bell glow circle at r=7, drawn once
var _hudTxtCache     = { txt: null, w: 0 };  // cached measureText for HUD counter (e.g. "4/4")
var _audioLblW       = null; // cached measureText for title audio labels {full, sfx, mute}
var _audioMaxLblW    = 0;    // cached max of the three label widths

// ── Title screen helpers ──────────────────────────────────────────────────────


function _drawVolumeIcon(x, y, mode, color) {
  // 5×4 logical pixels (= 10×8 real px) — matches the 4px font height
  ctx.fillStyle = color;
  if (mode === 'mute') {
    // X shape 5×4 — same width as the bar icons
    ctx.fillRect(x,   y,   1,1); ctx.fillRect(x+4, y,   1,1);
    ctx.fillRect(x+1, y+1, 1,1); ctx.fillRect(x+3, y+1, 1,1);
    ctx.fillRect(x+1, y+2, 1,1); ctx.fillRect(x+3, y+2, 1,1);
    ctx.fillRect(x,   y+3, 1,1); ctx.fillRect(x+4, y+3, 1,1);
  } else if (mode === 'sfx') {
    ctx.fillRect(x,   y+2, 1, 2);  // low bar
    ctx.fillRect(x+2, y+1, 1, 3);  // mid bar
  } else {
    ctx.fillRect(x,   y+2, 1, 2);  // low bar
    ctx.fillRect(x+2, y+1, 1, 3);  // mid bar
    ctx.fillRect(x+4, y,   1, 4);  // high bar
  }
}

function _dialogPanel(x, y, w, h, bgColor) {
  var d = CONFIG.vis.dialog;
  ctx.fillStyle = bgColor || d.panBg;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, d.panR); ctx.fill();
  ctx.strokeStyle = d.panBorder; ctx.lineWidth = d.panBorderW;
  ctx.beginPath(); ctx.roundRect(x+1, y+1, w-2, h-2, d.panR); ctx.stroke();
}

function _dialogBtn(x, y, w, h, color) {
  var d = CONFIG.vis.dialog;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, d.btnR); ctx.fill();
  ctx.strokeStyle = d.btnStroke; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x+1, y+1, w-2, h-2, d.btnR); ctx.stroke();
}

function _drawLockIcon(x, y, color) {
  // 6×6px padlock — shackle (rows 0-1) + body (rows 2-5) + 2×2 keyhole
  ctx.fillStyle = color;
  ctx.fillRect(x+1, y,   4, 1);  // shackle top arc
  ctx.fillRect(x,   y+1, 1, 1);  ctx.fillRect(x+5, y+1, 1, 1);  // shackle sides
  ctx.fillRect(x,   y+2, 6, 4);  // body
  ctx.fillStyle = '#000';
  ctx.fillRect(x+2, y+3, 2, 2);  // keyhole
}

function drawTitleScreen() {
  var VT = CONFIG.vis.titleScreen;
  ctx.clearRect(0, 0, W, H);

  var ct = VT.controls;
  var showLegend = CONFIG.debug.showLegend;

  // Logo height
  var logoW = VT.logo.w;
  var logoX = Math.round((W - logoW) / 2);
  var logoH = 0;
  if (_logoImage && _logoImage.complete && _logoImage.naturalWidth > 0) {
    logoH = Math.round(_logoImage.naturalHeight / _logoImage.naturalWidth * logoW);
  }

  // Vertical centering: compute total height of content block
  var ctrlBlockH = ct.gapY + ct.btnH;
  var legBlockH  = showLegend ? (VT.legend.gapY  + VT.legend.fontSize + 2)  : 0;
  var totalH = logoH + ctrlBlockH + legBlockH;
  var logoY  = Math.max(0, Math.round((H - totalH) / 2));
  _titleLogoRect = logoH > 0 ? {x: logoX, y: logoY, w: logoW, h: logoH} : null;

  // Logo clipped with rounded corners + thin border
  if (logoH > 0) {
    var r = VT.logo.borderR;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoW, logoH, r);
    ctx.clip();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(_logoImage, logoX*_canvasScale, logoY*_canvasScale, logoW*_canvasScale, logoH*_canvasScale);
    ctx.restore();
    if (VT.logo.borderW > 0) {
      ctx.save();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = VT.logo.borderW;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoW, logoH, r);
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';

  // Controls row
  var ctrlY = logoY + logoH + ct.gapY;
  _titleCtrlY = ctrlY;
  ctx.font = ct.fontSize + 'px ' + FF;

  ctx.lineWidth = 1;
  var ctrlTextY = ctrlY + Math.floor((ct.btnH - ct.fontSize) / 2); // vertical text centering
  var r = ct.boxR;
  function _box(x, y, w, color) {
    ctx.strokeStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, ct.btnH, r); ctx.stroke();
  }

  // Level chooser
  if (LEVELS.length > 1) {
    var prevColor = currentLevel <= 1 ? C.dgray : ct.btnColor;
    _box(ct.prevX, ctrlY, ct.prevW, prevColor);
    ctx.fillStyle = prevColor; ctx.fillText('‹', ct.prevX + ct.prevW/2, ctrlTextY);

    ctx.fillStyle = C.gold;
    ctx.fillText(STRINGS.levelLabel + ' ' + currentLevel, ct.labelX, ctrlTextY);

    var atCeiling = currentLevel >= _btrMax, moreExist = _btrMax < LEVELS.length;
    if (atCeiling && moreExist) {
      _box(ct.nextX, ctrlY, ct.nextW, C.yellow);
      _drawLockIcon(ct.nextX + Math.floor((ct.nextW - 6) / 2), ctrlY + Math.floor((ct.btnH - 6) / 2), C.yellow);
    } else {
      var nextColor = (atCeiling && !moreExist) ? C.dgray : ct.btnColor;
      _box(ct.nextX, ctrlY, ct.nextW, nextColor);
      ctx.fillStyle = nextColor; ctx.fillText('›', ct.nextX + ct.nextW/2, ctrlTextY);
    }
  }

  // Tap to start — shown in the controls bar, blinking (if CONFIG.debug.showTapToStart)
  if (CONFIG.debug.showTapToStart && !_titleStarting && Math.floor(frame / 20) % 2 === 0) {
    var vTap = VT.tapToStart;
    var tapX = vTap.alignX === 'left' ? 0 : vTap.alignX === 'right' ? W : W / 2;
    var tapOffY = vTap.alignY === 'top' ? 1 : vTap.alignY === 'bottom' ? ct.btnH - vTap.fontSize - 1 : Math.floor((ct.btnH - vTap.fontSize) / 2);
    ctx.font = vTap.fontSize + 'px ' + FF;
    ctx.fillStyle = C.gold; ctx.textAlign = vTap.alignX;
    ctx.fillText(STRINGS.tapToStart, tapX, ctrlY + tapOffY);
    ctx.font = ct.fontSize + 'px ' + FF; ctx.textAlign = 'center';
  }

  // Audio toggle — fixed width based on the longest label across all modes
  var audioMode = GameAudio.getMode();
  var audioColor = audioMode==='full' ? C.lgreen : audioMode==='sfx' ? C.yellow : C.mgray;
  var audioLabel = audioMode==='full' ? STRINGS.audioFull : audioMode==='sfx' ? STRINGS.audioSfx : STRINGS.audioMute;
  var _iconW = 5, _gap = 3;
  if (!_audioLblW && document.fonts.check(ctx.font)) {
    _audioLblW = { full: ctx.measureText(STRINGS.audioFull).width, sfx: ctx.measureText(STRINGS.audioSfx).width, mute: ctx.measureText(STRINGS.audioMute).width };
    _audioMaxLblW = Math.max(_audioLblW.full, _audioLblW.sfx, _audioLblW.mute);
  }
  var _maxLblW = _audioLblW ? _audioMaxLblW : Math.max(ctx.measureText(STRINGS.audioFull).width, ctx.measureText(STRINGS.audioSfx).width, ctx.measureText(STRINGS.audioMute).width);
  var _audioW = ct.audioPadX*2 + _iconW + _gap + _maxLblW;
  var _audioX = ct.audioRightX - _audioW;
  _titleAudioX = _audioX; _titleAudioW = _audioW;
  _box(_audioX, ctrlY, _audioW, audioColor);
  var _blockW = _iconW + _gap + (_audioLblW ? _audioLblW[audioMode] : ctx.measureText(audioLabel).width);
  var _blockX = _audioX + Math.floor((_audioW - _blockW) / 2);
  _drawVolumeIcon(_blockX, ctrlY + Math.floor((ct.btnH - 4) / 2), audioMode, audioColor);
  ctx.fillStyle = audioColor; ctx.textAlign = 'left';
  ctx.fillText(audioLabel, _blockX + _iconW + _gap, ctrlTextY);
  ctx.textAlign = 'center';

  // Keyboard legend — desktop only, single row with key boxes
  if (showLegend) {
    var lf = VT.legend.fontSize, kh = lf + 2, kr = 1, ks = 4;
    ctx.font = lf + 'px ' + FF;
    ctx.lineWidth = 1; ctx.textBaseline = 'top';
    var legY = ctrlY + ct.btnH + VT.legend.gapY;

    function _kw(c) { return ctx.measureText(c).width + 4; }
    function _key(x, c) {
      var kw = _kw(c);
      ctx.strokeStyle = C.lgray; ctx.beginPath(); ctx.roundRect(x, legY, kw, kh, kr); ctx.stroke();
      ctx.fillStyle = C.lgray; ctx.textAlign = 'center'; ctx.fillText(c, x + kw/2, legY + 1);
      return kw;
    }

    var twMov=ctx.measureText(STRINGS.keyMove||'move').width;
    var twAct=ctx.measureText(STRINGS.keyAction||'action').width;
    var twPau=ctx.measureText(STRINGS.keyPause||'pause').width;
    var twHom=ctx.measureText(STRINGS.keyHome||'home').width;
    var totalLW = _kw('<')+1+_kw('^')+1+_kw('v')+1+_kw('>') + ks+twMov + ks+_kw('Z')+ks+twAct + ks+_kw('P')+ks+twPau + ks+_kw('ESC')+ks+twHom;
    var bx = Math.round((W - totalLW) / 2);

    bx += _key(bx,'<')+1; bx += _key(bx,'^')+1; bx += _key(bx,'v')+1; bx += _key(bx,'>');
    bx += ks; ctx.fillStyle=C.lgray; ctx.textAlign='left'; ctx.fillText(STRINGS.keyMove||'move', bx, legY+1); bx += twMov;
    bx += ks; bx += _key(bx,'Z');
    bx += ks; ctx.fillStyle=C.lgray; ctx.textAlign='left'; ctx.fillText(STRINGS.keyAction||'action', bx, legY+1); bx += twAct;
    bx += ks; bx += _key(bx,'P');
    bx += ks; ctx.fillStyle=C.lgray; ctx.textAlign='left'; ctx.fillText(STRINGS.keyPause||'pause', bx, legY+1); bx += twPau;
    bx += ks; bx += _key(bx,'ESC');
    bx += ks; ctx.fillStyle=C.lgray; ctx.textAlign='left'; ctx.fillText(STRINGS.keyHome||'home', bx, legY+1);

    ctx.textAlign = 'center';
  }

  ctx.restore();
}

function drawBg() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!_bgCache && bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
    var _oc = document.createElement('canvas');
    _oc.width = CV.width; _oc.height = CV.height;
    var _octx = _oc.getContext('2d');
    _octx.imageSmoothingEnabled = true;
    _octx.drawImage(bgImage, 0, 0, CV.width, CV.height);
    _bgCache = _oc;
  }
  if (_bgCache) ctx.drawImage(_bgCache, 0, 0);
  ctx.setTransform(_canvasScale, 0, 0, _canvasScale, 0, 0);
}

function drawDesks() {
  if (!_desksCache && DESKS.length > 0) {
    var _oc = document.createElement('canvas');
    _oc.width = CV.width; _oc.height = CV.height;
    var _octx = _oc.getContext('2d');
    _octx.imageSmoothingEnabled = false;
    _octx.scale(_canvasScale, _canvasScale);
    for (var _i = 0; _i < DESKS.length; _i++) {
      var _d = DESKS[_i];
      _octx.fillStyle = '#2c1800'; _octx.fillRect(_d.x-1, _d.y-1, 22, 8);
      _octx.fillStyle = C.desklt;  _octx.fillRect(_d.x,   _d.y,   20, 6);
      _octx.fillStyle = C.desk;    _octx.fillRect(_d.x,   _d.y+5, 20, 2);
      _octx.fillStyle = C.brown;
      _octx.fillRect(_d.x+1,  _d.y+6, 2, 5);
      _octx.fillRect(_d.x+17, _d.y+6, 2, 5);
      _octx.fillStyle = C.red;   _octx.fillRect(_d.x+5, _d.y-2, 8, 3);
      _octx.fillStyle = C.white; _octx.fillRect(_d.x+6, _d.y-2, 6, 2);
    }
    _desksCache = _oc;
  }
  if (_desksCache) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(_desksCache, 0, 0);
    ctx.setTransform(_canvasScale, 0, 0, _canvasScale, 0, 0);
  }
}

function drawBoards() {
  let nearestIdx = -1, nd = 9999;
  if (levelMechanics.writeBoards) {
    for (let i = 0; i < BOARDS.length; i++) {
      if (BOARDS[i].done) continue;
      const d = Math.abs(player.x+PW/2 - BOARDS[i].x-BW/2) + Math.abs(player.y - BOARDS[i].y-BH);
      if (d < nd) { nd = d; nearestIdx = i; }
    }
  }
  for (let i = 0; i < BOARDS.length; i++) {
    const b = BOARDS[i];
    ctx.fillStyle = C.brown;   ctx.fillRect(b.x-1, b.y-1, BW+2, BH+2);
    ctx.fillStyle = '#075b07'; ctx.fillRect(b.x, b.y, BW, BH);
    if (!b.done) {
      ctx.fillStyle = '#2c832c';
      ctx.fillRect(b.x+2, b.y+3, BW-4, 2);
      ctx.fillRect(b.x+2, b.y+8, BW-4, 2);
      if (i === nearestIdx && nd < 36) {
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
        ctx.setLineDash([2,2]);
        ctx.strokeRect(b.x-2, b.y-2, BW+4, BH+4);
        ctx.setLineDash([]);
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '4px ' + FF;
      ctx.fillText('MARCO', b.x+1, b.y+9);
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(b.x+1, b.y+10, BW-2, 1);
    }
  }
}

function drawBell() {
  const bx = BELL.x, by = BELL.y;
  const sw = BELL.ringing ? Math.round(Math.sin(frame * 0.6) * 3) : 0;
  const X  = bx + sw;

  const out = '#554400';
  const col = '#FFCC00';
  const hi  = '#FFE966';
  const shd = '#CC9900';
  const drk = '#332200';

  // Top cap (closes the border)
  ctx.fillStyle = out; ctx.fillRect(X+2, by-1, 2, 1);

  // Knob (2px)
  ctx.fillStyle = out; ctx.fillRect(X+1, by,   4, 1);
  ctx.fillStyle = col; ctx.fillRect(X+2, by,   2, 1);

  // Cap (4px)
  ctx.fillStyle = out; ctx.fillRect(X+0, by+1, 6, 1);
  ctx.fillStyle = col; ctx.fillRect(X+1, by+1, 4, 1);

  // Dome (4px × 1 row)
  ctx.fillStyle = out; ctx.fillRect(X+0, by+2, 6, 1);
  ctx.fillStyle = col; ctx.fillRect(X+1, by+2, 4, 1);
  ctx.fillStyle = hi;  ctx.fillRect(X+1, by+2, 1, 1);
  ctx.fillStyle = col; ctx.fillRect(X+4, by+2, 1, 1);

  // Flare / skirt (6px × 2 rows)
  ctx.fillStyle = out; ctx.fillRect(X-1, by+3, 8, 2);
  ctx.fillStyle = col; ctx.fillRect(X+0, by+3, 6, 1);
  ctx.fillStyle = col; ctx.fillRect(X+0, by+4, 6, 1);
  ctx.fillStyle = hi;  ctx.fillRect(X+0, by+3, 1, 2);

  // Bottom outline
  ctx.fillStyle = out; ctx.fillRect(X-1, by+5, 8, 1);

  // Clapper (2px × 1 row)
  ctx.fillStyle = drk; ctx.fillRect(X+2, by+6, 2, 1);

  // Pulsing glow when the objective is complete — blit pre-rendered circle, vary only globalAlpha
  if ((allBoards || allBags || allMachines || allBall || allStudents || allBooks || allSink || allBins || allSprinklers) && !BELL.done) {
    if (!_bellGlowCache) {
      var _gc = document.createElement('canvas'); _gc.width = 16 * _canvasScale; _gc.height = 16 * _canvasScale;
      var _gctx = _gc.getContext('2d');
      _gctx.scale(_canvasScale, _canvasScale);
      _gctx.fillStyle = '#FFD700';
      _gctx.beginPath(); _gctx.arc(8, 8, 7, 0, Math.PI*2); _gctx.fill();
      _bellGlowCache = _gc;
    }
    ctx.globalAlpha = 0.12 + 0.08 * Math.sin(frame * 0.15);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(_bellGlowCache, Math.round((bx - 5) * _canvasScale), Math.round((by - 5) * _canvasScale));
    ctx.setTransform(_canvasScale, 0, 0, _canvasScale, 0, 0);
    ctx.globalAlpha = 1;
  }

  // Sound waves when ringing
  if (BELL.ringing) {
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = 'rgba(255,215,0,' + (0.6 - i*0.15) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(bx+3, by+3, 4+i*3, 0, Math.PI*2); ctx.stroke();
    }
  }
}

function drawGymBall() {
  if (!gymBall) return;
  const bx = Math.round(gymBall.x), by = Math.round(gymBall.y);
  if (gymBall.deflated) {
    ctx.fillStyle = '#CC6600';
    ctx.fillRect(bx, by+5, 9, 3);
    ctx.fillStyle = '#993300';
    ctx.fillRect(bx+1, by+6, 7, 1);
    return;
  }
  if (gymBall.shakeT > 0) {
    const pct = gymBall.shakeT / deflateTime;
    ctx.fillStyle = '#880000'; ctx.fillRect(bx-2, by-9, 13, 5);
    ctx.fillStyle = '#2a0000'; ctx.fillRect(bx-1, by-8, 11, 3);
    ctx.fillStyle = '#cc1100'; ctx.fillRect(bx-1, by-8, Math.round(11 * pct), 3);
  }
  // Basketball
  ctx.fillStyle = '#6b2200';
  ctx.fillRect(bx+1, by-1, 7, 1); ctx.fillRect(bx+1, by+9, 7, 1); // top/bottom
  ctx.fillRect(bx-1, by+1, 1, 7); ctx.fillRect(bx+9, by+1, 1, 7); // left/right
  ctx.fillStyle = '#CC6600';
  ctx.fillRect(bx+1, by, 7, 9); ctx.fillRect(bx, by+1, 9, 7);
  ctx.fillStyle = '#6b2200';
  ctx.fillRect(bx+4, by, 1, 9); ctx.fillRect(bx, by+4, 9, 1);
  ctx.fillStyle = 'rgba(255,200,100,0.5)'; ctx.fillRect(bx+1, by+1, 2, 2);
  if (!allBall) {
    const pdx = Math.abs(player.x + PW/2 - gymBall.x - 4);
    const pdy = Math.abs(player.y + PH  - gymBall.y - 9);
    if (pdx < 14 && pdy < 14) {
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _dg = CONFIG.vis.dashed.gymBall; ctx.strokeRect(bx+_dg.x, by+_dg.y, _dg.w, _dg.h);
      ctx.setLineDash([]);
    }
  }
}

function drawBookcase() {
  if (!bookcase) return;
  const bx = Math.round(bookcase.x), by = Math.round(bookcase.y);

  if (bookcase.dropped) {
    // Open book lying flat on the floor (two pages + spine)
    const fx = bx + bookcase.fallDx, fy = by + bookcase.fallDy;
    ctx.fillStyle = '#3a1000';
    ctx.fillRect(fx-1, fy, 1, 9); ctx.fillRect(fx+18, fy, 1, 9); // vertical borders
    ctx.fillRect(fx-1, fy+9, 20, 1);                               // bottom border
    ctx.fillStyle = '#3a1000'; ctx.fillRect(fx,    fy,   18, 1); // binding top
    ctx.fillStyle = '#F5E6C0'; ctx.fillRect(fx,    fy+1,  7, 8); // left page
    ctx.fillStyle = '#F5E6C0'; ctx.fillRect(fx+11, fy+1,  7, 8); // right page
    ctx.fillStyle = '#6B2200'; ctx.fillRect(fx+7,  fy,    4, 9); // spine
    ctx.fillStyle = '#999999'; ctx.fillRect(fx+1,  fy+3,  5, 1); // text lines L
    ctx.fillStyle = '#999999'; ctx.fillRect(fx+1,  fy+5,  5, 1);
    ctx.fillStyle = '#999999'; ctx.fillRect(fx+12, fy+3,  5, 1); // text lines R
    ctx.fillStyle = '#999999'; ctx.fillRect(fx+12, fy+5,  5, 1);
    return;
  }

  // Progress bar while shaking; no book sprite (bg.png shows it in place)
  if (bookcase.shakeT > 0) {
    const pct = bookcase.shakeT / dropTime;
    ctx.fillStyle = '#880000'; ctx.fillRect(bx-14, by-6, 9, 5);
    ctx.fillStyle = '#2a0000'; ctx.fillRect(bx-13, by-5, 7, 3);
    ctx.fillStyle = '#cc1100'; ctx.fillRect(bx-13, by-5, Math.round(7 * pct), 3);
  }

  // Proximity dashed border — full bookcase area
  if (!allBooks) {
    const pdx = Math.abs(player.x + PW/2 - bookcase.x - 12);
    const pdy = Math.abs(player.y + PH  - bookcase.y - 26);
    if (pdx < 20 && pdy < 36) {
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _db = CONFIG.vis.dashed.bookcase; ctx.strokeRect(bx+_db.x, by+_db.y, _db.w, _db.h);
      ctx.setLineDash([]);
    }
  }
}

function drawRegister() {
  if (!register || register.stolen) return;
  const bx = Math.round(register.x), by = Math.round(register.y);
  // Book cover (dark red register)
  ctx.fillStyle = '#8B0000'; ctx.fillRect(bx, by-2, 10, 14);
  ctx.fillStyle = '#6B0000'; ctx.fillRect(bx, by-2, 1, 14);  // spine
  ctx.fillStyle = '#AA2200'; ctx.fillRect(bx+1, by-2, 9, 1); // top edge
  // Pages
  ctx.fillStyle = '#F0E8D0'; ctx.fillRect(bx+2, by-1, 7, 12);
  // Grade lines
  ctx.fillStyle = '#888'; ctx.fillRect(bx+3, by+2, 5, 1);
  ctx.fillStyle = C.red;   ctx.fillRect(bx+3, by+4, 5, 1);
  ctx.fillStyle = '#888'; ctx.fillRect(bx+3, by+6, 5, 1);
  ctx.fillStyle = C.red;   ctx.fillRect(bx+3, by+8, 5, 1);

  // Progress bar while stealing
  if (register.stealT > 0) {
    const pct = register.stealT / registerTime;
    ctx.fillStyle = '#880000'; ctx.fillRect(bx-2, by-7, 14, 4);
    ctx.fillStyle = '#2a0000'; ctx.fillRect(bx-1, by-6, 12, 2);
    ctx.fillStyle = '#cc1100'; ctx.fillRect(bx-1, by-6, Math.round(12 * pct), 2);
  }

  // Proximity border
  if (!allRegister) {
    const pdx = Math.abs(player.x + PW/2 - register.x - 5);
    const pdy = Math.abs(player.y + PH  - register.y - 8);
    if (pdx < 16 && pdy < 20) {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _dr = CONFIG.vis.dashed.register; ctx.strokeRect(bx+_dr.x, by+_dr.y, _dr.w, _dr.h);
      ctx.setLineDash([]);
    }
  }
}

function drawExitDoor() {
  if (!exitDoor || !allRegister) return;
  const bx = Math.round(exitDoor.x), by = Math.round(exitDoor.y);
  const pdx = Math.abs(player.x + PW/2 - exitDoor.x - 6);
  const pdy = Math.abs(player.y + PH  - exitDoor.y - 10);
  if (pdx < 22 && pdy < 30) {
    const blink = Math.floor(frame / 10) % 2 === 0;
    ctx.strokeStyle = blink ? C.gold : C.green; ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    const _de = CONFIG.vis.dashed.exitDoor; ctx.strokeRect(bx+_de.x, by+_de.y, _de.w, _de.h);
    ctx.setLineDash([]);
  }
}

function drawNightOverlay() {
  if (!nightMode) return;
  const px = Math.round(player.x + PW/2);
  const py = Math.round(player.y + PH/2 - 2);
  const gradient = ctx.createRadialGradient(px, py, 10, px, py, 70);
  gradient.addColorStop(0,    'rgba(0,0,8,0)');
  gradient.addColorStop(0.45, 'rgba(0,0,8,0)');
  gradient.addColorStop(0.72, 'rgba(0,0,8,0.80)');
  gradient.addColorStop(1,    'rgba(0,0,8,0.96)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function drawGuard(x, y, dir, animT, chasing, knockedT) {
  const bx = Math.round(x), by = Math.round(y);
  if (knockedT > 0) {
    const fy = by + PH - 1;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-4, fy+2, 18, 2);
    if (CONFIG.vis.char.outline) {
      const s = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-s, fy-3-s, 14+s*2, 4+s*2);
      ctx.fillRect((dir>0 ? bx+12 : bx-6)-s, fy-4-s, 6+s*2, 5+s*2);
    }
    ctx.fillStyle = '#1a1a3a'; ctx.fillRect(bx-2, fy-3, 14, 4);
    ctx.fillStyle = C.pink;   ctx.fillRect(dir > 0 ? bx+12 : bx-6, fy-4, 6, 5);
    return;
  }
  const leg = Math.sin(animT) * 2.5;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-1, by+PH, PW, 2);
  if (CONFIG.vis.char.outline) {
    const s = CONFIG.vis.char.outlineSize || 1;
    ctx.fillStyle = CONFIG.vis.char.outlineColor;
    ctx.fillRect(bx+1-s, by+10-s, 3+s*2, 4+leg+s*2);
    ctx.fillRect(bx+4-s, by+10-s, 3+s*2, 4-leg+s*2);
    ctx.fillRect(bx-s,   by+13+leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx+3-s, by+13-leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx-s, by+2-s, PW+s*2, 8+s*2);
    ctx.fillRect((dir>0 ? bx-2 : bx+PW)-s, by+5-s, 2+s*2, 4+s*2);
    ctx.fillRect((dir>0 ? bx+PW : bx-2)-s, by+5-s, 2+s*2, 4+s*2);
    ctx.fillRect(bx+2-s, by+1-s, PW-4+s*2, 1+s*2);
    ctx.fillRect(bx-s, by-8-s, PW+s*2, 11+s*2);
    ctx.fillRect((dir>0 ? bx-2 : bx+PW-1)-s, by-7-s, 3+s*2, 2+s*2);
  }
  // Dark trousers
  ctx.fillStyle = '#111'; ctx.fillRect(bx+1, by+10, 3, 4+leg); ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = C.black; ctx.fillRect(bx, by+13+leg, 4, 2); ctx.fillRect(bx+3, by+13-leg, 4, 2);
  // Dark uniform body
  ctx.fillStyle = '#1a1a3a'; ctx.fillRect(bx, by+2, PW, 8);
  // Arms
  ctx.fillStyle = C.pink; ctx.fillRect(dir>0 ? bx-2 : bx+PW, by+5, 2, 4); ctx.fillRect(dir>0 ? bx+PW : bx-2, by+5, 2, 4);
  // Head
  ctx.fillStyle = C.pink; ctx.fillRect(bx+1, by-7, PW-2, 8);
  // White cap
  ctx.fillStyle = '#ddd'; ctx.fillRect(bx, by-8, PW, 3);
  ctx.fillStyle = '#bbb'; ctx.fillRect(dir>0 ? bx-2 : bx+PW-1, by-7, 3, 2); // cap visor
  // Eye
  ctx.fillStyle = C.black; ctx.fillRect(dir>0 ? bx+4 : bx+2, by-5, 2, 2);
  ctx.fillStyle = '#825144'; ctx.fillRect(bx+2, by+1, PW-4, 1);
  if (chasing) {
    const bub = dir>0 ? bx+PW : bx-26;
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(bub, by-14, 26, 10);
    ctx.fillStyle = C.black; ctx.font = '4px ' + FF;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('STOP!', bub + 13, by - 12);
  }
}

function drawSprinklers() {
  for (let i = 0; i < sprinklers.length; i++) {
    const sp = sprinklers[i];
    const bx = Math.round(sp.x), by = Math.round(sp.y);
    const floorY = by > 110 ? Math.round(GY - walkOffset) : Math.round(MY - walkOffset);

    // Water umbrella when active (widens toward floor)
    if (sp.active) {
      const range = floorY - by - 4;
      ctx.fillStyle = 'rgba(60,140,255,0.45)';
      for (let wy = by + 4; wy < floorY; wy += 4) {
        const spread = Math.floor((wy - by - 4) / range * 5); // 0→5 spread
        const wx = Math.floor(Math.sin((wy + frame * 0.5) * 0.6) * 1);
        ctx.fillRect(bx + 1 - spread + wx, wy, 2, 3); // left stream
        ctx.fillRect(bx + 5 + spread + wx, wy, 2, 3); // right stream
        if (spread >= 2) ctx.fillRect(bx + 3 + wx, wy, 2, 3); // centre
      }
      // Floor splash (wider at base)
      ctx.fillStyle = 'rgba(100,180,255,0.38)';
      ctx.fillRect(bx - 6, floorY - 2, 20, 3);
    }

    // Sprinkler fixture — disc + head only (no stem above ceiling)
    ctx.fillStyle = '#bbb'; ctx.fillRect(bx,   by-2, 8, 2);    // deflector disc
    ctx.fillStyle = sp.active ? C.red : '#888';
    ctx.fillRect(bx+2, by, 4, 3);                              // head (red = active)

    // Progress bar just below the sprinkler head
    if (sp.lighterT > 0 && !sp.active) {
      const pct = sp.lighterT / lighterTime;
      ctx.fillStyle = '#880000'; ctx.fillRect(bx-1, by+8, 10, 4);
      ctx.fillStyle = '#2a0000'; ctx.fillRect(bx, by+9, 8, 2);
      ctx.fillStyle = '#cc1100'; ctx.fillRect(bx, by+9, Math.round(8 * pct), 2);
    }

    // Proximity dashed border — same floor only
    if (!allSprinklers && !sp.active) {
      const pdFloor = player.y > (MY+GY)/2 ? 'GY' : player.y > (TY+MY)/2 ? 'MY' : 'TY';
      if (!sp.floor || sp.floor === pdFloor) {
        const pdx = Math.abs(player.x + PW/2 - sp.x - 4);
        const pdy = Math.abs(player.y - sp.y);
        if (pdx < 16 && pdy < 50) {
          ctx.strokeStyle = '#FF6600'; ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          const _ds = CONFIG.vis.dashed.sprinklers; ctx.strokeRect(bx+_ds.x, by+_ds.y, _ds.w, _ds.h);
          ctx.setLineDash([]);
        }
      }
    }
  }

  // Lighter flame above Marco when shaking near a sprinkler
  if (player.shaking && levelMechanics.activateSprinkler) {
    const fx = Math.round(player.x + PW/2 - 1);
    const fy = Math.round(player.y) - 4;
    const flicker = Math.floor(frame / 2) % 3;
    ctx.fillStyle = '#FF6600'; ctx.fillRect(fx, fy - flicker,     2, 3);
    ctx.fillStyle = C.yellow;  ctx.fillRect(fx, fy - flicker - 2, 2, 2);
  }
}

function drawBins() {
  for (let i = 0; i < bins.length; i++) {
    const b = bins[i];
    const bx = Math.round(b.x), by = Math.round(b.y);

    if (b.exploded) {
      // Charred debris
      ctx.fillStyle = '#2a1a00'; ctx.fillRect(bx-2, by-5, 13, 5);
      ctx.fillStyle = '#444';    ctx.fillRect(bx-4, by-7,  3, 2);
      ctx.fillStyle = '#444';    ctx.fillRect(bx+11,by-8,  3, 2);
      ctx.fillStyle = '#333';    ctx.fillRect(bx+2, by-9,  2, 3);
      continue;
    }

    // Lid
    ctx.fillStyle = '#1a7a1a'; ctx.fillRect(bx, by-14, 10, 3);
    ctx.fillStyle = '#0d4d0d'; ctx.fillRect(bx+1, by-15, 8, 1); // top rim
    // Body
    ctx.fillStyle = '#228B22'; ctx.fillRect(bx, by-11, 10, 11);
    ctx.fillStyle = '#1a6e1a'; ctx.fillRect(bx, by-11, 1, 11); // left shadow
    // Dark green border (overwrite existing edge pixels, no external expansion)
    ctx.fillStyle = '#0d4d0d';
    ctx.fillRect(bx,   by-14, 1,  14); // left
    ctx.fillRect(bx+9, by-14, 1,  14); // right
    ctx.fillRect(bx,   by-1,  10,  1); // bottom

    // Triangle (vertex up) as recycle symbol
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(bx+4, by-9, 2, 1); // top vertex
    ctx.fillRect(bx+3, by-8, 4, 1); // middle
    ctx.fillRect(bx+2, by-7, 6, 1); // base

    // Fuse animation (speeds up as timer runs out)
    if (b.lit) {
      const speed = b.fuseT > 90 ? 8 : b.fuseT > 40 ? 5 : 2;
      if (Math.floor(frame / speed) % 2 === 0) {
        ctx.fillStyle = '#FF6600'; ctx.fillRect(bx+4, by-16, 2, 3);
        ctx.fillStyle = C.yellow;  ctx.fillRect(bx+4, by-17, 2, 1);
      }
      // Fuse countdown bar
      const pct = b.fuseT / 180;
      ctx.fillStyle = '#880000'; ctx.fillRect(bx-2, by-25, 14, 4);
      ctx.fillStyle = '#2a0000'; ctx.fillRect(bx-1, by-24, 12, 2);
      ctx.fillStyle = '#cc1100'; ctx.fillRect(bx-1, by-24, Math.round(12 * pct), 2);
    }

    // Proximity dashed border
    if (!allBins && !b.lit) {
      const pdx = Math.abs(player.x + PW/2 - b.x - 5);
      const pdy = Math.abs(player.y + PH  - b.y - 7);
      if (pdx < 16 && pdy < 20) {
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        const _dbn = CONFIG.vis.dashed.bins; ctx.strokeRect(bx+_dbn.x, by+_dbn.y, _dbn.w, _dbn.h);
        ctx.setLineDash([]);
      }
    }
  }
}

function drawSink() {
  if (!sink) return;
  const bx = Math.round(sink.x), by = Math.round(sink.y);
  const fy = Math.round(MY - walkOffset + 1); // floor level

  // Water puddle on floor — starts past the wall (x=12), grows rightward
  if (sink.waterLevel > 0) {
    const wx = 12; // left offset to avoid drawing over the wall
    const rights = [0, 62, 107, 130]; // level 3: water spills into corridor
    const w = Math.max(0, rights[sink.waterLevel] - wx);
    // Perspective wedge (angled near origin)
    ctx.fillStyle = 'rgba(30,90,200,0.22)';
    ctx.fillRect(wx, fy-2, Math.min(w, 8), 2);
    // Main body
    ctx.fillStyle = 'rgba(30,90,200,0.28)';
    ctx.fillRect(wx, fy, w, 4);
    // Bright top edge (reflection)
    ctx.fillStyle = 'rgba(100,170,255,0.55)';
    ctx.fillRect(wx, fy, w, 1);
    // Animated ripple lines
    ctx.fillStyle = 'rgba(130,200,255,0.5)';
    const rOff = Math.floor(frame / 6) % 12;
    for (let rx = wx + rOff; rx < wx + w; rx += 12) ctx.fillRect(rx, fy+2, 5, 1);
  }

  // Mirror — small, centered over the 12px-wide basin (bx+1 to bx+11)
  ctx.fillStyle = '#1a3a5c'; ctx.fillRect(bx+1, by-20, 10,  8); // dark frame
  ctx.fillStyle = '#7ab8d8'; ctx.fillRect(bx+2, by-19,  8,  6); // glass
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(bx+3, by-18, 2, 3); // highlight

  // Tap (wall pipe below mirror gap)
  ctx.fillStyle = '#777'; ctx.fillRect(bx+5, by-10, 2, 3);
  ctx.fillStyle = '#aaa'; ctx.fillRect(bx+4, by-10, 1, 1);

  // Sink basin
  ctx.fillStyle = '#666'; ctx.fillRect(bx-1, by-9, 14, 10);
  ctx.fillStyle = '#b0b0b0'; ctx.fillRect(bx,   by-8, 12, 8);
  ctx.fillStyle = '#d8d8d8'; ctx.fillRect(bx+1, by-7, 10, 6);
  ctx.fillStyle = '#888';    ctx.fillRect(bx+5, by-2,  2, 1); // drain

  // Dripping animation while pouring
  if (sink.pourT > 0) {
    const drop = Math.floor(frame / 3) % 5;
    ctx.fillStyle = '#4488cc';
    ctx.fillRect(bx+5, by-8+drop, 2, 2);
    if (drop >= 3) {
      ctx.fillStyle = 'rgba(68,136,204,0.6)';
      ctx.fillRect(bx+3, by-3, 2, 1); ctx.fillRect(bx+7, by-3, 2, 1);
    }
  }

  // Progress bar (left of sink) while pouring
  if (sink.pourT > 0) {
    const pct = sink.pourT / floodTime;
    ctx.fillStyle = '#880000'; ctx.fillRect(bx+2, by-26, 9, 5);
    ctx.fillStyle = '#2a0000'; ctx.fillRect(bx+3, by-25, 7, 3);
    ctx.fillStyle = '#cc1100'; ctx.fillRect(bx+3, by-25, Math.round(7 * pct), 3);
  }

  // Proximity dashed border — tight around basin only
  if (!allSink && sink.pourCount < 3 && sink.waterLevel === 0) {
    const pdx = Math.abs(player.x + PW/2 - sink.x - 6);
    const pdy = Math.abs(player.y + PH  - sink.y - 10);
    if (pdx < 14 && pdy < 20) {
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      const _dsk = CONFIG.vis.dashed.sink; ctx.strokeRect(bx+_dsk.x, by+_dsk.y, _dsk.w, _dsk.h);
      ctx.setLineDash([]);
    }
  }
}

function drawStudents() {
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const wobble = s.shakeT > 0 ? Math.round(Math.sin(s.shakeT * 0.9) * 2) : 0;
    const bx = Math.round(s.x + 5) + wobble; // shake offset when hit
    const by = Math.round(s.y);
    if (CONFIG.vis.char.outline) {
      const so = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-so, by-17-so, 5+so*2, 9+so*2);
      ctx.fillRect(bx-3-so, by-8-so,  7+so*2, 6+so*2);
      ctx.fillRect(bx-4-so, by-3-so,  2+so*2, 3+so*2);
      ctx.fillRect(bx+2-so, by-3-so,  2+so*2, 3+so*2);
    }
    ctx.fillStyle = C.brown;
    ctx.fillRect(bx-2, by-17, 5, 2);
    ctx.fillStyle = C.pink;
    ctx.fillRect(bx-2, by-15, 5, 7);
    ctx.fillStyle = C.black;
    ctx.fillRect(bx-2, by-13, 2, 2); // eye facing left (toward board)
    ctx.fillStyle = C.white;
    ctx.fillRect(bx-3, by-8, 7, 6);  // shirt
    ctx.fillStyle = C.pink;
    ctx.fillRect(bx-4, by-3, 2, 3);  // left hand
    ctx.fillRect(bx+2, by-3, 2, 3);  // right hand
    if (s.disturbed) {
      ctx.fillStyle = '#FF2222';
      ctx.save(); ctx.textAlign = 'center';
      ctx.font = '8px ' + FF;
      ctx.fillText('!', bx+4, by-19);
      ctx.restore();
    }
  }
}

function drawPaperBalls() {
  for (let i = 0; i < paperBalls.length; i++) {
    const b = paperBalls[i];
    ctx.fillStyle = C.white; ctx.fillRect(Math.round(b.x), Math.round(b.y), 3, 3);
    ctx.fillStyle = C.lgray; ctx.fillRect(Math.round(b.x)+1, Math.round(b.y)+1, 1, 1);
  }
}

function drawBags() {
  for (let i = 0; i < bags.length; i++) {
    const b = bags[i];
    if (b.collected) continue;
    ctx.fillStyle = C.bagborder; ctx.fillRect(b.x, b.y, 14, 10);
    ctx.fillStyle = C.bagbody;   ctx.fillRect(b.x+1, b.y+1, 12, 8);
    ctx.fillStyle = C.bagborder; ctx.fillRect(b.x+4, b.y-3, 6, 3);
    ctx.fillRect(b.x+6, b.y+3, 2, 4);

    // Progressbar hold-to-steal
    if (b.stealT > 0) {
      const pct = b.stealT / bagStealTime;
      ctx.fillStyle = '#880000'; ctx.fillRect(b.x-1, b.y-8, 16, 5);
      ctx.fillStyle = '#2a0000'; ctx.fillRect(b.x,   b.y-7, 14, 3);
      ctx.fillStyle = '#cc1100'; ctx.fillRect(b.x,   b.y-7, Math.round(14 * pct), 3);
    }

    // Proximity dashed border
    if (levelMechanics.stealBags && !allBags) {
      const pdx = Math.abs(player.x + PW/2 - b.x - 7);
      const pdy = Math.abs(player.y + PH  - b.y - 10);
      if (pdx < 14 && pdy < 14) {
        ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        const _dbg = CONFIG.vis.dashed.bags; ctx.strokeRect(b.x+_dbg.x, b.y+_dbg.y, _dbg.w, _dbg.h);
        ctx.setLineDash([]);
      }
    }
  }
}

function drawMachines() {
  for (let i = 0; i < machines.length; i++) {
    const m = machines[i];
    const wobble = (!m.broken && m.shakeT > 0) ? Math.round(Math.sin(frame * 1.5) * 1) : 0;
    const mx = Math.round(m.x) + wobble, my = Math.round(m.y);

    ctx.fillStyle = C.blue;   ctx.fillRect(mx,   my,    10, 18); // body
    ctx.fillStyle = m.broken ? C.dgray : C.lgreen;
                              ctx.fillRect(mx+1, my+1,   8,  6); // screen
    if (!m.broken) {
      ctx.fillStyle = C.blue; ctx.fillRect(mx+4, my+2,   2,  4); // can icon on screen
    }
    ctx.fillStyle = C.mgray;  ctx.fillRect(mx,   my+7,  10,  1); // divider
    ctx.fillStyle = C.lblue;  ctx.fillRect(mx+1, my+8,   8,  6); // button panel bg
    ctx.fillStyle = C.red;    ctx.fillRect(mx+2, my+9,   2,  2); // button A
    ctx.fillStyle = C.yellow; ctx.fillRect(mx+5, my+9,   2,  2); // button B
    ctx.fillStyle = C.lgreen; ctx.fillRect(mx+2, my+12,  2,  2); // button C
    ctx.fillStyle = C.black;  ctx.fillRect(mx+3, my+15,  4,  1); // coin slot
    if (m.broken) {
      ctx.fillStyle = C.black; ctx.fillRect(mx+2, my+14, 5, 3);  // open hatch
    }

    // Progress bar while shaking
    if (!m.broken && m.shakeT > 0) {
      const pct = m.shakeT / shakeTime;
      ctx.fillStyle = '#880000'; ctx.fillRect(mx-2, my-9, 14, 5);
      ctx.fillStyle = '#2a0000'; ctx.fillRect(mx-1, my-8, 12, 3);
      ctx.fillStyle = '#cc1100'; ctx.fillRect(mx-1, my-8, Math.round(12 * pct), 3);
    }

    // Proximity highlight (dashed border)
    if (!m.broken && !allMachines) {
      const pdx = Math.abs(player.x + PW/2 - m.x - 5);
      const pdy = Math.abs(player.y + PH  - m.y - 18);
      if (pdx < 14 && pdy < 20) {
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        const _dm = CONFIG.vis.dashed.machines; ctx.strokeRect(mx+_dm.x, my+_dm.y, _dm.w, _dm.h);
        ctx.setLineDash([]);
      }
    }
  }
}

function drawPreside(x, y, dir, animT, bodyCol, chasing, knockedT) {
  const bx = Math.round(x), by = Math.round(y);

  if (knockedT > 0) {
    const fy = by + PH - 1;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-4, fy+2, 18, 2);
    if (CONFIG.vis.char.outline) {
      const s = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-s, fy-3-s, 14+s*2, 4+s*2);
      ctx.fillRect((dir>0 ? bx+12 : bx-6)-s, fy-4-s, 6+s*2, 5+s*2);
      ctx.fillRect((dir>0 ? bx-4 : bx+8)-s, fy-2-s, 4+s*2, 3+s*2);
    }
    ctx.fillStyle = bodyCol; ctx.fillRect(bx-2, fy-3, 14, 4);
    ctx.fillStyle = C.pink;  ctx.fillRect(dir > 0 ? bx+12 : bx-6, fy-4, 6, 5);
    ctx.fillStyle = C.blue;  ctx.fillRect(dir > 0 ? bx-4 : bx+8, fy-2, 4, 3);
    return;
  }

  const leg = Math.sin(animT) * 2.5;

  // Shadow slightly wider for heavier build
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-2, by+PH, PW+4, 2);

  if (CONFIG.vis.char.outline) {
    const s = CONFIG.vis.char.outlineSize || 1;
    const fX = dir>0 ? bx-2 : bx+PW;
    const bkX = dir>0 ? bx+PW : bx-2;
    ctx.fillStyle = CONFIG.vis.char.outlineColor;
    ctx.fillRect(bx+1-s, by+10-s, 3+s*2, 4+leg+s*2);
    ctx.fillRect(bx+4-s, by+10-s, 3+s*2, 4-leg+s*2);
    ctx.fillRect(bx-s,   by+13+leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx+3-s, by+13-leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx-1-s, by+2-s, PW+2+s*2, 8+s*2);
    ctx.fillRect(fX-s, by+5-s, 2+s*2, 9+s*2);
    ctx.fillRect(bkX-s, by+5-s, 2+s*2, 9+s*2);
    ctx.fillRect(bx+2-s, by+1-s, PW-4+s*2, 1+s*2);
    ctx.fillRect(bx+1-s, by-8-s, PW-2+s*2, 10+s*2);
  }

  // Legs — same as teacher
  ctx.fillStyle = C.blue;
  ctx.fillRect(bx+1, by+10, 3, 4+leg);
  ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = C.black;
  ctx.fillRect(bx,   by+13+leg, 4, 2);
  ctx.fillRect(bx+3, by+13-leg, 4, 2);

  // Body 2px wider — no tie
  ctx.fillStyle = bodyCol;
  ctx.fillRect(bx-1, by+2, PW+2, 8);

  // Long sleeves: jacket colour + white shirt cuff + pink hand
  const frontX = dir > 0 ? bx-2 : bx+PW;
  const backX  = dir > 0 ? bx+PW : bx-2;
  ctx.fillStyle = bodyCol;
  ctx.fillRect(frontX, by+5, 2, 7);
  ctx.fillRect(backX,  by+5, 2, 7);
  ctx.fillStyle = C.white;          // cuff
  ctx.fillRect(frontX, by+11, 2, 1);
  ctx.fillRect(backX,  by+11, 2, 1);
  ctx.fillStyle = C.pink;           // hand
  ctx.fillRect(frontX, by+12, 2, 2);
  ctx.fillRect(backX,  by+12, 2, 2);

  // Head
  ctx.fillStyle = C.pink;  ctx.fillRect(bx+1, by-7, PW-2, 8);
  ctx.fillStyle = C.white; ctx.fillRect(bx+1, by-8, PW-2, 2); // white hair — older
  ctx.fillStyle = C.black; ctx.fillRect(dir > 0 ? bx+4 : bx+2, by-5, 2, 2); // eye, no glasses
  ctx.fillStyle = C.pink;  ctx.fillRect(bx+2, by+1, PW-4, 1);

  if (chasing) {
    const bub = dir > 0 ? bx+PW : bx-26;
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(bub, by-14, 26, 10);
    ctx.fillStyle = C.black; ctx.font = '4px ' + FF;
    ctx.fillText(STRINGS.hey, bub+1, by-7);
  }
}

function drawChar(x, y, dir, animT, bodyCol, isTeacher, spraying, chasing, knockedT) {
  const bx = Math.round(x), by = Math.round(y);

  // Knocked-down state — draw teacher lying flat on floor
  if (isTeacher && knockedT > 0) {
    const fy = by + PH - 1; // floor level
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-4, fy+2, 18, 2); // shadow
    if (CONFIG.vis.char.outline) {
      const s = CONFIG.vis.char.outlineSize || 1;
      ctx.fillStyle = CONFIG.vis.char.outlineColor;
      ctx.fillRect(bx-2-s, fy-3-s, 14+s*2, 4+s*2);
      ctx.fillRect((dir>0 ? bx+12 : bx-6)-s, fy-4-s, 6+s*2, 5+s*2);
      ctx.fillRect((dir>0 ? bx-4 : bx+8)-s, fy-2-s, 4+s*2, 3+s*2);
    }
    ctx.fillStyle = bodyCol; ctx.fillRect(bx-2, fy-3, 14, 4); // body horizontal
    ctx.fillStyle = C.pink;  ctx.fillRect(dir > 0 ? bx+12 : bx-6, fy-4, 6, 5); // head
    ctx.fillStyle = C.blue;  ctx.fillRect(dir > 0 ? bx-4 : bx+8, fy-2, 4, 3);  // feet
    return;
  }

  const leg = Math.sin(animT) * 2.5;

  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx-1, by+PH, PW, 2);

  if (CONFIG.vis.char.outline) {
    const s = CONFIG.vis.char.outlineSize || 1;
    ctx.fillStyle = CONFIG.vis.char.outlineColor;
    ctx.fillRect(bx+1-s, by+10-s, 3+s*2, 4+leg+s*2);
    ctx.fillRect(bx+4-s, by+10-s, 3+s*2, 4-leg+s*2);
    ctx.fillRect(bx-s,   by+13+leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx+3-s, by+13-leg-s, 4+s*2, 2+s*2);
    ctx.fillRect(bx-s, by+2-s, PW+s*2, 8+s*2);
    ctx.fillRect((dir>0 ? bx-2 : bx+PW)-s, by+5-s, 2+s*2, 4+s*2);
    ctx.fillRect((dir>0 ? bx+PW : bx-2)-s, by+5-s, 2+s*2, 4+s*2);
    if (!isTeacher) ctx.fillRect((dir>0 ? bx-3 : bx+PW)-s, by+2-s, 3+s*2, 6+s*2);
    ctx.fillRect(bx+2-s, by+1-s, PW-4+s*2, 1+s*2);
    ctx.fillRect(bx+1-s, by-8-s, PW-2+s*2, 10+s*2);
  }

  ctx.fillStyle = isTeacher ? C.blue : C.mgray;
  ctx.fillRect(bx+1, by+10, 3, 4+leg);
  ctx.fillRect(bx+4, by+10, 3, 4-leg);
  ctx.fillStyle = C.black;
  ctx.fillRect(bx,   by+13+leg, 4, 2);
  ctx.fillRect(bx+3, by+13-leg, 4, 2);

  ctx.fillStyle = bodyCol; ctx.fillRect(bx, by+2, PW, 8);
  if (isTeacher) { ctx.fillStyle = C.yellow; ctx.fillRect(bx+3, by+2, 2, 6); }
  else { ctx.fillStyle = C.lblue; ctx.fillRect(bx+1, by+2, 1, 8); ctx.fillRect(bx+5, by+2, 1, 8); }

  ctx.fillStyle = C.pink;
  ctx.fillRect(dir>0 ? bx-2 : bx+PW, by+5, 2, 4);
  ctx.fillRect(dir>0 ? bx+PW : bx-2, by+5, 2, 4);

  ctx.fillStyle = C.pink; ctx.fillRect(bx+1, by-7, PW-2, 8);
  ctx.fillStyle = isTeacher ? C.lgray : C.brown; ctx.fillRect(bx+1, by-8, PW-2, 2);
  ctx.fillStyle = C.black; ctx.fillRect(dir>0 ? bx+4 : bx+2, by-5, 2, 2);
  ctx.fillStyle = '#825144'; ctx.fillRect(bx+2, by+1, PW-4, 1);

  if (spraying) {
    const sx = dir>0 ? bx+PW+2 : bx-6;
    ctx.fillStyle = '#005050'; ctx.fillRect(sx-1, by+2, 6, 7); // dark outline
    ctx.fillStyle = C.cyan;   ctx.fillRect(sx,   by+3, 4, 5); // can
    for (let i = 0; i < 8; i++) {
      const t = (frame * 5 + i * 11) % 19;
      const dist = 2 + i * 2 + (t % 3);
      const oy = Math.round(((t % 5) - 2) * (1 + i / 4));
      const lift = Math.round(dist * 0.35);
      ctx.fillStyle = 'rgba(140,220,140,' + (0.9 - i * 0.09).toFixed(2) + ')';
      ctx.fillRect(sx + (dir>0 ? 4+dist : -1-dist), by+5+oy-lift, 1, 1);
    }
  }
  if (!isTeacher) { ctx.fillStyle = '#3e3e3e'; ctx.fillRect(dir>0 ? bx-3 : bx+PW, by+2, 3, 6); }

  if (chasing) {
    const bub = dir>0 ? bx+PW : bx-26;
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(bub, by-14, 26, 10);
    ctx.fillStyle = C.black; ctx.font = '4px ' + FF;
    ctx.fillText(STRINGS.hey, bub+1, by-7);
  }
}

// Draw a character clipped to exclude the floor band [bandTop, bandBottom].
// Used when Marco is on a stair and his body crosses a floor.
function drawCharClipped(x, y, dir, animT, bodyCol, isTeacher, spraying, chasing, knockedT, bandTop, bandBottom) {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, bandTop); ctx.clip();
  drawChar(x, y, dir, animT, bodyCol, isTeacher, spraying, chasing, knockedT);
  ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.rect(0, bandBottom, W, H - bandBottom); ctx.clip();
  drawChar(x, y, dir, animT, bodyCol, isTeacher, spraying, chasing, knockedT);
  ctx.restore();
}

function drawJanitor(x, y, dir, animT) {
  drawChar(x, y, dir, animT, C.mgray, false, false, false);
  const bx = Math.round(x), by = Math.round(y);
  const mx = dir > 0 ? bx+PW : bx-1;
  if (CONFIG.vis.char.outline) {
    const s = CONFIG.vis.char.outlineSize || 1;
    ctx.fillStyle = CONFIG.vis.char.outlineColor;
    ctx.fillRect(bx+1-s, by-9-s, PW-2+s*2, 3+s*2);
    ctx.fillRect((dir>0 ? bx+PW-1 : bx-1)-s, by-7-s, 3+s*2, 1+s*2);
    ctx.fillRect(mx-s, by+4-s, 1+s*2, 12+s*2);
    ctx.fillRect(mx-1-s, by+14-s, 3+s*2, 2+s*2);
    ctx.fillRect(mx-2-s, by+16-s, 5+s*2, 1+s*2);
  }
  ctx.fillStyle = C.blue;
  ctx.fillRect(bx+1, by-9, PW-2, 3);
  ctx.fillRect(dir>0 ? bx+PW-1 : bx-1, by-7, 3, 1);
  ctx.fillStyle = C.brown;
  ctx.fillRect(mx, by+4, 1, 12);
  ctx.fillStyle = C.lgray;
  ctx.fillRect(mx-1, by+14, 3, 2);
  ctx.fillStyle = C.white;
  ctx.fillRect(mx-2, by+16, 5, 1);
}

function drawSight() {
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    if (t.chasing || t.name === 'Guardiano') continue; // guards have no visible sight cone
    ctx.fillStyle = 'rgba(255,200,0,0.18)';
    const rx = t.dir>0 ? t.x+PW : t.x-t.sight;
    ctx.fillRect(rx, t.y-2, t.sight, PH+4);
  }
}

function drawLucaEnd() {
  if (!exitDone || !levelMechanics.escapeExit || state === 'win') return;
  // Luca stands at the exit door
  const lx = Math.round(exitDoor.x) + 1;
  const ly = Math.round(GY - PH - walkOffset);
  drawChar(lx, ly, 1, 0, C.white, false, false, false, 0);

  // Speech bubble — bh computed from CONFIG.vis.lucaFumetto
  const VF = CONFIG.vis.lucaFumetto;
  ctx.font = VF.fontBody + 'px ' + FF;
  const raw = STRINGS.lucaAppears.replace(/^[^"]*"?/, '').replace(/".*$/, '');
  const parts = raw.split('|');
  let lines = [];
  for (let p = 0; p < parts.length; p++) {
    const words = parts[p].trim().split(' ');
    let cur = '';
    for (let i = 0; i < words.length; i++) {
      const test = cur + (cur ? ' ' : '') + words[i];
      if (ctx.measureText(test).width > VF.bw - 8) { if (cur) lines.push(cur); cur = words[i]; }
      else cur = test;
    }
    if (cur) lines.push(cur);
  }
  const lineCount = Math.min(lines.length, 4);
  const bh = VF.headerH + lineCount * VF.lineH + VF.gapTap + VF.tapH + VF.padBottom;
  const bx = lx + VF.offsetX, by2 = ly - VF.tailOffY - bh;
  ctx.fillStyle = C.gold; ctx.fillRect(bx, by2, VF.bw, bh);
  ctx.strokeStyle = '#aa7700'; ctx.lineWidth = 1;
  ctx.strokeRect(bx, by2, VF.bw, bh);
  ctx.fillStyle = C.gold; ctx.fillRect(bx, by2 + bh, VF.tailW, VF.tailH);
  ctx.strokeStyle = '#aa7700'; ctx.strokeRect(bx, by2 + bh, VF.tailW, VF.tailH);
  ctx.fillStyle = '#000'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Luca:', bx + 4, by2 + 4);
  for (let i = 0; i < lineCount; i++) {
    ctx.fillStyle = i === lineCount - 1 ? C.redprof : '#000';
    ctx.fillText(lines[i], bx + 4, by2 + VF.headerH + i * VF.lineH);
  }
  const tapY = by2 + VF.headerH + lineCount * VF.lineH + VF.gapTap;
  const blink = Math.floor(frame / 25) % 2 === 0;
  ctx.fillStyle = blink ? '#554400' : 'rgba(0,0,0,0)';
  ctx.textAlign = 'center';
  ctx.fillText(STRINGS.tapContinue, bx + VF.bw / 2, tapY);
  ctx.textAlign = 'left';
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

function drawOverlayPanel(bx, by, bw, bh, bgColor, borderColor, lines) {
  _dialogPanel(bx, by, bw, bh, bgColor);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let totalHeight = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].visible === false) continue;
    totalHeight += lines[i].height || 10;
    if (i < lines.length - 1) totalHeight += lines[i].spacing != null ? lines[i].spacing : 4;
  }
  let y = by + Math.round((bh - totalHeight) / 2);
  const x = bx + bw / 2;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.visible === false) continue;
    ctx.font = line.font;
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, x, y);
    y += (line.height || 10) + (line.spacing != null ? line.spacing : 4);
  }
  ctx.restore();
}

function drawEndScreen() {
  if (state !== 'win' && state !== 'gameover') return;
  const fadeAlpha = Math.min(1, endScreenT / 20);
  ctx.save();
  ctx.globalAlpha = fadeAlpha;
  const bx = Math.round(W / 2 - CONFIG.vis.gameover.panW / 2);
  const isWin = state === 'win';
  const scoreText = STRINGS.scoreLabel + String(score).padStart(5, '0');
  const actionText = isWin
    ? (currentLevel < LEVELS.length ? STRINGS.reloadNext : STRINGS.reloadWin)
    : STRINGS.reloadLose;
  const actionVisible = Math.floor(frame / 20) % 2 === 0;

  if (!isWin) {
    const VG = CONFIG.vis.gameover;
    const _gH = VG.padTop + VG.stepTitle + VG.stepLevel + VG.stepScore + VG.stepConfirm + VG.btnH + VG.padBottom;
    const {bx:gX, by:gY} = _panPos(VG.panW, _gH);
    _dialogPanel(gX, gY, VG.panW, _gH, VG.panBg);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cx = gX + VG.panW / 2;
    let ty = gY + VG.padTop;
    ctx.font = VG.fontTitle + 'px ' + FF;
    ctx.fillStyle = C.redprof; ctx.fillText(STRINGS.gameoverTitle,                  cx, ty); ty += VG.stepTitle;
    ctx.font = VG.fontBody + 'px ' + FF;
    ctx.fillStyle = C.white;   ctx.fillText(fmt(STRINGS.levelReached, currentLevel), cx, ty); ty += VG.stepLevel;
    ctx.fillStyle = C.white;   ctx.fillText(scoreText,                               cx, ty); ty += VG.stepScore;
    ctx.fillStyle = C.gold;    ctx.fillText(STRINGS.gameoverConfirm,                 cx, ty); ty += VG.stepConfirm;
    ctx.font = VG.fontBtn + 'px ' + FF;
    const siX = gX + VG.siOx, noX = gX + VG.noOx;
    _dialogBtn(siX, ty, VG.siW, VG.btnH, CONFIG.vis.dialog.btnColorYes);
    ctx.fillStyle = C.white; ctx.fillText(STRINGS.btnYes, siX + VG.siW/2, ty + Math.floor((VG.btnH - VG.fontBtn) / 2));
    _dialogBtn(noX, ty, VG.noW, VG.btnH, CONFIG.vis.dialog.btnColorNo);
    ctx.fillStyle = C.white; ctx.fillText(STRINGS.btnNo, noX + VG.noW/2, ty + Math.floor((VG.btnH - VG.fontBtn) / 2));
  } else if (currentLevel === LEVELS.length) {
    const bestScore = parseInt(localStorage.getItem('btr_best_score') || '0');
    const bestLevel = parseInt(localStorage.getItem('btr_best_level') || '1');
    const VW = CONFIG.vis.gameWin;
    const _wH = VW.padTop + VW.stepTitle + VW.stepScore + VW.stepBest + VW.tapH + VW.padBottom;
    const {bx:wX, by:wY} = _panPos(VW.panW, _wH);
    _dialogPanel(wX, wY, VW.panW, _wH, VW.panBg);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cxW = wX + VW.panW / 2;
    let tyW = wY + VW.padTop;
    ctx.font = VW.fontTitle + 'px ' + FF;
    ctx.fillStyle = C.gold;   ctx.fillText(STRINGS.winTitle, cxW, tyW); tyW += VW.stepTitle;
    ctx.font = VW.fontBody + 'px ' + FF;
    ctx.fillStyle = C.white;  ctx.fillText(scoreText, cxW, tyW); tyW += VW.stepScore;
    ctx.fillStyle = C.yellow; ctx.fillText(STRINGS.bestLabel + ' LVL ' + bestLevel + ' — ' + String(bestScore).padStart(5,'0'), cxW, tyW); tyW += VW.stepBest;
    ctx.fillStyle = actionVisible ? C.gold : 'rgba(0,0,0,0)'; ctx.fillText(STRINGS.tapForTitle, cxW, tyW);
  } else {
    const VL = CONFIG.vis.levelComplete;
    const _lH = VL.padTop + VL.stepTitle + VL.stepScore + VL.tapH + VL.padBottom;
    const {bx:lX, by:lY} = _panPos(VL.panW, _lH);
    _dialogPanel(lX, lY, VL.panW, _lH, VL.panBg);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cxL = lX + VL.panW / 2;
    let tyL = lY + VL.padTop;
    ctx.font = VL.fontTitle + 'px ' + FF;
    ctx.fillStyle = C.gold;  ctx.fillText(STRINGS.levelComplete, cxL, tyL); tyL += VL.stepTitle;
    ctx.font = VL.fontBody + 'px ' + FF;
    ctx.fillStyle = C.white; ctx.fillText(scoreText, cxL, tyL); tyL += VL.stepScore;
    ctx.fillStyle = actionVisible ? C.green : 'rgba(0,0,0,0)'; ctx.fillText(STRINGS.tapContinue, cxL, tyL);
  }
  ctx.restore();
}

function drawStoryBanner() {
  if (storyBannerT <= 0 || state !== 'playing') return;
  if (!storyBannerLines) {
    ctx.font = CONFIG.vis.storyBanner.fontBody + 'px ' + FF;
    const parts = STRINGS.storyText.split('|');
    let lines = [];
    for (let p = 0; p < parts.length; p++) {
      const words = parts[p].trim().split(' ');
      let line = '';
      for (let i = 0; i < words.length; i++) {
        const test = line + (line ? ' ' : '') + words[i];
        if (ctx.measureText(test).width > CONFIG.vis.storyBanner.wrapWidth) { lines.push(line); line = words[i]; }
        else line = test;
      }
      if (line) lines.push(line);
    }
    storyBannerLines = lines;
  }
  const storyPanelAlpha = storyBannerFading ? Math.max(0, storyBannerT / 20) : Math.min(1, storyFadeInT / 40);
  ctx.save();
  ctx.globalAlpha = storyPanelAlpha;
  const VS = CONFIG.vis.storyBanner;
  const bw = VS.panW;
  const _stLineH = storyBannerLines.length * VS.lineH + Math.max(0, storyBannerLines.length - 1) * VS.lineSpacing;
  const bh = VS.padTop + VS.titleH + VS.titleSpacing + _stLineH + VS.spacerH + VS.tapH + VS.padBottom;
  const {bx, by} = _panPos(bw, bh);
  _dialogPanel(bx, by, bw, bh, VS.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VS.fontTitle + 'px ' + FF;
  const cxSt = bx + bw / 2;
  let tySt = by + VS.padTop;
  ctx.fillStyle = C.gold;  ctx.fillText(STRINGS.storyTitle, cxSt, tySt); tySt += VS.titleH + VS.titleSpacing;
  ctx.font = VS.fontBody + 'px ' + FF;
  ctx.fillStyle = C.white;
  for (let i = 0; i < storyBannerLines.length; i++) {
    ctx.fillText(storyBannerLines[i], cxSt, tySt);
    tySt += VS.lineH + (i < storyBannerLines.length - 1 ? VS.lineSpacing : VS.spacerH);
  }
  const blink = Math.floor(frame / 25) % 2 === 0;
  ctx.fillStyle = blink ? C.gold : 'rgba(0,0,0,0)'; ctx.fillText(STRINGS.tapContinue, cxSt, tySt);
  ctx.restore();
}

function drawMissionBanner() {
  if (missionBannerT <= 0 || state !== 'playing') return;
  if (!missionBannerLines) {
    ctx.font = CONFIG.vis.missionBanner.fontBody + 'px ' + FF;
    const text = STRINGS['mission' + currentLevel] || STRINGS.mission1;
    const words = text.split(' ');
    let line = '', lines = [];
    for (let i = 0; i < words.length; i++) {
      const test = line + (line ? ' ' : '') + words[i];
      if (ctx.measureText(test).width > CONFIG.vis.missionBanner.wrapWidth) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    missionBannerLines = lines;
  }
  const alpha = missionBannerT < 40 ? missionBannerT / 40 : missionBannerT > 170 ? (210 - missionBannerT) / 40 : 1;
  const VM = CONFIG.vis.missionBanner;
  const bw = VM.panW;
  const _msLineH = missionBannerLines.length * VM.lineH + Math.max(0, missionBannerLines.length - 1) * VM.lineSpacing;
  const bh = VM.padTop + VM.titleH + VM.titleSpacing + _msLineH + VM.padBottom;
  const {bx, by} = _panPos(bw, bh);
  ctx.save();
  ctx.globalAlpha = alpha;
  _dialogPanel(bx, by, bw, bh, VM.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VM.fontTitle + 'px ' + FF;
  const cxM = bx + bw / 2;
  let tyM = by + VM.padTop;
  ctx.fillStyle = C.gold;  ctx.fillText(fmt(STRINGS.missionLabel, currentLevel), cxM, tyM); tyM += VM.titleH + VM.titleSpacing;
  ctx.font = VM.fontBody + 'px ' + FF;
  ctx.fillStyle = C.white;
  for (let i = 0; i < missionBannerLines.length; i++) {
    ctx.fillText(missionBannerLines[i], cxM, tyM);
    if (i < missionBannerLines.length - 1) tyM += VM.lineH + VM.lineSpacing;
  }
  ctx.restore();
}

function drawPauseOverlay() {
  if (state !== 'paused' || !_pauseActive) return;
  ctx.save();
  const VP = CONFIG.vis.pauseOverlay;
  const pH = VP.padTop + VP.stepTitle + VP.btnH + VP.padBottom;
  const {bx, by} = _panPos(VP.panW, pH);
  _dialogPanel(bx, by, VP.panW, pH, VP.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VP.fontTitle + 'px ' + FF;
  const cx = bx + VP.panW / 2;
  let ty = by + VP.padTop;
  ctx.fillStyle = C.gold; ctx.fillText(STRINGS.pauseTitle, cx, ty); ty += VP.stepTitle;
  ctx.font = VP.fontBtn + 'px ' + FF;
  const rx = bx + VP.resumeOx;
  _dialogBtn(rx, ty, VP.resumeW, VP.btnH, CONFIG.vis.dialog.btnColorYes);
  ctx.fillStyle = C.white; ctx.fillText(STRINGS.btnResume, rx + VP.resumeW/2, ty + Math.floor((VP.btnH - VP.fontBtn) / 2));
  ctx.restore();
}

function drawHomeConfirm() {
  if (!_homeConfirmActive) return;
  ctx.save();
  const VH = CONFIG.vis.homeConfirm;
  const hH = VH.padTop + VH.stepTitle + VH.btnH + VH.padBottom;
  const {bx, by} = _panPos(VH.panW, hH);
  _dialogPanel(bx, by, VH.panW, hH, VH.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VH.fontTitle + 'px ' + FF;
  const cx = bx + VH.panW / 2;
  let ty = by + VH.padTop;
  ctx.fillStyle = C.gold; ctx.fillText(STRINGS.homeConfirm, cx, ty); ty += VH.stepTitle;
  ctx.font = VH.fontBtn + 'px ' + FF;
  const siX = bx + VH.siOx, noX = bx + VH.noOx;
  _dialogBtn(siX, ty, VH.siW, VH.btnH, CONFIG.vis.dialog.btnColorYes);
  ctx.fillStyle = C.white; ctx.fillText(STRINGS.btnYes, siX + VH.siW/2, ty + Math.floor((VH.btnH - VH.fontBtn) / 2));
  _dialogBtn(noX, ty, VH.noW, VH.btnH, CONFIG.vis.dialog.btnColorNo);
  ctx.fillStyle = C.white; ctx.fillText(STRINGS.btnNo, noX + VH.noW/2, ty + Math.floor((VH.btnH - VH.fontBtn) / 2));
  ctx.restore();
}

function drawDebugOverlay() {
  if (!DEBUG) return;
  ctx.save();
  ctx.font = '4px monospace';
  ctx.textAlign = 'left';

  [{y:TY, label:'TY='+TY}, {y:MY, label:'MY='+MY}, {y:GY, label:'GY='+GY}].forEach(function(fl) {
    ctx.strokeStyle = 'rgba(255,255,0,0.7)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(0, fl.y); ctx.lineTo(W, fl.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(1, fl.y-6, 26, 7);
    ctx.fillStyle = '#FFFF00'; ctx.fillText(fl.label, 2, fl.y-1);
  });

  [107, 213].forEach(function(dx) {
    ctx.strokeStyle = 'rgba(0,200,255,0.6)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(dx+1, 2, 20, 7);
    ctx.fillStyle = '#00E8FF'; ctx.fillText('x='+dx, dx+2, 8);
  });

  stairs.forEach(function(s, i) {
    var lx = Math.min(s.x1,s.x2), rx = Math.max(s.x1,s.x2);
    var ty = Math.min(s.y1,s.y2), by2 = Math.max(s.y1,s.y2);
    ctx.fillStyle = 'rgba(255,120,0,0.22)';
    ctx.fillRect(lx-2, ty, rx-lx+4, by2-ty);
    ctx.strokeStyle = 'rgba(255,140,0,0.85)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(lx-2, ty, rx-lx+4, by2-ty);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(lx-2, ty-8, 55, 7);
    ctx.fillStyle = '#FF9900';
    ctx.fillText('S'+i+' ('+s.x1+','+s.y1+')→('+s.x2+','+s.y2+')', lx-1, ty-2);
    ctx.fillStyle = '#FF4400';
    ctx.fillRect(s.x1-1, s.y1-1, 3, 3);
    ctx.fillRect(s.x2-1, s.y2-1, 3, 3);
  });

  bags.forEach(function(b) {
    ctx.strokeStyle = 'rgba(100,100,255,0.9)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(b.x, b.y, 14, 10);
    ctx.fillStyle = '#8888FF'; ctx.fillText('bag', b.x, b.y-2);
  });

  BOARDS.forEach(function(b) {
    ctx.strokeStyle = 'rgba(0,255,80,0.85)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(b.x, b.y, BW, BH);
    ctx.fillStyle = '#00FF50'; ctx.fillText('brd', b.x, b.y-2);
  });

  DESKS.forEach(function(d) {
    ctx.strokeStyle = 'rgba(255,220,0,0.65)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(d.x, d.y, 20, 11);
  });

  ctx.strokeStyle = 'rgba(255,215,0,0.9)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(BELL.x-2, BELL.y-1, 10, 9);
  ctx.fillStyle = '#FFD700'; ctx.fillText('bell', BELL.x-2, BELL.y-2);

  ctx.strokeStyle = 'rgba(255,80,255,0.9)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(player.x, player.y, PW, PH);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(player.x, player.y-8, 36, 7);
  ctx.fillStyle = '#FF66FF';
  ctx.fillText('P('+Math.round(player.x)+','+Math.round(player.y)+')', player.x+1, player.y-2);

  ctx.restore();
}

function _panPos(panW, panH) {
  return { bx: Math.round((W - panW) / 2), by: Math.round((H - panH) / 2) };
}

function _drawHeart(x, y, s) {
  s = s || 1;
  if (s < 0.5) {
    // Tiny: 4×3px
    ctx.fillRect(x,   y,   1, 1); ctx.fillRect(x+2, y,   1, 1);
    ctx.fillRect(x,   y+1, 4, 1);
    ctx.fillRect(x+1, y+2, 2, 1);
    return;
  }
  if (s < 1) {
    // Medium: 7×5px with tip — one full row, then taper to point
    ctx.fillRect(x+1, y,   2, 1); ctx.fillRect(x+4, y,   2, 1);
    ctx.fillRect(x,   y+1, 7, 1);
    ctx.fillRect(x+1, y+2, 5, 1);
    ctx.fillRect(x+2, y+3, 3, 1);
    ctx.fillRect(x+3, y+4, 1, 1);
    return;
  }
  s = Math.max(1, Math.round(s));
  ctx.fillRect(x+1*s,y,    2*s,s); ctx.fillRect(x+5*s,y,    2*s,s);
  ctx.fillRect(x,    y+1*s,8*s,s); ctx.fillRect(x,    y+2*s,8*s,s); ctx.fillRect(x,y+3*s,8*s,s);
  ctx.fillRect(x+1*s,y+4*s,6*s,s); ctx.fillRect(x+2*s,y+5*s,4*s,s); ctx.fillRect(x+3*s,y+6*s,2*s,s);
}

// Pixel-art icons for HUD mechanic indicator — 7×7 base, scale via iconScale
function _drawHudIcon(type, x, y, color, s) {
  s = s || 1;
  if (s < 0.5) {
    // Tiny: solid 4×4px dot
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), 4, 4);
    return;
  }
  if (s < 1) {
    // Medium: 6×5px hollow rectangle
    ctx.fillStyle = color;
    var ix = Math.round(x), iy = Math.round(y);
    ctx.fillRect(ix,   iy,   6, 1); // top
    ctx.fillRect(ix,   iy+4, 6, 1); // bottom
    ctx.fillRect(ix,   iy+1, 1, 3); // left
    ctx.fillRect(ix+5, iy+1, 1, 3); // right
    return;
  }
  s = Math.max(1, Math.round(s));
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (s !== 1) ctx.scale(s, s);
  ctx.fillStyle = color;
  switch (type) {
    case 'boards':   // board: 7×7 outline + 2 chalk lines
      ctx.fillRect(0,1, 7,1); ctx.fillRect(0,6, 7,1);
      ctx.fillRect(0,1, 1,5); ctx.fillRect(6,1, 1,5);
      ctx.fillStyle = '#fff'; ctx.fillRect(1,2, 5,1); ctx.fillRect(1,4, 5,1);
      break;
    case 'bags':     // bag: body + handle
      ctx.fillRect(2,0, 3,1);
      ctx.fillRect(0,1, 7,1); ctx.fillRect(0,6, 7,1);
      ctx.fillRect(0,2, 1,4); ctx.fillRect(6,2, 1,4);
      ctx.fillStyle = '#2A1F5E'; ctx.fillRect(2,3, 3,1);
      break;
    case 'machines': // vending machine: rectangle with screen and button
      ctx.fillRect(0,0, 6,7);
      ctx.fillStyle = '#000';    ctx.fillRect(1,1, 4,2);
      ctx.fillStyle = '#FFD700'; ctx.fillRect(2,5, 2,1);
      break;
    case 'ball':     // ball: circle with seams
      ctx.fillRect(1,0, 5,1); ctx.fillRect(1,6, 5,1);
      ctx.fillRect(0,1, 7,5);
      ctx.fillStyle = '#000'; ctx.fillRect(3,1, 1,5); ctx.fillRect(1,3, 5,1);
      break;
    case 'students': // student: head + body + legs
      ctx.fillRect(2,0, 3,3);
      ctx.fillRect(1,3, 5,2);
      ctx.fillRect(1,5, 2,2); ctx.fillRect(4,5, 2,2);
      break;
    case 'books':    // book: rectangle with spine and lines
      ctx.fillRect(0,0, 7,7);
      ctx.fillStyle = '#000'; ctx.fillRect(1,0, 1,7);
      ctx.fillStyle = '#fff'; ctx.fillRect(2,2, 4,1); ctx.fillRect(2,4, 4,1);
      break;
    case 'sink':     // sink: drops + basin
      ctx.fillRect(1,0, 1,2); ctx.fillRect(5,0, 1,2);
      ctx.fillRect(0,3, 7,1); ctx.fillRect(0,6, 7,1);
      ctx.fillRect(0,4, 1,2); ctx.fillRect(6,4, 1,2);
      break;
    case 'bins':     // bin: lid + body + fuse
      ctx.fillRect(1,1, 5,1);
      ctx.fillRect(0,2, 7,5);
      ctx.fillStyle = '#FFD700'; ctx.fillRect(3,0, 1,2);
      ctx.fillStyle = '#000';    ctx.fillRect(2,4, 1,2); ctx.fillRect(4,4, 1,2);
      break;
    case 'sprinklers': // sprinkler: flame silhouette
      ctx.fillRect(3,0, 1,1);
      ctx.fillRect(2,1, 3,1); ctx.fillRect(1,2, 5,2);
      ctx.fillRect(0,4, 7,1); ctx.fillRect(1,5, 5,1); ctx.fillRect(2,6, 3,1);
      break;
    case 'register': // register: book with golden corner
      ctx.fillRect(0,0, 7,7);
      ctx.fillStyle = '#000';    ctx.fillRect(1,1, 5,1); ctx.fillRect(1,3, 5,1); ctx.fillRect(1,5, 3,1);
      ctx.fillStyle = '#FFD700'; ctx.fillRect(5,5, 2,2);
      break;
    default:
      ctx.fillRect(0,0, 7,7);
  }
  ctx.restore();
}

function _hudObjInfo() {
  var done = 0, total = 0, mechanic = 'boards';
  var dc = CONFIG.vis.hud.dotColors;
  if (bags.length > 0) {
    for (var i=0;i<bags.length;i++) if(bags[i].collected) done++; total=bags.length; mechanic='bags';
  } else if (levelMechanics.shakeMachines) {
    for (var i=0;i<machines.length;i++) if(machines[i].broken) done++; total=machines.length; mechanic='machines';
  } else if (levelMechanics.deflateBall) {
    done=gymBall?gymBall.deflateCount:0; total=3; mechanic='ball';
  } else if (levelMechanics.throwPaper) {
    for (var i=0;i<students.length;i++) if(students[i].disturbed) done++; total=students.length; mechanic='students';
  } else if (levelMechanics.dropBook) {
    done=bookcase?bookcase.dropCount:0; total=3; mechanic='books';
  } else if (levelMechanics.floodSink) {
    done=sink?sink.pourCount:0; total=3; mechanic='sink';
  } else if (levelMechanics.plantBomb) {
    for (var i=0;i<bins.length;i++) if(bins[i].exploded) done++; total=bins.length; mechanic='bins';
  } else if (levelMechanics.stealRegister) {
    done=register&&register.stolen?1:0; total=1; mechanic='register';
  } else if (levelMechanics.activateSprinkler) {
    for (var i=0;i<sprinklers.length;i++) if(sprinklers[i].active) done++; total=sprinklers.length; mechanic='sprinklers';
  } else {
    for (var i=0;i<BOARDS.length;i++) if(BOARDS[i].done) done++; total=BOARDS.length; mechanic='boards';
  }
  return { done:done, total:total, color:dc[mechanic]||'#44ee66', mechanic:mechanic };
}

function drawHUD() {
  if (state === 'title') return;
  var VH = CONFIG.vis.hud;
  ctx.save();
  var _f = VH.fontSize + 'px ' + FF;
  var _hs = VH.heartSize || 1;  // 1 = 8×7px | 0.5 = 4×3px (small)
  var _ds = VH.iconScale || 1;  // 1 = 7×7px | 0.5 = 4×4px (small)
  var _heartH    = _hs < 0.5 ? 3 : _hs < 1 ? 5 : 7 * Math.max(1, Math.round(_hs));
  var _heartW    = _hs < 0.5 ? 4 : _hs < 1 ? 7 : 8 * Math.max(1, Math.round(_hs));
  var _iconSz    = _ds < 0.5 ? 4 : _ds < 1 ? 5 : 7 * Math.max(1, Math.round(_ds));
  var _heartStep = _heartW + 1;
  var _textY  = Math.floor((VH.rowH - VH.fontSize) / 2);
  var _heartY = Math.floor((VH.rowH - _heartH) / 2);
  var _iconY  = Math.floor((VH.rowH - _iconSz)  / 2);
  ctx.fillStyle = VH.bgColor; ctx.fillRect(0, 0, W, VH.rowH);
  ctx.font = _f; ctx.textBaseline = 'top';
  // Smooth crossfade: _hudMsgAlpha approaches 1 or 0 at fixed speed,
  // independent of msgT — no flicker when messages cycle rapidly
  var _fadeSpeed = 1 / (VH.msgFadeFrames || 45);
  var _targetAlpha = msgT > 0 ? 1 : 0;
  if (_hudMsgAlpha < _targetAlpha) _hudMsgAlpha = Math.min(_targetAlpha, _hudMsgAlpha + _fadeSpeed);
  else if (_hudMsgAlpha > _targetAlpha) _hudMsgAlpha = Math.max(_targetAlpha, _hudMsgAlpha - _fadeSpeed);
  var _hudAlpha = 1 - _hudMsgAlpha;

  // Message — visible at _hudMsgAlpha
  if (_hudMsgAlpha > 0) {
    ctx.globalAlpha = _hudMsgAlpha;
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    ctx.fillText(msgText, VH.centerX, _textY);
  }

  // Hearts + score + counter — visible at _hudAlpha
  if (_hudAlpha > 0) {
    ctx.globalAlpha = _hudAlpha;
    ctx.fillStyle = '#ff2244';
    for (var _i = 0; _i < Math.max(0, lives); _i++) _drawHeart(VH.heartsX + _i * _heartStep, _heartY, _hs);
    ctx.textAlign = 'right'; ctx.fillStyle = '#ffffff';
    ctx.fillText(String(score).padStart(5,'0'), VH.scoreX, _textY);
    var _oi = _hudObjInfo();
    var _txt = _oi.done + '/' + _oi.total;
    if (_txt !== _hudTxtCache.txt) { _hudTxtCache.txt = _txt; _hudTxtCache.w = ctx.measureText(_txt).width; }
    var _grpW = _iconSz + VH.dotGap + _hudTxtCache.w;
    var _sx = Math.round(VH.centerX - _grpW / 2);
    _drawHudIcon(_oi.mechanic, _sx, _iconY, _oi.color, _ds);
    ctx.textAlign = 'left'; ctx.fillStyle = '#44ee66';
    ctx.fillText(_txt, _sx + _iconSz + VH.dotGap, _textY);
  }
  // Timer bar — always at full opacity, excluded from the crossfade
  ctx.globalAlpha = 1;
  if (maxTimerTicks > 0) {
    var _pct = Math.max(0, timerTicks / maxTimerTicks);
    ctx.fillStyle = _pct > 0.6 ? '#22cc44' : _pct > 0.3 ? '#ddcc00' : '#dd1100';
    ctx.fillRect(0, VH.rowH, Math.round(W * _pct), VH.timerH);
  }
  ctx.restore();
}

var _CREDITS_MEMBERS = [
  { name: 'Luca Forina',        role: 'Orchestrator'         },
  { name: 'Claude / Anthropic', role: 'Lead Developer'       },
  { name: 'ChatGPT',            role: 'Graphics'             },
  { name: 'OpenGameArt.org',    role: 'Music & Effects'      },
  { name: 'Family',             role: 'Beta Testing & Ideas' },
];

function drawCredits() {
  if (!_creditsActive) return;
  ctx.save();
  var VC = CONFIG.vis.credits;
  var n = _CREDITS_MEMBERS.length;
  var panH = VC.padTop + VC.stepTitle + VC.stepTeam
           + n * (VC.nameH + VC.nameGap + VC.roleH + VC.roleGap)
           + VC.btnGapAbove + VC.btnH + VC.padBottom;
  var _cp = _panPos(VC.panW, panH); var bx = _cp.bx, by = _cp.by;
  _dialogPanel(bx, by, VC.panW, panH, VC.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  var cx = bx + VC.panW / 2;
  var ty = by + VC.padTop;
  ctx.font = VC.fontTitle + 'px ' + FF; ctx.fillStyle = C.gold;
  ctx.fillText('— CREDITS —', cx, ty); ty += VC.stepTitle;
  ctx.font = VC.fontBody + 'px ' + FF; ctx.fillStyle = C.lgreen;
  ctx.fillText('LucazadeSoft Team', cx, ty); ty += VC.stepTeam;
  for (var i = 0; i < n; i++) {
    ctx.fillStyle = C.white; ctx.fillText(_CREDITS_MEMBERS[i].name, cx, ty); ty += VC.nameH + VC.nameGap;
    ctx.fillStyle = C.cyan;  ctx.fillText(_CREDITS_MEMBERS[i].role, cx, ty); ty += VC.roleH + VC.roleGap;
  }
  ty += VC.btnGapAbove;
  var btnX = bx + Math.round((VC.panW - VC.btnW) / 2);
  ctx.font = VC.fontBtn + 'px ' + FF;
  _dialogBtn(btnX, ty, VC.btnW, VC.btnH, CONFIG.vis.dialog.btnColorYes);
  ctx.fillStyle = C.white; ctx.fillText('OK', bx + VC.panW/2, ty + Math.floor((VC.btnH - VC.fontBtn) / 2));
  ctx.restore();
}

