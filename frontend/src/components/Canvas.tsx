import React, { useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useWebSocket } from '../hooks/useWebSocket';

const Canvas: React.FC = () => {
  const { canvasRef, startDrawing, draw, stopDrawing } = useCanvas();
  // Using 'test-room' for the demo. In a real app, this would be dynamic.
  const { remoteStrokes, sendStroke } = useWebSocket('test-room');

  // Effect to draw remote strokes coming from other users
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    remoteStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

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
        onMouseUp={() => stopDrawing(sendStroke)}
        onMouseLeave={() => stopDrawing(sendStroke)}
        onTouchStart={startDrawing as any} // Basic touch support
        onTouchMove={draw as any}
        onTouchEnd={() => stopDrawing(sendStroke)}
        className="absolute top-0 left-0 touch-none cursor-crosshair"
      />

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm px-5 py-4 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Edge Whiteboard</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium mb-3">● Live Sync Active</p>

          <div className="space-y-1 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">How to use:</span> Click & drag to draw.
            </p>
            <p className="text-xs text-gray-600">
              Open this URL on another device to see it sync in real-time!
            </p>
          </div>
        </div>
      </div>

      {/* Designer Credit */}
      <div className="absolute bottom-4 right-4 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-xs text-gray-400 font-medium">
          Designed by Parikshith Saraswathi
        </p>
      </div>
    </div>
  );
};

export default Canvas;