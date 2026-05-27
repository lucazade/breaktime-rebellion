#!/usr/bin/env node
// dev/check-dead.js — static dead-code analysis
// Usage: node dev/check-dead.js
//
// Checks (per category, NOT exhaustive — see limitations at bottom):
//   1. PAL keys              — palette.js entries never referenced
//   2. STRINGS keys          — i18n.js entries never referenced
//   3. audio.sfx keys        — config.js sfx entries never passed to playSfx/etc.
//   4. CONFIG.ui subkeys     — ui.js properties never accessed as .propName
//   5. HTML element IDs      — index.html IDs never referenced in JS or CSS
//   6. Asset files           — files in assets/ never referenced in any source file
//   7. Top-level functions   — global function declarations referenced ≤ 1 time
//
// Limitations:
//   - Does NOT check: global variables, CONFIG.scene/level subkeys, CSS classes

'use strict';

const fs   = require('fs');
const path = require('path');

const JS_FILES = [
  'js/config.js', 'js/palette.js', 'js/scene.js',  'js/ui.js',
  'js/draw-chars.js', 'js/draw-objects.js', 'js/levels.js', 'js/i18n.js',
  'js/audio.js', 'js/state.js', 'js/input.js', 'js/physics.js',
  'js/entities.js', 'js/draw-game.js', 'js/draw-title.js', 'js/draw-hud.js',
  'js/draw-overlays.js', 'js/menus.js', 'js/game.js', 'js/title.js',
  'sw.js',
  // Debug overlays — caricati dal gioco ma fuori da js/
  'dev/debug/layout-overlay.js',
  'dev/debug/scene-overlay.js',
];

const sources    = JS_FILES.map(f => ({ file: f, src: fs.readFileSync(f, 'utf8') }));
const allSrc     = sources.map(s => s.src).join('\n');
const htmlSrc    = fs.readFileSync('index.html', 'utf8');
const cssSrc     = fs.readFileSync('css/style.css', 'utf8');
const manifestSrc = fs.existsSync('manifest.json') ? fs.readFileSync('manifest.json', 'utf8') : '';
// Full corpus for asset + ID lookups
const allCorpus  = allSrc + '\n' + htmlSrc + '\n' + cssSrc + '\n' + manifestSrc;

const unused = [];
let checked  = 0;

function section(label) {
  process.stdout.write('\n── ' + label + ' ' + '─'.repeat(Math.max(0, 44 - label.length)) + '\n');
}
function flag(msg) { unused.push(msg); console.log('  UNUSED   ' + msg); }

// ── 1. PAL keys ──────────────────────────────────────────────
section('palette.js');
const palSrc  = sources.find(s => s.file === 'js/palette.js').src;
const nonPal  = sources.filter(s => s.file !== 'js/palette.js').map(s => s.src).join('\n');
const palKeys = [...new Set([...palSrc.matchAll(/^\s+(\w+):/gm)].map(m => m[1]))];
let ok = true;
palKeys.forEach(k => {
  checked++;
  if (!nonPal.includes('PAL.' + k)) { flag('PAL.' + k); ok = false; }
});
if (ok) console.log('  OK');

// ── 2. STRINGS keys ──────────────────────────────────────────
section('i18n.js');
const i18nSrc = sources.find(s => s.file === 'js/i18n.js').src;
const strKeys = [...new Set([...i18nSrc.matchAll(/^ {4}(\w+):/gm)].map(m => m[1]))];
const dynPfx  = [...new Set([...allSrc.matchAll(/STRINGS\['([^']+)'\s*\+/g)].map(m => m[1]))];
ok = true;
strKeys.forEach(k => {
  checked++;
  const direct  = allSrc.includes('STRINGS.' + k) ||
                  allSrc.includes("STRINGS['" + k + "']") ||
                  allSrc.includes('STRINGS["' + k + '"]');
  const dynamic = dynPfx.some(p => k.startsWith(p));
  if (!direct && !dynamic) { flag('STRINGS.' + k); ok = false; }
});
if (ok) console.log('  OK');

// ── 3. Audio sfx keys ────────────────────────────────────────
section('config.js — audio.sfx');
const cfgSrc  = sources.find(s => s.file === 'js/config.js').src;
const nonCfg  = sources.filter(s => s.file !== 'js/config.js').map(s => s.src).join('\n');
const sfxBlock = cfgSrc.match(/sfx:\s*\{([^}]+)\}/s);
ok = true;
if (sfxBlock) {
  [...sfxBlock[1].matchAll(/^\s+(\w+):/gm)].map(m => m[1]).forEach(k => {
    checked++;
    if (!nonCfg.includes("'" + k + "'") && !nonCfg.includes('"' + k + '"'))
      { flag('sfx.' + k); ok = false; }
  });
}
if (ok) console.log('  OK');

// ── 4. CONFIG.ui subkeys ─────────────────────────────────────
section('ui.js — CONFIG.ui subkeys');
const uiSrc  = sources.find(s => s.file === 'js/ui.js').src;
const nonUi  = sources.filter(s => s.file !== 'js/ui.js').map(s => s.src).join('\n');
// Extract all leaf-level property names inside CONFIG.ui (2+ space indent, ends with : value)
const uiKeys = [...new Set([...uiSrc.matchAll(/^ {4,}(\w+):\s*[^{]/gm)].map(m => m[1]))];
// Detect sections accessed with dynamic bracket notation (e.g. dc[mechanic])
// — their child keys will never appear as .key literals, so skip them
const dynBracket = [...new Set([...nonUi.matchAll(/\b(\w+)\[(?!\s*['"`])\w/g)].map(m => m[1]))];
// Find which CONFIG.ui sub-objects are aliased to those bracket-accessed vars
const dynSections = new Set();
dynBracket.forEach(v => {
  const m = nonUi.match(new RegExp('\\b' + v + '\\s*=\\s*CONFIG\\.ui\\.(\\w+)\\.(\\w+)'));
  if (m) dynSections.add(m[2]);
});
ok = true;
uiKeys.forEach(k => {
  checked++;
  if (k.length < 3) return;
  // Skip keys that belong to a dynamically-accessed section
  const inDynSection = [...uiSrc.matchAll(new RegExp(k + ':\\s*[^{]', 'g'))].some(() => {
    // Rough check: if any dynamic section name precedes this key in ui.js, skip
    return dynSections.size > 0 && nonUi.match(new RegExp('\\[\\w+\\]'));
  });
  if (dynSections.size > 0) {
    // Check if this key exists inside a dynamic-accessed object (dotColors)
    const dotColorsMatch = uiSrc.match(/dotColors:\s*\{([^}]+)\}/s);
    if (dotColorsMatch && dotColorsMatch[1].includes(k + ':')) return;
  }
  if (!nonUi.includes('.' + k)) { flag('CONFIG.ui.*.' + k + '  (ui.js)'); ok = false; }
});
if (ok) console.log('  OK');

// ── 5. HTML element IDs ──────────────────────────────────────
section('index.html — element IDs');
const htmlIds = [...htmlSrc.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
ok = true;
htmlIds.forEach(id => {
  checked++;
  const inJs  = allSrc.includes("'" + id + "'") || allSrc.includes('"' + id + '"');
  const inCss = cssSrc.includes('#' + id);
  if (!inJs && !inCss) { flag('#' + id + '  (index.html)'); ok = false; }
});
if (ok) console.log('  OK');

// ── 6. Asset files ───────────────────────────────────────────
section('assets/');
function walkAssets(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walkAssets(full));
    else result.push(full);
  }
  return result;
}
ok = true;
// Patterns to ignore: git placeholders, screenshots, and known kept-but-unused assets
const ASSET_IGNORE = [
  '.gitkeep',
  /^assets[/\\]pics[/\\]screenshots[/\\]/,
  'completed.ogg',     // sfx reserved for future use
  'icon-32.png',       // icon size not required by current manifest
  'icon-48.png',       // icon size not required by current manifest
  'logo-squared.png',  // alternate logo variant kept for reference
  'home.svg',          // buttons use inline SVG
  'info.svg',          // buttons use inline SVG
  'pause.svg',         // buttons use inline SVG
];
walkAssets('assets').forEach(f => {
  const name = path.basename(f);
  if (ASSET_IGNORE.some(p => typeof p === 'string' ? name === p : p.test(f))) return;
  checked++;
  if (!allCorpus.includes(name)) { flag(f); ok = false; }
});
if (ok) console.log('  OK');

// ── 7. Top-level global functions ────────────────────────────
section('global functions');
ok = true;
sources.forEach(({ file, src }) => {
  [...src.matchAll(/^function (\w+)\s*\(/gm)].map(m => m[1]).forEach(fn => {
    checked++;
    const total = (allSrc.match(new RegExp('\\b' + fn + '\\b', 'g')) || []).length;
    if (total <= 1) { flag(fn + '()  (' + file + ')'); ok = false; }
  });
});
if (ok) console.log('  OK');

// ── Summary ───────────────────────────────────────────────────
console.log('\n' + '─'.repeat(48));
if (unused.length === 0) {
  console.log('OK — nessun dead code trovato  (' + checked + ' voci verificate)\n');
} else {
  console.log(unused.length + ' possibili problemi  |  ' + checked + ' voci verificate');
  console.log('Nota: funzioni con 1 occorrenza potrebbero essere callback;\n' +
              '      CONFIG.ui check può avere falsi positivi su nomi brevi/generici.\n');
  process.exit(1);
}
