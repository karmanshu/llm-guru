import { createContext, useContext, useReducer, useEffect } from 'react';

/* eslint-disable react-refresh/only-export-components */

const ThemeContext = createContext(null);

function themeReducer(state, action) {
      switch (action.type) {
            case 'TOGGLE':
                  return { theme: state.theme === 'dark' ? 'light' : 'dark' };
            case 'SET':
                  return { theme: action.payload };
            default:
                  return state;
      }
}

function getInitialTheme() {
      try {
            const stored = localStorage.getItem('llm-guru-theme');
            if (stored === 'light' || stored === 'dark') return stored;
      } catch { /* ignore */ }
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
      return 'dark';
}

export function ThemeProvider({ children }) {
      const [state, dispatch] = useReducer(themeReducer, { theme: getInitialTheme() });

      useEffect(() => {
            document.documentElement.setAttribute('data-theme', state.theme);
            try { localStorage.setItem('llm-guru-theme', state.theme); } catch { /* ignore */ }
      }, [state.theme]);

      useEffect(() => {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e) => {
                  try {
                        if (!localStorage.getItem('llm-guru-theme')) {
                              dispatch({ type: 'SET', payload: e.matches ? 'dark' : 'light' });
                        }
                  } catch { /* ignore */ }
            };
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
      }, []);

      return (
            <ThemeContext.Provider value={{ theme: state.theme, dispatch }}>
                  {children}
            </ThemeContext.Provider>
      );
}

export function useTheme() {
      const context = useContext(ThemeContext);
      if (!context) throw new Error('useTheme must be used within ThemeProvider');
      return context;
}
