// Rendering — all draw functions and HUD update

var _logoImage = null; // loaded by game.js alongside bgImage
function resetBgCache() { _bgCache = null; }
var FF = CONFIG.vis.fontFamily;  // font family shortcut — editable in layout.js
var _hudMsgAlpha = 0; // HUD crossfade alpha: rises to 1 when a message is active, falls back to 0 otherwise
var _bgCache    = null; // offscreen canvas: bgImage pre-scaled to CV size, rebuilt on first draw
var _desksCache = null; // offscreen canvas: all desks pre-rendered at physical resolution
var _bellGlowCache  = null; // offscreen canvas: bell glow circle at r=7, drawn once
var _boardsCache    = null; // offscreen canvas: all boards (static + done state), keyed by _boardsCacheKey
var _boardsCacheKey = null; // serialized done states e.g. "0101" — rebuild on change
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
  var ctrlTextY = ctrlY + Math.floor((ct.btnH - ct.fontSize) / 2) + 1; // vertical text centering
  var r = ct.boxR;
  function _box(x, y, w, color) {
    ctx.strokeStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, ct.btnH, r); ctx.stroke();
  }

  // Level chooser
  if (LEVELS.length > 1) {
    var prevColor = currentLevel <= 1 ? C.dgray : ct.btnColor;
    _box(ct.prevX, ctrlY, ct.prevW, prevColor);
    ctx.fillStyle = prevColor; ctx.fillText('<', ct.prevX + ct.prevW/2, ctrlTextY);

    ctx.fillStyle = C.gold;
    ctx.fillText(STRINGS.levelLabel + ' ' + currentLevel, ct.labelX, ctrlTextY);

    var atCeiling = currentLevel >= _btrMax, moreExist = _btrMax < LEVELS.length;
    if (atCeiling && moreExist) {
      _box(ct.nextX, ctrlY, ct.nextW, C.yellow);
      _drawLockIcon(ct.nextX + Math.floor((ct.nextW - 6) / 2), ctrlY + Math.floor((ct.btnH - 6) / 2), C.yellow);
    } else {
      var nextColor = (atCeiling && !moreExist) ? C.dgray : ct.btnColor;
      _box(ct.nextX, ctrlY, ct.nextW, nextColor);
      ctx.fillStyle = nextColor; ctx.fillText('>', ct.nextX + ct.nextW/2, ctrlTextY);
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
  _drawVolumeIcon(_blockX, ctrlY + Math.floor((ct.btnH - 4) / 2) + 2, audioMode, audioColor);
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
    var twCre=ctx.measureText(STRINGS.keyCredits||'credits').width;
    var totalLW = _kw('<')+1+_kw('^')+1+_kw('v')+1+_kw('>') + ks+twMov + ks+_kw('Z')+ks+twAct + ks+_kw('C')+ks+twCre + ks+_kw('P')+ks+twPau + ks+_kw('ESC')+ks+twHom;
    var bx = Math.round((W - totalLW) / 2);

    bx += _key(bx,'<')+1; bx += _key(bx,'^')+1; bx += _key(bx,'v')+1; bx += _key(bx,'>');
    bx += ks; ctx.fillStyle=C.lgray; ctx.textAlign='left'; ctx.fillText(STRINGS.keyMove||'move', bx, legY+1); bx += twMov;
    bx += ks; bx += _key(bx,'Z');
    bx += ks; ctx.fillStyle=C.lgray; ctx.textAlign='left'; ctx.fillText(STRINGS.keyAction||'action', bx, legY+1); bx += twAct;
    bx += ks; bx += _key(bx,'C');
    bx += ks; ctx.fillStyle=C.lgray; ctx.textAlign='left'; ctx.fillText(STRINGS.keyCredits||'credits', bx, legY+1); bx += twCre;
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
    if (window.createImageBitmap) {
      createImageBitmap(bgImage, {resizeWidth: CV.width, resizeHeight: CV.height, resizeQuality: 'high'})
        .then(function(bmp) { _bgCache = bmp; }).catch(function() {
          // fallback to offscreen canvas
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


function drawSight() {
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    if (t.chasing || t.name === 'Guardiano') continue; // guards have no visible sight cone
    ctx.fillStyle = 'rgba(255,200,0,0.18)';
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
    const _wH = VW.padTop + VW.stepTitle + VW.stepScore + (lastTimeBonus > 0 ? VW.stepBonus : 0) + (lastLivesBonus > 0 ? VW.stepBonus : 0) + VW.stepBest + VW.tapH + VW.padBottom;
    const {bx:wX, by:wY} = _panPos(VW.panW, _wH);
    _dialogPanel(wX, wY, VW.panW, _wH, VW.panBg);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cxW = wX + VW.panW / 2;
    let tyW = wY + VW.padTop;
    ctx.font = VW.fontTitle + 'px ' + FF;
    ctx.fillStyle = C.gold;   ctx.fillText(STRINGS.winTitle, cxW, tyW); tyW += VW.stepTitle;
    ctx.font = VW.fontBody + 'px ' + FF;
    if (lastTimeBonus > 0)  { ctx.fillStyle = C.cyan;  ctx.fillText(STRINGS.timeBonusLabel  + lastTimeBonus,  cxW, tyW); tyW += VW.stepBonus; }
    if (lastLivesBonus > 0) { ctx.fillStyle = C.green; ctx.fillText(STRINGS.livesBonusLabel + lastLivesBonus, cxW, tyW); tyW += VW.stepBonus; }
    ctx.fillStyle = C.white;  ctx.fillText(scoreText, cxW, tyW); tyW += VW.stepScore;
    ctx.fillStyle = C.yellow; ctx.fillText(STRINGS.bestLabel + ' LVL ' + bestLevel + ' — ' + String(bestScore).padStart(5,'0'), cxW, tyW); tyW += VW.stepBest;
    ctx.fillStyle = actionVisible ? C.gold : 'rgba(0,0,0,0)'; ctx.fillText(STRINGS.tapForTitle, cxW, tyW);
  } else {
    const VL = CONFIG.vis.levelComplete;
    const _lH = VL.padTop + VL.stepTitle + VL.stepScore + (lastTimeBonus > 0 ? VL.stepBonus : 0) + VL.tapH + VL.padBottom;
    const {bx:lX, by:lY} = _panPos(VL.panW, _lH);
    _dialogPanel(lX, lY, VL.panW, _lH, VL.panBg);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cxL = lX + VL.panW / 2;
    let tyL = lY + VL.padTop;
    ctx.font = VL.fontTitle + 'px ' + FF;
    ctx.fillStyle = C.gold;  ctx.fillText(STRINGS.levelComplete, cxL, tyL); tyL += VL.stepTitle;
    ctx.font = VL.fontBody + 'px ' + FF;
    if (lastTimeBonus > 0) { ctx.fillStyle = C.cyan; ctx.fillText(STRINGS.timeBonusLabel + lastTimeBonus, cxL, tyL); tyL += VL.stepBonus; }
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
    // Medium: 7×6px — two full rows then taper to point
    ctx.fillRect(x+1, y,   2, 1); ctx.fillRect(x+4, y,   2, 1);
    ctx.fillRect(x,   y+1, 7, 1);
    ctx.fillRect(x,   y+2, 7, 1);
    ctx.fillRect(x+1, y+3, 5, 1);
    ctx.fillRect(x+2, y+4, 3, 1);
    ctx.fillRect(x+3, y+5, 1, 1);
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
    // Small: dedicated 7×6px pixel-art per mechanic (7×7 originals, 1px shorter)
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.fillStyle = color;
    switch (type) {
      case 'boards':
        ctx.fillRect(0,0,7,1); ctx.fillRect(0,5,7,1);
        ctx.fillRect(0,1,1,4); ctx.fillRect(6,1,1,4);
        ctx.fillStyle='#fff'; ctx.fillRect(1,2,5,1); ctx.fillRect(1,4,5,1);
        break;
      case 'bags':
        ctx.fillRect(2,0,3,1);
        ctx.fillRect(0,1,7,1); ctx.fillRect(0,5,7,1);
        ctx.fillRect(0,2,1,3); ctx.fillRect(6,2,1,3);
        ctx.fillStyle='#2A1F5E'; ctx.fillRect(2,3,3,1);
        break;
      case 'machines':
        ctx.fillRect(0,0,6,6);
        ctx.fillStyle='#000';    ctx.fillRect(1,1,4,2);
        ctx.fillStyle='#FFD700'; ctx.fillRect(2,4,2,1);
        break;
      case 'ball':
        ctx.fillRect(1,0,5,1); ctx.fillRect(1,5,5,1);
        ctx.fillRect(0,1,7,4);
        ctx.fillStyle='#000'; ctx.fillRect(3,0,1,6); ctx.fillRect(0,3,7,1);
        break;
      case 'students':
        ctx.fillRect(2,0,3,2);
        ctx.fillRect(1,2,5,2);
        ctx.fillRect(1,4,2,2); ctx.fillRect(4,4,2,2);
        break;
      case 'books':
        ctx.fillRect(0,0,7,6);
        ctx.fillStyle='#000'; ctx.fillRect(1,0,1,6);
        ctx.fillStyle='#fff'; ctx.fillRect(2,2,4,1); ctx.fillRect(2,4,4,1);
        break;
      case 'sink':
        ctx.fillRect(1,0,1,2); ctx.fillRect(5,0,1,2);
        ctx.fillRect(0,2,7,1); ctx.fillRect(0,5,7,1);
        ctx.fillRect(0,3,1,2); ctx.fillRect(6,3,1,2);
        break;
      case 'bins':
        ctx.fillStyle='#FFD700'; ctx.fillRect(3,0,1,1);
        ctx.fillStyle=color;     ctx.fillRect(1,1,5,1); ctx.fillRect(0,2,7,4);
        ctx.fillStyle='#000';    ctx.fillRect(2,3,1,2); ctx.fillRect(4,3,1,2);
        break;
      case 'sprinklers':
        ctx.fillRect(3,0,1,1);
        ctx.fillRect(2,1,3,1); ctx.fillRect(1,2,5,2);
        ctx.fillRect(0,4,7,1); ctx.fillRect(1,5,5,1);
        break;
      case 'register':
        ctx.fillRect(0,0,7,6);
        ctx.fillStyle='#000';    ctx.fillRect(1,1,5,1); ctx.fillRect(1,3,5,1); ctx.fillRect(1,5,3,1);
        ctx.fillStyle='#FFD700'; ctx.fillRect(5,5,2,1);
        break;
      default:
        ctx.fillRect(0,0,7,6);
    }
    ctx.restore();
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
  var _heartH    = _hs < 0.5 ? 3 : _hs < 1 ? 6 : 7 * Math.max(1, Math.round(_hs));
  var _heartW    = _hs < 0.5 ? 4 : _hs < 1 ? 7 : 8 * Math.max(1, Math.round(_hs));
  var _iconSz    = _ds < 0.5 ? 4 : _ds < 1 ? 6 : 7 * Math.max(1, Math.round(_ds));
  var _heartStep = _heartW + 1;
  var _textY  = Math.round(VH.rowH / 2);
  var _heartY = Math.floor((VH.rowH - _heartH) / 2);
  var _iconY  = Math.floor((VH.rowH - _iconSz)  / 2);
  ctx.fillStyle = VH.bgColor; ctx.fillRect(0, 0, W, VH.rowH);
  ctx.font = _f; ctx.textBaseline = 'middle';
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
  // Timer bar
  ctx.globalAlpha = VH.timerAlpha !== undefined ? VH.timerAlpha : 1;
  if (maxTimerTicks > 0) {
    var _pct = Math.max(0, timerTicks / maxTimerTicks);
    ctx.fillStyle = _pct > 0.6 ? '#22cc44' : _pct > 0.3 ? '#ddcc00' : '#dd1100';
    ctx.fillRect(0, VH.rowH, Math.round(W * _pct), VH.timerH);
  }
  ctx.globalAlpha = 1;
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

