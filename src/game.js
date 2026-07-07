import { DEFAULT_PRESET, PARAMS, PRESETS, deserializeConfig, getPresetConfig, serializeConfig } from "./config.js";

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const controls = document.querySelector("#controlList");
const presetSelect = document.querySelector("#presetSelect");
const presetNote = document.querySelector("#presetNote");
const configText = document.querySelector("#configText");
const particlesToggle = document.querySelector("#particlesToggle");
const soundToggle = document.querySelector("#soundToggle");
const speedReadout = document.querySelector("#speedReadout");
const stateReadout = document.querySelector("#stateReadout");
const impactReadout = document.querySelector("#impactReadout");

let config = getPresetConfig(DEFAULT_PRESET);
let lastTime = performance.now();
let hitstop = 0;
let shakeTime = 0;
let impactCount = 0;
const keys = new Set();
const particles = [];

const world = {
  ground: 456,
  platforms: [
    { x: 125, y: 360, w: 170, h: 18 },
    { x: 420, y: 305, w: 155, h: 18 },
    { x: 665, y: 250, w: 150, h: 18 }
  ],
  dummy: { x: 790, y: 388, w: 52, h: 68 }
};

const player = {
  x: 92,
  y: 360,
  w: 34,
  h: 46,
  vx: 0,
  vy: 0,
  facing: 1,
  grounded: false,
  coyote: 0,
  jumpBuffer: 0,
  dash: 0,
  dashCooldown: 0
};

function resetPlayer() {
  Object.assign(player, {
    x: 92,
    y: 360,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: false,
    coyote: 0,
    jumpBuffer: 0,
    dash: 0,
    dashCooldown: 0
  });
}

function setConfig(nextConfig, presetKey = null) {
  config = { ...nextConfig };
  for (const input of controls.querySelectorAll("input[type='range']")) {
    input.value = config[input.dataset.key];
    input.closest(".control").querySelector("output").textContent = `${config[input.dataset.key]} ${input.dataset.unit}`;
  }
  particlesToggle.checked = config.particles;
  soundToggle.checked = config.sound;
  configText.value = serializeConfig(config);
  if (presetKey) {
    presetSelect.value = presetKey;
    presetNote.textContent = PRESETS[presetKey].note;
  }
}

function buildControls() {
  for (const [key, preset] of Object.entries(PRESETS)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = preset.name;
    presetSelect.append(option);
  }

  for (const param of PARAMS) {
    const row = document.createElement("label");
    row.className = "control";
    row.innerHTML = `
      <span>${param.label}</span>
      <output></output>
      <input type="range" data-key="${param.key}" data-unit="${param.unit}" min="${param.min}" max="${param.max}" step="${param.step}" />
    `;
    controls.append(row);
  }
}

function axis() {
  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");
  return Number(right) - Number(left);
}

function wantsJump(key) {
  return key === " " || key === "arrowup" || key === "w";
}

function wantsDash(key) {
  return key === "shift" || key === "k" || key === "x";
}

function spawnBurst(x, y, color, amount) {
  if (!config.particles) return;
  for (let i = 0; i < amount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 90 + Math.random() * 260;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      life: 0.35 + Math.random() * 0.35,
      color
    });
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function moveToward(value, target, maxDelta) {
  if (value < target) return Math.min(value + maxDelta, target);
  if (value > target) return Math.max(value - maxDelta, target);
  return target;
}

function collideSolids(previousY) {
  player.grounded = false;
  const solids = [{ x: 0, y: world.ground, w: canvas.width, h: 40 }, ...world.platforms];
  for (const solid of solids) {
    const fallingOnto = previousY + player.h <= solid.y && player.vy >= 0;
    if (rectsOverlap(player, solid) && fallingOnto) {
      player.y = solid.y - player.h;
      player.vy = 0;
      player.grounded = true;
      player.coyote = config.coyoteMs / 1000;
    }
  }
}

function hitDummy() {
  if (!rectsOverlap(player, world.dummy)) return;
  const hitFromLeft = player.x + player.w / 2 < world.dummy.x + world.dummy.w / 2;
  player.x = hitFromLeft ? world.dummy.x - player.w : world.dummy.x + world.dummy.w;
  player.vx = (hitFromLeft ? -1 : 1) * config.recoil;
  hitstop = config.hitstopMs / 1000;
  shakeTime = 0.22;
  impactCount += 1;
  spawnBurst(world.dummy.x + world.dummy.w / 2, world.dummy.y + 22, "#ffcf5a", 24);
}

function update(dt) {
  if (hitstop > 0) {
    hitstop = Math.max(0, hitstop - dt);
    return;
  }

  const input = axis();
  if (input !== 0) player.facing = input;
  player.coyote = Math.max(0, player.coyote - dt);
  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);

  if (player.dash > 0) {
    player.dash = Math.max(0, player.dash - dt);
    player.vx = player.facing * config.dashSpeed;
    player.vy = 0;
  } else {
    const targetVx = input * config.maxSpeed;
    const rate = input === 0 ? config.friction : config.acceleration;
    player.vx = moveToward(player.vx, targetVx, rate * dt);
    player.vy += config.gravity * dt;
  }

  if (player.jumpBuffer > 0 && player.coyote > 0) {
    player.vy = -config.jumpVelocity;
    player.grounded = false;
    player.coyote = 0;
    player.jumpBuffer = 0;
    spawnBurst(player.x + player.w / 2, player.y + player.h, "#7bdff2", 12);
  }

  const previousY = player.y;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.x = Math.max(18, Math.min(canvas.width - player.w - 18, player.x));
  collideSolids(previousY);
  hitDummy();

  for (const p of particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 760 * dt;
  }
  while (particles.length && particles[0].life <= 0) particles.shift();
  shakeTime = Math.max(0, shakeTime - dt);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const shake = shakeTime > 0 ? config.shake * (shakeTime / 0.22) : 0;
  ctx.save();
  ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#162033");
  sky.addColorStop(1, "#26364b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#33445c";
  ctx.fillRect(0, world.ground, canvas.width, 44);
  for (const platform of world.platforms) {
    ctx.fillStyle = "#526982";
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = "#85a3bd";
    ctx.fillRect(platform.x, platform.y, platform.w, 4);
  }

  ctx.fillStyle = "#e1594f";
  ctx.fillRect(world.dummy.x, world.dummy.y, world.dummy.w, world.dummy.h);
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(world.dummy.x + 10, world.dummy.y - 13, world.dummy.w - 20, 13);

  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = player.dash > 0 ? "#74f2ce" : "#e9f1ff";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = "#1b2430";
  ctx.fillRect(player.x + (player.facing > 0 ? 23 : 7), player.y + 13, 5, 5);
  ctx.restore();

  speedReadout.textContent = `${Math.round(Math.abs(player.vx))} px/s`;
  stateReadout.textContent = player.dash > 0 ? "Dashing" : player.grounded ? "Grounded" : "Airborne";
  impactReadout.textContent = `Impact ${impactCount}`;
}

function tick(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(tick);
}

buildControls();
setConfig(config, DEFAULT_PRESET);

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (wantsJump(key)) player.jumpBuffer = config.bufferMs / 1000;
  if (wantsDash(key) && player.dashCooldown <= 0) {
    player.dash = config.dashMs / 1000;
    player.dashCooldown = config.dashCooldownMs / 1000;
    spawnBurst(player.x + player.w / 2, player.y + player.h / 2, "#74f2ce", 18);
  }
  if (key === "r") resetPlayer();
});

document.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

controls.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  config[event.target.dataset.key] = Number(event.target.value);
  setConfig(config);
});

presetSelect.addEventListener("change", () => setConfig(getPresetConfig(presetSelect.value), presetSelect.value));
particlesToggle.addEventListener("change", () => setConfig({ ...config, particles: particlesToggle.checked }));
soundToggle.addEventListener("change", () => setConfig({ ...config, sound: soundToggle.checked }));
document.querySelector("#resetButton").addEventListener("click", () => setConfig(getPresetConfig(DEFAULT_PRESET), DEFAULT_PRESET));
document.querySelector("#exportButton").addEventListener("click", () => {
  configText.value = serializeConfig(config);
  configText.select();
});
document.querySelector("#importButton").addEventListener("click", () => {
  try {
    setConfig(deserializeConfig(configText.value));
    presetNote.textContent = "Custom imported feel profile.";
  } catch (error) {
    presetNote.textContent = error.message;
  }
});

requestAnimationFrame(tick);
