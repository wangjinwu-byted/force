import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ToolButtonProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  testId?: string;
}

export default function ToolButton({ icon: Icon, label, active = false, onClick, testId }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={active ? "default" : "ghost"}
          onClick={onClick}
          className="w-12 h-12"
          data-testid={testId || `button-tool-${label.toLowerCase()}`}
        >
          <Icon className="w-5 h-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
