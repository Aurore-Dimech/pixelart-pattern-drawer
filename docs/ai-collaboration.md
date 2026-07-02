# Analyse de la collaboration humain/IA

Analyse critique de la construction de ce projet avec Claude Code : ce qui a fonctionné, ce qui a requis le jugement humain, et ce qui a nécessité correction.

---

## Contexte

Cette application a été construite dans une collaboration humain/IA structurée en trois phases, avec l'humain en rôle de product owner et architecte, et Claude Code en rôle d'implémenteur principal. La répartition était explicite : l'humain définissait les exigences et validait les livrables ; l'IA écrivait le code.

- **Phase initiale** : MVP complet — infrastructure Prisma/NextAuth, éditeur pixel art, API CRUD, dashboard, galerie et favoris.
- **Bloc 1** : Complétion fonctionnelle — tags relationnels, recherche et filtres galerie, pagination, navigation globale.
- **Bloc 2** : Niveau excellence — intégration Anthropic API, suite de tests Jest, lint propre, accessibilité WCAG 2.1 AA, README et documentation.

---

## Ce qui a bien fonctionné

### 1. Génération rapide de code fonctionnel

Claude a produit des composants, routes API et hooks fonctionnels en une ou deux itérations : scaffolding Prisma, config NextAuth, validateurs Zod, mise en page Tailwind. Ce type de code bien typé et bien documenté correspond directement à ses données d'entraînement, et le résultat nécessitait peu de corrections.

**Temps gagné** : environ 3–4 heures de mise en place fastidieuse mais pas difficile.

### 2. Respect de l'architecture demandée

Les conventions définies dans `CLAUDE.md` ont été appliquées de façon consistante sur l'ensemble du projet : App Router, Server Components par défaut, Zod aux frontières API, pas de `localStorage` pour les données métier, `select` Prisma limité aux champs nécessaires. Claude n'a pas dérivé vers des patterns alternatifs de sa propre initiative.

**Observation clé** : Documenter les conventions en amont dans `CLAUDE.md` est la condition pour obtenir une cohérence architecturale entre sessions.

### 3. Prise en compte du scope du projet

Pour un MVP pédagogique local, Claude n'a pas sur-ingénié les solutions : pas de Redis, pas de queue, pas de cache distribué, pas de système d'autocomplétion des tags non demandé. Les implémentations restaient proportionnées à l'objectif déclaré.

**Observation clé** : Claude adapte sa réponse au contexte fourni. Préciser "application locale, cours universitaire, pas de déploiement public" dans `CLAUDE.md` a orienté les choix vers la simplicité.

### 4. Justification de la pertinence des changements

Avant chaque modification, Claude listait les fichiers concernés et décrivait brièvement l'impact de chaque changement. Cette transparence permettait à l'humain de valider ou recadrer avant l'exécution, réduisant les retours en arrière coûteux.

**Observation clé** : Ce comportement n'est pas spontané — il a été imposé par la Règle 1 de `CLAUDE.md`. Sans cette contrainte explicite, Claude aurait modifié les fichiers directement.

---

## Ce qui a requis le jugement humain

### 1. Décomposition en hooks et composants

Livrée seule, Claude avait tendance à concentrer la logique dans un unique fichier ou à répliquer du code entre composants plutôt que d'extraire un hook partagé. La découpe en `usePixelGrid`, `useDrawings`, `ColorPalette`, etc. a nécessité que l'humain spécifie explicitement les frontières de responsabilité avant l'implémentation.

**Leçon** : L'IA optimise pour faire fonctionner le cas courant rapidement. La structuration pour la maintenabilité doit être demandée explicitement.

### 2. Sécurité et confidentialité des données

La première implémentation de la requête galerie sélectionnait `author: { select: { name: true, email: true } }` — exposant l'email de l'auteur. Claude n'a pas signalé le problème de lui-même ; c'est l'humain qui l'a repéré et corrigé. De façon générale, l'IA ne modélise pas les scénarios de menace par défaut.

**Leçon** : Les décisions de sécurité et de confidentialité nécessitent une relecture humaine explicite à chaque route exposant des données utilisateur.

### 3. Définition et respect du périmètre

Claude proposait occasionnellement des fonctionnalités non demandées — composant d'autocomplétion des tags, modale de sélection de couleur avancée — sans évaluer leur pertinence par rapport aux ambitions du projet. C'est à l'humain de définir le cap des évolutions et l'ordre de mise en place, et de refuser ce qui sort du périmètre.

**Leçon** : "Que construire ensuite ?" est une question pour l'humain, pas pour l'IA.

---

## Ce qui a échoué et requis correction

### 1. Obstination sur les composants déjà corrigés

Après avoir appliqué une correction sur instruction de l'humain, Claude pouvait lors d'une intervention ultérieure revenir à la version précédente du composant — sans que l'humain l'ait demandé. La correction validée était ainsi silencieusement annulée, forçant à la réappliquer.

**Cause racine** : Claude raisonne depuis ses hypothèses initiales et son contexte de session plutôt que depuis l'état courant des fichiers. La Règle 1 (`CLAUDE.md`) — lister explicitement les fichiers à modifier avant d'agir — a été introduite précisément pour forcer une vérification de l'état réel avant toute modification.

### 2. Absence de prise en compte du contexte global

Claude pouvait modifier le comportement d'un composant pour répondre à un besoin très spécifique sans considérer son rôle dans l'ensemble de l'application. Résultat : une correction localement cohérente qui cassait la fonctionnalité dans son ensemble et faisait échouer les tests.

**Cause racine** : L'IA optimise pour la tâche formulée dans le prompt, pas pour les invariants non exprimés du système. Les tests de régression et la revue humaine restent le seul filet de sécurité fiable.

### 3. Rendu Canvas avec `imageRendering: pixelated`

Claude a appliqué `imageRendering: pixelated` au canvas, ce qui rend correctement le pixel art mais pixelise aussi tout texte dessiné via la Canvas 2D API (`ctx.fillText`). Les numéros de coordonnées de la grille devenaient illisibles.

La première tentative de correction de Claude — ajuster la taille de police et la résolution du canvas — ne résolvait pas le problème fondamental : la propriété CSS affecte l'élément canvas entier, pas seulement les pixels. La solution correcte (rendre les numéros en éléments HTML `div` à côté du canvas, pas à l'intérieur) a nécessité que l'humain formule la contrainte clairement ("les numéros ne doivent pas être pixelisés") pour que Claude trouve la bonne approche architecturale.

**Cause racine** : Claude raisonnait dans la surface de l'API Canvas sans questionner la frontière de couche de rendu.

---

## Observations structurelles

### L'IA implémente bien ce qui est spécifié, pas ce qui est implicite

Claude respecte les conventions documentées dans `CLAUDE.md` et produit du code fonctionnel rapidement — mais uniquement dans le cadre de ce qui lui est explicitement fourni. Sécurité, confidentialité, décomposition en hooks, gestion du périmètre : ces dimensions restent invisibles pour l'IA si elles ne sont pas formulées.

### La structuration du code et la vision produit appartiennent à l'humain

Sans instruction contraire, Claude tend à concentrer la logique dans un seul fichier et à proposer des fonctionnalités qui dépassent le cadre du projet. La découpe en composants et hooks réutilisables, et la décision de ce qui mérite d'être construit, nécessitent une direction humaine explicite.

### L'IA optimise localement, pas systémiquement

Claude résout la tâche formulée dans le prompt, mais peut ignorer les invariants du reste de l'application. Une correction localement cohérente peut casser une fonctionnalité dans son ensemble. Les tests de régression et la revue humaine sont le seul filet de sécurité fiable.

### La documentation persistante compense l'absence de mémoire entre sessions

Claude repart de zéro à chaque session et peut revenir sur des corrections déjà appliquées. `CLAUDE.md` et les contrats `.plan.md` codifient les conventions et les décisions validées, rendant le comportement de l'IA plus prévisible d'une session à l'autre.

---

## Bilan

| Dimension | Verdict |
|---|---|
| Vitesse sur les tâches bien définies | Élevée — économise des heures de code répétitif |
| Respect des conventions documentées | Élevée — applique `CLAUDE.md` de façon consistante |
| Structuration et décomposition du code | Faible — nécessite une direction explicite |
| Conscience sécurité / confidentialité | Faible — requiert revue humaine systématique |
| Gestion du périmètre | Faible — tend à proposer au-delà du scope sans cadrage |
| Raisonnement systémique | Faible — optimise localement, ignore les invariants globaux |
| Cohérence entre sessions | Faible — peut réintroduire des corrections déjà appliquées |

**Conclusion** : La collaboration humain/IA est efficace quand l'humain documente les conventions à l'avance, conserve la propriété des décisions produit et architecturales, et valide chaque modification avant qu'elle soit appliquée. Dès que l'une de ces responsabilités est déléguée à l'IA — structuration du code, périmètre, sécurité — le résultat dérive vers "techniquement correct mais stratégiquement faux".
