"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
          <p className="text-sm text-gray-500 mt-1">Bon retour sur PixelArt !</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ton@email.com"
              aria-describedby={error ? "login-error" : undefined}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              aria-describedby={error ? "login-error" : undefined}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
            />
          </div>

          {error && (
            <div id="login-error" role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-disabled={loading}
            className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Connexion en cours…" : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-500">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-rose-600 font-medium hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
