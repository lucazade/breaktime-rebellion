# Release Checklist — Breaktime Rebellion

> Basta dire **"facciamo la release"** — Claude gestisce tutto il tranne i punti marcati 👤.

## 1. Codice 🤖
- [ ] `npm run check` — nessun dead code
- [ ] Flag debug disattivi (`CONFIG.debug.unlockAllLevels`, `godMode`, `startAtBonus`, `sightDebug`)

## 2. Test 👤
- [ ] Testato su desktop (livelli toccati dalla release + smoke test sugli altri)
- [ ] Testato su Android (APK installato e verificato)

## 3. Versione 🤖
- [ ] `package.json` — versione aggiornata
- [ ] Commit e push

## 4. Build 🤖
- [ ] `npm run apk` — completato senza errori
- [ ] APK caricato su Drive (automatico)

## 5. Documentazione 🤖
- [ ] **CLAUDE.md** — aggiornare se cambiano architettura, convenzioni o file structure
- [ ] **CLAUDE.md compattazione** — ogni 3-4 release, rimuovere sezioni obsolete
- [ ] **Memoria** — salvare se emerso qualcosa di non-ovvio nella sessione
- [ ] `git tag v<versione>` e push

## 6. Notion 👤
- [ ] Aggiornare stato progetto / ticket chiusi
