import { useState, useCallback } from "react";
import { GridData } from "@/types";

const MAX_HISTORY = 50;

const DEFAULT_COLOR = "#FFFFFF";

export function createEmptyGrid(width: number, height: number): GridData {
  return {
    width,
    height,
    pixels: Array(width * height).fill(DEFAULT_COLOR),
  };
}

interface UsePixelGridReturn {
  grid: GridData;
  activeColor: string;
  activeTool: "pen" | "eraser";
  setActiveColor: (color: string) => void;
  setActiveTool: (tool: "pen" | "eraser") => void;
  paintPixel: (x: number, y: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: () => void;
  serialize: () => string;
  loadFromData: (data: GridData) => void;
}

export function usePixelGrid(
  initialWidth = 16,
  initialHeight = 16
): UsePixelGridReturn {
  const [grid, setGrid] = useState<GridData>(() =>
    createEmptyGrid(initialWidth, initialHeight)
  );
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeTool, setActiveTool] = useState<"pen" | "eraser">("pen");
  const [history, setHistory] = useState<GridData[]>([]);
  const [future, setFuture] = useState<GridData[]>([]);

  const paintPixel = useCallback(
    (x: number, y: number) => {
      setGrid((prev) => {
        const index = y * prev.width + x;
        if (index < 0 || index >= prev.pixels.length) return prev;

        const color = activeTool === "eraser" ? DEFAULT_COLOR : activeColor;
        if (prev.pixels[index] === color) return prev;

        const newPixels = [...prev.pixels];
        newPixels[index] = color;
        const newGrid = { ...prev, pixels: newPixels };

        setHistory((h) => [...h.slice(-MAX_HISTORY), prev]);
        setFuture([]);

        return newGrid;
      });
    },
    [activeColor, activeTool]
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [grid, ...f]);
      setGrid(prev);
      return h.slice(0, -1);
    });
  }, [grid]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h, grid]);
      setGrid(next);
      return f.slice(1);
    });
  }, [grid]);

  const reset = useCallback(() => {
    const empty = createEmptyGrid(grid.width, grid.height);
    setHistory((h) => [...h, grid]);
    setFuture([]);
    setGrid(empty);
  }, [grid]);

  const serialize = useCallback(() => JSON.stringify(grid), [grid]);

  const loadFromData = useCallback((data: GridData) => {
    setGrid(data);
    setHistory([]);
    setFuture([]);
  }, []);

  return {
    grid,
    activeColor,
    activeTool,
    setActiveColor,
    setActiveTool,
    paintPixel,
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    reset,
    serialize,
    loadFromData,
  };
}