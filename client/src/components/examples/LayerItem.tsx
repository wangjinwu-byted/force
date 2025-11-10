import LayerItem from '../LayerItem';

export default function LayerItemExample() {
  return (
    <div className="p-6 max-w-md space-y-2">
      <LayerItem
        id="layer-1"
        name="Background Layer"
        visible={true}
        opacity={85}
        active={true}
        onSelect={(id) => console.log('Select layer:', id)}
        onToggleVisibility={(id) => console.log('Toggle visibility:', id)}
        onOpacityChange={(id, opacity) => console.log('Opacity changed:', id, opacity)}
        onDelete={(id) => console.log('Delete layer:', id)}
      />
      <LayerItem
        id="layer-2"
        name="Sketch Layer"
        visible={true}
        opacity={100}
        active={false}
        onSelect={(id) => console.log('Select layer:', id)}
        onToggleVisibility={(id) => console.log('Toggle visibility:', id)}
        onOpacityChange={(id, opacity) => console.log('Opacity changed:', id, opacity)}
        onDelete={(id) => console.log('Delete layer:', id)}
      />
    </div>
  );
}
