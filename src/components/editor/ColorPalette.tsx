"use client";

import { useState } from "react";
import { DEFAULT_PALETTE } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

interface ColorPaletteProps {
  activeColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPalette({ activeColor, onColorSelect }: ColorPaletteProps) {
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [isCustom, setIsCustom] = useState(false);
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const suggestPalette = async () => {
    if (!theme.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        if (json.fallback) {
          setPalette(DEFAULT_PALETTE);
          setIsCustom(false);
          toast("API indisponible — palette par défaut utilisée", "info");
        } else {
          setPalette([...json.data, ...DEFAULT_PALETTE].slice(0, 16));
          setIsCustom(true);
          toast("Palette générée !");
        }
      } else {
        toast("Erreur lors de la génération", "error");
      }
    } catch {
      toast("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Palette de couleurs */}
      <div>
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2" id="palette-label">Palette</p>
        <div className="grid grid-cols-4 gap-1.5" role="group" aria-labelledby="palette-label">
          {palette.map((color, i) => (
            <button
              key={i}
              onClick={() => onColorSelect(color)}
              aria-label={`Sélectionner la couleur ${color}`}
              aria-pressed={activeColor === color}
              className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-110 ${
                activeColor === color
                  ? "border-rose-600 scale-110 shadow-md ring-1 ring-rose-300"
                  : "border-transparent hover:border-rose-300"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Couleur libre */}
      <div className="flex items-center gap-2">
        <label htmlFor="color-picker" className="text-xs text-rose-400">Couleur libre</label>
        <input
          id="color-picker"
          type="color"
          value={activeColor}
          onChange={(e) => onColorSelect(e.target.value)}
          className="w-8 h-8 rounded-md cursor-pointer border-2 border-rose-200 bg-white"
        />
        <span className="text-xs text-rose-400 font-mono" aria-live="polite" aria-atomic="true">{activeColor}</span>
      </div>

      {/* Palette IA */}
      <div className="flex flex-col gap-2 pt-1 border-t border-rose-100">
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Palette IA</p>
        <label htmlFor="ai-theme-input" className="sr-only">Thème pour la palette IA</label>
        <input
          id="ai-theme-input"
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && suggestPalette()}
          placeholder="thème (ex: forêt, océan…)"
          className="text-xs bg-white border border-rose-200 rounded-lg px-3 py-1.5 text-gray-700 placeholder:text-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500 w-full"
        />
        <div className="flex gap-1.5">
          <button
            onClick={suggestPalette}
            disabled={loading || !theme.trim()}
            aria-busy={loading}
            className="flex-1 text-xs bg-rose-600 text-white rounded-lg px-2 py-1.5 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Génération…" : "Générer"}
          </button>
          {isCustom && (
            <button
              onClick={() => { setPalette(DEFAULT_PALETTE); setIsCustom(false); }}
              aria-label="Restaurer la palette par défaut"
              className="text-xs bg-white text-rose-500 border border-rose-200 rounded-lg px-2 py-1.5 hover:bg-rose-50 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
