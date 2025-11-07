import { Check } from 'lucide-react';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const presetColors = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
];

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="p-3 bg-popover border rounded-lg shadow-lg" data-testid="color-picker">
      <div className="grid grid-cols-6 gap-1 mb-3">
        {presetColors.map((color) => (
          <button
            key={color}
            className="w-8 h-8 rounded border hover-elevate active-elevate-2 relative"
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            data-testid={`button-color-${color}`}
          >
            {selectedColor === color && (
              <Check className="w-4 h-4 absolute inset-0 m-auto text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-full h-8 cursor-pointer rounded"
          data-testid="input-color-custom"
        />
      </div>
    </div>
  );
}
