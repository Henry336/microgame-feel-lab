import assert from "node:assert/strict";
import { challengeLabel, createChallengeState, splitDelta, splitDeltaLabel, splitSummary, updateChallengeState } from "../src/challenge.js";

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
assert.equal(state.splitTimes.hop, 300);

state = updateChallengeState(state, overlap({ gates: new Set(["air"]) }), 100);
state = updateChallengeState(state, overlap({ gates: new Set(["dash"]) }), 100);
assert.equal(state.nextGateIndex, 3);
assert.match(challengeLabel(state), /^Finish/);

state = updateChallengeState(state, overlap({ finish: true }), 100);
assert.equal(state.active, false);
assert.equal(state.complete, true);
assert.equal(state.bestMs, state.elapsedMs);
assert.deepEqual(state.bestSplits, { hop: 300, air: 400, dash: 500, finish: 600 });
assert.equal(splitDeltaLabel(state, "finish"), "+0.00s");
assert.equal(splitSummary(state), "Hop +0.00s | Air +0.00s | Dash +0.00s | Finish +0.00s");
assert.match(challengeLabel(state), /^Route 0\.60s best$/);

const slowerStart = updateChallengeState(state, overlap({ start: true }), 16);
assert.equal(slowerStart.complete, false);
assert.equal(slowerStart.bestMs, state.bestMs);
assert.deepEqual(slowerStart.bestSplits, state.bestSplits);

let slower = updateChallengeState(slowerStart, none(), 450);
slower = updateChallengeState(slower, overlap({ gates: new Set(["hop"]) }), 50);
assert.equal(splitDelta(slower, "hop"), 200);
assert.equal(splitDeltaLabel(slower, "hop"), "+0.20s");
slower = updateChallengeState(slower, overlap({ gates: new Set(["air"]) }), 200);
slower = updateChallengeState(slower, overlap({ gates: new Set(["dash"]) }), 200);
slower = updateChallengeState(slower, overlap({ finish: true }), 200);
assert.equal(slower.bestMs, state.bestMs, "slower runs keep the previous best route time");
assert.deepEqual(slower.bestSplits, state.bestSplits, "slower runs keep the previous best splits");
assert.equal(splitDeltaLabel(slower, "finish"), "+0.50s");

console.log("Challenge tests passed.");
