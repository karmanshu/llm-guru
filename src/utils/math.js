export function softmax(logits, temperature = 1.0) {
  const t = Math.max(temperature, 0.01);
  const scaled = logits.map(l => l / t);
  const max = Math.max(...scaled);
  const exps = scaled.map(s => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function distance2D(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
