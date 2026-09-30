/*
    main.js — Le point d'entrée du jeu.
    C'est le premier fichier chargé par index.html : il attend les ressources,
    prépare l'affichage, place les obstacles et la pomme, branche le clavier,
    puis affiche l'écran de menu. La suite se passe dans controller.js.
*/

import { state } from "./config.js";
import { loadAssets } from "./assets.js";
import { resetGame } from "./model.js";
import { initController } from "./controller.js";
import { initView, render, updateHud, drawLoadingError } from "./view.js";

// On démarre l'application : chargement des ressources, placement des obstacles et de la pomme,
// écoute du clavier, puis premier affichage (l'écran de menu).
// Si le chargement échoue, on affiche l'erreur dans le canvas au lieu d'un écran vide.
async function startApp() {
    const canvas = document.getElementById("game-canvas");

    try {
        const assets = await loadAssets();
        initView(canvas, assets.spritesheet);
        resetGame(state);
        initController(assets.eatSound);
        updateHud(state);
        render(state);
    } catch (error) {
        drawLoadingError(canvas, error.message);
        console.error(error);
    }
}

startApp();
