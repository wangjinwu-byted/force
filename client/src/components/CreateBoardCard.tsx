import { Plus } from 'lucide-react';

interface CreateBoardCardProps {
  onCreate: () => void;
}

export default function CreateBoardCard({ onCreate }: CreateBoardCardProps) {
  return (
    <div
      className="group cursor-pointer rounded-lg border border-dashed overflow-hidden hover-elevate active-elevate-2"
      onClick={onCreate}
      data-testid="button-create-board"
    >
      <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-muted/30">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
          <Plus className="w-6 h-6" />
        </div>
        <span className="font-medium">Create New Board</span>
      </div>
    </div>
  );
}
