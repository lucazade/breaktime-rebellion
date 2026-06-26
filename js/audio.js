// Audio manager — supports three modes: 'full' (music+sfx), 'sfx' (sfx only), 'mute'
const GameAudio = (function() {
  var mode = localStorage.getItem('btr_audio') || 'full';
  var jingle = null; // { node: BufferSourceNode, gain: GainNode } or null — tracked for stop on restart

  // Preload background music immediately so it is fully buffered before the user clicks start.
  // Without this, after a hard refresh the browser only has ~1s of data and pauses mid-play.
  // Note: element.volume is intentionally omitted — volume is controlled via GainNode after
  // createMediaElementSource() routes these elements through the AudioContext.
  var bgMusic = CONFIG.audio.music ? (function() {
    var a = new Audio(CONFIG.audio.music);
    a.preload = 'auto';
    a.loop    = true;
    return a;
  })() : null;

  var bossMusic = CONFIG.audio.bossMusic ? (function() {
    var a = new Audio(CONFIG.audio.bossMusic);
    a.preload = 'auto';
    a.loop    = true;
    return a;
  })() : null;

  var bonusMusic = CONFIG.audio.bonusMusic ? (function() {
    var a = new Audio(CONFIG.audio.bonusMusic);
    a.preload = 'auto';
    a.loop    = true;
    return a;
  })() : null;

  // Returns the correct game music track for the current level/mode
  function _gameTrack() {
    if (typeof bonusActive !== 'undefined' && bonusActive && bonusMusic) return bonusMusic;
    return (typeof currentLevel !== 'undefined' && currentLevel === LEVELS.length && bossMusic)
      ? bossMusic : bgMusic;
  }
  function _otherTrack() {
    var t = _gameTrack();
    if (t === bonusMusic) return bgMusic;
    return t === bossMusic ? bgMusic : bossMusic;
  }

  var introMusic = CONFIG.audio.introMusic ? (function() {
    var a = new Audio(CONFIG.audio.introMusic);
    a.preload = 'auto';
    a.loop    = true;
    return a;
  })() : null;
  var _introPlayPromise = null;

  // Web Audio API for zero-latency sfx
  var _sfxRaw     = {};  // name → ArrayBuffer (prefetched)
  var _audioCtx   = null;
  var _warmedUp   = false;
  var _sfxBuffers = {};  // name → AudioBuffer (decoded, ready to play)

  // GainNodes for each music track — created by _createMusicSources() via createMediaElementSource().
  // All music volume is controlled through these nodes so music and sfx share one hardware stream.
  var _bgMusicGain    = null;
  var _bossMusicGain  = null;
  var _bonusMusicGain = null;
  var _introMusicGain = null;

  function _gainFor(track) {
    if (track === bgMusic)    return _bgMusicGain;
    if (track === bossMusic)  return _bossMusicGain;
    if (track === bonusMusic) return _bonusMusicGain;
    if (track === introMusic) return _introMusicGain;
    return null;
  }

  // Route each music HTMLMediaElement through the AudioContext so all audio — music and sfx —
  // shares one hardware output stream. This eliminates Android hardware mixer reconfiguration
  // pops that occur when two separate streams (HTMLMediaElement + WebAudio) coexist.
  // Must be called after _audioCtx is created. Safe to call multiple times (guarded by null check).
  function _createMusicSources() {
    if (!_audioCtx) return;
    function _wire(el) {
      var src = _audioCtx.createMediaElementSource(el);
      var g   = _audioCtx.createGain();
      g.gain.value = CONFIG.audio.musicVolume;
      src.connect(g);
      g.connect(_audioCtx.destination);
      return g;
    }
    if (bgMusic    && !_bgMusicGain)    _bgMusicGain    = _wire(bgMusic);
    if (bossMusic  && !_bossMusicGain)  _bossMusicGain  = _wire(bossMusic);
    if (bonusMusic && !_bonusMusicGain) _bonusMusicGain = _wire(bonusMusic);
    if (introMusic && !_introMusicGain) _introMusicGain = _wire(introMusic);
  }

  // Fades a GainNode to targetVol over durationMs, then calls optional cb
  function _fadeGain(gainNode, targetVol, durationMs, cb) {
    if (!gainNode) { if (cb) cb(); return; }
    var steps    = 20;
    var interval = Math.round(durationMs / steps);
    var startVol = gainNode.gain.value;
    var delta    = (targetVol - startVol) / steps;
    var count    = 0;
    var t = setInterval(function() {
      count++;
      gainNode.gain.value = Math.max(0, Math.min(1, startVol + delta * count));
      if (count >= steps) {
        clearInterval(t);
        gainNode.gain.value = Math.max(0, Math.min(1, targetVol));
        if (cb) cb();
      }
    }, interval);
    return t;
  }

  function setMode(m) {
    mode = m;
    localStorage.setItem('btr_audio', m);
    if (mode !== 'full') {
      // Fade out before pausing to prevent hardware speaker pop
      [introMusic, bgMusic, bossMusic, bonusMusic].forEach(function(t) {
        if (!t || t.paused) return;
        _fadeGain(_gainFor(t), 0, 100, function() {
          if (mode !== 'full') t.pause();
          else _gainFor(t).gain.value = CONFIG.audio.musicVolume; // restore if user switched back
        });
      });
    }
    // Callers resume the right track after switching back to 'full'
  }

  function getMode() { return mode; }

  function stopJingle() {
    if (!jingle) return;
    var node = jingle.node, g = jingle.gain;
    jingle = null;
    // Fade gain to zero before stopping to avoid a click at sample level
    if (g && _audioCtx) {
      g.gain.cancelScheduledValues(_audioCtx.currentTime);
      g.gain.setValueAtTime(g.gain.value, _audioCtx.currentTime);
      g.gain.linearRampToValueAtTime(0, _audioCtx.currentTime + 0.05);
      setTimeout(function() { try { node.stop(); } catch(e) {} }, 60);
    } else {
      try { node.stop(); } catch(e) {}
    }
  }

  function playIntro() {
    if (!introMusic || mode !== 'full') return;
    introMusic.currentTime = 0;
    // Start silent so hardware amp activates inaudibly, then snap to full volume.
    // Do NOT use _fadeGain here: discrete steps cause audible distortion on the intro's first notes.
    if (_introMusicGain) _introMusicGain.gain.value = 0;
    _introPlayPromise = introMusic.play() || null;
    if (_introPlayPromise) _introPlayPromise.catch(function() {});
    setTimeout(function() {
      if (introMusic && !introMusic.paused && mode === 'full' && _introMusicGain)
        _introMusicGain.gain.value = CONFIG.audio.musicVolume;
    }, 30);
  }

  function stopIntro() {
    if (!introMusic) return;
    var p = _introPlayPromise;
    _introPlayPromise = null;
    if (p) {
      // play() still pending — pause as soon as it resolves, unless a new play() started
      p.then(function() { if (!_introPlayPromise) { introMusic.pause(); introMusic.currentTime = 0; } }).catch(function() {});
    } else if (!introMusic.paused) {
      introMusic.pause(); introMusic.currentTime = 0;
    }
  }

  // Fade out intro independently (no callback chain) — use with CSS transitionend
  function fadeOutIntro(durationMs) {
    if (!introMusic) return;
    if (_introPlayPromise) { stopIntro(); return; }   // #114: play() pending — cancel it
    if (introMusic.paused) return;
    _fadeGain(_introMusicGain, 0, durationMs || 1200, stopIntro);
  }

  // Fade out game music over durationMs then call optional cb
  function fadeOutMusic(durationMs, cb) {
    var t = _gameTrack();
    if (!t) { if (cb) cb(); return; }
    _fadeGain(_gainFor(t), 0, durationMs || 1000, function() {
      t.pause(); t.currentTime = 0;
      if (cb) cb();
    });
  }

  // Called on first user gesture. Resumes the AudioContext (already created at module init)
  // and plays a warmup buffer so the hardware pipeline is active before any real sound.
  function primeAudio() {
    _initWebAudio();
    if (!_audioCtx) return;
    if (_audioCtx.state === 'suspended') {
      _audioCtx.resume().then(_warmupAudio).catch(function() {});
    } else {
      _warmupAudio();
    }
  }

  function playMusic() {
    _initWebAudio();
    stopJingle();
    if (mode !== 'full') return;
    var track = _gameTrack();
    // Fade out and stop all game tracks that aren't the current one
    [bgMusic, bossMusic, bonusMusic].forEach(function(t) {
      if (!t || t === track) return;
      if (!t.paused) {
        _fadeGain(_gainFor(t), 0, 100, function() { t.pause(); t.currentTime = 0; });
      } else {
        t.currentTime = 0;
      }
    });
    if (!track) return;
    track.currentTime = 0;
    track.playbackRate = 1.0;
    var g = _gainFor(track);
    if (g) g.gain.value = CONFIG.audio.musicVolume;
    track.play().catch(function() {});
  }

  function stopMusic() {
    [bgMusic, bossMusic, bonusMusic].forEach(function(t) {
      if (!t) return;
      if (t.paused) { t.currentTime = 0; return; }
      _fadeGain(_gainFor(t), 0, 100, function() { t.pause(); t.currentTime = 0; });
    });
  }

  function pauseMusic() {
    var t = _gameTrack();
    if (!t || t.paused) return;
    _fadeGain(_gainFor(t), 0, 100, function() { t.pause(); });
  }

  function resumeMusic() {
    var t = _gameTrack();
    if (!t || mode !== 'full') return;
    var g = _gainFor(t);
    if (g) g.gain.value = CONFIG.audio.musicVolume; // restore if paused during a fade
    t.play().catch(function() {});
  }

  Object.keys(CONFIG.audio.sfx).forEach(function(name) {
    var url = CONFIG.audio.sfx[name];
    if (!url) return;
    fetch(url).then(function(r) { return r.arrayBuffer(); }).then(function(buf) {
      _sfxRaw[name] = buf;
      if (_audioCtx && !_sfxBuffers[name]) {
        _audioCtx.decodeAudioData(buf.slice(0), function(decoded) { _sfxBuffers[name] = decoded; }, function() {});
      }
    }).catch(function() {});
  });

  function _initWebAudio() {
    if (_audioCtx) return;
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return; }
    Object.keys(_sfxRaw).forEach(function(name) {
      if (!_sfxRaw[name] || _sfxBuffers[name]) return;
      _audioCtx.decodeAudioData(_sfxRaw[name].slice(0), function(buf) { _sfxBuffers[name] = buf; }, function() {});
    });
    // Wire all music elements through the AudioContext so everything shares one hardware stream
    _createMusicSources();
  }

  // Plays a 1-sample near-silent buffer to activate the Android hardware audio pipeline
  // before any real audio starts. Prevents the amplifier activation pop on first playback.
  // Must only be called when _audioCtx.state === 'running'.
  function _warmupAudio() {
    if (!_audioCtx || _audioCtx.state !== 'running' || _warmedUp) return;
    _warmedUp = true;
    try {
      var buf = _audioCtx.createBuffer(1, 1, _audioCtx.sampleRate);
      var src = _audioCtx.createBufferSource();
      src.buffer = buf;
      var g = _audioCtx.createGain();
      g.gain.value = 0.001;
      src.connect(g); g.connect(_audioCtx.destination);
      src.start(0);
    } catch(e) {}
  }

  function _sfxFallback(name, cb) {
    var url = CONFIG.audio.sfx[name];
    if (!url) { if (cb) cb(); return; }
    var a = new Audio(url);
    a.volume = CONFIG.audio.sfxVolume;
    if (cb) a.addEventListener('ended', cb);
    a.play().catch(function() { if (cb) cb(); });
  }

  function playSfx(name) {
    if (mode === 'mute') return;
    if (_audioCtx && _sfxBuffers[name]) {
      if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(function() {});
      var src = _audioCtx.createBufferSource();
      src.buffer = _sfxBuffers[name];
      var gain = _audioCtx.createGain();
      gain.gain.value = CONFIG.audio.sfxVolume;
      src.connect(gain); gain.connect(_audioCtx.destination);
      src.start(0);
      return;
    }
    _sfxFallback(name, null);
  }

  // Like playSfx but calls cb when the sound finishes playing.
  // In mute mode cb is called immediately (the sound won't play).
  function playSfxThen(name, cb) {
    if (mode === 'mute') { if (cb) cb(); return; }
    if (_audioCtx && _sfxBuffers[name]) {
      if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(function() {});
      var src = _audioCtx.createBufferSource();
      src.buffer = _sfxBuffers[name];
      var gain = _audioCtx.createGain();
      gain.gain.value = CONFIG.audio.sfxVolume;
      src.connect(gain); gain.connect(_audioCtx.destination);
      if (cb) src.onended = cb;
      src.start(0);
      return;
    }
    _sfxFallback(name, cb);
  }

  // Synthesised score-counting tick — crisp, zero-latency, no sample-overlap muddiness.
  // Replaces the old sampled 'scoreTick' (hit.ogg) that lagged and stuttered when
  // fired every few frames during the end-of-level bonus count-up.
  function playTick() {
    if (mode === 'mute' || !_audioCtx) return;
    if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(function() {});
    var t = _audioCtx.currentTime;
    var osc = _audioCtx.createOscillator();
    var gain = _audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1320, t);
    var vol = CONFIG.audio.sfxVolume * 0.35;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(gain); gain.connect(_audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Jingles (win/gameover) use WebAudio BufferSource — same pipeline as sfx, no new HTMLMediaElement.
  function playJingle(name) {
    stopJingle();
    if (mode !== 'full') return;
    if (!_audioCtx || !_sfxBuffers[name]) return;
    var src = _audioCtx.createBufferSource();
    src.buffer = _sfxBuffers[name];
    var g = _audioCtx.createGain();
    g.gain.value = CONFIG.audio.sfxVolume;
    src.connect(g); g.connect(_audioCtx.destination);
    src.start(0);
    jingle = { node: src, gain: g };
  }

  function setMusicRate(rate) {
    var t = _gameTrack();
    if (t) t.playbackRate = rate;
  }

  // Create AudioContext at module load — before any HTMLMediaElement starts playing.
  // In Capacitor WebView (autoplay allowed) this runs immediately in 'running' state,
  // so the WebAudio pipeline is established before intro music starts, preventing the
  // hardware mixer reconfiguration pop on first tap. In browser it starts 'suspended'
  // and gets resumed + warmed up on the first user gesture via primeAudio().
  _initWebAudio();
  if (_audioCtx && _audioCtx.state === 'running') _warmupAudio();

  return { primeAudio: primeAudio, playIntro: playIntro, stopIntro: stopIntro, fadeOutIntro: fadeOutIntro, fadeOutMusic: fadeOutMusic, playMusic: playMusic, stopMusic: stopMusic, pauseMusic: pauseMusic, resumeMusic: resumeMusic, playSfx: playSfx, playSfxThen: playSfxThen, playTick: playTick, playJingle: playJingle, stopJingle: stopJingle, setMode: setMode, getMode: getMode, setMusicRate: setMusicRate };
})();
