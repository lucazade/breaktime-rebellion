// ═══════════════════════════════════════════════════════════
//  UI — HUD, dialogs, banners, and character sprite config
//  All colours reference PAL (palette.js).
//  Scene geometry → scene.js
//  Mobile panel buttons (home/pause/info) are styled entirely in CSS.
// ═══════════════════════════════════════════════════════════

CONFIG.ui = {

  char: {
    outline:      true,
    outlineSize:  1.0,
    outlineColor: PAL.charOutline,
  },


  // Shared style for all dialog panels (banners, buttons)
  dialog: {
    panBg:       PAL.panelBg,      // panel background
    panBorder:   PAL.panelBorder,  // panel border color
    panBorderW:  1,                // panel border width (px)
    panR:        4,                // panel corner radius (px)
    btnR:        2,                // button corner radius (px)
    btnColorYes: PAL.btnYes,       // confirm button color (Yes/Resume)
    btnColorNo:  PAL.btnNo,        // cancel button color (No/Exit)
    btnStroke:   PAL.panelBorder,  // button border color
  },

  // Title screen — logo (pulsing gold glow) + controls row + HTML keyboard legend (desktop)
  // Controls row layout: [< Lvl >]  [EASY/MED/HARD]  [music/sfx/mute]
  titleScreen: {
    logo: {
      w:       300,  // logo area width (px, logical coords)
      borderW:   1,  // logo frame border width
      borderR:   5,  // logo frame corner radius
    },
    controls: {
      fontSize:    8,   // label font size
      gapY:       12,   // vertical gap between logo bottom and controls row
      btnH:       11,   // button height (level/difficulty/audio)
      boxR:        2,   // button corner radius
      btnColor: PAL.btnLabel, // label color on buttons
      prevX:      10,   // X of < button (previous level)
      prevW:      14,   // < button width
      nextX:      76,   // X of > button (next level)
      nextW:      14,   // > button width
      labelX:     50,   // X center of level number label
      diffX:     134,   // X of difficulty toggle button (centered in canvas)
      diffW:      52,   // difficulty toggle button width
      audioRightX: 310, // X right edge of audio button (right-aligned)
      audioPadX:    6,  // horizontal inner padding of audio button
    },
  },

  // HUD — strip at the top of the canvas
  hud: {
    rowH:          8,          // HUD strip height (px)
    heartsX:       4,          // X origin of hearts row
    heartSize:     0.5,        // heart draw scale
    iconScale:     0.5,        // current mechanic icon scale
    msgFadeFrames: 20,         // fade-out frames for proximity hint message
    centerX:       160,        // canvas center X for centered HUD text
    scoreX:        316,        // score right edge X (right-aligned)
    timerH:        2,          // timer bar height below HUD strip (px)
    timerAlpha:    0.90,       // timer bar opacity
    fontSize:      6,          // HUD text font size
    dotGap:        5,          // gap between mechanic indicator dots
    bgColor:       PAL.hudBg,  // HUD strip background color
    dotColors: {
      boards:     PAL.dotBoards,     // dot: boards to spray
      bags:       PAL.dotBags,       // dot: bags to steal
      machines:   PAL.dotMachines,   // dot: vending machines to break
      ball:       PAL.dotBall,       // dot: ball to deflate
      students:   PAL.dotStudents,   // dot: students to hit with paper
      books:      PAL.dotBooks,      // dot: books to knock off
      sink:       PAL.dotSink,       // dot: sink to flood
      bins:       PAL.dotBins,       // dot: bins to plant firecrackers in
      sprinklers: PAL.dotSprinklers, // dot: sprinklers to activate
      register:   PAL.dotRegister,   // dot: register to steal
    },
  },

  // Story banner (L1) — panH computed: padTop+titleH+titleSpacing+lineBlock+spacerH+tapH+padBottom
  storyBanner: {
    panW:        280,  // panel width
    wrapWidth:   220,  // max text width (word wrap)
    fontTitle:     8,  // title font size
    fontBody:      6,  // body font size
    padTop:       14,  // top padding
    titleH:       10,  // title row height
    titleSpacing: 10,  // gap below title
    lineH:         9,  // height per text line
    lineSpacing:   4,  // gap between lines
    spacerH:      10,  // spacer between body text and "tap to continue"
    tapH:          8,  // "tap to continue" row height
    padBottom:    14,  // bottom padding
  },

  // Mission banner — panH computed: padTop+titleH+titleSpacing+lineBlock+padBottom
  missionBanner: {
    panW:        260,  // panel width
    wrapWidth:   200,  // max text width
    fontTitle:     8,  // title font size
    fontBody:      6,  // mission text font size
    padTop:       14,  // top padding
    titleH:       10,  // title row height
    titleSpacing:  8,  // gap below title
    lineH:         9,  // height per text line
    lineSpacing:   4,  // gap between lines
    padBottom:    14,  // bottom padding
  },

  // Level complete banner — panH computed: padTop+stepTitle+stepScore+tapH+padBottom
  levelComplete: {
    panW:      260,  // panel width
    fontTitle:   8,  // title font size
    fontBody:    6,  // score/bonus font size
    padTop:     14,  // top padding
    stepTitle:  18,  // Y offset from padTop to title
    stepScore:  15,  // Y offset from title to score row
    tapH:        8,  // "tap to continue" row height
    padBottom:  11,  // bottom padding
  },

  // High scores banner — panH computed: padTop+stepTitle+rows*rowH+tapGap+tapH+padBottom
  highScores: {
    panW:      210,  // panel width
    fontTitle:   6,  // title font size
    fontBody:    4,  // score row font size
    fontTap:     6,  // "tap to go home" font size
    padTop:      8,  // top padding
    stepTitle:  14,  // title row height (incl. gap below)
    rowH:        9,  // height per score row
    tapGap:      8,  // gap above tap label
    tapH:        8,  // tap label row height
    padBottom:   8,  // bottom padding
  },

  // Game win banner (L10) — panH computed: padTop+stepTitle+stepScore+tapH+padBottom
  gameWin: {
    panW:      260,  // panel width
    fontTitle:   8,  // title font size
    fontBody:    6,  // text font size
    padTop:     14,  // top padding
    stepTitle:  22,  // Y offset to title
    stepScore:  12,  // Y offset to final score
    tapH:        8,  // "tap to continue" row height
    padBottom:  12,  // bottom padding
  },

  // Game over banner — panH computed: padTop+stepTitle+stepScore+stepConfirm+btnH+padBottom
  gameover: {
    panW:        260,  // panel width
    fontTitle:     8,  // title font size
    fontBody:      6,  // text font size
    fontBtn:       6,  // Yes/No button font size
    padTop:       12,  // top padding
    stepTitle:    18,  // Y offset to "GAME OVER" title
    stepScore:    20,  // Y offset to final score
    stepConfirm:  16,  // Y offset to "try again?" prompt
    btnH:         14,  // Yes/No button area height
    padBottom:    12,  // bottom padding
    siOx:  30, siW:  70,  // Yes button X offset and width
    noOx: 160, noW:  70,  // No button X offset and width
  },

  // Luca speech bubble (L10 level end) — bh computed: headerH + lineCount*lineH + gapTap + tapH + padBottom
  lucaFumetto: {
    bw:        190,  // bubble width
    fontTitle:   8,  // bubble header font size
    fontBody:    6,  // bubble body font size
    offsetX:    10,  // X offset relative to Luca's position
    tailOffY:   14,  // Y offset of the bubble tail
    headerH:    14,  // header area height
    lineH:      10,  // height per text line
    gapTap:      4,  // gap between text and "tap" row
    tapH:        8,  // "tap to continue" row height
    padBottom:   6,  // bottom padding
    tailW: 3, tailH: 5,  // bubble tail dimensions
  },

  // Pause overlay — panH computed: padTop+stepTitle+btnH+padBottom
  pauseOverlay: {
    panW:      200,  // panel width
    fontTitle:   8,  // title font size
    fontBtn:     6,  // resume button font size
    padTop:     14,  // top padding
    stepTitle:  22,  // Y offset to title
    btnH:       14,  // resume button area height
    padBottom:  14,  // bottom padding
    resumeOx:   65,  // Resume button X offset
    resumeW:    70,  // Resume button width
  },

  // Home confirm overlay — panH computed: padTop+stepTitle+btnH+padBottom
  homeConfirm: {
    panW:      200,  // panel width
    fontTitle:   8,  // title font size
    fontBtn:     6,  // button font size
    padTop:     14,  // top padding
    stepTitle:  20,  // Y offset to "Go to menu?" title
    btnH:       14,  // button area height
    padBottom:  14,  // bottom padding
    siOx:  20, siW:  70,  // Yes button X offset and width
    noOx: 110, noW:  70,  // No button X offset and width
  },

  // Credits — panH computed: padTop+stepTitle+stepTeam+5*(nameH+nameGap+roleH+roleGap)+btnGapAbove+btnH+padBottom
  credits: {
    panW:        240,  // panel width
    fontTitle:     8,  // "CREDITS" title font size
    fontBody:      6,  // name font size
    fontBtn:       6,  // close button font size
    padTop:        8,  // top padding
    stepTitle:    14,  // Y offset to title
    stepTeam:     12,  // gap from title to first team entry
    nameH:         4,  // name row height
    nameGap:       2,  // gap between name and role
    roleH:         4,  // role row height
    roleGap:       6,  // gap between role and next name
    btnGapAbove:   2,  // gap above close button
    btnH:         12,  // close button height
    btnW:         60,  // close button width
    padBottom:    10,  // bottom padding
  },

};

// CSS custom property — font family only (panel buttons are fully CSS-managed)
document.documentElement.style.setProperty('--btr-font-family', CONFIG.display.fontFamily);
