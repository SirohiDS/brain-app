# NeuroForge — Brain Training Suite

A dependency-free, offline-capable brain-training PWA. Three plain HTML files, no build step, no framework, no tracking. Progress lives in `localStorage` on the device.

**Live:** open `index.html`, or serve the folder and add it to your home screen.

---

## What's in it

| App | What it is |
|---|---|
| **Daily Training** (`NeuroForge.html`) | 46 adaptive challenges across 7 skills. Adaptive difficulty, streaks, XP, brain score, achievements, delayed-recall vault. |
| **Free Play** (`NeuroForge.html?action=freeplay`) | Play any single game on its own, filtered by skill, with per-game personal bests. |
| **ReflexForge Arena** (`ReflexForge.html`) | 9 arcade reaction modes on a 3D CSS grid. Reaction grades, combo multipliers, survival. |

### Skills trained

Memory · Visual memory · Focus · Calculation · Reasoning · Reaction · Flexibility

Every session ends with a brain score, a per-skill breakdown, and a specific recommendation targeting your weakest skill. The next session then weights extra practice toward that skill.

---

## Games

<details>
<summary><b>Daily Training — 46 challenges</b></summary>

**Memory** — Word Span, Digit Span, Names & Faces, Shopping List, Story Recall, Dual N-Back, Echo, Memory Pairs

**Visual** — Pattern Flash, Symbol Sequence, Board Recall, Mental Rotation, Path Memory, Paper Folding†, Mirror Match†, Maze Route†, Shape Fit†

**Focus** — Stroop Test, Attention Stream, Visual Search, Go / No-Go

**Calculation** — Math Sprint, Calendar Maths, Dot Flash

**Reasoning** — Number Series, Odd One Out, Analogy, Coding–Decoding, Anagram Forge, Tower of Hanoi, Matrix Puzzle, Code Breaker†, Knights & Knaves†, Valid or Not?†, Latin Square†, Mine Logic†, Logic Grid†, Word Deduction†, Sentence Rebuild†, Odd Word Out†

**Reaction** — Reaction Test, Whack-a-Cell, Speed Sort

**Flexibility** — Rule Switch, True/False Blitz, Word Chain†

† new in v2
</details>

<details>
<summary><b>ReflexForge — 9 arcade modes</b></summary>

- **Classic** — 60s fundamentals. Tap purple, never red.
- **Blitz Survival** — no timer, accelerating, 3 lives.
- **Target Storm** — up to 3 pads at once.
- **Sniper** — tiny short-lived targets on a 5×5 board.
- **Discipline** — half the pads are decoys.
- **Rule Flip** ✨ — the colour rule inverts every few seconds.
- **Rhythm** ✨ — pads land on a beat; timing scores higher than raw speed.
- **Chase** ✨ — a single target that jumps as you close in.
- **Gauntlet** ✨ — five escalating waves, 3 lives.

✨ new in v2
</details>

---

## Controls

**Daily Training**

| Key | Action |
|---|---|
| `Enter` / `Space` | Submit, or advance to the next challenge |
| `1`–`9` | Pick the nth multiple-choice option |
| `Esc` | Back to home (confirms mid-session) |

**ReflexForge**

| Key | Action |
|---|---|
| `1`–`9` | Launch that mode from the menu |
| `Esc` | Quit the current run |

---

## Accessibility

- Dark mode, three text sizes, colour-blind assist (adds ✓/✕ marks and patterns so colour is never the only signal)
- Full keyboard navigation
- `prefers-reduced-motion` respected — confetti, screen shake and beat pulses are suppressed
- Haptics and sound independently toggleable

---

## Your data

Everything is stored in `localStorage` under the keys `neuroforge` (progress) and `neuroforge_session` (an in-progress session, so you can close the tab mid-workout and resume).

Nothing is sent anywhere. There is no analytics, no account, no network call except the Google Fonts stylesheet on first load.

**Settings → Your data** has *Export backup* / *Restore backup*, because clearing site data would otherwise wipe your streak with no recourse.

---

## Running it

It is static — any file server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

A service worker (`sw.js`) caches the app shell on first load. HTML is network-first so deploys land immediately; everything else is cache-first.

> Opening `index.html` via `file://` works for the games, but service workers and the web manifest need `http://` or `https://`, so offline install and "Add to Home Screen" won't be available.

---

## Project layout

```
index.html              hub / launcher
NeuroForge.html         daily training + free play (self-contained)
ReflexForge.html        reflex arena (self-contained)
sw.js                   service worker
manifest.webmanifest    PWA manifest
icon-*.png              app icons
```

Each HTML file is standalone — inline CSS and JS, no imports. That is deliberate: the whole suite is three files you can drop on any host.

---

## Changelog — v2

**New**
- 14 new Daily Training challenges (logic & deduction, word & language, spatial)
- 4 new ReflexForge modes
- **Free Play** — play any game on its own, filtered by skill, with per-game bests
- Session length options: Chill (8) / Normal (13) / Intense (18)
- Full keyboard control across both apps
- Progress export / restore
- Confetti on a perfect score, session progress bar, 4 new achievements

**Fixed**
- `manifest.webmanifest` was referenced but **did not exist**. Because the old service worker used `cache.addAll()`, that single 404 rejected the whole install — so the service worker never activated and the app was never actually available offline, despite the claim on the home screen. The manifest now exists and assets are cached individually.
- Challenges used bare `setTimeout`, but the screen switcher only cleared `setInterval`. Callbacks fired after their DOM was gone and threw `Cannot set properties of null` — reproducibly in *Dot Flash*. Timeouts are now tracked and cleared alongside intervals.
- Achievements were matched by substring, so unlocking *7-Day Streak — Focus Champion* also falsely unlocked the separate *Focus Champ* (90+ focus score) trophy. They are keyed by stable IDs now, with migration for existing saves.
- The *New Record* trophy was pushed to the "just unlocked" list but never saved, so it could never appear as unlocked.
- Daily missions were decorative — any score ≥ 0.8 marked *any* mission complete regardless of what it said. Each mission now has a real predicate checked against the finished session.
- Quitting ReflexForge during the 3-2-1 countdown left the countdown interval running; it then called `run()` against the *next* game, spawning ghost pads into an unrelated mode.
- The home screen promised sessions "weight extra practice toward your weak spot". They didn't — the pool was a flat shuffle. Now they genuinely do.
- Coins and Focus Points were tracked but hidden off-screen at `left:-9999px`. They're real HUD items.
- Service worker cached cross-origin font requests and used cache-first for HTML, so updates could stick indefinitely.
- Guarded `results()` against an empty session producing `NaN` brain scores.
- A failing challenge now skips instead of stranding the whole session.

**Removed**
- `NeuroForge Redesign.dc.html`, `NeuroForge-Redesign-review.html`, `support.js` — ~380 KB of design-tool artifacts that no page loaded.

---

## License

MIT
