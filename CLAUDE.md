# CLAUDE.md — PixelArt App

## Intent du projet

Application web permettant aux utilisateurs de créer, sauvegarder et partager des dessins en pixel art. Les utilisateurs peuvent publier leurs créations dans une galerie publique et enregistrer les œuvres d'autres utilisateurs en favoris.

**Audience cible** : créateurs de pixel art amateurs, gamers, designers rétro.  
**Objectif pédagogique** : démontrer une collaboration humain/IA structurée sur un vrai produit full-stack.  
**Contexte** : application locale pour un cours universitaire — pas de déploiement public prévu.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Langage | TypeScript strict |
| Styles | Tailwind CSS |
| Auth | NextAuth.js v5 (beta) |
| ORM | Prisma |
| Base de données | SQLite (local, définitif — pas de migration PostgreSQL prévue) |
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
- Actions imbriquées : `/api/drawings/[id]/publish`
- Réponses toujours typées avec un wrapper `{ data, error }`

---

## Structure des dossiers

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── drawings/
│   │   ├── favorites/
│   │   ├── gallery/
│   │   └── ai/palette/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── gallery/
│   ├── editor/
│   │   └── [id]/
│   └── dashboard/
├── components/
│   ├── editor/
│   ├── gallery/
│   └── ui/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── validators/
├── hooks/
└── types/
```

---

## Règles opérationnelles pour Claude

### Règle 1 — Confirmation obligatoire avant toute modification

Claude ne doit toucher à aucun fichier sans permission explicite. Avant toute modification, Claude doit :
1. Lister les fichiers qu'il compte modifier
2. Décrire brièvement chaque changement
3. Attendre la confirmation de l'utilisateur

Cette règle s'applique à chaque tâche, sans exception.

### Règle 2 — Gestion d'erreurs : toujours logger

Tout bloc `catch` doit au minimum appeler `console.error`. Les erreurs ne doivent jamais être avalées silencieusement :

```ts
// ❌ Interdit
} catch {
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}

// ✅ Requis
} catch (err) {
  console.error("[api/drawings]", err);
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}
```

Exception acceptable : `catch` de parse JSON retournant immédiatement un 400.

### Règle 3 — Tests Jest obligatoires

Toute nouvelle fonctionnalité doit être accompagnée de tests Jest. Les tests existants ne doivent pas régresser. Une fonctionnalité sans tests n'est pas considérée terminée.

### Règle 4 — Pas de code dupliqué injustifié

Extraire dans un utilitaire ou un hook toute logique répétée à 2+ endroits. Justifier explicitement si la duplication est intentionnelle.

### Règle 5 — Aucune information sensible exposée

Ne jamais exposer dans les réponses API, logs ou composants client :
- Mots de passe ou hash de mots de passe
- Clés API (y compris `ANTHROPIC_API_KEY`)
- Emails d'autres utilisateurs

Dans les requêtes Prisma : utiliser `select: { name: true }` (jamais `email: true`) pour les données d'auteur publiques.

---

## Ce que Claude NE DOIT PAS faire

- Toucher un fichier sans confirmation préalable (Règle 1)
- Exposer des informations sensibles (Règle 5)
- Dupliquer du code sans justification (Règle 4)
- Installer de nouvelles dépendances sans les mentionner explicitement
- Modifier le schéma Prisma sans créer une migration nommée
- Contourner NextAuth pour la gestion de session
- Utiliser `localStorage` pour persister des données métier
- Ajouter des appels API Anthropic dans des hot paths (éditeur en temps réel)
- Migrer vers PostgreSQL ou toute autre base de données

---

## Contraintes projet

| Contrainte | Valeur |
|---|---|
| Base de données | SQLite uniquement — définitif |
| Déploiement | Local uniquement |
| Prochaine version | Pas de v4 planifiée |
| Librairies externes | Minimiser — pas de librairies de composants visuels supplémentaires |

---

## Règles métier en place

Ces règles sont implémentées dans le code — ne pas les casser :

| Règle | Emplacement | Comportement |
|---|---|---|
| Max 3 tags par dessin | `lib/validators/drawing.ts`, `PixelEditorEditClient.tsx` | Rejeté côté serveur + compteur `X/3` côté client |
| Auto-favori interdit | `api/favorites/route.ts:42` | 403 si `authorId === userId` |
| Dessin dépublié inaccessible | `api/drawings/[id]/route.ts:20` | 403 si `!isPublished && !isOwner` |
| Suppression en cascade | `prisma/schema.prisma` | `onDelete: Cascade` sur Favorite |
| Validation nom d'utilisateur | `api/register/route.ts` | min 2, max 32, `[a-zA-Z0-9_-]`, unique |

---

## Gates déterministes

| Gate | Fichier | Ce qu'il valide |
|---|---|---|
| `GridDataSchema` | `lib/validators/drawing.ts` | Format JSON grille, dimensions, couleurs hex |
| `RegisterSchema` | `app/api/register/route.ts` | Nom, email, password (longueur, format) |
| `UpdateDrawingSchema` | `lib/validators/drawing.ts` | Titre, gridData, tags sur PUT drawing |

---

## Intégration IA (Anthropic API)

- Utilisée uniquement pour : suggestion de palette (`POST /api/ai/palette`)
- Toujours avec un fallback sur `DEFAULT_PALETTE` si l'API est indisponible
- Coût contrôlé : max 1 appel par action utilisateur explicite
- Ne jamais exposer `ANTHROPIC_API_KEY` côté client

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
