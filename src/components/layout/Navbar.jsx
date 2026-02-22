import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ChevronUp } from 'lucide-react';
import './Navbar.css';

const sections = [
      { id: 'hero', label: 'Home' },
      { id: 'what-is-llm', label: 'What is LLM' },
      { id: 'tokenizer', label: 'Tokenization' },
      { id: 'embeddings', label: 'Embeddings' },
      { id: 'positional', label: 'Positional' },
      { id: 'neural', label: 'Neural Net' },
      { id: 'transformer', label: 'Transformer' },
      { id: 'attention', label: 'Attention' },
      { id: 'context-window', label: 'Context' },
      { id: 'predictor', label: 'Prediction' },
      { id: 'training', label: 'Training' },
      { id: 'parameters', label: 'Parameters' },
      { id: 'limitations', label: 'Limits' },
      { id: 'safety', label: 'Safety' },
];

export default function Navbar() {
      const [show, setShow] = useState(false);
      const [activeSection, setActiveSection] = useState('hero');

      useEffect(() => {
            const handleScroll = () => {
                  setShow(window.scrollY > window.innerHeight * 0.5);
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
      }, []);

      useEffect(() => {
            const observer = new IntersectionObserver(
                  (entries) => {
                        entries.forEach(entry => {
                              if (entry.isIntersecting) {
                                    setActiveSection(entry.target.id);
                              }
                        });
                  },
                  { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' }
            );

            sections.forEach(s => {
                  const el = document.getElementById(s.id);
                  if (el) observer.observe(el);
            });

            return () => observer.disconnect();
      }, []);

      const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

      const currentLabel = sections.find(s => s.id === activeSection)?.label || 'Home';

      return (
            <AnimatePresence>
                  {show && (
                        <motion.nav
                              className="navbar"
                              initial={{ y: -80, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -80, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                              <div className="navbar__inner">
                                    <button className="navbar__logo" onClick={scrollToTop} aria-label="Scroll to top">
                                          <span className="navbar__logo-text">LLM Guide</span>
                                    </button>

                                    <div className="navbar__section-name">{currentLabel}</div>

                                    <div className="navbar__dots">
                                          {sections.map(s => (
                                                <button
                                                      key={s.id}
                                                      className={`navbar__dot ${s.id === activeSection ? 'navbar__dot--active' : ''}`}
                                                      onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
                                                      aria-label={`Go to ${s.label}`}
                                                      title={s.label}
                                                />
                                          ))}
                                    </div>

                                    <button className="navbar__top-btn" onClick={scrollToTop} aria-label="Back to top">
                                          <ChevronUp size={18} />
                                    </button>
                              </div>
                        </motion.nav>
                  )}
            </AnimatePresence>
      );
}
