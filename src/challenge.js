export const CHALLENGE_ROUTE = Object.freeze({
  startPad: Object.freeze({ x: 42, y: 430, w: 82, h: 26 }),
  finishPad: Object.freeze({ x: 838, y: 430, w: 82, h: 26 }),
  gates: Object.freeze([
    Object.freeze({ id: "hop", label: "Hop", x: 232, y: 314, w: 46, h: 46 }),
    Object.freeze({ id: "air", label: "Air", x: 486, y: 258, w: 46, h: 46 }),
    Object.freeze({ id: "dash", label: "Dash", x: 707, y: 202, w: 50, h: 48 })
  ])
});

export function createChallengeState() {
  return {
    active: false,
    complete: false,
    elapsedMs: 0,
    bestMs: null,
    nextGateIndex: 0,
    flashMs: 0
  };
}

export function formatTime(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

export function challengeLabel(state) {
  if (state.complete) {
    return `Route ${formatTime(state.elapsedMs)}${state.bestMs === state.elapsedMs ? " best" : ""}`;
  }
  if (!state.active) {
    return state.bestMs === null ? "Route: touch start" : `Best ${formatTime(state.bestMs)}`;
  }
  const nextGate = CHALLENGE_ROUTE.gates[state.nextGateIndex];
  return nextGate ? `Gate: ${nextGate.label} ${formatTime(state.elapsedMs)}` : `Finish ${formatTime(state.elapsedMs)}`;
}

export function updateChallengeState(state, overlaps, dtMs) {
  const next = { ...state, flashMs: Math.max(0, state.flashMs - dtMs) };

  if (!next.active && overlaps.start) {
    return {
      ...next,
      active: true,
      complete: false,
      elapsedMs: 0,
      nextGateIndex: 0,
      flashMs: 180
    };
  }

  if (!next.active) return next;

  next.elapsedMs = Math.round(next.elapsedMs + dtMs);
  const expectedGate = CHALLENGE_ROUTE.gates[next.nextGateIndex];
  if (expectedGate && overlaps.gates.has(expectedGate.id)) {
    next.nextGateIndex += 1;
    next.flashMs = 180;
  }

  if (!CHALLENGE_ROUTE.gates[next.nextGateIndex] && overlaps.finish) {
    next.active = false;
    next.complete = true;
    next.bestMs = next.bestMs === null ? next.elapsedMs : Math.min(next.bestMs, next.elapsedMs);
    next.flashMs = 360;
  }

  return next;
}
