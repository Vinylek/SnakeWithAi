# Prompts utilisés

Ce fichier recense les prompts envoyés à l'IA (Claude Code) pour construire le jeu, dans l'ordre. 

Entre les étapes, le code a été commité.

---

## Prompt 0 — Le cahier des charges

**Objectif :** donner à l'IA toutes les règles du projet d'un coup : langage, contraintes, fonctionnalités, design pattern, commentaires, documentation, méthode de travail.

**Prompt :** le contenu complet de [`PROMPT.md`](PROMPT.md). 

---

## Prompt 1 — La base du jeu

**Objectif :** poser les fondations : la page, le canvas, les constantes, l'état du jeu et le chargement des sprites.

**Prompt :**
> Lis PROMPT.md. Commence par la base du jeu (canvas, variables, importation de la spritesheet...).


---

## Prompt 2 — Les obstacles

**Objectif :** ajouter des rochers et des arbres placés au hasard, sans qu'ils apparaissent collés au serpent au départ.

**Prompt :**
> Importe les textures d'obstacles : (8, 4), (8, 5), (8, 6) = gros rochers ; (8, 7), (8, 8), (8, 9) = petits rochers ; (8, 10) à (8, 15) = arbres/arbustes. Place-les aléatoirement sur la map (définis un rayon autour du snake de départ où les obstacles ne peuvent pas apparaître).

---

## Prompt 3 — Le mouvement et les collisions

**Objectif :** faire bouger le serpent au clavier et gérer la mort

**Prompt :**
> Commence la logique du snake : mouvement, input, collision/game over avec les obstacles. L'agrandissement quand on mange une pomme sera fait plus tard.


---

## Prompt 4 — La pomme

**Objectif :** faire apparaître la pomme au hasard et la faire manger.

**Prompt :**
> Fais la logique de la pomme et sa collision avec le snake (aggrandissement de la taille). 

---

## Prompt 5 — Menu et classement

**Objectif :** un vrai menu, et un classement des meilleurs scores.

**Prompt :**
> Ajoute un système de menu et de classement (top 10, pseudo de 10 lettres maximum, un pseudo = son meilleur score)

---

## Prompt 6 — Ajustements : obstacles et pseudo

**Objectif :** corriger le comportement après avoir testé.

**Prompt :**
> Les petits obstacles ne doivent pas tuer. Pour le classement, le dernier pseudo utilisé est gardé en mémoire et affiché au prochain game over. Et si le joueur utilise le même pseudo, il écrase l'ancienne valeur.

---

## Prompt 7 — Accélération

**Objectif :** terminer les fonctionnalités : niveaux avec accélération

**Prompt :**
> Augmente le game tick lorsque le snake grandit



## Bonnes pratiques de prompting apprises et appliquées

1. **Donner le cadre une fois pour toutes.** Un cahier des charges détaillé (`PROMPT.md`) évite de répéter les règles à chaque demande (noms en anglais, commentaires en français, `config.js`, MVC). Les petits prompts suivants en ont profité.
2. **Avancer par petites étapes.** Une fonctionnalité par prompt. Chaque résultat est assez court pour être relu, testé et compris avant de passer au suivant.
3. **Être précis sur les règles métier.** Faire des prompts précis permet de ne pas obliger l'IA à choisir à notre place. 
4. **Vérifier le vocabulaire et les coordonnées.** "(8, 4)" ou "petits obstacles" étaient clairs pour nous, pas forcément pour l'IA. Mieux vaut indiquer l'unité (pixels ou tuiles) et lister les éléments un par un.
5. **Lire les "points à noter" de l'IA.** Elle signalait ses interprétation. C'est là qu'on repère ce qu'il faut corriger.
6. **Demander des vérifications, pas seulement du code.** Les tests lancés par l'IA ont montré que les règles marchaient, mais ils tournaient dans Node.js, pas dans un navigateur. Il faut quand même jouer soi-même au jeu après chaque étape.