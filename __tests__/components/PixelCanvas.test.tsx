import { render, screen, fireEvent } from "@testing-library/react";
import { PixelCanvas } from "@/components/editor/PixelCanvas";
import { GridData } from "@/types";

jest.mock("@/lib/pixel-render", () => ({
  renderGridToCanvas: jest.fn(),
}));

const GRID: GridData = { width: 4, height: 4, pixels: Array(16).fill("#FFFFFF") };

beforeEach(() => jest.clearAllMocks());

describe("PixelCanvas", () => {
  it("rend un canvas avec le bon aria-label", () => {
    render(<PixelCanvas grid={GRID} onPaint={jest.fn()} />);
    expect(screen.getByRole("application")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("4 colonnes × 4 lignes")
    );
  });

  it("appelle onPaint au mousedown", () => {
    const onPaint = jest.fn();
    render(<PixelCanvas grid={GRID} onPaint={onPaint} />);
    const canvas = screen.getByRole("application");

    Object.defineProperty(canvas, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 112, height: 112 }),
    });
    Object.defineProperty(canvas, "width", { value: 112 });
    Object.defineProperty(canvas, "height", { value: 112 });

    fireEvent.mouseDown(canvas, { clientX: 14, clientY: 14 });
    expect(onPaint).toHaveBeenCalledWith(0, 0);
  });

  it("appelle onPaint au mousemove uniquement si le bouton est maintenu", () => {
    const onPaint = jest.fn();
    render(<PixelCanvas grid={GRID} onPaint={onPaint} />);
    const canvas = screen.getByRole("application");

    Object.defineProperty(canvas, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 112, height: 112 }),
    });
    Object.defineProperty(canvas, "width", { value: 112 });
    Object.defineProperty(canvas, "height", { value: 112 });

    fireEvent.mouseMove(canvas, { clientX: 14, clientY: 14 });
    expect(onPaint).not.toHaveBeenCalled();

    fireEvent.mouseDown(canvas, { clientX: 14, clientY: 14 });
    fireEvent.mouseMove(canvas, { clientX: 42, clientY: 14 });
    expect(onPaint).toHaveBeenCalledTimes(2);
  });

  it("arrête de peindre après mouseup", () => {
    const onPaint = jest.fn();
    render(<PixelCanvas grid={GRID} onPaint={onPaint} />);
    const canvas = screen.getByRole("application");

    Object.defineProperty(canvas, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 112, height: 112 }),
    });
    Object.defineProperty(canvas, "width", { value: 112 });
    Object.defineProperty(canvas, "height", { value: 112 });

    fireEvent.mouseDown(canvas, { clientX: 14, clientY: 14 });
    fireEvent.mouseUp(canvas);
    fireEvent.mouseMove(canvas, { clientX: 42, clientY: 14 });
    expect(onPaint).toHaveBeenCalledTimes(1);
  });
});
