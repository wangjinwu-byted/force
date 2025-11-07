interface BoardCardProps {
  id: string;
  name: string;
  thumbnail: string;
  activeUsers: number;
  lastModified: string;
  onOpen: (id: string) => void;
}

export default function BoardCard({ id, name, thumbnail, activeUsers, lastModified, onOpen }: BoardCardProps) {
  return (
    <div
      className="group cursor-pointer rounded-lg border overflow-hidden hover-elevate active-elevate-2"
      onClick={() => onOpen(id)}
      data-testid={`card-board-${id}`}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={thumbnail}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-4 py-2 bg-background/90 backdrop-blur-sm rounded-md text-sm font-medium">
              Open Board
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2" data-testid={`text-board-name-${id}`}>{name}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {Array.from({ length: Math.min(activeUsers, 3) }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-primary border-2 border-background flex items-center justify-center text-[10px] text-primary-foreground font-medium"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span data-testid={`text-active-users-${id}`}>{activeUsers} active</span>
          </div>
          <span className="text-xs" data-testid={`text-last-modified-${id}`}>{lastModified}</span>
        </div>
      </div>
    </div>
  );
}
