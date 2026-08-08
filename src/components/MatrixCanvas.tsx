import React, { useEffect, useRef } from 'react';

export const MatrixCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const syms = "★☆✦01XYZ✦★✧⚙☼⚡MINESNYOTA".split("");
    const fontSize = 14;
    let columns = Math.floor(window.innerWidth / fontSize) + 1;
    let drops = Array(columns).fill(0).map(() => Math.random() * -100);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(window.innerWidth / fontSize) + 1;
      drops = Array(columns).fill(0).map(() => Math.random() * -100);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.fillStyle = "rgba(3, 6, 18, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = syms[Math.floor(Math.random() * syms.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (i % 3 === 0) {
          ctx.fillStyle = "rgba(0, 210, 255, 0.28)";
        } else if (i % 7 === 0) {
          ctx.fillStyle = "rgba(245, 158, 11, 0.38)";
        } else {
          ctx.fillStyle = "rgba(0, 210, 255, 0.12)";
        }

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.25]"
    />
  );
};
