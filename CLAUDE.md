# Breaktime Rebellion — CLAUDE.md

## Progetto

Gioco HTML5 stile Skool Daze, ambientazione liceo italiano anni 80/90.
Protagonista: **Marco**.

## Struttura file

```
index.html          ← HTML scheletro + link a css/ e js/
css/
  style.css         ← tutti gli stili
js/
  config.js         ← CONFIG (caricato prima di game.js)
  game.js           ← logica di gioco, physics, draw, loop
assets/
  logo.png          ← logo title screen (1408×768)
misc/
  appunti.txt       ← piano di implementazione a fasi
```

## Stack

HTML5 Canvas + JS vanilla, nessun framework. Font: Press Start 2P (Google Fonts). Palette: C64 autentica.

## Architettura game.js

**Template vs stato mutabile:**
- `BOARDS_DEF`, `BAGS_DEF`, `TEACHERS_DEF` — dati immutabili del livello
- `resetLevel()` — clona i template e resetta tutto lo stato; chiamare per ogni nuovo livello
- `lives` e `score` sono separati da `resetLevel()` (persistono tra livelli)

**Pattern da seguire aggiungendo oggetti:**
- Aggiungere la definizione in un `*_DEF` array
- Clonare in `resetLevel()` con `.map()`
- Non modificare mai i `*_DEF` direttamente

## CONFIG (js/config.js)

Unico punto per modificare layout, colori, immagini, audio:
- `CONFIG.layout` — W, H, PW, PH, GY, MY, TY, BW, BH
- `CONFIG.colors` — palette C64 (alias `C` in game.js)
- `CONFIG.images` — percorsi immagini
- `CONFIG.audio` — volumi (placeholder per task #9)

Le costanti `W`, `H`, `PW`, `PH`, `GY`, `MY`, `TY`, `BW`, `BH`, `C` sono alias verso CONFIG per compatibilità.

## Teacher sprites

- **Prof.Rossi** (piano terra): giacca rossa, pantaloni blu, cravatta gialla
- **Prof.Verdi** (piano medio): giacca verde, pantaloni blu, cravatta gialla
- **Prof.Neri** (piano alto, maxX=275): giacca grigia, pantaloni blu, cravatta gialla

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
