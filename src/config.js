export const PARAMS = [
  { key: "maxSpeed", label: "Max Speed", min: 160, max: 680, step: 10, unit: "px/s" },
  { key: "acceleration", label: "Acceleration", min: 600, max: 5200, step: 100, unit: "px/s2" },
  { key: "friction", label: "Friction", min: 500, max: 6200, step: 100, unit: "px/s2" },
  { key: "gravity", label: "Gravity", min: 900, max: 3200, step: 50, unit: "px/s2" },
  { key: "jumpVelocity", label: "Jump Power", min: 420, max: 980, step: 10, unit: "px/s" },
  { key: "coyoteMs", label: "Coyote Time", min: 0, max: 220, step: 5, unit: "ms" },
  { key: "bufferMs", label: "Jump Buffer", min: 0, max: 220, step: 5, unit: "ms" },
  { key: "dashSpeed", label: "Dash Speed", min: 350, max: 1300, step: 25, unit: "px/s" },
  { key: "dashMs", label: "Dash Length", min: 60, max: 260, step: 5, unit: "ms" },
  { key: "dashCooldownMs", label: "Dash Cooldown", min: 120, max: 900, step: 20, unit: "ms" },
  { key: "hitstopMs", label: "Hitstop", min: 0, max: 180, step: 5, unit: "ms" },
  { key: "recoil", label: "Recoil", min: 0, max: 720, step: 20, unit: "px/s" },
  { key: "shake", label: "Camera Shake", min: 0, max: 28, step: 1, unit: "px" }
];

export const PRESETS = {
  snappy: {
    name: "Snappy Arcade",
    note: "Quick acceleration, punchy jump, readable dash.",
    config: {
      maxSpeed: 420,
      acceleration: 4200,
      friction: 5000,
      gravity: 2100,
      jumpVelocity: 740,
      coyoteMs: 80,
      bufferMs: 100,
      dashSpeed: 850,
      dashMs: 120,
      dashCooldownMs: 360,
      hitstopMs: 55,
      recoil: 260,
      shake: 10,
      particles: true,
      sound: false
    }
  },
  floaty: {
    name: "Floaty Platformer",
    note: "Lower gravity and forgiving jump timing for soft arcs.",
    config: {
      maxSpeed: 330,
      acceleration: 1900,
      friction: 2100,
      gravity: 1150,
      jumpVelocity: 620,
      coyoteMs: 150,
      bufferMs: 150,
      dashSpeed: 620,
      dashMs: 155,
      dashCooldownMs: 520,
      hitstopMs: 25,
      recoil: 140,
      shake: 4,
      particles: true,
      sound: false
    }
  },
  heavy: {
    name: "Heavy Character",
    note: "Weighty movement, harder stops, stronger impact.",
    config: {
      maxSpeed: 280,
      acceleration: 1200,
      friction: 1500,
      gravity: 2700,
      jumpVelocity: 820,
      coyoteMs: 45,
      bufferMs: 70,
      dashSpeed: 580,
      dashMs: 100,
      dashCooldownMs: 620,
      hitstopMs: 105,
      recoil: 460,
      shake: 16,
      particles: true,
      sound: false
    }
  },
  dash: {
    name: "Dash Focused",
    note: "Fast short bursts with low cooldown for route practice.",
    config: {
      maxSpeed: 390,
      acceleration: 3300,
      friction: 4400,
      gravity: 1900,
      jumpVelocity: 680,
      coyoteMs: 90,
      bufferMs: 110,
      dashSpeed: 1125,
      dashMs: 145,
      dashCooldownMs: 180,
      hitstopMs: 45,
      recoil: 200,
      shake: 8,
      particles: true,
      sound: false
    }
  },
  impact: {
    name: "Impact Heavy",
    note: "Big hitstop, recoil, particles, and shake on contact.",
    config: {
      maxSpeed: 360,
      acceleration: 3000,
      friction: 3600,
      gravity: 2050,
      jumpVelocity: 700,
      coyoteMs: 70,
      bufferMs: 90,
      dashSpeed: 760,
      dashMs: 125,
      dashCooldownMs: 420,
      hitstopMs: 140,
      recoil: 620,
      shake: 24,
      particles: true,
      sound: false
    }
  }
};

export const DEFAULT_PRESET = "snappy";
export const DEFAULT_CONFIG = Object.freeze({ ...PRESETS[DEFAULT_PRESET].config });

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeConfig(input = {}) {
  const normalized = {};
  for (const param of PARAMS) {
    const raw = Number(input[param.key] ?? DEFAULT_CONFIG[param.key]);
    const stepped = Math.round(raw / param.step) * param.step;
    normalized[param.key] = clamp(stepped, param.min, param.max);
  }
  normalized.particles = Boolean(input.particles ?? DEFAULT_CONFIG.particles);
  normalized.sound = Boolean(input.sound ?? DEFAULT_CONFIG.sound);
  return normalized;
}

export function getPresetConfig(presetKey) {
  const preset = PRESETS[presetKey] ?? PRESETS[DEFAULT_PRESET];
  return normalizeConfig(preset.config);
}

export function serializeConfig(config) {
  return JSON.stringify(normalizeConfig(config), null, 2);
}

export function deserializeConfig(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Config JSON must be an object.");
  }
  return normalizeConfig(parsed);
}
