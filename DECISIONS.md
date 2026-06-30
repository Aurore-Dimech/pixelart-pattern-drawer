# DECISIONS.md — PixelArt App

Registre des décisions techniques significatives. Chaque entrée suit le format :
**contexte → options considérées → choix → justification → conséquences**.

---

## [DEC-001] Framework : Next.js 14 (App Router)

**Date** : phase initiale  
**Statut** : ✅ Validé

**Contexte**  
On a besoin d'un framework JavaScript full-stack capable de gérer UI, API et auth dans un seul projet.

**Options considérées**
| Option | Pour | Contre |
|---|---|---|
| Next.js 14 (App Router) | Full-stack, SSR, Server Components, écosystème mature | Complexité App Router (Server vs Client) |
| Vite + Express | Simple, rapide à setup | Deux projets à maintenir, pas de SSR natif |
| Remix | Bonne gestion des formulaires, loaders | Moins populaire, moins de ressources |
| SvelteKit | Léger, ergonomique | Moins connu, moins de libs compatibles |

**Décision** : Next.js 14 avec App Router

**Justification**  
- Un seul projet, un seul déploiement
- Server Components réduisent le JS client (important pour l'éditeur canvas)
- NextAuth.js s'intègre nativement
- Prisma + Next.js = pattern bien documenté

**Conséquences**  
- Distinction Server/Client Components à gérer attentivement
- `"use client"` requis pour l'éditeur (Canvas API côté navigateur)

---

## [DEC-002] Base de données : SQLite via Prisma

**Date** : phase initiale  
**Statut** : ✅ Validé

**Contexte**  
Besoin de persistance pour users, drawings, favorites. Le projet est un démo pédagogique, pas un SaaS à 10 000 utilisateurs.

**Options considérées**
| Option | Pour | Contre |
|---|---|---|
| SQLite + Prisma | Zéro config, fichier local, parfait pour démo | Pas adapté à la concurrence élevée, pas multi-serveur |
| PostgreSQL + Prisma | Production-ready, robuste | Nécessite un serveur (Docker ou service cloud) |
| MongoDB | Flexible pour JSON (grilles pixel) | Moins bien intégré avec Prisma, schema-less = moins de garanties |
| Fichiers JSON | Ultra simple | Pas de transactions, pas de requêtes complexes |

**Décision** : SQLite en développement, migration Postgres possible en production

**Justification**  
- `npx prisma init --datasource-provider sqlite` = setup en 30 secondes
- Les grilles pixel sont stockées en JSON stringifié dans un champ `TEXT` → compatible SQLite
- Prisma abstrait le dialecte SQL : migration vers Postgres = changer 1 ligne dans `.env`

**Conséquences**  
- Le fichier `dev.db` ne doit pas être commité (`.gitignore`)
- Les requêtes concurrentes en écriture sont limitées (acceptable pour un démo)

---

## [DEC-003] Authentification : NextAuth.js v5

**Date** : phase initiale  
**Statut** : ✅ Validé

**Contexte**  
Besoin d'auth sécurisée avec sessions persistantes. Les dessins et favoris sont liés à un compte utilisateur.

**Options considérées**
| Option | Pour | Contre |
|---|---|---|
| NextAuth.js v5 | Intégration Next.js native, providers OAuth possibles, Prisma adapter | API v5 encore en beta |
| Lucia Auth | Léger, moderne, TypeScript-first | Moins de ressources, setup plus manuel |
| Clerk | Clé en main, belle UI | Payant au delà du free tier, dépendance externe |
| JWT maison | Contrôle total | Long à implémenter correctement et de façon sécurisée |

**Décision** : NextAuth.js v5 avec credentials provider + Prisma adapter

**Justification**  
- Auth par email/password (credentials) + possibilité d'ajouter GitHub OAuth facilement
- `@auth/prisma-adapter` lie automatiquement les sessions à la table `User`
- Pas de coût, pas de dépendance externe

**Conséquences**  
- Mots de passe hashés avec `bcryptjs` avant stockage
- Sessions stockées en base (table `Session` gérée par Prisma adapter)
- Middleware Next.js pour protéger les routes privées

---

## [DEC-004] Validation : Zod

**Date** : phase initiale  
**Statut** : ✅ Validé

**Contexte**  
Toutes les entrées API doivent être validées avant traitement ou persistance (gate déterministe).

**Options considérées**
| Option | Pour | Contre |
|---|---|---|
| Zod | TypeScript-first, inférence de types, très populaire | Bundle size si utilisé côté client |
| Yup | Mature, bien connu | Moins bon support TypeScript |
| Validation manuelle | Zéro dépendance | Verbeux, error-prone |

**Décision** : Zod, utilisé uniquement côté serveur (API routes)

**Justification**  
- `z.infer<typeof schema>` génère le type TypeScript automatiquement → source de vérité unique
- Erreurs structurées exploitables directement dans les réponses API
- Standard de facto dans l'écosystème Next.js/TypeScript

---

## [DEC-005] Stockage des grilles pixel : JSON stringifié

**Date** : phase initiale  
**Statut** : ✅ Validé

**Contexte**  
Une grille pixel est un tableau 2D de couleurs (ex: 32×32 = 1024 cellules). Comment la stocker en base ?

**Options considérées**
| Option | Pour | Contre |
|---|---|---|
| JSON stringifié en `TEXT` | Simple, flexible, lisible | Pas requêtable nativement en SQL |
| Une ligne par pixel | Requêtable | 1024 lignes par dessin → performances désastreuses |
| Colonne par couleur (binary blob) | Compact | Complexe à sérialiser/désérialiser |

**Décision** : JSON stringifié dans un champ `gridData String` Prisma

**Format** :
```json
{
  "width": 32,
  "height": 32,
  "pixels": ["#FF0000", "#000000", ...]
}
```

**Justification**  
- Tableau 1D de `width × height` couleurs hex → sérialisation triviale
- `JSON.parse` / `JSON.stringify` suffisent
- Gate `validateGridData` vérifie le format avant persistance

---

## [DEC-006] Intégration IA : Anthropic API (suggestion palette)

**Date** : phase v2  
**Statut** : ✅ Validé

**Contexte**  
Le niveau 3 exige une intégration MCP ou outil externe. L'IA doit apporter une vraie valeur sans surcharger l'UX.

**Options considérées**
| Option | Pour | Contre |
|---|---|---|
| Suggestion de palette par thème | UX naturelle, utile, coût maîtrisé | Subjectif |
| Génération automatique de pixel art | Impressionnant | Coûteux, complexe à intégrer dans l'éditeur |
| Description auto du dessin | Utile pour publication | Nécessite de "voir" l'image (vision API) |

**Décision** : Appel Anthropic API pour suggérer une palette de 8 couleurs à partir d'un thème textuel

**Exemple** : `"thème: forêt enchantée"` → `["#2D5A1B", "#4A7C3F", "#8BC34A", ...]`

**Contraintes appliquées**  
- Maximum 1 appel par action utilisateur explicite (bouton "Suggérer une palette")
- Fallback vers une palette par défaut si l'API est indisponible
- Clé API stockée en variable d'environnement serveur uniquement

---

## [DEC-007] Export PNG : Canvas API native

**Date** : phase v2  
**Statut** : ✅ Validé

**Décision** : `canvas.toDataURL("image/png")` côté client, sans librairie externe

**Justification** : zéro dépendance, natif dans tous les navigateurs modernes.

---

## [DEC-008] Tags : maximum 3 par dessin

**Date** : phase v3  
**Statut** : ✅ Validé

**Contexte**  
Les tags permettent de catégoriser les dessins pour le filtrage en galerie. Sans limite, les utilisateurs pourraient saturer l'interface et diluer la sémantique des tags.

**Décision** : Maximum 3 tags par dessin, enforced côté serveur (Zod) et côté client (compteur en temps réel, blocage de la sauvegarde).

**Justification**  
- 3 tags suffisent pour les principales catégories (style, thème, palette)
- Limite visible en temps réel dans l'éditeur (`X/3`)
- Cohérence d'affichage : les cartes galerie affichent toujours tous les tags (pas de troncature)

---

## [DEC-009] Accessibilité WCAG 2.1 AA

**Date** : phase v3  
**Statut** : ✅ Validé

**Décision** : Respecter le niveau AA de WCAG 2.1 sur toutes les pages.

**Mesures appliquées**  
- Lien d'évitement `<a class="skip-link" href="#main-content">` (visible uniquement au focus)
- Anneau `:focus-visible` global en `rose-600` sur tous les éléments focusables
- `role="dialog"` + `aria-modal` + piège de focus sur `DrawingViewer`
- `aria-pressed` sur les boutons toggle (outils, favoris, tags)
- `aria-live="polite"` sur les zones mises à jour dynamiquement (compteur galerie, couleur hex)
- `role="alert"` sur les messages d'erreur, `role="status"` sur les confirmations
- `@media (prefers-reduced-motion: reduce)` désactive toutes les animations

**Justification**  
Accessibilité requise pour les utilisateurs de lecteurs d'écran et de navigation clavier. Critère pédagogique du cours.