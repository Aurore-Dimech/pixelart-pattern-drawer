import { renderHook, act } from "@testing-library/react";
import { useDrawingActions, Drawing } from "@/hooks/useDrawingActions";

jest.mock("@/components/ui/Toast", () => ({
  useToast: jest.fn(),
}));

import { useToast } from "@/components/ui/Toast";

const mockUseToast = useToast as jest.Mock;
const mockToast = jest.fn();

const DRAWINGS: Drawing[] = [
  { id: "d-1", title: "Mon dessin", gridData: "{}", isPublished: false, updatedAt: "2024-01-01", tags: [] },
  { id: "d-2", title: "Autre dessin", gridData: "{}", isPublished: true, updatedAt: "2024-01-02", tags: [] },
];

beforeEach(() => {
  mockUseToast.mockReturnValue({ toast: mockToast });
  jest.clearAllMocks();
  global.fetch = jest.fn();
  global.confirm = jest.fn();
});

function mockOkFetch(data: unknown) {
  return { ok: true, json: async () => data };
}

function mockErrorFetch() {
  return { ok: false, json: async () => ({}) };
}

describe("useDrawingActions — togglePublish", () => {
  it("met isPublished à true et affiche le toast 'publié'", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({ data: { isPublished: true } }));

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.togglePublish("d-1", false); });

    expect(result.current.drawings.find((d) => d.id === "d-1")?.isPublished).toBe(true);
    expect(mockToast).toHaveBeenCalledWith("Dessin publié dans la galerie");
  });

  it("met isPublished à false et affiche le toast 'dépublié'", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({ data: { isPublished: false } }));

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.togglePublish("d-2", true); });

    expect(result.current.drawings.find((d) => d.id === "d-2")?.isPublished).toBe(false);
    expect(mockToast).toHaveBeenCalledWith("Dessin dépublié");
  });

  it("affiche un toast d'erreur si le fetch échoue (status non-ok)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockErrorFetch());

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.togglePublish("d-1", false); });

    expect(mockToast).toHaveBeenCalledWith("Erreur lors de la publication", "error");
    expect(result.current.drawings.find((d) => d.id === "d-1")?.isPublished).toBe(false);
  });

  it("affiche un toast d'erreur si isPublished absent de la réponse", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({ data: {} }));

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.togglePublish("d-1", false); });

    expect(mockToast).toHaveBeenCalledWith("Erreur lors de la publication", "error");
  });

  it("envoie POST vers /api/drawings/[id]/publish avec le bon body", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({ data: { isPublished: true } }));

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.togglePublish("d-1", false); });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/drawings/d-1/publish",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ publish: true }),
      })
    );
  });

  it("remet pending[id] à false après la réponse", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({ data: { isPublished: true } }));

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.togglePublish("d-1", false); });

    expect(result.current.pending["d-1"]).toBe(false);
  });
});

describe("useDrawingActions — deleteDrawing", () => {
  it("ne fait rien si l'utilisateur annule le confirm", async () => {
    (global.confirm as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.deleteDrawing("d-1", "Mon dessin"); });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.drawings).toHaveLength(2);
    expect(mockToast).not.toHaveBeenCalled();
  });

  it("retire le dessin de la liste et affiche le toast 'supprimé' en cas de succès", async () => {
    (global.confirm as jest.Mock).mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({}));

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.deleteDrawing("d-1", "Mon dessin"); });

    expect(result.current.drawings).toHaveLength(1);
    expect(result.current.drawings[0].id).toBe("d-2");
    expect(mockToast).toHaveBeenCalledWith("Dessin supprimé");
  });

  it("affiche un toast d'erreur et conserve le dessin si le fetch échoue", async () => {
    (global.confirm as jest.Mock).mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue(mockErrorFetch());

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.deleteDrawing("d-1", "Mon dessin"); });

    expect(result.current.drawings).toHaveLength(2);
    expect(mockToast).toHaveBeenCalledWith("Erreur lors de la suppression", "error");
  });

  it("envoie DELETE vers /api/drawings/[id]", async () => {
    (global.confirm as jest.Mock).mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({}));

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.deleteDrawing("d-1", "Mon dessin"); });

    expect(global.fetch).toHaveBeenCalledWith("/api/drawings/d-1", { method: "DELETE" });
  });

  it("remet pending[id] à false après la réponse", async () => {
    (global.confirm as jest.Mock).mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue(mockOkFetch({}));

    const { result } = renderHook(() => useDrawingActions(DRAWINGS));
    await act(async () => { await result.current.deleteDrawing("d-1", "Mon dessin"); });

    expect(result.current.pending["d-1"]).toBe(false);
  });
});
