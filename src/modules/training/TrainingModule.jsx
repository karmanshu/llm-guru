import { motion } from 'framer-motion';
import { BookOpen, Cpu, Target, MessageSquare } from 'lucide-react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import ClayCard from '../../components/ui/ClayCard';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './TrainingModule.css';

const PHASES = [
      {
            icon: BookOpen,
            color: '#6366f1',
            title: 'Pre-Training',
            desc: 'The model reads trillions of tokens from the internet, books, and code, learning general language patterns through next-token prediction.',
            details: ['Self-supervised learning', 'Next-token prediction objective', 'Trillions of tokens', 'Months of training on GPU clusters'],
      },
      {
            icon: Target,
            color: '#ec4899',
            title: 'Supervised Fine-Tuning (SFT)',
            desc: 'Human experts write high-quality examples of questions and ideal answers. The model learns to follow instructions and produce helpful responses.',
            details: ['Expert-written demonstrations', 'Instruction-following', 'Task-specific adaptation', '~100K high-quality examples'],
      },
      {
            icon: MessageSquare,
            color: '#10b981',
            title: 'RLHF / RLAIF',
            desc: 'Humans (or AI) rank model outputs by quality. A reward model learns these preferences, then the main model is optimized to maximize the reward.',
            details: ['Preference data collection', 'Reward model training', 'PPO optimization', 'Safety alignment'],
      },
      {
            icon: Cpu,
            color: '#f59e0b',
            title: 'Evaluation & Deployment',
            desc: 'The model is tested across benchmarks, red-teamed for safety, and deployed with guardrails and monitoring.',
            details: ['Benchmark testing', 'Red-teaming', 'Safety filters', 'Continuous monitoring'],
      },
];

export default function TrainingModule() {
      const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

      return (
            <Section id="training">
                  <SectionHeader
                        emoji="🎓"
                        title="How Models Are Trained"
                        description="Training an LLM is a multi-phase process that takes months and costs millions of dollars."
                  />
                  <div ref={ref} className="training-timeline">
                        {PHASES.map((phase, i) => (
                              <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                                    transition={{ delay: i * 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                              >
                                    <ClayCard className="training-phase" glow>
                                          <div className="training-phase__connector">
                                                <span className="training-phase__step" style={{ background: phase.color }}>{i + 1}</span>
                                                {i < PHASES.length - 1 && <div className="training-phase__line" />}
                                          </div>
                                          <div className="training-phase__content">
                                                <div className="training-phase__icon-wrap" style={{ background: `${phase.color}20` }}>
                                                      <phase.icon size={22} color={phase.color} />
                                                </div>
                                                <h4 className="training-phase__title">{phase.title}</h4>
                                                <p className="training-phase__desc">{phase.desc}</p>
                                                <ul className="training-phase__details">
                                                      {phase.details.map((d, di) => (
                                                            <li key={di}>{d}</li>
                                                      ))}
                                                </ul>
                                          </div>
                                    </ClayCard>
                              </motion.div>
                        ))}
                  </div>
            </Section>
      );
}
