"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

function PixelLogo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 4 4"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: "pixelated" }}
      className="rounded-sm flex-shrink-0"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="2" height="2" fill="#E11D48" />
      <rect x="2" y="0" width="2" height="2" fill="#FB7185" />
      <rect x="0" y="2" width="2" height="2" fill="#FECDD3" />
      <rect x="2" y="2" width="2" height="2" fill="#E11D48" />
    </svg>
  );
}

export function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      className={`text-sm font-medium transition-colors border-b-2 pb-0.5 ${
        pathname === href
          ? "text-rose-600 border-rose-600"
          : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav aria-label="Navigation principale" className="bg-gradient-to-r from-rose-50 to-amber-50/70 border-b border-rose-100 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-rose-600 text-lg tracking-tight"
          aria-label="PixelArt — Accueil"
        >
          <PixelLogo />
          PixelArt
        </Link>

        <div className="flex items-center gap-6">
          {navLink("/gallery", "Galerie")}
          {session && navLink("/dashboard", "Mes dessins")}
          {session && navLink("/favorites", "Favoris")}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/editor"
                className="bg-rose-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-rose-700 font-semibold transition-colors"
              >
                + Nouveau
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              {navLink("/login", "Connexion")}
              <Link
                href="/register"
                className="bg-rose-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-rose-700 font-semibold transition-colors"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
