import { TooltipProvider } from '@/components/ui/tooltip';
import ToolButton from '../ToolButton';
import { Pen } from 'lucide-react';

export default function ToolButtonExample() {
  return (
    <TooltipProvider>
      <div className="p-6 flex gap-2">
        <ToolButton icon={Pen} label="Pen" active={true} onClick={() => console.log('Pen clicked')} />
        <ToolButton icon={Pen} label="Eraser" active={false} onClick={() => console.log('Eraser clicked')} />
      </div>
    </TooltipProvider>
  );
}
