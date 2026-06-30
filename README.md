# PixelArt App

Application web full-stack pour créer, sauvegarder, tagger et partager des dessins en pixel art. Les utilisateurs publient leurs créations dans une galerie publique et peuvent enregistrer celles des autres en favoris.

## Fonctionnalités

- **Éditeur pixel art** — grille de 8×8 à 64×64 pixels, outil crayon/gomme, palette de couleurs, annuler/rétablir, numéros de lignes et colonnes
- **Suggestion de palette par IA** — génère une palette harmonieuse de 8 couleurs à partir d'un thème via l'API Anthropic (avec fallback gracieux)
- **Comptes utilisateurs** — inscription avec pseudo public unique, l'email reste privé
- **Galerie** — parcourir tous les dessins publiés avec recherche (par titre) et filtrage par tag côté serveur, paginée
- **Tags** — jusqu'à 3 tags par dessin, stockés dans une table relationnelle dédiée
- **Favoris** — sauvegarder et retirer des favoris, consulter sa liste de favoris
- **Dashboard** — gérer ses dessins : éditer, publier/dépublier, supprimer
- **Export PNG** — télécharger son dessin en haute résolution via la Canvas API native
- **Accessibilité WCAG 2.1 AA** — lien d'évitement, focus visible, piège de focus sur les modales, `aria-*` complets, respect de `prefers-reduced-motion`

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript strict |
| Styles | Tailwind CSS |
| Auth | NextAuth.js v5 |
| ORM | Prisma |
| Base de données | SQLite (dev) |
| Validation | Zod |
| Tests | Jest + Testing Library |
| IA | Anthropic API (`claude-haiku-4-5-20251001`) |

## Installation

### Prérequis

- Node.js 18+
- Une clé API Anthropic (optionnelle — l'app fonctionne avec un fallback si absente)

### Installer les dépendances

```bash
npm install
```

### Configurer l'environnement

```bash
cp .env.example .env
```

Remplir le fichier `.env` :

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="votre-secret-ici"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."   # optionnel
```

### Base de données

```bash
npx prisma migrate dev
```

### Lancer le serveur

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev            # Serveur de développement
npm run build          # Build de production
npm run lint           # ESLint (0 erreur attendue)
npm run test           # Tests Jest
npx ts-node scripts/validate-grid.ts <fichier.json>  # Validateur de grille
npx prisma studio      # Interface base de données
```

## Structure du projet

```
src/
├── app/               # Pages et routes API (Next.js App Router)
│   ├── api/           # Endpoints REST (drawings, favorites, auth, IA)
│   ├── (auth)/        # Pages login et register
│   ├── gallery/       # Galerie publique
│   ├── editor/        # Éditeur pixel art (nouveau + édition par id)
│   ├── dashboard/     # Mes dessins
│   └── favorites/     # Mes favoris
├── components/
│   ├── editor/        # PixelCanvas, ColorPalette, ToolBar, PixelEditor
│   ├── gallery/       # DrawingMiniature, DrawingViewer
│   └── ui/            # NavBar, Toast
├── hooks/             # usePixelGrid (état grille + undo/redo)
├── lib/               # Client Prisma, config NextAuth, validateurs Zod
└── types/             # Types TypeScript partagés
```

## Modèle de données

- **User** — id, name (public), email (privé), passwordHash
- **Drawing** — id, title, gridData (JSON), isPublished, authorId
- **Tag** — id, name, slug (max 3 par dessin)
- **DrawingTag** — PK composite (drawingId, tagId)
- **Favorite** — PK composite (userId, drawingId)

## Gate déterministe

Les données de grille sont validées par `GridDataSchema` (dans `src/lib/validators/drawing.ts`) avant chaque sauvegarde :
- Largeur et hauteur entre 8 et 64
- Nombre de pixels = largeur × hauteur
- Chaque couleur est un code hex valide (`#RRGGBB`)

Lancer le validateur standalone :

```bash
npx ts-node scripts/validate-grid.ts path/to/grid.json
# ✅ Grille valide : 32×32, 1024 pixels
# ❌ Grille invalide : longueur pixels incorrecte (attendu 1024, reçu 512)
```

## Intégration IA

`POST /api/ai/palette` accepte un body `{ theme: string }` et retourne un tableau de 8 codes hex générés par `claude-haiku-4-5-20251001`. Si la clé API est absente ou l'appel échoue, l'endpoint retourne la palette par défaut avec `fallback: true` — l'UI s'adapte en conséquence.

## Collaboration humain/IA

Voir [`docs/ai-collaboration.md`](docs/ai-collaboration.md) pour une analyse critique de la construction de ce projet avec Claude Code.

## Dette technique

Voir [`docs/tech-debt.md`](docs/tech-debt.md) pour un audit honnête des limitations et raccourcis connus.
