import { useRef, useEffect, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface NormalizedPoint {
  x: number; // 0-1 range
  y: number; // 0-1 range
}

interface DrawingCanvasProps {
  tool: 'pen' | 'eraser' | 'select' | 'laser';
  color: string;
  strokeWidth: number;
  layerId?: string;
  boardId?: string;
  boardWidth?: number;
  boardHeight?: number;
  strokes?: any[];
  onStrokeComplete?: (stroke: any) => void;
  onDrawingUpdate?: (imageData: string) => void;
}

export default function DrawingCanvas({
  tool,
  color,
  strokeWidth,
  layerId,
  boardId,
  boardWidth = 1920,
  boardHeight = 1080,
  strokes = [],
  onStrokeComplete,
  onDrawingUpdate,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [currentPoints, setCurrentPoints] = useState<NormalizedPoint[]>([]);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  // Convert viewport coordinates to normalized board space [0-1]
  const toBoardSpace = (viewportX: number, viewportY: number): NormalizedPoint => {
    if (!canvasRect) return { x: 0, y: 0 };
    return {
      x: viewportX / canvasRect.width,
      y: viewportY / canvasRect.height,
    };
  };

  // Convert normalized board coordinates to viewport pixels
  const toViewportSpace = (normalizedX: number, normalizedY: number): Point => {
    if (!canvasRect) return { x: 0, y: 0 };
    return {
      x: normalizedX * canvasRect.width,
      y: normalizedY * canvasRect.height,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    setCanvasRect(rect);

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setContext(ctx);

    // Handle resize
    const handleResize = () => {
      const newRect = canvas.getBoundingClientRect();
      setCanvasRect(newRect);
      canvas.width = newRect.width * window.devicePixelRatio;
      canvas.height = newRect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redraw all strokes when they change or canvas resizes
  useEffect(() => {
    if (!context || !canvasRef.current || !canvasRect) return;

    // Clear canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvasRect.width, canvasRect.height);

    // Draw all saved strokes
    strokes.forEach((stroke) => {
      if (!stroke.points || !Array.isArray(stroke.points)) return;

      context.beginPath();
      context.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
      context.lineWidth = stroke.width;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      stroke.points.forEach((point: NormalizedPoint, index: number) => {
        const viewportPoint = toViewportSpace(point.x, point.y);
        if (index === 0) {
          context.moveTo(viewportPoint.x, viewportPoint.y);
        } else {
          context.lineTo(viewportPoint.x, viewportPoint.y);
        }
      });

      context.stroke();
    });
  }, [strokes, context, canvasRect]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || tool === 'select' || !canvasRect) return;
    setIsDrawing(true);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalized = toBoardSpace(x, y);
    setCurrentPoints([normalized]);

    context.beginPath();
    context.moveTo(x, y);
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    context.lineWidth = strokeWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || tool === 'select' || !canvasRect) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalized = toBoardSpace(x, y);
    setCurrentPoints(prev => [...prev, normalized]);

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && context && currentPoints.length > 0) {
      context.closePath();
      setIsDrawing(false);

      // Save the stroke with normalized coordinates
      if (onStrokeComplete && layerId) {
        onStrokeComplete({
          layerId,
          tool,
          color,
          width: strokeWidth,
          points: currentPoints, // Already normalized
        });
      }

      setCurrentPoints([]);

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
