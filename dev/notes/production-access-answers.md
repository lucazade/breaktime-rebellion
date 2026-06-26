# Production Access — Risposte questionario (personalizzate)

> Il form del Play Console è in **inglese**: le risposte sotto sono in inglese, pronte da incollare.
> Sono scritte in modo **autentico e specifico** sulla tua situazione reale (NON il testo generico
> del provider, che Google tende a leggere come red-flag e che cita modifiche mai fatte).
> Adatta numeri/dettagli dove serve — sono pensate per essere modeste e credibili, non gonfiate.
>
> Contesto vero: 1° tentativo con amici/parenti → rifiutato dopo 14 giorni. 2° tentativo con una
> community di tester chiusi (Tester Community, 25 tester) + alcuni amici appassionati di retrogaming.
> In questo round abbiamo davvero implementato: onboarding "How to play", pulsante "Rate on Play Store",
> riscrittura ASO della descrizione, più fix di gameplay/audio dal nostro test.

---

**1) How did you recruit users for your closed test?**

For this round I recruited testers through a dedicated closed-testing community (Tester Community), which gave me a group of ~25 testers running the app on a range of Android devices and SDK versions. I also added a few friends who are into retro/arcade games to get feedback from people in the actual target audience. (My first closed test was only friends and family, which is part of why I rebuilt the testing process this time.)

**2) How easy was it to recruit testers for your app?**

Moderate. Recruiting 12+ committed testers from friends and family was hard the first time, so this round I used a structured testing community, which made reaching the required number of active testers much easier.

**3) Describe the engagement you received from testers during your closed test.**

Testers played the game across several devices and reported back on stability, controls and clarity. Engagement was good: I received a written feedback report plus direct messages. One concrete device-specific issue surfaced (joystick offset on a Motorola device) which I'm tracking, and several usability notes about onboarding and the store listing that I acted on.

**4) Provide a summary of the feedback that you received from testers. Include how you collected the feedback.**

Feedback was collected via a written report and direct chat. Main points: (a) new players weren't sure of the controls at first, (b) there was no in-app way to rate the game, and (c) the store description and screenshots could be clearer for discovery. The app itself was reported as stable with no crashes across the tested devices. Based on this I added an on-launch "How to play" controls guide, an in-app "Rate on Play Store" button, and rewrote the store description for clarity and keywords.

**5) Who is the intended audience for your app?**

People who enjoy retro arcade games and pixel-art: students and adults with a nostalgic interest in 80s/90s games. It's a single-player, offline, free game with no ads, suitable for a broad casual audience.

**6) Describe how your app provides value to the users.**

Breaktime Rebellion is a short, self-contained retro arcade game: 10 hand-made levels, each with its own mission and a stealth element (teachers patrol with line-of-sight). It's free, has no ads, works offline, and supports English and Italian. The value is a quick, nostalgic, pick-up-and-play experience.

**7) How many installs do you expect your app to have in your first year?**

1,000 - 10,000. It's a free indie game from a first-time solo developer, so I'm keeping expectations realistic and focused on a small, engaged audience rather than mass installs.

**8) What changes did you make to your app based on what you learned during your closed test?**

Concretely, based on tester feedback I: (1) added an on-launch "How to play" overlay explaining movement, stairs and the action button, since new players found the controls unclear; (2) added an in-app "Rate on Play Store" button in the credits screen; (3) rewrote the store short and full descriptions to be clearer and more discoverable. From my own testing in the same period I also tuned the stair-entry control to avoid accidental triggers and fixed the end-of-level score sound. The app remained crash-free throughout.

**9) How did you decide that your app is ready for production?**

The app ran without crashes across the range of devices and Android versions the testers used, all 10 levels are complete and playable, and I addressed the usability feedback (onboarding, rating, store clarity) directly. At that point the remaining items were polish rather than blockers, so it felt ready for a wider audience.

**10) What did you do differently this time?**

The first time I tested only with friends and family and submitted without making meaningful changes from the feedback. This time I ran a proper closed test with more testers on diverse devices, collected structured feedback, and actually shipped changes in response to it (the onboarding guide, the rate button, and the clearer store listing), so the submission reflects real improvements rather than just elapsed time.

---

## Note pratiche
- **Non gonfiare i numeri**: ho messo 1k–10k installs (il provider aveva messo 10k–100k, poco credibile per un primo gioco indie sconosciuto — Google lo nota).
- **Coerenza**: le risposte #4/#8 citano onboarding + rate button + ASO, che ora esistono davvero nell'app (v1.0.52). Quando carichi l'AAB con queste feature, le risposte sono pienamente vere.
- Il bug joystick Motorola è citato onestamente come "tracking" — mostra engagement reale, non lo nascondere.
