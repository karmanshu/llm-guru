import { lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ThemeToggle from './components/ui/ThemeToggle';
import HeroSection from './modules/hero/HeroSection';

// Lazy load heavy modules for performance
const WhatIsLLM = lazy(() => import('./modules/intro/WhatIsLLM'));
const TokenizerModule = lazy(() => import('./modules/tokenizer/TokenizerModule'));
const EmbeddingsModule = lazy(() => import('./modules/embeddings/EmbeddingsModule'));
const PositionalModule = lazy(() => import('./modules/positional/PositionalModule'));
const NeuralModule = lazy(() => import('./modules/neural/NeuralModule'));
const TransformerModule = lazy(() => import('./modules/transformer/TransformerModule'));
const AttentionModule = lazy(() => import('./modules/attention/AttentionModule'));
const ContextModule = lazy(() => import('./modules/context/ContextModule'));
const PredictorModule = lazy(() => import('./modules/predictor/PredictorModule'));
const TrainingModule = lazy(() => import('./modules/training/TrainingModule'));
const ParametersModule = lazy(() => import('./modules/parameters/ParametersModule'));
const LimitationsModule = lazy(() => import('./modules/limitations/LimitationsModule'));
const SafetyModule = lazy(() => import('./modules/safety/SafetyModule'));

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
    }}>
      <div className="loading-spinner" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      {/* Ambient background glow system */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-bg__blob ambient-bg__blob--1" />
        <div className="ambient-bg__blob ambient-bg__blob--2" />
        <div className="ambient-bg__blob ambient-bg__blob--3" />
      </div>
      <div className="noise-overlay" aria-hidden="true" />

      <a href="#what-is-llm" className="skip-link">Skip to content</a>
      <Navbar />
      <ThemeToggle />

      <main>
        <HeroSection />
        <Suspense fallback={<LoadingFallback />}>
          <WhatIsLLM />
          <TokenizerModule />
          <EmbeddingsModule />
          <PositionalModule />
          <NeuralModule />
          <TransformerModule />
          <AttentionModule />
          <ContextModule />
          <PredictorModule />
          <TrainingModule />
          <ParametersModule />
          <LimitationsModule />
          <SafetyModule />
        </Suspense>
      </main>

      <Footer />
    </ThemeProvider>
  );
}
