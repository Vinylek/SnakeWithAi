/*
    model.js — Le "Model" du pattern MVC : les règles du jeu qui modifient l'état.
    Ici, pas de dessin ni de clavier : seulement des calculs sur l'objet state
    (où placer les obstacles, quelle case est libre, etc.).
*/

import {
    COLUMNS, ROWS, SPRITES, OBSTACLE_COUNT, OBSTACLE_SAFE_RADIUS
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
