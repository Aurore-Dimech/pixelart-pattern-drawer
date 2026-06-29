"use client";

import { useState } from "react";
import { GridData } from "@/types";
import { PixelEditor } from "./PixelEditor";

interface Props {
  drawingId: string;
  initialData: GridData;
  initialTitle: string;
  initialTags: string[];
}

export function PixelEditorEditClient({ drawingId, initialData, initialTitle, initialTags }: Props) {
  const [tags, setTags] = useState(initialTags.join(", "));
  const [tagSaved, setTagSaved] = useState(false);

  const handleSave = async (title: string, gridData: string) => {
    const tagSlugs = tags
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
      .filter((t) => t.length > 0);

    const res = await fetch(`/api/drawings/${drawingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, gridData, tags: tagSlugs }),
    });
    if (!res.ok) throw new Error("Erreur mise à jour");
    setTagSaved(true);
    setTimeout(() => setTagSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 w-20">Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="nature, espace, fantasy (séparés par des virgules)"
          className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {tagSaved && <span className="text-xs text-green-600">Tags sauvegardés</span>}
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
