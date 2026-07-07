import assert from "node:assert/strict";
import { challengeLabel, createChallengeState, updateChallengeState } from "../src/challenge.js";

const none = () => ({ start: false, finish: false, gates: new Set() });
const overlap = (patch) => ({ ...none(), ...patch });

let state = createChallengeState();
assert.equal(challengeLabel(state), "Route: touch start");

state = updateChallengeState(state, overlap({ start: true }), 16);
assert.equal(state.active, true);
assert.equal(state.elapsedMs, 0);
assert.match(challengeLabel(state), /^Gate: Hop/);

state = updateChallengeState(state, none(), 100);
state = updateChallengeState(state, overlap({ gates: new Set(["air"]) }), 100);
assert.equal(state.nextGateIndex, 0, "later gates do not count before earlier gates");

state = updateChallengeState(state, overlap({ gates: new Set(["hop"]) }), 100);
assert.equal(state.nextGateIndex, 1);

state = updateChallengeState(state, overlap({ gates: new Set(["air"]) }), 100);
state = updateChallengeState(state, overlap({ gates: new Set(["dash"]) }), 100);
assert.equal(state.nextGateIndex, 3);
assert.match(challengeLabel(state), /^Finish/);

state = updateChallengeState(state, overlap({ finish: true }), 100);
assert.equal(state.active, false);
assert.equal(state.complete, true);
assert.equal(state.bestMs, state.elapsedMs);
assert.match(challengeLabel(state), /^Route 0\.60s best$/);

const slowerStart = updateChallengeState(state, overlap({ start: true }), 16);
assert.equal(slowerStart.complete, false);
assert.equal(slowerStart.bestMs, state.bestMs);

console.log("Challenge tests passed.");
