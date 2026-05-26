# Merge Checklist — Breaktime Rebellion

> Basta dire **"facciamo il merge"** — Claude gestisce tutto tranne i punti marcati 👤.

## Pre-merge 🤖

- [ ] Validazione JS — `new Function(src)` restituisce `JS OK`
- [ ] `npm run check` — nessun dead code
- [ ] Flag debug disattivi (`CONFIG.debug.unlockAllLevels`, `godMode`)
- [ ] Nessun `console.log` di debug rimasto nel branch
- [ ] Branch aggiornato con main (nessun conflitto)
- [ ] Test desktop: path toccati dal branch 👤

## Post-merge 🤖

- [ ] Branch locale eliminato
- [ ] `git push` — main pushato su origin
- [ ] **CLAUDE.md** — aggiornare se cambiano architettura, convenzioni o struttura file
- [ ] **Memoria** — salvare se emerso qualcosa di non-ovvio nel branch
- [ ] Valutare se avviare il flusso release 👤
