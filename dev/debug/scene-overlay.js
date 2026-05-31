// Scene debug overlay — attivato da ?scene=1 nell'URL (legacy: ?debug=1)
// Sovrascrive il noop drawDebugOverlay() in draw-game.js con l'implementazione reale.
// Disegna sul canvas: floor lines, stair boxes, hitbox di tutti gli oggetti di livello.
// Tasto L per toggle. Nessun effetto senza ?scene=1 — sicuro in produzione.

(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  if (params.get('scene') !== '1' && params.get('debug') !== '1') return;

  // ── Stato ─────────────────────────────────────────────────────────────────
  var _visible = true;
  var _info;

  // ── Helper canvas ─────────────────────────────────────────────────────────

  // Box con label — dashed=true per oggetti interattivi, false per strutture
  function _box(x, y, w, h, color, label, dashed, dimmed) {
    ctx.globalAlpha = dimmed ? 0.3 : 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    if (dashed) ctx.setLineDash([2, 2]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    if (label) {
      var lw = label.length * 4 + 3;
      ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(x, y - 7, lw, 7);
      ctx.fillStyle = color; ctx.fillText(label, x + 1, y - 2);
    }
    ctx.globalAlpha = 1;
  }

  // Box da CONFIG.scene.dashed — offset già inclusi
  function _dashedObj(obj, key, color, label, done) {
    if (!obj) return;
    var d = CONFIG.scene.dashed[key];
    if (!d) return;
    _box(obj.x + d.x, obj.y + d.y, d.w, d.h, color, label, true, done);
  }

  // ── Info panel HTML (uniforme a layout-overlay.js) ────────────────────────
  function _initInfoPanel() {
    _info = document.createElement('div');
    _info.style.cssText =
      'position:fixed;top:8px;right:8px;z-index:9999;' +
      'background:rgba(4,0,14,0.93);border:1px solid rgba(160,0,255,0.55);' +
      'border-radius:4px;padding:8px 10px;min-width:190px;' +
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
  function _frac(arr, doneFn) {
    var done = arr.filter(doneFn).length;
    return done + '/' + arr.length;
  }

  function _updateInfoPanel() {
    if (!_info || typeof state === 'undefined') return;

    var html =
      '<div style="color:rgba(160,0,255,0.9);font-size:9px;letter-spacing:1px;' +
      'margin-bottom:5px;border-bottom:1px solid #1a1a2a;padding-bottom:5px;">' +
      'BTR SCENE DEBUG<br>' +
      '<span style="color:#444;font-weight:normal;font-size:8px;">L = toggle overlay</span></div>';

    if (state === 'title') {
      html += '<div style="color:#555;font-size:10px;margin-top:6px;">title screen</div>';
      _info.innerHTML = html; return;
    }

    // Player
    html += _section('PLAYER');
    if (typeof player !== 'undefined') {
      html += _row('pos',    Math.round(player.x) + ', ' + Math.round(player.y));
      html += _row('onStair', player.onStair  ? 'yes' : 'no',   player.onStair  ? '#55cc66' : '#555');
      html += _row('stunT',   player.stunT > 0 ? player.stunT : '—', player.stunT > 0 ? '#ff6644' : '#555');
      html += _row('spraying', player.spraying ? 'yes' : 'no',  player.spraying ? '#55cc66' : '#555');
    }

    // Level
    html += _section('LEVEL ' + (typeof currentLevel !== 'undefined' ? currentLevel : '?'));
    if (typeof state    !== 'undefined') html += _row('state',  state);
    if (typeof nightMode !== 'undefined') html += _row('night',  nightMode ? 'yes' : 'no', nightMode ? '#5599ff' : '#555');
    if (typeof deathFreeze !== 'undefined') html += _row('freeze', deathFreeze ? 'yes' : 'no', deathFreeze ? '#ff6644' : '#555');

    // NPC
    html += _section('NPC');
    if (typeof teachers !== 'undefined') {
      html += _row('teachers', teachers.length + (teachers.some(function(t){ return t.chasing; }) ? ' 🔴' : ''));
    }
    if (typeof janitors !== 'undefined' && janitors.length) {
      html += _row('janitors', janitors.length);
    }

    // Oggetti attivi nel livello
    html += _section('OBJECTS');
    if (typeof BOARDS    !== 'undefined' && BOARDS.length)    html += _row('boards',    _frac(BOARDS,    function(b){ return b.sprayed; }));
    if (typeof bags      !== 'undefined' && bags.length)      html += _row('bags',      _frac(bags,      function(b){ return b.taken; }));
    if (typeof machines  !== 'undefined' && machines.length)  html += _row('machines',  _frac(machines,  function(m){ return m.broken; }));
    if (typeof students  !== 'undefined' && students.length)  html += _row('students',  _frac(students,  function(s){ return s.disturbed; }));
    if (typeof gymBall   !== 'undefined' && gymBall)          html += _row('gymBall',   gymBall.deflated  ? '✓' : '—',  gymBall.deflated  ? '#55cc66' : '#bbb');
    if (typeof bookcase  !== 'undefined' && bookcase)         html += _row('bookcase',  bookcase.fallen   ? '✓' : '—',  bookcase.fallen   ? '#55cc66' : '#bbb');
    if (typeof sink      !== 'undefined' && sink)             html += _row('sink',      sink.flooded      ? '✓' : '—',  sink.flooded      ? '#55cc66' : '#bbb');
    if (typeof bins      !== 'undefined' && bins.length)      html += _row('bins',      _frac(bins,      function(b){ return b.exploded; }));
    if (typeof sprinklers !== 'undefined' && sprinklers.length) html += _row('sprinklers', _frac(sprinklers, function(s){ return s.active; }));
    if (typeof register  !== 'undefined' && register)         html += _row('register',  register.taken    ? '✓' : '—',  register.taken    ? '#55cc66' : '#bbb');
    if (typeof exitDoor  !== 'undefined' && exitDoor)         html += _row('exitDoor',  typeof exitDone !== 'undefined' ? (exitDone ? 'open' : 'closed') : '—');

    _info.innerHTML = html;
  }

  // ── Canvas overlay ────────────────────────────────────────────────────────
  drawDebugOverlay = function () {
    if (!_visible) return;

    // Solo durante il gioco — in title non ci sono oggetti di scena
    if (typeof state === 'undefined' || state === 'title') {
      _updateInfoPanel();
      return;
    }

    ctx.save();
    ctx.font = '4px monospace';
    ctx.textAlign = 'left';

    // ── Floor lines ─────────────────────────────────────────────────────────
    [{y: TY, label: 'TY=' + TY}, {y: MY, label: 'MY=' + MY}, {y: GY, label: 'GY=' + GY}]
      .forEach(function (fl) {
        ctx.strokeStyle = PAL.debugFloorYellow;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(0, fl.y); ctx.lineTo(W, fl.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(1, fl.y - 6, 26, 7);
        ctx.fillStyle = PAL.debugYellow; ctx.fillText(fl.label, 2, fl.y - 1);
      });

    // ── Stair center lines ───────────────────────────────────────────────────
    [107, 213].forEach(function (dx) {
      ctx.strokeStyle = PAL.debugStairCyan;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(dx + 1, 2, 20, 7);
      ctx.fillStyle = PAL.debugCyan; ctx.fillText('x=' + dx, dx + 2, 8);
    });

    // ── Stair boxes ──────────────────────────────────────────────────────────
    stairs.forEach(function (s, i) {
      var lx = Math.min(s.x1, s.x2), rx = Math.max(s.x1, s.x2);
      var ty = Math.min(s.y1, s.y2), by2 = Math.max(s.y1, s.y2);
      ctx.fillStyle = PAL.debugStairFill;
      ctx.fillRect(lx - 2, ty, rx - lx + 4, by2 - ty);
      ctx.strokeStyle = PAL.debugStairOutline;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(lx - 2, ty, rx - lx + 4, by2 - ty);
      ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(lx - 2, ty - 8, 55, 7);
      ctx.fillStyle = PAL.debugOrange;
      ctx.fillText('S' + i + ' (' + s.x1 + ',' + s.y1 + ')→(' + s.x2 + ',' + s.y2 + ')', lx - 1, ty - 2);
      ctx.fillStyle = PAL.debugOrangeR;
      ctx.fillRect(s.x1 - 1, s.y1 - 1, 3, 3);
      ctx.fillRect(s.x2 - 1, s.y2 - 1, 3, 3);

      // Entry zones — parallelograms following the stair line ±14px (cy tolerance from getStairAt).
      // Red = nearBottom (t<0.15, enter going up). Blue = nearTop (t>0.85, enter going down).
      var dx = s.x2 - s.x1, dy = s.y2 - s.y1;
      var MX = 6, MY = 14;  // same margins as getStairAt
      var gr = s.x2 > s.x1;
      var okUpLabel  = gr ? '↑ up+→' : '↑ up+←';
      var okDnLabel  = gr ? '↓ dn+←' : '↓ dn+→';
      [[0, 0.15, 'rgba(255,60,60,0.45)', okUpLabel],
       [0.85, 1, 'rgba(60,120,255,0.45)', okDnLabel]].forEach(function (z) {
        var t0 = z[0], t1 = z[1], col = z[2], lab = z[3];
        var ax = s.x1 + t0 * dx, ay = s.y1 + t0 * dy;
        var bx = s.x1 + t1 * dx, by = s.y1 + t1 * dy;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(ax - MX, ay - MY);
        ctx.lineTo(bx - MX, by - MY);
        ctx.lineTo(bx + MX, by + MY);
        ctx.lineTo(ax + MX, ay + MY);
        ctx.closePath();
        ctx.fill();
        // Label at midpoint
        var mx2 = (ax + bx) / 2, my2 = (ay + by) / 2;
        ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(mx2 - 1, my2 - 6, lab.length * 4 + 2, 7);
        ctx.fillStyle = col.replace('0.45', '1'); ctx.fillText(lab, mx2, my2 - 1);
      });
    });

    // ── Oggetti di livello (dashed, da CONFIG.scene.dashed) ──────────────────

    // Bags
    bags.forEach(function (b, i) {
      _dashedObj(b, 'bags', PAL.debugBagPurple, 'bag' + i, b.taken);
    });

    // Boards
    BOARDS.forEach(function (b, i) {
      _box(b.x, b.y, BW, BH, PAL.debugBoardGreen, 'brd' + i, false, b.sprayed);
    });

    // Desks
    DESKS.forEach(function (d) {
      _box(d.x, d.y, 20, 11, PAL.debugDeskYellow, null, false);
    });

    // Bell
    _box(BELL.x - 2, BELL.y - 1, 10, 9, PAL.debugBellGold, 'bell', false, BELL.done);

    // Machines (L3)
    if (typeof machines !== 'undefined' && machines) {
      machines.forEach(function (m, i) {
        _dashedObj(m, 'machines', PAL.debugOrange, 'mac' + i, m.broken);
      });
    }

    // GymBall (L4)
    if (typeof gymBall !== 'undefined' && gymBall) {
      _dashedObj(gymBall, 'gymBall', PAL.debugBoardGreen, 'ball', gymBall.deflated);
    }

    // Students (L5) — seduti, hitbox approssimata
    if (typeof students !== 'undefined' && students) {
      students.forEach(function (s, i) {
        _box(s.x - 1, s.y - 12, 10, 14, PAL.debugBlue, 'st' + i, true, s.disturbed);
      });
    }

    // Bookcase (L6)
    if (typeof bookcase !== 'undefined' && bookcase) {
      _dashedObj(bookcase, 'bookcase', PAL.debugBagPurple, 'book', bookcase.fallen);
    }

    // Sink (L7)
    if (typeof sink !== 'undefined' && sink) {
      _dashedObj(sink, 'sink', PAL.debugCyan, 'sink', sink.flooded);
    }

    // Bins (L8)
    if (typeof bins !== 'undefined' && bins) {
      bins.forEach(function (b, i) {
        _dashedObj(b, 'bins', PAL.debugOrange, 'bn' + i, b.exploded);
      });
    }

    // Sprinklers (L9)
    if (typeof sprinklers !== 'undefined' && sprinklers) {
      sprinklers.forEach(function (sp, i) {
        _dashedObj(sp, 'sprinklers', PAL.debugBoardGreen, 'sp' + i, sp.active);
      });
    }

    // Register (L10)
    if (typeof register !== 'undefined' && register) {
      _dashedObj(register, 'register', PAL.debugBellGold, 'reg', register.taken);
    }

    // ExitDoor (L10)
    if (typeof exitDoor !== 'undefined' && exitDoor) {
      _dashedObj(exitDoor, 'exitDoor', PAL.debugPlayerPink, 'exit', exitDone);
    }

    // ── NPC hitbox ───────────────────────────────────────────────────────────
    teachers.forEach(function (t) {
      var label = (t.name || 'tch').substring(0, 5);
      _box(t.x, t.y, PW, PH, t.chasing ? PAL.debugMagenta : PAL.debugBagPurple, label, false);
      // Cono visivo (sight line)
      if (t.sight && !t.chasing) {
        ctx.strokeStyle = PAL.debugBagPurple;
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(t.x + PW / 2, t.y + PH / 2);
        ctx.lineTo(t.x + PW / 2 + (t.dir > 0 ? t.sight : -t.sight), t.y + PH / 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    janitors.forEach(function (jn) {
      _box(jn.x, jn.y, PW, PH, PAL.debugCyan, 'jan', false);
    });

    // ── Player hitbox ────────────────────────────────────────────────────────
    ctx.strokeStyle = PAL.debugPlayerPink;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(player.x, player.y, PW, PH);
    ctx.fillStyle = PAL.debugOverlayBg; ctx.fillRect(player.x, player.y - 8, 36, 7);
    ctx.fillStyle = PAL.debugMagenta;
    ctx.fillText('P(' + Math.round(player.x) + ',' + Math.round(player.y) + ')', player.x + 1, player.y - 2);

    ctx.restore();

    _updateInfoPanel();
  };

  // ── Toggle tasto L ────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      _visible = !_visible;
      if (_info) _info.style.display = _visible ? '' : 'none';
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(_initInfoPanel, 200); });
  } else {
    setTimeout(_initInfoPanel, 200);
  }

})();
