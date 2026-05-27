// Perf debug overlay — attivato da ?perf=1 nell'URL
// Wrappa requestAnimationFrame per misurare la durata del callback di ogni frame.
// Pannello top-left: FPS, frame time, sparkline, contatori live particelle/testi.
// Tasto P per toggle. Nessun effetto senza ?perf=1 — sicuro in produzione.

(function () {
  'use strict';

  if (!/[?&]perf=1/.test(location.search)) return;

  // ── Costanti ──────────────────────────────────────────────────────────────
  var N       = 120;          // frame da tenere (~2s a 60fps)
  var MS60    = 1000 / 60;    // 16.67ms = soglia 60fps
  var MS30    = 1000 / 30;    // 33.33ms = soglia 30fps
  var MAX_MS  = 50;           // full-scale sparkline
  var SPARK_W = 120;          // larghezza sparkline CSS px
  var SPARK_H = 28;           // altezza sparkline CSS px

  // ── Stato ─────────────────────────────────────────────────────────────────
  var _visible = true;
  var _times   = new Float32Array(N); // ring buffer durate callback (ms)
  var _wptr    = 0;   // write pointer
  var _total   = 0;   // frame totali misurati

  var _panel, _statsEl, _sparkCv, _sparkCx;

  // ── RAF wrap ──────────────────────────────────────────────────────────────
  // Misura esattamente il tempo speso nel callback del loop di gioco.
  var _raf0 = window.requestAnimationFrame;
  window.requestAnimationFrame = function (cb) {
    return _raf0.call(window, function (ts) {
      var t0 = performance.now();
      cb(ts);
      var dt = performance.now() - t0;
      _times[_wptr % N] = dt;
      _wptr++; _total++;
      if (_visible && _panel) _update();
    });
  };

  // ── Calcoli statistiche ────────────────────────────────────────────────────
  function _calc() {
    var n = Math.min(_total, N);
    if (n === 0) return { fps: 0, worst: 0, last: 0, avg: 0 };
    var sum = 0, worst = 0;
    for (var i = 0; i < n; i++) {
      var v = _times[i];
      sum  += v;
      if (v > worst) worst = v;
    }
    var avg  = sum / n;
    var last = _times[(_wptr - 1 + N) % N];
    return {
      fps:   Math.round(1000 / Math.max(avg, 1)),
      avg:   avg,
      worst: worst,
      last:  last,
    };
  }

  // ── Sparkline ─────────────────────────────────────────────────────────────
  var SW2 = SPARK_W * 2, SH2 = SPARK_H * 2; // dimensioni canvas reali (2×)

  // ms → coordinata Y canvas (0ms = fondo, MAX_MS = cima)
  function _ry(ms) { return SH2 * (1 - Math.min(ms, MAX_MS) / MAX_MS); }

  function _drawSparkline() {
    var cx = _sparkCx;
    cx.clearRect(0, 0, SW2, SH2);

    // sfondo
    cx.fillStyle = 'rgba(0,0,0,0.35)';
    cx.fillRect(0, 0, SW2, SH2);

    // linee di riferimento 60fps / 30fps
    cx.lineWidth = 1;
    cx.setLineDash([4, 4]);
    cx.strokeStyle = 'rgba(0,255,80,0.35)';
    cx.beginPath(); cx.moveTo(0, _ry(MS60)); cx.lineTo(SW2, _ry(MS60)); cx.stroke();
    cx.strokeStyle = 'rgba(255,210,0,0.35)';
    cx.beginPath(); cx.moveTo(0, _ry(MS30)); cx.lineTo(SW2, _ry(MS30)); cx.stroke();
    cx.setLineDash([]);

    // barre
    var n  = Math.min(_total, N);
    var bw = SW2 / N;
    for (var i = 0; i < N; i++) {
      // ring buffer: ordine cronologico (oldest→newest, oldest = sinistra)
      var ri = (_wptr - n + i + N * 10) % N;
      var v  = (i < n) ? _times[ri] : 0;
      if (v <= 0) continue;
      var bh = Math.max(2, SH2 * Math.min(v, MAX_MS) / MAX_MS);
      cx.fillStyle = v <= MS60 ? 'rgba(0,255,80,0.75)'  :
                     v <= MS30 ? 'rgba(255,210,0,0.85)'  :
                                 'rgba(255,55,30,0.90)';
      cx.fillRect(
        Math.round(i * bw),
        SH2 - bh,
        Math.max(1, Math.floor(bw) - 1),
        bh
      );
    }
  }

  // ── Panel HTML helpers ────────────────────────────────────────────────────
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

  // ── Update panel ──────────────────────────────────────────────────────────
  function _update() {
    var s = _calc();

    var cFps  = s.fps   >= 55 ? '#55cc66' : s.fps   >= 30 ? '#ffcc22' : '#ff4422';
    var cLast = s.last  <= MS60 ? '#55cc66' : s.last  <= MS30 ? '#ffcc22' : '#ff4422';
    var cAvg  = s.avg   <= MS60 ? '#55cc66' : '#ffcc22';
    var cWorst= s.worst <= MS60 ? '#55cc66' : s.worst <= MS30 ? '#ffcc22' : '#ff4422';

    var html = _section('FRAME');
    html += _row('fps',    s.fps,                                     cFps);
    html += _row('last',   s.last.toFixed(1)  + ' ms',               cLast);
    html += _row('avg',    s.avg.toFixed(1)   + ' ms',               cAvg);
    html += _row('worst',  s.worst.toFixed(1) + ' ms  (' +
                           Math.round(1000 / Math.max(s.worst, 1)) + ' fps)', cWorst);

    // Contatori oggetti live (leggono variabili globali del gioco)
    var hasParts = typeof particles     !== 'undefined';
    var hasTexts = typeof floatingTexts !== 'undefined';
    if (hasParts || hasTexts) {
      html += _section('OBJECTS');
      if (hasParts) {
        var pc = particles.length;
        html += _row('particles', pc,
          pc > 80 ? '#ff4422' : pc > 30 ? '#ffcc22' : '#bbb');
      }
      if (hasTexts) {
        var tc = floatingTexts.length;
        html += _row('texts', tc, tc > 10 ? '#ffcc22' : '#bbb');
      }
    }

    _statsEl.innerHTML = html;
    _drawSparkline();
  }

  // ── Init panel ────────────────────────────────────────────────────────────
  function _initPanel() {
    _panel = document.createElement('div');
    _panel.style.cssText =
      'position:fixed;top:8px;left:8px;z-index:9999;' +
      'background:rgba(4,0,14,0.93);border:1px solid rgba(160,0,255,0.55);' +
      'border-radius:4px;padding:8px 10px;' +
      'font-family:monospace;font-size:10px;color:#bbb;' +
      'pointer-events:none;' +
      'box-shadow:0 0 24px rgba(0,0,0,0.8),0 0 0 1px #04000e;';

    var title = document.createElement('div');
    title.style.cssText =
      'color:rgba(160,0,255,0.9);font-size:9px;letter-spacing:1px;' +
      'margin-bottom:5px;border-bottom:1px solid #1a1a2a;padding-bottom:5px;';
    title.innerHTML = 'BTR PERF<br>' +
      '<span style="color:#444;font-weight:normal;font-size:8px;">P = toggle</span>';

    _statsEl = document.createElement('div');

    _sparkCv = document.createElement('canvas');
    _sparkCv.width  = SW2;
    _sparkCv.height = SH2;
    _sparkCv.style.cssText =
      'display:block;width:' + SPARK_W + 'px;height:' + SPARK_H + 'px;' +
      'margin-top:8px;border-radius:2px;border:1px solid rgba(160,0,255,0.20);';
    _sparkCx = _sparkCv.getContext('2d');

    _panel.appendChild(title);
    _panel.appendChild(_statsEl);
    _panel.appendChild(_sparkCv);
    document.body.appendChild(_panel);
  }

  // ── Toggle tasto P ────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      _visible = !_visible;
      if (_panel) _panel.style.display = _visible ? '' : 'none';
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(_initPanel, 200); });
  } else {
    setTimeout(_initPanel, 200);
  }

})();
