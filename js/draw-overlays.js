// Canvas overlay panels — modals, banners, dialogs

var _CREDITS_MEMBERS = [
  { name: 'Luca Forina',        role: 'Orchestrator'         },
  { name: 'Claude / Anthropic', role: 'Lead Developer'       },
  { name: 'ChatGPT',            role: 'Graphics'             },
  { name: 'OpenGameArt.org',    role: 'Music & Effects'      },
  { name: 'Family',             role: 'Beta Testing & Ideas' },
];

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

function _panPos(panW, panH) {
  return { bx: Math.round((W - panW) / 2), by: Math.round((H - panH) / 2) };
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
    ctx.fillStyle = PAL.profRossiBody; ctx.fillText(STRINGS.gameoverTitle,                  cx, ty); ty += VG.stepTitle;
    ctx.font = VG.fontBody + 'px ' + FF;
    ctx.fillStyle = PAL.bannerText;   ctx.fillText(fmt(STRINGS.levelReached, currentLevel), cx, ty); ty += VG.stepLevel;
    ctx.fillStyle = PAL.bannerText;   ctx.fillText(scoreText,                               cx, ty); ty += VG.stepScore;
    ctx.fillStyle = PAL.gold;    ctx.fillText(STRINGS.gameoverConfirm,                 cx, ty); ty += VG.stepConfirm;
    ctx.font = VG.fontBtn + 'px ' + FF;
    const siX = gX + VG.siOx, noX = gX + VG.noOx;
    _dialogBtn(siX, ty, VG.siW, VG.btnH, CONFIG.vis.dialog.btnColorYes);
    ctx.fillStyle = PAL.btnText; ctx.fillText(STRINGS.btnYes, siX + VG.siW/2, ty + Math.floor((VG.btnH - VG.fontBtn) / 2));
    _dialogBtn(noX, ty, VG.noW, VG.btnH, CONFIG.vis.dialog.btnColorNo);
    ctx.fillStyle = PAL.btnText; ctx.fillText(STRINGS.btnNo, noX + VG.noW/2, ty + Math.floor((VG.btnH - VG.fontBtn) / 2));
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
    ctx.fillStyle = PAL.gold;   ctx.fillText(STRINGS.winTitle, cxW, tyW); tyW += VW.stepTitle;
    ctx.font = VW.fontBody + 'px ' + FF;
    if (lastTimeBonus > 0)  { ctx.fillStyle = PAL.timeBonusText;  ctx.fillText(STRINGS.timeBonusLabel  + lastTimeBonus,  cxW, tyW); tyW += VW.stepBonus; }
    if (lastLivesBonus > 0) { ctx.fillStyle = PAL.livesBonusText; ctx.fillText(STRINGS.livesBonusLabel + lastLivesBonus, cxW, tyW); tyW += VW.stepBonus; }
    ctx.fillStyle = PAL.bannerText;  ctx.fillText(scoreText, cxW, tyW); tyW += VW.stepScore;
    ctx.fillStyle = PAL.bestScoreHighlight; ctx.fillText(STRINGS.bestLabel + ' LVL ' + bestLevel + ' — ' + String(bestScore).padStart(5,'0'), cxW, tyW); tyW += VW.stepBest;
    ctx.fillStyle = actionVisible ? PAL.gold : PAL.transparent; ctx.fillText(STRINGS.tapForTitle, cxW, tyW);
  } else {
    const VL = CONFIG.vis.levelComplete;
    const _lH = VL.padTop + VL.stepTitle + VL.stepScore + (lastTimeBonus > 0 ? VL.stepBonus : 0) + VL.tapH + VL.padBottom;
    const {bx:lX, by:lY} = _panPos(VL.panW, _lH);
    _dialogPanel(lX, lY, VL.panW, _lH, VL.panBg);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const cxL = lX + VL.panW / 2;
    let tyL = lY + VL.padTop;
    ctx.font = VL.fontTitle + 'px ' + FF;
    ctx.fillStyle = PAL.gold;  ctx.fillText(STRINGS.levelComplete, cxL, tyL); tyL += VL.stepTitle;
    ctx.font = VL.fontBody + 'px ' + FF;
    if (lastTimeBonus > 0) { ctx.fillStyle = PAL.timeBonusText; ctx.fillText(STRINGS.timeBonusLabel + lastTimeBonus, cxL, tyL); tyL += VL.stepBonus; }
    ctx.fillStyle = PAL.bannerText; ctx.fillText(scoreText, cxL, tyL); tyL += VL.stepScore;
    ctx.fillStyle = actionVisible ? PAL.tapContinueColor : PAL.transparent; ctx.fillText(STRINGS.tapContinue, cxL, tyL);
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
  ctx.fillStyle = PAL.gold;  ctx.fillText(STRINGS.storyTitle, cxSt, tySt); tySt += VS.titleH + VS.titleSpacing;
  ctx.font = VS.fontBody + 'px ' + FF;
  ctx.fillStyle = PAL.bannerText;
  for (let i = 0; i < storyBannerLines.length; i++) {
    ctx.fillText(storyBannerLines[i], cxSt, tySt);
    tySt += VS.lineH + (i < storyBannerLines.length - 1 ? VS.lineSpacing : VS.spacerH);
  }
  const blink = Math.floor(frame / 25) % 2 === 0;
  ctx.fillStyle = blink ? PAL.gold : PAL.transparent; ctx.fillText(STRINGS.tapContinue, cxSt, tySt);
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
  ctx.fillStyle = PAL.gold;  ctx.fillText(fmt(STRINGS.missionLabel, currentLevel), cxM, tyM); tyM += VM.titleH + VM.titleSpacing;
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
  const VP = CONFIG.vis.pauseOverlay;
  const pH = VP.padTop + VP.stepTitle + VP.btnH + VP.padBottom;
  const {bx, by} = _panPos(VP.panW, pH);
  _dialogPanel(bx, by, VP.panW, pH, VP.panBg);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = VP.fontTitle + 'px ' + FF;
  const cx = bx + VP.panW / 2;
  let ty = by + VP.padTop;
  ctx.fillStyle = PAL.gold; ctx.fillText(STRINGS.pauseTitle, cx, ty); ty += VP.stepTitle;
  ctx.font = VP.fontBtn + 'px ' + FF;
  const rx = bx + VP.resumeOx;
  _dialogBtn(rx, ty, VP.resumeW, VP.btnH, CONFIG.vis.dialog.btnColorYes);
  ctx.fillStyle = PAL.btnText; ctx.fillText(STRINGS.btnResume, rx + VP.resumeW/2, ty + Math.floor((VP.btnH - VP.fontBtn) / 2));
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
  ctx.fillStyle = PAL.gold; ctx.fillText(STRINGS.homeConfirm, cx, ty); ty += VH.stepTitle;
  ctx.font = VH.fontBtn + 'px ' + FF;
  const siX = bx + VH.siOx, noX = bx + VH.noOx;
  _dialogBtn(siX, ty, VH.siW, VH.btnH, CONFIG.vis.dialog.btnColorYes);
  ctx.fillStyle = PAL.btnText; ctx.fillText(STRINGS.btnYes, siX + VH.siW/2, ty + Math.floor((VH.btnH - VH.fontBtn) / 2));
  _dialogBtn(noX, ty, VH.noW, VH.btnH, CONFIG.vis.dialog.btnColorNo);
  ctx.fillStyle = PAL.btnText; ctx.fillText(STRINGS.btnNo, noX + VH.noW/2, ty + Math.floor((VH.btnH - VH.fontBtn) / 2));
  ctx.restore();
}

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
  ctx.font = VC.fontTitle + 'px ' + FF; ctx.fillStyle = PAL.gold;
  ctx.fillText('— CREDITS —', cx, ty); ty += VC.stepTitle;
  ctx.font = VC.fontBody + 'px ' + FF; ctx.fillStyle = PAL.creditsRole;
  ctx.fillText('LucazadeSoft Team', cx, ty); ty += VC.stepTeam;
  for (var i = 0; i < n; i++) {
    ctx.fillStyle = PAL.creditsText; ctx.fillText(_CREDITS_MEMBERS[i].name, cx, ty); ty += VC.nameH + VC.nameGap;
    ctx.fillStyle = PAL.creditsMemberRole;  ctx.fillText(_CREDITS_MEMBERS[i].role, cx, ty); ty += VC.roleH + VC.roleGap;
  }
  ty += VC.btnGapAbove;
  var btnX = bx + Math.round((VC.panW - VC.btnW) / 2);
  ctx.font = VC.fontBtn + 'px ' + FF;
  _dialogBtn(btnX, ty, VC.btnW, VC.btnH, CONFIG.vis.dialog.btnColorYes);
  ctx.fillStyle = PAL.creditsText; ctx.fillText('OK', bx + VC.panW/2, ty + Math.floor((VC.btnH - VC.fontBtn) / 2));
  ctx.restore();
}
