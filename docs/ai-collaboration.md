# Analyse de la collaboration humain/IA

Analyse critique de la construction de ce projet avec Claude Code : ce qui a fonctionné, ce qui a requis le jugement humain, et ce qui a nécessité correction.

---

## Contexte

Cette application a été construite dans une collaboration humain/IA structurée en deux sessions ("Bloc 1" et "Bloc 2"), avec l'humain en rôle de product owner et architecte, et Claude Code en rôle d'implémenteur principal. La répartition était explicite : l'humain définissait les exigences et validait les livrables ; l'IA écrivait le code.

---

## Ce qui a bien fonctionné

### 1. Génération du scaffolding

Claude a généré tout le scaffolding initial (schéma Prisma, config NextAuth, validateurs Zod, structure des routes API, mise en page Tailwind) correctement dès le premier ou deuxième essai. Ce type de code bien typé et bien documenté correspond directement aux données d'entraînement de Claude, et le résultat nécessitait peu de corrections.

**Temps gagné** : environ 3–4 heures de mise en place fastidieuse mais pas difficile.

### 2. Propagation d'un changement de schéma dans toute la base de code

Quand l'humain a demandé d'ajouter les tags comme vraie table relationnelle (au lieu d'un tableau JSON), Claude a correctement identifié chaque fichier impacté : schéma Prisma, migration, routes API (GET, PUT, publish), requête galerie, affichage dashboard et favoris. Il a aussi introduit le pattern de clé primaire composite pour `DrawingTag` sans qu'on le lui demande.

**Observation clé** : L'IA est efficace quand une exigence a un "rayon de blast" clair — tous les fichiers affectés découlent mécaniquement du changement de modèle de données.

### 3. Débogage des incompatibilités Zod v4

Le projet utilisait Zod v4, qui introduit des changements cassants (`.error.issues` au lieu de `.error.errors`, `refine()` accepte un objet statique et non une fonction). Claude a identifié et corrigé ces problèmes correctement une fois le message d'erreur fourni.

**Observation clé** : Face à un message d'erreur concret, le débogage de Claude est fiable. Sans l'erreur, il n'aurait pas spontanément audité les changements de version de bibliothèque.

### 4. Accessibilité

Claude a appliqué de façon systématique et cohérente les patterns d'accessibilité WCAG 2.1 AA sur l'ensemble de l'application : skip links, focus trap sur les modales, aria-pressed sur les toggles, aria-live sur les zones dynamiques, rôles sémantiques sur les toasts. La couverture était exhaustive sans qu'on ait à intervenir fichier par fichier.

---

## Ce qui a requis le jugement humain

### 1. Décisions produit ambiguës

Quand on a demandé à Claude d'afficher le nom d'utilisateur dans la navbar, il a obéi. Quand l'humain a décidé ensuite que ce nom ne devait *pas* y apparaître, Claude a obéi à nouveau. L'IA n'a pas d'opinion sur le design produit — elle construit ce qu'on lui dit, y compris des choses qui contredisent des choix antérieurs.

**Leçon** : L'humain doit porter la vision produit. Claude exécutera des instructions contradictoires sans signaler l'incohérence.

### 2. Décisions de confidentialité

La première implémentation de la requête galerie sélectionnait `author: { select: { name: true, email: true } }` — exposant l'email. L'humain l'a repéré et demandé que seul `name` soit sélectionné. Claude a appliqué la correction mais n'aurait pas signalé le problème de vie privée de lui-même.

**Leçon** : L'IA ne modélise pas les scénarios de menace par défaut. Les décisions de sécurité et de confidentialité nécessitent une relecture humaine explicite.

### 3. Dérive du périmètre

Claude proposait occasionnellement des fonctionnalités non demandées — par exemple, un composant d'autocomplétion des tags ou une modale de sélection de couleur avancée. Ces suggestions étaient utiles comme options, mais auraient retardé le livrable principal si acceptées sans réflexion.

**Leçon** : Le rôle de l'humain est de maintenir l'honnêteté du périmètre. "Que construire ensuite ?" est une question pour l'humain, pas pour l'IA.

---

## Ce qui a échoué et requis correction

### 1. Rendu Canvas avec `imageRendering: pixelated`

Claude a appliqué `imageRendering: pixelated` au canvas, ce qui rend correctement le pixel art mais pixelise aussi tout texte dessiné via la Canvas 2D API (`ctx.fillText`). Les numéros de coordonnées de la grille devenaient illisibles.

La première tentative de correction de Claude — ajuster la taille de police et la résolution du canvas — ne résolvait pas le problème fondamental : la propriété CSS affecte l'élément canvas entier, pas seulement les pixels. La solution correcte (rendre les numéros en éléments HTML `div` à côté du canvas, pas à l'intérieur) a nécessité que l'humain formule la contrainte clairement ("les numéros ne doivent pas être pixelisés") pour que Claude trouve la bonne approche architecturale.

**Cause racine** : Claude raisonnait dans la surface de l'API Canvas sans questionner la frontière de couche de rendu.

### 2. `usePixelGrid` ne chargeant pas les dessins existants

Quand on ouvrait un dessin existant dans l'éditeur, le canvas démarrait toujours vide. Claude avait conçu `usePixelGrid` pour prendre `width` et `height` en paramètres et initialiser une grille vide — mais la fonctionnalité nécessitait de charger les données pixel complètes. La signature du hook était incorrecte dès le départ.

La correction (changer le paramètre en `initialData?: GridData`) était simple une fois le bug observé dans le navigateur. Claude ne l'aurait pas détecté en revue de code car la logique était cohérente en interne — elle résolvait simplement le mauvais problème.

**Cause racine** : L'IA a inféré la responsabilité du hook depuis son nom et ses paramètres, pas depuis le scénario d'utilisation réel. Découvrir le bug nécessitait de lancer l'application.

### 3. Conflits React Compiler / `useCallback`

ESLint (avec la règle React Compiler de Next.js) signalait `useCallback` dans `PixelCanvas.tsx` comme conflictuel avec la stratégie de mémoïsation du compilateur. Claude avait enveloppé la fonction de dessin dans `useCallback` par réflexe — c'est un pattern courant — mais la version React et la config du compilateur du projet le rendaient incorrect.

**Cause racine** : Application d'un pattern généralement correct mais erroné dans un contexte spécifique. L'erreur ESLint était nécessaire pour le surfacer.

### 4. Clés React dupliquées sur les toasts

Le composant `Toast` utilisait `Date.now()` comme identifiant unique. Deux toasts déclenchés dans le même milliseconde (ex: sauvegarde réussie + navigation) généraient des clés identiques, causant une erreur React visible.

**Correction appliquée** : Remplacement de `Date.now()` par un compteur module-level `nextId` incrémenté à chaque appel — garantit l'unicité sur toute la durée de session.

---

## Observations structurelles

### L'IA est un bon exécutant, un faible architecte

Claude peut implémenter un design spécifié de façon fiable. Il ne peut pas proposer une architecture adaptée à des exigences non fonctionnelles non exprimées (performance, sécurité, confidentialité, maintenabilité). Les décisions d'architecture dans `CLAUDE.md` — App Router, Server Components par défaut, Zod aux frontières API, pas de `localStorage` pour les données métier — ont dû être spécifiées par l'humain à l'avance.

### L'itération est plus efficace que la spécification exhaustive

Tenter d'écrire une spécification complète en amont (les contrats `.plan.md`) était moins efficace que de construire un prototype fonctionnel et le corriger. Les contrats étaient utiles comme vocabulaire partagé et référence de périmètre, mais les vraies décisions ont émergé en faisant tourner l'application.

### L'IA n'accumule pas de contexte entre sessions

Claude Code conserve l'historique complet de la conversation dans une session mais repart de zéro dans une nouvelle session. Le fichier `CLAUDE.md` et les contrats `.plan.md` compensent cela en codifiant les conventions persistantes. Sans eux, chaque session nécessiterait de réexpliquer l'architecture depuis le début.

---

## Bilan

| Dimension | Verdict |
|---|---|
| Vitesse sur les tâches bien définies | Élevée — économise des heures de code répétitif |
| Qualité sur les patterns bien documentés | Élevée — applique correctement les conventions connues |
| Jugement architectural | Faible — nécessite guidance humaine explicite |
| Conscience sécurité / confidentialité | Faible — requiert revue explicite |
| Découverte de bugs | Faible — détecte les bugs seulement quand les messages d'erreur sont fournis |
| Cohérence entre sessions | Faible — dépend de la documentation persistante |

**Conclusion** : La collaboration humain/IA est la plus efficace quand l'humain conserve la propriété du "quoi et pourquoi" et délègue le "comment" à l'IA. Dès que l'humain délègue le "quoi" — décisions produit, périmètre, architecture — le résultat dérive vers "techniquement correct mais stratégiquement faux".
