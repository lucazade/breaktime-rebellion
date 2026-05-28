// Canvas overlay panels — modals, banners, dialogs

var _CREDITS_MEMBERS = [
  { name: 'Luca Forina',        role: 'Orchestrator'         },
  { name: 'Claude / Anthropic', role: 'Lead Developer'       },
  { name: 'ChatGPT',            role: 'Graphics'             },
  { name: 'OpenGameArt.org',    role: 'Music & Effects'      },
  { name: 'Family',             role: 'Beta Testing & Ideas' },
];

function _dialogPanel(x, y, w, h, bgColor) {
  var d = CONFIG.ui.dialog;
  ctx.fillStyle = bgColor || d.panBg;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, d.panR); ctx.fill();
  ctx.strokeStyle = d.panBorder; ctx.lineWidth = d.panBorderW;
  ctx.beginPath(); ctx.roundRect(x+1, y+1, w-2, h-2, d.panR); ctx.stroke();
}

function _dialogBtn(x, y, w, h, color) {
  var d = CONFIG.ui.dialog;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, d.btnR); ctx.fill();
  ctx.strokeStyle = d.btnStroke; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x+1, y+1, w-2, h-2, d.btnR); ctx.stroke();
}

function _panPos(panW, panH) {
  return { bx: Math.round((W - panW) / 2), by: Math.round((H - panH) / 2) };
}

function drawEndScreen() {
  if (state !== 'win' && state !== 'gameover') return;
  const fadeAlpha = Math.min(1, endScreenT / 20);
  ctx.save();
  ctx.globalAlpha = fadeAlpha;
  const bx = Math.round(W / 2 - CONFIG.ui.gameover.panW / 2);
  const isWin = state === 'win';
  const scoreText = STRINGS.scoreLabel + String(score).padStart(5, '0');
  const actionVisible = Math.floor(frame / 20) % 2 === 0;

  if (!isWin) {
    const VG = CONFIG.ui.gameover;
    const _gH = VG.padTop + VG.titleH + VG.titleSpacing + VG.scoreH + VG.scoreSpacing + VG.confirmH + VG.confirmSpacing + VG.btnH + VG.padBottom;
    const {bx:gX, by:gY} = _panPos(VG.panW, _gH);
    _dialogPanel(gX, gY, VG.panW, _gH, VG.panBg);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cx = gX + VG.panW / 2;
    let ty = gY + VG.padTop;
    ctx.font = VG.fontTitle + 'px ' + FF;
    ctx.fillStyle = PAL.gameoverTitleColor; ctx.fillText(STRINGS.gameoverTitle, cx, ty); ty += VG.titleH + VG.titleSpacing;
    ctx.font = VG.fontBody + 'px ' + FF;
    ctx.fillStyle = PAL.bannerText;        ctx.fillText(scoreText,               cx, ty); ty += VG.scoreH + VG.scoreSpacing;
    ctx.fillStyle = PAL.bannerTitleColor;  ctx.fillText(STRINGS.gameoverConfirm, cx, ty); ty += VG.confirmH + VG.confirmSpacing;
    ctx.font = VG.fontBtn + 'px ' + FF;
    const siX = gX + VG.siOx, noX = gX + VG.noOx;
    _dialogBtn(siX, ty, VG.siW, VG.btnH, CONFIG.ui.dialog.btnColorYes);
    ctx.fillStyle = PAL.btnText; ctx.fillText(STRINGS.btnYes, siX + VG.siW/2, ty + Math.floor((VG.btnH - VG.fontBtn) / 2));
    _dialogBtn(noX, ty, VG.noW, VG.btnH, CONFIG.ui.dialog.btnColorNo);
    ctx.fillStyle = PAL.btnText; ctx.fillText(STRINGS.btnNo, noX + VG.noW/2, ty + Math.floor((VG.btnH - VG.fontBtn) / 2));
  } else if (currentLevel === LEVELS.length) {
    const VW = CONFIG.ui.gameWin;
    const _wBaseScore = score - lastTimeBonus - lastLivesBonus;
    const _wDELAY = 90, _wTICK = 90, _wGAP = 30;
    const _wT1 = Math.max(0, _endBonusT - _wDELAY);
    const _wTimePart = lastTimeBonus > 0 ? Math.round(lastTimeBonus * Math.min(1, _wT1 / _wTICK)) : 0;
    const _wT2 = Math.max(0, _endBonusT - _wDELAY - _wTICK - _wGAP);
    const _wLivesPart = lastLivesBonus > 0 ? Math.round(lastLivesBonus * Math.min(1, _wT2 / _wTICK)) : 0;
    const _wDispScore = _wBaseScore + _wTimePart + _wLivesPart;
    const _wTickingTime  = lastTimeBonus  > 0 && _wT1 > 0 && _wT1 < _wTICK;
    const _wTickerDone = _endBonusT >= _wDELAY + _wTICK + (lastLivesBonus > 0 ? _wGAP + _wTICK : 0);
    const _wAfterTime = lastLivesBonus > 0 && _wT1 >= _wTICK;
    const _wScoreLabel = _wTickerDone ? STRINGS.scoreLabel : (_wTickingTime ? STRINGS.timeBonusLabel : (_wAfterTime ? STRINGS.livesBonusLabel : STRINGS.scoreBaseLabel));
    const _wScoreColor = _wTickerDone ? PAL.bannerText : (_wTickingTime ? PAL.timeBonusText : (_wAfterTime ? PAL.livesBonusText : PAL.bannerText));
    const _wH = VW.padTop + VW.titleH + VW.titleSpacing + VW.scoreH + VW.scoreSpacing + VW.tapH + VW.padBottom;
    const {bx:wX, by:wY} = _panPos(VW.panW, _wH);
    _dialogPanel(wX, wY, VW.panW, _wH, VW.panBg);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cxW = wX + VW.panW / 2;
    let tyW = wY + VW.padTop;
    ctx.font = VW.fontTitle + 'px ' + FF;
    ctx.fillStyle = PAL.bannerTitleColor;   ctx.fillText(STRINGS.winTitle, cxW, tyW); tyW += VW.titleH + VW.titleSpacing;
    ctx.font = VW.fontBody + 'px ' + FF;
    ctx.fillStyle = _wScoreColor; ctx.fillText(_wScoreLabel + String(_wDispScore).padStart(5, '0'), cxW, tyW); tyW += VW.scoreH + VW.scoreSpacing;
    ctx.font = VW.fontTap + 'px ' + FF;
    ctx.fillStyle = actionVisible ? PAL.tapPromptColor : PAL.transparent; ctx.fillText(STRINGS.tapContinue, cxW, tyW);
  } else {
    const VL = CONFIG.ui.levelComplete;
    const _lBaseScore = score - lastTimeBonus;
    const _lDELAY = 90, _lTICK = 90;
    const _lT1 = Math.max(0, _endBonusT - _lDELAY);
    const _lDispScore = _lBaseScore + (lastTimeBonus > 0 ? Math.round(lastTimeBonus * Math.min(1, _lT1 / _lTICK)) : 0);
    const _lTicking = lastTimeBonus > 0 && _lT1 > 0 && _lT1 < _lTICK;
    const _lTickerDone = _endBonusT >= _lDELAY + _lTICK;
    const _lScoreLabel = _lTicking ? STRINGS.timeBonusLabel : (_lTickerDone ? STRINGS.scoreLabel : STRINGS.scoreBaseLabel);
    const _lH = VL.padTop + VL.titleH + VL.titleSpacing + VL.scoreH + VL.scoreSpacing + VL.tapH + VL.padBottom;
    const {bx:lX, by:lY} = _panPos(VL.panW, _lH);
    _dialogPanel(lX, lY, VL.panW, _lH, VL.panBg);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cxL = lX + VL.panW / 2;
    let tyL = lY + VL.padTop;
    ctx.font = VL.fontTitle + 'px ' + FF;
    ctx.fillStyle = PAL.bannerTitleColor;  ctx.fillText(STRINGS.levelComplete, cxL, tyL); tyL += VL.titleH + VL.titleSpacing;
    ctx.font = VL.fontBody + 'px ' + FF;
    ctx.fillStyle = _lTicking ? PAL.timeBonusText : PAL.bannerText;
    ctx.fillText(_lScoreLabel + String(_lDispScore).padStart(5, '0'), cxL, tyL); tyL += VL.scoreH + VL.scoreSpacing;
    ctx.font = VL.fontTap + 'px ' + FF;
    ctx.fillStyle = actionVisible ? PAL.tapPromptColor : PAL.transparent; ctx.fillText(STRINGS.tapContinue, cxL, tyL);
  }
  ctx.restore();
}

function drawStoryBanner() {
  if (storyBannerT <= 0 || state !== 'playing') return;
  if (!storyBannerLines) {
    ctx.font = CONFIG.ui.storyBanner.fontBody + 'px ' + FF;
    const parts = STRINGS.storyText.split('|');
    let lines = [];
    for (let p = 0; p < parts.length; p++) {
      const words = parts[p].trim().split(' ');
      let line = '';
      for (let i = 0; i < words.length; i++) {
        const test = line + (line ? ' ' : '') + words[i];
        if (ctx.measureText(test).width > CONFIG.ui.storyBanner.wrapWidth) { lines.push(line); line = words[i]; }
        else line = test;
      }
      if (line) lines.push(line);
    }
    storyBannerLines = lines;
  }
  const storyPanelAlpha = storyBannerFading ? Math.max(0, storyBannerT / 20) : Math.min(1, storyFadeInT / 40);
  ctx.save();
  ctx.globalAlpha = storyPanelAlpha;
  const VS = CONFIG.ui.storyBanner;
  const bw = VS.panW;
  const _stLineH = storyBannerLines.length * VS.lineH + Math.max(0, storyBannerLines.length - 1) * VS.lineSpacing;
  const bh = VS.padTop + VS.titleH + VS.titleSpacing + _stLineH + VS.tapSpacing + VS.tapH + VS.padBottom;
  const {bx, by} = _panPos(bw, bh);
  _dialogPanel(bx, by, bw, bh, VS.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VS.fontTitle + 'px ' + FF;
  const cxSt = bx + bw / 2;
  let tySt = by + VS.padTop;
  ctx.fillStyle = PAL.bannerTitleColor;  ctx.fillText(STRINGS.storyTitle, cxSt, tySt); tySt += VS.titleH + VS.titleSpacing;
  ctx.font = VS.fontBody + 'px ' + FF;
  ctx.fillStyle = PAL.bannerText;
  for (let i = 0; i < storyBannerLines.length; i++) {
    ctx.fillText(storyBannerLines[i], cxSt, tySt);
    tySt += VS.lineH + (i < storyBannerLines.length - 1 ? VS.lineSpacing : VS.tapSpacing);
  }
  const blink = Math.floor(frame / 25) % 2 === 0;
  ctx.font = VS.fontTap + 'px ' + FF;
  ctx.fillStyle = blink ? PAL.tapPromptColor : PAL.transparent; ctx.fillText(STRINGS.tapContinue, cxSt, tySt);
  ctx.restore();
}

function drawMissionBanner() {
  if (missionBannerT <= 0 || state !== 'playing') return;
  if (!missionBannerLines) {
    ctx.font = CONFIG.ui.missionBanner.fontBody + 'px ' + FF;
    const text = STRINGS['mission' + currentLevel] || STRINGS.mission1;
    const words = text.split(' ');
    let line = '', lines = [];
    for (let i = 0; i < words.length; i++) {
      const test = line + (line ? ' ' : '') + words[i];
      if (ctx.measureText(test).width > CONFIG.ui.missionBanner.wrapWidth) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    missionBannerLines = lines;
  }
  const alpha = missionBannerT < 40 ? missionBannerT / 40 : missionBannerT > 170 ? (210 - missionBannerT) / 40 : 1;
  const VM = CONFIG.ui.missionBanner;
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
  ctx.fillStyle = PAL.bannerTitleColor;  ctx.fillText(fmt(STRINGS.missionLabel, currentLevel), cxM, tyM); tyM += VM.titleH + VM.titleSpacing;
  ctx.font = VM.fontBody + 'px ' + FF;
  ctx.fillStyle = PAL.bannerText;
  for (let i = 0; i < missionBannerLines.length; i++) {
    ctx.fillText(missionBannerLines[i], cxM, tyM);
    if (i < missionBannerLines.length - 1) tyM += VM.lineH + VM.lineSpacing;
  }
  ctx.restore();
}

function drawPauseOverlay() {
  if (state !== 'paused' || !_pauseActive) return;
  ctx.save();
  const VP = CONFIG.ui.pauseOverlay;
  const pH = VP.padTop + VP.titleH + VP.titleSpacing + VP.btnH + VP.padBottom;
  const {bx, by} = _panPos(VP.panW, pH);
  _dialogPanel(bx, by, VP.panW, pH, VP.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VP.fontTitle + 'px ' + FF;
  const cx = bx + VP.panW / 2;
  let ty = by + VP.padTop;
  ctx.fillStyle = PAL.bannerTitleColor; ctx.fillText(STRINGS.pauseTitle, cx, ty); ty += VP.titleH + VP.titleSpacing;
  ctx.font = VP.fontBtn + 'px ' + FF;
  const rx = bx + VP.resumeOx;
  _dialogBtn(rx, ty, VP.resumeW, VP.btnH, CONFIG.ui.dialog.btnColorYes);
  ctx.fillStyle = PAL.btnText; ctx.fillText(STRINGS.btnResume, rx + VP.resumeW/2, ty + Math.floor((VP.btnH - VP.fontBtn) / 2));
  ctx.restore();
}

function drawHomeConfirm() {
  if (!_homeConfirmActive) return;
  ctx.save();
  const VH = CONFIG.ui.homeConfirm;
  const hH = VH.padTop + VH.titleH + VH.titleSpacing + VH.btnH + VH.padBottom;
  const {bx, by} = _panPos(VH.panW, hH);
  _dialogPanel(bx, by, VH.panW, hH, VH.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VH.fontTitle + 'px ' + FF;
  const cx = bx + VH.panW / 2;
  let ty = by + VH.padTop;
  ctx.fillStyle = PAL.bannerTitleColor; ctx.fillText(STRINGS.homeConfirm, cx, ty); ty += VH.titleH + VH.titleSpacing;
  ctx.font = VH.fontBtn + 'px ' + FF;
  const siX = bx + VH.siOx, noX = bx + VH.noOx;
  _dialogBtn(siX, ty, VH.siW, VH.btnH, CONFIG.ui.dialog.btnColorYes);
  ctx.fillStyle = PAL.btnText; ctx.fillText(STRINGS.btnYes, siX + VH.siW/2, ty + Math.floor((VH.btnH - VH.fontBtn) / 2));
  _dialogBtn(noX, ty, VH.noW, VH.btnH, CONFIG.ui.dialog.btnColorNo);
  ctx.fillStyle = PAL.btnText; ctx.fillText(STRINGS.btnNo, noX + VH.noW/2, ty + Math.floor((VH.btnH - VH.fontBtn) / 2));
  ctx.restore();
}

function drawCredits() {
  if (!_creditsActive) return;
  ctx.save();
  var VC = CONFIG.ui.credits;
  var n = _CREDITS_MEMBERS.length;
  var panH = VC.padTop + VC.titleH + VC.titleSpacing + VC.teamH + VC.teamSpacing
           + n * (VC.nameH + VC.nameGap + VC.roleH + VC.roleGap)
           + VC.tapSpacing + VC.btnH + VC.padBottom;
  var _cp = _panPos(VC.panW, panH); var bx = _cp.bx, by = _cp.by;
  _dialogPanel(bx, by, VC.panW, panH, VC.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  var cx = bx + VC.panW / 2;
  var ty = by + VC.padTop;
  ctx.font = VC.fontTitle + 'px ' + FF; ctx.fillStyle = PAL.bannerTitleColor;
  ctx.fillText('— CREDITS —', cx, ty); ty += VC.titleH + VC.titleSpacing;
  ctx.font = VC.fontBody + 'px ' + FF; ctx.fillStyle = PAL.creditsRole;
  ctx.fillText('LucazadeSoft Team', cx, ty); ty += VC.teamH + VC.teamSpacing;
  for (var i = 0; i < n; i++) {
    ctx.font = VC.fontBody + 'px ' + FF;
    ctx.fillStyle = PAL.creditsText; ctx.fillText(_CREDITS_MEMBERS[i].name, cx, ty); ty += VC.nameH + VC.nameGap;
    ctx.font = VC.fontRole + 'px ' + FF;
    ctx.fillStyle = PAL.creditsMemberRole;  ctx.fillText(_CREDITS_MEMBERS[i].role, cx, ty); ty += VC.roleH + VC.roleGap;
  }
  ty += VC.tapSpacing;
  var btnX = bx + Math.round((VC.panW - VC.btnW) / 2);
  ctx.font = VC.fontBtn + 'px ' + FF;
  _dialogBtn(btnX, ty, VC.btnW, VC.btnH, CONFIG.ui.dialog.btnColorYes);
  ctx.fillStyle = PAL.creditsText; ctx.fillText('OK', bx + VC.panW/2, ty + Math.floor((VC.btnH - VC.fontBtn) / 2));
  ctx.restore();
}

function drawHighScores() {
  if (state !== 'highscores') return;
  var VHS = CONFIG.ui.highScores;
  var hs = _getHighScores();
  var numRows = hs.length > 0 ? hs.length : 1;
  var panH = VHS.padTop + VHS.titleH + VHS.titleSpacing + numRows * VHS.rowH + VHS.tapSpacing + VHS.tapH + VHS.padBottom;
  var panX = Math.round((W - VHS.panW) / 2);
  var panY = Math.round((H - panH) / 2);
  var cxHS = panX + Math.round(VHS.panW / 2);
  ctx.save();
  _dialogPanel(panX, panY, VHS.panW, panH, CONFIG.ui.dialog.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  var ty = panY + VHS.padTop;
  ctx.font = VHS.fontTitle + 'px ' + FF;
  ctx.fillStyle = PAL.bannerTitleColor;
  ctx.fillText(STRINGS.highScoresTitle, cxHS, ty); ty += VHS.titleH + VHS.titleSpacing;
  ctx.font = VHS.fontBody + 'px ' + FF;
  if (hs.length === 0) {
    ctx.fillStyle = PAL.bannerText; ctx.fillText(STRINGS.highScoresEmpty, cxHS, ty);
  } else {
    var SEP = '    |    ';
    ctx.textAlign = 'center';
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i];
      var _diff = (STRINGS['difficulty_' + h.difficulty] || h.difficulty).padEnd(4, ' ');
      var row = String(i + 1).padStart(2, ' ') + '. ' + String(h.score).padStart(5, '0')
              + SEP + 'L' + String(h.level).padStart(2, ' ')
              + SEP + _diff;
      ctx.fillStyle = i === 0 ? PAL.topScoreColor : PAL.bannerText;
      ctx.fillText(row, cxHS, ty);
      ty += VHS.rowH;
    }
  }
  ty += VHS.tapSpacing;
  var blink = Math.floor(frame / 20) % 2 === 0;
  ctx.textAlign = 'center';
  ctx.font = VHS.fontTap + 'px ' + FF;
  ctx.fillStyle = blink ? PAL.tapPromptColor : PAL.transparent;
  ctx.fillText(STRINGS.tapForTitle, cxHS, ty);
  ctx.restore();
}
