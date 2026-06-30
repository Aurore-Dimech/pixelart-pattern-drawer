# Audit de dette technique

Inventaire honnête des limitations connues, raccourcis et travaux différés dans la PixelArt App.

---

## TD-01 — Mots de passe hashés avec bcrypt, pas de rate limiting sur le login

**Localisation** : `src/app/api/register/route.ts`, `src/lib/auth.ts`  
**Sévérité** : Moyenne

**Problème** : Le hachage des mots de passe utilise `bcryptjs` (pure JS, plus lent que le `bcrypt` natif), ce qui est acceptable pour un faible trafic. Plus critiquement, l'endpoint de connexion par credentials n'a aucun rate limiting — une attaque par force brute est possible. Il n'existe pas non plus de mécanisme de verrouillage de compte.

**Pourquoi différé** : Ajouter du rate limiting nécessite soit un store Redis soit un compteur de tentatives persisté en base, tous deux hors périmètre pour une app de démo SQLite. Le risque est acceptable en contexte local/démo.

**Corriger quand** : Avant tout déploiement public. Utiliser `next-rate-limit` ou un middleware edge avec suivi par IP.

---

## TD-02 — `gridData` stocké en JSON string sans version de schéma

**Localisation** : `prisma/schema.prisma` (`Drawing.gridData String`), `src/lib/validators/drawing.ts`  
**Sévérité** : Moyenne

**Problème** : La grille pixel est sérialisée et stockée en JSON string. Il n'y a pas de champ version, donc si le format évolue (ex: ajout de calques ou d'opacité), les lignes existantes ne peuvent pas être migrées automatiquement. Le validateur rejette les données invalides à l'écriture, mais lire d'anciennes lignes après un changement de format produirait silencieusement un résultat corrompu.

**Pourquoi différé** : Le format est stable pour la v1. Ajouter un champ `gridVersion Int @default(1)` nécessiterait une migration et un script de migration pour les lignes existantes.

**Corriger quand** : Avant tout changement de format. Ajouter `gridVersion` et une stratégie de migration (mise à jour à la lecture ou script batch).

---

## TD-03 — Les noms de tags sont des slugs réutilisés comme libellés d'affichage

**Localisation** : `src/app/api/drawings/[id]/route.ts` (PUT), `prisma/schema.prisma` (modèle Tag)  
**Sévérité** : Faible

**Problème** : Quand un tag est créé via l'éditeur, `name` prend la même valeur que `slug` (ex: `"pixel-art"`). Les libellés affichés sont donc des chaînes en kebab-case plutôt que des labels lisibles. L'éditeur accepte du texte libre et convertit en slug côté client, mais il n'existe pas de champ `displayName` distinct.

**Pourquoi différé** : Simplification délibérée pour éviter un formulaire de tag à deux champs. Le slug-comme-nom fonctionne visuellement pour des tags simples.

**Corriger quand** : Si la qualité d'affichage des tags devient un problème UX. Ajouter `displayName String?` au modèle Tag et le peupler lors de l'`upsert`.

---

## TD-04 — Pas de pagination sur le dashboard

**Localisation** : `src/app/dashboard/page.tsx`  
**Sévérité** : Faible

**Problème** : Tous les dessins de l'utilisateur sont retournés en une seule requête. Avec un grand nombre de dessins, cela peut devenir un problème de performance et de mémoire.

> **Note** : La galerie publique dispose bien d'une pagination côté serveur (`GALLERY_PAGE_SIZE`, paramètre `?page=`). Cette dette ne concerne que le dashboard personnel.

**Pourquoi différé** : Pour une démo avec peu de dessins, la limite n'est pas observable.

**Corriger quand** : Si un utilisateur accumule de nombreux dessins. Ajouter `take`/`skip` à la requête dashboard et des contrôles de pagination dans `DashboardClient`.

---

## TD-05 — Pas de CSRF sur les routes API qui mutent l'état

**Localisation** : Toutes les routes `POST`/`PUT`/`DELETE` sous `src/app/api/`  
**Sévérité** : Moyenne

**Problème** : Les routes API s'appuient sur les cookies de session NextAuth mais ne vérifient pas de token CSRF. Un site tiers malveillant pourrait déclencher des mutations d'état (publier, mettre en favori, supprimer) au nom d'un utilisateur authentifié via des soumissions de formulaire cross-origin ou un `fetch` avec `credentials: "include"`.

**Pourquoi différé** : Les routes API Next.js App Router sont same-origin par défaut en production sur des hébergeurs standards, et NextAuth v5 inclut une mitigation CSRF pour ses propres endpoints. Cependant, les routes personnalisées n'ont pas de protection explicite.

**Corriger quand** : Avant tout déploiement public. Ajouter une vérification de token CSRF (ex: `next-csrf` ou pattern double-submit cookie) sur toutes les routes mutantes.

---

## TD-06 — L'endpoint palette IA accepte n'importe quel thème sans filtrage de contenu

**Localisation** : `src/app/api/ai/palette/route.ts`  
**Sévérité** : Faible

**Problème** : Le champ `theme` est validé sur la longueur (max 100 caractères) et le type, mais son contenu est passé directement à l'API Anthropic comme partie d'un prompt. Un utilisateur peut injecter des instructions adversariales dans la chaîne de thème (injection de prompt). Le risque est faible car le modèle est uniquement invité à retourner des couleurs hex et la réponse est validée comme telle, mais le thème apparaît textuellement dans le prompt.

**Pourquoi différé** : Pour une app de démo, le rayon de blast est limité — un acteur malveillant ne peut que corrompre sa propre palette. La mitigation complète nécessiterait une modération de contenu ou l'extraction uniquement des caractères alphanumériques du thème.

**Corriger quand** : Si l'endpoint devient accessible publiquement sans authentification. Sanitiser `theme` pour n'accepter que des caractères alphanumériques imprimables.
