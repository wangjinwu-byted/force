import StickyNote from '../StickyNote';

export default function StickyNoteExample() {
  return (
    <div className="p-6 relative h-96">
      <StickyNote
        id="note-1"
        content="Remember to finalize designs by Friday!"
        color="yellow"
        x={20}
        y={20}
        onContentChange={(id, content) => console.log('Content changed:', id, content)}
        onDelete={(id) => console.log('Delete note:', id)}
      />
    </div>
  );
}
