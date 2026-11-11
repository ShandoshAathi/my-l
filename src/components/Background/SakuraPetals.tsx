import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  swingAngle: number;
  swingSpeed: number;
  opacity: number;
  color: string;
}

export const SakuraPetals: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const petalCount = isMobile ? 22 : 45;
    const colors = theme.petalColors.length > 0 ? theme.petalColors : ['#FFD1DC', '#F8C8DC', '#FFAEC9'];

    const petals: Petal[] = [];

    const createPetal = (initialY = -20): Petal => ({
      x: Math.random() * width,
      y: initialY === -20 ? Math.random() * height : initialY,
      size: Math.random() * 8 + 8,
      speedX: Math.random() * 1.5 - 0.5,
      speedY: Math.random() * 1.2 + 0.8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      swingAngle: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.02 + 0.01,
      opacity: Math.random() * 0.4 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)]
    });

    for (let i = 0; i < petalCount; i++) {
      petals.push(createPetal());
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      // Realistic sakura petal curve
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, 0, p.size / 2, p.size);
      ctx.bezierCurveTo(0, p.size * 0.8, -p.size / 2, p.size, -p.size / 2, 0);
      ctx.bezierCurveTo(-p.size / 2, -p.size / 2, 0, 0, 0, 0);
      ctx.fill();

      ctx.restore();
    };

    const update = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.swingAngle += p.swingSpeed;
        p.x += p.speedX + Math.sin(p.swingAngle) * 0.8;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
          petals[i] = createPetal(-15);
        }

        drawPetal(p);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
      aria-hidden="true"
    />
  );
};
