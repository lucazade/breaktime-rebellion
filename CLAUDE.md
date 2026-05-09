# Breaktime Rebellion — CLAUDE.md

## Progetto

Gioco HTML5 stile Skool Daze, ambientazione liceo italiano anni 80/90.
Protagonista: **Marco**.

## File principale

`breaktime_rebellion_v2.html` — tutto in un file unico (HTML5 Canvas + JS vanilla, nessun framework).

## Asset e stile

- **Font:** Press Start 2P (Google Fonts)
- **Palette colori:** C64 autentica
- **Logo title screen:** `misc/Gemini_Generated_Image_bbqu47bbqu47bbqu.png` (inlinato come base64 nel file HTML)

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

Prima di ogni modifica a `breaktime_rebellion_v2.html`, estrarre il blocco `<script>` e validarlo:

```bash
node -e "const fs=require('fs');const c=fs.readFileSync('breaktime_rebellion_v2.html','utf8');const m=c.match(/<script>([\s\S]*?)<\/script>/);try{new Function(m[1]);console.log('JS OK');}catch(e){console.log('ERRORE:',e.message);}"
```

**Non fare mai deploy se il test restituisce `ERRORE`.**
