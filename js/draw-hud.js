// HUD rendering — hearts, score, mechanic counter, timer bar

var _hudMsgAlpha = 0; // HUD crossfade alpha: rises to 1 when a message is active, falls back to 0 otherwise
var _hudTxtCache = { txt: null, w: 0 }; // cached measureText for HUD counter (e.g. "4/4")

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
        ctx.fillStyle=PAL.dotBoardsHighlight; ctx.fillRect(1,2,5,1); ctx.fillRect(1,4,5,1);
        break;
      case 'bags':
        ctx.fillRect(2,0,3,1);
        ctx.fillRect(0,1,7,1); ctx.fillRect(0,5,7,1);
        ctx.fillRect(0,2,1,3); ctx.fillRect(6,2,1,3);
        ctx.fillStyle=PAL.dotBagsStripe; ctx.fillRect(2,3,3,1);
        break;
      case 'machines':
        ctx.fillRect(0,0,6,1);
        ctx.fillRect(0,1,1,2); ctx.fillRect(5,1,1,2);
        ctx.fillRect(0,3,6,1);
        ctx.fillRect(0,4,2,1); ctx.fillRect(4,4,2,1);
        ctx.fillRect(0,5,6,1);
        break;
      case 'ball':
        ctx.fillRect(1,0,2,1); ctx.fillRect(4,0,2,1);
        ctx.fillRect(0,1,3,2); ctx.fillRect(4,1,3,2);
        ctx.fillRect(0,4,3,1); ctx.fillRect(4,4,3,1);
        ctx.fillRect(1,5,2,1); ctx.fillRect(4,5,2,1);
        break;
      case 'students':
        ctx.fillRect(2,0,3,2);
        ctx.fillRect(1,2,5,2);
        ctx.fillRect(1,4,2,2); ctx.fillRect(4,4,2,2);
        break;
      case 'books':
        ctx.fillRect(0,0,1,6);
        ctx.fillRect(2,0,5,2); ctx.fillRect(2,3,5,1); ctx.fillRect(2,5,5,1);
        break;
      case 'sink':
        ctx.fillRect(1,0,1,2); ctx.fillRect(5,0,1,2);
        ctx.fillRect(0,2,7,1); ctx.fillRect(0,5,7,1);
        ctx.fillRect(0,3,1,2); ctx.fillRect(6,3,1,2);
        break;
      case 'bins':
        ctx.fillRect(1,1,5,1);
        ctx.fillRect(0,2,7,1);
        ctx.fillRect(0,3,2,2); ctx.fillRect(3,3,1,2); ctx.fillRect(5,3,2,2);
        ctx.fillRect(0,5,7,1);
        break;
      case 'sprinklers':
        ctx.fillRect(3,0,1,1);
        ctx.fillRect(2,1,3,1); ctx.fillRect(1,2,5,2);
        ctx.fillRect(0,4,7,1); ctx.fillRect(1,5,5,1);
        break;
      case 'register':
        ctx.fillRect(0,0,7,1);
        ctx.fillRect(0,1,1,1); ctx.fillRect(6,1,1,1);
        ctx.fillRect(0,2,7,1);
        ctx.fillRect(0,3,1,1); ctx.fillRect(6,3,1,1);
        ctx.fillRect(0,4,7,1);
        ctx.fillRect(0,5,5,1);
        ctx.fillStyle=PAL.dotRegisterAccent; ctx.fillRect(5,5,2,1);
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
      ctx.fillStyle = PAL.dotBoardsHighlight; ctx.fillRect(1,2, 5,1); ctx.fillRect(1,4, 5,1);
      break;
    case 'bags':     // bag: body + handle
      ctx.fillRect(2,0, 3,1);
      ctx.fillRect(0,1, 7,1); ctx.fillRect(0,6, 7,1);
      ctx.fillRect(0,2, 1,4); ctx.fillRect(6,2, 1,4);
      ctx.fillStyle = PAL.dotBagsStripe; ctx.fillRect(2,3, 3,1);
      break;
    case 'machines': // vending machine: rectangle with screen and button
      ctx.fillRect(0,0, 6,1);
      ctx.fillRect(0,1, 1,2); ctx.fillRect(5,1, 1,2);
      ctx.fillRect(0,3, 6,2);
      ctx.fillRect(0,5, 2,1); ctx.fillRect(4,5, 2,1);
      ctx.fillRect(0,6, 6,1);
      break;
    case 'ball':     // ball: circle with seams
      ctx.fillRect(1,0, 5,1);
      ctx.fillRect(0,1, 3,2); ctx.fillRect(4,1, 3,2);
      ctx.fillRect(0,3, 1,1); ctx.fillRect(6,3, 1,1);
      ctx.fillRect(0,4, 3,2); ctx.fillRect(4,4, 3,2);
      ctx.fillRect(1,6, 5,1);
      break;
    case 'students': // student: head + body + legs
      ctx.fillRect(2,0, 3,3);
      ctx.fillRect(1,3, 5,2);
      ctx.fillRect(1,5, 2,2); ctx.fillRect(4,5, 2,2);
      break;
    case 'books':    // book: rectangle with spine and lines
      ctx.fillRect(0,0, 1,7);
      ctx.fillRect(2,0, 5,2); ctx.fillRect(2,3, 5,1); ctx.fillRect(2,5, 5,2);
      break;
    case 'sink':     // sink: drops + basin
      ctx.fillRect(1,0, 1,2); ctx.fillRect(5,0, 1,2);
      ctx.fillRect(0,3, 7,1); ctx.fillRect(0,6, 7,1);
      ctx.fillRect(0,4, 1,2); ctx.fillRect(6,4, 1,2);
      break;
    case 'bins':     // bin: lid + body
      ctx.fillRect(1,1, 5,1);
      ctx.fillRect(0,2, 7,2);
      ctx.fillRect(0,4, 2,2); ctx.fillRect(3,4, 1,2); ctx.fillRect(5,4, 2,2);
      ctx.fillRect(0,6, 7,1);
      break;
    case 'sprinklers': // sprinkler: flame silhouette
      ctx.fillRect(3,0, 1,1);
      ctx.fillRect(2,1, 3,1); ctx.fillRect(1,2, 5,2);
      ctx.fillRect(0,4, 7,1); ctx.fillRect(1,5, 5,1); ctx.fillRect(2,6, 3,1);
      break;
    case 'register': // register: book with golden corner
      ctx.fillRect(0,0, 7,1);
      ctx.fillRect(0,1, 1,1); ctx.fillRect(6,1, 1,1);
      ctx.fillRect(0,2, 7,1);
      ctx.fillRect(0,3, 1,1); ctx.fillRect(6,3, 1,1);
      ctx.fillRect(0,4, 7,1);
      ctx.fillRect(0,5, 5,1);
      ctx.fillStyle = PAL.dotRegisterAccent; ctx.fillRect(5,5, 2,2);
      ctx.fillStyle = color; ctx.fillRect(0,6, 5,1);
      break;
    default:
      ctx.fillRect(0,0, 7,7);
  }
  ctx.restore();
}

function _hudObjInfo() {
  var done = 0, total = 0, mechanic = 'boards';
  var dc = CONFIG.ui.hud.dotColors;
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
  return { done:done, total:total, color:dc[mechanic]||PAL.hudCounter, mechanic:mechanic };
}

function drawHUD() {
  if (state === 'title') return;
  var VH = CONFIG.ui.hud;
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
    ctx.fillStyle = PAL.hudText; ctx.textAlign = 'center';
    ctx.fillText(msgText, VH.centerX, _textY);
  }

  // Hearts + score + counter — visible at _hudAlpha
  if (_hudAlpha > 0) {
    ctx.globalAlpha = _hudAlpha;
    ctx.fillStyle = PAL.hearts;
    for (var _i = 0; _i < Math.max(0, lives); _i++) _drawHeart(VH.heartsX + _i * _heartStep, _heartY, _hs);
    ctx.textAlign = 'right'; ctx.fillStyle = PAL.hudText;
    ctx.fillText(String(score).padStart(5,'0'), VH.scoreX, _textY);
    if (bonusActive) {
      // Bonus HUD: "CARAMBOLE: N | +N VITE  +NNNNN PTS"
      ctx.font = _f; ctx.textAlign = 'center';
      // "CARAMBOLE: " in label color, count N in count color
      var _bLabelTxt = STRINGS.bonusCaramboleLabel;
      var _bCountTxt = String(bonusCarambole);
      var _bScore  = bonusBonusScore  > 0 ? fmt(STRINGS.bonusScoreLabel,  bonusBonusScore)  : '';
      var _blLabelW = ctx.measureText(_bLabelTxt).width;
      var _blCountW = ctx.measureText(_bCountTxt).width;
      var _blW = _blLabelW + _blCountW;
      var _brW = _bScore ? ctx.measureText('  |  ' + _bScore).width : 0;
      var _bsx = Math.round(VH.centerX - (_blW + _brW) / 2);
      ctx.textAlign = 'left';
      ctx.fillStyle = PAL.bonusHudLabel; ctx.fillText(_bLabelTxt, _bsx, _textY);
      ctx.fillStyle = PAL.bonusHudCount; ctx.fillText(_bCountTxt, _bsx + _blLabelW, _textY);
      if (_bScore) {
        ctx.fillStyle = PAL.hudText;
        ctx.fillText('  |  ', _bsx + _blW, _textY);
        ctx.fillStyle = PAL.bonusHudScore;
        ctx.fillText(_bScore, _bsx + _blW + ctx.measureText('  |  ').width, _textY);
      }
    } else {
      var _oi = _hudObjInfo();
      var _txt = _oi.done + '/' + _oi.total;
      if (_txt !== _hudTxtCache.txt) { _hudTxtCache.txt = _txt; _hudTxtCache.w = ctx.measureText(_txt).width; }
      var _lvlTxt = fmt(STRINGS.hudLevel, currentLevel);
      var _lvlW = ctx.measureText(_lvlTxt).width;
      var _sepW = 1;  // separator line width
      var _sepGap = 4; // gap on each side of separator
      var _grpW = _lvlW + _sepGap + _sepW + _sepGap + _iconSz + VH.dotGap + _hudTxtCache.w;
      var _sx = Math.round(VH.centerX - _grpW / 2);
      ctx.textAlign = 'left'; ctx.fillStyle = PAL.hudText;
      ctx.fillText(_lvlTxt, _sx, _textY);
      var _sepX = _sx + _lvlW + _sepGap;
      ctx.fillStyle = PAL.hudText; ctx.globalAlpha = _hudAlpha * 0.4;
      ctx.fillRect(_sepX, 1, _sepW, VH.rowH - 2);
      ctx.globalAlpha = _hudAlpha;
      var _iconX = _sepX + _sepW + _sepGap;
      _drawHudIcon(_oi.mechanic, _iconX, _iconY, _oi.color, _ds);
      ctx.textAlign = 'left'; ctx.fillStyle = PAL.hudCounter;
      ctx.fillText(_txt, _iconX + _iconSz + VH.dotGap, _textY);
    }
  }
  // Timer bar
  ctx.globalAlpha = VH.timerAlpha !== undefined ? VH.timerAlpha : 1;
  if (maxTimerTicks > 0) {
    var _pct = Math.max(0, timerTicks / maxTimerTicks);
    ctx.fillStyle = _pct > 0.6 ? PAL.timerGreen : _pct > 0.3 ? PAL.timerYellow : PAL.timerRed;
    ctx.fillRect(0, VH.rowH, Math.round(W * _pct), VH.timerH);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
