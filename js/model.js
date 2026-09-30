/*
    model.js — Le "Model" du pattern MVC : les règles du jeu qui modifient l'état.
    Ici, pas de dessin ni de clavier : seulement des calculs sur l'objet state
    (placer les obstacles, avancer le serpent, détecter les collisions, etc.).
*/

import {
    COLUMNS, ROWS, SPRITES, OBSTACLE_COUNT, OBSTACLE_SAFE_RADIUS,
    DIRECTIONS, INITIAL_SNAKE, INITIAL_DIRECTION, INITIAL_SPEED_MS, GAME_STATUS
} from "./config.js";

// On tire un nombre entier au hasard entre 0 (inclus) et max (exclu).
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// On tire une case au hasard sur le plateau.
function getRandomCell() {
    return { x: getRandomInt(COLUMNS), y: getRandomInt(ROWS) };
}

// On vérifie si deux cases sont au même endroit.
function isSameCell(a, b) {
    return a.x === b.x && a.y === b.y;
}

// On vérifie si la case est trop proche du serpent : si elle est à moins de
// OBSTACLE_SAFE_RADIUS cases d'un de ses morceaux, elle est dans la zone protégée.
function isInsideSafeZone(cell, snake) {
    return snake.some(part => {
        // Distance "à vol d'oiseau" entre la case et ce morceau (théorème de Pythagore)
        const distance = Math.hypot(cell.x - part.x, cell.y - part.y);
        return distance <= OBSTACLE_SAFE_RADIUS;
    });
}

// On vérifie si la case est déjà prise par la pomme ou par un autre obstacle.
function isOccupied(cell, state) {
    if (isSameCell(cell, state.food)) return true;
    return state.obstacles.some(obstacle => isSameCell(cell, obstacle));
}

// On décide si on a le droit de poser un obstacle sur cette case.
function canPlaceObstacle(cell, state) {
    // Pas sur la première ligne : le haut du dessin (2 cases de haut) sortirait du canvas
    if (cell.y === 0) return false;
    if (isInsideSafeZone(cell, state.snake)) return false;
    return !isOccupied(cell, state);
}

// On choisit au hasard un des dessins d'obstacles (rocher ou arbre).
function getRandomObstacleSprite() {
    return SPRITES.obstacles[getRandomInt(SPRITES.obstacles.length)];
}

// On remplit la carte d'obstacles placés au hasard, en dehors de la zone protégée
// autour du serpent. On tire des cases jusqu'à en avoir assez de valides.
export function createObstacles(state) {
    state.obstacles = [];
    // Garde-fou : si la carte est trop petite pour tout placer, on s'arrête quand même
    const maxAttempts = OBSTACLE_COUNT * 50;
    let attempts = 0;

    while (state.obstacles.length < OBSTACLE_COUNT && attempts < maxAttempts) {
        attempts++;
        const cell = getRandomCell();
        if (canPlaceObstacle(cell, state)) {
            state.obstacles.push({ x: cell.x, y: cell.y, sprite: getRandomObstacleSprite() });
        }
    }
}

// On remet la partie à zéro : serpent au départ, score à 0, nouvelle carte d'obstacles.
// Le statut n'est pas touché ici : c'est le contrôleur qui décide quand on joue.
export function resetGame(state) {
    state.snake = INITIAL_SNAKE.map(part => ({ ...part }));
    state.direction = INITIAL_DIRECTION;
    state.nextDirection = INITIAL_DIRECTION;
    state.specialFood = null;
    state.score = 0;
    state.level = 1;
    state.speedMs = INITIAL_SPEED_MS;
    createObstacles(state);
}

// On vérifie si deux directions sont opposées (droite/gauche ou haut/bas) :
// leurs déplacements s'annulent quand on les additionne.
function isOppositeDirection(a, b) {
    return a.x + b.x === 0 && a.y + b.y === 0;
}

// Le joueur a appuyé sur une flèche : on retient la direction demandée pour le prochain pas.
// On refuse le demi-tour, sinon la tête rentrerait directement dans le corps.
// On compare avec la direction réellement suivie (state.direction) et pas avec la dernière
// demandée : ainsi deux touches rapides dans le même pas ne permettent pas de tricher.
export function changeDirection(state, directionName) {
    const wanted = DIRECTIONS[directionName];
    if (!isOppositeDirection(wanted, state.direction)) {
        state.nextDirection = wanted;
    }
}

// On calcule la case où la tête va arriver en avançant d'un pas dans la direction actuelle.
function getNextHeadPosition(state) {
    const head = state.snake[0];
    return { x: head.x + state.direction.x, y: head.y + state.direction.y };
}

// On vérifie si la case est en dehors du plateau (le serpent a tapé un mur).
function isOutOfBounds(cell) {
    return cell.x < 0 || cell.x >= COLUMNS || cell.y < 0 || cell.y >= ROWS;
}

// On vérifie si la case contient un obstacle (seule la case du bas de l'obstacle compte).
function hitsObstacle(cell, state) {
    return state.obstacles.some(obstacle => isSameCell(cell, obstacle));
}

// On vérifie si la tête va rentrer dans le corps du serpent.
// On ignore le dernier morceau : la queue avance en même temps que la tête,
// donc sa case sera libre au moment où la tête y arrive.
function hitsOwnBody(cell, snake) {
    const bodyWithoutTail = snake.slice(0, -1);
    return bodyWithoutTail.some(part => isSameCell(cell, part));
}

// On regroupe les trois cas qui font perdre : mur, obstacle, ou son propre corps.
function isDeadlyCell(cell, state) {
    return isOutOfBounds(cell) || hitsObstacle(cell, state) || hitsOwnBody(cell, state.snake);
}

// On fait avancer le serpent d'une case : on ajoute une nouvelle tête devant
// et on retire le dernier morceau. Sa longueur ne change donc pas.
function moveSnake(state, newHead) {
    state.snake.unshift(newHead);
    state.snake.pop();
}

// Un "pas" du jeu, appelé à chaque tour de boucle : on applique la direction demandée,
// on regarde où la tête va arriver, puis soit on perd, soit on avance.
export function updateGame(state) {
    state.direction = state.nextDirection;
    const newHead = getNextHeadPosition(state);

    if (isDeadlyCell(newHead, state)) {
        state.status = GAME_STATUS.GAME_OVER;
        return;
    }
    moveSnake(state, newHead);
}
