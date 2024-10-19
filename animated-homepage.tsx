import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Coffee, IceCream } from 'lucide-react';

interface Shape {
  x: number;
  y: number;
  size: number;
  color: string;
  type: 'circle' | 'square' | 'triangle';
  alpha: number;
  vx: number;
  vy: number;
  life: number;
}

const COLORS = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C'];
const SHAPES = ['circle', 'square', 'triangle'];
const NOTES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C4 to C5
const MELODY = [0, 2, 4, 5, 4, 2, 0, 0, 2, 4, 5, 7, 5, 4, 2, 0]; // Simple melody

export default function AnimatedHomepage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastSoundTimeRef = useRef(0);

  const createShape = useCallback((x: number, y: number) => {
    return {
      x,
      y,
      size: Math.random() * 20 + 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      type: SHAPES[Math.floor(Math.random() * SHAPES.length)] as 'circle' | 'square' | 'triangle',
      alpha: 1,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1,
    };
  }, []);

  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.globalAlpha = shape.alpha;
    ctx.fillStyle = shape.color;
    
    switch (shape.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y - shape.size / 2);
        ctx.lineTo(shape.x - shape.size / 2, shape.y + shape.size / 2);
        ctx.lineTo(shape.x + shape.size / 2, shape.y + shape.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapesRef.current = shapesRef.current.filter((shape) => {
      shape.life -= 0.01;
      shape.alpha = Math.pow(shape.life, 2); // 使用平方函数使淡出更加平滑
      shape.size += 0.2;
      shape.x += shape.vx;
      shape.y += shape.vy;
      drawShape(ctx, shape);

      return shape.life > 0;
    });

    requestAnimationFrame(animate);
  }, [drawShape]);

  const playSound = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const now = audioContextRef.current.currentTime;
    const melody = MELODY[Math.floor(Math.random() * MELODY.length)];
    const note = NOTES[melody];

    const oscillator = audioContextRef.current.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(note, now);

    const gainNode = audioContextRef.current.createGain();
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }, []);

  const handleInteraction = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in event) ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = ('touches' in event) ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

    for (let i = 0; i < 3; i++) {
      const newShape = createShape(x, y);
      shapesRef.current.push(newShape);
    }

    const currentTime = Date.now();
    if (currentTime - lastSoundTimeRef.current > 500) {
      playSound();
      lastSoundTimeRef.current = currentTime;
    }
  }, [createShape, playSound]);

  useEffect(() => {
    console.log('Animation started');
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    animate();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [animate]);

  return (
    <div className="relative h-screen overflow-hidden" onMouseMove={handleInteraction} onTouchMove={handleInteraction}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
      <div className="relative z-10 flex flex-col md:flex-row h-full">
        <Link href="/cc-space" className="group relative flex-1 flex items-center justify-center bg-gradient-to-br from-blue-500/60 to-purple-600/60 transition-all duration-500 ease-in-out hover:flex-[1.5]">
          <div className="text-center">
            <Coffee className="mx-auto h-16 w-16 text-white mb-4 transition-transform duration-300 group-hover:scale-125" />
            <h2 className="text-4xl font-bold text-white mb-2">CC的小栈</h2>
            <p className="text-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">点击进入CC的世界</p>
          </div>
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </Link>
        
        <Link href="/tangyuan-space" className="group relative flex-1 flex items-center justify-center bg-gradient-to-br from-pink-500/60 to-yellow-500/60 transition-all duration-500 ease-in-out hover:flex-[1.5]">
          <div className="text-center">
            <IceCream className="mx-auto h-16 w-16 text-white mb-4 transition-transform duration-300 group-hover:scale-125" />
            <h2 className="text-4xl font-bold text-white mb-2">汤圆的小栈</h2>
            <p className="text-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">点击进入汤圆的世界</p>
          </div>
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </Link>
      </div>
    </div>
  );
}