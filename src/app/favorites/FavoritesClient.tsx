"use client";

import { useState } from "react";
import { DrawingMiniature } from "@/components/gallery/DrawingMiniature";
import { DrawingViewer } from "@/components/gallery/DrawingViewer";

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

export function FavoritesClient({ drawings: initial }: { drawings: Drawing[] }) {
  const [drawings, setDrawings] = useState(initial);
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [viewed, setViewed] = useState<Drawing | null>(null);

  const removeFavorite = async (drawingId: string) => {
    setRemoving((r) => ({ ...r, [drawingId]: true }));
    const res = await fetch(`/api/favorites/${drawingId}`, { method: "DELETE" });
    if (res.ok) {
      setDrawings((prev) => prev.filter((d) => d.id !== drawingId));
      if (viewed?.id === drawingId) setViewed(null);
    }
    setRemoving((r) => ({ ...r, [drawingId]: false }));
  };

  if (drawings.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="mb-4">Tu n'as pas encore de favoris.</p>
        <a href="/gallery" className="text-indigo-600 hover:underline font-medium">
          Explorer la galerie →
        </a>
      </div>
    );
  }

  return (
    <>
      <DrawingViewer
        drawing={viewed ? { ...viewed, isFavorited: true } : null}
        onClose={() => setViewed(null)}
        onToggleFavorite={(id) => removeFavorite(id)}
        isLoggedIn={true}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {drawings.map((drawing) => (
          <div
            key={drawing.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
          >
            <button
              onClick={() => setViewed(drawing)}
              className="bg-gray-100 flex items-center justify-center p-3 hover:bg-gray-200 transition-colors"
            >
              <DrawingMiniature gridData={drawing.gridData} size={80} />
            </button>

            <div className="p-2 flex flex-col gap-1 flex-1">
              <button
                onClick={() => setViewed(drawing)}
                className="text-xs font-semibold text-gray-800 truncate text-left hover:text-indigo-600"
              >
                {drawing.title}
              </button>
              <p className="text-xs text-gray-400 truncate">{drawing.author.name}</p>

              {drawing.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {drawing.tags.map((tag) => (
                    <span key={tag.id} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-auto">♥ {drawing.favoriteCount}</p>

              <button
                onClick={() => removeFavorite(drawing.id)}
                disabled={removing[drawing.id]}
                className="text-xs px-2 py-1 rounded bg-red-50 text-red-500 hover:bg-red-100 mt-1 disabled:opacity-50"
              >
                Retirer
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
