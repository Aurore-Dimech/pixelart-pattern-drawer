"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") ?? "") as string;
    const email = (form.get("email") ?? "") as string;
    const password = (form.get("password") ?? "") as string;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Compte créé mais connexion automatique échouée. Connecte-toi manuellement.");
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-sm text-gray-500 mt-1">Rejoins la communauté PixelArt</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom d&apos;utilisateur
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={32}
              pattern="[a-zA-Z0-9_\-]+"
              title="Lettres, chiffres, _ et - uniquement"
              placeholder="ex: pixel_master42"
              autoComplete="username"
              aria-describedby="reg-name-hint"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
            />
            <p id="reg-name-hint" className="text-xs text-gray-400 mt-1.5">
              Lettres, chiffres, _ et - · Visible publiquement
            </p>
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ton@email.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimum 6 caractères"
              aria-describedby="reg-password-hint"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
            />
            <p id="reg-password-hint" className="sr-only">Le mot de passe doit contenir au moins 6 caractères</p>
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-disabled={loading}
            className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Création en cours…" : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-rose-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
