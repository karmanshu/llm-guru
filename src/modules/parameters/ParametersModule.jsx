import { useState } from 'react';
import { motion } from 'framer-motion';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import ClayCard from '../../components/ui/ClayCard';
import Slider from '../../components/ui/Slider';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './ParametersModule.css';

const MODEL_PRESETS = [
      { name: 'GPT-2', params: 1.5, cost: 0.05, dataset: '40 GB', year: 2019 },
      { name: 'GPT-3', params: 175, cost: 12, dataset: '570 GB', year: 2020 },
      { name: 'Llama 2', params: 70, cost: 5, dataset: '2 TB', year: 2023 },
      { name: 'GPT-4', params: 1800, cost: 100, dataset: '13 TB', year: 2023 },
      { name: 'Gemini Ultra', params: 1200, cost: 80, dataset: '10+ TB', year: 2024 },
];

function formatNum(n) {
      if (n >= 1000) return `${(n / 1000).toFixed(1)}T`;
      return `${n}B`;
}

export default function ParametersModule() {
      const [selectedIdx, setSelectedIdx] = useState(3);
      const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
      const model = MODEL_PRESETS[selectedIdx];

      return (
            <Section id="parameters" alt>
                  <SectionHeader
                        emoji="⚙️"
                        title="Model Parameters"
                        description="Parameters are the learned values (weights and biases) that define what a model knows."
                  />
                  <div ref={ref} className="params-wrap">
                        <Slider
                              label="Select Model"
                              value={selectedIdx}
                              onChange={(v) => setSelectedIdx(Math.round(v))}
                              min={0}
                              max={MODEL_PRESETS.length - 1}
                              step={1}
                        />

                        <div className="params-model-name">{model.name} ({model.year})</div>

                        <div className="params-grid">
                              {[
                                    { label: 'Parameters', value: formatNum(model.params), detail: 'Learned weights' },
                                    { label: 'Training Cost', value: `~$${model.cost}M`, detail: 'USD estimate' },
                                    { label: 'Dataset Size', value: model.dataset, detail: 'Training data' },
                              ].map((stat, i) => (
                                    <motion.div
                                          key={stat.label}
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={isVisible ? { opacity: 1, y: 0 } : {}}
                                          transition={{ delay: i * 0.1, duration: 0.5 }}
                                    >
                                          <ClayCard className="params-stat">
                                                <div className="params-stat__value">{stat.value}</div>
                                                <div className="params-stat__label">{stat.label}</div>
                                                <div className="params-stat__detail">{stat.detail}</div>
                                          </ClayCard>
                                    </motion.div>
                              ))}
                        </div>

                        <div className="params-comparison">
                              <h4>Parameter Count Comparison</h4>
                              <div className="params-bars">
                                    {MODEL_PRESETS.map((m, i) => {
                                          const maxP = Math.max(...MODEL_PRESETS.map(p => p.params));
                                          const pct = (m.params / maxP) * 100;
                                          return (
                                                <motion.div
                                                      key={m.name}
                                                      className={`params-bar-row ${i === selectedIdx ? 'params-bar-row--active' : ''}`}
                                                      onClick={() => setSelectedIdx(i)}
                                                      initial={{ opacity: 0 }}
                                                      animate={isVisible ? { opacity: 1 } : {}}
                                                      transition={{ delay: 0.3 + i * 0.08 }}
                                                >
                                                      <span className="params-bar-label">{m.name}</span>
                                                      <div className="params-bar-track">
                                                            <motion.div
                                                                  className="params-bar-fill"
                                                                  initial={{ width: 0 }}
                                                                  animate={isVisible ? { width: `${pct}%` } : {}}
                                                                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                                                            />
                                                      </div>
                                                      <span className="params-bar-value">{formatNum(m.params)}</span>
                                                </motion.div>
                                          );
                                    })}
                              </div>
                        </div>
                  </div>
            </Section>
      );
}
