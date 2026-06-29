"use client";

import { Pencil, Eraser, Undo2, Redo2, Trash2, Download } from "lucide-react";

interface ToolBarProps {
  activeTool: "pen" | "eraser";
  onToolChange: (tool: "pen" | "eraser") => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onExportPNG: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function ToolBar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onReset,
  onExportPNG,
  canUndo,
  canRedo,
}: ToolBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outils</p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onToolChange("pen")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTool === "pen"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Pencil size={16} /> Crayon
        </button>
        <button
          onClick={() => onToolChange("eraser")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTool === "eraser"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Eraser size={16} /> Gomme
        </button>
      </div>

      <div className="flex flex-col gap-1 mt-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</p>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Undo2 size={16} /> Annuler
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Redo2 size={16} /> Rétablir
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
        >
          <Trash2 size={16} /> Effacer tout
        </button>
        <button
          onClick={onExportPNG}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100"
        >
          <Download size={16} /> Export PNG
        </button>
      </div>
    </div>
  );
}