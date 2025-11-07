import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
}

export default function CreateBoardDialog({ open, onOpenChange, onCreate }: CreateBoardDialogProps) {
  const [boardName, setBoardName] = useState('');

  const handleCreate = () => {
    if (boardName.trim()) {
      onCreate(boardName);
      setBoardName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-create-board">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Give your board a name to get started with collaborative drawing.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="board-name" className="mb-2 block">Board Name</Label>
          <Input
            id="board-name"
            placeholder="e.g., Design Sprint 2024"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            data-testid="input-board-name"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!boardName.trim()} data-testid="button-create">
            Create Board
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
