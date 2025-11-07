import { useState } from 'react';
import ColorPicker from '../ColorPicker';

export default function ColorPickerExample() {
  const [color, setColor] = useState('#3B82F6');

  return (
    <div className="p-6">
      <ColorPicker selectedColor={color} onColorChange={setColor} />
    </div>
  );
}
