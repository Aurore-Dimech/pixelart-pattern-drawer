import { renderHook, act } from "@testing-library/react";
import { usePalette } from "@/hooks/usePalette";
import { DEFAULT_PALETTE } from "@/lib/constants";

jest.mock("@/components/ui/Toast", () => ({
  useToast: jest.fn(),
}));

import { useToast } from "@/components/ui/Toast";

const mockUseToast = useToast as jest.Mock;
const mockToast = jest.fn();

const AI_PALETTE = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FF8800", "#8800FF"];

beforeEach(() => {
  mockUseToast.mockReturnValue({ toast: mockToast });
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

function mockOkFetch(data: unknown) {
  return { ok: true, json: async () => data };
}

function mockErrorFetch() {
  return { ok: false, json: async () => ({}) };
}

describe("usePalette — état initial", () => {
  it("retourne DEFAULT_PALETTE, isCustom false, loading false", () => {
    const { result } = renderHook(() => usePalette());
    expect(result.current.palette).toEqual(DEFAULT_PALETTE);
    expect(result.current.isCustom).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});

describe("usePalette — suggestPalette", () => {
  it("ne fait rien si le thème est vide", async () => {
    const { result } = renderHook(() => usePalette());
    await act(async () => { await result.current.suggestPalette(); });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it("met à jour la palette et isCustom sur succès", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({ data: AI_PALETTE }));
    const { result } = renderHook(() => usePalette());
    await act(async () => { result.current.setTheme("forêt"); });
    await act(async () => { await result.current.suggestPalette(); });
    expect(result.current.isCustom).toBe(true);
    expect(result.current.palette.slice(0, AI_PALETTE.length)).toEqual(AI_PALETTE);
    expect(mockToast).toHaveBeenCalledWith("Palette générée !");
  });

  it("utilise la palette par défaut et toast info si fallback: true", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({ data: AI_PALETTE, fallback: true }));
    const { result } = renderHook(() => usePalette());
    await act(async () => { result.current.setTheme("forêt"); });
    await act(async () => { await result.current.suggestPalette(); });
    expect(result.current.palette).toEqual(DEFAULT_PALETTE);
    expect(result.current.isCustom).toBe(false);
    expect(mockToast).toHaveBeenCalledWith("API indisponible — palette par défaut utilisée", "info");
  });

  it("affiche un toast d'erreur si le fetch retourne non-ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockErrorFetch());
    const { result } = renderHook(() => usePalette());
    await act(async () => { result.current.setTheme("forêt"); });
    await act(async () => { await result.current.suggestPalette(); });
    expect(mockToast).toHaveBeenCalledWith("Erreur lors de la génération", "error");
    expect(result.current.isCustom).toBe(false);
  });

  it("affiche un toast d'erreur réseau si fetch lève une exception", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => usePalette());
    await act(async () => { result.current.setTheme("forêt"); });
    await act(async () => { await result.current.suggestPalette(); });
    expect(mockToast).toHaveBeenCalledWith("Erreur réseau", "error");
  });

  it("passe loading à true pendant le fetch et false après", async () => {
    let resolveRequest!: (v: unknown) => void;
    (global.fetch as jest.Mock).mockReturnValue(
      new Promise((r) => { resolveRequest = r; })
    );
    const { result } = renderHook(() => usePalette());
    await act(async () => { result.current.setTheme("forêt"); });

    act(() => { result.current.suggestPalette(); });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveRequest({ ok: true, json: async () => ({ data: AI_PALETTE }) });
    });
    expect(result.current.loading).toBe(false);
  });
});

describe("usePalette — resetPalette", () => {
  it("remet la palette à DEFAULT_PALETTE et isCustom à false", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({ data: AI_PALETTE }));
    const { result } = renderHook(() => usePalette());
    await act(async () => { result.current.setTheme("forêt"); });
    await act(async () => { await result.current.suggestPalette(); });
    expect(result.current.isCustom).toBe(true);

    act(() => { result.current.resetPalette(); });
    expect(result.current.palette).toEqual(DEFAULT_PALETTE);
    expect(result.current.isCustom).toBe(false);
  });
});

describe("usePalette — setTheme", () => {
  it("met à jour la valeur du thème", () => {
    const { result } = renderHook(() => usePalette());
    act(() => { result.current.setTheme("océan"); });
    expect(result.current.theme).toBe("océan");
  });
});
