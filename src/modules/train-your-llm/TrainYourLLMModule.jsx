import { motion } from 'framer-motion';
import {
      BadgeCheck,
      Boxes,
      Brain,
      Database,
      Gauge,
      GitBranch,
      Layers3,
      Rocket,
      ShieldCheck,
      SlidersHorizontal,
      Sparkles,
      Wand2,
} from 'lucide-react';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/shared/SectionHeader';
import ClayCard from '../../components/ui/ClayCard';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './TrainYourLLMModule.css';

const BUILD_STEPS = [
      {
            icon: Database,
            title: 'Define the Dataset',
            label: 'Data',
            metric: '10M-1B tokens',
            color: '#10b981',
            detail: 'Collect domain text, remove duplicates, filter unsafe or low-quality pages, and split train/validation/test sets.',
      },
      {
            icon: Wand2,
            title: 'Build the Tokenizer',
            label: 'Tokens',
            metric: '16k-50k vocab',
            color: '#6366f1',
            detail: 'Train a BPE or SentencePiece tokenizer so raw text becomes stable integer IDs the model can learn from.',
      },
      {
            icon: Layers3,
            title: 'Choose Architecture',
            label: 'Model',
            metric: 'decoder-only',
            color: '#8b5cf6',
            detail: 'Set layer count, hidden size, attention heads, context length, normalization, and activation function.',
      },
      {
            icon: SlidersHorizontal,
            title: 'Pre-Train',
            label: 'Loss',
            metric: 'next token',
            color: '#f59e0b',
            detail: 'Run self-supervised next-token prediction with batching, gradient accumulation, warmup, and checkpoints.',
      },
      {
            icon: Sparkles,
            title: 'Instruction Tune',
            label: 'Behavior',
            metric: 'SFT + DPO',
            color: '#ec4899',
            detail: 'Teach the model to follow prompts with curated conversations, preference pairs, and refusal examples.',
      },
      {
            icon: ShieldCheck,
            title: 'Evaluate and Ship',
            label: 'Deploy',
            metric: 'guardrails',
            color: '#06b6d4',
            detail: 'Benchmark accuracy, latency, safety, hallucination rate, and deploy with monitoring and rollback paths.',
      },
];

const TRAINING_RUN = [
      { label: 'token batch', value: 78, color: '#10b981' },
      { label: 'GPU memory', value: 64, color: '#6366f1' },
      { label: 'loss drop', value: 84, color: '#f59e0b' },
      { label: 'eval score', value: 72, color: '#ec4899' },
];

const MODEL_STACK = [
      'Prompt tokens',
      'Token embeddings',
      'Positional signal',
      'Transformer blocks',
      'Logits',
      'Next token',
];

export default function TrainYourLLMModule() {
      const [ref, isVisible] = useIntersectionObserver({ threshold: 0.12 });

      return (
            <Section id="train-your-llm" alt className="train-llm-section">
                  <SectionHeader
                        emoji="LLM"
                        title="How to Train Your LLM"
                        description="A practical, visual build plan for turning raw text into a small instruction-following language model."
                  />

                  <div ref={ref} className="train-llm-shell">
                        <div className="train-llm-hero">
                              <ClayCard className="train-llm-command" glow>
                                    <div className="train-llm-command__header">
                                          <span />
                                          <span />
                                          <span />
                                          <strong>training-run.yaml</strong>
                                    </div>
                                    <div className="train-llm-command__body">
                                          <p><span>model:</span> tiny-transformer-llm</p>
                                          <p><span>objective:</span> next_token_prediction</p>
                                          <p><span>context:</span> 4096 tokens</p>
                                          <p><span>optimizer:</span> adamw + cosine_decay</p>
                                          <p><span>checkpoint:</span> every validation win</p>
                                    </div>
                              </ClayCard>

                              <div className="train-llm-orbit" aria-label="LLM training system diagram" role="img">
                                    <div className="train-llm-orbit__ring train-llm-orbit__ring--outer" />
                                    <div className="train-llm-orbit__ring train-llm-orbit__ring--inner" />
                                    <div className="train-llm-orbit__core">
                                          <Brain size={34} />
                                          <strong>LLM</strong>
                                    </div>
                                    {BUILD_STEPS.map((step, index) => (
                                          <motion.div
                                                key={step.label}
                                                className={`train-llm-orbit__node train-llm-orbit__node--${index + 1}`}
                                                style={{ '--node-color': step.color }}
                                                initial={{ opacity: 0, scale: 0.6 }}
                                                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                                                transition={{ delay: 0.18 + index * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
                                          >
                                                <step.icon size={18} />
                                                <span>{step.label}</span>
                                          </motion.div>
                                    ))}
                              </div>
                        </div>

                        <div className="train-llm-flow">
                              {BUILD_STEPS.map((step, index) => (
                                    <motion.div
                                          key={step.title}
                                          className="train-llm-step-wrap"
                                          initial={{ opacity: 0, y: 24 }}
                                          animate={isVisible ? { opacity: 1, y: 0 } : {}}
                                          transition={{ delay: index * 0.08, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                                    >
                                          <ClayCard className="train-llm-step">
                                                <div className="train-llm-step__top">
                                                      <div className="train-llm-step__icon" style={{ '--step-color': step.color }}>
                                                            <step.icon size={22} />
                                                      </div>
                                                      <span>{String(index + 1).padStart(2, '0')}</span>
                                                </div>
                                                <h3>{step.title}</h3>
                                                <p>{step.detail}</p>
                                                <div className="train-llm-step__metric">
                                                      <strong>{step.metric}</strong>
                                                      <i style={{ background: step.color }} />
                                                </div>
                                          </ClayCard>
                                    </motion.div>
                              ))}
                        </div>

                        <div className="train-llm-dashboard">
                              <ClayCard className="train-llm-stack-card">
                                    <div className="train-llm-card-title">
                                          <Boxes size={18} />
                                          <span>Forward pass stack</span>
                                    </div>
                                    <div className="train-llm-stack">
                                          {MODEL_STACK.map((item, index) => (
                                                <motion.div
                                                      key={item}
                                                      className="train-llm-stack__layer"
                                                      initial={{ opacity: 0, x: -12 }}
                                                      animate={isVisible ? { opacity: 1, x: 0 } : {}}
                                                      transition={{ delay: 0.35 + index * 0.06 }}
                                                >
                                                      <span>{index + 1}</span>
                                                      {item}
                                                </motion.div>
                                          ))}
                                    </div>
                              </ClayCard>

                              <ClayCard className="train-llm-metrics-card" glow>
                                    <div className="train-llm-card-title">
                                          <Gauge size={18} />
                                          <span>Training health</span>
                                    </div>
                                    <div className="train-llm-meters">
                                          {TRAINING_RUN.map(item => (
                                                <div key={item.label} className="train-llm-meter">
                                                      <div className="train-llm-meter__label">
                                                            <span>{item.label}</span>
                                                            <strong>{item.value}%</strong>
                                                      </div>
                                                      <div className="train-llm-meter__track">
                                                            <motion.i
                                                                  style={{ '--meter-color': item.color }}
                                                                  initial={{ width: 0 }}
                                                                  animate={isVisible ? { width: `${item.value}%` } : {}}
                                                                  transition={{ delay: 0.35, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                                                            />
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              </ClayCard>

                              <ClayCard className="train-llm-release-card">
                                    <div className="train-llm-card-title">
                                          <GitBranch size={18} />
                                          <span>Release gate</span>
                                    </div>
                                    <div className="train-llm-release-grid">
                                          {['Clean data', 'Stable loss', 'Safety eval', 'Latency pass'].map(item => (
                                                <span key={item}>
                                                      <BadgeCheck size={15} />
                                                      {item}
                                                </span>
                                          ))}
                                    </div>
                                    <div className="train-llm-launch">
                                          <Rocket size={20} />
                                          <div>
                                                <strong>Ship only after evals beat the baseline.</strong>
                                                <p>Real LLM work is iteration: measure, fix data, resume from checkpoints, and compare every run.</p>
                                          </div>
                                    </div>
                              </ClayCard>
                        </div>
                  </div>
            </Section>
      );
}
