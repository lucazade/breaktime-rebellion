// Audio manager — supports three modes: 'full' (music+sfx), 'sfx' (sfx only), 'mute'
const GameAudio = (function() {
  var mode = localStorage.getItem('btr_audio') || 'full';
  var jingle = null; // tracked so it can be stopped on restart (win/gameover sounds)

  // Preload background music immediately so it is fully buffered before the user clicks start.
  // Without this, after a hard refresh the browser only has ~1s of data and pauses mid-play.
  var bgMusic = CONFIG.audio.music ? (function() {
    var a = new Audio(CONFIG.audio.music);
    a.preload = 'auto';
    a.loop    = true;
    a.volume  = CONFIG.audio.musicVolume;
    return a;
  })() : null;

  var bossMusic = CONFIG.audio.bossMusic ? (function() {
    var a = new Audio(CONFIG.audio.bossMusic);
    a.preload = 'auto';
    a.loop    = true;
    a.volume  = CONFIG.audio.musicVolume;
    return a;
  })() : null;

  // Returns the correct game music track for the current level
  function _gameTrack() {
    return (typeof currentLevel !== 'undefined' && currentLevel === LEVELS.length && bossMusic)
      ? bossMusic : bgMusic;
  }
  function _otherTrack() {
    return _gameTrack() === bossMusic ? bgMusic : bossMusic;
  }

  var introMusic = CONFIG.audio.introMusic ? (function() {
    var a = new Audio(CONFIG.audio.introMusic);
    a.preload = 'auto';
    a.loop    = true;
    a.volume  = CONFIG.audio.musicVolume;
    return a;
  })() : null;
  var _introPlayPromise = null;

  // Fades audio to targetVol over durationMs; returns interval id
  function _fadeAudio(audio, targetVol, durationMs, cb) {
    var steps    = 20;
    var interval = Math.round(durationMs / steps);
    var startVol = audio.volume;
    var delta    = (targetVol - startVol) / steps;
    var count    = 0;
    var t = setInterval(function() {
      count++;
      audio.volume = Math.max(0, Math.min(1, startVol + delta * count));
      if (count >= steps) {
        clearInterval(t);
        audio.volume = Math.max(0, Math.min(1, targetVol));
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
      [introMusic, bgMusic, bossMusic].forEach(function(t) {
        if (!t || t.paused) return;
        _fadeAudio(t, 0, 100, function() {
          if (mode !== 'full') t.pause();
          else t.volume = CONFIG.audio.musicVolume; // restore if user switched back
        });
      });
    }
    // Callers resume the right track after switching back to 'full'
  }

  function getMode() { return mode; }

  function stopJingle() {
    if (jingle) { jingle.pause(); jingle.currentTime = 0; jingle = null; }
  }

  function playIntro() {
    if (!introMusic || mode !== 'full') return;
    introMusic.currentTime = 0;
    introMusic.volume = 0; // start silent so hardware amp activates inaudibly, then snap to full
    _introPlayPromise = introMusic.play() || null;
    if (_introPlayPromise) _introPlayPromise.catch(function() {});
    setTimeout(function() {
      if (introMusic && !introMusic.paused && mode === 'full')
        introMusic.volume = CONFIG.audio.musicVolume;
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
    _fadeAudio(introMusic, 0, durationMs || 1200, stopIntro);
  }

  // Fade out game music over durationMs then call optional cb
  function fadeOutMusic(durationMs, cb) {
    var t = _gameTrack();
    if (!t) { if (cb) cb(); return; }
    _fadeAudio(t, 0, durationMs || 1000, function() {
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
    var track = _gameTrack(), other = _otherTrack();
    if (other) { other.pause(); other.currentTime = 0; }
    if (!track) return;
    track.currentTime = 0;
    track.playbackRate = 1.0;
    track.volume = CONFIG.audio.musicVolume;
    track.play().catch(function() {});
  }

  function stopMusic() {
    [bgMusic, bossMusic].forEach(function(t) {
      if (!t) return;
      if (t.paused) { t.currentTime = 0; return; }
      _fadeAudio(t, 0, 100, function() { t.pause(); t.currentTime = 0; });
    });
  }

  function pauseMusic() {
    var t = _gameTrack();
    if (!t || t.paused) return;
    _fadeAudio(t, 0, 100, function() { t.pause(); });
  }

  function resumeMusic() {
    var t = _gameTrack();
    if (!t || mode !== 'full') return;
    t.volume = CONFIG.audio.musicVolume; // restore if paused during a fade
    t.play().catch(function() {});
  }

  // Web Audio API for zero-latency sfx; fallback to cloneNode if unavailable
  var _sfxCache   = {};  // name → Audio element (fallback)
  var _sfxRaw     = {};  // name → ArrayBuffer (prefetched)
  var _audioCtx   = null;
  var _sfxBuffers = {};  // name → AudioBuffer (decoded, ready to play)

  Object.keys(CONFIG.audio.sfx).forEach(function(name) {
    var url = CONFIG.audio.sfx[name];
    fetch(url).then(function(r) { return r.arrayBuffer(); }).then(function(buf) {
      _sfxRaw[name] = buf;
      if (_audioCtx && !_sfxBuffers[name]) {
        _audioCtx.decodeAudioData(buf.slice(0), function(decoded) { _sfxBuffers[name] = decoded; }, function() {});
      }
    }).catch(function() {});
    var a = new Audio(url); a.preload = 'auto'; _sfxCache[name] = a;
  });

  function _initWebAudio() {
    if (_audioCtx) return;
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return; }
    Object.keys(_sfxRaw).forEach(function(name) {
      if (!_sfxRaw[name] || _sfxBuffers[name]) return;
      _audioCtx.decodeAudioData(_sfxRaw[name].slice(0), function(buf) { _sfxBuffers[name] = buf; }, function() {});
    });
  }

  // Plays a 1-sample near-silent buffer to activate the Android hardware audio pipeline
  // before any real audio starts. Prevents the amplifier activation pop on first playback.
  // Must only be called when _audioCtx.state === 'running'.
  function _warmupAudio() {
    if (!_audioCtx || _audioCtx.state !== 'running') return;
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
    var cached = _sfxCache[name];
    if (!cached) return;
    var s = cached.cloneNode(); s.volume = CONFIG.audio.sfxVolume; s.play().catch(function() {});
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
    var cached = _sfxCache[name];
    if (!cached) { if (cb) cb(); return; }
    var s = cached.cloneNode();
    s.volume = CONFIG.audio.sfxVolume;
    if (cb) s.addEventListener('ended', cb);
    s.play().catch(function() {});
  }

  function playJingle(name) {
    stopJingle();
    if (mode !== 'full') return; // jingles are music — silent in sfx-only and mute modes
    var src = CONFIG.audio.sfx[name];
    if (!src) return;
    jingle = new Audio(src);
    jingle.volume = CONFIG.audio.sfxVolume;
    jingle.play().catch(function() {});
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

  return { primeAudio: primeAudio, playIntro: playIntro, stopIntro: stopIntro, fadeOutIntro: fadeOutIntro, fadeOutMusic: fadeOutMusic, playMusic: playMusic, stopMusic: stopMusic, pauseMusic: pauseMusic, resumeMusic: resumeMusic, playSfx: playSfx, playSfxThen: playSfxThen, playJingle: playJingle, stopJingle: stopJingle, setMode: setMode, getMode: getMode, setMusicRate: setMusicRate };
})();
