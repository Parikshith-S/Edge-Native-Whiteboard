import React from 'react';
import { useCanvas } from '../hooks/useCanvas';

const Canvas: React.FC = () => {
  const { canvasRef, startDrawing, draw, stopDrawing } = useCanvas();

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="absolute top-0 left-0 touch-none cursor-crosshair"
      />

      {/* Floating Instructions */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200 pointer-events-none">
        <h1 className="text-sm font-bold text-gray-800">Edge Whiteboard</h1>
        <p className="text-xs text-gray-500">Draw freely (Local Mode)</p>
      </div>
    </div>
  );
};

export default Canvas;
