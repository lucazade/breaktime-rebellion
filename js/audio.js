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

  function setMode(m) {
    mode = m;
    localStorage.setItem('btr_audio', m);
    if (bgMusic) {
      if (mode === 'full') bgMusic.play().catch(function() {});
      else bgMusic.pause();
    }
  }

  function getMode() { return mode; }

  function stopJingle() {
    if (jingle) { jingle.pause(); jingle.currentTime = 0; jingle = null; }
  }

  function playMusic() {
    stopJingle();
    if (!bgMusic || mode !== 'full') return;
    bgMusic.currentTime = 0;
    bgMusic.play().catch(function() {});
  }

  function stopMusic() {
    if (bgMusic) { bgMusic.pause(); bgMusic.currentTime = 0; }
  }

  function pauseMusic() {
    if (bgMusic) bgMusic.pause();
  }

  function resumeMusic() {
    if (bgMusic && mode === 'full') bgMusic.play().catch(function() {});
  }

  function playSfx(name) {
    if (mode === 'mute') return;
    var src = CONFIG.audio.sfx[name];
    if (!src) return;
    var s = new Audio(src);
    s.volume = CONFIG.audio.sfxVolume;
    s.play().catch(function() {});
  }

  function playJingle(name) {
    stopJingle();
    if (mode === 'mute') return;
    var src = CONFIG.audio.sfx[name];
    if (!src) return;
    jingle = new Audio(src);
    jingle.volume = CONFIG.audio.sfxVolume;
    jingle.play().catch(function() {});
  }

  return { playMusic: playMusic, stopMusic: stopMusic, pauseMusic: pauseMusic, resumeMusic: resumeMusic, playSfx: playSfx, playJingle: playJingle, setMode: setMode, getMode: getMode };
})();
