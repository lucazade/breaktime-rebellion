// Audio manager — supports three modes: 'full' (music+sfx), 'sfx' (sfx only), 'mute'
const GameAudio = (function() {
  var bgMusic = null;
  var mode = localStorage.getItem('btr_audio') || 'full';

  function setMode(m) {
    mode = m;
    localStorage.setItem('btr_audio', m);
    if (bgMusic) {
      if (mode === 'full') bgMusic.play().catch(function() {});
      else bgMusic.pause();
    }
  }

  function getMode() { return mode; }

  function playMusic() {
    if (!CONFIG.audio.music || mode !== 'full') return;
    if (!bgMusic) {
      bgMusic = new Audio(CONFIG.audio.music);
      bgMusic.loop = true;
      bgMusic.volume = CONFIG.audio.musicVolume;
    }
    bgMusic.currentTime = 0;
    bgMusic.play().catch(function() {});
  }

  function stopMusic() {
    if (bgMusic) { bgMusic.pause(); bgMusic.currentTime = 0; }
  }

  function playSfx(name) {
    if (mode === 'mute') return;
    var src = CONFIG.audio.sfx[name];
    if (!src) return;
    var s = new Audio(src);
    s.volume = CONFIG.audio.sfxVolume;
    s.play().catch(function() {});
  }

  return { playMusic: playMusic, stopMusic: stopMusic, playSfx: playSfx, setMode: setMode, getMode: getMode };
})();
