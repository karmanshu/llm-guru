import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, ImageUp, Layers, Play, RotateCcw, ScanLine } from 'lucide-react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import Button from '../../components/ui/Button';
import ClayCard from '../../components/ui/ClayCard';
import './VisionModule.css';

const IMAGE_SIZE = 64;
const MAP_SIZE = 32;

const KERNELS = [
      { name: 'Edges X', color: '#6366f1', values: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]] },
      { name: 'Edges Y', color: '#8b5cf6', values: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]] },
      { name: 'Texture', color: '#10b981', values: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]] },
      { name: 'Blob', color: '#f59e0b', values: [[1, 2, 1], [2, 4, 2], [1, 2, 1]], divisor: 16 },
];

function clamp(value, min = 0, max = 1) {
      return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex) {
      const clean = hex.replace('#', '');
      return {
            r: parseInt(clean.slice(0, 2), 16),
            g: parseInt(clean.slice(2, 4), 16),
            b: parseInt(clean.slice(4, 6), 16),
      };
}

function createMatrix(size, fill = 0) {
      return Array.from({ length: size }, () => Array.from({ length: size }, () => fill));
}

function percentile(values, p) {
      if (!values.length) return 0;
      const sorted = [...values].sort((a, b) => a - b);
      const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * p)));
      return sorted[index];
}

function makeSampleImage() {
      const canvas = document.createElement('canvas');
      canvas.width = 360;
      canvas.height = 260;
      const ctx = canvas.getContext('2d');

      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
      sky.addColorStop(0, '#172554');
      sky.addColorStop(0.54, '#2563eb');
      sky.addColorStop(1, '#0f766e');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(286, 58, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111827';
      ctx.fillRect(70, 86, 126, 110);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(92, 112, 31, 34);
      ctx.fillRect(145, 112, 31, 34);
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(123, 151, 24, 45);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(52, 90);
      ctx.lineTo(133, 36);
      ctx.lineTo(214, 90);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(257, 176, 45, 24, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#166534';
      ctx.fillRect(253, 132, 9, 58);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 194, canvas.width, 66);

      return canvas.toDataURL('image/png');
}

function imageDataToTensor(imageData) {
      const pixels = imageData.data;
      const gray = createMatrix(IMAGE_SIZE);
      const color = createMatrix(IMAGE_SIZE);

      for (let y = 0; y < IMAGE_SIZE; y += 1) {
            for (let x = 0; x < IMAGE_SIZE; x += 1) {
                  const i = (y * IMAGE_SIZE + x) * 4;
                  const r = pixels[i] / 255;
                  const g = pixels[i + 1] / 255;
                  const b = pixels[i + 2] / 255;
                  gray[y][x] = (r * 0.299) + (g * 0.587) + (b * 0.114);
                  color[y][x] = { r, g, b };
            }
      }

      return { gray, color };
}

function convolve(matrix, kernel, divisor = 1) {
      const size = matrix.length;
      const output = createMatrix(size);

      for (let y = 0; y < size; y += 1) {
            for (let x = 0; x < size; x += 1) {
                  let sum = 0;
                  for (let ky = 0; ky < 3; ky += 1) {
                        for (let kx = 0; kx < 3; kx += 1) {
                              const yy = clamp(y + ky - 1, 0, size - 1);
                              const xx = clamp(x + kx - 1, 0, size - 1);
                              sum += matrix[yy][xx] * kernel[ky][kx];
                        }
                  }
                  output[y][x] = sum / divisor;
            }
      }

      return output;
}

function reluMap(matrix) {
      return matrix.map(row => row.map(value => Math.max(0, value)));
}

function maxPool(matrix) {
      const output = createMatrix(MAP_SIZE);
      for (let y = 0; y < MAP_SIZE; y += 1) {
            for (let x = 0; x < MAP_SIZE; x += 1) {
                  const yy = y * 2;
                  const xx = x * 2;
                  output[y][x] = Math.max(
                        matrix[yy][xx],
                        matrix[yy][xx + 1],
                        matrix[yy + 1][xx],
                        matrix[yy + 1][xx + 1],
                  );
            }
      }
      return output;
}

function normalizeMap(matrix) {
      const flat = matrix.flat();
      const max = Math.max(...flat.map(v => Math.abs(v)), 0.0001);
      return matrix.map(row => row.map(value => clamp(Math.abs(value) / max)));
}

function buildOverlay(gray, edgeMap, color, sensitivity) {
      const flatGray = gray.flat();
      const mean = flatGray.reduce((sum, value) => sum + value, 0) / flatGray.length;
      const std = Math.sqrt(flatGray.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / flatGray.length);
      const edgeThreshold = percentile(edgeMap.flat(), clamp(0.94 - (sensitivity * 0.12), 0.76, 0.96));
      const objectThreshold = clamp(mean + std * (0.12 - sensitivity * 0.18), 0.18, 0.82);
      const overlay = createMatrix(IMAGE_SIZE);
      const counts = { background: 0, object: 0, edge: 0, warm: 0 };

      for (let y = 0; y < IMAGE_SIZE; y += 1) {
            for (let x = 0; x < IMAGE_SIZE; x += 1) {
                  const edge = edgeMap[y][x];
                  const pixel = color[y][x];
                  const warmth = pixel.r - ((pixel.g + pixel.b) * 0.5);
                  let label = 'background';

                  if (edge > edgeThreshold) label = 'edge';
                  else if (warmth > 0.16 && gray[y][x] > mean * 0.72) label = 'warm';
                  else if (gray[y][x] > objectThreshold) label = 'object';

                  overlay[y][x] = label;
                  counts[label] += 1;
            }
      }

      return { overlay, counts };
}

function buildPipeline(imageData, sensitivity) {
      const { gray, color } = imageDataToTensor(imageData);
      const conv = KERNELS.map(kernel => ({
            ...kernel,
            raw: convolve(gray, kernel.values, kernel.divisor || 1),
      }));
      const activated = conv.map(map => ({ ...map, relu: reluMap(map.raw) }));
      const pooled = activated.map(map => ({ ...map, pooled: maxPool(normalizeMap(map.relu)) }));
      const edgeMagnitude = createMatrix(IMAGE_SIZE);

      for (let y = 0; y < IMAGE_SIZE; y += 1) {
            for (let x = 0; x < IMAGE_SIZE; x += 1) {
                  edgeMagnitude[y][x] = Math.hypot(conv[0].raw[y][x], conv[1].raw[y][x]);
            }
      }

      const normalizedEdges = normalizeMap(edgeMagnitude);
      const segmentation = buildOverlay(gray, normalizedEdges, color, sensitivity);
      const objectRatio = (segmentation.counts.object + segmentation.counts.warm) / (IMAGE_SIZE * IMAGE_SIZE);
      const edgeRatio = segmentation.counts.edge / (IMAGE_SIZE * IMAGE_SIZE);
      const confidence = clamp(0.46 + objectRatio * 0.8 + edgeRatio * 0.55);

      return {
            gray,
            conv: conv.map(map => ({ ...map, normalized: normalizeMap(map.raw) })),
            activated: activated.map(map => ({ ...map, normalized: normalizeMap(map.relu) })),
            pooled,
            segmentation,
            stats: {
                  confidence,
                  objectRatio,
                  edgeRatio,
                  loss: 1 - confidence,
            },
      };
}

function drawHeatmap(ctx, matrix, color = '#6366f1') {
      const rows = matrix.length;
      const cols = matrix[0]?.length || rows;
      const cellW = ctx.canvas.width / cols;
      const cellH = ctx.canvas.height / rows;
      const rgb = hexToRgb(color);

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      for (let y = 0; y < rows; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                  const value = clamp(matrix[y][x]);
                  const base = 8 + Math.round(value * 24);
                  const r = Math.round(base + rgb.r * value * 0.88);
                  const g = Math.round(base + rgb.g * value * 0.88);
                  const b = Math.round(base + rgb.b * value * 0.88);
                  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                  ctx.fillRect(x * cellW, y * cellH, Math.ceil(cellW), Math.ceil(cellH));
            }
      }
}

function HeatmapCanvas({ matrix, label, color }) {
      const ref = useRef(null);

      useEffect(() => {
            const canvas = ref.current;
            if (!canvas || !matrix) return;
            const ctx = canvas.getContext('2d');
            drawHeatmap(ctx, matrix, color);
      }, [matrix, color]);

      return (
            <div className="vision-map">
                  <canvas ref={ref} width="128" height="128" aria-label={label} role="img" />
                  <span>{label}</span>
            </div>
      );
}

function SegmentationCanvas({ overlay }) {
      const ref = useRef(null);

      useEffect(() => {
            const canvas = ref.current;
            if (!canvas || !overlay) return;
            const ctx = canvas.getContext('2d');
            const image = ctx.createImageData(IMAGE_SIZE, IMAGE_SIZE);
            const palette = {
                  background: [15, 23, 42, 110],
                  object: [99, 102, 241, 205],
                  edge: [236, 72, 153, 240],
                  warm: [245, 158, 11, 225],
            };

            for (let y = 0; y < IMAGE_SIZE; y += 1) {
                  for (let x = 0; x < IMAGE_SIZE; x += 1) {
                        const i = (y * IMAGE_SIZE + x) * 4;
                        const rgba = palette[overlay[y][x]];
                        image.data[i] = rgba[0];
                        image.data[i + 1] = rgba[1];
                        image.data[i + 2] = rgba[2];
                        image.data[i + 3] = rgba[3];
                  }
            }

            ctx.imageSmoothingEnabled = false;
            ctx.putImageData(image, 0, 0);
      }, [overlay]);

      return <canvas ref={ref} width={IMAGE_SIZE} height={IMAGE_SIZE} className="vision-segmentation" aria-label="Segmented image mask" role="img" />;
}

function KernelGrid({ values }) {
      return (
            <div className="vision-kernel-grid">
                  {values.flat().map((value, index) => (
                        <span key={`${value}-${index}`} className={value < 0 ? 'vision-kernel-grid__neg' : ''}>
                              {value}
                        </span>
                  ))}
            </div>
      );
}

export default function VisionModule() {
      const [imageUrl, setImageUrl] = useState(() => makeSampleImage());
      const [pipeline, setPipeline] = useState(null);
      const [sensitivity, setSensitivity] = useState(0.55);
      const [epoch, setEpoch] = useState(8);
      const previewRef = useRef(null);
      const fileInputRef = useRef(null);
      const objectUrlRef = useRef(null);

      const resetToSample = useCallback(() => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
            setImageUrl(makeSampleImage());
      }, []);

      useEffect(() => () => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      }, []);

      useEffect(() => {
            if (!imageUrl) return;
            const image = new Image();
            image.onload = () => {
                  const preview = previewRef.current;
                  if (!preview) return;
                  const ctx = preview.getContext('2d');
                  ctx.clearRect(0, 0, preview.width, preview.height);
                  ctx.drawImage(image, 0, 0, preview.width, preview.height);

                  const work = document.createElement('canvas');
                  work.width = IMAGE_SIZE;
                  work.height = IMAGE_SIZE;
                  const workCtx = work.getContext('2d', { willReadFrequently: true });
                  workCtx.drawImage(image, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
                  setPipeline(buildPipeline(workCtx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE), sensitivity));
            };
            image.src = imageUrl;
      }, [imageUrl, sensitivity]);

      const training = useMemo(() => {
            if (!pipeline) return [];
            const startLoss = clamp(pipeline.stats.loss + 0.38, 0.42, 0.92);
            return Array.from({ length: 6 }, (_, index) => {
                  const progress = (index + epoch / 12) / 6;
                  const loss = clamp(startLoss * Math.exp(-progress * 1.9), 0.04, 0.94);
                  const accuracy = clamp(1 - loss + pipeline.stats.edgeRatio * 0.18, 0.08, 0.98);
                  return { step: index + 1, loss, accuracy };
            });
      }, [epoch, pipeline]);

      const handleUpload = (event) => {
            const file = event.target.files?.[0];
            if (!file || !file.type.startsWith('image/')) return;
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            const url = URL.createObjectURL(file);
            objectUrlRef.current = url;
            setImageUrl(url);
      };

      const segmentStats = pipeline?.segmentation.counts || {};
      const totalPixels = IMAGE_SIZE * IMAGE_SIZE;

      return (
            <Section id="vision-ai" alt>
                  <SectionHeader
                        emoji="AI"
                        title="Computer Vision: How CNNs Read Images"
                        description="Upload an image and watch a CNN-style pipeline turn pixels into feature maps, pooled activations, segmentation masks, and training feedback."
                  />

                  <div className="vision-layout">
                        <div className="vision-lab">
                              <div className="vision-toolbar">
                                    <input
                                          ref={fileInputRef}
                                          className="sr-only"
                                          type="file"
                                          accept="image/*"
                                          onChange={handleUpload}
                                    />
                                    <Button variant="primary" className="btn--sm" onClick={() => fileInputRef.current?.click()}>
                                          <ImageUp size={16} /> Upload Image
                                    </Button>
                                    <Button variant="secondary" className="btn--sm" onClick={resetToSample}>
                                          <RotateCcw size={16} /> Sample
                                    </Button>
                              </div>

                              <div className="vision-preview-grid">
                                    <ClayCard className="vision-preview-card">
                                          <div className="vision-card-title">
                                                <ScanLine size={18} />
                                                <span>Input tensor</span>
                                          </div>
                                          <canvas ref={previewRef} width="256" height="256" className="vision-preview" aria-label="Uploaded image preview" role="img" />
                                          <div className="vision-tensor-shape">RGB image {'->'} [1, 64, 64, 3]</div>
                                    </ClayCard>

                                    <ClayCard className="vision-preview-card">
                                          <div className="vision-card-title">
                                                <Layers size={18} />
                                                <span>Segmentation mask</span>
                                          </div>
                                          {pipeline && <SegmentationCanvas overlay={pipeline.segmentation.overlay} />}
                                          <div className="vision-legend">
                                                <span><i className="vision-dot vision-dot--object" /> object</span>
                                                <span><i className="vision-dot vision-dot--edge" /> edge</span>
                                                <span><i className="vision-dot vision-dot--warm" /> warm area</span>
                                          </div>
                                    </ClayCard>
                              </div>

                              <ClayCard className="vision-control-card">
                                    <label className="vision-slider">
                                          <span>Segmentation sensitivity</span>
                                          <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={sensitivity}
                                                onChange={(event) => setSensitivity(Number(event.target.value))}
                                          />
                                          <strong>{Math.round(sensitivity * 100)}%</strong>
                                    </label>
                                    <label className="vision-slider">
                                          <span>Training epochs</span>
                                          <input
                                                type="range"
                                                min="1"
                                                max="12"
                                                step="1"
                                                value={epoch}
                                                onChange={(event) => setEpoch(Number(event.target.value))}
                                          />
                                          <strong>{epoch}</strong>
                                    </label>
                              </ClayCard>
                        </div>

                        <div className="vision-explain">
                              <ClayCard className="vision-pipeline-card" glow>
                                    <div className="vision-card-title">
                                          <BrainCircuit size={18} />
                                          <span>CNN forward pass</span>
                                    </div>
                                    <div className="vision-steps">
                                          {['Pixels', 'Convolution', 'ReLU', 'Max pool', 'Classifier', 'Mask'].map((step, index) => (
                                                <motion.div
                                                      key={step}
                                                      className="vision-step"
                                                      initial={{ opacity: 0, y: 10 }}
                                                      whileInView={{ opacity: 1, y: 0 }}
                                                      viewport={{ once: true, amount: 0.4 }}
                                                      transition={{ delay: index * 0.06 }}
                                                >
                                                      <span>{index + 1}</span>
                                                      {step}
                                                </motion.div>
                                          ))}
                                    </div>
                              </ClayCard>

                              <ClayCard className="vision-training-card">
                                    <div className="vision-card-title">
                                          <Play size={18} />
                                          <span>Image training loop</span>
                                    </div>
                                    <div className="vision-metrics">
                                          {training.map(point => (
                                                <div key={point.step} className="vision-metric-row">
                                                      <span>Batch {point.step}</span>
                                                      <div className="vision-metric-track">
                                                            <i style={{ width: `${point.accuracy * 100}%` }} />
                                                      </div>
                                                      <strong>{Math.round(point.accuracy * 100)}%</strong>
                                                </div>
                                          ))}
                                    </div>
                                    <p>
                                          A real CNN repeats this loop over labeled images: predict, compare with the target mask, backpropagate the loss, and update kernels.
                                    </p>
                              </ClayCard>
                        </div>
                  </div>

                  {pipeline && (
                        <div className="vision-feature-section">
                              <div className="vision-feature-header">
                                    <h3>Feature maps from learned filters</h3>
                                    <p>Convolution scans the same 3x3 weights across the whole image. Bright cells are strong activations.</p>
                              </div>

                              <div className="vision-kernels">
                                    {KERNELS.map(kernel => (
                                          <ClayCard key={kernel.name} className="vision-kernel-card">
                                                <strong>{kernel.name}</strong>
                                                <KernelGrid values={kernel.values} />
                                          </ClayCard>
                                    ))}
                              </div>

                              <div className="vision-map-grid">
                                    {pipeline.conv.map(map => (
                                          <HeatmapCanvas key={`conv-${map.name}`} matrix={map.normalized} label={`Conv: ${map.name}`} color={map.color} />
                                    ))}
                                    {pipeline.activated.slice(0, 3).map(map => (
                                          <HeatmapCanvas key={`relu-${map.name}`} matrix={map.normalized} label={`ReLU: ${map.name}`} color={map.color} />
                                    ))}
                                    {pipeline.pooled.slice(0, 3).map(map => (
                                          <HeatmapCanvas key={`pool-${map.name}`} matrix={map.pooled} label={`Pool: ${map.name}`} color={map.color} />
                                    ))}
                              </div>

                              <div className="vision-stats">
                                    <ClayCard className="vision-stat">
                                          <span>Object pixels</span>
                                          <strong>{Math.round(((segmentStats.object || 0) + (segmentStats.warm || 0)) / totalPixels * 100)}%</strong>
                                    </ClayCard>
                                    <ClayCard className="vision-stat">
                                          <span>Boundary pixels</span>
                                          <strong>{Math.round((segmentStats.edge || 0) / totalPixels * 100)}%</strong>
                                    </ClayCard>
                                    <ClayCard className="vision-stat">
                                          <span>Classifier confidence</span>
                                          <strong>{Math.round(pipeline.stats.confidence * 100)}%</strong>
                                    </ClayCard>
                                    <ClayCard className="vision-stat">
                                          <span>Current loss</span>
                                          <strong>{pipeline.stats.loss.toFixed(2)}</strong>
                                    </ClayCard>
                              </div>
                        </div>
                  )}
            </Section>
      );
}
