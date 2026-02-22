import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export default function ThemeToggle() {
      const { theme, dispatch } = useTheme();
      const isDark = theme === 'dark';

      return (
            <motion.button
                  className="theme-toggle"
                  onClick={() => dispatch({ type: 'TOGGLE' })}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
            >
                  <motion.div
                        key={theme}
                        initial={{ rotate: -180, scale: 0, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: 180, scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  </motion.div>
            </motion.button>
      );
}
