# Release Checklist — Breaktime Rebellion

## 1. Codice
- [ ] JS valido: `node -e "new Function(src)"` (o `npm run apk` lo fa via check-dead)
- [ ] `npm run check` — nessun dead code
- [ ] Nessun `console.log` o flag debug attivo (`CONFIG.debug.unlockAllLevels`, `godMode`)

## 2. Test
- [ ] Testato su desktop (tutti i livelli toccati dalla release)
- [ ] Testato su Android (APK installato e verificato)
- [ ] Nessuna regressione visibile su livelli non modificati

## 3. Versione
- [ ] `package.json` — versione aggiornata (`npm version patch/minor`)
- [ ] Commit e push prima di `npm run apk`

## 4. Build
- [ ] `npm run apk` — completato senza errori
- [ ] APK caricato su Drive (fatto automaticamente da `npm run apk`)

## 5. Documentazione
- [ ] **CLAUDE.md** — aggiornare se cambiano architettura, convenzioni o file structure
- [ ] **CLAUDE.md compattazione** — ogni 3-4 release, chiedere a Claude di rimuovere sezioni obsolete o non più rilevanti
- [ ] **Memoria** — salvare se emerso qualcosa di non-ovvio nella sessione (bug latenti, decisioni di design, preferenze workflow)
- [ ] **Notion** — aggiornare stato progetto / ticket chiusi

## 6. Post-release
- [ ] `git tag v<versione>` e push del tag (opzionale ma utile per rollback)
