// Title screen — service worker only (UI and interaction moved to canvas)
(function() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  GameAudio.playIntro();
})();
