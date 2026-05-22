// ═══════════════════════════════════════════════════════════
//  GFX UI — font, bezel, HUD, dialogs, and all banner config
//  All colours reference PAL (gfx-palette.js).
//  Building/scene → gfx-building.js
// ═══════════════════════════════════════════════════════════

Object.assign(CONFIG.vis, {

  // ── Bezel — mobile side panels ────────────────────
  bezel: {
    panelInnerBorder:  PAL.bezelGlow,
    btnHomeBorder:     PAL.bezelBorder,
    btnPauseBorder:    PAL.bezelBorder,
    btnInfoBorder:     PAL.bezelBorder,
    btnHomeBg:         PAL.bezelBtnBg,
    btnPauseBg:        PAL.bezelBtnBg,
    btnInfoBg:         PAL.bezelInfoBg,
    btnHomeBgPressed:  PAL.bezelPressed,
    btnPauseBgPressed: PAL.bezelPressed,
    btnInfoBgPressed:  PAL.bezelPressed,
    btnGlow:           PAL.bezelShadow,
  },

  // Shared style for all dialog panels (banners, buttons)
  dialog: {
    panBg:       PAL.panelBg,
    panBorder:   PAL.panelBorder,
    panBorderW:  1,
    panR:        4,
    btnR:        2,
    btnColorYes: PAL.btnYes,
    btnColorNo:  PAL.btnNo,
    btnStroke:   PAL.panelBorder,
  },

  // Title screen — logo + tap to start + level chooser + audio toggle + keyboard legend
  titleScreen: {
    logo:     { w: 300, borderW: 1, borderR: 5 },
    tapToStart: { fontSize: 6, alignX: 'center', alignY: 'middle' },
    controls: {
      fontSize: 8,
      gapY:     8,
      btnH:    11,
      boxR:     2,
      btnColor: PAL.btnLabel,
      prevX:   10, prevW: 14,
      nextX:   76, nextW: 14,
      labelX:  50,
      audioRightX: 310, audioPadX: 6,
    },
    legend: { fontSize: 4, gapY: 6 },
  },

  // HUD — strip in cima al canvas
  hud: {
    rowH:      8,
    heartsX:   4,
    heartSize:  0.5,
    iconScale:  0.5,
    msgFadeFrames: 20,
    centerX:   160,
    scoreX:    316,
    timerH:     1,
    timerAlpha: 0.80,
    fontSize:  6,
    dotGap:    5,
    bgColor:   PAL.hudBg,
    dotColors: {
      boards:     PAL.dotBoards,
      bags:       PAL.dotBags,
      machines:   PAL.dotMachines,
      ball:       PAL.dotBall,
      students:   PAL.dotStudents,
      books:      PAL.dotBooks,
      sink:       PAL.dotSink,
      bins:       PAL.dotBins,
      sprinklers: PAL.dotSprinklers,
      register:   PAL.dotRegister,
    },
  },

  // Story banner (L1) — panH computed: padTop+titleH+titleSpacing+lineBlock+spacerH+tapH+padBottom
  storyBanner: {
    panW: 280, wrapWidth: 220,
    fontTitle:      8,
    fontBody:       6,
    padTop:        14,
    titleH:        10, titleSpacing: 10,
    lineH:          9, lineSpacing:   4,
    spacerH:       10,
    tapH:           8,
    padBottom:     14,
  },

  // Mission banner — panH computed: padTop+titleH+titleSpacing+lineBlock+padBottom
  missionBanner: {
    panW: 260, wrapWidth: 200,
    fontTitle:      8,
    fontBody:       6,
    padTop:        14,
    titleH:        10, titleSpacing: 8,
    lineH:          9, lineSpacing:  4,
    padBottom:     14,
  },

  // Level complete banner — panH computed: padTop+stepTitle+stepScore+tapH+padBottom
  levelComplete: {
    panW: 260,
    fontTitle:  8,
    fontBody:   6,
    padTop:    14,
    stepTitle: 18,
    stepScore: 15,
    stepBonus: 12,
    tapH:       8,
    padBottom:  11,
  },

  // Game win banner (L10) — panH computed: padTop+stepTitle+stepScore+stepBest+tapH+padBottom
  gameWin: {
    panW: 260,
    fontTitle:  8,
    fontBody:   6,
    padTop:    14,
    stepTitle: 22,
    stepScore: 12,
    stepBonus: 12,
    stepBest:  18,
    tapH:       8,
    padBottom: 12,
  },

  // Game over banner — panH computed: padTop+stepTitle+stepLevel+stepScore+stepConfirm+btnH+padBottom
  gameover: {
    panW: 260,
    fontTitle:    8,
    fontBody:     6,
    fontBtn:      6,
    padTop:      12,
    stepTitle:   18,
    stepLevel:   12,
    stepScore:   20,
    stepConfirm: 16,
    btnH:        14,
    padBottom:   12,
    siOx: 30, siW: 70,
    noOx: 160, noW: 70,
  },

  // Luca speech bubble (L10 level end) — bh computed: headerH + lineCount*lineH + gapTap + tapH + padBottom
  lucaFumetto: {
    bw:        190,
    fontTitle:   8,
    fontBody:    6,
    offsetX:    10,
    tailOffY:   14,
    headerH:    14,
    lineH:      10,
    gapTap:      4,
    tapH:        8,
    padBottom:   6,
    tailW: 3, tailH: 5,
  },

  // Pause overlay — panH computed: padTop+stepTitle+btnH+padBottom
  pauseOverlay: {
    panW: 200,
    fontTitle:  8,
    fontBtn:    6,
    padTop:    14,
    stepTitle: 22,
    btnH:      14,
    padBottom: 14,
    resumeOx:  65, resumeW: 70,
  },

  // Home confirm overlay — panH computed: padTop+stepTitle+btnH+padBottom
  homeConfirm: {
    panW: 200,
    fontTitle:  8,
    fontBtn:    6,
    padTop:    14,
    stepTitle: 20,
    btnH:      14,
    padBottom: 14,
    siOx: 20, siW: 70,
    noOx: 110, noW: 70,
  },

  // Credits — panH computed: padTop+stepTitle+stepTeam+5*(nameH+nameGap+roleH+roleGap)+btnGapAbove+btnH+padBottom
  credits: {
    panW: 240,
    fontTitle:    8,
    fontBody:     6,
    fontBtn:      6,
    padTop:       8,
    stepTitle:   14,
    stepTeam:    12,
    nameH:        4, nameGap:  2,
    roleH:        4, roleGap:  6,
    btnGapAbove:  2,
    btnH:        12, btnW: 60,
    padBottom:    10,
  },

});

// CSS custom properties — font and bezel
var _B = CONFIG.vis.bezel;
document.documentElement.style.setProperty('--btr-font-family',          CONFIG.display.fontFamily);
document.documentElement.style.setProperty('--btr-panel-inner-border',   _B.panelInnerBorder);
document.documentElement.style.setProperty('--btr-btn-home-border',      _B.btnHomeBorder);
document.documentElement.style.setProperty('--btr-btn-pause-border',     _B.btnPauseBorder);
document.documentElement.style.setProperty('--btr-btn-info-border',      _B.btnInfoBorder);
document.documentElement.style.setProperty('--btr-btn-home-bg',          _B.btnHomeBg);
document.documentElement.style.setProperty('--btr-btn-pause-bg',         _B.btnPauseBg);
document.documentElement.style.setProperty('--btr-btn-info-bg',          _B.btnInfoBg);
document.documentElement.style.setProperty('--btr-btn-home-bg-pressed',  _B.btnHomeBgPressed);
document.documentElement.style.setProperty('--btr-btn-pause-bg-pressed', _B.btnPauseBgPressed);
document.documentElement.style.setProperty('--btr-btn-info-bg-pressed',  _B.btnInfoBgPressed);
document.documentElement.style.setProperty('--btr-btn-glow',             _B.btnGlow);
