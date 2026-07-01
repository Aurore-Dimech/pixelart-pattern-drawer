"use client";

import { GridData } from "@/types";
import { PixelEditor } from "./PixelEditor";

interface Props {
  drawingId: string;
  initialData: GridData;
  initialTitle: string;
  initialTags: string[];
}

export function PixelEditorEditClient({ drawingId, initialData, initialTitle, initialTags }: Props) {
  const handleSave = async (title: string, gridData: string, tags: string[]) => {
    const res = await fetch(`/api/drawings/${drawingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, gridData, tags }),
    });
    if (!res.ok) throw new Error("Erreur mise à jour");
  };

  return (
    <PixelEditor
      drawingId={drawingId}
      initialData={initialData}
      initialTitle={initialTitle}
      initialTags={initialTags}
      onSave={handleSave}
    />
  );
}
