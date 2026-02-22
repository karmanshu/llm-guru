import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import Slider from '../../components/ui/Slider';
import ClayCard from '../../components/ui/ClayCard';
import './ContextModule.css';

const STORY_TOKENS = [
      'Once', 'upon', 'a', 'time,', 'there', 'was', 'a', 'brave',
      'cat', 'who', 'loved', 'to', 'explore', 'the', 'vast', 'world.',
      'One', 'day,', 'the', 'cat', 'found', 'a', 'mysterious', 'map',
      'that', 'led', 'to', 'a', 'treasure', 'hidden', 'deep', 'in',
      'the', 'ancient', 'forest.', 'The', 'journey', 'was', 'long',
      'and', 'dangerous,', 'but', 'the', 'cat', 'pressed', 'on.'
];

const PRESETS = [
      { label: 'GPT-2 (small)', size: 4 },
      { label: 'GPT-3', size: 6 },
      { label: 'GPT-4', size: 8 },
      { label: 'Claude/Gemini', size: 12 },
];

export default function ContextModule() {
      const [contextSize, setContextSize] = useState(6);
      const [scrollPos, setScrollPos] = useState(0);

      const maxScroll = Math.max(0, STORY_TOKENS.length - contextSize);
      const windowStart = scrollPos;
      const windowEnd = Math.min(scrollPos + contextSize, STORY_TOKENS.length);
      const visible = windowEnd - windowStart;
      const forgotten = windowStart;
      const unseen = STORY_TOKENS.length - windowEnd;
      const visibleText = STORY_TOKENS.slice(windowStart, windowEnd).join(' ');

      const handleSizeChange = (val) => {
            const s = Math.round(val);
            setContextSize(s);
            setScrollPos(prev => Math.min(prev, Math.max(0, STORY_TOKENS.length - s)));
      };

      const handleKeyDown = useCallback((e) => {
            if (e.key === 'ArrowLeft') setScrollPos(p => Math.max(0, p - 1));
            if (e.key === 'ArrowRight') setScrollPos(p => Math.min(maxScroll, p + 1));
      }, [maxScroll]);

      useEffect(() => {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
      }, [handleKeyDown]);

      let explanation = `The model currently sees: "${visibleText}"`;
      if (forgotten > 0) {
            explanation += `\n\nThe first ${forgotten} tokens have been "forgotten" — they're outside the context window.`;
      }
      if (contextSize <= 4) {
            explanation += '\n\n⚠️ With such a small window, the model loses context quickly.';
      } else if (contextSize >= 10) {
            explanation += '\n\n✨ Modern models support 100K+ token windows, enabling entire books to be processed.';
      }

      return (
            <Section id="context-window">
                  <SectionHeader
                        emoji="📐"
                        title="Context Window"
                        description="LLMs can only see a limited number of tokens at once — this is the context window."
                  />
                  <div className="ctx-wrap">
                        <div className="ctx-controls">
                              <div className="ctx-slider-wrap">
                                    <Slider label="Context Size" value={contextSize} onChange={handleSizeChange} min={2} max={12} step={1} unit=" tokens" />
                              </div>
                              <div className="ctx-nav">
                                    <button className="ctx-nav-btn" onClick={() => setScrollPos(p => Math.max(0, p - 1))} disabled={scrollPos <= 0} aria-label="Scroll left">
                                          <ChevronLeft size={18} />
                                    </button>
                                    <button className="ctx-nav-btn" onClick={() => setScrollPos(p => Math.min(maxScroll, p + 1))} disabled={scrollPos >= maxScroll} aria-label="Scroll right">
                                          <ChevronRight size={18} />
                                    </button>
                              </div>
                        </div>

                        <div className="ctx-presets">
                              <span className="ctx-presets-label">Presets:</span>
                              {PRESETS.map(p => (
                                    <button
                                          key={p.label}
                                          className={`ctx-preset-btn ${contextSize === p.size ? 'ctx-preset-btn--active' : ''}`}
                                          onClick={() => handleSizeChange(p.size)}
                                    >
                                          {p.label}
                                    </button>
                              ))}
                        </div>

                        <div className="ctx-tokens-scroll">
                              <div className="ctx-tokens">
                                    {STORY_TOKENS.map((token, i) => {
                                          let cls = 'ctx-token';
                                          if (i >= windowStart && i < windowEnd) cls += ' ctx-token--visible';
                                          else if (i < windowStart) cls += ' ctx-token--hidden';
                                          else cls += ' ctx-token--future';
                                          return (
                                                <motion.span
                                                      key={i}
                                                      className={cls}
                                                      layout
                                                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                >
                                                      {token}
                                                </motion.span>
                                          );
                                    })}
                              </div>
                        </div>

                        <p className="ctx-hint">← Scroll or use arrows to move the window →</p>

                        <div className="ctx-stats">
                              {[
                                    { val: visible, label: 'Visible Tokens', accent: true },
                                    { val: forgotten, label: 'Forgotten', accent: false },
                                    { val: unseen, label: 'Not Yet Seen', accent: false, dim: true },
                                    { val: STORY_TOKENS.length, label: 'Total Tokens', accent: true },
                              ].map(s => (
                                    <ClayCard key={s.label} className="ctx-stat">
                                          <div className={`ctx-stat-value ${s.accent ? '' : 'ctx-stat-value--muted'} ${s.dim ? 'ctx-stat-value--dim' : ''}`}>
                                                {s.val}
                                          </div>
                                          <div className="ctx-stat-label">{s.label}</div>
                                    </ClayCard>
                              ))}
                        </div>

                        <div className="ctx-explanation">
                              {explanation.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                  </div>
            </Section>
      );
}
