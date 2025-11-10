import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import BoardCard from '@/components/BoardCard';
import CreateBoardCard from '@/components/CreateBoardCard';
import CreateBoardDialog from '@/components/CreateBoardDialog';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import type { Board } from '@shared/schema';

export default function BoardLobby() {
  const [, setLocation] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: boards = [], isLoading } = useQuery<Board[]>({
    queryKey: ['/api/boards'],
  });

  const createBoardMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest('POST', '/api/boards', { name });
      return await res.json();
    },
    onSuccess: (board: Board) => {
      queryClient.invalidateQueries({ queryKey: ['/api/boards'] });
      setLocation(`/board/${board.id}`);
    },
  });

  const handleCreateBoard = (name: string) => {
    createBoardMutation.mutate(name);
  };

  const handleOpenBoard = (id: string) => {
    setLocation(`/board/${id}`);
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <CreateBoardCard onCreate={() => setShowCreateDialog(true)} />
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                id={board.id}
                name={board.name}
                thumbnail={board.thumbnail || '/placeholder-board.png'}
                activeUsers={(board as any).activeUsers || 0}
                lastModified={getRelativeTime(board.updatedAt)}
                onOpen={handleOpenBoard}
              />
            ))}
          </div>
        )}
      </main>

      <CreateBoardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateBoard}
      />
    </div>
  );
}
