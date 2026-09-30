/*
    view.js — La "View" du pattern MVC : tout ce qui dessine dans le canvas.
    Ce fichier lit l'état du jeu (state) mais ne le modifie jamais.
    Il découpe la spritesheet pour afficher le sol, le serpent et les pommes.
*/

import {
    CELL_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, COLUMNS, ROWS,
    SPRITE_SIZE, SPRITES, COLORS, GAME_STATUS
} from "./config.js";

// Texte affiché au centre du plateau selon l'écran (rien pendant la partie)
const SCREEN_MESSAGES = {
    [GAME_STATUS.MENU]: { title: "SNAKE", subtitle: "Appuie sur Entrée pour jouer" },
    [GAME_STATUS.PAUSED]: { title: "PAUSE", subtitle: "Espace pour reprendre" },
    [GAME_STATUS.GAME_OVER]: { title: "GAME OVER", subtitle: "Entrée pour rejouer" }
};

// L'outil de dessin du canvas et l'image des sprites, gardés ici après initView()
let context = null;
let spritesheet = null;

// On prépare le canvas : on lui donne sa taille et on récupère son outil de dessin.
export function initView(canvas, spritesheetImage) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    context = canvas.getContext("2d");
    // Garde les pixels bien carrés quand on agrandit les sprites de 16 à 32 px
    context.imageSmoothingEnabled = false;
    spritesheet = spritesheetImage;
}

// On découpe un dessin dans la spritesheet et on le colle, agrandi, sur la case (x, y).
// La plupart des dessins font 1 tuile, mais un obstacle en fait 2 de haut : dans ce cas
// on aligne le bas du dessin sur la case, et le haut dépasse sur la case du dessus.
function drawSprite(sprite, x, y) {
    const height = sprite.height || 1;
    context.drawImage(
        spritesheet,
        // Zone à découper dans la spritesheet (source)
        sprite.col * SPRITE_SIZE, sprite.row * SPRITE_SIZE, SPRITE_SIZE, height * SPRITE_SIZE,
        // Endroit où la coller dans le canvas (destination), remonté si le dessin est haut
        x * CELL_SIZE, (y - (height - 1)) * CELL_SIZE, CELL_SIZE, height * CELL_SIZE
    );
}

// On recouvre tout le plateau de sable, en alternant deux tuiles comme un damier.
function drawBackground() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLUMNS; x++) {
            const tile = SPRITES.ground[(x + y) % 2];
            drawSprite(tile, x, y);
        }
    }
}

// On dessine les obstacles de haut en bas de l'écran : ainsi un arbre plus bas
// passe devant le haut d'un arbre situé juste au-dessus, comme dans la réalité.
function drawObstacles(state) {
    const sortedObstacles = [...state.obstacles].sort((a, b) => a.y - b.y);
    sortedObstacles.forEach(obstacle => drawSprite(obstacle.sprite, obstacle.x, obstacle.y));
}

// On dessine la pomme normale, et la pomme dorée si elle est présente.
function drawFood(state) {
    if (state.food) {
        drawSprite(SPRITES.food, state.food.x, state.food.y);
    }
    if (state.specialFood) {
        drawSprite(SPRITES.specialFood, state.specialFood.x, state.specialFood.y);
    }
}

// On regarde dans quelle direction se trouve la case "to" par rapport à la case "from".
// Ça sert à savoir de quel côté un morceau du serpent est relié à son voisin.
function getDirectionName(from, to) {
    if (to.x < from.x) return "left";
    if (to.x > from.x) return "right";
    if (to.y < from.y) return "up";
    return "down";
}

// On choisit le bon dessin pour le morceau numéro "index" du serpent :
// une tête, une queue, ou un morceau de corps (droit ou en virage).
function getSnakePartSprite(snake, index, direction) {
    const part = snake[index];

    if (index === 0) {
        // La tête regarde dans le sens où elle avance
        const headDirection = getDirectionName({ x: 0, y: 0 }, direction);
        return SPRITES.head[headDirection];
    }

    const previous = snake[index - 1];
    if (index === snake.length - 1) {
        return SPRITES.tail[getDirectionName(part, previous)];
    }

    // Pour un morceau du milieu, on regarde ses deux voisins. On range les deux côtés
    // toujours dans le même ordre pour retrouver la clé ("up-left", "left-right"...).
    const next = snake[index + 1];
    const order = ["up", "down", "left", "right"];
    const sides = [getDirectionName(part, previous), getDirectionName(part, next)];
    sides.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return SPRITES.body[sides.join("-")];
}

// On dessine le serpent morceau par morceau, de la queue vers la tête
// pour que la tête passe toujours par-dessus le reste.
function drawSnake(state) {
    for (let index = state.snake.length - 1; index >= 0; index--) {
        const part = state.snake[index];
        const sprite = getSnakePartSprite(state.snake, index, state.direction);
        drawSprite(sprite, part.x, part.y);
    }
}

// On pose un voile sombre sur le jeu et on écrit un titre et une consigne au centre.
// Sert pour le menu, la pause et le game over.
function drawMessage(title, subtitle) {
    context.fillStyle = COLORS.overlay;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    context.fillStyle = COLORS.text;
    context.textAlign = "center";
    context.font = "bold 48px monospace";
    context.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 16);
    context.font = "20px monospace";
    context.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 28);
}

// On redessine toute la scène : le sol, les obstacles, les pommes, puis le serpent.
// L'ordre compte : ce qui est dessiné en dernier apparaît au-dessus. Les obstacles
// passent avant pour que le haut d'un arbre ne cache jamais une pomme ou le serpent.
export function render(state) {
    drawBackground();
    drawObstacles(state);
    drawFood(state);
    drawSnake(state);

    // Hors partie en cours, on affiche le message de l'écran par-dessus le jeu
    const message = SCREEN_MESSAGES[state.status];
    if (message) {
        drawMessage(message.title, message.subtitle);
    }
}

// On met à jour les chiffres affichés au-dessus du canvas (score, niveau, record).
export function updateHud(state) {
    document.getElementById("score").textContent = state.score;
    document.getElementById("level").textContent = state.level;
    document.getElementById("best-score").textContent = state.bestScore;
}

// Si la spritesheet n'a pas pu être chargée, on l'écrit directement dans le canvas
// pour que le joueur comprenne ce qui se passe.
export function drawLoadingError(canvas, message) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const errorContext = canvas.getContext("2d");
    errorContext.fillStyle = "#000";
    errorContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    errorContext.fillStyle = "#fff";
    errorContext.font = "16px monospace";
    errorContext.textAlign = "center";
    errorContext.fillText(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}
