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
      if (bgMusic)    bgMusic.pause();
      if (introMusic) introMusic.pause();
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
    introMusic.volume = CONFIG.audio.musicVolume;
    _introPlayPromise = introMusic.play() || null;
    if (_introPlayPromise) _introPlayPromise.catch(function() {});
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

  function playMusic() {
    stopJingle();
    if (mode !== 'full') return;
    var track = _gameTrack(), other = _otherTrack();
    if (other) { other.pause(); other.currentTime = 0; }
    if (!track) return;
    track.currentTime = 0;
    track.volume = CONFIG.audio.musicVolume;
    track.play().catch(function() {});
  }

  function stopMusic() {
    if (bgMusic)   { bgMusic.pause();   bgMusic.currentTime = 0; }
    if (bossMusic) { bossMusic.pause(); bossMusic.currentTime = 0; }
  }

  function pauseMusic() {
    var t = _gameTrack(); if (t) t.pause();
  }

  function resumeMusic() {
    var t = _gameTrack(); if (t && mode === 'full') t.play().catch(function() {});
  }

  // Preload sfx — cloneNode() è istantaneo rispetto a new Audio() ogni volta
  var _sfxCache = {};
  Object.keys(CONFIG.audio.sfx).forEach(function(name) {
    var a = new Audio(CONFIG.audio.sfx[name]);
    a.preload = 'auto';
    _sfxCache[name] = a;
  });

  function playSfx(name) {
    if (mode === 'mute') return;
    var cached = _sfxCache[name];
    if (!cached) return;
    var s = cached.cloneNode();
    s.volume = CONFIG.audio.sfxVolume;
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

  return { playIntro: playIntro, stopIntro: stopIntro, fadeOutIntro: fadeOutIntro, fadeOutMusic: fadeOutMusic, playMusic: playMusic, stopMusic: stopMusic, pauseMusic: pauseMusic, resumeMusic: resumeMusic, playSfx: playSfx, playJingle: playJingle, setMode: setMode, getMode: getMode };
})();
