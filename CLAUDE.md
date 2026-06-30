# CLAUDE.md — PixelArt App

## Intent du projet

Application web permettant aux utilisateurs de créer, sauvegarder et partager des dessins en pixel art. Les utilisateurs peuvent publier leurs créations dans une galerie publique et enregistrer les œuvres d'autres utilisateurs en favoris.

**Audience cible** : créateurs de pixel art amateurs, gamers, designers rétro.  
**Objectif pédagogique** : démontrer une collaboration humain/IA structurée sur un vrai produit full-stack.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Langage | TypeScript strict |
| Styles | Tailwind CSS |
| Auth | NextAuth.js v5 (beta) |
| ORM | Prisma |
| Base de données | SQLite (dev) |
| Validation | Zod |
| Tests | Jest + Testing Library |
| Lint | ESLint + Prettier |

---

## Conventions de nommage

### Fichiers et dossiers
- **Composants React** : PascalCase → `PixelEditor.tsx`, `DrawingCard.tsx`
- **Hooks** : camelCase préfixé `use` → `usePixelGrid.ts`, `useDrawings.ts`
- **Utilitaires / lib** : camelCase → `prisma.ts`, `validators.ts`
- **API routes** : kebab-case → `api/drawings/[id]/route.ts`
- **Types** : PascalCase dans `/src/types/` → `Drawing.ts`, `User.ts`
- **Constantes** : SCREAMING_SNAKE_CASE → `MAX_GRID_SIZE`, `DEFAULT_PALETTE`

### Code TypeScript
- Préférer `interface` pour les types d'objets métier, `type` pour les unions/intersections
- Pas de `any` — utiliser `unknown` si nécessaire
- Toujours typer les retours de fonctions asynchrones : `Promise<Drawing>`
- Les Server Components sont la valeur par défaut ; ajouter `"use client"` seulement si nécessaire

### Base de données (Prisma)
- Modèles en PascalCase singulier : `User`, `Drawing`, `Favorite`
- Champs en camelCase : `createdAt`, `isPublished`, `gridData`
- IDs : `cuid()` (Prisma default)

### API REST
- Ressources au pluriel : `/api/drawings`, `/api/favorites`
- Actions imbriquées : `/api/drawings/[id]/publish`, `/api/drawings/[id]/favorite`
- Réponses toujours typées avec un wrapper `{ data, error }`

---

## Structure des dossiers

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # Routes API (Server)
│   │   ├── auth/
│   │   ├── drawings/
│   │   └── favorites/
│   ├── (auth)/             # Route group — pages auth (non indexées)
│   │   ├── login/
│   │   └── register/
│   ├── gallery/            # Galerie publique
│   ├── editor/             # Éditeur pixel art
│   │   └── [id]/           # Édition d'un dessin existant
│   └── dashboard/          # Mes dessins
├── components/
│   ├── editor/             # Composants de l'éditeur
│   ├── gallery/            # Composants de la galerie
│   └── ui/                 # Composants génériques (Button, Modal…)
├── lib/
│   ├── prisma.ts           # Client Prisma singleton
│   ├── auth.ts             # Config NextAuth
│   └── validators/         # Schémas Zod
├── hooks/                  # Hooks React custom
└── types/                  # Types TypeScript partagés
```

---

## Règles pour l'IA (Claude)

### Ce que l'IA DOIT faire
- Toujours respecter le typage TypeScript strict (pas de `any`)
- Suivre les conventions de nommage définies ci-dessus
- Utiliser Zod pour toute validation de données entrantes (API routes)
- Commenter les décisions non-évidentes avec `// WHY:` 
- Proposer des alternatives quand plusieurs approches existent
- Signaler toute dette technique introduite avec `// TECH-DEBT:`

### Ce que l'IA NE DOIT PAS faire
- Installer de nouvelles dépendances sans les mentionner explicitement
- Modifier le schéma Prisma sans créer une migration nommée
- Contourner NextAuth pour la gestion de session
- Utiliser `localStorage` pour persister des données métier
- Ajouter des appels API Anthropic dans des hot paths (éditeur en temps réel)

### Intégration IA (Anthropic API)
- Utilisée uniquement pour : suggestion de palette, génération de nom/description
- Toujours avec un fallback si l'API est indisponible
- Coût contrôlé : max 1 appel par action utilisateur explicite

---

## Gates déterministes

Chaque donnée critique est validée par un gate avant persistance :

| Gate | Fichier | Ce qu'il valide |
|---|---|---|
| `GridDataSchema` | `lib/validators/drawing.ts` | Format JSON grille, dimensions, couleurs hex |
| `RegisterSchema` | `app/api/register/route.ts` | Nom, email, password (longueur, format) |
| `UpdateDrawingSchema` | `lib/validators/drawing.ts` | Titre, gridData, tags sur PUT drawing |

---

## Commandes utiles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run lint         # ESLint
npm run test         # Jest
npx prisma studio    # Interface base de données
npx prisma migrate dev --name <nom>  # Nouvelle migration
```