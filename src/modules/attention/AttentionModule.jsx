import { useState, useRef, useEffect, useCallback } from 'react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import Slider from '../../components/ui/Slider';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { heatmapColor } from '../../utils/colors';
import './AttentionModule.css';

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat'];

function softmaxRow(arr) {
      const max = Math.max(...arr);
      const exps = arr.map(x => Math.exp(x - max));
      const sum = exps.reduce((a, b) => a + b, 0);
      return exps.map(e => e / sum);
}

function generateHead(headIdx) {
      const n = TOKENS.length;
      const raw = Array.from({ length: n }, () => Array(n).fill(0));

      if (headIdx === 0) {
            // Local attention
            for (let i = 0; i < n; i++)
                  for (let j = 0; j < n; j++)
                        raw[i][j] = Math.exp(-Math.abs(i - j) * 0.8);
      } else if (headIdx === 1) {
            // Semantic — content words attend to each other
            const content = [1, 2, 5]; // cat, sat, mat
            for (let i = 0; i < n; i++)
                  for (let j = 0; j < n; j++) {
                        raw[i][j] = 0.1;
                        if (content.includes(i) && content.includes(j)) raw[i][j] = 0.9;
                        if (i === j) raw[i][j] = 0.5;
                  }
      } else if (headIdx === 2) {
            // Causal — only attend earlier
            for (let i = 0; i < n; i++)
                  for (let j = 0; j < n; j++)
                        raw[i][j] = j <= i ? 1.0 / (i - j + 1) : 0;
      } else {
            // Uniform
            for (let i = 0; i < n; i++)
                  for (let j = 0; j < n; j++)
                        raw[i][j] = 1;
      }

      return raw.map(row => softmaxRow(row));
}

const HEAD_NAMES = ['Local Attention', 'Semantic Attention', 'Causal (Positional)', 'Uniform'];
const HEAD_DESCS = [
      'Each token attends most strongly to its immediate neighbors, capturing local context.',
      'Content words (cat, sat, mat) attend strongly to each other, capturing semantic relationships.',
      'Tokens can only attend to earlier positions — this enforces causal (left-to-right) generation.',
      'All tokens receive equal attention — a baseline with no learned preferences.',
];

export default function AttentionModule() {
      const [headIdx, setHeadIdx] = useState(0);
      const [selectedRow, setSelectedRow] = useState(null);
      const [hoverCell, setHoverCell] = useState(null);
      const [sRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

      const weights = generateHead(headIdx);

      let bestAttention = '';
      if (selectedRow !== null) {
            const row = weights[selectedRow];
            const maxIdx = row.indexOf(Math.max(...row));
            bestAttention = `"${TOKENS[selectedRow]}" attends most to "${TOKENS[maxIdx]}" (${(row[maxIdx] * 100).toFixed(1)}%)`;
      }

      return (
            <Section id="attention" alt>
                  <SectionHeader
                        emoji="👁️"
                        title="Attention Mechanism"
                        description="The self-attention mechanism lets each token look at every other token to determine what's relevant."
                  />
                  <div ref={sRef} className="attn-wrap">
                        <div className="attn-head-control">
                              <Slider
                                    label="Attention Head"
                                    value={headIdx}
                                    onChange={(v) => { setHeadIdx(Math.round(v)); setSelectedRow(null); }}
                                    min={0} max={3} step={1}
                              />
                              <div className="attn-head-name">{HEAD_NAMES[headIdx]}</div>
                        </div>

                        <div className="attn-heatmap-wrap">
                              <div className="attn-axis-label attn-axis-label--top">Keys →</div>
                              <div className="attn-axis-label attn-axis-label--left">Queries →</div>

                              <div className="attn-heatmap">
                                    {/* Column headers */}
                                    <div className="attn-heatmap__header">
                                          <span className="attn-heatmap__corner" />
                                          {TOKENS.map((t, j) => (
                                                <span key={j} className="attn-heatmap__col-label">{t}</span>
                                          ))}
                                    </div>
                                    {/* Rows */}
                                    {weights.map((row, i) => (
                                          <div key={i} className={`attn-heatmap__row ${selectedRow === i ? 'attn-heatmap__row--selected' : ''}`}>
                                                <button
                                                      className={`attn-heatmap__row-label ${selectedRow === i ? 'attn-heatmap__row-label--active' : ''}`}
                                                      onClick={() => setSelectedRow(selectedRow === i ? null : i)}
                                                >
                                                      {TOKENS[i]}
                                                </button>
                                                {row.map((val, j) => (
                                                      <div
                                                            key={j}
                                                            className={`attn-heatmap__cell ${selectedRow === i || selectedRow === null ? '' : 'attn-heatmap__cell--dim'}`}
                                                            style={{ background: heatmapColor(val) }}
                                                            onMouseEnter={() => setHoverCell({ i, j, val })}
                                                            onMouseLeave={() => setHoverCell(null)}
                                                            title={`${TOKENS[i]} → ${TOKENS[j]}: ${(val * 100).toFixed(1)}%`}
                                                      >
                                                            {val > 0.05 && <span className="attn-heatmap__val">{(val * 100).toFixed(0)}%</span>}
                                                      </div>
                                                ))}
                                          </div>
                                    ))}
                              </div>
                        </div>

                        <div className="attn-scale">
                              <span>Low</span>
                              <div className="attn-scale__bar" />
                              <span>High</span>
                        </div>

                        {bestAttention && <p className="attn-selected-text">{bestAttention}</p>}

                        <div className="attn-explanation">
                              <p>{HEAD_DESCS[headIdx]}</p>
                        </div>
                  </div>
            </Section>
      );
}
