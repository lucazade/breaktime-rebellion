# Release Checklist — Breaktime Rebellion

> Basta dire **"facciamo la release"** — Claude gestisce tutto il tranne i punti marcati 👤.

## 1. Codice 🤖
- [ ] `npm run check` — nessun dead code
- [ ] Flag debug disattivi (`CONFIG.debug.unlockAllLevels`, `godMode`, `startAtBonus`, `sightDebug`)

## 2. Test 👤 (confermato da Luca prima di dire "facciamo release")
- [x] Testato su desktop
- [x] Testato su Android

## 3. Versione 🤖
- [ ] `package.json` — versione aggiornata
- [ ] Commit e push

## 4. Build 🤖
- [ ] `npm run apk` — completato senza errori
- [ ] APK caricato su Drive (automatico)

## 5. Documentazione 🤖
- [ ] **README.md** — aggiornare se cambiano controlli, feature visibili o descrizione
- [ ] **CLAUDE.md** — aggiornare se cambiano architettura, convenzioni o file structure
- [ ] **CLAUDE.md compattazione** — ogni 3-4 release, rimuovere sezioni obsolete
- [ ] **Memoria** — salvare se emerso qualcosa di non-ovvio nella sessione
- [ ] `git tag v<versione>` e push

## 6. Notion 🤖
- [ ] Aggiornare pagina Sviluppi su Notion (Completato + In corso)
