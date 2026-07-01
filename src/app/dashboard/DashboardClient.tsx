"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { DrawingMiniature } from "@/components/gallery/DrawingMiniature";
import { useDrawingActions, Drawing } from "@/hooks/useDrawingActions";

interface DrawingCardProps {
  drawing: Drawing;
  pending: boolean;
  onTogglePublish: () => void;
  onDelete: () => void;
}

function DrawingCard({ drawing, pending, onTogglePublish, onDelete }: DrawingCardProps) {
  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
      <div className="aspect-square bg-rose-50/30 relative flex items-center justify-center">
        <DrawingMiniature gridData={drawing.gridData} size={110} />
        <span
          className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${drawing.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
          aria-label={drawing.isPublished ? "Publié dans la galerie" : "Brouillon non publié"}
        >
          {drawing.isPublished ? "Publié" : "Brouillon"}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-800 truncate">{drawing.title}</p>
          <p className="text-xs text-gray-400">
            <time dateTime={drawing.updatedAt}>{new Date(drawing.updatedAt).toLocaleDateString("fr-FR")}</time>
          </p>
        </div>
        {drawing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1" aria-label="Tags">
            {drawing.tags.map(({ tag }) => (
              <span key={tag.id} className="text-xs bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md">{tag.name}</span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5 mt-1">
          <Link href={`/editor/${drawing.id}`} className="flex-1 text-center text-xs px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors" aria-label={`Éditer ${drawing.title}`}>
            Éditer
          </Link>
          <button
            onClick={onTogglePublish}
            disabled={pending}
            aria-label={`${drawing.isPublished ? "Dépublier" : "Publier"} ${drawing.title}`}
            className={`flex-1 text-xs px-2 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${drawing.isPublished ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
          >
            {drawing.isPublished ? "Dépublier" : "Publier"}
          </button>
          <button onClick={onDelete} disabled={pending} aria-label={`Supprimer ${drawing.title}`} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50">
            ×
          </button>
        </div>
      </div>
    </article>
  );
}

export function DashboardClient({ drawings: initial }: { drawings: Drawing[] }) {
  const { drawings, pending, togglePublish, deleteDrawing } = useDrawingActions(initial);

  if (drawings.length === 0) {
    return (
      <div className="text-center py-24 text-gray-500">
        <PlusCircle size={40} className="mx-auto text-gray-300 mb-4" aria-hidden="true" />
        <p className="font-medium text-gray-700 mb-1">Aucun dessin pour l&apos;instant</p>
        <p className="text-sm text-gray-400 mb-6">Crée ton premier pixel art en un clic</p>
        <Link
          href="/editor"
          className="inline-block bg-rose-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-rose-700 transition-colors text-sm"
        >
          + Nouveau dessin
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 list-none p-0">
      {drawings.map((drawing) => (
        <li key={drawing.id}>
          <DrawingCard
            drawing={drawing}
            pending={!!pending[drawing.id]}
            onTogglePublish={() => togglePublish(drawing.id, drawing.isPublished)}
            onDelete={() => deleteDrawing(drawing.id, drawing.title)}
          />
        </li>
      ))}
    </ul>
  );
}
