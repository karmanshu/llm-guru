import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import Button from '../../components/ui/Button';
import ClayCard from '../../components/ui/ClayCard';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './NeuralModule.css';

const LAYERS = [
      { name: 'INPUT', count: 4, color: '#6366f1' },
      { name: 'HIDDEN 1', count: 6, color: '#7c3aed' },
      { name: 'HIDDEN 2', count: 6, color: '#a855f7' },
      { name: 'OUTPUT', count: 3, color: '#ec4899' },
];

function randomActivations() {
      return LAYERS.map(l => Array.from({ length: l.count }, () => +(Math.random()).toFixed(2)));
}

function generateWeights() {
      const w = [];
      for (let l = 0; l < LAYERS.length - 1; l++) {
            const layer = [];
            for (let i = 0; i < LAYERS[l].count; i++) {
                  const row = [];
                  for (let j = 0; j < LAYERS[l + 1].count; j++) {
                        row.push(0.2 + Math.random() * 0.8);
                  }
                  layer.push(row);
            }
            w.push(layer);
      }
      return w;
}

export default function NeuralModule() {
      const canvasRef = useRef(null);
      const [isAnimating, setIsAnimating] = useState(false);
      const animRef = useRef(null);
      const particlesRef = useRef([]);
      const activationsRef = useRef(randomActivations());
      const weightsRef = useRef(generateWeights());
      const [sRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

      const getNodePositions = useCallback((W, H) => {
            const pad = { x: 60, y: 40 };
            const positions = [];
            const layerGap = (W - pad.x * 2) / (LAYERS.length - 1);
            LAYERS.forEach((layer, li) => {
                  const x = pad.x + li * layerGap;
                  const nodeGap = (H - pad.y * 2) / (layer.count + 1);
                  const nodes = [];
                  for (let ni = 0; ni < layer.count; ni++) {
                        nodes.push({ x, y: pad.y + (ni + 1) * nodeGap });
                  }
                  positions.push(nodes);
            });
            return positions;
      }, []);

      const drawCanvas = useCallback(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            const W = rect.width;
            const H = rect.height;
            const positions = getNodePositions(W, H);
            const activations = activationsRef.current;
            const weights = weightsRef.current;

            ctx.clearRect(0, 0, W, H);

            // Connections
            for (let l = 0; l < positions.length - 1; l++) {
                  for (let i = 0; i < positions[l].length; i++) {
                        for (let j = 0; j < positions[l + 1].length; j++) {
                              const w = weights[l]?.[i]?.[j] ?? 0.5;
                              ctx.beginPath();
                              ctx.moveTo(positions[l][i].x, positions[l][i].y);
                              ctx.lineTo(positions[l + 1][j].x, positions[l + 1][j].y);
                              ctx.strokeStyle = `rgba(160, 160, 220, ${w * 0.15})`;
                              ctx.lineWidth = w * 1.5;
                              ctx.stroke();
                        }
                  }
            }

            // Particles
            particlesRef.current.forEach(p => {
                  const from = positions[p.fromLayer]?.[p.fromNode];
                  const to = positions[p.toLayer]?.[p.toNode];
                  if (!from || !to) return;
                  const x = from.x + (to.x - from.x) * p.t;
                  const y = from.y + (to.y - from.y) * p.t;
                  const grad = ctx.createRadialGradient(x, y, 0, x, y, 6);
                  grad.addColorStop(0, LAYERS[p.toLayer].color);
                  grad.addColorStop(1, LAYERS[p.toLayer].color + '00');
                  ctx.beginPath();
                  ctx.arc(x, y, 6, 0, Math.PI * 2);
                  ctx.fillStyle = grad;
                  ctx.fill();
                  ctx.beginPath();
                  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
                  ctx.fillStyle = '#fff';
                  ctx.fill();
            });

            // Nodes
            positions.forEach((layer, li) => {
                  layer.forEach((node, ni) => {
                        const act = activations[li]?.[ni] ?? 0.5;
                        const r = 18;
                        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r);
                        grad.addColorStop(0, LAYERS[li].color + 'dd');
                        grad.addColorStop(1, LAYERS[li].color + '44');
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
                        ctx.fillStyle = grad;
                        ctx.fill();
                        ctx.strokeStyle = LAYERS[li].color + '66';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        // Activation text
                        ctx.font = '10px "JetBrains Mono", monospace';
                        ctx.fillStyle = '#fff';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(act.toFixed(2), node.x, node.y);
                  });
            });

            // Layer labels
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#6060a0';
            ctx.textAlign = 'center';
            positions.forEach((layer, li) => {
                  ctx.fillText(LAYERS[li].name, layer[0].x, 20);
            });
      }, [getNodePositions]);

      function animate() {
            particlesRef.current = particlesRef.current.filter(p => p.t < 1);
            particlesRef.current.forEach(p => { p.t += 0.015; });

            // Spawn new particles
            if (particlesRef.current.length < 25 && Math.random() < 0.3) {
                  const l = Math.floor(Math.random() * (LAYERS.length - 1));
                  const i = Math.floor(Math.random() * LAYERS[l].count);
                  const j = Math.floor(Math.random() * LAYERS[l + 1].count);
                  particlesRef.current.push({ fromLayer: l, fromNode: i, toLayer: l + 1, toNode: j, t: 0 });
            }

            drawCanvas();
            animRef.current = requestAnimationFrame(animate);
      }

      const startAnimation = () => {
            if (isAnimating) return;
            setIsAnimating(true);
            particlesRef.current = [];
            animRef.current = requestAnimationFrame(animate);
      };

      const resetAnimation = () => {
            setIsAnimating(false);
            if (animRef.current) cancelAnimationFrame(animRef.current);
            particlesRef.current = [];
            activationsRef.current = randomActivations();
            drawCanvas();
      };

      useEffect(() => {
            if (isVisible) drawCanvas();
      }, [isVisible, drawCanvas]);

      useEffect(() => {
            let t;
            const h = () => { clearTimeout(t); t = setTimeout(drawCanvas, 200); };
            window.addEventListener('resize', h, { passive: true });
            return () => {
                  window.removeEventListener('resize', h);
                  clearTimeout(t);
                  if (animRef.current) cancelAnimationFrame(animRef.current);
            };
      }, [drawCanvas]);

      const infoCards = [
            { title: 'Input Layer', desc: 'Receives the initial data — token embeddings that represent each word.' },
            { title: 'Hidden Layers', desc: 'Transform the data through learned patterns, extracting increasingly abstract features.' },
            { title: 'Output Layer', desc: 'Produces the final prediction — probabilities for each possible next token.' },
      ];

      return (
            <Section id="neural" alt>
                  <SectionHeader
                        emoji="🧠"
                        title="Neural Network Basics"
                        description="LLMs are built on neural networks — layers of interconnected nodes that learn to recognize patterns in data."
                  />
                  <div ref={sRef} className="neural-wrap">
                        <canvas ref={canvasRef} className="neural-canvas" aria-label="Neural network visualization" role="img" />

                        <div className="neural-controls">
                              <Button variant="primary" className="btn--sm" onClick={startAnimation} disabled={isAnimating}>
                                    <Play size={16} /> Animate Data Flow
                              </Button>
                              <Button variant="secondary" className="btn--sm" onClick={resetAnimation}>
                                    <RotateCcw size={16} /> Reset
                              </Button>
                        </div>

                        <div className="neural-info-grid">
                              {infoCards.map(c => (
                                    <ClayCard key={c.title} className="neural-info-card">
                                          <h4>{c.title}</h4>
                                          <p>{c.desc}</p>
                                    </ClayCard>
                              ))}
                        </div>
                  </div>
            </Section>
      );
}
