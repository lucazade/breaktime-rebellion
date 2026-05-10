// Input — keyboard, touch buttons, analog joystick
const K = {left:false, right:false, up:false, down:false, action:false};

document.addEventListener('keydown', function(e) {
  if (e.code === 'ArrowLeft')  K.left = true;
  if (e.code === 'ArrowRight') K.right = true;
  if (e.code === 'ArrowUp')    K.up = true;
  if (e.code === 'ArrowDown')  K.down = true;
  if (e.code === 'KeyZ' || e.code === 'Space') { K.action = true; actionPressed = true; }
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].indexOf(e.code) >= 0) e.preventDefault();
});
document.addEventListener('keyup', function(e) {
  if (e.code === 'ArrowLeft')  K.left = false;
  if (e.code === 'ArrowRight') K.right = false;
  if (e.code === 'ArrowUp')    K.up = false;
  if (e.code === 'ArrowDown')  K.down = false;
  if (e.code === 'KeyZ' || e.code === 'Space') K.action = false;
});

function bindBtn(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  function on(e)  { e.preventDefault(); K[key] = true;  if (key === 'action') actionPressed = true; el.classList.add('pressed'); }
  function off(e) { e.preventDefault(); K[key] = false; el.classList.remove('pressed'); }
  el.addEventListener('touchstart',  on,  {passive:false});
  el.addEventListener('touchend',    off, {passive:false});
  el.addEventListener('touchcancel', off, {passive:false});
  el.addEventListener('mousedown',   on);
  el.addEventListener('mouseup',     off);
  el.addEventListener('mouseleave',  off);
}
bindBtn('bL','left'); bindBtn('bR','right');
bindBtn('bU','up');   bindBtn('bD','down');

const bA = document.getElementById('btn-action');
function onA(e)  { e.preventDefault(); K.action = true;  actionPressed = true; bA.classList.add('pressed'); }
function offA(e) { e.preventDefault(); K.action = false; bA.classList.remove('pressed'); }
bA.addEventListener('touchstart',  onA,  {passive:false});
bA.addEventListener('touchend',    offA, {passive:false});
bA.addEventListener('touchcancel', offA, {passive:false});
bA.addEventListener('mousedown',   onA);
bA.addEventListener('mouseup',     offA);
bA.addEventListener('mouseleave',  offA);

// Analog joystick
(function() {
  const zone = document.getElementById('ctrl-joy');
  const knob = document.getElementById('joy-knob');
  if (!zone || !knob) return;

  var active = false, cx = 0, cy = 0;
  var RADIUS = 33, DEAD = 10;

  function joyStart(e) {
    e.preventDefault();
    active = true;
    var r = zone.getBoundingClientRect();
    cx = r.left + r.width  / 2;
    cy = r.top  + r.height / 2;
    joyUpdate(e);
  }
  function joyMove(e) { if (active) { e.preventDefault(); joyUpdate(e); } }
  function joyEnd(e) {
    e.preventDefault();
    active = false;
    knob.style.transform = '';
    K.left = K.right = K.up = K.down = false;
  }
  function joyUpdate(e) {
    var t = e.touches ? e.touches[0] : e;
    var dx = t.clientX - cx;
    var dy = t.clientY - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var c = Math.min(dist, RADIUS) / (dist || 1);
    knob.style.transform = 'translate(' + (dx * c) + 'px,' + (dy * c) + 'px)';
    K.left  = dx < -DEAD;
    K.right = dx >  DEAD;
    K.up    = dy < -DEAD;
    K.down  = dy >  DEAD;
  }

  zone.addEventListener('touchstart',  joyStart, {passive:false});
  zone.addEventListener('touchmove',   joyMove,  {passive:false});
  zone.addEventListener('touchend',    joyEnd,   {passive:false});
  zone.addEventListener('touchcancel', joyEnd,   {passive:false});
  zone.addEventListener('mousedown',   joyStart);
  zone.addEventListener('mousemove',   joyMove);
  zone.addEventListener('mouseup',     joyEnd);
  zone.addEventListener('mouseleave',  joyEnd);
})();

document.getElementById('overlay').addEventListener('click', startGame);
document.getElementById('overlay').addEventListener('touchstart', function(e) { e.preventDefault(); startGame(); }, {passive:false});
