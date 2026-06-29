"use client";

import { useRouter } from "next/navigation";
import { PixelEditor } from "./PixelEditor";

export function PixelEditorClient() {
  const router = useRouter();

  const handleSave = async (title: string, gridData: string) => {
    const res = await fetch("/api/drawings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, gridData }),
    });
    if (!res.ok) throw new Error("Erreur sauvegarde");
    const data = await res.json();
    router.push(`/editor/${data.data.id}`);
  };

  return <PixelEditor onSave={handleSave} />;
}