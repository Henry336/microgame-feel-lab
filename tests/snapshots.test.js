import assert from "node:assert/strict";
import { getPresetConfig } from "../src/config.js";
import { createChallengeState, updateChallengeState } from "../src/challenge.js";
import { applySnapshot, createSnapshotState, saveSnapshot, snapshotStatus, toggleSnapshot } from "../src/snapshots.js";

let snapshots = createSnapshotState();
const snappy = getPresetConfig("snappy");
const heavy = getPresetConfig("heavy");

let emptyApply = applySnapshot(snapshots, "A");
assert.equal(emptyApply.config, null);
assert.equal(emptyApply.message, "Slot A is empty.");
assert.equal(emptyApply.state, snapshots);
assert.equal(snapshotStatus(snapshots), "Custom - A:empty B:empty");

snapshots = saveSnapshot(snapshots, "A", snappy);
assert.equal(snapshots.activeSlot, "A");
assert.match(snapshotStatus(snapshots), /A:saved B:empty/);
assert.equal(snapshotStatus(snapshots), "Slot A active - A:saved B:empty");

snapshots = saveSnapshot(snapshots, "B", heavy);
assert.equal(snapshots.activeSlot, "B");
assert.match(snapshotStatus(snapshots), /A:saved B:saved/);

let applied = applySnapshot(snapshots, "A");
assert.equal(applied.state.activeSlot, "A");
assert.deepEqual(applied.config, snappy);

applied = toggleSnapshot(applied.state);
assert.equal(applied.state.activeSlot, "B");
assert.deepEqual(applied.config, heavy);
assert.equal(snapshotStatus(applied.state), "Slot B active - A:saved B:saved");

const runningChallenge = updateChallengeState(createChallengeState(), { start: true, finish: false, gates: new Set() }, 16);
const afterSnapshotApply = applySnapshot(applied.state, "A");
assert.equal(runningChallenge.active, true);
assert.equal(runningChallenge.elapsedMs, 0);
assert.deepEqual(afterSnapshotApply.config, snappy);

assert.throws(() => saveSnapshot(snapshots, "C", snappy), /Unknown snapshot slot/);

console.log("Snapshot tests passed.");
