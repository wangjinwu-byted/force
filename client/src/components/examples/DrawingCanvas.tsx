import { useState } from 'react';
import DrawingCanvas from '../DrawingCanvas';

export default function DrawingCanvasExample() {
  const [tool] = useState<'pen' | 'eraser' | 'select' | 'laser'>('pen');

  return (
    <div className="h-96 border rounded-lg overflow-hidden">
      <DrawingCanvas
        tool={tool}
        color="#000000"
        strokeWidth={3}
        onDrawingUpdate={(data) => console.log('Drawing updated')}
      />
    </div>
  );
}
