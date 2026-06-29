"use client";

import { useEffect, useRef } from "react";
import { GridData } from "@/types";

interface DrawingMiniatureProps {
  gridData: string;
  size?: number;
  className?: string;
}

export function DrawingMiniature({ gridData, size = 64, className = "" }: DrawingMiniatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let grid: GridData;
    try {
      grid = JSON.parse(gridData);
    } catch {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = Math.max(1, Math.floor(size / Math.max(grid.width, grid.height)));
    canvas.width = grid.width * cellSize;
    canvas.height = grid.height * cellSize;

    // Pixels
    for (let i = 0; i < grid.pixels.length; i++) {
      const x = (i % grid.width) * cellSize;
      const y = Math.floor(i / grid.width) * cellSize;
      ctx.fillStyle = grid.pixels[i];
      ctx.fillRect(x, y, cellSize, cellSize);
    }

    // Bordures de grille — seulement si la cellule est assez grande pour les voir
    if (cellSize >= 3) {
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          ctx.strokeRect(x * cellSize + 0.5, y * cellSize + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }
  }, [gridData, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
