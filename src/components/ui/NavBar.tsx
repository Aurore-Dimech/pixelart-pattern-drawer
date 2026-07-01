"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={closeMenu}
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2 font-bold text-rose-600 text-lg tracking-tight"
            aria-label="PixelArt — Accueil"
          >
            <PixelLogo />
            PixelArt
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLink("/gallery", "Galerie")}
            {session && navLink("/dashboard", "Mes dessins")}
            {session && navLink("/favorites", "Favoris")}
          </div>

          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Link
                  href="/editor"
                  onClick={closeMenu}
                  className="bg-rose-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-rose-700 font-semibold transition-colors"
                >
                  + Nouveau
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden md:block text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <span className="hidden md:block">{navLink("/login", "Connexion")}</span>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="bg-rose-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-rose-700 font-semibold transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 -mr-1 text-gray-500 hover:text-gray-900 transition-colors rounded-lg"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-rose-100 py-3 pb-4 flex flex-col gap-3">
            {navLink("/gallery", "Galerie")}
            {session && navLink("/dashboard", "Mes dessins")}
            {session && navLink("/favorites", "Favoris")}
            {!session && navLink("/login", "Connexion")}
            {session && (
              <button
                onClick={() => { signOut({ callbackUrl: "/" }); closeMenu(); }}
                className="text-sm text-left text-gray-400 hover:text-gray-700 transition-colors"
              >
                Déconnexion
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
