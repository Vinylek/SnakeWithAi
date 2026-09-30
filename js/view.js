/*
    view.js — La "View" du pattern MVC : tout ce qui dessine dans le canvas.
    Ce fichier lit l'état du jeu (state) mais ne le modifie jamais.
    Il découpe la spritesheet pour afficher le sol, le serpent et les pommes,
    et dessine par-dessus les écrans de menu, pause, game over, pseudo et classement.
*/

import {
    CELL_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, COLUMNS, ROWS,
    SPRITE_SIZE, SPRITES, COLORS, GAME_STATUS, MENU_OPTIONS, PLAYER_NAME_MAX_LENGTH,
    SPECIAL_FOOD_BLINK_MS
} from "./config.js";
import { getBestScore } from "./leaderboard.js";

// Milieu du canvas : tous les écrans sont centrés autour de ce point
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

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

// On décide si la pomme dorée doit être visible sur cette image.
// Pendant ses dernières SPECIAL_FOOD_BLINK_MS millisecondes, on la cache une fois sur deux
// (toutes les 300 ms) : elle clignote pour prévenir le joueur qu'elle va disparaître.
function isSpecialFoodVisible(specialFood) {
    if (specialFood.remainingMs > SPECIAL_FOOD_BLINK_MS) return true;
    return Math.floor(specialFood.remainingMs / 300) % 2 === 0;
}

// On dessine la pomme normale, et la pomme dorée si elle est présente.
function drawFood(state) {
    if (state.food) {
        drawSprite(SPRITES.food, state.food.x, state.food.y);
    }
    if (state.specialFood && isSpecialFoodVisible(state.specialFood)) {
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

// On pose un voile sombre sur tout le jeu pour que le texte des écrans soit lisible.
function drawOverlay() {
    context.fillStyle = COLORS.overlay;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// On écrit une ligne de texte centrée horizontalement, à la hauteur y.
function drawCenteredText(text, y, size, color = COLORS.text) {
    context.fillStyle = color;
    context.textAlign = "center";
    context.font = `bold ${size}px monospace`;
    context.fillText(text, CENTER_X, y);
}

// Écran d'accueil : le titre, puis la liste des options.
// L'option choisie est entourée de flèches et écrite en jaune.
function drawMenuScreen(state) {
    drawCenteredText("SNAKE", CENTER_Y - 120, 64);
    MENU_OPTIONS.forEach((option, index) => {
        const isSelected = index === state.menuIndex;
        const label = isSelected ? `> ${option.label} <` : option.label;
        const color = isSelected ? COLORS.highlight : COLORS.text;
        drawCenteredText(label, CENTER_Y + index * 50, 28, color);
    });
    drawCenteredText("↑ ↓ pour choisir — Entrée pour valider", CENTER_Y + 180, 18);
}

// Écran de pause : on rappelle comment reprendre ou quitter.
function drawPauseScreen() {
    drawCenteredText("PAUSE", CENTER_Y - 20, 48);
    drawCenteredText("Espace : reprendre — Échap : menu", CENTER_Y + 30, 20);
}

// Écran de fin de partie (score hors du top 10, ou pseudo passé avec Échap).
function drawGameOverScreen(state) {
    drawCenteredText("GAME OVER", CENTER_Y - 40, 48);
    drawCenteredText(`Score : ${state.score}`, CENTER_Y + 10, 28);
    drawCenteredText("Entrée : rejouer — Échap : menu", CENTER_Y + 60, 20);
}

// Écran de saisie du pseudo quand le score entre dans le top 10.
// Le "_" ne clignote pas : il montre juste où la prochaine lettre va s'écrire.
function drawNameEntryScreen(state) {
    const isNewRecord = state.score > getBestScore(state.leaderboard);
    drawCenteredText(isNewRecord ? "NOUVEAU RECORD !" : "TOP 10 !", CENTER_Y - 100, 48, COLORS.highlight);
    drawCenteredText(`Score : ${state.score}`, CENTER_Y - 50, 28);
    drawCenteredText("Ton pseudo :", CENTER_Y + 10, 24);

    const cursor = state.playerName.length < PLAYER_NAME_MAX_LENGTH ? "_" : "";
    drawCenteredText(state.playerName + cursor, CENTER_Y + 60, 36, COLORS.highlight);
    drawCenteredText("Entrée : valider — Échap : ne pas enregistrer", CENTER_Y + 130, 18);
}

// On met en forme une ligne du classement, par exemple " 1. ETIENNE       42".
// La police monospace donne la même largeur à chaque lettre, donc les colonnes s'alignent.
function formatLeaderboardRow(entry, index) {
    const rank = String(index + 1).padStart(2, " ");
    const name = entry.name.padEnd(PLAYER_NAME_MAX_LENGTH, " ");
    const score = String(entry.score).padStart(5, " ");
    return `${rank}. ${name} ${score}`;
}

// Écran du classement : le top 10, avec la ligne du score qu'on vient d'enregistrer en jaune.
function drawLeaderboardScreen(state) {
    const top = CENTER_Y - 250;
    drawCenteredText("CLASSEMENT", top, 48);

    if (state.leaderboard.length === 0) {
        drawCenteredText("Aucun score pour l'instant", CENTER_Y, 24);
    }
    state.leaderboard.forEach((entry, index) => {
        const color = index === state.lastRank ? COLORS.highlight : COLORS.text;
        drawCenteredText(formatLeaderboardRow(entry, index), top + 70 + index * 40, 24, color);
    });

    drawCenteredText("Entrée ou Échap : retour au menu", CENTER_Y + 250, 18);
}

// Quelle fonction dessine l'écran affiché par-dessus le jeu (aucune pendant la partie)
const SCREEN_DRAWERS = {
    [GAME_STATUS.MENU]: drawMenuScreen,
    [GAME_STATUS.PAUSED]: drawPauseScreen,
    [GAME_STATUS.GAME_OVER]: drawGameOverScreen,
    [GAME_STATUS.NAME_ENTRY]: drawNameEntryScreen,
    [GAME_STATUS.LEADERBOARD]: drawLeaderboardScreen
};

// On redessine toute la scène : le sol, les obstacles, les pommes, puis le serpent.
// L'ordre compte : ce qui est dessiné en dernier apparaît au-dessus. Les obstacles
// passent avant pour que le haut d'un arbre ne cache jamais une pomme ou le serpent.
export function render(state) {
    drawBackground();
    drawObstacles(state);
    drawFood(state);
    drawSnake(state);

    // Hors partie en cours, on assombrit le jeu et on dessine l'écran par-dessus
    const drawScreen = SCREEN_DRAWERS[state.status];
    if (drawScreen) {
        drawOverlay();
        drawScreen(state);
    }
}

// On met à jour les chiffres affichés au-dessus du canvas (score, niveau, record).
// Le record suit le score en direct dès qu'on dépasse le premier du classement.
export function updateHud(state) {
    const bestScore = Math.max(getBestScore(state.leaderboard), state.score);
    document.getElementById("score").textContent = state.score;
    document.getElementById("level").textContent = state.level;
    document.getElementById("best-score").textContent = bestScore;
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
