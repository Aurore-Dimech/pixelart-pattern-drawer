"use client";

import { useRef, useEffect } from "react";
import { GridData } from "@/types";
import { renderGridToCanvas } from "@/lib/pixel-render";

const CELL_SIZE = 28;
const GRID_COLOR = "#D1D5DB";
const NUM_MARGIN = 26; // largeur/hauteur de la bande HTML des numéros

interface PixelCanvasProps {
  grid: GridData;
  onPaint: (x: number, y: number) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function PixelCanvas({ grid, onPaint, canvasRef: externalRef }: PixelCanvasProps) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalRef ?? internalRef;
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderGridToCanvas(canvas, grid, CELL_SIZE, { gridColor: GRID_COLOR, showGridLines: true });
  }, [grid, canvasRef]);

  const getPixelCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) * scaleY / CELL_SIZE);
    if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) return null;
    return { x, y };
  };

  const numStyle: React.CSSProperties = {
    fontSize: 10,
    color: "#9CA3AF",
    lineHeight: 1,
    userSelect: "none",
  };

  return (
    <div className="inline-block">
      {/* Numéros de colonnes */}
      <div className="flex" style={{ paddingLeft: NUM_MARGIN }} aria-hidden="true">
        {Array.from({ length: grid.width }, (_, x) => (
          <div
            key={x}
            style={{ width: CELL_SIZE, height: NUM_MARGIN, display: "flex", alignItems: "center", justifyContent: "center", ...numStyle }}
          >
            {x + 1}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Numéros de lignes */}
        <div style={{ width: NUM_MARGIN }} aria-hidden="true">
          {Array.from({ length: grid.height }, (_, y) => (
            <div
              key={y}
              style={{ width: NUM_MARGIN, height: CELL_SIZE, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4, ...numStyle }}
            >
              {y + 1}
            </div>
          ))}
        </div>

        <canvas
          ref={canvasRef}
          role="application"
          aria-label={`Zone de dessin pixel art, grille ${grid.width} colonnes × ${grid.height} lignes`}
          className="cursor-crosshair"
          style={{ imageRendering: "pixelated", display: "block" }}
          onMouseDown={(e) => {
            isDrawing.current = true;
            const coords = getPixelCoords(e);
            if (coords) onPaint(coords.x, coords.y);
          }}
          onMouseMove={(e) => {
            if (!isDrawing.current) return;
            const coords = getPixelCoords(e);
            if (coords) onPaint(coords.x, coords.y);
          }}
          onMouseUp={() => { isDrawing.current = false; }}
          onMouseLeave={() => { isDrawing.current = false; }}
        />
      </div>
    </div>
  );
}
