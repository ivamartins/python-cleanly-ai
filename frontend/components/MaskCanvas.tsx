'use client';

import React, { useRef, useState, useEffect } from 'react';

interface MaskCanvasProps {
  backgroundImage: string | null;
  onMaskChange: (base64: string) => void;
}

type Tool = 'brush' | 'eraser';

const MaskCanvas: React.FC<MaskCanvasProps> = ({ backgroundImage, onMaskChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(25);
  const [tool, setTool] = useState<Tool>('brush');
  const [maskOpacity, setMaskOpacity] = useState(0.55);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Load background image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = `rgba(0, 0, 0, ${maskOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialState]);
    };
    img.src = backgroundImage;
  }, [backgroundImage]);

  // Update overlay when opacity changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = `rgba(0, 0, 0, ${maskOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (history.length > 0) {
        ctx.putImageData(history[history.length - 1], 0, 0);
      }
    };
    img.src = backgroundImage;
  }, [maskOpacity]);

  const getMousePos = (e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-9), imageData]);
  };

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'white';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(0, 0, 0, ${maskOpacity})`;
    }

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveToHistory();
    exportMask();
  };

  const exportMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      const isBrush = alpha < 128;
      data[i] = isBrush ? 255 : 0;
      data[i + 1] = isBrush ? 255 : 0;
      data[i + 2] = isBrush ? 255 : 0;
      data[i + 3] = 255;
    }

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.putImageData(imageData, 0, 0);
    const maskBase64 = maskCanvas.toDataURL('image/png');
    onMaskChange(maskBase64);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    const lastState = newHistory[newHistory.length - 1];
    ctx.putImageData(lastState, 0, 0);
    exportMask();
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = `rgba(0, 0, 0, ${maskOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialState]);
      onMaskChange('');
    };
    img.src = backgroundImage;
  };

  if (!backgroundImage) {
    return (
      <div className="w-full max-w-[600px] aspect-square bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-500 rounded-xl">
        Upload an image to start drawing the mask
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="flex gap-2">
          <button
            onClick={() => setTool('brush')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tool === 'brush' ? 'bg-white text-black' : 'bg-zinc-800 hover:bg-zinc-700'}`}
          >
            Brush
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tool === 'eraser' ? 'bg-white text-black' : 'bg-zinc-800 hover:bg-zinc-700'}`}
          >
            Eraser
          </button>
        </div>

        <div className="h-6 w-px bg-zinc-700" />

        <div className="flex items-center gap-3 text-sm">
          <span>Size:</span>
          <input
            type="range"
            min="5"
            max="80"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-28 accent-white"
          />
          <span className="w-8 text-right">{brushSize}px</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span>Opacity:</span>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={maskOpacity}
            onChange={(e) => setMaskOpacity(Number(e.target.value))}
            className="w-28 accent-white"
          />
          <span className="w-8 text-right">{Math.round(maskOpacity * 100)}%</span>
        </div>

        <div className="flex-1" />

        <button
          onClick={undo}
          disabled={history.length <= 1}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm disabled:opacity-40"
        >
          Undo
        </button>
        <button
          onClick={clearMask}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="border border-zinc-700 rounded-2xl overflow-hidden bg-black inline-block shadow-2xl">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
        />
      </div>

      <p className="text-xs text-zinc-500 text-center max-w-md mx-auto">
        Paint over the watermark areas. Use the brush to remove and eraser to correct.
      </p>
    </div>
  );
};

export default MaskCanvas;
