/*
    model.js — Le "Model" du pattern MVC : les règles du jeu qui modifient l'état.
    Ici, pas de dessin ni de clavier : seulement des calculs sur l'objet state
    (placer les obstacles et les pommes, avancer le serpent, détecter les collisions,
    compter les points et les niveaux...).
*/

import {
    COLUMNS, ROWS, SPRITES, OBSTACLE_COUNT, OBSTACLE_SAFE_RADIUS,
    DIRECTIONS, INITIAL_SNAKE, INITIAL_DIRECTION, INITIAL_SPEED_MS, GAME_STATUS,
    FOOD_POINTS, SPECIAL_FOOD_MULTIPLIER, SPECIAL_FOOD_CHANCE, SPECIAL_FOOD_DURATION_MS,
    FOOD_PER_LEVEL, SPEED_STEP_MS, MIN_SPEED_MS
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

// On décide si on a le droit de poser un obstacle sur cette case.
function canPlaceObstacle(cell, state) {
    // Pas sur la première ligne : le haut du dessin (2 cases de haut) sortirait du canvas
    if (cell.y === 0) return false;
    if (isInsideSafeZone(cell, state.snake)) return false;
    return !hitsObstacle(cell, state);
}

// On choisit au hasard un des dessins d'obstacles (rocher ou arbre).
function getRandomObstacleSprite() {
    return SPRITES.obstacles[getRandomInt(SPRITES.obstacles.length)];
}

// On remplit la carte d'obstacles placés au hasard, en dehors de la zone protégée
// autour du serpent. On tire des cases jusqu'à en avoir assez de valides.
function createObstacles(state) {
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

// On vérifie si la case est occupée par un des morceaux du serpent.
function isOnSnake(cell, snake) {
    return snake.some(part => isSameCell(cell, part));
}

// On vérifie si la case contient déjà une pomme (normale ou dorée).
function hasFood(cell, state) {
    const onFood = state.food !== null && isSameCell(cell, state.food);
    const onSpecialFood = state.specialFood !== null && isSameCell(cell, state.specialFood);
    return onFood || onSpecialFood;
}

// On liste toutes les cases où une pomme a le droit d'apparaître :
// ni sur le serpent, ni sur un obstacle, ni sur l'autre pomme.
function getFreeCells(state) {
    const freeCells = [];
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLUMNS; x++) {
            const cell = { x, y };
            if (!isOnSnake(cell, state.snake) && !hitsObstacle(cell, state) && !hasFood(cell, state)) {
                freeCells.push(cell);
            }
        }
    }
    return freeCells;
}

// On tire une case libre au hasard, ou null s'il n'en reste aucune.
// On pioche dans la liste des cases libres plutôt que de tirer des cases au hasard
// jusqu'à tomber sur une bonne : comme ça, on est sûr de trouver du premier coup.
function getRandomFreeCell(state) {
    const freeCells = getFreeCells(state);
    // Cas extrême : le serpent remplit tout le plateau, il n'y a plus de place
    if (freeCells.length === 0) return null;
    return freeCells[getRandomInt(freeCells.length)];
}

// On pose la pomme normale sur une case libre tirée au hasard.
function placeFood(state) {
    state.food = getRandomFreeCell(state);
}

// Après une pomme normale, on tente notre chance : 1 fois sur 4 (SPECIAL_FOOD_CHANCE)
// une pomme dorée apparaît, s'il n'y en a pas déjà une sur le plateau.
function trySpawnSpecialFood(state) {
    if (state.specialFood !== null) return;
    if (Math.random() >= SPECIAL_FOOD_CHANCE) return;

    const cell = getRandomFreeCell(state);
    if (cell !== null) {
        state.specialFood = { x: cell.x, y: cell.y, remainingMs: SPECIAL_FOOD_DURATION_MS };
    }
}

// On fait vieillir la pomme dorée d'un pas de jeu. Quand son temps est écoulé, elle disparaît.
// On compte le temps en retirant la durée d'un pas (et pas avec l'horloge de l'ordinateur) :
// comme ça, le compte à rebours s'arrête tout seul pendant la pause.
function updateSpecialFoodTimer(state) {
    if (state.specialFood === null) return;
    state.specialFood.remainingMs -= state.speedMs;
    if (state.specialFood.remainingMs <= 0) {
        state.specialFood = null;
    }
}

// On calcule l'intervalle entre deux pas pour un niveau donné : on retire SPEED_STEP_MS
// par niveau gagné, sans jamais descendre sous MIN_SPEED_MS.
// Niveau 1 : 150 ms, niveau 2 : 140 ms, ... jusqu'à 60 ms au niveau 10 et au-delà.
function getSpeedForLevel(level) {
    return Math.max(MIN_SPEED_MS, INITIAL_SPEED_MS - (level - 1) * SPEED_STEP_MS);
}

// On recalcule le niveau à partir du nombre de pommes mangées (un niveau toutes les
// FOOD_PER_LEVEL pommes), puis la vitesse qui va avec. Le contrôleur utilise
// state.speedMs pour programmer le pas suivant : le jeu accélère donc tout seul.
function updateLevel(state) {
    state.level = 1 + Math.floor(state.foodEaten / FOOD_PER_LEVEL);
    state.speedMs = getSpeedForLevel(state.level);
}

// On ajoute des points au score et on compte une pomme de plus pour le niveau.
function addPoints(state, points) {
    state.score += points;
    state.foodEaten++;
    updateLevel(state);
}

// On remet la partie à zéro : serpent au départ, score à 0, nouvelle carte d'obstacles
// et nouvelle pomme. Le statut n'est pas touché : c'est le contrôleur qui décide quand on joue.
export function resetGame(state) {
    state.snake = INITIAL_SNAKE.map(part => ({ ...part }));
    state.direction = INITIAL_DIRECTION;
    state.nextDirection = INITIAL_DIRECTION;
    state.specialFood = null;
    state.score = 0;
    state.foodEaten = 0;
    state.level = 1;
    state.speedMs = INITIAL_SPEED_MS;
    createObstacles(state);
    // La pomme en dernier, pour qu'elle évite les obstacles qu'on vient de poser
    placeFood(state);
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

// On vérifie si la case contient un obstacle, quel qu'il soit (seule la case du bas compte).
// Sert au placement : ni pomme ni autre obstacle ne doit apparaître dessus.
function hitsObstacle(cell, state) {
    return state.obstacles.some(obstacle => isSameCell(cell, obstacle));
}

// On vérifie si la case contient un obstacle mortel (gros rocher, gros arbre).
// Les petits obstacles ont "deadly: false" : le serpent passe simplement par-dessus.
function hitsDeadlyObstacle(cell, state) {
    return state.obstacles.some(obstacle => obstacle.sprite.deadly && isSameCell(cell, obstacle));
}

// On vérifie si la tête va rentrer dans le corps du serpent.
// On ignore le dernier morceau : la queue avance en même temps que la tête,
// donc sa case sera libre au moment où la tête y arrive.
// (Quand le serpent mange, la queue ne bouge pas, mais la pomme n'est jamais sur
// le serpent : la tête ne peut donc pas être sur la queue à ce moment-là.)
function hitsOwnBody(cell, snake) {
    const bodyWithoutTail = snake.slice(0, -1);
    return isOnSnake(cell, bodyWithoutTail);
}

// On regroupe les trois cas qui font perdre : mur, obstacle mortel, ou son propre corps.
function isDeadlyCell(cell, state) {
    return isOutOfBounds(cell) || hitsDeadlyObstacle(cell, state) || hitsOwnBody(cell, state.snake);
}

// On regarde ce que la tête mange en arrivant sur cette case :
// "normal" pour la pomme rouge, "special" pour la pomme dorée, ou null si rien.
function getEatenFood(cell, state) {
    if (state.food !== null && isSameCell(cell, state.food)) return "normal";
    if (state.specialFood !== null && isSameCell(cell, state.specialFood)) return "special";
    return null;
}

// On fait avancer le serpent d'une case : on ajoute une nouvelle tête devant,
// et on retire le dernier morceau SAUF s'il vient de manger. C'est tout le secret
// de la croissance : en gardant la queue, le serpent gagne une case de longueur.
function moveSnake(state, newHead, hasEaten) {
    state.snake.unshift(newHead);
    if (!hasEaten) {
        state.snake.pop();
    }
}

// Le serpent a mangé la pomme rouge : on gagne des points, une nouvelle pomme apparaît,
// et parfois une pomme dorée en bonus.
// À appeler APRÈS moveSnake, pour que les nouvelles pommes évitent aussi la nouvelle tête.
function eatFood(state) {
    addPoints(state, FOOD_POINTS);
    placeFood(state);
    trySpawnSpecialFood(state);
}

// Le serpent a mangé la pomme dorée : points doubles, et elle disparaît.
function eatSpecialFood(state) {
    addPoints(state, FOOD_POINTS * SPECIAL_FOOD_MULTIPLIER);
    state.specialFood = null;
}

// Un "pas" du jeu (un "tick"), appelé à chaque tour de boucle : on applique la direction
// demandée, on regarde où la tête va arriver, puis soit on perd, soit on avance (en mangeant
// peut-être une pomme au passage). Enfin, le temps de la pomme dorée s'écoule.
// Renvoie true si le serpent a mangé, pour que le contrôleur joue le son et mette à jour le score.
export function updateGame(state) {
    state.direction = state.nextDirection;
    const newHead = getNextHeadPosition(state);

    if (isDeadlyCell(newHead, state)) {
        state.status = GAME_STATUS.GAME_OVER;
        return false;
    }

    const eatenFood = getEatenFood(newHead, state);
    const hasEaten = eatenFood !== null;
    moveSnake(state, newHead, hasEaten);

    if (eatenFood === "normal") {
        eatFood(state);
    } else if (eatenFood === "special") {
        eatSpecialFood(state);
    }
    updateSpecialFoodTimer(state);
    return hasEaten;
}
