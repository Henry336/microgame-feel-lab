import { normalizeConfig } from "./config.js";

export const SNAPSHOT_SLOTS = Object.freeze(["A", "B"]);

export function createSnapshotState() {
  return {
    activeSlot: null,
    slots: {
      A: null,
      B: null
    }
  };
}

function assertSlot(slot) {
  if (!SNAPSHOT_SLOTS.includes(slot)) {
    throw new Error(`Unknown snapshot slot: ${slot}`);
  }
}

export function saveSnapshot(state, slot, config) {
  assertSlot(slot);
  return {
    activeSlot: slot,
    slots: {
      ...state.slots,
      [slot]: normalizeConfig(config)
    }
  };
}

export function applySnapshot(state, slot) {
  assertSlot(slot);
  const saved = state.slots[slot];
  if (!saved) {
    return { state, config: null, message: `Slot ${slot} is empty.` };
  }
  return {
    state: { ...state, activeSlot: slot },
    config: normalizeConfig(saved),
    message: `Applied slot ${slot}.`
  };
}

export function toggleSnapshot(state) {
  const nextSlot = state.activeSlot === "A" ? "B" : "A";
  const preferred = applySnapshot(state, nextSlot);
  if (preferred.config) return preferred;

  const fallbackSlot = nextSlot === "A" ? "B" : "A";
  return applySnapshot(state, fallbackSlot);
}

export function clearActiveSnapshot(state) {
  return { ...state, activeSlot: null };
}

export function snapshotStatus(state) {
  const saved = SNAPSHOT_SLOTS.map((slot) => `${slot}:${state.slots[slot] ? "saved" : "empty"}`).join(" ");
  return state.activeSlot ? `Slot ${state.activeSlot} active - ${saved}` : `Custom - ${saved}`;
}
