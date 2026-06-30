import { renderHook, act } from "@testing-library/react";
import { usePixelGrid } from "@/hooks/usePixelGrid";

const RED = "#FF0000";
const WHITE = "#FFFFFF";

describe("usePixelGrid", () => {
  it("paintPixel sets the correct pixel to the active color", () => {
    const { result } = renderHook(() => usePixelGrid());
    act(() => { result.current.setActiveColor(RED); });
    act(() => { result.current.paintPixel(0, 0); });
    expect(result.current.grid.pixels[0]).toBe(RED);
  });

  it("undo reverts the last paint", () => {
    const { result } = renderHook(() => usePixelGrid());
    act(() => { result.current.setActiveColor(RED); });
    act(() => { result.current.paintPixel(1, 0); });
    expect(result.current.grid.pixels[1]).toBe(RED);
    act(() => { result.current.undo(); });
    expect(result.current.grid.pixels[1]).toBe(WHITE);
  });

  it("redo re-applies the undone paint", () => {
    const { result } = renderHook(() => usePixelGrid());
    act(() => { result.current.setActiveColor(RED); });
    act(() => { result.current.paintPixel(2, 0); });
    act(() => { result.current.undo(); });
    act(() => { result.current.redo(); });
    expect(result.current.grid.pixels[2]).toBe(RED);
  });

  it("serialize returns valid JSON with correct dimensions", () => {
    const { result } = renderHook(() => usePixelGrid());
    const json = result.current.serialize();
    const parsed = JSON.parse(json);
    expect(parsed.width).toBe(16);
    expect(parsed.height).toBe(16);
    expect(parsed.pixels).toHaveLength(256);
  });
});
