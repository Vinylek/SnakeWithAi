/*
    assets.js — Le chargement des ressources (image et son).
    Une image met un peu de temps à arriver : on ne doit pas dessiner avant qu'elle
    soit prête. Ce fichier s'occupe de l'attendre proprement avec une Promise.
*/

import { SPRITESHEET_PATH, EAT_SOUND_PATH } from "./config.js";

// On charge une image et on "promet" de prévenir quand elle est prête.
// Si le fichier est introuvable, la promesse échoue et on pourra afficher une erreur.
function loadImage(path) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Impossible de charger l'image : ${path}`));
        // On donne le chemin en dernier : c'est ça qui déclenche le téléchargement
        image.src = path;
    });
}

// On prépare le son du "crunch". Pas besoin d'attendre : le navigateur le chargera
// en arrière-plan, et au pire le premier son sera juste un peu en retard.
function loadSound(path) {
    const sound = new Audio(path);
    sound.volume = 0.5;
    return sound;
}

// On charge toutes les ressources du jeu d'un coup et on les renvoie dans un objet.
export async function loadAssets() {
    const spritesheet = await loadImage(SPRITESHEET_PATH);
    const eatSound = loadSound(EAT_SOUND_PATH);
    return { spritesheet, eatSound };
}
