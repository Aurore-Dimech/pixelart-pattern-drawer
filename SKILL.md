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
- Interaction souris (clic, drag pour dessiner ou effacer)
- Sélection et gestion de la palette de couleurs
- Outil crayon et outil gomme (sélection via `activeTool`)
- Undo / Redo (historique d'états, limité à 50 entrées)
- Sérialisation / désérialisation du format `GridData`
- Export PNG via `canvas.toDataURL()` (dans `PixelEditor`)
- Suggestion de palette par IA (`ColorPalette` → `POST /api/ai/palette`)

### Ce que ce skill NE couvre PAS
- Sauvegarde en base de données (géré par `api/drawings`)
- Authentification (géré par NextAuth)
- Affichage en galerie (géré par composants `gallery/`)

---

## Format de données : GridData

Le format canonique d'une grille pixel art.

```typescript
interface GridData {
  width: number;    // entre 8 et 64
  height: number;   // entre 8 et 64
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
# ✅ Grille valide : 32×32, 1024 pixels
# ❌ Grille invalide : longueur pixels incorrecte (attendu 1024, reçu 512)
```

---

## Composants React associés

| Composant | Fichier | Rôle |
|---|---|---|
| `PixelEditor` | `components/editor/PixelEditor.tsx` | Composant racine : assemble la sidebar et le canvas, gère la sauvegarde |
| `PixelCanvas` | `components/editor/PixelCanvas.tsx` | Canvas HTML5 avec handlers souris, numéros de lignes/colonnes en HTML |
| `ColorPalette` | `components/editor/ColorPalette.tsx` | Palette de couleurs, sélecteur libre, suggestion IA |
| `ToolBar` | `components/editor/ToolBar.tsx` | Crayon, gomme, annuler, rétablir, effacer tout, export PNG |
| `PixelEditorEditClient` | `components/editor/PixelEditorEditClient.tsx` | Wrapper client pour l'édition d'un dessin existant (barre de tags) |

---

## Hook principal : `usePixelGrid`

```typescript
// hooks/usePixelGrid.ts
interface UsePixelGridReturn {
  grid: GridData;
  activeColor: string;
  activeTool: "pen" | "eraser";
  setActiveColor: (color: string) => void;
  setActiveTool: (tool: "pen" | "eraser") => void;
  paintPixel: (x: number, y: number) => void;  // dessine ou efface selon activeTool
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: () => void;          // remet tous les pixels à blanc
  serialize: () => string;    // retourne JSON string
  loadFromData: (data: GridData) => void; // charge un dessin existant (reset historique)
}
```

> L'historique undo/redo est limité à **50 entrées** (`MAX_HISTORY = 50`). Au-delà, les états les plus anciens sont supprimés.

---

## Palette par défaut

```typescript
// src/lib/constants.ts
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

Quand l'utilisateur saisit un thème et clique sur **"Générer"** :

1. Appel `POST /api/ai/palette` avec `{ theme: string }`
2. Le serveur appelle l'API Anthropic (`claude-haiku-4-5-20251001`) avec le prompt :
   ```
   Génère une palette de 8 couleurs harmonieuses pour un pixel art sur le thème "{theme}".
   Réponds UNIQUEMENT avec un JSON array de 8 codes hex, exemple: ["#FF0000", "#00FF00", ...]
   ```
3. La réponse remplace les 8 premières couleurs de la palette active
4. En cas d'erreur API → fallback sur `DEFAULT_PALETTE`, toast informatif

---

## Tests associés

| Test | Fichier | Type |
|---|---|---|
| Validation GridData schema | `__tests__/validators/drawing.test.ts` | Unitaire |
| `paintPixel` met à jour le bon index | `__tests__/hooks/usePixelGrid.test.ts` | Unitaire |
| Undo/Redo retourne à l'état précédent | `__tests__/hooks/usePixelGrid.test.ts` | Unitaire |
| Sérialisation → désérialisation | `__tests__/hooks/usePixelGrid.test.ts` | Unitaire |
