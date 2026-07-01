"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "@/components/ui/Toast";

interface Tag { id: string; name: string; slug: string }
interface DrawingTag { tag: Tag }
export interface Drawing {
  id: string;
  title: string;
  gridData: string;
  isPublished: boolean;
  updatedAt: string;
  tags: DrawingTag[];
}

type ToastFn = (message: string, type?: "success" | "error" | "info") => void;
type SetDrawings = Dispatch<SetStateAction<Drawing[]>>;
type SetPending = Dispatch<SetStateAction<Record<string, boolean>>>;

interface PublishApiResponse {
  data?: { isPublished?: unknown };
}

function applyPublishUpdate(d: Drawing, id: string, isPublished: boolean): Drawing {
  if (d.id !== id) return d;
  return { ...d, isPublished };
}

function withPending(id: string, value: boolean): (p: Record<string, boolean>) => Record<string, boolean> {
  return (p) => ({ ...p, [id]: value });
}

async function doTogglePublish(
  id: string,
  currentIsPublished: boolean,
  drawings: Drawing[],
  setDrawings: SetDrawings,
  setPending: SetPending,
  toast: ToastFn
): Promise<void> {
  const publishUrl = `/api/drawings/${id}/publish`;
  const headers = { "Content-Type": "application/json" };
  const requestBody = JSON.stringify({ publish: !currentIsPublished });
  setPending(withPending(id, true));
  try {
    const res = await fetch(publishUrl, { method: "POST", headers, body: requestBody });
    if (!res.ok) { toast("Erreur lors de la publication", "error"); return; }
    const json = await res.json() as PublishApiResponse;
    const isPublished = json.data?.isPublished;
    if (typeof isPublished !== "boolean") { toast("Erreur lors de la publication", "error"); return; }
    setDrawings(drawings.map((d) => applyPublishUpdate(d, id, isPublished)));
    toast(isPublished ? "Dessin publié dans la galerie" : "Dessin dépublié");
  } finally {
    setPending(withPending(id, false));
  }
}

async function doDeleteDrawing(
  id: string,
  title: string,
  drawings: Drawing[],
  setDrawings: SetDrawings,
  setPending: SetPending,
  toast: ToastFn
): Promise<void> {
  const deleteUrl = `/api/drawings/${id}`;
  const confirmMsg = `Supprimer "${title}" ? Cette action est irréversible.`;
  if (!confirm(confirmMsg)) return;
  setPending(withPending(id, true));
  try {
    const res = await fetch(deleteUrl, { method: "DELETE" });
    if (!res.ok) { toast("Erreur lors de la suppression", "error"); return; }
    setDrawings(drawings.filter((d) => d.id !== id));
    toast("Dessin supprimé");
  } finally {
    setPending(withPending(id, false));
  }
}

export function useDrawingActions(initial: Drawing[]) {
  const [drawings, setDrawings] = useState(initial);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const togglePublish = (id: string, currentIsPublished: boolean): Promise<void> =>
    doTogglePublish(id, currentIsPublished, drawings, setDrawings, setPending, toast);

  const deleteDrawing = (id: string, title: string): Promise<void> =>
    doDeleteDrawing(id, title, drawings, setDrawings, setPending, toast);

  return { drawings, pending, togglePublish, deleteDrawing };
}
