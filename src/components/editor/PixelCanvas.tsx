"use client";

import { useRef, useEffect, useCallback } from "react";
import { GridData } from "@/types";

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

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = grid.width * CELL_SIZE;
    canvas.height = grid.height * CELL_SIZE;

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;
        ctx.fillStyle = grid.pixels[y * grid.width + x];
        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
      }
    }
  }, [grid, canvasRef]);

  useEffect(() => { draw(); }, [draw]);

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
      {/* Ligne du haut : coin vide + numéros de colonnes */}
      <div className="flex" style={{ paddingLeft: NUM_MARGIN }}>
        {Array.from({ length: grid.width }, (_, x) => (
          <div
            key={x}
            style={{ width: CELL_SIZE, height: NUM_MARGIN, display: "flex", alignItems: "center", justifyContent: "center", ...numStyle }}
          >
            {x + 1}
          </div>
        ))}
      </div>

      {/* Corps : numéros de lignes + canvas */}
      <div className="flex">
        <div style={{ width: NUM_MARGIN }}>
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
