"use client";

import { useRouter } from "next/navigation";
import { PixelEditor } from "./PixelEditor";

export function PixelEditorClient() {
  const router = useRouter();

  const handleSave = async (title: string, gridData: string, tags: string[]) => {
    const res = await fetch("/api/drawings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, gridData, tags }),
    });
    if (!res.ok) throw new Error("Erreur sauvegarde");
    const data = await res.json();
    const id = data?.data?.id;
    if (!id) throw new Error("Identifiant manquant dans la réponse");
    router.push(`/editor/${id}`);
  };

  return <PixelEditor onSave={handleSave} />;
}
