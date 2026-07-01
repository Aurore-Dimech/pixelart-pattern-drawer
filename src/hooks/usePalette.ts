"use client";

import { useState } from "react";
import { DEFAULT_PALETTE } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

interface PaletteResponse {
  data?: string[];
  fallback?: boolean;
}

function mergePalette(aiColors: string[]): string[] {
  return [...aiColors, ...DEFAULT_PALETTE].slice(0, 16);
}

export function usePalette() {
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [isCustom, setIsCustom] = useState(false);
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const suggestPalette = async (): Promise<void> => {
    if (!theme.trim()) return;
    setLoading(true);
    const headers = { "Content-Type": "application/json" };
    const body = JSON.stringify({ theme });
    try {
      const res = await fetch("/api/ai/palette", { method: "POST", headers, body });
      const json = await res.json() as PaletteResponse;
      if (!res.ok || !json.data) { toast("Erreur lors de la génération", "error"); return; }
      if (json.fallback) {
        setPalette(DEFAULT_PALETTE);
        setIsCustom(false);
        toast("API indisponible — palette par défaut utilisée", "info");
        return;
      }
      setPalette(mergePalette(json.data));
      setIsCustom(true);
      toast("Palette générée !");
    } catch {
      toast("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetPalette = (): void => {
    setPalette(DEFAULT_PALETTE);
    setIsCustom(false);
  };

  return { palette, isCustom, theme, setTheme, loading, suggestPalette, resetPalette };
}
