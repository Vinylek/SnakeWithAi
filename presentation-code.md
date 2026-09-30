# Présentation (~15 min) : les bouts de code à expliquer en priorité

Fichier de travail temporaire. Les extraits sont copiés tels quels depuis le code actuel ; les liens pointent vers les lignes correspondantes.

## Déroulé conseillé

| Temps | Partie |
|---|---|
| 0:00 – 2:00 | Démo rapide du jeu (menu, partie, pomme dorée, game over, classement) |
| 2:00 – 3:30 | Architecture MVC : les fichiers et leur rôle (schéma du README, partie 6) |
| 3:30 – 13:00 | Les extraits ci-dessous, dans l'ordre (1 à 9) |
| 13:00 – 15:00 | Difficultés, choix, utilisation de l'IA (PROMPTS.md), puis questions |

Fil conducteur à suivre : **état → boucle → règles → affichage**. On part de la mémoire du jeu (`state`), on montre la boucle qui fait tout tourner, puis ce qu'elle appelle.

---

## 1. L'état du jeu : un seul objet `state`

**Fichier :** [`js/config.js:215-235`](/home/etienne/Desktop/EPSI/SnakeWithAi/js/config.js#L215) · **Temps :** 1 min

```js
// Toutes les données qui changent pendant la partie, regroupées dans un seul objet.
// C'est le "Model" du pattern MVC : la vue le lit pour dessiner, le contrôleur le modifie.
export const state = {
    // Le serpent est une liste de cases {x, y}. La case 0 est la tête, la dernière la queue.
    // On copie chaque case pour ne jamais modifier INITIAL_SNAKE en déplaçant le serpent.
    snake: INITIAL_SNAKE.map(part => ({ ...part })),
    direction: INITIAL_DIRECTION,     // direction actuelle du serpent
    nextDirection: INITIAL_DIRECTION, // direction demandée au clavier, appliquée au prochain pas
    food: null,                      // position {x, y} de la pomme, tirée au hasard par placeFood()
    obstacles: [],                   // obstacles {x, y, sprite}, tirés au hasard par createObstacles()
    specialFood: null,               // pomme dorée {x, y, remainingMs} ou null s'il n'y en a pas
    score: 0,                        // points de la partie en cours
    leaderboard: [],                 // top 10 {name, score}, du meilleur au moins bon (localStorage)
    lastRank: -1,                    // place du dernier score enregistré (surlignée), -1 si aucune
    playerName: "",                  // pseudo saisi sur l'écran NAME_ENTRY (pré-rempli avec le dernier utilisé)
    menuIndex: 0,                    // option du menu actuellement sélectionnée
    foodEaten: 0,                    // nombre de pommes mangées (normales + dorées), sert au calcul du niveau
    level: 1,                        // niveau actuel, augmente toutes les FOOD_PER_LEVEL pommes
    speedMs: INITIAL_SPEED_MS,       // intervalle actuel entre deux déplacements
    status: GAME_STATUS.MENU         // écran affiché : menu / en cours / pause / game over
};
```

Tout ce qui change pendant la partie est rangé dans **un seul objet**. C'est la mémoire du jeu, le *Model* du MVC : la View le lit pour dessiner, le Controller et le Model le modifient.

À dire : le serpent est un **tableau de cases `{x, y}`, tête en premier**. `direction` est la direction suivie, `nextDirection` celle demandée au clavier (appliquée au pas suivant). `status` indique l'écran affiché.

---

## 2. La boucle de jeu : `gameTick` + `scheduleNextTick`

**Fichier :** [`js/controller.js:207-231`](/home/etienne/Desktop/EPSI/SnakeWithAi/js/controller.js#L207) · **Temps :** 2 min

```js
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
```

Le **cœur du Controller** : à chaque tour, on demande au Model d'avancer (`updateGame`), puis à la View de redessiner (`render`), et on programme le tour suivant.

À dire :
- on utilise **`setTimeout` reprogrammé à chaque pas** plutôt que `setInterval`, car on relit `state.speedMs` à chaque fois : le jeu **accélère tout seul** quand le niveau monte ;
- la boucle s'arrête d'elle-même dès que le statut n'est plus `PLAYING` (pause, mort) ;
- `clearTimeout` évite d'avoir deux boucles en même temps.

On voit ici le MVC en action : Controller → Model → View.

---

## 3. Un pas du jeu : `updateGame`

**Fichier :** [`js/model.js:261-285`](/home/etienne/Desktop/EPSI/SnakeWithAi/js/model.js#L261) · **Temps :** 2 min

```js
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
```

Le **cœur des règles** (Model). Suivre l'ordre à voix haute :
1. on applique la direction demandée ;
2. on calcule où la tête va arriver ;
3. case mortelle → `GAME_OVER` ;
4. sinon on avance, en mangeant peut-être une pomme ;
5. le temps de la pomme dorée s'écoule.

À dire : la fonction ne dessine rien et ne lit pas le clavier. On peut donc la **tester sans navigateur** (c'est ce qui a été fait dans Node.js). Elle renvoie `true` si le serpent a mangé, pour que le Controller joue le son.

---

## 4. Avancer et grandir : `moveSnake`

**Fichier :** [`js/model.js:236-244`](/home/etienne/Desktop/EPSI/SnakeWithAi/js/model.js#L236) · **Temps :** 1 min

```js
// On fait avancer le serpent d'une case : on ajoute une nouvelle tête devant,
// et on retire le dernier morceau SAUF s'il vient de manger. C'est tout le secret
// de la croissance : en gardant la queue, le serpent gagne une case de longueur.
function moveSnake(state, newHead, hasEaten) {
    state.snake.unshift(newHead);
    if (!hasEaten) {
        state.snake.pop();
    }
}
```

La fonction la plus simple à expliquer, et celle qui marque le plus le jury.

À dire : pour avancer, **on n'a pas besoin de déplacer chaque morceau**. On ajoute une nouvelle tête devant (`unshift`) et on retire la queue (`pop`). Pour **grandir**, il suffit de **ne pas retirer la queue** quand le serpent vient de manger.

---

## 5. Pas de demi-tour : `changeDirection`

**Fichier :** [`js/model.js:173-188`](/home/etienne/Desktop/EPSI/SnakeWithAi/js/model.js#L173) · **Temps :** 1 min 30

```js
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
```

À dire :
- deux directions opposées **s'annulent quand on les additionne** (droite `{1,0}` + gauche `{-1,0}` = `{0,0}`) ;
- **le piège** : on compare avec `state.direction` (la direction *réellement suivie*) et **pas** avec la dernière demandée. Sinon, en allant à droite, appuyer très vite sur haut puis gauche ferait faire demi-tour au serpent dans le même pas.

---

## 6. Les collisions : `isDeadlyCell` et `hitsOwnBody`

**Fichier :** [`js/model.js:213-226`](/home/etienne/Desktop/EPSI/SnakeWithAi/js/model.js#L213) · **Temps :** 1 min 30

```js
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
```

À dire :
- les **trois façons de perdre** sont regroupées en une ligne lisible : mur, obstacle mortel, corps ;
- **subtilité** : `hitsOwnBody` ignore la **queue** (`slice(0, -1)`), car elle avance en même temps que la tête. Sa case sera libre au moment où la tête y arrive ;
- les petits obstacles ne tuent pas : `hitsDeadlyObstacle` ne regarde que les dessins marqués `deadly: true`.

---

## 7. Placer la pomme : `getFreeCells` + `getRandomFreeCell`

**Fichier :** [`js/model.js:82-105`](/home/etienne/Desktop/EPSI/SnakeWithAi/js/model.js#L82) · **Temps :** 1 min

```js
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
```

À dire : au lieu de tirer des cases au hasard **jusqu'à** en trouver une libre (ce qui peut durer longtemps quand le serpent est grand), on **liste toutes les cases libres** puis on en pioche une. On trouve du premier coup, et il n'y a **pas de boucle infinie** même si le plateau est presque plein.

---

## 8. Le pattern State : `KEY_HANDLERS` + `handleKeyDown`

**Fichier :** [`js/controller.js:171-194`](/home/etienne/Desktop/EPSI/SnakeWithAi/js/controller.js#L171) · **Temps :** 2 min

```js
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
```

Le bon moment pour **parler du design pattern**.

À dire : une même touche ne fait pas la même chose selon l'écran (Entrée = jouer dans le menu, valider sur la saisie du pseudo). Au lieu d'une cascade de `if`, **une fonction par écran** et **une table** qui associe l'écran à sa fonction. `handleKeyDown` fait juste : touche → action → `KEY_HANDLERS[state.status](action)` → `render`.

La View a la même table pour les écrans : `SCREEN_DRAWERS` (`view.js:205`). Pour ajouter un écran, on ajoute une ligne dans chaque table, sans toucher au reste.

---

## 9. Afficher un sprite : `drawSprite`

**Fichier :** [`js/view.js:33-45`](/home/etienne/Desktop/EPSI/SnakeWithAi/js/view.js#L33) · **Temps :** 1 min 30

```js
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
```

À dire :
- **toute l'image du jeu** passe par cette fonction ;
- `drawImage` avec 9 paramètres : on **découpe** une tuile de 16 × 16 px dans la spritesheet (source) et on la **colle agrandie** en 32 × 32 sur la case (destination) ;
- les obstacles font 2 tuiles de haut : on aligne leur bas sur la case et on laisse leur haut dépasser ;
- `imageSmoothingEnabled = false` (dans `initView`) garde les pixels nets.

---

## 10. (Bonus) Le classement : `addScore`

**Fichier :** [`js/leaderboard.js:50-76`](/home/etienne/Desktop/EPSI/SnakeWithAi/js/leaderboard.js#L50) · **Temps :** 1 min, si le temps le permet

```js
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
```

À dire : **une ligne par pseudo**, et on ne garde que son **meilleur** score. Si le joueur a déjà fait mieux, rien ne change. Sinon on retire son ancienne ligne (`filter`), on cherche sa place (`findIndex`), on l'insère (`splice`), on coupe à 10 (`slice`) et on sauvegarde dans le `localStorage` (texte, d'où `JSON.stringify`).

---

## Ce qu'on peut laisser de côté (sauf question)

- Le détail des écrans (`drawMenuScreen`, `drawLeaderboardScreen`…) : c'est seulement du texte centré.
- `assets.js` : le chargement de l'image avec une Promise. À connaître si on vous demande pourquoi `startApp` est `async`.
- `getSnakePartSprite` (`view.js:93`) : le choix du virage du serpent. Joli mais long à expliquer ; à garder pour une question « comment sont dessinés les virages ? ».
- La pomme dorée : il suffit de dire qu'elle est comptée en **pas de jeu** et pas avec l'horloge, donc elle se fige pendant la pause (`updateSpecialFoodTimer`, `model.js:127`).
