#!/usr/bin/env node
// dev/check-dead.js — static dead-code analysis
// Usage: node dev/check-dead.js
// Checks: PAL keys, STRINGS keys, top-level global functions

'use strict';

const fs = require('fs');

const JS_FILES = [
  'js/config.js', 'js/palette.js', 'js/scene.js',  'js/ui.js',
  'js/draw-chars.js', 'js/draw-objects.js', 'js/levels.js', 'js/i18n.js',
  'js/audio.js', 'js/state.js', 'js/input.js', 'js/physics.js',
  'js/entities.js', 'js/draw-game.js', 'js/draw-title.js', 'js/draw-hud.js',
  'js/draw-overlays.js', 'js/menus.js', 'js/game.js', 'js/title.js',
];

const sources = JS_FILES.map(f => ({ file: f, src: fs.readFileSync(f, 'utf8') }));
const allSrc  = sources.map(s => s.src).join('\n');

const unused = [];
let checked  = 0;

function section(label) {
  process.stdout.write('\n── ' + label + ' ' + '─'.repeat(Math.max(0, 44 - label.length)) + '\n');
}

// ── 1. PAL keys ──────────────────────────────────────────────
section('palette.js');
const palSrc  = sources.find(s => s.file === 'js/palette.js').src;
const nonPal  = sources.filter(s => s.file !== 'js/palette.js').map(s => s.src).join('\n');
const palKeys = [...new Set([...palSrc.matchAll(/^\s+(\w+):/gm)].map(m => m[1]))];

palKeys.forEach(k => {
  checked++;
  if (!nonPal.includes('PAL.' + k)) {
    unused.push('PAL.' + k + '  (palette.js)');
    console.log('  UNUSED   PAL.' + k);
  }
});
if (!palKeys.some(k => !nonPal.includes('PAL.' + k))) console.log('  OK');

// ── 2. STRINGS keys ──────────────────────────────────────────
section('i18n.js');
const i18nSrc = sources.find(s => s.file === 'js/i18n.js').src;
// Extract keys from the 'en' block only (4-space indented)
const strKeys = [...new Set([...i18nSrc.matchAll(/^ {4}(\w+):/gm)].map(m => m[1]))];
// Collect dynamic access prefixes: STRINGS['prefix' + variable]
const dynPfx  = [...new Set([...allSrc.matchAll(/STRINGS\['([^']+)'\s*\+/g)].map(m => m[1]))];

strKeys.forEach(k => {
  checked++;
  const direct  = allSrc.includes('STRINGS.' + k) ||
                  allSrc.includes("STRINGS['" + k + "']") ||
                  allSrc.includes('STRINGS["' + k + '"]');
  const dynamic = dynPfx.some(p => k.startsWith(p));
  if (!direct && !dynamic) {
    unused.push('STRINGS.' + k + '  (i18n.js)');
    console.log('  UNUSED   STRINGS.' + k);
  }
});
if (!strKeys.some(k => {
  const direct  = allSrc.includes('STRINGS.' + k) || allSrc.includes("STRINGS['" + k + "']");
  const dynamic = dynPfx.some(p => k.startsWith(p));
  return !direct && !dynamic;
})) console.log('  OK');

// ── 3. Top-level global functions ────────────────────────────
section('global functions');
const fnUnused = [];
sources.forEach(({ file, src }) => {
  // Only functions declared at column 0 (top-level, not nested)
  const fns = [...src.matchAll(/^function (\w+)\s*\(/gm)].map(m => m[1]);
  fns.forEach(fn => {
    checked++;
    const re    = new RegExp('\\b' + fn + '\\b', 'g');
    const total = (allSrc.match(re) || []).length;
    if (total <= 1) {
      const entry = fn + '()  (' + file + ')';
      unused.push(entry);
      fnUnused.push(entry);
      console.log('  UNUSED   ' + entry);
    }
  });
});
if (fnUnused.length === 0) console.log('  OK');

// ── Summary ───────────────────────────────────────────────────
console.log('\n' + '─'.repeat(48));
if (unused.length === 0) {
  console.log('OK — nessun dead code trovato  (' + checked + ' voci verificate)\n');
} else {
  console.log(unused.length + ' possibili problemi  |  ' + checked + ' voci verificate');
  console.log('Nota: le funzioni segnalate come unused potrebbero essere\ncallback registrate altrove (es. addEventListener).\n');
}
