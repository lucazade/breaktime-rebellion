#!/usr/bin/env node
// dev/check-dead.js — static dead-code analysis
// Usage: node dev/check-dead.js
// Checks: PAL keys, STRINGS keys, audio sfx keys, HTML element IDs, top-level global functions

'use strict';

const fs = require('fs');

const JS_FILES = [
  'js/config.js', 'js/palette.js', 'js/scene.js',  'js/ui.js',
  'js/draw-chars.js', 'js/draw-objects.js', 'js/levels.js', 'js/i18n.js',
  'js/audio.js', 'js/state.js', 'js/input.js', 'js/physics.js',
  'js/entities.js', 'js/draw-game.js', 'js/draw-title.js', 'js/draw-hud.js',
  'js/draw-overlays.js', 'js/menus.js', 'js/game.js', 'js/title.js',
  'sw.js',
];

const sources = JS_FILES.map(f => ({ file: f, src: fs.readFileSync(f, 'utf8') }));
const allSrc  = sources.map(s => s.src).join('\n');
// Full corpus including HTML and CSS for ID/class checks
const htmlSrc = fs.readFileSync('index.html', 'utf8');
const cssSrc  = fs.readFileSync('css/style.css', 'utf8');
const allCorpus = allSrc + '\n' + htmlSrc + '\n' + cssSrc;

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
let palOk = true;

palKeys.forEach(k => {
  checked++;
  if (!nonPal.includes('PAL.' + k)) {
    unused.push('PAL.' + k + '  (palette.js)');
    console.log('  UNUSED   PAL.' + k);
    palOk = false;
  }
});
if (palOk) console.log('  OK');

// ── 2. STRINGS keys ──────────────────────────────────────────
section('i18n.js');
const i18nSrc = sources.find(s => s.file === 'js/i18n.js').src;
// Extract keys from the 'en' block only (4-space indented)
const strKeys = [...new Set([...i18nSrc.matchAll(/^ {4}(\w+):/gm)].map(m => m[1]))];
// Collect dynamic access prefixes: STRINGS['prefix' + variable]
const dynPfx  = [...new Set([...allSrc.matchAll(/STRINGS\['([^']+)'\s*\+/g)].map(m => m[1]))];
let strOk = true;

strKeys.forEach(k => {
  checked++;
  const direct  = allSrc.includes('STRINGS.' + k) ||
                  allSrc.includes("STRINGS['" + k + "']") ||
                  allSrc.includes('STRINGS["' + k + '"]');
  const dynamic = dynPfx.some(p => k.startsWith(p));
  if (!direct && !dynamic) {
    unused.push('STRINGS.' + k + '  (i18n.js)');
    console.log('  UNUSED   STRINGS.' + k);
    strOk = false;
  }
});
if (strOk) console.log('  OK');

// ── 3. Audio sfx keys ────────────────────────────────────────
section('config.js — audio.sfx');
const cfgSrc  = sources.find(s => s.file === 'js/config.js').src;
const nonCfg  = sources.filter(s => s.file !== 'js/config.js').map(s => s.src).join('\n');
// Extract keys inside the sfx block (between 'sfx: {' and the closing '}')
const sfxBlock = cfgSrc.match(/sfx:\s*\{([^}]+)\}/s);
let sfxOk = true;

if (sfxBlock) {
  const sfxKeys = [...sfxBlock[1].matchAll(/^\s+(\w+):/gm)].map(m => m[1]);
  sfxKeys.forEach(k => {
    checked++;
    // sfx keys are passed as string literals to playSfx / playSfxThen / playJingle
    const used = nonCfg.includes("'" + k + "'") || nonCfg.includes('"' + k + '"');
    if (!used) {
      unused.push('sfx.' + k + '  (config.js)');
      console.log('  UNUSED   sfx.' + k);
      sfxOk = false;
    }
  });
}
if (sfxOk) console.log('  OK');

// ── 4. HTML element IDs ──────────────────────────────────────
section('index.html — element IDs');
const htmlIds = [...htmlSrc.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
let idOk = true;

htmlIds.forEach(id => {
  checked++;
  // Referenced in JS as getElementById('id'), querySelector('#id'), or in CSS as #id
  const inJs  = allSrc.includes("'" + id + "'") || allSrc.includes('"' + id + '"');
  const inCss = cssSrc.includes('#' + id);
  if (!inJs && !inCss) {
    unused.push('#' + id + '  (index.html)');
    console.log('  UNUSED   #' + id);
    idOk = false;
  }
});
if (idOk) console.log('  OK');

// ── 5. Top-level global functions ────────────────────────────
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
