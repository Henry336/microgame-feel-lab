# Changelog

## 0.3.0 - 2026-07-08

- Added A/B feel snapshots with Save A/B, Apply A/B, and Toggle A/B controls for quick comparison while playing.
- Added snapshot status/readout coverage and deterministic tests for saved, active, empty, and toggled slots.
- Added an explicit Custom preset state so imported, edited, and snapshot-applied configs do not look like unchanged presets.

## 0.2.0 - 2026-07-08

- Added a visible challenge route with start and finish pads, ordered Hop/Air/Dash gates, live route timing, and best-time feedback.
- Added deterministic challenge-state tests for route start, ordered gate progress, finish completion, and best-time preservation.

## 0.1.0 - 2026-07-07

- Bootstrapped the first playable Micro-Game Feel Lab as a static canvas app.
- Added live tuning for movement, jump, dash, hitstop, recoil, camera shake, particles, coyote time, and input buffering.
- Added obvious feel presets: snappy arcade, floaty platformer, heavy character, dash focused, and impact heavy.
- Added JSON export/import plus deterministic config normalization tests.
