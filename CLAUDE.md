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
js/
  config.js         ← CONFIG (caricato prima di i18n.js e game.js)
  i18n.js           ← stringhe localizzate; definisce window.STRINGS (EN default, IT auto)
  game.js           ← logica di gioco, physics, draw, loop
assets/
  logo.png          ← logo title screen (1408×768)
  icon-192.png      ← icona PWA 192×192 (logo centrato su sfondo blu C64)
  icon-512.png      ← icona PWA 512×512
misc/
  appunti.txt       ← piano di implementazione a fasi
```

## Stack

HTML5 Canvas + JS vanilla, nessun framework. Font: Press Start 2P (Google Fonts). Palette: C64 autentica.

## Controlli

- **Desktop**: frecce direzionali + Z/Spazio
- **Mobile**: joystick analogico overlay `#ctrl-joy` (bottom-left) + bottone `#btn-action` (bottom-right)
- **Scala**: ingresso richiede diagonale che corrisponde alla direzione della scala. Le scale vanno tutte su-destra → K.up+K.right per salire, K.down+K.left per scendere. Una volta sulla scala K.up/K.down hanno priorità su K.left/K.right.

## PWA / Mobile

- Installabile come app Android via "Aggiungi a schermata Home" su Chrome
- In `display-mode: fullscreen` o `standalone`: canvas si stretcha a riempire tutto lo schermo
- In browser normale: aspect ratio 16:10 mantenuto
- Firefox mobile supporta fullscreen PWA; Safari iOS supporta standalone via meta tag Apple

## Architettura game.js

**Template vs stato mutabile:**
- `BOARDS_DEF`, `BAGS_DEF`, `TEACHERS_DEF` — dati immutabili del livello
- `resetLevel()` — clona i template e resetta tutto lo stato; chiamare per ogni nuovo livello
- `lives` e `score` sono separati da `resetLevel()` (persistono tra livelli)

**Pattern da seguire aggiungendo oggetti:**
- Aggiungere la definizione in un `*_DEF` array
- Clonare in `resetLevel()` con `.map()`
- Non modificare mai i `*_DEF` direttamente

## i18n (js/i18n.js)

Tutte le stringhe visibili all'utente sono in `window.STRINGS`. Default inglese, italiano se `navigator.language` inizia con `it`. Override locale con `?lang=en` o `?lang=it` nell'URL (utile per test).

Per aggiungere una stringa: aggiungerla in `en` e `it`, poi usare `STRINGS.chiave` in `game.js` o `index.html`.

Ordine di caricamento obbligatorio: `config.js` → `i18n.js` → `game.js`.

## CONFIG (js/config.js)

Unico punto per modificare layout, colori, immagini, audio, gameplay:
- `CONFIG.layout` — W, H, PW, PH, GY, MY, TY, BW, BH
- `CONFIG.colors` — palette C64 (alias `C` in game.js)
- `CONFIG.images` — percorsi immagini
- `CONFIG.audio` — volumi (placeholder per task #9)
- `CONFIG.levelTimer` — secondi per completare il livello (0 = disabilitato)

Le costanti `W`, `H`, `PW`, `PH`, `GY`, `MY`, `TY`, `BW`, `BH`, `C` sono alias verso CONFIG per compatibilità.

## Teacher sprites

- **Prof.Rossi** (piano terra): giacca rossa, pantaloni blu, cravatta gialla
- **Prof.Verdi** (piano medio): giacca verde, pantaloni blu, cravatta gialla
- **Prof.Neri** (piano alto, maxX=275): giacca grigia, pantaloni blu, cravatta gialla

## HUD icons

Icons in `#hud-row` use **Font Awesome 6 Solid** (CDN). Loaded via `solid.min.css` + `fontawesome.min.css` in `<head>`.
- Lives: `♥` repeated (Press Start 2P, class `.hl`, color `#ff6b6b`)
- Boards: `fa-spray-can` (green `#9ad284`) + `0/6` counter
- Score: `fa-star` (gold `#ffd700`) + score number

Classes: `.hud-icon` (size), `.hud-spray` (color), `.hud-star` (color).

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
const cfg=fs.readFileSync('js/config.js','utf8');
const game=fs.readFileSync('js/game.js','utf8');
try{new Function(cfg+'\n'+game);console.log('JS OK');}catch(e){console.log('ERRORE:',e.message);}
"
```

**Non fare mai deploy se il test restituisce `ERRORE`.**
