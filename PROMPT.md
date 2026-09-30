Tu es mon assistant de développement. Je dois réaliser un projet pédagogique : un jeu Snake en JavaScript. Le but n'est pas seulement d'avoir un jeu qui marche, mais d'être capable d'expliquer chaque fonction du code à l'oral. Respecte TOUTES les consignes ci-dessous.

## 1. Contexte et contraintes
- Langage : JavaScript "vanilla" (HTML + CSS + JS), sans framework ni bibliothèque externe.
- Le rendu se fait dans un <canvas> ; le jeu doit s'ouvrir en double-cliquant sur index.html (pas de build, pas de serveur obligatoire).
- Code SIMPLE et CLAIR : fonctions courtes (une seule responsabilité), noms explicites en anglais, pas de code "malin" ou obscur.
- Utilise des modules ES (import/export) pour séparer les fichiers, et donne la commande pour lancer un petit serveur local si le navigateur bloque les modules (ex : `npx serve` ou `python3 -m http.server`).

## 2. Bases du projet à définir explicitement
Dans un fichier `config.js`, définis les constantes :
- la fenêtre de jeu (largeur/hauteur du canvas, taille d'une case, nombre de colonnes/lignes) ;
- la vitesse du jeu (intervalle en ms) et son évolution ;
- les couleurs (fond, serpent, nourriture) ;
- les touches de contrôle ;
- les variables d'état du jeu (serpent, direction, nourriture, score, meilleur score, état : menu / en cours / pause / game over).
Chaque constante doit avoir un commentaire expliquant son rôle.

## 3. Fonctionnalités
- Déplacement du serpent aux flèches ET aux touches ZQSD/WASD, sans demi-tour immédiat
- Nourriture générée aléatoirement (jamais sur le serpent)
- Croissance et score
- Collision murs / corps → game over
- Pause (barre espace) et redémarrage
- Meilleur score sauvegardé (localStorage)
- Accélération progressive par niveaux
- Écran de menu / écran de game over
- Bonus : nourriture spéciale temporaire (points doubles)
Liste précisément ces fonctionnalités et leur nombre dans le README.

## 4. Design pattern (obligatoire et justifié)
Choisis et applique un design pattern adapté, par exemple MVC (Model = état du jeu, View = affichage canvas, Controller = clavier + boucle de jeu), ou State/Observer si c'est plus pertinent. Explique dans le README : quel pattern, où il apparaît dans le code (quel fichier joue quel rôle), pourquoi ce choix, et ses avantages/limites, avec un schéma ASCII ou Mermaid.

## 5. Commentaires 
- Chaque fichier commence par un commentaire d'en-tête expliquant son rôle.
- Chaque fonction a un commentaire au-dessus, écrit comme si tu l'expliquais à un camarade, en français, ton naturel (ex : "On vérifie si la tête du serpent touche la nourriture : si oui, il grandit et on gagne un point").
- Commente aussi les passages non évidents à l'intérieur des fonctions, sans commenter l'évidence.

## 6. Documentation : README.md complet
Le README doit contenir :
1. Présentation du projet et objectif pédagogique
2. Comment lancer le jeu
3. Structure des fichiers (arborescence commentée)
4. Les bases du projet (fenêtre, variables, constantes)
5. Liste des fonctionnalités (avec leur nombre)
6. Le design pattern justifié
7. **Documentation de CHAQUE fonction**, sous forme de tableau ou de fiche : nom, fichier, rôle, paramètres, valeur retournée, fonctionnement pas à pas expliqué simplement, fonctions appelées / appelée par
8. Un flux global du jeu (comment la boucle de jeu enchaîne les fonctions)
9. Les difficultés rencontrées et les choix effectués

Aucune fonction ne doit manquer dans le README : vérifie à la fin que chaque fonction du code y figure.

## 7. Méthode de travail
1. Annonce d'abord ton plan (architecture + liste des fichiers + pattern choisi), puis attends ma validation.
2. Génère ensuite le code, fichier par fichier.
3. Génère le README.md.
4. Fais une vérification finale : le jeu se lance, toutes les fonctionnalités marchent, chaque fonction est commentée ET documentée.