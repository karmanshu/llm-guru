import { motion } from 'framer-motion';
import './GlassCard.css';

export default function GlassCard({ children, className = '', ...props }) {
      return (
            <motion.div
                  className={`glass-card ${className}`}
                  whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                  {...props}
            >
                  {children}
            </motion.div>
      );
}
