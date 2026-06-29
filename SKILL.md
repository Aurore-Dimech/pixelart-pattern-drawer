# SKILL.md — Éditeur Pixel Art

## Nom du skill
`pixel-editor` — Éditeur de dessin pixel art interactif sur grille Canvas

## Intent

Ce skill encapsule toute la logique de l'éditeur pixel art : création d'une grille, dessin pixel par pixel, gestion de la palette, undo/redo, et sérialisation vers le format de stockage.

Il constitue le **cœur fonctionnel** de l'application. Tout le reste (auth, galerie, favoris) gravite autour de ce skill.

---

## Périmètre du skill

### Ce que ce skill couvre
- Rendu d'une grille pixel sur `<canvas>` HTML
- Interaction souris (clic, drag pour dessiner)
- Sélection et gestion de la palette de couleurs
- Outil gomme
- Undo / Redo (historique d'états)
- Zoom de la grille
- Sérialisation / désérialisation du format `GridData`
- Export PNG via `canvas.toDataURL()`

### Ce que ce skill NE couvre PAS
- Sauvegarde en base de données (géré par `api/drawings`)
- Authentification (géré par NextAuth)
- Affichage en galerie (géré par composants `gallery/`)

---

## Format de données : GridData

Le format canonique d'une grille pixel art.

```typescript
interface GridData {
  width: number;   // entre 8 et 64
  height: number;  // entre 8 et 64
  pixels: string[]; // tableau 1D, longueur = width * height, couleurs en hex "#RRGGBB"
}

// Accès à un pixel : pixels[y * width + x]
```

### Exemple minimal (4×4)
```json
{
  "width": 4,
  "height": 4,
  "pixels": [
    "#FF0000", "#FF0000", "#000000", "#000000",
    "#FF0000", "#FF0000", "#000000", "#000000",
    "#000000", "#000000", "#FF0000", "#FF0000",
    "#000000", "#000000", "#FF0000", "#FF0000"
  ]
}
```

---

## Script déterministe : `scripts/validate-grid.ts`

Ce script valide un fichier JSON de grille pixel art et retourne un code de sortie déterministe.

### Comportement
- Exit `0` : grille valide
- Exit `1` : grille invalide (affiche les erreurs)

### Règles de validation
| Règle | Détail |
|---|---|
| `width` et `height` | Entiers entre 8 et 64 |
| `pixels` | Tableau de longueur exacte `width × height` |
| Chaque pixel | String au format `/^#[0-9A-Fa-f]{6}$/` |
| `pixels` non vide | Au moins 1 pixel non blanc (`#FFFFFF`) |

### Usage
```bash
npx ts-node scripts/validate-grid.ts path/to/grid.json
# ✅ Grid valid: 32x32, 1024 pixels
# ❌ Grid invalid: pixels length mismatch (expected 1024, got 512)
```

### Code du script
```typescript
// scripts/validate-grid.ts
import { readFileSync } from "fs";
import { z } from "zod";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const GridDataSchema = z.object({
  width: z.number().int().min(8).max(64),
  height: z.number().int().min(8).max(64),
  pixels: z.array(z.string().regex(HEX_COLOR)),
}).refine(
  (data) => data.pixels.length === data.width * data.height,
  (data) => ({
    message: `pixels length mismatch (expected ${data.width * data.height}, got ${data.pixels.length})`,
  })
).refine(
  (data) => data.pixels.some((p) => p.toUpperCase() !== "#FFFFFF"),
  { message: "Drawing is empty (all pixels are white)" }
);

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: ts-node scripts/validate-grid.ts <path-to-grid.json>");
  process.exit(1);
}

try {
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  const result = GridDataSchema.safeParse(raw);
  if (result.success) {
    console.log(`✅ Grid valid: ${result.data.width}x${result.data.height}, ${result.data.pixels.length} pixels`);
    process.exit(0);
  } else {
    console.error("❌ Grid invalid:");
    result.error.errors.forEach((e) => console.error(`  - ${e.path.join(".")}: ${e.message}`));
    process.exit(1);
  }
} catch (err) {
  console.error("❌ Failed to read or parse file:", err);
  process.exit(1);
}
```

---

## Composants React associés

| Composant | Fichier | Rôle |
|---|---|---|
| `PixelEditor` | `components/editor/PixelEditor.tsx` | Composant racine de l'éditeur |
| `PixelCanvas` | `components/editor/PixelCanvas.tsx` | Canvas HTML5 avec handlers souris |
| `ColorPalette` | `components/editor/ColorPalette.tsx` | Sélecteur de couleurs + couleur active |
| `ToolBar` | `components/editor/ToolBar.tsx` | Crayon, gomme, zoom, undo, redo |
| `GridSizeSelector` | `components/editor/GridSizeSelector.tsx` | Sélection 8×8 jusqu'à 64×64 |

---

## Hook principal : `usePixelGrid`

```typescript
// hooks/usePixelGrid.ts
interface UsePixelGridReturn {
  grid: GridData;
  activeColor: string;
  setActiveColor: (color: string) => void;
  paintPixel: (x: number, y: number) => void;
  erasePixel: (x: number, y: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: () => void;
  exportPNG: () => string; // retourne data URL
  serialize: () => string; // retourne JSON string
}
```

---

## Palette par défaut

```typescript
export const DEFAULT_PALETTE = [
  "#000000", // Noir
  "#FFFFFF", // Blanc
  "#FF0000", // Rouge
  "#00FF00", // Vert
  "#0000FF", // Bleu
  "#FFFF00", // Jaune
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FF8800", // Orange
  "#8800FF", // Violet
  "#00FF88", // Vert menthe
  "#FF0088", // Rose
  "#888888", // Gris
  "#884400", // Marron
  "#004488", // Bleu marine
  "#448800", // Vert olive
];
```

---

## Intégration IA : suggestion de palette

Quand l'utilisateur clique sur **"Suggérer une palette"** et entre un thème :

1. Appel `POST /api/ai/palette` avec `{ theme: string }`
2. Le serveur appelle l'API Anthropic avec le prompt :
   ```
   Génère une palette de 8 couleurs harmonieuses pour un pixel art sur le thème "{theme}".
   Réponds UNIQUEMENT avec un JSON array de 8 codes hex, exemple: ["#FF0000", "#00FF00", ...]
   ```
3. La réponse remplace les 8 premières couleurs de la palette active
4. En cas d'erreur API → fallback sur `DEFAULT_PALETTE`

---

## Tests associés

| Test | Fichier | Type |
|---|---|---|
| Validation GridData schema | `__tests__/validators/drawing.test.ts` | Unitaire |
| `paintPixel` met à jour le bon index | `__tests__/hooks/usePixelGrid.test.ts` | Unitaire |
| Undo/Redo retourne à l'état précédent | `__tests__/hooks/usePixelGrid.test.ts` | Unitaire |
| Sérialisation → désérialisation | `__tests__/hooks/usePixelGrid.test.ts` | Unitaire |
| Rendu PixelCanvas | `__tests__/components/PixelCanvas.test.tsx` | Composant |