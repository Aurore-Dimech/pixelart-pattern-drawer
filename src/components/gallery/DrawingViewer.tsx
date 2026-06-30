"use client";

import { useEffect, useRef, useMemo } from "react";
import { GridData } from "@/types";

interface Tag { id: string; name: string; slug: string }

interface ViewedDrawing {
  id: string;
  title: string;
  gridData: string;
  author: { name: string };
  tags: Tag[];
  favoriteCount: number;
  isFavorited?: boolean;
}

interface DrawingViewerProps {
  drawing: ViewedDrawing | null;
  onClose: () => void;
  onToggleFavorite?: (drawingId: string) => void;
  isLoggedIn?: boolean;
}

const MAX_PIXELS = 460;
const GRID_COLOR = "#D1D5DB";
const NUM_MARGIN = 22;

export function DrawingViewer({ drawing, onClose, onToggleFavorite, isLoggedIn }: DrawingViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const grid = useMemo<GridData | null>(() => {
    if (!drawing) return null;
    try { return JSON.parse(drawing.gridData); } catch { return null; }
  }, [drawing]);

  const cellSize = grid
    ? Math.max(2, Math.floor(MAX_PIXELS / Math.max(grid.width, grid.height)))
    : 0;

  const numStep = cellSize >= 12 ? 1 : cellSize >= 7 ? 2 : 5;

  // Render canvas
  useEffect(() => {
    if (!grid) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = grid.width * cellSize;
    canvas.height = grid.height * cellSize;

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const px = x * cellSize;
        const py = y * cellSize;
        ctx.fillStyle = grid.pixels[y * grid.width + x];
        ctx.fillRect(px, py, cellSize, cellSize);
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
      }
    }
  }, [grid, cellSize]);

  // Auto-focus close button when a new drawing opens
  useEffect(() => {
    if (!drawing) return;
    closeButtonRef.current?.focus();
  // WHY: depends on drawing.id only — fav count updates should not steal focus
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing?.id]);

  // Keyboard: Escape to close + focus trap
  useEffect(() => {
    if (!drawing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawing, onClose]);

  if (!drawing || !grid) return null;

  const numStyle: React.CSSProperties = {
    fontSize: Math.min(11, Math.max(8, cellSize - 2)),
    color: "#9CA3AF",
    lineHeight: 1,
    userSelect: "none",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      aria-hidden={!drawing}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewer-title"
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 id="viewer-title" className="text-lg font-bold text-gray-800">{drawing.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">par {drawing.author.name}</p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none ml-4 p-1 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Grille avec numéros HTML */}
        <div className="flex items-center justify-center bg-gray-50 p-6 overflow-auto">
          <div className="inline-block">
            {/* Numéros de colonnes */}
            <div className="flex" style={{ paddingLeft: NUM_MARGIN }} aria-hidden="true">
              {Array.from({ length: grid.width }, (_, x) => (
                <div
                  key={x}
                  style={{ width: cellSize, height: NUM_MARGIN, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", ...numStyle }}
                >
                  {(x + 1) % numStep === 0 || x === 0 ? x + 1 : ""}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Numéros de lignes */}
              <div style={{ width: NUM_MARGIN }} aria-hidden="true">
                {Array.from({ length: grid.height }, (_, y) => (
                  <div
                    key={y}
                    style={{ width: NUM_MARGIN, height: cellSize, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 3, overflow: "hidden", ...numStyle }}
                  >
                    {(y + 1) % numStep === 0 || y === 0 ? y + 1 : ""}
                  </div>
                ))}
              </div>

              <canvas
                ref={canvasRef}
                style={{ imageRendering: "pixelated", display: "block" }}
                aria-label={`Pixel art : ${drawing.title}, grille ${grid.width}×${grid.height}`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5" aria-label="Tags">
            {drawing.tags.map((tag) => (
              <span key={tag.id} className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
                {tag.name}
              </span>
            ))}
          </div>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(drawing.id)}
              aria-pressed={drawing.isFavorited}
              aria-label={
                !isLoggedIn
                  ? "Connectez-vous pour ajouter en favori"
                  : drawing.isFavorited
                  ? `Retirer des favoris (${drawing.favoriteCount})`
                  : `Ajouter aux favoris (${drawing.favoriteCount})`
              }
              disabled={!isLoggedIn}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                drawing.isFavorited
                  ? "text-rose-500 bg-rose-50 hover:bg-rose-100"
                  : isLoggedIn
                  ? "text-gray-500 bg-gray-100 hover:bg-gray-200"
                  : "text-gray-400 bg-gray-50 cursor-default opacity-60"
              }`}
            >
              <span aria-hidden="true">{drawing.isFavorited ? "♥" : "♡"}</span>
              <span>{drawing.favoriteCount}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
