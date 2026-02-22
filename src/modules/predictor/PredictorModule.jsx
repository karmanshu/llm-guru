import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import Slider from '../../components/ui/Slider';
import { useDebounce } from '../../hooks/useDebounce';
import { NGramEngine } from './NGramEngine';
import './PredictorModule.css';

const engine = new NGramEngine();

export default function PredictorModule() {
      const [input, setInput] = useState('the cat sat');
      const [temp, setTemp] = useState(0.7);
      const debouncedInput = useDebounce(input, 150);
      const predictionsKey = useRef(0);

      const predictions = useMemo(() => {
            predictionsKey.current++;
            return engine.predict(debouncedInput, temp, 5);
      }, [debouncedInput, temp]);

      const handleInput = (e) => {
            const val = e.target.value.replace(/[<>]/g, '').slice(0, 200);
            setInput(val);
      };

      const appendWord = (word) => {
            setInput(prev => prev.trim() + ' ' + word);
      };

      return (
            <Section id="predictor" alt>
                  <SectionHeader
                        emoji="🔮"
                        title="Text Prediction"
                        description="See how a simplified language model predicts the next word based on context, using a Trigram model with backoff."
                  />
                  <div className="pred-wrap">
                        <div className="pred-input-group">
                              <input
                                    type="text"
                                    className="pred-input"
                                    value={input}
                                    onChange={handleInput}
                                    placeholder="Start a sentence..."
                                    aria-label="Input text for prediction"
                                    maxLength={200}
                              />
                        </div>

                        <div className="pred-slider-wrap">
                              <Slider
                                    label="Temperature"
                                    value={temp}
                                    onChange={setTemp}
                                    min={0}
                                    max={2}
                                    step={0.1}
                              />
                              <span className="pred-temp-hint">
                                    {temp < 0.5 ? '🎯 Very deterministic' : temp < 1.0 ? '⚖️ Balanced' : temp < 1.5 ? '🎨 Creative' : '🌀 Highly creative'}
                              </span>
                        </div>

                        <div className="pred-results" role="region" aria-live="polite" aria-label="Predictions">
                              {predictions.map((p, i) => (
                                    <motion.button
                                          key={`${predictionsKey.current}-${i}`}
                                          className={`pred-row ${p.isWinner ? 'pred-row--winner' : ''}`}
                                          onClick={() => appendWord(p.word)}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: i * 0.05, duration: 0.25 }}
                                          aria-label={`Predict ${p.word} with ${(p.prob * 100).toFixed(1)}% probability`}
                                    >
                                          <span className="pred-rank">{i + 1}</span>
                                          <span className="pred-word">{p.word}</span>
                                          <div className="pred-bar-track">
                                                <motion.div
                                                      className="pred-bar-fill"
                                                      initial={{ width: 0 }}
                                                      animate={{ width: `${Math.min(p.prob * 100, 100)}%` }}
                                                      transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                                />
                                          </div>
                                          <span className="pred-pct">{(p.prob * 100).toFixed(1)}%</span>
                                    </motion.button>
                              ))}
                        </div>

                        <p className="pred-click-hint">Click a prediction to append it and re-predict</p>
                  </div>
            </Section>
      );
}
