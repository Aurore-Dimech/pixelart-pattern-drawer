"use client";

import { useState } from "react";
import Link from "next/link";
import { DrawingMiniature } from "@/components/gallery/DrawingMiniature";

interface Tag { id: string; name: string; slug: string }
interface DrawingTag { tag: Tag }
interface Drawing {
  id: string;
  title: string;
  gridData: string;
  isPublished: boolean;
  updatedAt: string;
  tags: DrawingTag[];
}

export function DashboardClient({ drawings: initial }: { drawings: Drawing[] }) {
  const [drawings, setDrawings] = useState(initial);
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const togglePublish = async (id: string) => {
    setPending((p) => ({ ...p, [id]: true }));
    const res = await fetch(`/api/drawings/${id}/publish`, { method: "POST" });
    if (res.ok) {
      const { data } = await res.json();
      setDrawings((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isPublished: data.isPublished } : d))
      );
    }
    setPending((p) => ({ ...p, [id]: false }));
  };

  const deleteDrawing = async (id: string) => {
    if (!confirm("Supprimer ce dessin ? Cette action est irréversible.")) return;
    setPending((p) => ({ ...p, [id]: true }));
    const res = await fetch(`/api/drawings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDrawings((prev) => prev.filter((d) => d.id !== id));
    }
    setPending((p) => ({ ...p, [id]: false }));
  };

  if (drawings.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="mb-4">Tu n'as pas encore de dessins.</p>
        <Link href="/editor" className="text-indigo-600 hover:underline font-medium">
          Créer ton premier dessin →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {drawings.map((drawing) => (
        <div
          key={drawing.id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="bg-gray-100 flex items-center justify-center p-3">
            <DrawingMiniature gridData={drawing.gridData} size={96} />
          </div>

          <div className="p-3 flex flex-col gap-2 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{drawing.title}</p>

            {drawing.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {drawing.tags.map(({ tag }) => (
                  <span key={tag.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-auto">
              {new Date(drawing.updatedAt).toLocaleDateString("fr-FR")}
            </p>

            <div className="flex gap-1 flex-wrap mt-1">
              <Link
                href={`/editor/${drawing.id}`}
                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Éditer
              </Link>
              <button
                onClick={() => togglePublish(drawing.id)}
                disabled={pending[drawing.id]}
                className={`text-xs px-2 py-1 rounded ${
                  drawing.isPublished
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                {drawing.isPublished ? "Publié" : "Publier"}
              </button>
              <button
                onClick={() => deleteDrawing(drawing.id)}
                disabled={pending[drawing.id]}
                className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
              >
                Suppr.
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
