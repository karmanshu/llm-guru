import { motion } from 'framer-motion';
import { Brain, Database, Zap } from 'lucide-react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import ClayCard from '../../components/ui/ClayCard';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './WhatIsLLM.css';

const cards = [
      {
            icon: Brain,
            color: '#6366f1',
            title: 'Neural Networks',
            desc: 'Billions of interconnected artificial neurons working together to process and understand complex language patterns.',
      },
      {
            icon: Database,
            color: '#8b5cf6',
            title: 'Training Data',
            desc: 'Trained on trillions of words from books, websites, and documents to learn the full breadth of human language patterns.',
      },
      {
            icon: Zap,
            color: '#f59e0b',
            title: 'Prediction',
            desc: 'Predicts the most likely next word based on context, creating coherent and relevant responses one token at a time. Learns patterns from massive data.',
      },
];

const cardVariants = {
      hidden: { opacity: 0, y: 30 },
      show: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.12, duration: 0.6, ease: [0.4, 0, 0.2, 1] },
      }),
};

export default function WhatIsLLM() {
      const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

      return (
            <Section id="what-is-llm" alt>
                  <SectionHeader
                        title="What is a Large Language Model?"
                        description="LLMs are powerful AI systems that understand and generate human-like text by learning patterns from massive amounts of data."
                  />
                  <div ref={ref} className="llm-cards-grid">
                        {cards.map((card, i) => (
                              <motion.div
                                    key={card.title}
                                    custom={i}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate={isVisible ? 'show' : 'hidden'}
                              >
                                    <ClayCard className="llm-card" glow>
                                          <div className="llm-card__icon-wrap" style={{ background: `${card.color}20` }}>
                                                <card.icon size={28} color={card.color} />
                                          </div>
                                          <h3 className="llm-card__title">{card.title}</h3>
                                          <p className="llm-card__desc">{card.desc}</p>
                                    </ClayCard>
                              </motion.div>
                        ))}
                  </div>
            </Section>
      );
}
