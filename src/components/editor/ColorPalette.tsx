"use client";

export const DEFAULT_PALETTE = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00",
  "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#FF8800", "#8800FF", "#00FF88", "#FF0088",
  "#888888", "#884400", "#004488", "#448800",
];

interface ColorPaletteProps {
  activeColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPalette({ activeColor, onColorSelect }: ColorPaletteProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Palette</p>
      <div className="grid grid-cols-4 gap-1">
        {DEFAULT_PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
              activeColor === color
                ? "border-indigo-500 scale-110"
                : "border-gray-300"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <label className="text-xs text-gray-500">Couleur libre</label>
        <input
          type="color"
          value={activeColor}
          onChange={(e) => onColorSelect(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-300"
        />
      </div>
    </div>
  );
}