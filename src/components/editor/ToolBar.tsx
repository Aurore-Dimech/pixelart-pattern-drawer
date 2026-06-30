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
      <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider" id="toolbar-tools-label">Outils</p>
      <div className="flex flex-col gap-1" role="group" aria-labelledby="toolbar-tools-label">
        <button
          onClick={() => onToolChange("pen")}
          aria-pressed={activeTool === "pen"}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTool === "pen"
              ? "bg-rose-600 text-white"
              : "bg-white text-rose-900 border border-rose-100 hover:bg-rose-100"
          }`}
        >
          <Pencil size={15} aria-hidden="true" /> Crayon
        </button>
        <button
          onClick={() => onToolChange("eraser")}
          aria-pressed={activeTool === "eraser"}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTool === "eraser"
              ? "bg-rose-600 text-white"
              : "bg-white text-rose-900 border border-rose-100 hover:bg-rose-100"
          }`}
        >
          <Eraser size={15} aria-hidden="true" /> Gomme
        </button>
      </div>

      <div className="flex flex-col gap-1 mt-3">
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider" id="toolbar-actions-label">Actions</p>
        <div role="group" aria-labelledby="toolbar-actions-label" className="flex flex-col gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Annuler la dernière action"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-rose-900 border border-rose-100 hover:bg-rose-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 size={15} aria-hidden="true" /> Annuler
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Rétablir la dernière action annulée"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-rose-900 border border-rose-100 hover:bg-rose-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Redo2 size={15} aria-hidden="true" /> Rétablir
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={15} aria-hidden="true" /> Effacer tout
          </button>
          <button
            onClick={onExportPNG}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors"
          >
            <Download size={15} aria-hidden="true" /> Export PNG
          </button>
        </div>
      </div>
    </div>
  );
}
