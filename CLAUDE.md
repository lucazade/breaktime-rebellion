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
  config.js         ← CONFIG (images, audio, debug, display) — primo
  gfx-palette.js    ← const PAL — unica sorgente di tutti i colori
  gfx-building.js   ← geometria canvas (GY/MY/TY, walkOffset, SHARED_LAYOUT)
  gfx-ui.js         ← CONFIG.vis (titleScreen, HUD, banners) — dati UI
  gfx-chars.js      ← PW/PH, COLOURS_*, drawChar/drawJanitor/drawPreside/drawGuard/drawGinnastica
  gfx-objects.js    ← drawDesks/Boards/Bell/Machines/... + dati SHARED_LAYOUT
  levels.js         ← LEVELS[] con mechanics + NPC per livello
  i18n.js           ← STRINGS EN/IT
  audio.js          ← GameAudio (music + sfx manager)
  state.js          ← variabili condivise, player, resetLevel, startGame, fmt()
  input.js          ← tastiera, touch buttons, joystick analogico
  physics.js        ← updatePlayer, stair/floor collision, tryAction
  entities.js       ← teachers, janitors, bell, timer, particles
  gfx-draw.js       ← drawTitleScreen, drawHUD, drawBanners, drawNightOverlay, drawDebugOverlay
  game.js           ← canvas setup + loop puro
  title.js          ← title screen events, service worker
assets/
  pics/
    bg/
      bg-1600-day.png   ← background giorno (1600×1000px)
      bg-1600-night.png ← background notte L10 (1600×1000px)
    logo/
      logo-1600.png     ← logo title screen (1600px wide)
  audio/            ← musica e sfx
  icons/
    icon-192.png    ← icona PWA 192×192
    icon-512.png    ← icona PWA 512×512
dev/
  todo.txt          ← piano di implementazione a fasi
  refactor-gfx-palette/
    new-colors.txt  ← colori scelti per personaggio (riferimento)
```

## Stack

HTML5 Canvas + JS vanilla, nessun framework. Font: Press Start 2P (Google Fonts).
Palette: logo reference (PAL), voci esplicite per ogni personaggio/oggetto.

## Palette colori (gfx-palette.js)

`const PAL` è l'unica sorgente di verità per tutti i colori. Struttura:

- **CHARACTERS** — una sezione per personaggio con voci esplicite (skin, hair, trousers, shoes…)
- **HUD** — strip, timer, dot indicators meccaniche
- **UI / DIALOGS** — title screen, dialog panels, bezel mobile, banners
- **GAME OBJECTS** — per ogni oggetto (bell, board, ball, desks, machines, register, sink, bins, sprinklers…)
- **DEBUG** — overlay debug

Ogni `drawXxx` function usa esclusivamente `PAL.nomeEsplicito` — nessun colore hardcoded.

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
- `player`, `teachers`, `janitors`, `BOARDS`, `bags`, `BELL`, `DESKS`, `stairs`
- `lives`, `score`, `state`, `frame`, `currentLevel`
- `levelMechanics` — mechanics attive nel livello corrente (da `lv.mechanics`)
- `nightMode` — `true` in L10, attiva `drawNightOverlay()` (gradiente radiale torcia)
- `register`, `exitDoor` — oggetti L10; `exitDone`, `exitWinReady` — flag win L10
- `deathFreeze` — congela NPC e aggiornamenti durante morte/win; solo `tickTransition()` avanza
- `pendingTransition` — `{ t: frames, fn: callback }` o `null`; usato al posto di `setTimeout` per transizioni di stato. Resettato da `resetLevel()`, decrementato da `tickTransition()`.
- `storyBannerT` — countdown banner storia (solo L1 prima partita); `missionBannerT` — banner missione
- `fmt(s, ...args)` — formatta stringhe con placeholder `{0}`, `{1}`

## LEVELS (js/levels.js)

Tutti i dati di ogni livello sono in `LEVELS[]`.
Ogni livello è `Object.assign({}, SHARED_LAYOUT, { ... })`.
`SHARED_LAYOUT` (in gfx-building.js/gfx-objects.js) contiene scale, lavagne, banchi, campanella e playerStart — fissi in tutti i livelli.

Ogni livello contiene:
```js
{
  timer: 60,               // secondi (0 = nessun limite)
  playerStart: {x, y},

  mechanics: {             // quali azioni/obiettivi sono attivi
    writeBoards:     true/false,   // L1: spray lavagne
    stealBags:       true/false,   // L2: raccogliere cartelle
    shakeMachines:   true/false,   // L3: spaccare distributori
    deflateBall:     true/false,   // L4: sgonfiare pallone
    throwPaper:      true/false,   // L5: lanciare cartacce
    dropBook:        true/false,   // L6: far cadere libri
    floodSink:       true/false,   // L7: allagare bagno
    plantBomb:       true/false,   // L8: petardi nei secchi
    activateSprinkler: true/false, // L9: sprinkler antincendio
    stealRegister:   true/false,   // L10: rubare registro
    escapeExit:      true/false,   // L10: raggiungere uscita con registro
    ringBell:        true/false,   // campanella completa il livello (false in L10)
  },

  stairs:   [{x1,y1,x2,y2, fdTop, fdBot}, ...],  // fdTop/fdBot: px clip banda pavimento
  boards:   [{x,y}, ...],
  bags:     [{x,y}, ...],
  desks:    [{x,y}, ...],
  bell:     {x, y},
  teachers: [{x,y,dir,minX,maxX,speed,color,name,sight, catchRadius?}, ...],
  janitors: [{x,y,dir,minX,maxX,speed,name}, ...],

  // Oggetti opzionali per livello:
  machines:   [{x,y}, ...],            // L3
  gymBall:    {x,y},                   // L4
  students:   [{x,y}, ...],            // L5
  bookcase:   {x,y,fallDx,fallDy},     // L6
  sink:       {x,y},                   // L7
  bins:       [{x,y}, ...],            // L8
  sprinklers: [{x,y,floor}, ...],      // L9
  register:   {x,y},                   // L10
  exitDoor:   {x,y},                   // L10
  nightMode:  true/false,              // L10
}
```
Le coordinate usano `GY`, `MY`, `TY`, `PH`, `walkOffset` (da `gfx-building.js`) per restare leggibili.

**Scale (`stairs`):** `fdTop` = px sopra la superficie dove la testa appare; `fdBot` = px sotto dove le gambe spariscono. Valori attuali: `fdTop:4, fdBot:12` su tutte le scale.

**Teacher con `catchRadius`:** i Guardiani (L10) hanno `catchRadius:20` — catturano Marco anche in patrol, senza cono visivo. Copiato nella teacher map di `state.js`.

## i18n (js/i18n.js)

- Solo **stringhe pure** in `var en` e `var it` — NO funzioni, NO array
- Stringhe con parametri: placeholder `{0}`, `{1}` — formattare con `fmt()` in game code
- Missioni per livello: chiavi `mission1`, `mission2`, ... (una per livello)
- Separatore `|` nelle stringhe dei fumetti per forzare a capo
- Override lingua: `?lang=en` o `?lang=it` nell'URL

## Canvas e background

**Risoluzione 5×:** canvas element `1600×1000`, `ctx.scale(5,5)` → coordinate logiche `320×200`. `ctx.imageSmoothingEnabled = false`.
CSS scala sempre DOWN (mai upscale) → nessuna distorsione su qualsiasi viewport.

**Background bitmap** (`assets/pics/bg/bg-1600-day.png`, 1600×1000px):
- `drawBg()` lo disegna a 1:1 (bypass `ctx.scale` con `setTransform`) scalato a CV.width×CV.height via `createImageBitmap`
- Muri, pavimenti, scale sono nel PNG — non esistono funzioni draw per questi elementi
- Oggetti interattivi (banchi, lavagne, campanella, cartelle) sono sempre disegnati via codice sopra il PNG

**Debug overlay (`?debug=1`):**
- Mostra: floor lines (TY/MY/GY), stair boxes con coordinate, hitbox tutti gli oggetti
- Utile per allineare il background PNG con la logica

**Clip sprite sulle scale:** `drawCharClipped()` in gfx-chars.js disegna Marco in due passate (sopra e sotto la banda del pavimento) quando `player.onStair` è true. La banda è `[surfaceY - fdTop, surfaceY + fdBot]`.

## CONFIG (js/config.js)

- `CONFIG.layout` — W, H, PW, PH, GY, MY, TY, BW, BH, walkOffset
- `CONFIG.images` — `background`, `backgroundNight`, `logo` (tutti 1600px)
- `CONFIG.audio` — `musicVolume`, `sfxVolume`, `music`, `introMusic`, `bossMusic`, `sfx` map
- `CONFIG.display` — `fontFamily`, `showSidePanels` (mostra pannelli arcade su desktop per testing)
- `CONFIG.debug.unlockAllLevels` — `true` sblocca tutti i livelli nel chooser

## NPC sprites

Ogni personaggio ha il suo draw function e `COLOURS_*` object in `gfx-chars.js`:

- **Prof.Rossi** (`PAL.profRossiBody`): `drawChar` + `COLOURS_TEACHER`, patrol GY, sight 90
- **Prof.Celeste** (`PAL.profCelesteBody`): `drawChar` + `COLOURS_TEACHER`, patrol MY, sight 80
- **Prof.Neri** (`PAL.profNeriBody`): `drawChar` + `COLOURS_TEACHER`, patrol TY, sight 100
- **Prof.Ginnastica** (`PAL.profGinnasticaBody`): `drawGinnastica()`, L4/L8, cap + strisce
- **Preside** (`PAL.presideBody`): `drawPreside()`, L6, velocità 1.0, sight 150
- **Guardiano** (`PAL.guardUniform`): `drawGuard()`, L10, `catchRadius:20`, NO cono visivo
- **Bidello**: `drawJanitor()` (drawChar + salopette + scopa), patrol corto

**Catch behavior:** `caughtBy(t)` inverte `t.dir` e resetta `chasing`. I Guardiani NON cadono a terra, invertono solo direzione.

## Audio

- Musica di gioco: `bgMusic` (L1-L9), `bossMusic` (L10) — selezionata da `_gameTrack()`
- Intro music: fade out con `fadeOutIntro()` all'avvio partita — NON TOCCARE la logica audio/transizioni
- Jingle win/gameover: tracciati in `jingle` per poterli stoppare al restart

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
const files=['js/config.js','js/gfx-palette.js','js/gfx-building.js','js/gfx-ui.js','js/gfx-chars.js','js/gfx-objects.js','js/levels.js','js/i18n.js','js/audio.js','js/state.js','js/input.js','js/physics.js','js/entities.js','js/gfx-draw.js','js/game.js','js/title.js'];
const src=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
try{new Function(src);console.log('JS OK');}catch(e){console.log('ERRORE:',e.message);}
"
```

**Non fare mai deploy se il test restituisce `ERRORE`.**
