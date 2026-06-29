"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  isFavorited: boolean;
}

interface Props {
  drawings: Drawing[];
  total: number;
  page: number;
  pageSize: number;
  tags: Tag[];
  initialSearch: string;
  initialTag: string;
  isLoggedIn: boolean;
}

export function GalleryClient({ drawings: initial, total, page, pageSize, tags, initialSearch, initialTag, isLoggedIn }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(
    Object.fromEntries(initial.map((d) => [d.id, d.isFavorited]))
  );
  const [favCounts, setFavCounts] = useState<Record<string, number>>(
    Object.fromEntries(initial.map((d) => [d.id, d.favoriteCount]))
  );
  const [viewed, setViewed] = useState<Drawing | null>(null);

  const navigate = (s: string, t: string, p = 1) => {
    const params = new URLSearchParams();
    if (s) params.set("search", s);
    if (t) params.set("tag", t);
    if (p > 1) params.set("page", String(p));
    startTransition(() => router.push(`/gallery?${params.toString()}`));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(search, activeTag);
  };

  const handleTag = (slug: string) => {
    const next = activeTag === slug ? "" : slug;
    setActiveTag(next);
    navigate(search, next);
  };

  const toggleFavorite = async (drawingId: string) => {
    if (!isLoggedIn) { router.push("/login"); return; }
    const isFav = favorites[drawingId];
    setFavorites((f) => ({ ...f, [drawingId]: !isFav }));
    setFavCounts((c) => ({ ...c, [drawingId]: c[drawingId] + (isFav ? -1 : 1) }));
    if (isFav) {
      await fetch(`/api/favorites/${drawingId}`, { method: "DELETE" });
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawingId }),
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const viewedWithState = viewed
    ? { ...viewed, isFavorited: favorites[viewed.id], favoriteCount: favCounts[viewed.id] }
    : null;

  return (
    <>
      <DrawingViewer
        drawing={viewedWithState}
        onClose={() => setViewed(null)}
        onToggleFavorite={toggleFavorite}
        isLoggedIn={isLoggedIn}
      />

      <div className="flex flex-col gap-6">
        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre..."
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Rechercher
          </button>
        </form>

        {/* Filtre par tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTag(tag.slug)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  activeTag === tag.slug
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500">{total} dessin{total !== 1 ? "s" : ""}</p>

        {initial.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Aucun dessin trouvé.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {initial.map((drawing) => (
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
                        <button
                          key={tag.id}
                          onClick={() => handleTag(tag.slug)}
                          className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full hover:bg-indigo-100"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => toggleFavorite(drawing.id)}
                    className={`mt-auto flex items-center gap-1 text-xs ${
                      favorites[drawing.id] ? "text-red-500" : "text-gray-400 hover:text-red-400"
                    }`}
                    title={isLoggedIn ? "Ajouter aux favoris" : "Connectez-vous pour ajouter en favori"}
                  >
                    {favorites[drawing.id] ? "♥" : "♡"} {favCounts[drawing.id]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => navigate(search, activeTag, p)}
                className={`w-8 h-8 rounded text-sm ${
                  p === page ? "bg-indigo-600 text-white" : "bg-white border border-gray-300 hover:border-indigo-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
