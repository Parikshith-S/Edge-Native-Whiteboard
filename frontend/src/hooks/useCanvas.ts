import { useRef, useEffect } from 'react';
import type { DrawPoint, DrawStroke } from '../types/index.ts';
import { v4 as uuidv4 } from 'uuid';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use Refs for mutable state to avoid closure staleness issues
  const isDrawing = useRef(false);
  const currentStroke = useRef<DrawStroke | null>(null);

  // Helper: Get coordinates relative to canvas
  const getPoint = (e: React.MouseEvent<HTMLCanvasElement>): DrawPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getPoint(e);
    isDrawing.current = true;

    currentStroke.current = {
      id: uuidv4(),
      points: [point],
      color: '#000000',
      strokeWidth: 2,
    };

    // Begin path immediately
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const newPoint = getPoint(e);

    // Add point to our data structure
    currentStroke.current.points.push(newPoint);

    // Draw visually
    ctx.lineWidth = currentStroke.current.strokeWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentStroke.current.color;

    ctx.lineTo(newPoint.x, newPoint.y);
    ctx.stroke();

    // Optimization: Smoother lines by restarting path for next segment
    ctx.beginPath();
    ctx.moveTo(newPoint.x, newPoint.y);
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;

    isDrawing.current = false;

    // Close the path visually
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
    }

    // In Phase 3, we will emit `currentStroke.current` to WebSocket here
    currentStroke.current = null;
  };

  // Initialize Canvas size and fill with white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');

      // Set actual canvas size to match display size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Fill canvas with white background
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Refill with white after resize
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return {
    canvasRef,
    startDrawing,
    draw,
    stopDrawing,
  };
};