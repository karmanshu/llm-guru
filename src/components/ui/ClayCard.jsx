import { motion } from 'framer-motion';
import './ClayCard.css';

export default function ClayCard({ children, className = '', glow = false, ...props }) {
      return (
            <motion.div
                  className={`clay-card ${glow ? 'clay-card--glow' : ''} ${className}`}
                  whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                  {...props}
            >
                  {children}
            </motion.div>
      );
}
