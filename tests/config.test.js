import assert from "node:assert/strict";
import { DEFAULT_CONFIG, PARAMS, PRESETS, deserializeConfig, getPresetConfig, normalizeConfig, serializeConfig } from "../src/config.js";

for (const [key, preset] of Object.entries(PRESETS)) {
  const config = getPresetConfig(key);
  for (const param of PARAMS) {
    assert.equal(typeof config[param.key], "number", `${preset.name} ${param.key} is numeric`);
    assert.ok(config[param.key] >= param.min, `${preset.name} ${param.key} is above min`);
    assert.ok(config[param.key] <= param.max, `${preset.name} ${param.key} is below max`);
  }
  assert.equal(typeof config.particles, "boolean", `${preset.name} particles is boolean`);
  assert.equal(typeof config.sound, "boolean", `${preset.name} sound is boolean`);
}

const normalized = normalizeConfig({
  maxSpeed: 9999,
  acceleration: -10,
  friction: 1551,
  gravity: 1124,
  particles: 0,
  sound: 1
});
assert.equal(normalized.maxSpeed, 680);
assert.equal(normalized.acceleration, 600);
assert.equal(normalized.friction, 1600);
assert.equal(normalized.gravity, 1100);
assert.equal(normalized.particles, false);
assert.equal(normalized.sound, true);

const serialized = serializeConfig({ ...DEFAULT_CONFIG, maxSpeed: 333 });
const deserialized = deserializeConfig(serialized);
assert.equal(deserialized.maxSpeed, 330);
assert.deepEqual(deserialized, normalizeConfig(deserialized));

assert.throws(() => deserializeConfig("[]"), /must be an object/);
assert.throws(() => deserializeConfig("{bad json"), SyntaxError);

console.log("Config tests passed.");
