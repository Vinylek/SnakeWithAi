/*
    main.js — Le point d'entrée du jeu.
    C'est le premier fichier chargé par index.html : il attend les ressources,
    prépare l'affichage, puis dessine la scène de départ.
    (La boucle de jeu et le clavier arriveront dans controller.js.)
*/

import { state } from "./config.js";
import { loadAssets } from "./assets.js";
import { initView, render, updateHud, drawLoadingError } from "./view.js";

// On démarre l'application : chargement de la spritesheet, puis premier affichage.
// Si le chargement échoue, on affiche l'erreur dans le canvas au lieu d'un écran vide.
async function startApp() {
    const canvas = document.getElementById("game-canvas");

    try {
        const assets = await loadAssets();
        initView(canvas, assets.spritesheet);
        updateHud(state);
        render(state);
    } catch (error) {
        drawLoadingError(canvas, error.message);
        console.error(error);
    }
}

startApp();
