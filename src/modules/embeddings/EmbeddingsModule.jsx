import { useState, useRef, useEffect, useCallback } from 'react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import InfoPanel from '../../components/shared/InfoPanel';
import Button from '../../components/ui/Button';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { distance2D } from '../../utils/math';
import './EmbeddingsModule.css';

const CLUSTERS = [
      {
            name: 'Animals', color: '#6366f1', words: [
                  { w: 'cat', x: 0.25, y: 0.30 }, { w: 'dog', x: 0.30, y: 0.35 },
                  { w: 'fish', x: 0.20, y: 0.38 }, { w: 'bird', x: 0.28, y: 0.25 },
            ]
      },
      {
            name: 'Actions', color: '#ec4899', words: [
                  { w: 'run', x: 0.70, y: 0.28 }, { w: 'walk', x: 0.72, y: 0.35 },
                  { w: 'jump', x: 0.68, y: 0.22 }, { w: 'swim', x: 0.65, y: 0.32 },
            ]
      },
      {
            name: 'Emotions', color: '#10b981', words: [
                  { w: 'happy', x: 0.45, y: 0.72 }, { w: 'sad', x: 0.50, y: 0.78 },
                  { w: 'angry', x: 0.42, y: 0.80 }, { w: 'calm', x: 0.48, y: 0.68 },
            ]
      },
      {
            name: 'Sizes', color: '#f59e0b', words: [
                  { w: 'big', x: 0.80, y: 0.70 }, { w: 'small', x: 0.85, y: 0.75 },
                  { w: 'tiny', x: 0.88, y: 0.72 }, { w: 'huge', x: 0.78, y: 0.68 },
            ]
      },
];

const allWords = CLUSTERS.flatMap(c => c.words.map(w => ({ ...w, cluster: c.name, color: c.color })));

export default function EmbeddingsModule() {
      const canvasRef = useRef(null);
      const [selected, setSelected] = useState(null);
      const [showDist, setShowDist] = useState(false);
      const [hover, setHover] = useState(null);
      const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

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
            ctx.clearRect(0, 0, W, H);

            // Draw cluster ellipses
            CLUSTERS.forEach(c => {
                  const pts = c.words;
                  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length * W;
                  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length * H;
                  ctx.beginPath();
                  ctx.ellipse(cx, cy, 80, 60, 0, 0, Math.PI * 2);
                  ctx.strokeStyle = c.color + '30';
                  ctx.setLineDash([4, 4]);
                  ctx.lineWidth = 1.5;
                  ctx.stroke();
                  ctx.setLineDash([]);
                  ctx.fillStyle = c.color + '08';
                  ctx.fill();
            });

            // Draw distance lines if selected
            if (selected && showDist) {
                  const sw = allWords.find(w => w.w === selected);
                  if (sw) {
                        allWords.forEach(w => {
                              if (w.w === selected) return;
                              const d = distance2D(sw.x, sw.y, w.x, w.y);
                              const alpha = Math.max(0.1, 1 - d * 2);
                              ctx.beginPath();
                              ctx.moveTo(sw.x * W, sw.y * H);
                              ctx.lineTo(w.x * W, w.y * H);
                              ctx.strokeStyle = `rgba(192, 132, 252, ${alpha * 0.4})`;
                              ctx.setLineDash([3, 3]);
                              ctx.lineWidth = 1;
                              ctx.stroke();
                              ctx.setLineDash([]);
                        });
                  }
            }

            // Draw word dots
            allWords.forEach(word => {
                  const x = word.x * W;
                  const y = word.y * H;
                  const isSel = word.w === selected;
                  const isHov = word.w === hover;
                  const r = isSel ? 12 : isHov ? 10 : 7;

                  if (isSel || isHov) {
                        ctx.beginPath();
                        ctx.arc(x, y, r + 6, 0, Math.PI * 2);
                        ctx.fillStyle = word.color + '20';
                        ctx.fill();
                  }

                  ctx.beginPath();
                  ctx.arc(x, y, r, 0, Math.PI * 2);
                  ctx.fillStyle = word.color;
                  ctx.fill();

                  // Label
                  ctx.font = `${isSel ? '700' : '500'} ${isSel ? '13' : '11'}px Inter, sans-serif`;
                  ctx.fillStyle = isSel ? word.color : 'var(--text-secondary)';
                  ctx.fillStyle = isSel ? word.color : '#a0a0c0';
                  ctx.textAlign = 'center';
                  ctx.fillText(word.w, x, y - r - 6);
            });
      }, [selected, showDist, hover]);

      useEffect(() => {
            if (isVisible) drawCanvas();
      }, [isVisible, drawCanvas]);

      useEffect(() => {
            let timer;
            const handleResize = () => { clearTimeout(timer); timer = setTimeout(drawCanvas, 200); };
            window.addEventListener('resize', handleResize, { passive: true });
            return () => { window.removeEventListener('resize', handleResize); clearTimeout(timer); };
      }, [drawCanvas]);

      const handleCanvasClick = (e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width;
            const my = (e.clientY - rect.top) / rect.height;
            let closest = null;
            let minD = Infinity;
            allWords.forEach(w => {
                  const d = distance2D(mx, my, w.x, w.y);
                  if (d < minD && d < 0.05) { minD = d; closest = w.w; }
            });
            setSelected(closest);
      };

      const handleCanvasMove = (e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width;
            const my = (e.clientY - rect.top) / rect.height;
            let closest = null;
            let minD = Infinity;
            allWords.forEach(w => {
                  const d = distance2D(mx, my, w.x, w.y);
                  if (d < minD && d < 0.04) { minD = d; closest = w.w; }
            });
            setHover(closest);
            canvas.style.cursor = closest ? 'pointer' : 'default';
      };

      // Distance info text
      let distText = '';
      if (selected) {
            const sw = allWords.find(w => w.w === selected);
            if (sw) {
                  const dists = allWords
                        .filter(w => w.w !== selected)
                        .map(w => ({ w: w.w, d: distance2D(sw.x, sw.y, w.x, w.y) }))
                        .sort((a, b) => a.d - b.d);
                  const closest = dists[0];
                  const farthest = dists[dists.length - 1];
                  distText = `"${selected}" is closest to "${closest.w}" (${closest.d.toFixed(3)}) and farthest from "${farthest.w}" (${farthest.d.toFixed(3)})`;
            }
      }

      return (
            <Section id="embeddings" alt>
                  <SectionHeader
                        emoji="📊"
                        title="Vector Embeddings"
                        description="Words are converted into numerical vectors, placing semantically similar words close together in a high-dimensional space."
                  />
                  <div ref={sectionRef} className="embeddings-wrap">
                        <canvas
                              ref={canvasRef}
                              className="embeddings-canvas"
                              onClick={handleCanvasClick}
                              onMouseMove={handleCanvasMove}
                              onMouseLeave={() => setHover(null)}
                              aria-label="2D word embeddings visualization"
                              role="img"
                        />

                        <div className="embeddings-controls">
                              <Button
                                    variant={showDist ? 'primary' : 'secondary'}
                                    className="btn--sm"
                                    onClick={() => setShowDist(!showDist)}
                              >
                                    {showDist ? 'Hide Distances' : 'Show Distances'}
                              </Button>
                        </div>

                        {distText && <p className="embeddings-dist-text">{distText}</p>}

                        <div className="embeddings-legend">
                              {CLUSTERS.map(c => (
                                    <span key={c.name} className="embeddings-legend__item">
                                          <span className="embeddings-legend__dot" style={{ background: c.color }} />
                                          {c.name}
                                    </span>
                              ))}
                        </div>

                        <InfoPanel>
                              Each word is represented as a <strong>vector</strong> (list of numbers). Words with similar meanings
                              are placed close together. Click a word to see how far it is from others.
                        </InfoPanel>
                  </div>
            </Section>
      );
}
