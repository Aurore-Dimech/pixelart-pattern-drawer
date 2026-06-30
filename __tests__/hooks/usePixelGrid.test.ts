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

  it("eraser tool sets pixel to white regardless of active color", () => {
    const { result } = renderHook(() => usePixelGrid());
    act(() => { result.current.setActiveColor(RED); });
    act(() => { result.current.paintPixel(3, 0); });
    expect(result.current.grid.pixels[3]).toBe(RED);
    act(() => { result.current.setActiveTool("eraser"); });
    act(() => { result.current.paintPixel(3, 0); });
    expect(result.current.grid.pixels[3]).toBe(WHITE);
  });

  it("reset clears the grid and adds to history (canUndo becomes true)", () => {
    const { result } = renderHook(() => usePixelGrid());
    act(() => { result.current.setActiveColor(RED); });
    act(() => { result.current.paintPixel(4, 0); });
    act(() => { result.current.reset(); });
    expect(result.current.grid.pixels[4]).toBe(WHITE);
    expect(result.current.canUndo).toBe(true);
  });

  it("loadFromData replaces the grid and clears history", () => {
    const { result } = renderHook(() => usePixelGrid());
    act(() => { result.current.setActiveColor(RED); });
    act(() => { result.current.paintPixel(5, 0); });
    const customGrid = { width: 16, height: 16, pixels: Array(256).fill(RED) };
    act(() => { result.current.loadFromData(customGrid); });
    expect(result.current.grid.pixels[0]).toBe(RED);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("canUndo is false initially, true after painting", () => {
    const { result } = renderHook(() => usePixelGrid());
    expect(result.current.canUndo).toBe(false);
    act(() => { result.current.setActiveColor(RED); });
    act(() => { result.current.paintPixel(6, 0); });
    expect(result.current.canUndo).toBe(true);
  });

  it("canRedo is false initially, true after undo", () => {
    const { result } = renderHook(() => usePixelGrid());
    expect(result.current.canRedo).toBe(false);
    act(() => { result.current.setActiveColor(RED); });
    act(() => { result.current.paintPixel(7, 0); });
    act(() => { result.current.undo(); });
    expect(result.current.canRedo).toBe(true);
  });
});
