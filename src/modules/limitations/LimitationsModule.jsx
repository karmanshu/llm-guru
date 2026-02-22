import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Brain, Zap, Ban } from 'lucide-react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import ClayCard from '../../components/ui/ClayCard';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './LimitationsModule.css';

const LIMITATIONS = [
      {
            icon: AlertTriangle,
            color: '#ef4444',
            title: 'Hallucinations',
            example: '"The Great Wall of China was built in 1492 by Alexander Graham Bell."',
            explanation: 'LLMs predict statistically likely text, not verified facts. They can confidently state things that are entirely fabricated.',
      },
      {
            icon: RefreshCw,
            color: '#f59e0b',
            title: 'No Real-Time Knowledge',
            example: '"I can tell you about events up to my training cutoff. I don\'t know what happened yesterday."',
            explanation: 'Models are frozen at training time. Without tools (search, APIs), they cannot access current information.',
      },
      {
            icon: Brain,
            color: '#8b5cf6',
            title: 'No True Understanding',
            example: '"A bat and a ball cost $1.10 total. The bat costs $1 more than the ball..."',
            explanation: 'LLMs match patterns, not reason logically. They struggle with multi-step logic, math, and spatial reasoning.',
      },
      {
            icon: Zap,
            color: '#ec4899',
            title: 'Bias & Stereotypes',
            example: '"The doctor... he/The nurse... she" — reflecting societal biases in training data.',
            explanation: 'Models absorb biases present in training data, sometimes amplifying harmful stereotypes in their outputs.',
      },
      {
            icon: Ban,
            color: '#64748b',
            title: 'Context Window Limits',
            example: '"I lost track of a detail you mentioned 50 pages ago."',
            explanation: 'Even large context windows are finite. Very long conversations or documents can lead to lost information.',
      },
];

export default function LimitationsModule() {
      const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

      return (
            <Section id="limitations">
                  <SectionHeader
                        emoji="⚠️"
                        title="Limitations"
                        description="Despite their impressive capabilities, LLMs have fundamental limitations that are important to understand."
                  />
                  <div ref={ref} className="lim-grid">
                        {LIMITATIONS.map((lim, i) => (
                              <motion.div
                                    key={lim.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                              >
                                    <ClayCard className="lim-card">
                                          <div className="lim-card__icon" style={{ color: lim.color, background: `${lim.color}15` }}>
                                                <lim.icon size={22} />
                                          </div>
                                          <h4 className="lim-card__title">{lim.title}</h4>
                                          <blockquote className="lim-card__example">{lim.example}</blockquote>
                                          <p className="lim-card__explain">{lim.explanation}</p>
                                    </ClayCard>
                              </motion.div>
                        ))}
                  </div>
            </Section>
      );
}
