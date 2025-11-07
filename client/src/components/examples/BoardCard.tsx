import BoardCard from '../BoardCard';
import thumbnail from '@assets/generated_images/Blue_purple_abstract_strokes_a25d539a.png';

export default function BoardCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <BoardCard
        id="demo-board"
        name="Design Sprint 2024"
        thumbnail={thumbnail}
        activeUsers={3}
        lastModified="2 hours ago"
        onOpen={(id) => console.log('Open board:', id)}
      />
    </div>
  );
}
