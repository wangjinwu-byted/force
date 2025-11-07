import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyNoteProps {
  id: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green';
  x: number;
  y: number;
  onContentChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

const colorClasses = {
  yellow: 'bg-yellow-200 dark:bg-yellow-900/50',
  pink: 'bg-pink-200 dark:bg-pink-900/50',
  blue: 'bg-blue-200 dark:bg-blue-900/50',
  green: 'bg-green-200 dark:bg-green-900/50',
};

export default function StickyNote({ id, content, color, x, y, onContentChange, onDelete }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      className={`absolute w-48 min-h-48 rounded-lg shadow-lg ${colorClasses[color]}`}
      style={{ left: x, top: y }}
      data-testid={`sticky-note-${id}`}
    >
      <div className="h-8 px-2 flex items-center justify-between cursor-move border-b border-black/10">
        <div className="flex-1" />
        <Button
          size="icon"
          variant="ghost"
          className="w-6 h-6"
          onClick={() => onDelete(id)}
          data-testid={`button-delete-note-${id}`}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      <textarea
        value={content}
        onChange={(e) => onContentChange(id, e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        placeholder="Type a note..."
        className={`w-full h-40 p-3 bg-transparent resize-none outline-none text-sm ${colorClasses[color]}`}
        data-testid={`textarea-note-${id}`}
      />
    </div>
  );
}
