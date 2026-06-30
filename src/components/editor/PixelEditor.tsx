"use client";

import { useRef, useState } from "react";
import { usePixelGrid } from "@/hooks/usePixelGrid";
import { PixelCanvas } from "./PixelCanvas";
import { ColorPalette } from "./ColorPalette";
import { ToolBar } from "./ToolBar";
import { useToast } from "@/components/ui/Toast";
import { GridData } from "@/types";

interface PixelEditorProps {
  initialData?: GridData;
  initialTitle?: string;
  drawingId?: string;
  onSave?: (title: string, gridData: string) => Promise<void>;
}

export function PixelEditor({
  initialData,
  initialTitle = "",
  drawingId,
  onSave,
}: PixelEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const {
    grid,
    activeColor,
    activeTool,
    setActiveColor,
    setActiveTool,
    paintPixel,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    serialize,
  } = usePixelGrid(initialData);

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${title || "pixel-art"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleSave = async () => {
    if (!onSave) return;
    if (!title.trim()) {
      toast("Donne un titre à ton dessin !", "error");
      return;
    }
    setSaving(true);
    try {
      await onSave(title, serialize());
      toast("Dessin sauvegardé !");
    } catch {
      toast("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[580px]">
      {/* Sidebar rose */}
      <aside className="w-52 bg-rose-50 border-r border-rose-100 flex flex-col gap-5 p-4 overflow-y-auto flex-shrink-0" aria-label="Outils et palette">
        <ToolBar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onUndo={undo}
          onRedo={redo}
          onReset={reset}
          onExportPNG={handleExportPNG}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <ColorPalette
          activeColor={activeColor}
          onColorSelect={setActiveColor}
        />
      </aside>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {/* Canvas centré */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="shadow-xl rounded border border-gray-200 bg-white">
            <PixelCanvas
              grid={grid}
              onPaint={paintPixel}
              canvasRef={canvasRef}
            />
          </div>
        </div>

        {/* Barre de sauvegarde */}
        {onSave && (
          <div className="border-t border-gray-200 bg-white px-5 py-3 flex gap-3 items-center">
            <label htmlFor="drawing-title" className="sr-only">Titre du dessin</label>
            <input
              id="drawing-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du dessin…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              aria-busy={saving}
              className="bg-rose-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {saving ? "Sauvegarde…" : drawingId ? "Mettre à jour" : "Sauvegarder"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
