# Breaktime Rebellion — CLAUDE.md

## Progetto

Gioco HTML5 stile Skool Daze, ambientazione liceo italiano anni 80/90.
Protagonista: **Marco**. Gioco **landscape-only** (portrait mostra schermata "Ruota il dispositivo").

## Struttura file

```
index.html          ← HTML scheletro + link a css/ e js/
manifest.json       ← PWA manifest (display:fullscreen, orientation:landscape)
sw.js               ← Service worker minimale per PWA Chrome Android
robots.txt          ← noindex pre-release
css/
  style.css         ← tutti gli stili
js/                 ← ordine di caricamento obbligatorio:
  config.js         ← CONFIG (layout, colors, audio, debug) — primo
  levels.js         ← LEVELS[] + CONFIG.levels alias — secondo
  i18n.js           ← STRINGS EN/IT (terzo)
  audio.js          ← GameAudio (music + sfx manager)
  state.js          ← variabili condivise, player, resetLevel, startGame, fmt()
  input.js          ← tastiera, touch buttons, joystick analogico
  physics.js        ← updatePlayer, stair/floor collision, tryAction
  entities.js       ← teachers, janitors, bell, timer, particles
  draw.js           ← tutte le draw* + updateHUD
  game.js           ← canvas setup + loop puro
assets/
  logo.png          ← logo title screen (1408×768)
  icon-192.png      ← icona PWA 192×192
  icon-512.png      ← icona PWA 512×512
  bg.png            ← background disegnato a mano (640×400px, opzionale)
misc/
  appunti.txt       ← piano di implementazione a fasi
```

## Stack

HTML5 Canvas + JS vanilla, nessun framework. Font: Press Start 2P (Google Fonts). Palette: C64 autentica.

## Controlli

- **Desktop**: frecce direzionali + Z/Spazio
- **Mobile**: joystick analogico overlay `#ctrl-joy` (bottom-left) + bottone `#btn-action` (bottom-right)
- **Scala**: ingresso richiede diagonale corrispondente alla direzione. Scala destra (x2>x1): K.up+K.right salire, K.down+K.left scendere. Scala sinistra (x2<x1): K.up+K.left salire, K.down+K.right scendere. Una volta sulla scala K.up/K.down hanno priorità.

## PWA / Mobile

- Installabile come app Android via "Aggiungi a schermata Home" su Chrome
- In `display-mode: fullscreen` o `standalone`: canvas si stretcha a riempire tutto lo schermo
- In browser normale: aspect ratio 16:10 mantenuto

## Architettura JS — moduli

Il codice è diviso in moduli distinti che comunicano via variabili globali condivise (no ES modules).

**Per aggiungere un oggetto di gioco:**
- Aggiungere i dati nel livello corretto in `LEVELS[]` dentro `js/levels.js`
- `resetLevel()` in `state.js` li legge e clona automaticamente
- Non modificare mai `lv.stairs`, `lv.boards` ecc. direttamente durante il gioco

**Variabili globali chiave** (definite in `state.js`, usate ovunque):
- `C` — alias `CONFIG.colors`
- `player`, `teachers`, `janitors`, `BOARDS`, `bags`, `BELL`, `DESKS`, `stairs`
- `lives`, `score`, `state`, `frame`, `currentLevel`
- `levelMechanics` — mechanics attive nel livello corrente (da `lv.mechanics`)
- `fmt(s, ...args)` — formatta stringhe con placeholder `{0}`, `{1}`

## LEVELS (js/levels.js)

Tutti i dati di ogni livello sono in `LEVELS[]` (e `CONFIG.levels` è un alias).
Ogni livello contiene:
```js
{
  timer: 60,               // secondi (override CONFIG.levelTimer)
  playerStart: {x, y},

  mechanics: {             // quali azioni/obiettivi sono attivi in questo livello
    writeBoards: true,     // spray boards → allBoards → campanella
    stealBags:   false,    // raccogliere tutte le cartelle (obiettivo L2)
    ringBell:    true,     // suonare la campanella completa il livello
  },

  rooms: [                 // zone con azioni contestuali (vuoto se non servono)
    { id, name, x, y, w, h, actions: [] }
  ],

  stairs:   [{x1,y1,x2,y2}, ...],
  boards:   [{x,y}, ...],
  bags:     [{x,y}, ...],
  desks:    [{x,y}, ...],
  bell:     {x, y},
  teachers: [{x,y,dir,minX,maxX,speed,color,name,sight}, ...],
  janitors: [{x,y,dir,minX,maxX,speed,name}, ...],
}
```
Le coordinate usano `L.GY`, `L.MY`, `L.TY`, `L.PH` (da `CONFIG.layout`) per restare leggibili.

## i18n (js/i18n.js)

- Solo **stringhe pure** in `var en` e `var it` — NO funzioni, NO array
- Stringhe con parametri: placeholder `{0}`, `{1}` — formattare con `fmt()` in game code
- Missioni per livello: chiavi `mission1`, `mission2`, ... (una per livello)
- Override lingua: `?lang=en` o `?lang=it` nell'URL

## Canvas e background

**Risoluzione 2×:** canvas element `640×400`, `ctx.scale(2,2)` → coordinate logiche invariate a `320×200`. `ctx.imageSmoothingEnabled = false`.

**Background disegnato a mano** (`assets/bg.png`, 640×400px):
- Se presente, `drawBg()` lo disegna a 1:1 (bypass `ctx.scale` con `setTransform`)
- Quando attivo, vengono soppressi: `drawStairs`, `drawFloors`, `drawRoomDividers`
- Se assente: fallback al background programmativo (room colors + floor obliquo)
- Coordinate di riferimento nel PNG: TY=y116, MY=y246, GY=y376, dividers x214/x426

**Debug overlay (`?debug=1`):**
- Mostra: floor lines (TY/MY/GY), room dividers (x=107/213), stair boxes con coordinate, hitbox tutti gli oggetti
- Utile per allineare `bg.png` con la logica: screenshot con `?debug=1`, sovrapponi in editor

## CONFIG (js/config.js)

- `CONFIG.layout` — W, H, PW, PH, GY, MY, TY, BW, BH, FD
- `CONFIG.colors` — palette C64 (alias `C` in state.js, disponibile globalmente)
- `CONFIG.images` — percorsi immagini
- `CONFIG.audio` — `musicVolume`, `sfxVolume`, `music` path, `sfx` map
- `CONFIG.levelTimer` — timer globale in secondi (0 = disabilitato); override con `lv.timer`
- `CONFIG.debug.disableMusic` — `true` per silenziare musica durante testing
- `CONFIG.debug.disableJanitors` — `true` per rimuovere bidelli durante testing
- `CONFIG.levels` — non più usato; i livelli sono in `LEVELS[]` di `js/levels.js`

## Teacher sprites

- **Prof.Rossi** (piano terra, `C.red`): giacca rossa, pantaloni blu, cravatta gialla
- **Prof.Verdi** (piano medio, `C.green`): giacca verde, pantaloni blu, cravatta gialla
- **Prof.Neri** (piano alto, `C.mgray`, maxX=275): giacca grigia, pantaloni blu, cravatta gialla
- **Bidello**: `drawJanitor()` = `drawChar(C.mgray)` + cap navy + mop. Patrol corto, no chasing.

## HUD icons

Icons in `#hud-row` usano **Font Awesome 6 Solid** (CDN).
- Lives: `♥` ripetuto (`.hl`, color `#ff6b6b`)
- Boards: `fa-spray-can` (green) + contatore `0/6`
- Score: `fa-star` (gold) + punteggio

## Convenzioni commit

- `feat: ...` — nuova funzionalità
- `fix: ...` — correzione bug
- `chore: ...` — manutenzione, configurazione
- `docs: ...` — documentazione
- `refactor: ...` — refactoring senza cambio funzionale

## Validazione JS — obbligatoria prima di ogni modifica

```bash
node -e "
const fs=require('fs');
const files=['js/config.js','js/levels.js','js/i18n.js','js/audio.js','js/state.js','js/input.js','js/physics.js','js/entities.js','js/draw.js','js/game.js','js/title.js'];
const src=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
try{new Function(src);console.log('JS OK');}catch(e){console.log('ERRORE:',e.message);}
"
```

**Non fare mai deploy se il test restituisce `ERRORE`.**
