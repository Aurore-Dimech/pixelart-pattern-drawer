"use client";

import { useRef, useEffect, useCallback } from "react";
import { GridData } from "@/types";

const CELL_SIZE = 20;
const GRID_COLOR = "#E5E7EB";

interface PixelCanvasProps {
  grid: GridData;
  onPaint: (x: number, y: number) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
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
        const color = grid.pixels[y * grid.width + x];
        ctx.fillStyle = color;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = GRID_COLOR;
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }, [grid, canvasRef]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getPixelCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) return null;
    return { x, y };
  };

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-300 rounded cursor-crosshair"
      style={{ imageRendering: "pixelated" }}
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
  );
}