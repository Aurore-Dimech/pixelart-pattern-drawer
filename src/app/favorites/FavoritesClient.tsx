"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { DrawingMiniature } from "@/components/gallery/DrawingMiniature";
import { DrawingViewer } from "@/components/gallery/DrawingViewer";
import { useToast } from "@/components/ui/Toast";

interface Tag { id: string; name: string; slug: string }
interface Drawing {
  id: string;
  title: string;
  gridData: string;
  updatedAt: string;
  author: { name: string };
  tags: Tag[];
  favoriteCount: number;
}

type ToastFn = (message: string, type?: "success" | "error" | "info") => void;
type SetDrawings = Dispatch<SetStateAction<Drawing[]>>;
type SetRemoving = Dispatch<SetStateAction<Record<string, boolean>>>;
type SetViewed = Dispatch<SetStateAction<Drawing | null>>;

async function doRemoveFavorite(
  drawingId: string,
  viewedId: string | null,
  setDrawings: SetDrawings,
  setRemoving: SetRemoving,
  setViewed: SetViewed,
  toast: ToastFn
): Promise<void> {
  setRemoving((r) => ({ ...r, [drawingId]: true }));
  const res = await fetch(`/api/favorites/${drawingId}`, { method: "DELETE" });
  setRemoving((r) => ({ ...r, [drawingId]: false }));
  if (!res.ok) { toast("Erreur lors de la suppression", "error"); return; }
  setDrawings((prev) => prev.filter((d) => d.id !== drawingId));
  if (viewedId === drawingId) setViewed(null);
  toast("Retiré des favoris");
}

export function FavoritesClient({ drawings: initial }: { drawings: Drawing[] }) {
  const [drawings, setDrawings] = useState(initial);
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [viewed, setViewed] = useState<Drawing | null>(null);
  const { toast } = useToast();

  const removeFavorite = (drawingId: string): Promise<void> =>
    doRemoveFavorite(drawingId, viewed?.id ?? null, setDrawings, setRemoving, setViewed, toast);

  if (drawings.length === 0) {
    return (
      <div className="text-center py-24 text-gray-500">
        <Heart size={40} className="mx-auto text-gray-300 mb-4" aria-hidden="true" />
        <p className="font-medium text-gray-700 mb-1">Aucun favori pour l&apos;instant</p>
        <p className="text-sm text-gray-400 mb-6">Explore la galerie et ajoute des dessins à tes favoris</p>
        <Link
          href="/gallery"
          className="inline-block bg-rose-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-rose-700 transition-colors text-sm"
        >
          Explorer la galerie
        </Link>
      </div>
    );
  }

  return (
    <>
      <DrawingViewer
        drawing={viewed ? { ...viewed, isFavorited: true } : null}
        onClose={() => setViewed(null)}
        onToggleFavorite={removeFavorite}
        isLoggedIn={true}
      />

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 list-none p-0">
        {drawings.map((drawing) => (
          <li key={drawing.id}>
            <article className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
              {/* Miniature */}
              <button
                onClick={() => setViewed(drawing)}
                className="aspect-square bg-rose-50/30 relative overflow-hidden w-full block"
                aria-label={`Voir ${drawing.title} par ${drawing.author.name}`}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  <DrawingMiniature gridData={drawing.gridData} size={110} />
                </span>
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5" aria-hidden="true">
                  <span className="text-white text-xs font-semibold truncate leading-tight">{drawing.title}</span>
                  <span className="text-white/70 text-xs truncate">par {drawing.author.name}</span>
                </span>
              </button>

              {/* Footer */}
              <div className="p-2.5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {drawing.tags.map((tag) => (
                      <span key={tag.id} className="text-xs bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-300 shrink-0" aria-label={`${drawing.favoriteCount} favori${drawing.favoriteCount !== 1 ? "s" : ""}`}>
                    <span aria-hidden="true">♥</span> {drawing.favoriteCount}
                  </span>
                </div>

                <button
                  onClick={() => removeFavorite(drawing.id)}
                  disabled={removing[drawing.id]}
                  aria-label={`Retirer ${drawing.title} des favoris`}
                  className="w-full text-xs py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50 font-medium"
                >
                  Retirer des favoris
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
