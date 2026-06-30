"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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
  isFavorited: boolean;
  isOwn: boolean;
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
  const { toast } = useToast();
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
    const res = isFav
      ? await fetch(`/api/favorites/${drawingId}`, { method: "DELETE" })
      : await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ drawingId }),
        });
    if (res.ok) {
      toast(isFav ? "Retiré des favoris" : "Ajouté aux favoris");
    } else {
      setFavorites((f) => ({ ...f, [drawingId]: isFav }));
      setFavCounts((c) => ({ ...c, [drawingId]: c[drawingId] + (isFav ? 1 : -1) }));
      toast("Erreur, veuillez réessayer", "error");
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
        <form onSubmit={handleSearch} className="flex gap-2" role="search" aria-label="Rechercher des dessins">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
            <label htmlFor="gallery-search" className="sr-only">Rechercher par titre</label>
            <input
              id="gallery-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre…"
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm"
          >
            Rechercher
          </button>
        </form>

        {/* Filtre par tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par tag">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTag(tag.slug)}
                aria-pressed={activeTag === tag.slug}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  activeTag === tag.slug
                    ? "bg-rose-600 text-white border-rose-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-rose-400 hover:text-rose-600"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-400" aria-live="polite" aria-atomic="true">
          {total} dessin{total !== 1 ? "s" : ""}
          {initialSearch && <span> pour &ldquo;{initialSearch}&rdquo;</span>}
        </p>

        {initial.length === 0 ? (
          <div className="text-center py-24 text-gray-400" role="status">
            <p className="text-lg mb-2">Aucun dessin trouvé</p>
            <p className="text-sm">Essaie un autre terme ou supprime les filtres</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 list-none p-0">
            {initial.map((drawing) => (
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
                  <div className="px-2.5 py-2 flex items-center justify-between gap-1.5">
                    <div className="flex gap-1 flex-wrap min-w-0">
                      {drawing.tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleTag(tag.slug)}
                          aria-label={`Filtrer par tag : ${tag.name}`}
                          className="text-xs bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md hover:bg-rose-100 transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>

                    {drawing.isOwn ? (
                      <span className="flex items-center gap-1 text-xs text-gray-300 shrink-0" aria-label={`${favCounts[drawing.id]} favori${favCounts[drawing.id] !== 1 ? "s" : ""} (votre dessin)`}>
                        <span aria-hidden="true">♥</span> {favCounts[drawing.id]}
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleFavorite(drawing.id)}
                        className={`flex items-center gap-1 text-xs shrink-0 transition-colors ${
                          favorites[drawing.id] ? "text-rose-500" : "text-gray-300 hover:text-rose-400"
                        }`}
                        aria-label={`${favorites[drawing.id] ? "Retirer des favoris" : "Ajouter aux favoris"} : ${drawing.title}`}
                        aria-pressed={favorites[drawing.id]}
                      >
                        <span aria-hidden="true">{favorites[drawing.id] ? "♥" : "♡"}</span>
                        <span>{favCounts[drawing.id]}</span>
                      </button>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Pagination" className="flex justify-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => navigate(search, activeTag, p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-rose-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-rose-400 hover:text-rose-600"
                }`}
              >
                {p}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
