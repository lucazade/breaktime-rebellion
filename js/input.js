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
const panelRight = document.getElementById('panel-right');
function onA(e)  {
  var _t = e.touches ? e.touches[0] : e;
  if (_t.clientY - panelRight.getBoundingClientRect().top < 300) return;
  e.preventDefault(); K.action = true; actionPressed = true; bA.classList.add('pressed');
}
function offA(e) { if (!K.action) return; e.preventDefault(); K.action = false; bA.classList.remove('pressed'); }
// Touch: entire panel-right is the action zone
panelRight.addEventListener('touchstart',  onA,  {passive:false});
panelRight.addEventListener('touchend',    offA, {passive:false});
panelRight.addEventListener('touchcancel', offA, {passive:false});
// Mouse: keep on button for desktop testing
bA.addEventListener('mousedown',  onA);
bA.addEventListener('mouseup',    offA);
bA.addEventListener('mouseleave', offA);

// Raw joystick displacement — used by physics for stair entry dominance check.
// Both zero when joystick inactive (keyboard input or released).
var _joyDX = 0, _joyDY = 0;

// Analog joystick — floating: appears at touch point, snaps back on release
(function() {
  const zone  = document.getElementById('ctrl-joy');
  const knob  = document.getElementById('joy-knob');
  const panel = document.getElementById('panel-left');
  if (!zone || !knob) return;

  var active = false, cx = 0, cy = 0;
  var RADIUS = 33, DEAD = 10;

  function _floatTo(clientX, clientY) {
    var pr = panel.getBoundingClientRect();
    var lx = Math.max(45, Math.min(pr.width - 53, clientX - pr.left));
    var ly = Math.max(60, Math.min(pr.height - 45, clientY - pr.top));
    zone.style.left      = lx + 'px';
    zone.style.top       = ly + 'px';
    zone.style.bottom    = 'auto';
    zone.style.transform = 'translate(-50%, -50%)';
  }
  function _resetPos() {
    zone.style.left      = '50%';
    zone.style.top       = 'auto';
    zone.style.bottom    = '40px';
    zone.style.transform = 'translateX(-50%)';
  }

  function joyStart(e) {
    var _t = e.touches ? e.touches[0] : e;
    if (_t.clientY - panel.getBoundingClientRect().top < 300) return;
    e.preventDefault();
    active = true;
    var t = e.touches ? e.touches[0] : e;
    cx = t.clientX; cy = t.clientY;
    _floatTo(cx, cy);
    joyUpdate(e);
  }
  function joyMove(e) { if (active) { e.preventDefault(); joyUpdate(e); } }
  function joyEnd(e) {
    if (!active) return;
    e.preventDefault();
    active = false;
    knob.style.transform = '';
    K.left = K.right = K.up = K.down = false;
    _joyDX = 0; _joyDY = 0;
    _resetPos();
  }
  function joyUpdate(e) {
    var t = e.touches ? e.touches[0] : e;
    var dx = t.clientX - cx;
    var dy = t.clientY - cy;
    _joyDX = dx; _joyDY = dy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var c = Math.min(dist, RADIUS) / (dist || 1);
    knob.style.transform = 'translate(' + (dx * c) + 'px,' + (dy * c) + 'px)';
    K.left  = dx < -DEAD;
    K.right = dx >  DEAD;
    K.up    = dy < -DEAD;
    K.down  = dy >  DEAD;
  }

  // Touch: entire panel is the capture zone
  panel.addEventListener('touchstart',  joyStart, {passive:false});
  panel.addEventListener('touchmove',   joyMove,  {passive:false});
  panel.addEventListener('touchend',    joyEnd,   {passive:false});
  panel.addEventListener('touchcancel', joyEnd,   {passive:false});
  // Mouse: fixed zone for desktop testing
  zone.addEventListener('mousedown',  joyStart);
  zone.addEventListener('mousemove',  joyMove);
  zone.addEventListener('mouseup',    joyEnd);
  zone.addEventListener('mouseleave', joyEnd);
})();

