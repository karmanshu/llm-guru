import { motion } from 'framer-motion';
import { Shield, Lock, UserCheck, AlertOctagon, Eye } from 'lucide-react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import ClayCard from '../../components/ui/ClayCard';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './SafetyModule.css';

const SAFETY_ITEMS = [
      {
            icon: Shield,
            color: '#10b981',
            title: 'Alignment',
            desc: 'RLHF and Constitutional AI help models follow human values, refuse harmful requests, and stay helpful.',
      },
      {
            icon: Lock,
            color: '#6366f1',
            title: 'Content Filtering',
            desc: 'Input/output moderation layers detect and block harmful, illegal, or dangerous content before/after generation.',
      },
      {
            icon: UserCheck,
            color: '#f59e0b',
            title: 'Red Teaming',
            desc: 'Experts systematically probe the model for vulnerabilities, jailbreaks, and failure modes before deployment.',
      },
      {
            icon: AlertOctagon,
            color: '#ef4444',
            title: 'Jailbreaking Risks',
            desc: 'Adversarial prompts can bypass safety measures. This is an active research area and cat-and-mouse game.',
      },
      {
            icon: Eye,
            color: '#8b5cf6',
            title: 'Transparency',
            desc: 'Model cards, usage policies, and research papers help users understand capabilities and limitations.',
      },
];

export default function SafetyModule() {
      const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

      return (
            <Section id="safety" alt>
                  <SectionHeader
                        emoji="🛡️"
                        title="Safety & Ethics"
                        description="Ensuring AI systems are safe, aligned, and beneficial is one of the most important challenges in AI development."
                  />
                  <div ref={ref} className="safety-grid">
                        {SAFETY_ITEMS.map((item, i) => (
                              <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                              >
                                    <ClayCard className="safety-card" glow>
                                          <div className="safety-card__icon" style={{ color: item.color, background: `${item.color}15` }}>
                                                <item.icon size={22} />
                                          </div>
                                          <h4 className="safety-card__title">{item.title}</h4>
                                          <p className="safety-card__desc">{item.desc}</p>
                                    </ClayCard>
                              </motion.div>
                        ))}
                  </div>
            </Section>
      );
}
