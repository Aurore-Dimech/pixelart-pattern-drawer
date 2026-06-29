"use client";

import { useRef, useState } from "react";
import { usePixelGrid } from "@/hooks/usePixelGrid";
import { PixelCanvas } from "./PixelCanvas";
import { ColorPalette } from "./ColorPalette";
import { ToolBar } from "./ToolBar";
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
  const [saveMsg, setSaveMsg] = useState("");

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
      setSaveMsg("Donne un titre à ton dessin !");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    try {
      await onSave(title, serialize());
      setSaveMsg("✅ Sauvegardé !");
    } catch {
      setSaveMsg("❌ Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-6 p-6">
      {/* Sidebar gauche */}
      <div className="flex flex-col gap-6 w-44">
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
      </div>

      {/* Zone de dessin */}
      <div className="flex flex-col gap-4">
        <PixelCanvas
          grid={grid}
          onPaint={paintPixel}
          canvasRef={canvasRef}
        />

        {/* Sauvegarde */}
        {onSave && (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du dessin..."
              className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Sauvegarde..." : drawingId ? "Mettre à jour" : "Sauvegarder"}
            </button>
          </div>
        )}
        {saveMsg && <p className="text-sm">{saveMsg}</p>}
      </div>
    </div>
  );
}