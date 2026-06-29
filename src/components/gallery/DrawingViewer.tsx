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

  const grid = useMemo<GridData | null>(() => {
    if (!drawing) return null;
    try { return JSON.parse(drawing.gridData); } catch { return null; }
  }, [drawing]);

  const cellSize = grid
    ? Math.max(2, Math.floor(MAX_PIXELS / Math.max(grid.width, grid.height)))
    : 0;

  // Affiche un numéro tous les N pour éviter la surcharge sur les petites grilles
  const numStep = cellSize >= 12 ? 1 : cellSize >= 7 ? 2 : 5;

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{drawing.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">par {drawing.author.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none ml-4"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Grille avec numéros HTML */}
        <div className="flex items-center justify-center bg-gray-50 p-6 overflow-auto">
          <div className="inline-block">
            {/* Ligne du haut : coin + numéros de colonnes */}
            <div className="flex" style={{ paddingLeft: NUM_MARGIN }}>
              {Array.from({ length: grid.width }, (_, x) => (
                <div
                  key={x}
                  style={{ width: cellSize, height: NUM_MARGIN, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", ...numStyle }}
                >
                  {(x + 1) % numStep === 0 || x === 0 ? x + 1 : ""}
                </div>
              ))}
            </div>

            {/* Corps : numéros de lignes + canvas */}
            <div className="flex">
              <div style={{ width: NUM_MARGIN }}>
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
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {drawing.tags.map((tag) => (
              <span key={tag.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                {tag.name}
              </span>
            ))}
          </div>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(drawing.id)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                drawing.isFavorited
                  ? "text-red-500 bg-red-50 hover:bg-red-100"
                  : isLoggedIn
                  ? "text-gray-500 bg-gray-100 hover:bg-gray-200"
                  : "text-gray-400 bg-gray-50 cursor-default"
              }`}
              title={!isLoggedIn ? "Connectez-vous pour ajouter en favori" : undefined}
            >
              {drawing.isFavorited ? "♥" : "♡"} {drawing.favoriteCount}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
