import { motion } from 'framer-motion';
import './Button.css';

export default function Button({
      children, variant = 'primary', onClick, disabled, className = '', ...props
}) {
      return (
            <motion.button
                  className={`btn btn--${variant} ${className}`}
                  onClick={onClick}
                  disabled={disabled}
                  whileHover={!disabled ? { y: -2 } : {}}
                  whileTap={!disabled ? { scale: 0.96 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  {...props}
            >
                  {children}
            </motion.button>
      );
}
