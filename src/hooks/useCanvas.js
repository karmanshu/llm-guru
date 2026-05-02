import { useRef, useEffect, useCallback } from 'react';

export function useCanvas(draw) {
  const canvasRef = useRef(null);
  const animIdRef = useRef(null);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height, dpr };
  }, []);

  useEffect(() => {
    const result = setupCanvas();
    if (!result) return;
    const cleanup = draw(canvasRef.current, result.ctx, result.width, result.height);

    const handleResize = () => {
      const r = setupCanvas();
      if (r) draw(canvasRef.current, r.ctx, r.width, r.height);
    };

    let timer;
    const debouncedResize = () => {
      clearTimeout(timer);
      timer = setTimeout(handleResize, 200);
    };
    window.addEventListener('resize', debouncedResize, { passive: true });

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const animId = animIdRef.current;
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timer);
      if (animId) cancelAnimationFrame(animId);
      if (typeof cleanup === 'function') cleanup();
    };
  }, [draw, setupCanvas]);

  return { canvasRef, animIdRef, setupCanvas };
}
