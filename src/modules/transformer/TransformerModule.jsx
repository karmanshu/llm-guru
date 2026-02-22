import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, SkipForward } from 'lucide-react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import Button from '../../components/ui/Button';
import { heatmapColor } from '../../utils/colors';
import './TransformerModule.css';

const TOKENS = ['The', 'cat', 'sat', 'on', 'mat'];

const STAGES = [
      {
            name: 'Input Processing',
            desc: 'Tokenize and convert text into numerical IDs',
            shape: '[batch=1, seq_len=5]',
            type: 'tokens',
      },
      {
            name: 'Embeddings + Position',
            desc: 'Embed tokens and add positional encoding',
            shape: '[1, 5, 4]',
            op: 'token_id → d_model vector + PE',
            type: 'matrix',
            data: [
                  [0.42, 0.81, 0.15, 0.67],
                  [0.91, 0.23, 0.78, 0.34],
                  [0.56, 0.69, 0.42, 0.88],
                  [0.33, 0.47, 0.91, 0.12],
                  [0.78, 0.55, 0.29, 0.74],
            ],
      },
      {
            name: 'Self-Attention (Q·K·V)',
            desc: 'Compute attention scores to find relevant tokens',
            shape: '[1, 4, 5, 4]',
            op: 'Attention = softmax(Q·Kᵀ / √dₖ) · V',
            type: 'attention',
            q: [[0.3, 0.7, 0.1], [0.8, 0.2, 0.5], [0.4, 0.6, 0.3], [0.9, 0.1, 0.7], [0.5, 0.5, 0.8]],
            k: [[0.6, 0.4, 0.2], [0.1, 0.9, 0.3], [0.7, 0.3, 0.6], [0.2, 0.8, 0.4], [0.8, 0.2, 0.5]],
            v: [[0.5, 0.5, 0.3], [0.3, 0.7, 0.6], [0.8, 0.2, 0.4], [0.4, 0.6, 0.7], [0.6, 0.4, 0.2]],
            softmax: [0.35, 0.25, 0.20, 0.12, 0.08],
      },
      {
            name: 'Feed-Forward Network',
            desc: 'Apply non-linear transformation to each position',
            shape: '[1, 5, 16]',
            op: 'ReLU(x·W₁ + b₁)·W₂ + b₂',
            type: 'matrix',
            data: [
                  [0.71, 0.34, 0.89, 0.22],
                  [0.45, 0.67, 0.11, 0.93],
                  [0.83, 0.29, 0.56, 0.47],
                  [0.18, 0.91, 0.63, 0.38],
                  [0.59, 0.44, 0.72, 0.85],
            ],
      },
      {
            name: 'Output Probabilities',
            desc: 'Convert to probabilities over vocabulary',
            shape: '[1, 5, vocab_size]',
            type: 'probs',
            probs: [
                  { word: 'mat', prob: 0.85 },
                  { word: 'rug', prob: 0.10 },
                  { word: 'floor', prob: 0.03 },
                  { word: 'bed', prob: 0.01 },
                  { word: 'table', prob: 0.01 },
            ],
      },
];

function MatrixGrid({ data, delay = 0 }) {
      return (
            <div className="tf-matrix">
                  {data.map((row, ri) => (
                        <div key={ri} className="tf-matrix__row">
                              {row.map((val, ci) => (
                                    <motion.span
                                          key={ci}
                                          className="tf-matrix__cell"
                                          style={{ background: heatmapColor(val) }}
                                          initial={{ opacity: 0, y: 6 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: delay + (ri * row.length + ci) * 0.025, duration: 0.25 }}
                                    >
                                          {val.toFixed(2)}
                                    </motion.span>
                              ))}
                        </div>
                  ))}
            </div>
      );
}

function MiniMatrix({ data, label, delay }) {
      return (
            <div className="tf-mini-matrix">
                  <span className="tf-mini-matrix__label">{label}</span>
                  <MatrixGrid data={data} delay={delay} />
            </div>
      );
}

export default function TransformerModule() {
      const [activeStage, setActiveStage] = useState(-1);
      const [autoRun, setAutoRun] = useState(false);
      const timerRef = useRef(null);

      const stepForward = () => {
            setActiveStage(prev => (prev < STAGES.length - 1 ? prev + 1 : prev));
      };

      const toggleAutoRun = () => {
            if (autoRun) {
                  setAutoRun(false);
            } else {
                  setAutoRun(true);
                  setActiveStage(0);
            }
      };

      useEffect(() => {
            if (!autoRun) { clearInterval(timerRef.current); return; }
            timerRef.current = setInterval(() => {
                  setActiveStage(prev => {
                        if (prev >= STAGES.length - 1) { setAutoRun(false); return prev; }
                        return prev + 1;
                  });
            }, 2500);
            return () => clearInterval(timerRef.current);
      }, [autoRun]);

      return (
            <Section id="transformer">
                  <SectionHeader
                        emoji="⚡"
                        title="Transformer Architecture"
                        description="The Transformer processes text through a series of stages — from raw tokens to output probabilities."
                  />

                  <div className="tf-wrap">
                        <div className="tf-controls">
                              <Button variant="secondary" className="btn--sm" onClick={stepForward} disabled={activeStage >= STAGES.length - 1}>
                                    <SkipForward size={16} /> Step Forward
                              </Button>
                              <Button variant={autoRun ? 'ghost' : 'primary'} className="btn--sm" onClick={toggleAutoRun}>
                                    <Play size={16} /> {autoRun ? 'Stop' : 'Auto-Run'}
                              </Button>
                        </div>

                        <div className="tf-pipeline">
                              {STAGES.map((stage, i) => {
                                    const isActive = i === activeStage;
                                    const isPast = i < activeStage;
                                    return (
                                          <div key={i}>
                                                <motion.div
                                                      className={`tf-stage ${isActive ? 'tf-stage--active' : ''} ${isPast ? 'tf-stage--past' : ''} ${i > activeStage ? 'tf-stage--future' : ''}`}
                                                      animate={isActive ? { scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.5)' } : { scale: 1, borderColor: 'rgba(255,255,255,0.06)' }}
                                                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                                      onClick={() => setActiveStage(i)}
                                                      style={{ cursor: 'pointer' }}
                                                >
                                                      <div className="tf-stage__header">
                                                            <span className="tf-stage__num">{i + 1}</span>
                                                            <div>
                                                                  <h4 className="tf-stage__name">{stage.name}</h4>
                                                                  <p className="tf-stage__desc">{stage.desc}</p>
                                                            </div>
                                                            <span className="tf-stage__shape">{stage.shape}</span>
                                                      </div>

                                                      <AnimatePresence>
                                                            {isActive && (
                                                                  <motion.div
                                                                        className="tf-stage__content"
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.3 }}
                                                                  >
                                                                        {stage.op && <div className="tf-stage__op">{stage.op}</div>}

                                                                        {stage.type === 'tokens' && (
                                                                              <div className="tf-token-row">
                                                                                    {TOKENS.map((t, ti) => (
                                                                                          <motion.span key={ti} className="tf-token"
                                                                                                initial={{ opacity: 0, y: 8 }}
                                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                                transition={{ delay: ti * 0.08 }}
                                                                                          >
                                                                                                <span className="tf-token__idx">{ti}</span> {t}
                                                                                          </motion.span>
                                                                                    ))}
                                                                              </div>
                                                                        )}

                                                                        {stage.type === 'matrix' && <MatrixGrid data={stage.data} />}

                                                                        {stage.type === 'attention' && (
                                                                              <div className="tf-attention-block">
                                                                                    <div className="tf-qkv-row">
                                                                                          <MiniMatrix data={stage.q} label="Query" delay={0} />
                                                                                          <MiniMatrix data={stage.k} label="Key" delay={0.2} />
                                                                                          <MiniMatrix data={stage.v} label="Value" delay={0.4} />
                                                                                    </div>
                                                                                    <div className="tf-softmax-row">
                                                                                          <span className="tf-softmax-label">Softmax:</span>
                                                                                          {stage.softmax.map((v, si) => (
                                                                                                <motion.div key={si} className="tf-softmax-bar-wrap"
                                                                                                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + si * 0.08 }}
                                                                                                >
                                                                                                      <div className="tf-softmax-bar" style={{ width: `${v * 100}%` }} />
                                                                                                      <span className="tf-softmax-pct">{(v * 100).toFixed(0)}%</span>
                                                                                                </motion.div>
                                                                                          ))}
                                                                                    </div>
                                                                              </div>
                                                                        )}

                                                                        {stage.type === 'probs' && (
                                                                              <div className="tf-probs">
                                                                                    {stage.probs.map((p, pi) => (
                                                                                          <motion.div key={pi} className="tf-prob-row"
                                                                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                                                                                transition={{ delay: pi * 0.08 }}
                                                                                          >
                                                                                                <span className="tf-prob-word">{p.word}</span>
                                                                                                <div className="tf-prob-bar-track">
                                                                                                      <motion.div className="tf-prob-bar-fill"
                                                                                                            initial={{ width: 0 }}
                                                                                                            animate={{ width: `${p.prob * 100}%` }}
                                                                                                            transition={{ delay: 0.2 + pi * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                                                                                                      />
                                                                                                </div>
                                                                                                <span className="tf-prob-pct">{(p.prob * 100).toFixed(0)}%</span>
                                                                                          </motion.div>
                                                                                    ))}
                                                                              </div>
                                                                        )}
                                                                  </motion.div>
                                                            )}
                                                      </AnimatePresence>
                                                </motion.div>

                                                {i < STAGES.length - 1 && (
                                                      <div className={`tf-arrow ${isPast ? 'tf-arrow--active' : ''}`}>⬇</div>
                                                )}
                                          </div>
                                    );
                              })}
                        </div>
                  </div>
            </Section>
      );
}
