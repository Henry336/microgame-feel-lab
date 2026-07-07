# Autonomy Log

## 2026-07-08

### Read

- Reviewed README, roadmap, changelog, autonomy log, recent commits, scripts, source, and tests.
- `gh` is still not installed, so open issues could not be inspected from this environment.

### Shipped

- Added a visible challenge route with start/finish pads, ordered Hop/Air/Dash gates, live route timing, and best-time feedback.
- Split deterministic route state into `src/challenge.js` and covered it with `tests/challenge.test.js`.
- Updated static validation and typecheck coverage for the new route module and HUD readout.

### Noticed

- The lab now has a repeatable task for comparing presets, but the exact gate placement has only been code-inspected, not browser-playtested in this run.
- The route timer makes differences more legible, but A/B snapshot comparison is still missing.

### Next

- Play the route across every preset and adjust gate spacing where it feels unfair or too similar.
- Add before/after feel snapshots for quick preset-versus-custom comparison.

## 2026-07-07

### Read

- The GitHub repository cloned as empty, with no README, docs, commits beyond the empty remote state, or local tests.
- `gh` is not installed, so open issues could not be inspected from the CLI this run.

### Shipped

- Created the initial static playable lab in `index.html`, `src/game.js`, and `src/styles.css`.
- Added deterministic preset/config logic in `src/config.js`.
- Added Node-based checks for preset ranges, config normalization, JSON export/import, and static file integrity.
- Created required repo memory files: roadmap, changelog, and autonomy log.

### Noticed

- The first playable slice uses direct canvas logic rather than Phaser/Pixi because the repo was empty and this run needed a no-install baseline.
- The scene already demonstrates jump feel, dash feel, coyote time, buffering, recoil, hitstop, shake, and particles, but it needs a more explicit skill challenge.

### Next

- Add a small challenge lane with timing gates and success feedback.
- Add A/B snapshot comparison so users can feel a preset versus a custom config quickly.
