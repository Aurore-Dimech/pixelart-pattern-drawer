"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
        pathname === href ? "text-indigo-600" : "text-gray-600"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="font-bold text-indigo-600 text-lg tracking-tight">
          PixelArt
        </Link>

        <div className="flex items-center gap-6">
          {link("/gallery", "Galerie")}
          {session && link("/dashboard", "Mes dessins")}
          {session && link("/favorites", "Favoris")}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/editor"
                className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium"
              >
                + Nouveau
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-400 hover:text-gray-700"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              {link("/login", "Connexion")}
              <Link
                href="/register"
                className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
