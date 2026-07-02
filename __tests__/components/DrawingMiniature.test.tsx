import { render } from "@testing-library/react";
import { DrawingMiniature } from "@/components/gallery/DrawingMiniature";

jest.mock("@/lib/pixel-render", () => ({
  renderGridToCanvas: jest.fn(),
  computeCellSize: jest.fn().mockReturnValue(4),
}));

import { renderGridToCanvas } from "@/lib/pixel-render";

const mockRenderGridToCanvas = renderGridToCanvas as jest.Mock;

const VALID_GRID = JSON.stringify({ width: 8, height: 8, pixels: Array(64).fill("#FFFFFF") });

beforeEach(() => jest.clearAllMocks());

describe("DrawingMiniature", () => {
  it("rend un élément canvas", () => {
    const { container } = render(<DrawingMiniature gridData={VALID_GRID} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("appelle renderGridToCanvas avec la grille parsée", () => {
    render(<DrawingMiniature gridData={VALID_GRID} />);
    expect(mockRenderGridToCanvas).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      expect.objectContaining({ width: 8, height: 8 }),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it("ne plante pas si gridData est du JSON invalide", () => {
    expect(() => render(<DrawingMiniature gridData="invalid json" />)).not.toThrow();
    expect(mockRenderGridToCanvas).not.toHaveBeenCalled();
  });
});
