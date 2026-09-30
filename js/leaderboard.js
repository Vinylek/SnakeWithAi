/*
    leaderboard.js — Le classement des meilleurs scores (partie "Model" du MVC).
    Il garde le top 10 dans le localStorage du navigateur : les scores restent
    enregistrés même quand on ferme la page. Aucun dessin ici, que des données.
*/

import { LEADERBOARD_SIZE, LEADERBOARD_STORAGE_KEY, LAST_PLAYER_NAME_STORAGE_KEY } from "./config.js";

// On vérifie qu'une ligne lue dans le localStorage ressemble bien à {name, score}.
// Quelqu'un a pu modifier le localStorage à la main, donc on ne lui fait pas confiance.
function isValidEntry(entry) {
    return entry !== null
        && typeof entry.name === "string"
        && Number.isInteger(entry.score);
}

// On relit le classement enregistré. S'il n'existe pas encore, ou s'il est abîmé,
// on repart d'un classement vide au lieu de faire planter le jeu.
export function loadLeaderboard() {
    try {
        const saved = JSON.parse(localStorage.getItem(LEADERBOARD_STORAGE_KEY));
        if (!Array.isArray(saved)) return [];
        return saved
            .filter(isValidEntry)
            .sort((a, b) => b.score - a.score)
            .slice(0, LEADERBOARD_SIZE);
    } catch {
        // JSON illisible, ou localStorage bloqué (navigation privée, fichier ouvert en local...)
        return [];
    }
}

// On enregistre le classement dans le localStorage (transformé en texte avec JSON).
function saveLeaderboard(leaderboard) {
    try {
        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
    } catch {
        // Si le navigateur refuse, le classement marche quand même jusqu'à la fermeture de la page
    }
}

// On regarde si un score mérite d'entrer dans le top 10 : il faut au moins 1 point,
// et soit il reste de la place, soit on bat le dernier du classement.
export function isHighScore(leaderboard, score) {
    if (score <= 0) return false;
    if (leaderboard.length < LEADERBOARD_SIZE) return true;
    return score > leaderboard[leaderboard.length - 1].score;
}

// On ajoute un score à sa place dans le classement, puis on enregistre.
// Chaque joueur n'a qu'une seule ligne : si son pseudo est déjà dans le classement,
// on garde seulement son meilleur score (l'ancien s'il était plus haut ou égal).
// Renvoie le nouveau classement et la place du joueur (0 = premier), pour la surligner.
export function addScore(leaderboard, name, score) {
    const previousRank = leaderboard.findIndex(entry => entry.name === name);
    if (previousRank !== -1 && leaderboard[previousRank].score >= score) {
        // Il avait déjà fait mieux : rien ne change, on surligne juste son ancienne ligne
        return { leaderboard, rank: previousRank };
    }

    const otherPlayers = leaderboard.filter(entry => entry.name !== name);

    // On se place juste avant le premier score strictement plus petit :
    // à égalité, l'ancien score reste devant (premier arrivé, premier servi)
    let rank = otherPlayers.findIndex(entry => score > entry.score);
    if (rank === -1) {
        rank = otherPlayers.length;
    }

    const newLeaderboard = [...otherPlayers];
    newLeaderboard.splice(rank, 0, { name, score });
    const topScores = newLeaderboard.slice(0, LEADERBOARD_SIZE);

    saveLeaderboard(topScores);
    return { leaderboard: topScores, rank };
}

// On relit le dernier pseudo utilisé, pour pré-remplir la saisie. Chaîne vide s'il n'y en a pas.
export function loadLastPlayerName() {
    try {
        return localStorage.getItem(LAST_PLAYER_NAME_STORAGE_KEY) || "";
    } catch {
        return "";
    }
}

// On retient le pseudo qu'on vient d'utiliser pour le proposer à la prochaine partie.
export function saveLastPlayerName(name) {
    try {
        localStorage.setItem(LAST_PLAYER_NAME_STORAGE_KEY, name);
    } catch {
        // Tant pis : il faudra juste retaper son pseudo la prochaine fois
    }
}

// Le meilleur score de tous les temps : le premier du classement, ou 0 s'il est vide.
export function getBestScore(leaderboard) {
    return leaderboard.length > 0 ? leaderboard[0].score : 0;
}
