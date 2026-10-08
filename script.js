const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

const glowSlider = document.getElementById("glow");
const layersSlider = document.getElementById("layers");
const speedSlider = document.getElementById("speed");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");

let glow = 14;
let layers = 5;
let speed = 5;
let frame = 0;
let paused = false;
let width = 0;
let height = 0;
let dpr = 1;
let lastFrame = 0;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function heartPoint(t) {
  return {
    x: 16 * Math.sin(t) ** 3,
    y: 13 * Math.cos(t) - 5 * Math.cos(2 * t)
      - 2 * Math.cos(3 * t) - Math.cos(4 * t)
  };
}

function draw(now) {
  requestAnimationFrame(draw);
  if (paused || now - lastFrame < 1000 / 60) return;
  lastFrame = now;
  frame += 0.003 * speed;

  ctx.clearRect(0, 0, width, height);
  const scale = Math.min(width / 39, height / 35);
  const cx = width / 2;
  const cy = height * 0.49;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, -scale);

  // Layered outlines create the same spirograph-like look as the reference.
  for (let layer = layers - 1; layer >= 0; layer--) {
    const offset = layer - (layers - 1) / 2;
    ctx.save();
    ctx.rotate(offset * 0.045 + Math.sin(frame * 0.45) * 0.018);
    const size = 1 + offset * 0.035;
    ctx.scale(size, size);
    ctx.beginPath();

    const segments = 700;
    for (let i = 0; i <= segments; i++) {
      const p = heartPoint((i / segments) * Math.PI * 2);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();

    const alpha = 0.28 + (1 - layer / Math.max(layers, 1)) * 0.48;
    ctx.strokeStyle = `rgba(199, 49, 235, ${alpha})`;
    ctx.lineWidth = layer === 0 ? 0.48 : 0.27;
    ctx.shadowColor = "#bd32ee";
    ctx.shadowBlur = glow;
    ctx.stroke();
    ctx.restore();
  }

  // A small glowing point moves around the heart.
  const point = heartPoint((frame * 1.3) % (Math.PI * 2));
  ctx.beginPath();
  ctx.arc(point.x, point.y, 0.42, 0, Math.PI * 2);
  ctx.fillStyle = "#f1b0ff";
  ctx.shadowColor = "#e25cff";
  ctx.shadowBlur = glow * 1.7;
  ctx.fill();
  ctx.restore();

  document.getElementById("coords").textContent =
    `X ${String(Math.round(cx)).padStart(3, "0")} · Y ${String(Math.round(cy)).padStart(3, "0")}`;
}

function updateLabels() {
  document.getElementById("glowOut").value = glow;
  document.getElementById("layersOut").value = layers;
  document.getElementById("speedOut").value = speed;
}

glowSlider.addEventListener("input", () => {
  glow = Number(glowSlider.value);
  updateLabels();
});
layersSlider.addEventListener("input", () => {
  layers = Number(layersSlider.value);
  updateLabels();
});
speedSlider.addEventListener("input", () => {
  speed = Number(speedSlider.value);
  updateLabels();
});

pauseButton.addEventListener("click", () => {
  paused = !paused;
  pauseButton.innerHTML = paused ? '▶ <span>Resume</span>' : 'Ⅱ <span>Pause</span>';
  document.getElementById("statusText").textContent = paused ? "PAUSED" : "RENDERING";
});

resetButton.addEventListener("click", () => {
  glow = 14;
  layers = 5;
  speed = 5;
  frame = 0;
  paused = false;
  glowSlider.value = glow;
  layersSlider.value = layers;
  speedSlider.value = speed;
  pauseButton.innerHTML = 'Ⅱ <span>Pause</span>';
  document.getElementById("statusText").textContent = "RENDERING";
  updateLabels();
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
updateLabels();
requestAnimationFrame(draw);
