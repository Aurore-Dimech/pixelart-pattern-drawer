import { render, screen, fireEvent } from "@testing-library/react";
import { TagInput, parseTags } from "@/components/editor/TagInput";

describe("parseTags", () => {
  it("sépare par virgule et trim", () => {
    expect(parseTags("nature, espace, fantasy")).toEqual(["nature", "espace", "fantasy"]);
  });

  it("met en minuscule et remplace les espaces par des tirets", () => {
    expect(parseTags("Pixel Art, Rétro")).toEqual(["pixel-art", "rétro"]);
  });

  it("filtre les entrées vides", () => {
    expect(parseTags("a,,b, ,c")).toEqual(["a", "b", "c"]);
  });

  it("retourne un tableau vide si la chaîne est vide", () => {
    expect(parseTags("")).toEqual([]);
  });
});

describe("TagInput", () => {
  it("affiche le compteur au format X/3", () => {
    render(<TagInput value="nature, espace" onChange={jest.fn()} />);
    expect(screen.getByText("2/3")).toBeInTheDocument();
  });

  it("applique le style rouge quand le compteur dépasse 3", () => {
    render(<TagInput value="a, b, c, d" onChange={jest.fn()} />);
    expect(screen.getByText("4/3")).toHaveClass("text-red-500");
  });

  it("appelle onChange quand l'utilisateur tape", () => {
    const onChange = jest.fn();
    render(<TagInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "nature" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("affiche la valeur passée en prop", () => {
    render(<TagInput value="nature, espace" onChange={jest.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("nature, espace");
  });
});
