# Breaktime Rebellion — CLAUDE.md

## Progetto

Gioco HTML5 stile Skool Daze, ambientazione liceo italiano anni 80/90.
Protagonista: **Marco**.

## File principale

`breaktime-rebellion.html` — tutto in un file unico (HTML5 Canvas + JS vanilla, nessun framework).

## Asset e stile

- **Font:** Press Start 2P (Google Fonts)
- **Palette colori:** C64 autentica — definita in `CONFIG.colors` (alias `const C`)
- **Logo title screen:** `assets/logo.png` (caricato via `<img src>`, non più base64)

## Struttura script

All'inizio dello `<script>` c'è un blocco `CONFIG` con tutte le impostazioni modificabili:
- `CONFIG.layout` — dimensioni canvas, personaggi, pavimenti (W, H, PW, PH, GY, MY, TY, BW, BH)
- `CONFIG.colors` — palette C64 (alias `C`)
- `CONFIG.images` — percorsi immagini
- `CONFIG.audio` — volumi (placeholder per task #9)

Le costanti `W`, `H`, `PW`, `PH`, `GY`, `MY`, `TY`, `BW`, `BH`, `C` sono alias verso CONFIG per compatibilità col resto del codice.

## Piano di lavoro

Vedi `misc/appunti.txt` per il piano di implementazione a fasi.

## Convenzioni commit

Usare sempre messaggi descrittivi:
- `feat: ...` — nuova funzionalità
- `fix: ...` — correzione bug
- `chore: ...` — manutenzione, configurazione
- `docs: ...` — documentazione
- `refactor: ...` — refactoring senza cambio funzionale

## Validazione JS — obbligatoria prima di ogni modifica

Prima di ogni modifica a `breaktime-rebellion.html`, estrarre il blocco `<script>` e validarlo:

```bash
node -e "const fs=require('fs');const c=fs.readFileSync('breaktime-rebellion.html','utf8');const m=c.match(/<script>([\s\S]*?)<\/script>/);try{new Function(m[1]);console.log('JS OK');}catch(e){console.log('ERRORE:',e.message);}"
```

**Non fare mai deploy se il test restituisce `ERRORE`.**
