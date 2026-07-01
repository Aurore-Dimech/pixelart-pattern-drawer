import { GridData } from "@/types";

// src/lib/pixel-render.ts
export function renderGridToCanvas(
  canvas: HTMLCanvasElement,
  grid: GridData,
  cellSize: number,
  options?: { gridColor?: string; showGridLines?: boolean }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { gridColor = "#D1D5DB", showGridLines = cellSize >= 3 } = options ?? {};

  canvas.width = grid.width * cellSize;
  canvas.height = grid.height * cellSize;

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const px = x * cellSize, py = y * cellSize;
      ctx.fillStyle = grid.pixels[y * grid.width + x];
      ctx.fillRect(px, py, cellSize, cellSize);
      if (showGridLines) {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
      }
    }
  }
}

export function computeCellSize(grid: { width: number; height: number }, maxPixels: number, min = 1) {
  return Math.max(min, Math.floor(maxPixels / Math.max(grid.width, grid.height)));
}