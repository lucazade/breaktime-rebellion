// Layout debug overlay — attivato da ?layout=1 nell'URL
// Disegna i confini reali degli elementi HTML/CSS sopra il gioco in esecuzione.
// Ogni modifica a style.css si riflette immediatamente al refresh.
// Nessun effetto se ?layout=1 è assente — sicuro in produzione.

(function () {
  'use strict';
  if (!/[?&]layout=1/.test(location.search)) return;

  // ── Colori ────────────────────────────────────────────────────────────────
  var C = {
    canvas:   { b: 'rgba(255,210,0,0.90)',  bg: 'rgba(255,210,0,0.04)'  },
    gameArea: { b: 'rgba(0,210,255,0.35)',  bg: 'rgba(0,210,255,0.03)'  },
    panel:    { b: 'rgba(160,0,255,0.85)',  bg: 'rgba(160,0,255,0.10)'  },
    topBezel: { b: 'rgba(255,200,0,0.85)',  bg: 'rgba(255,200,0,0.08)'  },
    botBezel: { b: 'rgba(0,210,255,0.85)',  bg: 'rgba(0,210,255,0.07)'  },
    legend:   { b: 'rgba(255,80,60,0.90)',  bg: 'rgba(255,80,60,0.10)'  },
    legendOk: { b: 'rgba(80,220,80,0.90)',  bg: 'rgba(80,220,80,0.08)'  },
    overlap:  { b: 'rgba(255,30,0,0.90)',   bg: 'rgba(255,30,0,0.30)'   },
    gap:      { b: 'transparent',           bg: 'rgba(80,220,80,0.18)'  },
  };

  // ── Stato ─────────────────────────────────────────────────────────────────
  var _visible = true;
  var _ov, _info;

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Crea un div posizionato sopra un DOMRect con bordo colorato + label opzionale
  function box(r, col, label, labelPos) {
    if (!r || r.width <= 0 || r.height <= 0) return null;
    var d = document.createElement('div');
    d.style.cssText =
      'position:fixed;box-sizing:border-box;pointer-events:none;' +
      'left:'   + r.left   + 'px;' +
      'top:'    + r.top    + 'px;' +
      'width:'  + r.width  + 'px;' +
      'height:' + r.height + 'px;' +
      'outline:1.5px solid ' + col.b + ';' +
      'background:' + col.bg + ';';
    if (label) {
      var lbl = document.createElement('div');
      var pos = labelPos || 'tl';
      lbl.style.cssText =
        'position:absolute;font-family:monospace;font-size:9px;line-height:1.4;' +
        'white-space:nowrap;color:' + col.b + ';' +
        'background:rgba(0,0,0,0.60);padding:0 3px;border-radius:1px;' +
        (pos === 'tl' ? 'top:2px;left:2px;'   : '') +
        (pos === 'tr' ? 'top:2px;right:2px;'  : '') +
        (pos === 'bl' ? 'bottom:2px;left:2px;': '') +
        (pos === 'br' ? 'bottom:2px;right:2px;': '');
      lbl.textContent = label;
      d.appendChild(lbl);
    }
    return d;
  }

  // Crea un div da coordinate assolute (non un DOMRect)
  function rawBox(left, top, width, height, col, label) {
    return box({ left: left, top: top, width: width, height: height }, col, label);
  }

  // Riga metrica per l'info panel
  function row(k, v, vc) {
    return '<div style="display:flex;justify-content:space-between;gap:8px;margin-top:2px;">' +
      '<span style="color:#555;">' + k + '</span>' +
      '<span style="color:' + (vc || '#bbb') + ';font-weight:bold;">' + v + '</span>' +
      '</div>';
  }
  function section(title) {
    return '<div style="color:#444;font-size:9px;letter-spacing:.5px;' +
           'margin:7px 0 3px;border-top:1px solid #1a1a2a;padding-top:5px;">' +
           title + '</div>';
  }

  // ── Update ────────────────────────────────────────────────────────────────
  function update() {
    if (!_visible) return;
    _ov.innerHTML = '';

    var vw = window.innerWidth, vh = window.innerHeight;
    var canvas   = document.getElementById('c');
    var gameArea = document.getElementById('game-area');
    var legend   = document.getElementById('legend');
    var topBezel = document.getElementById('top-bezel');
    var botBezel = document.getElementById('bottom-bezel');
    var panelL   = document.getElementById('panel-left');
    var panelR   = document.getElementById('panel-right');

    if (!canvas) return;

    var cr = canvas.getBoundingClientRect();
    var gr = gameArea ? gameArea.getBoundingClientRect() : null;

    // game-area
    if (gr && gr.width > 0) {
      var gaEl = box(gr, C.gameArea, '#game-area  ' + Math.round(gr.width) + '×' + Math.round(gr.height));
      if (gaEl) _ov.appendChild(gaEl);
    }

    // side panels
    if (panelL) {
      var plr = panelL.getBoundingClientRect();
      if (plr.width > 0) {
        var e = box(plr, C.panel, '#panel-left  ' + Math.round(plr.width) + 'px');
        if (e) _ov.appendChild(e);
      }
    }
    if (panelR) {
      var prr = panelR.getBoundingClientRect();
      if (prr.width > 0) {
        var e2 = box(prr, C.panel, '#panel-right  ' + Math.round(prr.width) + 'px', 'tr');
        if (e2) _ov.appendChild(e2);
      }
    }

    // top bezel
    if (topBezel && !topBezel.classList.contains('bezel-hidden')) {
      var tbr = topBezel.getBoundingClientRect();
      if (tbr.width > 0 && tbr.height > 0) {
        var gapTB = Math.round(cr.top - tbr.bottom);
        var e3 = box(tbr, C.topBezel, '#top-bezel  gap↓' + gapTB + 'px', 'bl');
        if (e3) _ov.appendChild(e3);
      }
    }

    // canvas
    var cvEl = box(cr, C.canvas, 'canvas  ' + Math.round(cr.width) + '×' + Math.round(cr.height) + '  top:' + Math.round(cr.top) + 'px');
    if (cvEl) _ov.appendChild(cvEl);

    // bottom bezel
    if (botBezel) {
      var bbr = botBezel.getBoundingClientRect();
      if (bbr.width > 0 && bbr.height > 0) {
        var gapBB = Math.round(bbr.top - cr.bottom);
        var e4 = box(bbr, C.botBezel, '#bottom-bezel  gap↑' + gapBB + 'px');
        if (e4) _ov.appendChild(e4);
      }
    }

    // legend + gap/overlap
    var legRect = legend ? legend.getBoundingClientRect() : null;
    var legVisible   = legRect && legRect.width > 0;
    var legOffScreen = legVisible && legRect.top >= vh;
    var legGap       = legVisible ? legRect.top - cr.bottom : null;
    var legOverlap   = legVisible && !legOffScreen && legGap < 0;

    if (legVisible && !legOffScreen) {
      var legBottom = Math.round(vh - legRect.bottom);
      var legCol    = legOverlap ? C.legend : C.legendOk;
      var legLabel  = '#legend  bottom:' + legBottom + 'px  gap:' + Math.round(legGap) + 'px';
      var le = box(legRect, legCol, legLabel);
      if (le) _ov.appendChild(le);

      if (legOverlap) {
        // zona di overlap: da legend.top fino a canvas.bottom
        var olH = -legGap;
        var olEl = rawBox(cr.left, legRect.top, cr.width, olH, C.overlap, '⚠ overlap ' + Math.round(olH) + 'px');
        if (olEl) _ov.appendChild(olEl);
      } else {
        // banda verde = aria libera tra canvas e legend
        var ge = rawBox(cr.left, cr.bottom, cr.width, legGap, C.gap);
        if (ge) _ov.appendChild(ge);
      }
    }

    // ── Info panel ────────────────────────────────────────────────────────
    var isMobile   = panelL && panelL.getBoundingClientRect().width > 0;
    var ratio      = cr.width / cr.height;
    var constraint = ratio > 1.601 ? 'height' : 'width'; // 16/10 = 1.6
    var isRounded  = canvas.classList.contains('rounded');

    var html = '<div style="color:rgba(160,0,255,0.9);font-size:9px;letter-spacing:1px;' +
               'margin-bottom:5px;border-bottom:1px solid #1a1a2a;padding-bottom:5px;">' +
               'BTR LAYOUT DEBUG<br>' +
               '<span style="color:#444;font-weight:normal;font-size:8px;">L = toggle overlay</span></div>';

    html += section('VIEWPORT');
    html += row('size', vw + ' × ' + vh + 'px');
    html += row('type', isMobile ? 'mobile' : 'desktop',
                isMobile ? 'rgba(160,0,255,0.85)' : 'rgba(0,210,255,0.85)');
    html += row('constraint', constraint + '-constrained',
                constraint === 'height' ? '#ff6644' : '#55cc66');

    html += section('CANVAS');
    html += row('size', Math.round(cr.width) + ' × ' + Math.round(cr.height) + 'px');
    html += row('top', Math.round(cr.top) + 'px', cr.top < 2 ? '#ff6644' : '#bbb');
    html += row('bottom from vp', Math.round(vh - cr.bottom) + 'px');
    html += row('rounded', isRounded ? 'yes' : 'no', isRounded ? '#55cc66' : '#555');

    html += section('LEGEND');
    if (!legVisible) {
      html += row('status', 'hidden (no .visible)', '#444');
    } else if (legOffScreen) {
      html += row('position', 'off-screen ↓', '#55cc66');
      html += row('top', Math.round(legRect.top) + 'px (> ' + vh + ')', '#55cc66');
    } else {
      html += row('bottom', Math.round(vh - legRect.bottom) + 'px');
      html += row('top', Math.round(legRect.top) + 'px');
      html += row('gap da canvas', Math.round(legGap) + 'px',
                  legGap < 0 ? '#ff6644' : '#55cc66');
      if (legOverlap)
        html += row('⚠ OVERLAP', Math.round(-legGap) + 'px', '#ff6644');
    }

    html += section('BEZELS');
    if (topBezel) {
      var tbHidden = topBezel.classList.contains('bezel-hidden');
      var tbr2 = topBezel.getBoundingClientRect();
      html += row('top-bezel', tbHidden ? 'hidden (.bezel-hidden)' : Math.round(tbr2.top) + '→' + Math.round(tbr2.bottom) + 'px',
                  tbHidden ? '#555' : '#bbb');
    }
    if (botBezel) {
      var bbr2 = botBezel.getBoundingClientRect();
      html += row('bottom-bezel', bbr2.height > 0 ? 'top:' + Math.round(bbr2.top) + 'px' : 'hidden', bbr2.height > 0 ? '#bbb' : '#555');
    }

    _info.innerHTML = html;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    // Overlay trasparente sopra tutto
    _ov = document.createElement('div');
    _ov.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;';
    document.body.appendChild(_ov);

    // Info panel — top-right, pointer-events attivi solo su di esso
    _info = document.createElement('div');
    _info.style.cssText =
      'position:fixed;top:8px;right:8px;z-index:9999;' +
      'background:rgba(4,0,14,0.93);border:1px solid rgba(160,0,255,0.55);' +
      'border-radius:4px;padding:8px 10px;min-width:190px;' +
      'font-family:monospace;font-size:10px;color:#bbb;' +
      'pointer-events:auto;' +
      'box-shadow:0 0 24px rgba(0,0,0,0.8),0 0 0 1px #04000e;';
    document.body.appendChild(_info);

    // Toggle con L
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        _visible = !_visible;
        _ov.style.display   = _visible ? '' : 'none';
        _info.style.display = _visible ? '' : 'none';
      }
    });

    // Aggiornamento live su resize
    var _rt;
    function _schedule() { clearTimeout(_rt); _rt = setTimeout(update, 80); }
    window.addEventListener('resize', _schedule);
    if (window.ResizeObserver) {
      var canvas = document.getElementById('c');
      if (canvas) new ResizeObserver(_schedule).observe(canvas);
    }

    update();
  }

  // Aspetta che game.js abbia fatto il suo setup (canvas + CSS vars)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 200); });
  } else {
    setTimeout(init, 200);
  }

})();
