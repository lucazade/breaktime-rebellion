// Title screen rendering

var _logoImage    = null; // loaded by game.js alongside bgImage
var _audioLblW    = null; // cached measureText for title audio labels {full, sfx, mute}
var _audioMaxLblW = 0;    // cached max of the three label widths

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

function _drawLockIcon(x, y, color) {
  // 6×6px padlock — shackle (rows 0-1) + body (rows 2-5) + transparent keyhole
  ctx.fillStyle = color;
  ctx.fillRect(x+1, y,   4, 1);  // shackle top arc
  ctx.fillRect(x,   y+1, 1, 1);  ctx.fillRect(x+5, y+1, 1, 1);  // shackle sides
  ctx.fillRect(x,   y+2, 6, 4);  // body
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillRect(x+2, y+3, 2, 2);  // keyhole cutout
  ctx.globalCompositeOperation = 'source-over';
}

function drawTitleScreen() {
  var VT = CONFIG.ui.titleScreen;
  ctx.clearRect(0, 0, W, H);

  var ct = VT.controls;

  // Logo height
  var logoW = VT.logo.w;
  var logoX = Math.round((W - logoW) / 2);
  var logoH = 0;
  if (_logoImage && _logoImage.complete && _logoImage.naturalWidth > 0) {
    logoH = Math.round(_logoImage.naturalHeight / _logoImage.naturalWidth * logoW);
  }

  // Vertical centering: compute total height of content block
  var ctrlBlockH = ct.gapY + ct.btnH;
  var totalH = logoH + ctrlBlockH;
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
      ctx.strokeStyle = PAL.logoBorder;
      ctx.lineWidth = VT.logo.borderW;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoW, logoH, r);
      ctx.stroke();
      ctx.restore();
    }
    // Pulsing glow — replaces "tap to start" as interaction invite
    if (!_titleStarting) {
      var _ga = 0.3 + 0.3 * Math.sin(frame * Math.PI / 60);
      ctx.save();
      ctx.strokeStyle = PAL.logoGlow;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = _ga;
      ctx.beginPath(); ctx.roundRect(logoX-3, logoY-3, logoW+6, logoH+6, r+3); ctx.stroke();
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = _ga * 0.45;
      ctx.beginPath(); ctx.roundRect(logoX-6, logoY-6, logoW+12, logoH+12, r+6); ctx.stroke();
      ctx.restore();
    }
  }

  ctx.save();
  try {
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';

  // Controls row
  var ctrlY = logoY + logoH + ct.gapY;
  _titleCtrlY = ctrlY;
  ctx.font = ct.fontSize + 'px ' + FF;

  ctx.lineWidth = 1;
  var ctrlTextY = ctrlY + Math.floor((ct.btnH - ct.fontSize) / 2) + 1; // vertical text centering
  var r = ct.boxR;
  function _box(x, y, w, color) {
    ctx.strokeStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, ct.btnH, r); ctx.stroke();
  }

  // Level chooser
  if (LEVELS.length > 1) {
    var prevColor = currentLevel <= 1 ? PAL.btnDisabled : ct.btnColor;
    _box(ct.prevX, ctrlY, ct.prevW, prevColor);
    ctx.fillStyle = prevColor; ctx.fillText('<', ct.prevX + ct.prevW/2, ctrlTextY);

    ctx.fillStyle = PAL.gold;
    ctx.fillText(STRINGS.levelLabel + ' ' + currentLevel, ct.labelX, ctrlTextY);

    var atCeiling = currentLevel >= _btrMax, moreExist = _btrMax < LEVELS.length;
    if (atCeiling && moreExist) {
      _box(ct.nextX, ctrlY, ct.nextW, PAL.levelLocked);
      _drawLockIcon(ct.nextX + Math.floor((ct.nextW - 6) / 2), ctrlY + Math.floor((ct.btnH - 6) / 2), PAL.levelLocked);
    } else {
      var nextColor = (atCeiling && !moreExist) ? PAL.btnDisabled : ct.btnColor;
      _box(ct.nextX, ctrlY, ct.nextW, nextColor);
      ctx.fillStyle = nextColor; ctx.fillText('>', ct.nextX + ct.nextW/2, ctrlTextY);
    }
  }

  // Difficulty toggle — centered between level chooser and audio
  var diffColor = gameDifficulty === 'hard' ? PAL.diffHard : gameDifficulty === 'medium' ? PAL.diffMedium : PAL.diffEasy;
  _box(ct.diffX, ctrlY, ct.diffW, diffColor);
  ctx.fillStyle = diffColor; ctx.textAlign = 'center';
  ctx.fillText(STRINGS['difficulty_' + gameDifficulty] || gameDifficulty.toUpperCase(), ct.diffX + ct.diffW / 2, ctrlTextY);
  ctx.textAlign = 'center';

  // Audio toggle — fixed width based on the longest label across all modes
  var audioMode = GameAudio.getMode();
  var audioColor = audioMode==='full' ? PAL.audioFull : audioMode==='sfx' ? PAL.audioSfx : PAL.audioMute;
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
  _drawVolumeIcon(_blockX, ctrlY + Math.floor((ct.btnH - 4) / 2) + 2, audioMode, audioColor);
  ctx.fillStyle = audioColor; ctx.textAlign = 'left';
  ctx.fillText(audioLabel, _blockX + _iconW + _gap, ctrlTextY);
  ctx.textAlign = 'center';

  } finally {
    ctx.restore();
  }
}
