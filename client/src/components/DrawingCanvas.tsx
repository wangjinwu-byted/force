import { useRef, useEffect, useState } from 'react';

interface DrawingCanvasProps {
  tool: 'pen' | 'eraser' | 'select' | 'laser';
  color: string;
  strokeWidth: number;
  onDrawingUpdate?: (imageData: string) => void;
}

export default function DrawingCanvas({ tool, color, strokeWidth, onDrawingUpdate }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setContext(ctx);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || tool === 'select') return;
    setIsDrawing(true);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    context.lineWidth = strokeWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || tool === 'select') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && context) {
      context.closePath();
      setIsDrawing(false);
      
      if (onDrawingUpdate && canvasRef.current) {
        onDrawingUpdate(canvasRef.current.toDataURL());
      }
    }
  };

  const getCursorStyle = () => {
    switch (tool) {
      case 'pen':
        return 'crosshair';
      case 'eraser':
        return 'cell';
      case 'laser':
        return 'pointer';
      default:
        return 'default';
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-white"
      style={{ cursor: getCursorStyle() }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      data-testid="canvas-drawing"
    />
  );
}
