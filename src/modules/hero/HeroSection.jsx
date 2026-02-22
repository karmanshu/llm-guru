import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';
import './HeroSection.css';

export default function HeroSection() {
      const canvasRef = useRef(null);

      useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            let animId;

            const nodes = Array.from({ length: 40 }, () => ({
                  x: Math.random(),
                  y: Math.random(),
                  vx: (Math.random() - 0.5) * 0.0003,
                  vy: (Math.random() - 0.5) * 0.0003,
                  r: Math.random() * 2 + 1,
            }));

            function resize() {
                  const rect = canvas.getBoundingClientRect();
                  canvas.width = rect.width * dpr;
                  canvas.height = rect.height * dpr;
                  ctx.scale(dpr, dpr);
            }
            resize();

            function draw() {
                  const w = canvas.width / dpr;
                  const h = canvas.height / dpr;
                  ctx.clearRect(0, 0, w, h);

                  nodes.forEach(n => {
                        n.x += n.vx;
                        n.y += n.vy;
                        if (n.x < 0 || n.x > 1) n.vx *= -1;
                        if (n.y < 0 || n.y > 1) n.vy *= -1;
                  });

                  // Draw connections
                  for (let i = 0; i < nodes.length; i++) {
                        for (let j = i + 1; j < nodes.length; j++) {
                              const dx = (nodes[i].x - nodes[j].x) * w;
                              const dy = (nodes[i].y - nodes[j].y) * h;
                              const dist = Math.sqrt(dx * dx + dy * dy);
                              if (dist < 120) {
                                    ctx.beginPath();
                                    ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
                                    ctx.lineTo(nodes[j].x * w, nodes[j].y * h);
                                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 120)})`;
                                    ctx.lineWidth = 0.5;
                                    ctx.stroke();
                              }
                        }
                  }

                  // Draw nodes
                  nodes.forEach(n => {
                        const x = n.x * w;
                        const y = n.y * h;
                        const grad = ctx.createRadialGradient(x, y, 0, x, y, n.r * 3);
                        grad.addColorStop(0, 'rgba(139, 92, 246, 0.6)');
                        grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
                        ctx.beginPath();
                        ctx.arc(x, y, n.r * 3, 0, Math.PI * 2);
                        ctx.fillStyle = grad;
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(x, y, n.r, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(192, 132, 252, 0.8)';
                        ctx.fill();
                  });

                  animId = requestAnimationFrame(draw);
            }
            draw();

            let timer;
            const handleResize = () => { clearTimeout(timer); timer = setTimeout(resize, 200); };
            window.addEventListener('resize', handleResize, { passive: true });

            return () => {
                  cancelAnimationFrame(animId);
                  clearTimeout(timer);
                  window.removeEventListener('resize', handleResize);
            };
      }, []);

      const scrollToSection = (id) => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      };

      const stagger = {
            hidden: {},
            show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
      };
      const fadeUp = {
            hidden: { opacity: 0, y: 40 },
            show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } },
      };

      return (
            <section id="hero" className="hero">
                  <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
                  <div className="hero__gradient" />

                  <motion.div
                        className="hero__content"
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                  >
                        <motion.h1 className="hero__title" variants={fadeUp}>
                              How Do LLMs Work?
                        </motion.h1>
                        <motion.p className="hero__subtitle" variants={fadeUp}>
                              Discover the fascinating technology behind ChatGPT, Claude, and the AI revolution
                              — through interactive visualizations and hands-on demos.
                        </motion.p>
                        <motion.div className="hero__cta" variants={fadeUp}>
                              <Button variant="primary" onClick={() => scrollToSection('what-is-llm')}>
                                    <Sparkles size={18} /> Start Learning
                              </Button>
                              <Button variant="secondary" onClick={() => scrollToSection('tokenizer')}>
                                    <BookOpen size={18} /> Try Interactive Demo
                              </Button>
                        </motion.div>
                  </motion.div>

                  <motion.div
                        className="hero__scroll-hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                  >
                        <ChevronDown size={24} className="hero__chevron" />
                  </motion.div>
            </section>
      );
}
