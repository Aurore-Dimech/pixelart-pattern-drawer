import Link from "next/link";
import { auth } from "@/lib/auth";
import { PencilLine, Globe, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  iconClass: string;
}

const FEATURES: Feature[] = [
  {
    icon: PencilLine,
    title: "Éditeur intégré",
    desc: "Dessine pixel par pixel sur une grille de 8×8 à 64×64, avec undo/redo et palette personnalisable.",
    iconClass: "text-rose-600 bg-rose-50",
  },
  {
    icon: Globe,
    title: "Galerie publique",
    desc: "Publie tes créations, explore celles des autres, filtre par tags et enregistre tes favoris.",
    iconClass: "text-amber-600 bg-amber-50",
  },
  {
    icon: Sparkles,
    title: "Palette IA",
    desc: "Génère une palette de couleurs harmonieuse à partir d'un thème en un seul clic.",
    iconClass: "text-orange-600 bg-orange-50",
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4 py-24 bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white border border-rose-100 text-rose-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden="true" />
            Plateforme de pixel art
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-5 tracking-tight leading-tight">
            Crée ton{" "}
            <span className="text-rose-600">pixel art</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-lg mx-auto">
            Un éditeur puissant, une galerie communautaire, et une IA pour t&apos;inspirer.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/gallery"
              className="bg-gray-900 text-white px-7 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Explorer la galerie
            </Link>
            {session ? (
              <Link
                href="/editor"
                className="bg-rose-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors"
              >
                + Nouveau dessin
              </Link>
            ) : (
              <Link
                href="/register"
                className="bg-rose-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors"
              >
                Commencer gratuitement
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-t border-rose-100 px-4 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {FEATURES.map(({ icon: Icon, title, desc, iconClass }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`} aria-hidden="true">
                <Icon size={20} />
              </div>
              <h2 className="font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
