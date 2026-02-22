export function interpolateColor(color1, color2, t) {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function heatmapColor(value) {
  // 0 = dark blue, 0.5 = indigo/purple, 1.0 = amber/warm
  if (value < 0.25) return interpolateColor('#1e1b4b', '#4338ca', value * 4);
  if (value < 0.5) return interpolateColor('#4338ca', '#7c3aed', (value - 0.25) * 4);
  if (value < 0.75) return interpolateColor('#7c3aed', '#ec4899', (value - 0.5) * 4);
  return interpolateColor('#ec4899', '#f59e0b', (value - 0.75) * 4);
}

export function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
