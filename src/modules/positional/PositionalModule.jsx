import { useState, useRef, useEffect, useCallback } from 'react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import InfoPanel from '../../components/shared/InfoPanel';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './PositionalModule.css';

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat', 'today', '.'];
const D_MODEL = 16;

function peValue(pos, dim) {
      const div = Math.pow(10000, (2 * Math.floor(dim / 2)) / D_MODEL);
      return dim % 2 === 0 ? Math.sin(pos / div) : Math.cos(pos / div);
}

export default function PositionalModule() {
      const [selectedPos, setSelectedPos] = useState(0);
      const canvasRef = useRef(null);
      const [sRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

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
            const pad = { top: 20, bottom: 30, left: 40, right: 20 };
            const plotW = W - pad.left - pad.right;
            const plotH = H - pad.top - pad.bottom;

            ctx.clearRect(0, 0, W, H);

            // Zero line
            const zeroY = pad.top + plotH / 2;
            ctx.beginPath();
            ctx.moveTo(pad.left, zeroY);
            ctx.lineTo(W - pad.right, zeroY);
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Y-axis labels
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#6060a0';
            ctx.textAlign = 'right';
            ctx.fillText('+1', pad.left - 6, pad.top + 4);
            ctx.fillText('0', pad.left - 6, zeroY + 4);
            ctx.fillText('-1', pad.left - 6, pad.top + plotH + 4);

            // X-axis labels
            ctx.textAlign = 'center';
            for (let d = 0; d < D_MODEL; d += 2) {
                  const x = pad.left + (d / (D_MODEL - 1)) * plotW;
                  ctx.fillText(d.toString(), x, H - 8);
            }

            // Draw PE lines for all positions (faded)
            for (let pos = 0; pos < TOKENS.length; pos++) {
                  const isSelected = pos === selectedPos;
                  if (isSelected) continue;
                  ctx.beginPath();
                  for (let d = 0; d < D_MODEL; d++) {
                        const val = peValue(pos, d);
                        const x = pad.left + (d / (D_MODEL - 1)) * plotW;
                        const y = pad.top + ((1 - val) / 2) * plotH;
                        d === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                  }
                  ctx.strokeStyle = 'rgba(160, 160, 200, 0.12)';
                  ctx.lineWidth = 1;
                  ctx.stroke();
            }

            // Draw selected position line
            ctx.beginPath();
            const points = [];
            for (let d = 0; d < D_MODEL; d++) {
                  const val = peValue(selectedPos, d);
                  const x = pad.left + (d / (D_MODEL - 1)) * plotW;
                  const y = pad.top + ((1 - val) / 2) * plotH;
                  points.push({ x, y, val });
                  d === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw dots on selected line
            points.forEach((p, d) => {
                  ctx.beginPath();
                  ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                  ctx.fillStyle = '#8b5cf6';
                  ctx.fill();
                  ctx.strokeStyle = '#c084fc';
                  ctx.lineWidth = 1;
                  ctx.stroke();
            });
      }, [selectedPos]);

      useEffect(() => { if (isVisible) drawCanvas(); }, [isVisible, drawCanvas]);
      useEffect(() => {
            let t;
            const h = () => { clearTimeout(t); t = setTimeout(drawCanvas, 200); };
            window.addEventListener('resize', h, { passive: true });
            return () => { window.removeEventListener('resize', h); clearTimeout(t); };
      }, [drawCanvas]);

      const peVector = Array.from({ length: 4 }, (_, d) => peValue(selectedPos, d).toFixed(3));

      return (
            <Section id="positional">
                  <SectionHeader
                        emoji="📍"
                        title="Positional Encoding"
                        description="Since neural networks process all tokens at once, we need a way to embed position information so the model knows word order."
                  />
                  <div ref={sRef} className="positional-wrap">
                        <div className="positional-tokens">
                              {TOKENS.map((t, i) => (
                                    <button
                                          key={i}
                                          className={`positional-token-btn ${i === selectedPos ? 'positional-token-btn--active' : ''}`}
                                          onClick={() => setSelectedPos(i)}
                                    >
                                          <span className="positional-token-btn__idx">{i}</span> {t}
                                    </button>
                              ))}
                        </div>

                        <canvas ref={canvasRef} className="positional-canvas" aria-label="Positional encoding wave visualization" role="img" />

                        <div className="positional-formula">
                              PE({selectedPos}) = [{peVector.join(', ')}, ...]
                        </div>

                        <InfoPanel icon="📐">
                              <strong>Why position matters:</strong> Without positional encoding, "The cat sat on the mat" and "The mat sat on the cat" would look identical to the model. The sine/cosine functions create unique patterns for each position.
                        </InfoPanel>
                  </div>
            </Section>
      );
}
