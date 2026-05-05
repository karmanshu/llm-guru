import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, Menu, X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import './Navbar.css';

const sections = [
      { id: 'hero', label: 'Home' },
      { id: 'what-is-llm', label: 'What is LLM' },
      { id: 'tokenizer', label: 'Tokenization' },
      { id: 'embeddings', label: 'Embeddings' },
      { id: 'positional', label: 'Positional' },
      { id: 'neural', label: 'Neural Net' },
      { id: 'vision-ai', label: 'Vision AI' },
      { id: 'transformer', label: 'Transformer' },
      { id: 'attention', label: 'Attention' },
      { id: 'context-window', label: 'Context' },
      { id: 'predictor', label: 'Prediction' },
      { id: 'training', label: 'Training' },
      { id: 'train-your-llm', label: 'Train Your LLM' },
      { id: 'parameters', label: 'Parameters' },
      { id: 'limitations', label: 'Limits' },
      { id: 'safety', label: 'Safety' },
];

export default function Navbar() {
      const [show, setShow] = useState(false);
      const [activeSection, setActiveSection] = useState('hero');
      const [scrollProgress, setScrollProgress] = useState(0);
      const [menuOpen, setMenuOpen] = useState(false);

      const activeIndex = useMemo(() => {
            const index = sections.findIndex(section => section.id === activeSection);
            return index >= 0 ? index : 0;
      }, [activeSection]);

      const currentLabel = sections[activeIndex]?.label || 'Home';
      const previousSection = sections[Math.max(activeIndex - 1, 0)];
      const nextSection = sections[Math.min(activeIndex + 1, sections.length - 1)];

      useEffect(() => {
            let frameId = 0;

            const handleScroll = () => {
                  if (frameId) cancelAnimationFrame(frameId);

                  frameId = requestAnimationFrame(() => {
                        const scrollY = window.scrollY;
                        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                        const progress = scrollHeight > 0 ? Math.min(scrollY / scrollHeight, 1) : 0;
                        const readLine = scrollY + 120;
                        let current = sections[0].id;

                        sections.forEach(section => {
                              const element = document.getElementById(section.id);
                              if (element && element.offsetTop <= readLine) {
                                    current = section.id;
                              }
                        });

                        setShow(scrollY > 80);
                        setScrollProgress(progress);
                        setActiveSection(current);
                  });
            };

            handleScroll();
            window.addEventListener('scroll', handleScroll, { passive: true });

            return () => {
                  window.removeEventListener('scroll', handleScroll);
                  if (frameId) cancelAnimationFrame(frameId);
            };
      }, []);

      useEffect(() => {
            if (!menuOpen) return undefined;

            const closeOnEscape = (event) => {
                  if (event.key === 'Escape') setMenuOpen(false);
            };

            document.addEventListener('keydown', closeOnEscape);
            return () => document.removeEventListener('keydown', closeOnEscape);
      }, [menuOpen]);

      const scrollToSection = useCallback((id) => {
            const element = document.getElementById(id);
            if (!element) return;

            const navbarOffset = id === 'hero' ? 0 : 88;
            const top = element.getBoundingClientRect().top + window.scrollY - navbarOffset;

            setActiveSection(id);
            window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
            setMenuOpen(false);
      }, []);

      const scrollToTop = () => scrollToSection('hero');

      return (
            <AnimatePresence>
                  {show && (
                        <motion.nav
                              className="navbar"
                              initial={{ y: -80, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -80, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                              aria-label="Page sections"
                        >
                              <div className="navbar__inner">
                                    <button className="navbar__logo" onClick={scrollToTop} aria-label="Go to Home">
                                          <span className="navbar__logo-mark">🐲</span>
                                          <span className="navbar__logo-text">LLM Guru</span>
                                    </button>

                                    <div className="navbar__status" aria-live="polite">
                                          <span className="navbar__status-kicker">Reading</span>
                                          <strong>{currentLabel}</strong>
                                    </div>

                                    <div className="navbar__rail" aria-label="Jump to section">
                                          {sections.map((section, index) => {
                                                const isActive = section.id === activeSection;
                                                return (
                                                      <button
                                                            key={section.id}
                                                            className={`navbar__item ${isActive ? 'navbar__item--active' : ''}`}
                                                            onClick={() => scrollToSection(section.id)}
                                                            aria-current={isActive ? 'location' : undefined}
                                                            title={section.label}
                                                      >
                                                            <span className="navbar__item-index">{String(index + 1).padStart(2, '0')}</span>
                                                            <span className="navbar__item-label">{section.label}</span>
                                                      </button>
                                                );
                                          })}
                                    </div>

                                    <div className="navbar__actions">
                                          <button
                                                className="navbar__icon-btn"
                                                onClick={() => scrollToSection(previousSection.id)}
                                                disabled={activeIndex === 0}
                                                aria-label={`Previous section: ${previousSection.label}`}
                                                title="Previous section"
                                          >
                                                <ChevronLeft size={17} />
                                          </button>
                                          <button
                                                className="navbar__icon-btn"
                                                onClick={() => scrollToSection(nextSection.id)}
                                                disabled={activeIndex === sections.length - 1}
                                                aria-label={`Next section: ${nextSection.label}`}
                                                title="Next section"
                                          >
                                                <ChevronRight size={17} />
                                          </button>
                                          <button className="navbar__icon-btn" onClick={scrollToTop} aria-label="Back to top" title="Back to top">
                                                <ChevronUp size={17} />
                                          </button>
                                          <ThemeToggle className="theme-toggle--navbar" />
                                          <button
                                                className="navbar__menu-btn"
                                                onClick={() => setMenuOpen(open => !open)}
                                                aria-label={menuOpen ? 'Close section menu' : 'Open section menu'}
                                                aria-expanded={menuOpen}
                                                aria-controls="navbar-menu"
                                          >
                                                {menuOpen ? <X size={18} /> : <Menu size={18} />}
                                          </button>
                                    </div>
                              </div>

                              <AnimatePresence>
                                    {menuOpen && (
                                          <motion.div
                                                id="navbar-menu"
                                                className="navbar__menu"
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.18 }}
                                          >
                                                {sections.map((section, index) => {
                                                      const isActive = section.id === activeSection;
                                                      return (
                                                            <button
                                                                  key={section.id}
                                                                  className={`navbar__menu-item ${isActive ? 'navbar__menu-item--active' : ''}`}
                                                                  onClick={() => scrollToSection(section.id)}
                                                                  aria-current={isActive ? 'location' : undefined}
                                                            >
                                                                  <span>{String(index + 1).padStart(2, '0')}</span>
                                                                  {section.label}
                                                            </button>
                                                      );
                                                })}
                                          </motion.div>
                                    )}
                              </AnimatePresence>

                              <div className="navbar__progress-track" aria-hidden="true">
                                    <div className="navbar__progress" style={{ width: `${scrollProgress * 100}%` }} />
                              </div>
                        </motion.nav>
                  )}
            </AnimatePresence>
      );
}
