"use client";

import { useEffect, useRef } from "react";
import { GridData } from "@/types";
import { renderGridToCanvas, computeCellSize } from "@/lib/pixel-render";

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

    const cellSize = computeCellSize(grid, size);
    renderGridToCanvas(canvas, grid, cellSize, { gridColor: "rgba(0,0,0,0.15)" });
  }, [gridData, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
