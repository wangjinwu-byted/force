import { Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface LayerItemProps {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  onToggleVisibility: (id: string) => void;
  onOpacityChange: (id: string, opacity: number) => void;
  onDelete: (id: string) => void;
}

export default function LayerItem({
  id,
  name,
  visible,
  opacity,
  onToggleVisibility,
  onOpacityChange,
  onDelete,
}: LayerItemProps) {
  return (
    <div className="group p-3 rounded-md border bg-card hover-elevate" data-testid={`layer-item-${id}`}>
      <div className="flex items-center gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
        <div className="w-10 h-10 rounded border bg-muted flex-shrink-0" />
        <span className="text-sm font-medium flex-1 truncate" data-testid={`text-layer-name-${id}`}>{name}</span>
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 opacity-0 group-hover:opacity-100"
          onClick={() => onToggleVisibility(id)}
          data-testid={`button-toggle-visibility-${id}`}
        >
          {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 opacity-0 group-hover:opacity-100"
          onClick={() => onDelete(id)}
          data-testid={`button-delete-layer-${id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 pl-6">
        <span className="text-xs text-muted-foreground w-12">Opacity</span>
        <Slider
          value={[opacity]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => onOpacityChange(id, value[0])}
          className="flex-1"
          data-testid={`slider-opacity-${id}`}
        />
        <span className="text-xs text-muted-foreground w-8 text-right">{opacity}%</span>
      </div>
    </div>
  );
}
