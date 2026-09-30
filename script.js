// =====================================================
//  SNAKE - Les bases du jeu
//  Ici on prépare la fenêtre, les variables et l'affichage.
//  Le déplacement et les collisions viendront ensuite.
// =====================================================


// ----- 1. La fenêtre du jeu -----

// On récupère le canvas défini dans index.html
const plateau = document.getElementById("plateau");

// Le "contexte" est l'outil qui nous permet de dessiner dans le canvas
const ctx = plateau.getContext("2d");

// On récupère aussi la zone où on affiche le score
const affichageScore = document.getElementById("score");


// ----- 2. Les constantes (ce qui ne change jamais) -----

// Taille d'une case en pixels : le serpent avance case par case
const TAILLE_CASE = 20;

// Nombre de cases sur la largeur et la hauteur (400 / 20 = 20 cases)
const NB_CASES = plateau.width / TAILLE_CASE;

// Vitesse du jeu : temps en millisecondes entre deux images
const VITESSE = 150;

// Les couleurs, regroupées ici pour les changer facilement
const COULEUR_FOND = "#2b2b2b";
const COULEUR_SERPENT = "#4caf50";
const COULEUR_TETE = "#81c784";
const COULEUR_NOURRITURE = "#e53935";


// ----- 3. Les variables (ce qui change pendant la partie) -----

// Le serpent est une liste de cases. La première case est la tête.
let serpent = [];

// La direction du serpent : dx = mouvement horizontal, dy = vertical
// Exemple : dx = 1, dy = 0 veut dire "vers la droite"
let direction = { dx: 1, dy: 0 };

// La position de la pomme sur la grille
let nourriture = { x: 0, y: 0 };

// Le score du joueur
let score = 0;

// Permet de savoir si la partie est terminée
let partieTerminee = false;

// Garde en mémoire la boucle de jeu pour pouvoir l'arrêter plus tard
let intervalleJeu = null;


// ----- 4. Les fonctions -----

// Remet tout à zéro et lance une nouvelle partie
function initialiserJeu() {
    // Le serpent commence avec 3 cases, au milieu du plateau, tourné vers la droite
    serpent = [
        { x: 10, y: 10 }, // la tête
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = { dx: 1, dy: 0 };
    score = 0;
    partieTerminee = false;
    affichageScore.textContent = score;

    placerNourriture();

    // Si une ancienne partie tournait encore, on l'arrête avant d'en lancer une nouvelle
    clearInterval(intervalleJeu);
    intervalleJeu = setInterval(boucleDeJeu, VITESSE);
}

// Choisit une case au hasard pour la pomme (en évitant le serpent)
function placerNourriture() {
    do {
        nourriture.x = Math.floor(Math.random() * NB_CASES);
        nourriture.y = Math.floor(Math.random() * NB_CASES);
    } while (estSurLeSerpent(nourriture.x, nourriture.y));
}

// Répond à la question : "est-ce que cette case est occupée par le serpent ?"
function estSurLeSerpent(x, y) {
    return serpent.some(morceau => morceau.x === x && morceau.y === y);
}

// Dessine un carré de couleur sur une case de la grille
function dessinerCase(x, y, couleur) {
    ctx.fillStyle = couleur;
    // On convertit la position de la grille en pixels.
    // Le "- 1" laisse un petit espace entre les cases, c'est plus joli.
    ctx.fillRect(x * TAILLE_CASE, y * TAILLE_CASE, TAILLE_CASE - 1, TAILLE_CASE - 1);
}

// Efface le plateau en le repeignant entièrement
function dessinerFond() {
    ctx.fillStyle = COULEUR_FOND;
    ctx.fillRect(0, 0, plateau.width, plateau.height);
}

// Dessine chaque morceau du serpent, la tête d'une couleur différente
function dessinerSerpent() {
    serpent.forEach((morceau, index) => {
        const couleur = index === 0 ? COULEUR_TETE : COULEUR_SERPENT;
        dessinerCase(morceau.x, morceau.y, couleur);
    });
}

// Dessine la pomme
function dessinerNourriture() {
    dessinerCase(nourriture.x, nourriture.y, COULEUR_NOURRITURE);
}

// Le coeur du jeu : cette fonction est appelée en boucle toutes les VITESSE ms
function boucleDeJeu() {
    if (partieTerminee) {
        return;
    }

    // Pour l'instant on se contente de redessiner la scène.
    // Plus tard : déplacer le serpent, vérifier les collisions, manger la pomme...
    dessinerFond();
    dessinerNourriture();
    dessinerSerpent();
}


// ----- 5. C'est parti ! -----
initialiserJeu();
