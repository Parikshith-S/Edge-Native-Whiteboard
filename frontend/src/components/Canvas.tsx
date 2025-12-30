import React, { useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useWebSocket } from '../hooks/useWebSocket';

const Canvas: React.FC = () => {
  const { canvasRef, startDrawing, draw, stopDrawing } = useCanvas();
  // Hardcoding room 'test-room' for now
  const { remoteStrokes, sendStroke } = useWebSocket('test-room');

  // Effect to draw remote strokes coming from other users
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    remoteStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      // Draw the incoming stroke
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.strokeWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [remoteStrokes]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={() => {
          stopDrawing(sendStroke);
        }}
        onMouseLeave={() => stopDrawing(sendStroke)}
        className="absolute top-0 left-0 touch-none cursor-crosshair"
      />

      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200 pointer-events-none">
        <h1 className="text-sm font-bold text-gray-800">Edge Whiteboard</h1>
        <p className="text-xs text-green-600 font-medium">● Live Sync Active</p>
      </div>
    </div>
  );
};

export default Canvas;