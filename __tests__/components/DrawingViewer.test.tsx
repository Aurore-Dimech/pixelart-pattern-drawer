import { render, screen, fireEvent } from "@testing-library/react";
import { DrawingViewer } from "@/components/gallery/DrawingViewer";

jest.mock("@/lib/pixel-render", () => ({
  renderGridToCanvas: jest.fn(),
  computeCellSize: jest.fn().mockReturnValue(10),
}));

const DRAWING = {
  id: "d-1",
  title: "Mon dessin",
  gridData: JSON.stringify({ width: 4, height: 4, pixels: Array(16).fill("#FFFFFF") }),
  author: { name: "Alice" },
  tags: [{ id: "t-1", name: "nature", slug: "nature" }],
  favoriteCount: 3,
  isFavorited: false,
};

beforeEach(() => jest.clearAllMocks());

describe("DrawingViewer — rendu", () => {
  it("ne rend rien si drawing est null", () => {
    const { container } = render(
      <DrawingViewer drawing={null} onClose={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("affiche le titre et l'auteur", () => {
    render(<DrawingViewer drawing={DRAWING} onClose={jest.fn()} />);
    expect(screen.getByText("Mon dessin")).toBeInTheDocument();
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
  });

  it("affiche les tags", () => {
    render(<DrawingViewer drawing={DRAWING} onClose={jest.fn()} />);
    expect(screen.getByText("nature")).toBeInTheDocument();
  });
});

describe("DrawingViewer — fermeture", () => {
  it("appelle onClose en cliquant le bouton Fermer", () => {
    const onClose = jest.fn();
    render(<DrawingViewer drawing={DRAWING} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("appelle onClose en cliquant le fond", () => {
    const onClose = jest.fn();
    const { container } = render(<DrawingViewer drawing={DRAWING} onClose={onClose} />);
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });

  it("appelle onClose sur la touche Escape", () => {
    const onClose = jest.fn();
    render(<DrawingViewer drawing={DRAWING} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});

describe("DrawingViewer — favori", () => {
  it("affiche le bouton favori quand onToggleFavorite est fourni", () => {
    render(
      <DrawingViewer drawing={DRAWING} onClose={jest.fn()} onToggleFavorite={jest.fn()} isLoggedIn />
    );
    expect(screen.getByRole("button", { name: /favoris/i })).toBeInTheDocument();
  });

  it("n'affiche pas le bouton favori sans onToggleFavorite", () => {
    render(<DrawingViewer drawing={DRAWING} onClose={jest.fn()} />);
    expect(screen.queryByRole("button", { name: /favoris/i })).not.toBeInTheDocument();
  });

  it("le bouton favori est disabled si non connecté", () => {
    render(
      <DrawingViewer drawing={DRAWING} onClose={jest.fn()} onToggleFavorite={jest.fn()} isLoggedIn={false} />
    );
    expect(screen.getByRole("button", { name: /connectez-vous/i })).toBeDisabled();
  });

  it("appelle onToggleFavorite avec l'id du dessin", () => {
    const onToggleFavorite = jest.fn();
    render(
      <DrawingViewer drawing={DRAWING} onClose={jest.fn()} onToggleFavorite={onToggleFavorite} isLoggedIn />
    );
    fireEvent.click(screen.getByRole("button", { name: /favoris/i }));
    expect(onToggleFavorite).toHaveBeenCalledWith("d-1");
  });
});
