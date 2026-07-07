# Micro-Game Feel Lab

A tiny playable web app for learning game feel by tuning movement, jump, dash, hitstop, recoil, camera shake, particles, sound, gravity, acceleration, coyote time, and input buffering in real time.

The first screen is the lab: move, jump, dash, bonk the target dummy, and adjust parameters while playing.

## Run

Open `index.html` in a browser, or serve the folder with any static server.

Controls:

- Move: `A/D` or arrow keys
- Jump: `W`, up arrow, or space
- Dash: `Shift`, `K`, or `X`
- Reset player: `R`

## Checks

```powershell
npm test
npm run typecheck
npm run build
```

No install step is required for the current static app.

## Product Direction

The lab should stay small, tactile, and immediate. Near-term work should improve the playable canvas, make tuning differences easier to feel, and keep presets/export/import deterministic.
