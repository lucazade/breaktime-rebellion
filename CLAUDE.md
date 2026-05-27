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
  palette.js        ← const PAL — unica sorgente di tutti i colori
  scene.js          ← CONFIG.scene (layout + dashed) + CONFIG.level (base livello: scale, lavagne, banchi, campanella)
  ui.js             ← CONFIG.ui (char, titleScreen, HUD, banners, dialogs) — dati UI
  draw-chars.js     ← COLOURS_*, drawChar/drawJanitor/drawPreside/drawGuard/drawGinnastica
  draw-objects.js   ← drawDesks/Boards/Bell/Machines/... (solo rendering)
  levels.js         ← LEVELS[] con mechanics + NPC per livello
  i18n.js           ← STRINGS EN/IT
  audio.js          ← GameAudio (music + sfx manager)
  state.js          ← variabili condivise, player, resetLevel, startGame, fmt()
  input.js          ← tastiera, touch buttons, joystick analogico
  physics.js        ← updatePlayer, stair/floor collision, tryAction
  entities.js       ← teachers, janitors, bell, timer, particles
  draw-game.js      ← drawBg, drawNightOverlay, drawSight, drawParticles, drawDebugOverlay
  draw-title.js     ← drawTitleScreen
  draw-hud.js       ← drawHUD
  draw-overlays.js  ← drawEndScreen, drawBanners, drawPauseOverlay, drawCredits
  menus.js          ← stato pause/home/credits, keyboard shortcuts
  game.js           ← canvas setup + loop principale + click router
  title.js          ← stato title screen, service worker
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
  checklists/
    release-checklist.md  ← checklist release con ownership 🤖/👤
    merge-checklist.md    ← checklist pre/post-merge con ownership 🤖/👤
  notes/
    todo.txt              ← piano di implementazione a fasi
    credits.txt           ← crediti
    note.txt              ← note varie
  palette/
    color-mapping.html    ← mappatura colori personaggi (riferimento)
    palette-from-logo.png ← palette estratta dal logo (riferimento)
  scripts/
    check-dead.js         ← analisi statica dead code (PAL, STRINGS, sfx, CONFIG.ui, HTML IDs, assets, funzioni)
  debug/
    debug-banners.html    ← pagina standalone per ispezionare tutti i banner/dialog con overlay debug (bande rosse/verdi/blu con label chiavi CONFIG.ui)
```

## Stack

HTML5 Canvas + JS vanilla, nessun framework. Font: Press Start 2P (Google Fonts).
Palette: logo reference (PAL), voci esplicite per ogni personaggio/oggetto.

## Palette colori (palette.js)

`const PAL` è l'unica sorgente di verità per tutti i colori. Struttura:

- **CHARACTERS** — una sezione per personaggio con voci esplicite (skin, hair, trousers, shoes…)
- **HUD** — strip, timer, dot indicators meccaniche
- **UI / DIALOGS** — title screen, dialog panels, banners
- **GAME OBJECTS** — per ogni oggetto (bell, board, ball, desks, machines, register, sink, bins, sprinklers…)
- **DEBUG** — overlay debug

Ogni `drawXxx` function usa esclusivamente `PAL.nomeEsplicito` — nessun colore hardcoded.

**Mechanic dot indicators:** le icone HUD sono monocromatiche (`#44ee66`). I dettagli "trasparenti" (cuciture pallone, dorso libro, ecc.) sono ottenuti **non disegnando quei pixel** — la forma viene ridisegnata in più `fillRect` che saltano le posizioni dei dettagli, così mostrano il colore HUD sottostante. Non usare `clearRect` (cancella anche il layer HUD già disegnato). Voci secondarie che rimangono: `dotBoardsHighlight`, `dotBagsStripe`, `dotBooksLines` (ora anch'esse trasparenti), `dotRegisterAccent`.

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
Ogni livello è `Object.assign({}, CONFIG.level, { ... })`.
`CONFIG.level` (in `scene.js`) contiene scale, lavagne, banchi, campanella e playerStart — fissi in tutti i livelli.

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
Le coordinate usano `GY`, `MY`, `TY`, `PH`, `walkOffset` (da `scene.js`) per restare leggibili.

**Scale (`stairs`):** `fdTop` = px sopra la superficie dove la testa appare; `fdBot` = px sotto dove le gambe spariscono. Valori attuali: `fdTop:4, fdBot:12` su tutte le scale.

**Teacher con `catchRadius`:** i Guardiani (L10) hanno `catchRadius:20` — catturano Marco anche in patrol, senza cono visivo. Copiato nella teacher map di `state.js`.

## i18n (js/i18n.js)

- Solo **stringhe pure** in `var en` e `var it` — NO funzioni, NO array
- Stringhe con parametri: placeholder `{0}`, `{1}` — formattare con `fmt()` in game code
- Missioni per livello: chiavi `mission1`, `mission2`, ... (una per livello)
- Separatore `|` nelle stringhe dei fumetti per forzare a capo
- Override lingua: `?lang=en` o `?lang=it` nell'URL
- `hudLevel` — label livello nell'HUD: `'Lvl {0}'` (uguale in EN e IT)

## HUD (draw-hud.js)

Il gruppo meccanica è **centrato** in `VH.centerX`. Layout da sinistra: `Lvl X` + separatore verticale (1px, 40% alpha) + icona meccanica + contatore `done/total`. La larghezza totale del gruppo viene calcolata sommando tutte le parti prima di posizionare l'inizio (`_sx`).

Le icone meccanica (`_drawHudIcon`) hanno 3 rami per scala `s`: tiny (`s<0.5`), small (`s<1`), full (`s≥1`). I dettagli trasparenti sono ottenuti disegnando la forma in parti (non usando `clearRect`).

## CONFIG.ui — naming convention pannelli (ui.js)

Ogni sezione pannello/banner usa chiavi con suffisso uniforme:
- `padTop`, `padBottom` — margine interno del pannello (bordo → contenuto)
- `xxxH` — altezza della riga di testo (font size + 2px breathing room)
- `xxxSpacing` — gap tra quella riga e l'elemento successivo
- `tapSpacing` — gap tra l'ultimo contenuto e la riga "tap to continue" / pulsante
- `tapH` — altezza della riga "tap to continue"
- `fontTap` — font size della riga "tap to continue" (esplicito in ogni sezione con tap row)
- `btnH` — altezza area pulsante interattivo (resume, yes/no, close)

La formula `panH` nei commenti di ogni sezione rispecchia fedelmente questi nomi.

## Desktop UI — bezels e canvas styling (game.js + style.css)

**Canvas roundness:** classe `.rounded` aggiunta via `ResizeObserver` + `window resize`. Attiva quando `canvas.getBoundingClientRect().top > 2` (c'è aria verticale). CSS: `canvas { border-radius: 0; transition: border-radius 0.2s ease; }` / `canvas.rounded { border-radius: 16px; }`.

**CSS variables dinamiche** (impostate da `_updateRoundness()` in `game.js`):
- `--canvas-top` — top del canvas relativo a `#game-area` (px)
- `--canvas-h` — altezza renderizzata del canvas (px)
Usate per ancorare `#top-bezel` e `#bottom-bezel` alla posizione reale del canvas.

**Bezels desktop** (solo `@media (hover: hover) and (pointer: fine)`, nascosti su mobile):
- `#top-bezel` — titolo "BREAKTIME REBELLION" sopra il canvas; `position: absolute`, `top: calc(var(--canvas-top) - 26px)`, `transform: translateY(-100%)`. Click → `triggerHome()`. Nascosto con `body.title-mode`.
- `#bottom-bezel` — linea neon sotto il canvas; `position: absolute`, `top: calc(var(--canvas-top) + var(--canvas-h) + 14px)`. Nascosto con `body.title-mode`.
- Entrambi `display: none` di default; la media query li attiva con `display: block`.
- Non usare `::before`/`::after` per elementi interattivi — usare elementi reali.

## Canvas e background

**Risoluzione 5×:** canvas element `1600×1000`, coordinate logiche `320×200`. `ctx.imageSmoothingEnabled = false`.
CSS scala sempre DOWN (mai upscale) → nessuna distorsione su qualsiasi viewport.
- Il transform viene riapplicato con `ctx.setTransform(_canvasScale,0,0,_canvasScale,0,0)` all'**inizio di ogni frame** nel loop (non solo all'init). Android WebView può resettare il canvas context state durante la rotazione del device; `setTransform` è assoluto (non cumulativo come `ctx.scale`) quindi è sicuro chiamarlo ogni frame.
- `#wrap` **non** usa `display:none` in portrait: il canvas rimane sempre nella GPU compositing pipeline. L'overlay `#portrait-msg` (position:fixed, z-index:200) copre tutto visivamente. Usare `display:none` su `#wrap` invalida la GPU texture cache e causa la title screen corrotta dopo rotazione su Android WebView.

**Background bitmap** (`assets/pics/bg/bg-1600-day.png`, 1600×1000px):
- `drawBg()` lo disegna a 1:1 (bypass `ctx.scale` con `setTransform`) scalato a CV.width×CV.height via `createImageBitmap`
- Muri, pavimenti, scale sono nel PNG — non esistono funzioni draw per questi elementi
- Oggetti interattivi (banchi, lavagne, campanella, cartelle) sono sempre disegnati via codice sopra il PNG

**Debug overlay (`?debug=1`):**
- Mostra: floor lines (TY/MY/GY), stair boxes con coordinate, hitbox tutti gli oggetti
- Utile per allineare il background PNG con la logica

**Clip sprite sulle scale:** `drawCharClipped()` in `draw-chars.js` disegna Marco in due passate (sopra e sotto la banda del pavimento) quando `player.onStair` è true. La banda è `[surfaceY - fdTop, surfaceY + fdBot]`.

## CONFIG (js/config.js)

- `CONFIG.layout` — W, H, PW, PH, GY, MY, TY, BW, BH, walkOffset
- `CONFIG.images` — `background`, `backgroundNight`, `logo` (tutti 1600px)
- `CONFIG.audio` — `musicVolume`, `sfxVolume`, `music`, `introMusic`, `bossMusic`, `sfx` map
- `CONFIG.display` — `fontFamily`
- `CONFIG.debug.unlockAllLevels` — `true` sblocca tutti i livelli nel chooser

## NPC sprites

Ogni personaggio ha il suo draw function e `COLOURS_*` object in `draw-chars.js`:

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
- **AudioContext** creato all'inizializzazione del modulo `audio.js` (fine IIFE, prima del `return`) — **non** al primo tap. In Capacitor WebView l'autoplay è permesso: se l'AudioContext venisse creato dopo che l'intro music è già in riproduzione (HTMLMediaElement), il mixer Android riconfigura il suo hardware → pop sull'altoparlante. `_warmupAudio()` suona un buffer silenzioso (1 sample, gain 0.001) subito dopo la creazione/resume del context per attivare la pipeline hardware prima dell'audio reale.
- **SFX — doppio percorso:** `playSfx`/`playSfxThen` usano WebAudio (`fetch` + `decodeAudioData`) come percorso primario (zero latency). Se i buffer non sono pronti (es. `file://` dove `fetch` fallisce silenziosamente), cade in un fallback on-demand `new Audio(url)` senza pre-caricamento. Su Capacitor WebView il percorso WebAudio è sempre attivo.
- **SFX opzionali:** `sfx` map in `config.js` supporta `null` per disabilitare un suono. Il fetch loop salta le voci null; `playSfx`/`playSfxThen` non fanno nulla (o chiamano subito il callback in mode mute).
- `_btrMax` — dichiarato in `state.js` (non in `title.js`). Alcuni Android WebView sparano rAF prima che l'ultimo script (`title.js`) abbia finito di eseguire; `drawTitleScreen()` usava `_btrMax` a riga 116 e crashava con ReferenceError, lasciando visibile solo `"< Lvl 1"`. Spostare la dichiarazione in `state.js` (che carica prima di `game.js`) garantisce che il valore esista sempre quando il loop disegna.

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
const files=['js/config.js','js/palette.js','js/scene.js','js/ui.js','js/draw-chars.js','js/draw-objects.js','js/levels.js','js/i18n.js','js/audio.js','js/state.js','js/input.js','js/physics.js','js/entities.js','js/draw-game.js','js/draw-title.js','js/draw-hud.js','js/draw-overlays.js','js/menus.js','js/game.js','js/title.js'];
const src=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
try{new Function(src);console.log('JS OK');}catch(e){console.log('ERRORE:',e.message);}
"
```

**Non fare mai deploy se il test restituisce `ERRORE`.**

## Build APK — note importanti

- Lo script `apk` in `package.json` usa `./gradlew clean assembleDebug` (non solo `assembleDebug`).
- **Motivo:** la cache incrementale di Gradle può skippare `mergeDebugAssets` dopo un `cap sync`, producendo un APK byte-per-byte identico al precedente anche se i file in `www/` sono cambiati. Scoperto con v1.0.14 (25M identico a v1.0.13) dopo l'ottimizzazione audio #191; v1.0.15/v1.0.16 clean build → 18M.
- Il `clean` aggiunge ~5-10s ma garantisce che gli asset aggiornati siano inclusi.

## Tooling release

**`npm run check`** — esegue `dev/scripts/check-dead.js`: analisi statica dead code su PAL keys, STRINGS keys, sfx keys, CONFIG.ui subkeys, HTML element IDs, asset files, funzioni globali top-level. Esce con `process.exit(1)` se trova problemi. Eseguire sempre prima di ogni release (è automaticamente prepend a `npm run apk`).

**`npm run apk`** — prepend `npm run check &&` quindi fallisce subito se c'è dead code.

**`dev/checklists/release-checklist.md`** — checklist completa per ogni release con ownership 🤖 (automatico) / 👤 (manuale). Basta dire "facciamo la release" per avviare il flusso 🤖.

**`dev/checklists/merge-checklist.md`** — checklist pre/post-merge per proteggere main. Basta dire "facciamo il merge" per avviare il flusso 🤖.

**Flusso release 🤖:**
1. `npm run check` — nessun dead code
2. Verificare flag debug off (`CONFIG.debug.unlockAllLevels`, `godMode`)
3. Bump versione in `package.json`
4. Commit e push
5. `npm run apk` — build + upload Drive automatico
6. `CLAUDE.md` — aggiornare se cambiano architettura o convenzioni
7. Memoria — salvare se emerso qualcosa di non-ovvio
8. `git tag v<versione>` e push
