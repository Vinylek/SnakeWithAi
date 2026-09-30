# Fonctions natives JavaScript utilisées

Ce document liste tout ce que le jeu utilise **sans l'avoir écrit lui-même** : les fonctions et objets fournis par le langage JavaScript et par le navigateur. Les fonctions écrites pour le jeu sont documentées dans le [README](README.md#7-documentation-de-chaque-fonction).

Pour chaque élément, on trouve ce qu'il fait, où il est utilisé (`fichier:ligne`, dans le dossier `js/`) et un lien vers sa documentation sur **MDN** (Mozilla Developer Network), la référence du JavaScript. Quelques pages MDN n'existent qu'en anglais : le site affiche alors la version anglaise.

On distingue deux familles :
- **JavaScript** : fourni par le langage lui-même. Ces fonctions marchent partout, même dans Node.js.
- **Navigateur (API Web)** : fourni par le navigateur (le DOM, le canvas, le son, le stockage…). Ces fonctions n'existent pas en dehors d'une page web.

---

## 1. JavaScript (le langage)

### 1.1 Tableaux (`Array`)

| Fonction | Ce qu'elle fait | Utilisée dans | Documentation |
|---|---|---|---|
| `Array.isArray(valeur)` | Vérifie si une valeur est un tableau | `leaderboard.js:22` (le classement relu est-il bien un tableau ?) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) |
| `tableau.filter(test)` | Crée un nouveau tableau avec seulement les éléments qui passent le test | `leaderboard.js:24` (lignes valides), `leaderboard.js:61` (retirer l'ancienne ligne d'un pseudo) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) |
| `tableau.find(test)` | Renvoie le premier élément qui passe le test (ou `undefined`) | `controller.js:30` (quelle action contient cette touche ?) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/find) |
| `tableau.findIndex(test)` | Renvoie la position du premier élément qui passe le test (ou `-1`) | `leaderboard.js:55` (pseudo déjà classé ?), `leaderboard.js:65` (place du nouveau score) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex) |
| `tableau.forEach(action)` | Exécute une action pour chaque élément | `view.js:61` (obstacles), `view.js:144` (options du menu), `view.js:196` (lignes du classement) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) |
| `tableau.includes(valeur)` | Vérifie si le tableau contient une valeur | `controller.js:30` (la touche est-elle dans la liste de cette action ?) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/includes) |
| `tableau.indexOf(valeur)` | Renvoie la position d'une valeur (ou `-1`) | `view.js:112` (ordre des côtés d'un morceau de corps) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf) |
| `tableau.join(séparateur)` | Colle tous les éléments en un seul texte | `view.js:113` (`["up", "left"]` → `"up-left"`) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/join) |
| `tableau.map(transformation)` | Crée un nouveau tableau en transformant chaque élément | `config.js:220`, `model.js:160` (copier chaque case de `INITIAL_SNAKE`) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/map) |
| `tableau.pop()` | Retire le **dernier** élément | `model.js:242` (retirer la queue quand le serpent avance) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/pop) |
| `tableau.push(élément)` | Ajoute un élément **à la fin** | `model.js:65` (nouvel obstacle), `model.js:90` (case libre) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/push) |
| `tableau.slice(début, fin)` | Copie une partie du tableau (sans modifier l'original) | `model.js:219` (serpent sans sa queue), `leaderboard.js:26` et `leaderboard.js:72` (garder les 10 premiers) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) |
| `tableau.some(test)` | Vérifie si **au moins un** élément passe le test | `model.js:33` (zone protégée), `model.js:72` (case sur le serpent), `model.js:204` et `model.js:210` (case sur un obstacle) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/some) |
| `tableau.sort(comparaison)` | Trie le tableau (en le modifiant) | `leaderboard.js:25` (scores du meilleur au moins bon), `view.js:60` (obstacles de haut en bas), `view.js:112` (côtés d'un morceau de corps) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) |
| `tableau.splice(position, 0, élément)` | Insère (ou retire) des éléments à une position | `leaderboard.js:71` (insérer un score à sa place) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) |
| `tableau.unshift(élément)` | Ajoute un élément **au début** | `model.js:240` (nouvelle tête du serpent) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift) |
| `tableau.length` *(propriété)* | Nombre d'éléments | `model.js:50`, `model.js:61`, `model.js:103`, `model.js:104`, `leaderboard.js:46`, `leaderboard.js:47`, `leaderboard.js:67`, `leaderboard.js:98`, `view.js:103`, `view.js:193`, `controller.js:110` | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/length) |

> **À retenir pour l'oral :** `unshift` + `pop` suffisent à faire avancer le serpent (une tête ajoutée devant, la queue retirée derrière). Pour le faire grandir, il suffit de ne pas appeler `pop`.

### 1.2 Chaînes de caractères (`String`)

| Fonction | Ce qu'elle fait | Utilisée dans | Documentation |
|---|---|---|---|
| `String(valeur)` | Transforme une valeur en texte | `view.js:182`, `view.js:184` (rang et score → texte, pour les aligner) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/String) |
| `texte.padEnd(longueur, " ")` | Complète le texte avec des espaces **à droite** jusqu'à la longueur voulue | `view.js:183` (pseudo aligné dans le classement) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd) |
| `texte.padStart(longueur, " ")` | Complète le texte avec des espaces **à gauche** | `view.js:182` (rang), `view.js:184` (score) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/padStart) |
| `texte.slice(début, fin)` | Copie une partie du texte | `controller.js:156` (`slice(0, -1)` : effacer la dernière lettre du pseudo) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/slice) |
| `texte.toLowerCase()` | Met le texte en minuscules | `controller.js:28` (`"Z"` en majuscules verrouillées → `"z"`) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase) |
| `texte.toUpperCase()` | Met le texte en majuscules | `controller.js:160` (lettres du pseudo) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase) |
| `texte.length` *(propriété)* | Nombre de caractères | `controller.js:28` (est-ce une seule lettre ?), `controller.js:159`, `view.js:174` (pseudo trop long ?) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/length) |

> `slice` existe à la fois pour les tableaux et pour les textes, avec le même fonctionnement : une valeur négative compte depuis la fin.

### 1.3 Mathématiques (`Math`)

| Fonction | Ce qu'elle fait | Utilisée dans | Documentation |
|---|---|---|---|
| `Math.random()` | Nombre au hasard entre 0 (inclus) et 1 (exclu) | `model.js:17` (tirages au hasard), `model.js:116` (chance d'avoir une pomme dorée) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Math/random) |
| `Math.floor(x)` | Arrondit vers le bas | `model.js:17` (entier au hasard), `model.js:146` (calcul du niveau), `view.js:69` (clignotement) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Math/floor) |
| `Math.max(a, b)` | Renvoie le plus grand des nombres | `model.js:139` (vitesse jamais sous 60 ms), `view.js:233` (record affiché) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Math/max) |
| `Math.hypot(dx, dy)` | Distance « à vol d'oiseau » : √(dx² + dy²), le théorème de Pythagore | `model.js:35` (zone protégée autour du serpent) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot) |

> `Math.floor(Math.random() * max)` est la recette classique pour tirer un entier entre 0 et `max - 1` (fonction `getRandomInt`).

### 1.4 Autres objets du langage

| Fonction | Ce qu'elle fait | Utilisée dans | Documentation |
|---|---|---|---|
| `Number.isInteger(valeur)` | Vérifie si une valeur est un nombre entier | `leaderboard.js:14` (le score relu est-il valide ?) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger) |
| `Object.keys(objet)` | Donne la liste des noms de propriétés d'un objet | `controller.js:29` (liste des actions de `KEYS` : `"up"`, `"pause"`…) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object/keys) |
| `JSON.stringify(valeur)` | Transforme un objet ou un tableau en texte | `leaderboard.js:36` (le `localStorage` ne stocke que du texte) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) |
| `JSON.parse(texte)` | Fait l'inverse : texte → objet ou tableau | `leaderboard.js:21` (relire le classement) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) |
| `regex.test(texte)` | Vérifie si un texte correspond à une expression régulière | `controller.js:35` (`/^[a-z0-9]$/i` : une seule lettre ou un seul chiffre) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test) |
| `new Promise((resolve, reject) => …)` | Crée une « promesse » : une valeur qui arrivera plus tard. On appelle `resolve` en cas de succès, `reject` en cas d'échec | `assets.js:12` (attendre la fin du chargement de l'image) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise) |
| `promesse.catch(action)` | Exécute une action si la promesse échoue | `controller.js:204` (ignorer un son refusé par le navigateur) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) |
| `new Error(message)` | Crée une erreur avec un message | `assets.js:15` (« Impossible de charger l'image… ») | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Error/Error) |

---

## 2. Navigateur (API Web)

### 2.1 La page (DOM) et le clavier

| Fonction | Ce qu'elle fait | Utilisée dans | Documentation |
|---|---|---|---|
| `document.getElementById(id)` | Récupère l'élément HTML qui a cet `id` | `main.js:19` (le canvas), `view.js:234` à `view.js:236` (score, niveau, record) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/Document/getElementById) |
| `élément.textContent` *(propriété)* | Le texte contenu dans un élément | `view.js:234` à `view.js:236` (afficher les chiffres du HUD) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/Node/textContent) |
| `document.addEventListener("keydown", fonction)` | Demande au navigateur d'appeler une fonction à chaque touche enfoncée | `controller.js:236` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/EventTarget/addEventListener) |
| `event.key` *(propriété)* | La touche appuyée : `"ArrowUp"`, `"z"`, `" "`, `"Enter"`… | `controller.js:184`, `controller.js:185`, `controller.js:192` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/KeyboardEvent/key) |
| `event.preventDefault()` | Annule l'effet normal de la touche dans le navigateur | `controller.js:190` (les flèches et Espace ne font plus défiler la page) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/Event/preventDefault) |

### 2.2 Le temps

| Fonction | Ce qu'elle fait | Utilisée dans | Documentation |
|---|---|---|---|
| `setTimeout(fonction, ms)` | Appelle une fonction **une fois**, après un délai. Renvoie un identifiant | `controller.js:212` (programmer le prochain pas de la boucle) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/Window/setTimeout) |
| `clearTimeout(identifiant)` | Annule un `setTimeout` pas encore déclenché | `controller.js:52` (pause), `controller.js:63` (retour au menu), `controller.js:211` (éviter deux boucles) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/Window/clearTimeout) |

> **Pourquoi pas `setInterval` ?** `setInterval` répète à intervalle fixe. Avec `setTimeout` reprogrammé à chaque pas, on relit `state.speedMs` à chaque fois : le jeu peut accélérer d'un niveau à l'autre.

### 2.3 Le dessin (Canvas 2D)

| Fonction | Ce qu'elle fait | Utilisée dans | Documentation |
|---|---|---|---|
| `canvas.getContext("2d")` | Récupère « l'outil de dessin » 2D du canvas | `view.js:27`, `view.js:244` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/HTMLCanvasElement/getContext) |
| `canvas.width` / `canvas.height` *(propriétés)* | Taille du canvas en pixels | `view.js:25`, `view.js:26`, `view.js:242`, `view.js:243` | [MDN (width)](https://developer.mozilla.org/fr/docs/Web/API/HTMLCanvasElement/width) · [MDN (height)](https://developer.mozilla.org/fr/docs/Web/API/HTMLCanvasElement/height) |
| `context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)` | Découpe une zone d'une image (source `s…`) et la colle, éventuellement agrandie, dans le canvas (destination `d…`) | `view.js:38` (**tous** les sprites : sol, serpent, pommes, obstacles) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/drawImage) |
| `context.fillRect(x, y, largeur, hauteur)` | Dessine un rectangle plein | `view.js:129` (voile sombre des écrans), `view.js:246` (fond noir de l'erreur) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/fillRect) |
| `context.fillText(texte, x, y)` | Écrit du texte | `view.js:137` (tous les textes des écrans), `view.js:250` (message d'erreur) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/fillText) |
| `context.fillStyle` *(propriété)* | Couleur de remplissage des prochains dessins | `view.js:128`, `view.js:134`, `view.js:245`, `view.js:247` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/fillStyle) |
| `context.font` *(propriété)* | Police du texte (ex. `"bold 28px monospace"`) | `view.js:136`, `view.js:248` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/font) |
| `context.textAlign` *(propriété)* | Alignement du texte (`"center"` : `x` désigne le milieu du texte) | `view.js:135`, `view.js:249` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/textAlign) |
| `context.imageSmoothingEnabled` *(propriété)* | Active ou désactive le lissage quand on agrandit une image | `view.js:29` (`false` : les pixels restent carrés et nets) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled) |

### 2.4 Images et son

| Fonction | Ce qu'elle fait | Utilisée dans | Documentation |
|---|---|---|---|
| `new Image()` | Crée une image en mémoire (comme une balise `<img>` invisible) | `assets.js:13` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/HTMLImageElement/Image) |
| `image.src` *(propriété)* | Chemin du fichier. Le donner lance le téléchargement | `assets.js:17` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/HTMLImageElement/src) |
| `image.onload` / `image.onerror` *(propriétés)* | Fonctions appelées quand l'image est prête, ou quand le chargement échoue | `assets.js:14`, `assets.js:15` | [MDN (load)](https://developer.mozilla.org/fr/docs/Web/API/HTMLElement/load_event) · [MDN (error)](https://developer.mozilla.org/fr/docs/Web/API/HTMLElement/error_event) |
| `new Audio(chemin)` | Crée un lecteur de son | `assets.js:24` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/HTMLAudioElement/Audio) |
| `son.volume` *(propriété)* | Volume, de 0 à 1 | `assets.js:25` (0,5 = moitié) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement/volume) |
| `son.currentTime` *(propriété)* | Position de lecture, en secondes | `controller.js:202` (remettre à 0 = rembobiner) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement/currentTime) |
| `son.play()` | Lance la lecture. Renvoie une promesse, qui échoue si le navigateur refuse | `controller.js:204` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement/play) |

### 2.5 Stockage et console

| Fonction | Ce qu'elle fait | Utilisée dans | Documentation |
|---|---|---|---|
| `localStorage` | Petit espace de stockage du navigateur, propre au site, qui survit à la fermeture de la page. Ne stocke que du texte | `leaderboard.js` | [MDN](https://developer.mozilla.org/fr/docs/Web/API/Window/localStorage) |
| `localStorage.getItem(clé)` | Lit la valeur rangée sous une clé (`null` si elle n'existe pas) | `leaderboard.js:21` (classement), `leaderboard.js:81` (dernier pseudo) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/Storage/getItem) |
| `localStorage.setItem(clé, valeur)` | Range une valeur sous une clé | `leaderboard.js:36` (classement), `leaderboard.js:90` (dernier pseudo) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/Storage/setItem) |
| `console.error(message)` | Affiche une erreur dans la console du navigateur (F12) | `main.js:32` (détail d'une erreur de chargement) | [MDN](https://developer.mozilla.org/fr/docs/Web/API/console/error_static) |

---

## 3. Syntaxe JavaScript moderne utilisée

Ce ne sont pas des fonctions, mais des éléments du langage qui reviennent souvent dans le code et qu'on peut vous demander d'expliquer.

| Syntaxe | Exemple dans le code | Documentation |
|---|---|---|
| **Modules** `import` / `export` | `import { state } from "./config.js";` (tous les fichiers) | [import](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/import) · [export](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/export) |
| **`const` / `let`** | `const CELL_SIZE = 32;` / `let loopTimer = null;` | [const](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/const) · [let](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/let) |
| **Fonctions fléchées** `=>` | `snake.some(part => isSameCell(cell, part))` | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Functions/Arrow_functions) |
| **`async` / `await`** | `async function startApp()` … `await loadAssets()` | [async](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/async_function) · [await](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/await) |
| **`try` / `catch`** | Lecture du `localStorage` dans `leaderboard.js`, démarrage dans `main.js` | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/try...catch) |
| **Gabarits de texte** `` `…${…}…` `` | `` `Score : ${state.score}` `` | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Template_literals) |
| **Syntaxe de décomposition** `...` | `{ ...part }` (copie d'une case), `[...state.obstacles]` (copie d'un tableau) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Spread_syntax) |
| **Paramètre par défaut** | `drawCenteredText(text, y, size, color = COLORS.text)` | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Functions/Default_parameters) |
| **Noms de propriétés calculés** `[…]:` | `[GAME_STATUS.MENU]: handleMenuKey` (tables `KEY_HANDLERS`, `SCREEN_DRAWERS`) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Object_initializer) |
| **Opérateur `in`** | `action in DIRECTIONS` (est-ce une direction ?) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/in) |
| **Opérateur ternaire** `? :` | `isSelected ? COLORS.highlight : COLORS.text` | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Conditional_operator) |
| **Reste de division** `%` | `(x + y) % 2` (damier), `(menuIndex + 1) % optionCount` (menu en boucle) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Remainder) |
| **Égalité stricte** `===` | `a.x === b.x` (compare la valeur **et** le type) | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Strict_equality) |
| **Expressions régulières** `/…/` | `/^[a-z0-9]$/i` | [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Regular_expressions) |

---

## Récapitulatif

- **JavaScript** : 16 méthodes de tableaux, 6 fonctions de texte, 4 fonctions `Math`, 8 autres (`Number`, `Object`, `JSON`, `RegExp`, `Promise`, `Error`), plus 2 propriétés `length`.
- **Navigateur** : 5 pour la page et le clavier, 2 pour le temps, 9 pour le canvas, 7 pour les images et le son, 4 pour le stockage et la console.
- Aucune bibliothèque externe : tout vient du langage ou du navigateur, comme le demande le cahier des charges.
