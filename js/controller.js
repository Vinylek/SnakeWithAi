/*
    controller.js — Le "Controller" du pattern MVC : le clavier et la boucle de jeu.
    Il écoute les touches du joueur, demande au Model de mettre l'état à jour,
    puis demande à la View de redessiner. Il fait le lien entre les deux.
    Chaque écran (menu, partie, pause, game over, pseudo, classement) a sa propre
    fonction qui gère les touches : une même touche peut donc faire des choses
    différentes selon l'écran affiché.
*/

import {
    state, KEYS, DIRECTIONS, GAME_STATUS, MENU_OPTIONS,
    PLAYER_NAME_MAX_LENGTH, DEFAULT_PLAYER_NAME
} from "./config.js";
import { changeDirection, updateGame, resetGame } from "./model.js";
import { isHighScore, addScore } from "./leaderboard.js";
import { render, updateHud } from "./view.js";

// Identifiant du prochain tour de boucle programmé, pour pouvoir l'annuler
let loopTimer = null;

// Le son "crunch" joué quand le serpent mange, reçu dans initController()
let eatSound = null;

// On traduit la touche appuyée en action du jeu ("up", "pause", "confirm"...).
// On parcourt KEYS et on renvoie le nom de l'action qui contient cette touche, ou null.
function getActionFromKey(key) {
    // On passe en minuscule pour que "Z" (majuscule verrouillée) marche comme "z"
    const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
    const actions = Object.keys(KEYS);
    return actions.find(action => KEYS[action].includes(normalizedKey)) || null;
}

// On vérifie si la touche est un caractère autorisé dans un pseudo (lettre ou chiffre).
function isNameCharacter(key) {
    return /^[a-z0-9]$/i.test(key);
}


// ----- Changements d'écran -----

// On lance une nouvelle partie : carte neuve, score à zéro, et la boucle démarre.
function startGame() {
    resetGame(state);
    state.status = GAME_STATUS.PLAYING;
    updateHud(state);
    scheduleNextTick();
}

// On fige la partie : on annule simplement le prochain tour de boucle.
function pauseGame() {
    state.status = GAME_STATUS.PAUSED;
    clearTimeout(loopTimer);
}

// On reprend la partie là où elle s'était arrêtée.
function resumeGame() {
    state.status = GAME_STATUS.PLAYING;
    scheduleNextTick();
}

// On revient au menu principal (depuis la pause, le game over ou le classement).
function goToMenu() {
    clearTimeout(loopTimer);
    state.status = GAME_STATUS.MENU;
}

// On affiche le classement depuis le menu. Aucune ligne n'est surlignée :
// ça ne sert que juste après avoir enregistré un score.
function showLeaderboard() {
    state.lastRank = -1;
    state.status = GAME_STATUS.LEADERBOARD;
}

// La partie vient de se terminer : si le score entre dans le top 10,
// on demande un pseudo, sinon on reste sur l'écran de game over.
function endGame() {
    if (isHighScore(state.leaderboard, state.score)) {
        state.playerName = "";
        state.status = GAME_STATUS.NAME_ENTRY;
    }
}

// Le joueur a validé son pseudo : on range son score dans le classement,
// puis on affiche le classement avec sa ligne surlignée.
function submitScore() {
    const name = state.playerName || DEFAULT_PLAYER_NAME;
    const result = addScore(state.leaderboard, name, state.score);
    state.leaderboard = result.leaderboard;
    state.lastRank = result.rank;
    state.status = GAME_STATUS.LEADERBOARD;
    updateHud(state);
}

// On lance ce qui correspond à l'option choisie dans le menu.
function selectMenuOption() {
    const option = MENU_OPTIONS[state.menuIndex];
    if (option.action === "play") {
        startGame();
    } else if (option.action === "leaderboard") {
        showLeaderboard();
    }
}


// ----- Touches, écran par écran -----

// Menu : haut/bas pour changer d'option (en boucle), Entrée pour valider.
function handleMenuKey(action) {
    const optionCount = MENU_OPTIONS.length;
    if (action === "up") {
        // Le "+ optionCount" évite un index négatif quand on remonte depuis la première option
        state.menuIndex = (state.menuIndex - 1 + optionCount) % optionCount;
    } else if (action === "down") {
        state.menuIndex = (state.menuIndex + 1) % optionCount;
    } else if (action === "confirm") {
        selectMenuOption();
    }
}

// Partie en cours : les flèches dirigent le serpent, Espace met en pause.
function handlePlayingKey(action) {
    if (action in DIRECTIONS) {
        changeDirection(state, action);
    } else if (action === "pause") {
        pauseGame();
    }
}

// Pause : Espace pour reprendre, Échap pour abandonner et revenir au menu.
function handlePausedKey(action) {
    if (action === "pause") {
        resumeGame();
    } else if (action === "back") {
        goToMenu();
    }
}

// Game over : Entrée pour rejouer directement, Échap pour revenir au menu.
function handleGameOverKey(action) {
    if (action === "confirm") {
        startGame();
    } else if (action === "back") {
        goToMenu();
    }
}

// Saisie du pseudo : on tape des lettres/chiffres, Retour arrière efface,
// Entrée valide, Échap passe sans enregistrer le score.
// On teste d'abord les actions spéciales, puis la lettre : ainsi "z" ou "q"
// s'écrivent normalement au lieu d'être pris pour des flèches.
function handleNameEntryKey(action, key) {
    if (action === "confirm") {
        submitScore();
    } else if (action === "erase") {
        state.playerName = state.playerName.slice(0, -1);
    } else if (action === "back") {
        state.status = GAME_STATUS.GAME_OVER;
    } else if (isNameCharacter(key) && state.playerName.length < PLAYER_NAME_MAX_LENGTH) {
        state.playerName += key.toUpperCase();
    }
}

// Classement : Entrée ou Échap pour revenir au menu.
function handleLeaderboardKey(action) {
    if (action === "confirm" || action === "back") {
        goToMenu();
    }
}

// Quelle fonction gère le clavier pour chaque écran
const KEY_HANDLERS = {
    [GAME_STATUS.MENU]: handleMenuKey,
    [GAME_STATUS.PLAYING]: handlePlayingKey,
    [GAME_STATUS.PAUSED]: handlePausedKey,
    [GAME_STATUS.GAME_OVER]: handleGameOverKey,
    [GAME_STATUS.NAME_ENTRY]: handleNameEntryKey,
    [GAME_STATUS.LEADERBOARD]: handleLeaderboardKey
};

// On reçoit chaque touche du clavier et on la confie à la fonction de l'écran actuel,
// puis on redessine pour que le joueur voie tout de suite le résultat.
function handleKeyDown(event) {
    const action = getActionFromKey(event.key);
    const isTypingName = state.status === GAME_STATUS.NAME_ENTRY && isNameCharacter(event.key);
    // Les touches qui ne servent à rien dans le jeu gardent leur effet normal (F5, Ctrl+R...)
    if (!action && !isTypingName) return;

    // Empêche les flèches et la barre espace de faire défiler la page
    event.preventDefault();

    KEY_HANDLERS[state.status](action, event.key);
    render(state);
}


// ----- Boucle de jeu -----

// On joue le "crunch". On le rembobine d'abord pour qu'il reparte du début
// même si le son précédent n'était pas fini (pommes mangées coup sur coup).
function playEatSound() {
    eatSound.currentTime = 0;
    // play() peut être refusé par le navigateur : ce n'est pas grave, on ignore l'erreur
    eatSound.play().catch(() => {});
}

// On programme le prochain pas du jeu dans state.speedMs millisecondes.
// On utilise setTimeout (et pas setInterval) pour que la vitesse puisse changer
// d'un pas à l'autre quand on passera au niveau supérieur.
function scheduleNextTick() {
    clearTimeout(loopTimer);
    loopTimer = setTimeout(gameTick, state.speedMs);
}

// Un tour de boucle : le Model fait avancer le serpent, la View redessine,
// puis on programme le tour suivant tant que la partie continue.
// Si la partie vient de se terminer, endGame() décide de l'écran suivant.
function gameTick() {
    const hasEaten = updateGame(state);
    if (hasEaten) {
        playEatSound();
        updateHud(state);
    }
    if (state.status === GAME_STATUS.GAME_OVER) {
        endGame();
    }
    render(state);
    if (state.status === GAME_STATUS.PLAYING) {
        scheduleNextTick();
    }
}

// On branche l'écoute du clavier sur toute la page et on garde le son pour plus tard.
export function initController(sound) {
    eatSound = sound;
    document.addEventListener("keydown", handleKeyDown);
}
