import LayerItem from '../LayerItem';

export default function LayerItemExample() {
  return (
    <div className="p-6 max-w-md">
      <LayerItem
        id="layer-1"
        name="Background Layer"
        visible={true}
        opacity={85}
        onToggleVisibility={(id) => console.log('Toggle visibility:', id)}
        onOpacityChange={(id, opacity) => console.log('Opacity changed:', id, opacity)}
        onDelete={(id) => console.log('Delete layer:', id)}
      />
    </div>
  );
}
