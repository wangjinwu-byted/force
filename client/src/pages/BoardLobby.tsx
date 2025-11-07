import { useState } from 'react';
import { useLocation } from 'wouter';
import BoardCard from '@/components/BoardCard';
import CreateBoardCard from '@/components/CreateBoardCard';
import CreateBoardDialog from '@/components/CreateBoardDialog';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

import thumbnail1 from '@assets/generated_images/Blue_purple_abstract_strokes_a25d539a.png';
import thumbnail2 from '@assets/generated_images/Orange_pink_watercolor_strokes_c5f8e792.png';
import thumbnail3 from '@assets/generated_images/Teal_coral_geometric_art_62c4d858.png';
import thumbnail4 from '@assets/generated_images/Green_gold_expressionist_strokes_5b70ce6d.png';

// todo: remove mock functionality
const mockBoards = [
  { id: '1', name: 'Design Sprint 2024', thumbnail: thumbnail1, activeUsers: 3, lastModified: '2 hours ago' },
  { id: '2', name: 'Marketing Campaign', thumbnail: thumbnail2, activeUsers: 1, lastModified: '1 day ago' },
  { id: '3', name: 'Product Wireframes', thumbnail: thumbnail3, activeUsers: 5, lastModified: '3 hours ago' },
  { id: '4', name: 'Team Brainstorm', thumbnail: thumbnail4, activeUsers: 2, lastModified: '5 days ago' },
];

export default function BoardLobby() {
  const [, setLocation] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [boards, setBoards] = useState(mockBoards);

  const handleCreateBoard = (name: string) => {
    const newBoard = {
      id: String(boards.length + 1),
      name,
      thumbnail: [thumbnail1, thumbnail2, thumbnail3, thumbnail4][boards.length % 4],
      activeUsers: 1,
      lastModified: 'Just now',
    };
    setBoards([newBoard, ...boards]);
    setLocation(`/board/${newBoard.id}`);
  };

  const handleOpenBoard = (id: string) => {
    setLocation(`/board/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-semibold" data-testid="text-app-title">SketchBoard</h1>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-new-board">
            New Board
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-2">Your Boards</h2>
          <p className="text-muted-foreground">
            Collaborate in real-time with your team on shared canvases
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CreateBoardCard onCreate={() => setShowCreateDialog(true)} />
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              {...board}
              onOpen={handleOpenBoard}
            />
          ))}
        </div>
      </main>

      <CreateBoardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateBoard}
      />
    </div>
  );
}
