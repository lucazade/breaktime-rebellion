// Scene debug overlay — attivato da ?scene=1 nell'URL (legacy: ?debug=1)
// Sovrascrive il noop drawDebugOverlay() in draw-game.js con l'implementazione reale.
// Disegna sul canvas: floor lines, stair boxes, hitbox NPC/oggetti.
// Aggiunge un info panel HTML con metriche di scena aggiornate ad ogni frame.
// Tasto L per toggle. Nessun effetto senza ?scene=1 — sicuro in produzione.

(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  if (params.get('scene') !== '1' && params.get('debug') !== '1') return;

  // ── Stato ─────────────────────────────────────────────────────────────────
  var _visible = true;
  var _info;

  // ── Info panel HTML (stile uniforme a layout-overlay.js) ──────────────────
  function _initInfoPanel() {
    _info = document.createElement('div');
    _info.style.cssText =
      'position:fixed;top:8px;right:8px;z-index:9999;' +
      'background:rgba(4,0,14,0.93);border:1px solid rgba(160,0,255,0.55);' +
      'border-radius:4px;padding:8px 10px;min-width:180px;' +
      'font-family:monospace;font-size:10px;color:#bbb;' +
      'pointer-events:none;' +
      'box-shadow:0 0 24px rgba(0,0,0,0.8),0 0 0 1px #04000e;';
    document.body.appendChild(_info);
  }

  function _row(k, v, vc) {
    return '<div style="display:flex;justify-content:space-between;gap:8px;margin-top:2px;">' +
      '<span style="color:#555;">' + k + '</span>' +
      '<span style="color:' + (vc || '#bbb') + ';font-weight:bold;">' + v + '</span>' +
      '</div>';
  }
  function _section(t) {
    return '<div style="color:#444;font-size:9px;letter-spacing:.5px;' +
           'margin:7px 0 3px;border-top:1px solid #1a1a2a;padding-top:5px;">' + t + '</div>';
  }

  function _updateInfoPanel() {
    if (!_info) return;
    var html =
      '<div style="color:rgba(160,0,255,0.9);font-size:9px;letter-spacing:1px;' +
      'margin-bottom:5px;border-bottom:1px solid #1a1a2a;padding-bottom:5px;">' +
      'BTR SCENE DEBUG<br>' +
      '<span style="color:#444;font-weight:normal;font-size:8px;">L = toggle overlay</span></div>';

    // Player
    html += _section('PLAYER');
    if (typeof player !== 'undefined') {
      html += _row('pos', Math.round(player.x) + ', ' + Math.round(player.y));
      html += _row('onStair', player.onStair ? 'yes' : 'no', player.onStair ? '#55cc66' : '#555');
      html += _row('stunT', player.stunT > 0 ? player.stunT : '—', player.stunT > 0 ? '#ff6644' : '#555');
    }

    // Level
    html += _section('LEVEL');
    if (typeof currentLevel !== 'undefined') html += _row('level', currentLevel);
    if (typeof state !== 'undefined')        html += _row('state', state);
    if (typeof nightMode !== 'undefined')    html += _row('night', nightMode ? 'yes' : 'no', nightMode ? '#5599ff' : '#555');

    // Scene
    html += _section('SCENE');
    if (typeof stairs !== 'undefined')   html += _row('stairs',   stairs.length);
    if (typeof teachers !== 'undefined') html += _row('teachers', teachers.length);
    if (typeof janitors !== 'undefined') html += _row('janitors', janitors.length);
    if (typeof BOARDS !== 'undefined')   html += _row('boards',   BOARDS.filter(function(b) { return !b.done; }).length + '/' + BOARDS.length);
    if (typeof bags !== 'undefined')     html += _row('bags',     bags.filter(function(b) { return !b.taken; }).length + '/' + bags.length);

    _info.innerHTML = html;
  }

  // ── Canvas overlay (disegna ogni frame via drawDebugOverlay) ──────────────
  drawDebugOverlay = function () {
    if (!_visible) return;

    ctx.save();
    ctx.font = '4px monospace';
    ctx.textAlign = 'left';

    // Floor lines
    [{y:TY, label:'TY='+TY}, {y:MY, label:'MY='+MY}, {y:GY, label:'GY='+GY}].forEach(function(fl) {
      ctx.strokeStyle = PAL.debugFloorYellow;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(0, fl.y); ctx.lineTo(W, fl.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(1, fl.y-6, 26, 7);
      ctx.fillStyle = PAL.debugYellow; ctx.fillText(fl.label, 2, fl.y-1);
    });

    // Stair center lines
    [107, 213].forEach(function(dx) {
      ctx.strokeStyle = PAL.debugStairCyan;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(dx+1, 2, 20, 7);
      ctx.fillStyle = PAL.debugCyan; ctx.fillText('x='+dx, dx+2, 8);
    });

    // Stair boxes
    stairs.forEach(function(s, i) {
      var lx = Math.min(s.x1,s.x2), rx = Math.max(s.x1,s.x2);
      var ty = Math.min(s.y1,s.y2), by2 = Math.max(s.y1,s.y2);
      ctx.fillStyle = PAL.debugStairFill;
      ctx.fillRect(lx-2, ty, rx-lx+4, by2-ty);
      ctx.strokeStyle = PAL.debugStairOutline;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(lx-2, ty, rx-lx+4, by2-ty);
      ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(lx-2, ty-8, 55, 7);
      ctx.fillStyle = PAL.debugOrange;
      ctx.fillText('S'+i+' ('+s.x1+','+s.y1+')→('+s.x2+','+s.y2+')', lx-1, ty-2);
      ctx.fillStyle = PAL.debugOrangeR;
      ctx.fillRect(s.x1-1, s.y1-1, 3, 3);
      ctx.fillRect(s.x2-1, s.y2-1, 3, 3);
    });

    // Bags
    bags.forEach(function(b) {
      ctx.strokeStyle = PAL.debugBagPurple;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(b.x, b.y, 14, 10);
      ctx.fillStyle = PAL.debugBlue; ctx.fillText('bag', b.x, b.y-2);
    });

    // Boards
    BOARDS.forEach(function(b) {
      ctx.strokeStyle = PAL.debugBoardGreen;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(b.x, b.y, BW, BH);
      ctx.fillStyle = PAL.debugGreen; ctx.fillText('brd', b.x, b.y-2);
    });

    // Desks
    DESKS.forEach(function(d) {
      ctx.strokeStyle = PAL.debugDeskYellow;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(d.x, d.y, 20, 11);
    });

    // Bell
    ctx.strokeStyle = PAL.debugBellGold;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(BELL.x-2, BELL.y-1, 10, 9);
    ctx.fillStyle = PAL.panelBorder; ctx.fillText('bell', BELL.x-2, BELL.y-2);

    // Player hitbox
    ctx.strokeStyle = PAL.debugPlayerPink;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(player.x, player.y, PW, PH);
    ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(player.x, player.y-8, 36, 7);
    ctx.fillStyle = PAL.debugMagenta;
    ctx.fillText('P('+Math.round(player.x)+','+Math.round(player.y)+')', player.x+1, player.y-2);

    ctx.restore();

    // Aggiorna info panel HTML ogni frame
    _updateInfoPanel();
  };

  // ── Toggle tasto L ────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      _visible = !_visible;
      if (_info) _info.style.display = _visible ? '' : 'none';
    }
  });

  // ── Init dopo il caricamento del DOM ──────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(_initInfoPanel, 200); });
  } else {
    setTimeout(_initInfoPanel, 200);
  }

})();
