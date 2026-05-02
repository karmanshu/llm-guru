import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './Section.css';

export default function Section({ id, alt, children, className = '' }) {
      const [ref, isVisible] = useIntersectionObserver({ threshold: 0.05 });

      return (
            <motion.section
                  ref={ref}
                  id={id}
                  className={`section ${alt ? 'section--alt' : ''} ${className}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
                  <div className="section__container">
                        {children}
                  </div>
            </motion.section>
      );
}
