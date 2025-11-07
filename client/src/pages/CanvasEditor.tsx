import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import {
  MousePointer2,
  Pen,
  Eraser,
  Square,
  Type,
  StickyNote as StickyNoteIcon,
  Pointer,
  Settings,
  ChevronLeft,
  Share2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import ToolButton from '@/components/ToolButton';
import LayerItem from '@/components/LayerItem';
import StickyNote from '@/components/StickyNote';
import ColorPicker from '@/components/ColorPicker';
import DrawingCanvas from '@/components/DrawingCanvas';

type Tool = 'select' | 'pen' | 'eraser' | 'shape' | 'text' | 'sticky' | 'laser';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
}

interface Note {
  id: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green';
  x: number;
  y: number;
}

export default function CanvasEditor() {
  const [match, params] = useRoute('/board/:id');
  const [, setLocation] = useLocation();
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // todo: remove mock functionality
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Background', visible: true, opacity: 100 },
    { id: '2', name: 'Sketch Layer', visible: true, opacity: 85 },
  ]);

  const [notes, setNotes] = useState<Note[]>([
    { id: '1', content: 'Great idea!', color: 'yellow', x: 100, y: 100 },
  ]);

  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
    if (tool === 'pen') {
      setShowColorPicker(!showColorPicker);
    } else {
      setShowColorPicker(false);
    }
  };

  const handleToggleLayerVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const handleLayerOpacityChange = (id: string, opacity: number) => {
    setLayers(layers.map(l => l.id === id ? { ...l, opacity } : l));
  };

  const handleDeleteLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
  };

  const handleAddLayer = () => {
    const newLayer: Layer = {
      id: String(layers.length + 1),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 100,
    };
    setLayers([...layers, newLayer]);
  };

  const handleNoteContentChange = (id: string, content: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content } : n));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  if (!match) return null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg" data-testid="text-board-name">
            Design Sprint 2024
          </h1>
          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">Saved</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2" data-testid="active-users">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center text-xs text-primary-foreground font-medium"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <Button variant="outline" data-testid="button-share">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-16 border-r bg-card flex flex-col items-center py-4 gap-2">
          <ToolButton
            icon={MousePointer2}
            label="Select"
            active={activeTool === 'select'}
            onClick={() => handleToolSelect('select')}
          />
          <ToolButton
            icon={Pen}
            label="Pen"
            active={activeTool === 'pen'}
            onClick={() => handleToolSelect('pen')}
          />
          <ToolButton
            icon={Eraser}
            label="Eraser"
            active={activeTool === 'eraser'}
            onClick={() => handleToolSelect('eraser')}
          />
          <ToolButton
            icon={Square}
            label="Shapes"
            active={activeTool === 'shape'}
            onClick={() => handleToolSelect('shape')}
          />
          <ToolButton
            icon={Type}
            label="Text"
            active={activeTool === 'text'}
            onClick={() => handleToolSelect('text')}
          />
          <ToolButton
            icon={StickyNoteIcon}
            label="Sticky Note"
            active={activeTool === 'sticky'}
            onClick={() => handleToolSelect('sticky')}
          />
          <ToolButton
            icon={Pointer}
            label="Laser Pointer"
            active={activeTool === 'laser'}
            onClick={() => handleToolSelect('laser')}
          />

          <div className="flex-1" />
          <Separator />
          <ToolButton
            icon={Settings}
            label="Settings"
            onClick={() => console.log('Settings')}
          />
        </aside>

        <main className="flex-1 relative overflow-hidden">
          {showColorPicker && (
            <div className="absolute top-4 left-4 z-10">
              <ColorPicker selectedColor={color} onColorChange={setColor} />
            </div>
          )}

          {activeTool === 'pen' && (
            <div className="absolute top-4 left-4 z-10 p-3 bg-popover border rounded-lg shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium">Stroke</span>
                <Slider
                  value={[strokeWidth]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={(value) => setStrokeWidth(value[0])}
                  className="w-32"
                  data-testid="slider-stroke-width"
                />
                <span className="text-sm text-muted-foreground w-8">{strokeWidth}px</span>
              </div>
              <ColorPicker selectedColor={color} onColorChange={setColor} />
            </div>
          )}

          <div className="absolute bottom-4 right-4 z-10 text-xs text-muted-foreground px-2 py-1 bg-popover border rounded">
            100%
          </div>

          <DrawingCanvas
            tool={activeTool === 'pen' ? 'pen' : activeTool === 'eraser' ? 'eraser' : activeTool === 'laser' ? 'laser' : 'select'}
            color={color}
            strokeWidth={strokeWidth}
          />

          {notes.map((note) => (
            <StickyNote
              key={note.id}
              {...note}
              onContentChange={handleNoteContentChange}
              onDelete={handleDeleteNote}
            />
          ))}
        </main>

        <aside className="w-64 border-l bg-card flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-3">Layers</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {layers.map((layer) => (
                <LayerItem
                  key={layer.id}
                  {...layer}
                  onToggleVisibility={handleToggleLayerVisibility}
                  onOpacityChange={handleLayerOpacityChange}
                  onDelete={handleDeleteLayer}
                />
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={handleAddLayer}
              data-testid="button-add-layer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Layer
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
