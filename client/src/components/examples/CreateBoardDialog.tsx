import { useState } from 'react';
import CreateBoardDialog from '../CreateBoardDialog';
import { Button } from '@/components/ui/button';

export default function CreateBoardDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <CreateBoardDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={(name) => console.log('Create board:', name)}
      />
    </div>
  );
}
