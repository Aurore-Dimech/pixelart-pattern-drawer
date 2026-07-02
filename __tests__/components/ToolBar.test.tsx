import { render, screen, fireEvent } from "@testing-library/react";
import { ToolBar } from "@/components/editor/ToolBar";

const DEFAULT_PROPS = {
  activeTool: "pen" as const,
  onToolChange: jest.fn(),
  onUndo: jest.fn(),
  onRedo: jest.fn(),
  onReset: jest.fn(),
  onExportPNG: jest.fn(),
  canUndo: true,
  canRedo: true,
};

beforeEach(() => jest.clearAllMocks());

describe("ToolBar — outil actif", () => {
  it("le bouton Crayon a aria-pressed=true quand activeTool=pen", () => {
    render(<ToolBar {...DEFAULT_PROPS} activeTool="pen" />);
    expect(screen.getByRole("button", { name: /crayon/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /gomme/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("le bouton Gomme a aria-pressed=true quand activeTool=eraser", () => {
    render(<ToolBar {...DEFAULT_PROPS} activeTool="eraser" />);
    expect(screen.getByRole("button", { name: /gomme/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /crayon/i })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("ToolBar — callbacks", () => {
  it("cliquer Crayon appelle onToolChange('pen')", () => {
    const onToolChange = jest.fn();
    render(<ToolBar {...DEFAULT_PROPS} onToolChange={onToolChange} />);
    fireEvent.click(screen.getByRole("button", { name: /crayon/i }));
    expect(onToolChange).toHaveBeenCalledWith("pen");
  });

  it("cliquer Gomme appelle onToolChange('eraser')", () => {
    const onToolChange = jest.fn();
    render(<ToolBar {...DEFAULT_PROPS} onToolChange={onToolChange} />);
    fireEvent.click(screen.getByRole("button", { name: /gomme/i }));
    expect(onToolChange).toHaveBeenCalledWith("eraser");
  });

  it("cliquer Annuler appelle onUndo", () => {
    const onUndo = jest.fn();
    render(<ToolBar {...DEFAULT_PROPS} onUndo={onUndo} />);
    fireEvent.click(screen.getByRole("button", { name: /annuler/i }));
    expect(onUndo).toHaveBeenCalled();
  });

  it("cliquer Rétablir appelle onRedo", () => {
    const onRedo = jest.fn();
    render(<ToolBar {...DEFAULT_PROPS} onRedo={onRedo} />);
    fireEvent.click(screen.getByRole("button", { name: /rétablir/i }));
    expect(onRedo).toHaveBeenCalled();
  });

  it("cliquer Effacer tout appelle onReset", () => {
    const onReset = jest.fn();
    render(<ToolBar {...DEFAULT_PROPS} onReset={onReset} />);
    fireEvent.click(screen.getByRole("button", { name: /effacer tout/i }));
    expect(onReset).toHaveBeenCalled();
  });

  it("cliquer Export PNG appelle onExportPNG", () => {
    const onExportPNG = jest.fn();
    render(<ToolBar {...DEFAULT_PROPS} onExportPNG={onExportPNG} />);
    fireEvent.click(screen.getByRole("button", { name: /export png/i }));
    expect(onExportPNG).toHaveBeenCalled();
  });
});

describe("ToolBar — états désactivés", () => {
  it("Annuler est disabled quand canUndo=false", () => {
    render(<ToolBar {...DEFAULT_PROPS} canUndo={false} />);
    expect(screen.getByRole("button", { name: /annuler/i })).toBeDisabled();
  });

  it("Rétablir est disabled quand canRedo=false", () => {
    render(<ToolBar {...DEFAULT_PROPS} canRedo={false} />);
    expect(screen.getByRole("button", { name: /rétablir/i })).toBeDisabled();
  });
});
