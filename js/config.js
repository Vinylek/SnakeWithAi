/*
    config.js — Les bases du projet.
    On regroupe ici toutes les valeurs "réglables" du jeu (taille, vitesse, couleurs,
    touches, sprites) ainsi que l'état de la partie. Si on veut modifier le jeu,
    c'est d'abord ici qu'on regarde : aucun nombre magique ailleurs dans le code.
*/

// ----- 1. La fenêtre de jeu -----

// Taille d'une case à l'écran, en pixels (les sprites de 16 px sont affichés en x2)
export const CELL_SIZE = 32;

// Nombre de cases sur la largeur du plateau
export const COLUMNS = 30;

// Nombre de cases sur la hauteur du plateau
export const ROWS = 25;

// Largeur du canvas en pixels, calculée à partir de la grille (COLUMNS x CELL_SIZE)
export const CANVAS_WIDTH = COLUMNS * CELL_SIZE;

// Hauteur du canvas en pixels (ROWS x CELL_SIZE)
export const CANVAS_HEIGHT = ROWS * CELL_SIZE;


// ----- 2. La vitesse du jeu -----

// Temps entre deux déplacements au début de la partie (plus c'est petit, plus c'est rapide)
export const INITIAL_SPEED_MS = 150;

// Temps retiré à l'intervalle à chaque nouveau niveau
export const SPEED_STEP_MS = 10;

// Intervalle minimum : on ne descend jamais en dessous, sinon c'est injouable
export const MIN_SPEED_MS = 60;

// Nombre de pommes à manger pour passer au niveau suivant
export const FOOD_PER_LEVEL = 5;


// ----- 3. La nourriture -----

// Points gagnés en mangeant une pomme normale
export const FOOD_POINTS = 1;

// Multiplicateur de points de la pomme spéciale (points doubles)
export const SPECIAL_FOOD_MULTIPLIER = 2;

// Chance (entre 0 et 1) qu'une pomme spéciale apparaisse après chaque pomme mangée
export const SPECIAL_FOOD_CHANCE = 0.25;

// Durée de vie de la pomme spéciale avant qu'elle disparaisse, en millisecondes
export const SPECIAL_FOOD_DURATION_MS = 5000;

// Pendant ses dernières millisecondes, la pomme spéciale clignote pour prévenir qu'elle va partir
export const SPECIAL_FOOD_BLINK_MS = 1500;


// ----- 4. Les obstacles -----

// Nombre d'obstacles (rochers, arbres) posés au hasard sur la carte en début de partie
export const OBSTACLE_COUNT = 25;

// Rayon (en cases) autour du serpent de départ où aucun obstacle ne peut apparaître,
// pour que le joueur ait le temps de réagir au lancement de la partie
export const OBSTACLE_SAFE_RADIUS = 4;


// ----- 5. Les couleurs -----

// Couleurs utilisées pour le texte, les écrans et en secours si la spritesheet ne charge pas
export const COLORS = {
    text: "#ffffff",         // texte des écrans menu / pause / game over
    highlight: "#fdd835",    // option choisie dans le menu, nouvelle ligne du classement
    overlay: "rgba(0, 0, 0, 0.6)" // voile sombre posé sur le jeu derrière les textes
};


// ----- 6. Les touches de contrôle -----

// On compare avec event.key : plusieurs touches peuvent déclencher la même action
// (flèches pour tout le monde, ZQSD pour les claviers AZERTY, WASD pour les QWERTY)
export const KEYS = {
    up: ["ArrowUp", "z", "w"],
    down: ["ArrowDown", "s"],
    left: ["ArrowLeft", "q", "a"],
    right: ["ArrowRight", "d"],
    pause: [" "],          // barre espace
    confirm: ["Enter"],    // valider (choix du menu, pseudo, rejouer)
    back: ["Escape"],      // revenir au menu
    erase: ["Backspace"]   // effacer la dernière lettre du pseudo
};

// Les 4 directions possibles : de combien de cases la tête bouge en x et en y
export const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};


// Position du serpent au début de chaque partie. La case 0 est la tête.
export const INITIAL_SNAKE = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];

// Direction du serpent au début de chaque partie
export const INITIAL_DIRECTION = DIRECTIONS.right;


// ----- 7. La spritesheet -----

// Chemin de l'image qui contient tous les dessins du jeu
export const SPRITESHEET_PATH = "assets/snake_spritesheet.png";

// Chemin du son joué quand le serpent mange
export const EAT_SOUND_PATH = "assets/crunch.wav";

// Taille d'une tuile dans la spritesheet, en pixels
export const SPRITE_SIZE = 16;

// Position (colonne, ligne) de chaque dessin dans la spritesheet, en tuiles de 16 px.
// "height" (optionnel) = nombre de tuiles en hauteur, pour les dessins plus grands qu'une case.
// On utilise le serpent vert (lignes 9 à 13) sur un sol de sable (lignes 0 et 1).
export const SPRITES = {
    // Deux tuiles de sable qu'on alterne en damier pour que le sol ne soit pas monotone
    ground: [
        { col: 0, row: 0 },
        { col: 1, row: 0 }
    ],
    // Corps : le nom indique de quels côtés le morceau est relié à ses voisins
    body: {
        "up-down": { col: 0, row: 9 },
        "left-right": { col: 1, row: 9 },
        "up-left": { col: 2, row: 9 },
        "up-right": { col: 3, row: 9 },
        "down-left": { col: 4, row: 9 },
        "down-right": { col: 5, row: 9 }
    },
    // Queue : le nom indique de quel côté se trouve le morceau de corps qui la précède
    tail: {
        up: { col: 6, row: 9 },
        left: { col: 7, row: 9 },
        down: { col: 8, row: 9 },
        right: { col: 9, row: 9 }
    },
    // Tête : le nom indique vers où elle regarde
    head: {
        up: { col: 8, row: 10 },
        left: { col: 8, row: 11 },
        down: { col: 8, row: 12 },
        right: { col: 8, row: 13 }
    },
    // Obstacles : 1 tuile de large mais 2 de haut (le haut des arbres dépasse de la case).
    // Seule la case du bas compte pour les collisions, le haut est juste décoratif.
    // "deadly" : true si le serpent meurt en le touchant, false s'il peut passer par-dessus.
    obstacles: [
        { col: 4, row: 0, height: 2, deadly: true },   // gros rochers
        { col: 5, row: 0, height: 2, deadly: true },
        { col: 6, row: 0, height: 2, deadly: true },
        { col: 7, row: 0, height: 2, deadly: false },  // petits rochers
        { col: 8, row: 0, height: 2, deadly: false },
        { col: 9, row: 0, height: 2, deadly: false },
        { col: 10, row: 0, height: 2, deadly: true },  // gros arbres
        { col: 11, row: 0, height: 2, deadly: true },
        { col: 12, row: 0, height: 2, deadly: true },
        { col: 13, row: 0, height: 2, deadly: false }, // petits arbustes
        { col: 14, row: 0, height: 2, deadly: false },
        { col: 15, row: 0, height: 2, deadly: false }
    ],
    food: { col: 0, row: 21 },        // pomme rouge
    specialFood: { col: 2, row: 21 }  // pomme dorée (points doubles)
};


// ----- 8. Le menu et le classement -----

// Les choix du menu principal : le texte affiché et l'action lancée par Entrée
export const MENU_OPTIONS = [
    { label: "Jouer", action: "play" },
    { label: "Classement", action: "leaderboard" }
];

// Nombre de scores gardés dans le classement (le top 10)
export const LEADERBOARD_SIZE = 10;

// Nom de la clé sous laquelle le classement est rangé dans le localStorage du navigateur
export const LEADERBOARD_STORAGE_KEY = "snake-leaderboard";

// Nom de la clé sous laquelle le dernier pseudo utilisé est rangé, pour le proposer la fois suivante
export const LAST_PLAYER_NAME_STORAGE_KEY = "snake-last-player-name";

// Nombre maximum de caractères du pseudo tapé pour le classement
export const PLAYER_NAME_MAX_LENGTH = 10;

// Pseudo utilisé si le joueur valide sans rien taper
export const DEFAULT_PLAYER_NAME = "ANONYME";


// ----- 9. L'état du jeu -----

// Les différents écrans / moments possibles de la partie
export const GAME_STATUS = {
    MENU: "menu",           // écran d'accueil, avant de jouer
    PLAYING: "playing",     // partie en cours
    PAUSED: "paused",       // partie figée (barre espace)
    GAME_OVER: "game-over", // le serpent a percuté un mur, un obstacle ou son corps
    NAME_ENTRY: "name-entry", // score dans le top 10 : le joueur tape son pseudo
    LEADERBOARD: "leaderboard" // affichage du classement
};

// Toutes les données qui changent pendant la partie, regroupées dans un seul objet.
// C'est le "Model" du pattern MVC : la vue le lit pour dessiner, le contrôleur le modifie.
export const state = {
    // Le serpent est une liste de cases {x, y}. La case 0 est la tête, la dernière la queue.
    // On copie chaque case pour ne jamais modifier INITIAL_SNAKE en déplaçant le serpent.
    snake: INITIAL_SNAKE.map(part => ({ ...part })),
    direction: INITIAL_DIRECTION,     // direction actuelle du serpent
    nextDirection: INITIAL_DIRECTION, // direction demandée au clavier, appliquée au prochain pas
    food: null,                      // position {x, y} de la pomme, tirée au hasard par placeFood()
    obstacles: [],                   // obstacles {x, y, sprite}, tirés au hasard par createObstacles()
    specialFood: null,               // pomme dorée {x, y, remainingMs} ou null s'il n'y en a pas
    score: 0,                        // points de la partie en cours
    leaderboard: [],                 // top 10 {name, score}, du meilleur au moins bon (localStorage)
    lastRank: -1,                    // place du dernier score enregistré (surlignée), -1 si aucune
    playerName: "",                  // pseudo saisi sur l'écran NAME_ENTRY (pré-rempli avec le dernier utilisé)
    menuIndex: 0,                    // option du menu actuellement sélectionnée
    foodEaten: 0,                    // nombre de pommes mangées (normales + dorées), sert au calcul du niveau
    level: 1,                        // niveau actuel, augmente toutes les FOOD_PER_LEVEL pommes
    speedMs: INITIAL_SPEED_MS,       // intervalle actuel entre deux déplacements
    status: GAME_STATUS.MENU         // écran affiché : menu / en cours / pause / game over
};
