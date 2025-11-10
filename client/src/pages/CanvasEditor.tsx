import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/hooks/useWebSocket';
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
import { useToast } from '@/hooks/use-toast';
import ToolButton from '@/components/ToolButton';
import LayerItem from '@/components/LayerItem';
import StickyNote from '@/components/StickyNote';
import ColorPicker from '@/components/ColorPicker';
import DrawingCanvas from '@/components/DrawingCanvas';
import type { Board, Layer, StickyNote as Note } from '@shared/schema';

type Tool = 'select' | 'pen' | 'eraser' | 'shape' | 'text' | 'sticky' | 'laser';

export default function CanvasEditor() {
  const [match, params] = useRoute('/board/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const boardId = params?.id || null;
  const { isConnected, activeUsers, send, on, off } = useWebSocket(boardId);

  const { data: board } = useQuery<Board>({
    queryKey: ['/api/boards', boardId],
    enabled: !!boardId,
  });

  const { data: layers = [], refetch: refetchLayers } = useQuery<Layer[]>({
    queryKey: ['/api/boards', boardId, 'layers'],
    enabled: !!boardId,
  });

  const { data: notes = [], refetch: refetchNotes } = useQuery<Note[]>({
    queryKey: ['/api/boards', boardId, 'notes'],
    enabled: !!boardId,
  });

  const createLayerMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest('POST', `/api/boards/${boardId}/layers`, {
        name,
        visible: true,
        opacity: 100,
        order: layers.length,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boards', boardId, 'layers'] });
    },
  });

  const updateLayerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Layer> }) => {
      const res = await apiRequest('PATCH', `/api/layers/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boards', boardId, 'layers'] });
    },
  });

  const deleteLayerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/layers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boards', boardId, 'layers'] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Note> }) => {
      const res = await apiRequest('PATCH', `/api/notes/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boards', boardId, 'notes'] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boards', boardId, 'notes'] });
    },
  });

  useEffect(() => {
    if (!isConnected) return;

    const handleLayerUpdate = (data: any) => {
      refetchLayers();
    };

    const handleNoteUpdate = (data: any) => {
      refetchNotes();
    };

    const handleUserJoined = () => {
      toast({
        title: 'User joined',
        description: 'A new user joined the board',
        duration: 2000,
      });
    };

    const handleUserLeft = () => {
      toast({
        title: 'User left',
        description: 'A user left the board',
        duration: 2000,
      });
    };

    on('layer_update', handleLayerUpdate);
    on('note_update', handleNoteUpdate);
    on('user_joined', handleUserJoined);
    on('user_left', handleUserLeft);

    return () => {
      off('layer_update');
      off('note_update');
      off('user_joined');
      off('user_left');
    };
  }, [isConnected, on, off, refetchLayers, refetchNotes, toast]);

  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
    if (tool === 'pen') {
      setShowColorPicker(!showColorPicker);
    } else {
      setShowColorPicker(false);
    }
  };

  const handleToggleLayerVisibility = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      updateLayerMutation.mutate({
        id,
        data: { visible: !layer.visible },
      });
      send('layer_update', { id, visible: !layer.visible });
    }
  };

  const handleLayerOpacityChange = (id: string, opacity: number) => {
    updateLayerMutation.mutate({
      id,
      data: { opacity },
    });
    send('layer_update', { id, opacity });
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) {
      toast({
        title: 'Cannot delete layer',
        description: 'You must have at least one layer',
        variant: 'destructive',
      });
      return;
    }
    deleteLayerMutation.mutate(id);
  };

  const handleAddLayer = () => {
    createLayerMutation.mutate(`Layer ${layers.length + 1}`);
  };

  const handleNoteContentChange = (id: string, content: string) => {
    updateNoteMutation.mutate({
      id,
      data: { content },
    });
    send('note_update', { id, content });
  };

  const handleDeleteNote = (id: string) => {
    deleteNoteMutation.mutate(id);
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
            {board?.name || 'Loading...'}
          </h1>
          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2" data-testid="active-users">
            {activeUsers.slice(0, 5).map((userId, i) => (
              <div
                key={userId}
                className="w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center text-xs text-primary-foreground font-medium"
              >
                {String.fromCharCode(65 + (i % 26))}
              </div>
            ))}
            {activeUsers.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                +{activeUsers.length - 5}
              </div>
            )}
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
              id={note.id}
              content={note.content}
              color={note.color as 'yellow' | 'pink' | 'blue' | 'green'}
              x={note.x}
              y={note.y}
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
                  id={layer.id}
                  name={layer.name}
                  visible={layer.visible}
                  opacity={layer.opacity}
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
