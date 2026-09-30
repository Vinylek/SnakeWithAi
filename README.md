# SnakeWithAi

Un jeu Snake en JavaScript, codé avec l'aide d'une IA.
L'objectif : un code simple, commenté, et **dont chaque fonction peut être expliquée**.

## Lancer le jeu

Ouvrir `index.html` dans un navigateur. Aucune installation n'est nécessaire.

## Structure du projet

| Fichier      | Rôle                                                        |
|--------------|-------------------------------------------------------------|
| `index.html` | La page web : contient le titre, le score et le canvas      |
| `style.css`  | L'apparence : centrage, couleurs, bordure du plateau        |
| `script.js`  | Toute la logique du jeu                                     |

## La fenêtre du jeu

Le jeu est dessiné dans une balise `<canvas>` de **400 × 400 pixels**.
Ce plateau est découpé en une grille de **20 × 20 cases** de 20 pixels chacune.
Le serpent et la pomme se déplacent de case en case, jamais au pixel près.

Positions : `x` va de 0 (gauche) à 19 (droite), `y` va de 0 (haut) à 19 (bas).

## Les constantes

Valeurs fixes, définies une seule fois en haut de `script.js`.

| Nom                  | Valeur      | Explication                                      |
|----------------------|-------------|--------------------------------------------------|
| `TAILLE_CASE`        | `20`        | Taille d'une case en pixels                      |
| `NB_CASES`           | `20`        | Nombre de cases par ligne (largeur / TAILLE_CASE)|
| `VITESSE`            | `150`       | Millisecondes entre deux images du jeu           |
| `COULEUR_FOND`       | `#2b2b2b`   | Couleur du plateau                               |
| `COULEUR_SERPENT`    | `#4caf50`   | Couleur du corps du serpent                      |
| `COULEUR_TETE`       | `#81c784`   | Couleur de la tête (plus claire)                 |
| `COULEUR_NOURRITURE` | `#e53935`   | Couleur de la pomme                              |

## Les variables

Elles changent pendant la partie.

| Nom              | Type                 | Explication                                                     |
|------------------|----------------------|-----------------------------------------------------------------|
| `plateau`        | élément HTML         | Le canvas récupéré depuis la page                               |
| `ctx`            | contexte 2D          | L'outil de dessin du canvas                                     |
| `affichageScore` | élément HTML         | La zone de texte où s'affiche le score                          |
| `serpent`        | tableau d'objets     | Les cases du serpent `{x, y}`. La case `0` est la tête          |
| `direction`      | objet `{dx, dy}`     | Sens du mouvement. `{1,0}` droite, `{-1,0}` gauche, `{0,-1}` haut, `{0,1}` bas |
| `nourriture`     | objet `{x, y}`       | Position de la pomme                                            |
| `score`          | nombre               | Points du joueur                                                |
| `partieTerminee` | booléen              | `true` quand le joueur a perdu                                  |
| `intervalleJeu`  | identifiant          | Référence de la boucle `setInterval`, pour pouvoir l'arrêter    |

## Les fonctions

### `initialiserJeu()`
Prépare une nouvelle partie : crée un serpent de 3 cases au centre, remet la direction vers la droite, remet le score à 0, place une pomme, puis lance la boucle de jeu avec `setInterval`.
Si une partie était déjà en cours, sa boucle est arrêtée avec `clearInterval` pour ne pas en avoir deux en même temps.

### `placerNourriture()`
Tire une position au hasard sur la grille avec `Math.random()`.
Si la case tombe sur le serpent, on recommence (boucle `do...while`) jusqu'à trouver une case libre.

### `estSurLeSerpent(x, y)`
Renvoie `true` si la case `(x, y)` fait partie du serpent, sinon `false`.
Utilise `Array.some()`, qui s'arrête dès qu'un morceau correspond.

### `dessinerCase(x, y, couleur)`
Fonction de base de tout l'affichage : dessine un carré de couleur sur une case de la grille.
Elle convertit la position en pixels (`x * TAILLE_CASE`) et laisse 1 pixel d'espace entre les cases.

### `dessinerFond()`
Repeint tout le plateau avec la couleur de fond. Cela « efface » l'image précédente avant de dessiner la suivante.

### `dessinerSerpent()`
Parcourt chaque morceau du serpent et le dessine avec `dessinerCase`. La tête (index `0`) a une couleur plus claire.

### `dessinerNourriture()`
Dessine la pomme à sa position avec `dessinerCase`.

### `boucleDeJeu()`
Appelée automatiquement toutes les `VITESSE` millisecondes. Si la partie est terminée, elle ne fait rien.
Pour l'instant, elle redessine seulement la scène (fond → pomme → serpent). C'est ici qu'on ajoutera le déplacement et les collisions.

## Déroulement actuel

```
initialiserJeu()
   ├── placerNourriture()  ──> estSurLeSerpent()
   └── setInterval(boucleDeJeu)
           └── toutes les 150 ms :
                 dessinerFond()
                 dessinerNourriture()  ──> dessinerCase()
                 dessinerSerpent()     ──> dessinerCase()
```

## Prochaines étapes

- [ ] Déplacer le serpent selon `direction`
- [ ] Changer de direction avec les flèches du clavier
- [ ] Manger la pomme : grandir et augmenter le score
- [ ] Détecter les collisions (murs et propre corps)
- [ ] Afficher « Game Over » et permettre de rejouer
