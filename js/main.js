/*
    main.js — Le point d'entrée du jeu.
    C'est le premier fichier chargé par index.html : il attend les ressources,
    prépare l'affichage, place les obstacles, branche le clavier,
    puis affiche l'écran de menu. La suite se passe dans controller.js.
*/

import { state } from "./config.js";
import { loadAssets } from "./assets.js";
import { createObstacles } from "./model.js";
import { initController } from "./controller.js";
import { initView, render, updateHud, drawLoadingError } from "./view.js";

// On démarre l'application : chargement de la spritesheet, placement des obstacles,
// écoute du clavier, puis premier affichage (l'écran de menu).
// Si le chargement échoue, on affiche l'erreur dans le canvas au lieu d'un écran vide.
async function startApp() {
    const canvas = document.getElementById("game-canvas");

    try {
        const assets = await loadAssets();
        initView(canvas, assets.spritesheet);
        createObstacles(state);
        initController();
        updateHud(state);
        render(state);
    } catch (error) {
        drawLoadingError(canvas, error.message);
        console.error(error);
    }
}

startApp();
