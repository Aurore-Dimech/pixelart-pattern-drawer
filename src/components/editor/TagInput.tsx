"use client";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter((t) => t.length > 0);
}

export function TagInput({ value, onChange }: TagInputProps) {
  const count = parseTags(value).length;
  const overLimit = count > 3;

  return (
    <div className="flex items-center gap-3 px-5 py-3 border-t border-gray-200 bg-white">
      <label htmlFor="drawing-tags" className="text-sm font-medium text-gray-600 whitespace-nowrap">
        Tags
      </label>
      <div className="flex-1 flex items-center gap-2">
        <input
          id="drawing-tags"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="nature, espace, fantasy (séparés par des virgules)"
          aria-describedby="tags-hint"
          className={`flex-1 bg-gray-50 border rounded-xl px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
            overLimit
              ? "border-red-300 focus:ring-red-400"
              : "border-gray-200 focus:ring-rose-500"
          }`}
        />
        <span
          id="tags-hint"
          aria-live="polite"
          className={`text-xs font-medium whitespace-nowrap ${overLimit ? "text-red-500" : "text-gray-400"}`}
        >
          {count}/3
        </span>
      </div>
    </div>
  );
}
