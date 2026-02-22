import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import InfoPanel from '../../components/shared/InfoPanel';
import { tokenize, TOKEN_COLORS } from './TokenizerEngine';
import { useDebounce } from '../../hooks/useDebounce';
import './TokenizerModule.css';

export default function TokenizerModule() {
      const [input, setInput] = useState("Understanding how tokenization works in language models");
      const debouncedInput = useDebounce(input, 250);

      const tokens = useMemo(() => tokenize(debouncedInput), [debouncedInput]);

      const handleInput = (e) => {
            const val = e.target.value.replace(/[<>]/g, '').slice(0, 500);
            setInput(val);
      };

      const usedTypes = [...new Set(tokens.map(t => t.type))];

      return (
            <Section id="tokenizer">
                  <SectionHeader
                        emoji="🔤"
                        title="Tokenization"
                        description="Before an LLM can understand text, it must break it into smaller pieces called tokens — words, subwords, or even single characters."
                  />

                  <div className="tokenizer-demo">
                        <div className="tokenizer-input-wrap">
                              <input
                                    type="text"
                                    className="tokenizer-input"
                                    value={input}
                                    onChange={handleInput}
                                    placeholder="Type something like 'Hello, how are you?'"
                                    aria-label="Text to tokenize"
                                    maxLength={500}
                              />
                              <span className="tokenizer-count">{tokens.length} tokens</span>
                        </div>

                        <div className="tokenizer-chips" role="region" aria-live="polite" aria-label="Tokenized output">
                              <AnimatePresence mode="popLayout">
                                    {tokens.map((token, i) => {
                                          const colors = TOKEN_COLORS[token.type] || TOKEN_COLORS.standalone;
                                          return (
                                                <motion.span
                                                      key={`${i}-${token.text}`}
                                                      className="token-chip"
                                                      style={{
                                                            background: colors.bg,
                                                            borderColor: colors.border,
                                                      }}
                                                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                                      exit={{ opacity: 0, scale: 0.8 }}
                                                      transition={{ delay: i * 0.03, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                                >
                                                      <span className="token-chip__index">{i}</span>
                                                      <span className="token-chip__text">{token.text}</span>
                                                      <span className="token-chip__type">{colors.label}</span>
                                                </motion.span>
                                          );
                                    })}
                              </AnimatePresence>
                        </div>

                        {usedTypes.length > 1 && (
                              <div className="tokenizer-legend">
                                    {usedTypes.map(type => {
                                          const c = TOKEN_COLORS[type];
                                          return (
                                                <span key={type} className="tokenizer-legend__item">
                                                      <span className="tokenizer-legend__dot" style={{ background: c.border }} />
                                                      {c.label}
                                                </span>
                                          );
                                    })}
                              </div>
                        )}

                        <InfoPanel>
                              <strong>Tokens</strong> can be whole words, parts of words (subwords), punctuation, or spaces.
                              Modern LLMs use Byte Pair Encoding (BPE) to efficiently represent text.
                              Common words stay whole, while rare words are split into smaller meaningful pieces.
                        </InfoPanel>
                  </div>
            </Section>
      );
}
