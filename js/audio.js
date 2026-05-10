// Audio manager — silent fallback when files are missing
const GameAudio = (function() {
  var bgMusic = null;

  function playMusic() {
    if (!CONFIG.audio.music) return;
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
    var src = CONFIG.audio.sfx[name];
    if (!src) return;
    var s = new Audio(src);
    s.volume = CONFIG.audio.sfxVolume;
    s.play().catch(function() {});
  }

  return { playMusic: playMusic, stopMusic: stopMusic, playSfx: playSfx };
})();
