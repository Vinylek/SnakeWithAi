/*
    controller.js — Le "Controller" du pattern MVC : le clavier et la boucle de jeu.
    Il écoute les touches du joueur, demande au Model de mettre l'état à jour,
    puis demande à la View de redessiner. Il fait le lien entre les deux.
*/

import { state, KEYS, DIRECTIONS, GAME_STATUS } from "./config.js";
import { changeDirection, updateGame, resetGame } from "./model.js";
import { render, updateHud } from "./view.js";

// Identifiant du prochain tour de boucle programmé, pour pouvoir l'annuler
let loopTimer = null;

// Le son "crunch" joué quand le serpent mange, reçu dans initController()
let eatSound = null;

// On traduit la touche appuyée en action du jeu ("up", "pause", "start"...).
// On parcourt KEYS et on renvoie le nom de l'action qui contient cette touche, ou null.
function getActionFromKey(key) {
    // On passe en minuscule pour que "Z" (majuscule verrouillée) marche comme "z"
    const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
    const actions = Object.keys(KEYS);
    return actions.find(action => KEYS[action].includes(normalizedKey)) || null;
}

// On lance la partie depuis le menu, ou on en relance une nouvelle après un game over.
function startGame() {
    if (state.status === GAME_STATUS.GAME_OVER) {
        resetGame(state);
        updateHud(state);
    }
    state.status = GAME_STATUS.PLAYING;
    scheduleNextTick();
}

// Barre espace : on fige la partie, ou on la reprend si elle était déjà en pause.
function togglePause() {
    if (state.status === GAME_STATUS.PLAYING) {
        state.status = GAME_STATUS.PAUSED;
        clearTimeout(loopTimer);
    } else if (state.status === GAME_STATUS.PAUSED) {
        state.status = GAME_STATUS.PLAYING;
        scheduleNextTick();
    }
    render(state);
}

// On réagit à une touche : chaque action n'est acceptée que dans le bon écran
// (on ne tourne pas pendant la pause, on ne relance pas une partie déjà en cours...).
function handleKeyDown(event) {
    const action = getActionFromKey(event.key);
    if (!action) return;

    // Empêche les flèches et la barre espace de faire défiler la page
    event.preventDefault();

    const canStart = state.status === GAME_STATUS.MENU || state.status === GAME_STATUS.GAME_OVER;

    if (action === "start" && canStart) {
        startGame();
    } else if (action === "pause") {
        togglePause();
    } else if (action in DIRECTIONS && state.status === GAME_STATUS.PLAYING) {
        changeDirection(state, action);
    }
}

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
function gameTick() {
    const hasEaten = updateGame(state);
    if (hasEaten) {
        playEatSound();
        updateHud(state);
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
