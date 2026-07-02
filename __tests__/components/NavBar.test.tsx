import { render, screen, fireEvent } from "@testing-library/react";
import { NavBar } from "@/components/ui/NavBar";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  );
  Link.displayName = "Link";
  return Link;
});

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const mockUseSession = useSession as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePathname.mockReturnValue("/");
});

describe("NavBar — non connecté", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({ data: null });
  });

  it("affiche le lien Galerie", () => {
    render(<NavBar />);
    expect(screen.getAllByRole("link", { name: /galerie/i })[0]).toBeInTheDocument();
  });

  it("affiche le lien Connexion", () => {
    render(<NavBar />);
    expect(screen.getAllByRole("link", { name: /connexion/i })[0]).toBeInTheDocument();
  });

  it("n'affiche pas le lien Mes dessins", () => {
    render(<NavBar />);
    expect(screen.queryByRole("link", { name: /mes dessins/i })).not.toBeInTheDocument();
  });
});

describe("NavBar — connecté", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({ data: { user: { id: "u-1", name: "Alice" } } });
  });

  it("affiche le lien Mes dessins", () => {
    render(<NavBar />);
    expect(screen.getAllByRole("link", { name: /mes dessins/i })[0]).toBeInTheDocument();
  });

  it("affiche le bouton Nouveau", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: /\+ nouveau/i })).toBeInTheDocument();
  });

  it("n'affiche pas le lien Connexion", () => {
    render(<NavBar />);
    expect(screen.queryByRole("link", { name: /connexion/i })).not.toBeInTheDocument();
  });
});

describe("NavBar — menu mobile", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({ data: null });
  });

  it("le menu mobile s'ouvre et se ferme au clic", () => {
    render(<NavBar />);
    const toggle = screen.getByRole("button", { name: /ouvrir le menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: /fermer le menu/i })).toHaveAttribute("aria-expanded", "true");
  });
});

describe("NavBar — lien actif", () => {
  it("le lien courant a aria-current=page", () => {
    mockUseSession.mockReturnValue({ data: null });
    mockUsePathname.mockReturnValue("/gallery");
    render(<NavBar />);
    const galleryLinks = screen.getAllByRole("link", { name: /galerie/i });
    const activeLink = galleryLinks.find(l => l.getAttribute("aria-current") === "page");
    expect(activeLink).toBeDefined();
  });
});
