"use client";

import { useState } from "react";
import { GridData } from "@/types";
import { PixelEditor } from "./PixelEditor";
import { useToast } from "@/components/ui/Toast";

interface Props {
  drawingId: string;
  initialData: GridData;
  initialTitle: string;
  initialTags: string[];
}

export function PixelEditorEditClient({ drawingId, initialData, initialTitle, initialTags }: Props) {
  const [tags, setTags] = useState(initialTags.join(", "));
  const { toast } = useToast();

  const parsedTags = tags
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter((t) => t.length > 0);

  const tagCount = parsedTags.length;
  const tagOverLimit = tagCount > 3;

  const handleSave = async (title: string, gridData: string) => {
    if (tagOverLimit) {
      toast("3 tags maximum par dessin", "error");
      throw new Error("Trop de tags");
    }

    const res = await fetch(`/api/drawings/${drawingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, gridData, tags: parsedTags }),
    });
    if (!res.ok) throw new Error("Erreur mise à jour");
    toast("Dessin mis à jour !");
  };

  return (
    <div>
      {/* Barre de tags */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 bg-white">
        <label htmlFor="drawing-tags" className="text-sm font-medium text-gray-600 whitespace-nowrap">
          Tags
        </label>
        <div className="flex-1 flex items-center gap-2">
          <input
            id="drawing-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="nature, espace, fantasy (séparés par des virgules)"
            aria-describedby="tags-hint"
            className={`flex-1 bg-gray-50 border rounded-xl px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
              tagOverLimit
                ? "border-red-300 focus:ring-red-400"
                : "border-gray-200 focus:ring-rose-500"
            }`}
          />
          <span
            id="tags-hint"
            aria-live="polite"
            className={`text-xs font-medium whitespace-nowrap ${tagOverLimit ? "text-red-500" : "text-gray-400"}`}
          >
            {tagCount}/3
          </span>
        </div>
      </div>
      <PixelEditor
        drawingId={drawingId}
        initialData={initialData}
        initialTitle={initialTitle}
        onSave={handleSave}
      />
    </div>
  );
}
