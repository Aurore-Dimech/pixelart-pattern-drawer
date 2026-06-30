import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { NavBar } from "@/components/ui/NavBar";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PixelArt App",
  description: "Créez et partagez vos pixel arts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Lien d'évitement pour les utilisateurs de clavier et lecteurs d'écran */}
        <a href="#main-content" className="skip-link">
          Passer au contenu principal
        </a>
        <SessionProvider>
          <ToastProvider>
            <NavBar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
