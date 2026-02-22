import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './SectionHeader.css';

export default function SectionHeader({ title, description, emoji }) {
      const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });

      return (
            <div ref={ref} className="section-header">
                  <motion.h2
                        className="section-header__title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  >
                        {emoji && <span className="section-header__emoji">{emoji}</span>}
                        {title}
                  </motion.h2>
                  {description && (
                        <motion.p
                              className="section-header__desc"
                              initial={{ opacity: 0, y: 20 }}
                              animate={isVisible ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
                        >
                              {description}
                        </motion.p>
                  )}
            </div>
      );
}
