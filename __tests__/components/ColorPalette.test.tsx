import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPalette } from "@/components/editor/ColorPalette";
import { DEFAULT_PALETTE } from "@/lib/constants";

jest.mock("@/hooks/usePalette", () => ({
  usePalette: jest.fn(),
}));

import { usePalette } from "@/hooks/usePalette";

const mockUsePalette = usePalette as jest.Mock;

const BASE_HOOK = {
  palette: DEFAULT_PALETTE,
  isCustom: false,
  theme: "",
  setTheme: jest.fn(),
  loading: false,
  suggestPalette: jest.fn(),
  resetPalette: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePalette.mockReturnValue({ ...BASE_HOOK });
});

describe("ColorPalette — grille de couleurs", () => {
  it("affiche un bouton par couleur de la palette", () => {
    render(<ColorPalette activeColor={DEFAULT_PALETTE[0]} onColorSelect={jest.fn()} />);
    const buttons = screen.getAllByRole("button", { name: /sélectionner la couleur/i });
    expect(buttons).toHaveLength(DEFAULT_PALETTE.length);
  });

  it("appelle onColorSelect avec la couleur cliquée", () => {
    const onColorSelect = jest.fn();
    render(<ColorPalette activeColor={DEFAULT_PALETTE[0]} onColorSelect={onColorSelect} />);
    fireEvent.click(screen.getAllByRole("button", { name: /sélectionner la couleur/i })[1]);
    expect(onColorSelect).toHaveBeenCalledWith(DEFAULT_PALETTE[1]);
  });

  it("la couleur active a aria-pressed=true", () => {
    render(<ColorPalette activeColor={DEFAULT_PALETTE[0]} onColorSelect={jest.fn()} />);
    const activeBtn = screen.getByRole("button", { name: new RegExp(DEFAULT_PALETTE[0], "i") });
    expect(activeBtn).toHaveAttribute("aria-pressed", "true");
  });
});

describe("ColorPalette — input thème IA", () => {
  it("appelle setTheme quand l'utilisateur tape un thème", () => {
    const setTheme = jest.fn();
    mockUsePalette.mockReturnValue({ ...BASE_HOOK, setTheme });
    render(<ColorPalette activeColor={DEFAULT_PALETTE[0]} onColorSelect={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/thème/i), { target: { value: "forêt" } });
    expect(setTheme).toHaveBeenCalledWith("forêt");
  });

  it("le bouton Générer est disabled si le thème est vide", () => {
    mockUsePalette.mockReturnValue({ ...BASE_HOOK, theme: "" });
    render(<ColorPalette activeColor={DEFAULT_PALETTE[0]} onColorSelect={jest.fn()} />);
    expect(screen.getByRole("button", { name: /générer/i })).toBeDisabled();
  });

  it("le bouton Générer est actif si le thème n'est pas vide", () => {
    mockUsePalette.mockReturnValue({ ...BASE_HOOK, theme: "forêt" });
    render(<ColorPalette activeColor={DEFAULT_PALETTE[0]} onColorSelect={jest.fn()} />);
    expect(screen.getByRole("button", { name: /générer/i })).not.toBeDisabled();
  });

  it("le bouton Reset est visible uniquement quand isCustom=true", () => {
    mockUsePalette.mockReturnValue({ ...BASE_HOOK, isCustom: true, theme: "forêt" });
    render(<ColorPalette activeColor={DEFAULT_PALETTE[0]} onColorSelect={jest.fn()} />);
    expect(screen.getByRole("button", { name: /restaurer/i })).toBeInTheDocument();
  });

  it("le bouton Reset est absent quand isCustom=false", () => {
    render(<ColorPalette activeColor={DEFAULT_PALETTE[0]} onColorSelect={jest.fn()} />);
    expect(screen.queryByRole("button", { name: /restaurer/i })).not.toBeInTheDocument();
  });
});
