"use strict";

/************************************************************/
/* Constantes */
/************************************************************/

const LARGEUR_CASE = 35;
const HAUTEUR_CASE = 40;

const { LARGEUR_PLATEAU, HAUTEUR_PLATEAU } = ajusterDimensionsPlateau();

function ajusterDimensionsPlateau() {
    const canvas = document.getElementById("simulateur");
    canvas.width = Math.min(window.innerWidth, 1600);
    canvas.height = Math.min(window.innerHeight, 900);
    const LARGEUR_PLATEAU = Math.floor(canvas.width / LARGEUR_CASE);
    const HAUTEUR_PLATEAU = Math.floor(canvas.height / HAUTEUR_CASE);
    return { LARGEUR_PLATEAU, HAUTEUR_PLATEAU };
}

/*------------------------------------------------------------*/
// Types des cases
/*------------------------------------------------------------*/
class Type_de_case {
  static Foret = new Type_de_case("foret");
  static Eau = new Type_de_case("eau");
  static Rail_horizontal = new Type_de_case("rail horizontal");
  static Rail_vertical = new Type_de_case("rail vertical");
  static Rail_droite_vers_haut = new Type_de_case("rail droite vers haut");
  static Rail_haut_vers_droite = new Type_de_case("rail haut vers droite");
  static Rail_droite_vers_bas = new Type_de_case("rail droite vers bas");
  static Rail_bas_vers_droite = new Type_de_case("rail bas vers droite");

  constructor(nom) {
    this.nom = nom;
  }
}

/*------------------------------------------------------------*/
// Images
/*------------------------------------------------------------*/
const IMAGE_EAU = new Image();
IMAGE_EAU.src = "images/eau.png";

const IMAGE_FORET = new Image();
IMAGE_FORET.src = "images/foret.png";

const IMAGE_LOCO = new Image();
IMAGE_LOCO.src = "images/locomotive.png";

const IMAGE_RAIL_HORIZONTAL = new Image();
IMAGE_RAIL_HORIZONTAL.src = "images/rail-horizontal.png";

const IMAGE_RAIL_VERTICAL = new Image();
IMAGE_RAIL_VERTICAL.src = "images/rail-vertical.png";

const IMAGE_RAIL_BAS_VERS_DROITE = new Image();
IMAGE_RAIL_BAS_VERS_DROITE.src = "images/rail-bas-vers-droite.png";

const IMAGE_RAIL_DROITE_VERS_BAS = new Image();
IMAGE_RAIL_DROITE_VERS_BAS.src = "images/rail-droite-vers-bas.png";

const IMAGE_RAIL_DROITE_VERS_HAUT = new Image();
IMAGE_RAIL_DROITE_VERS_HAUT.src = "images/rail-droite-vers-haut.png";

const IMAGE_RAIL_HAUT_VERS_DROITE = new Image();
IMAGE_RAIL_HAUT_VERS_DROITE.src = "images/rail-haut-vers-droite.png";

const IMAGE_WAGON = new Image();
IMAGE_WAGON.src = "images/wagon.png";

/************************************************************/
// Variables globales
/************************************************************/
let plateau;
let selectedType = null;
let trains = [];
let isPaused = false;
let context;

/************************************************************/
/* Classes */
/************************************************************/
class Plateau {
  constructor() {
    this.largeur = LARGEUR_PLATEAU;
    this.hauteur = HAUTEUR_PLATEAU;
    this.cases = [];
    for (let x = 0; x < this.largeur; x++) {
      this.cases[x] = [];
      for (let y = 0; y < this.hauteur; y++) {
        this.cases[x][y] = Type_de_case.Foret;
      }
    }
  }
}

/************************************************************/
// Méthodes
/************************************************************/
function image_of_case(type_de_case) {
  switch (type_de_case) {
    case Type_de_case.Foret:
      return IMAGE_FORET;
    case Type_de_case.Eau:
      return IMAGE_EAU;
    case Type_de_case.Rail_horizontal:
      return IMAGE_RAIL_HORIZONTAL;
    case Type_de_case.Rail_vertical:
      return IMAGE_RAIL_VERTICAL;
    case Type_de_case.Rail_droite_vers_haut:
      return IMAGE_RAIL_DROITE_VERS_HAUT;
    case Type_de_case.Rail_haut_vers_droite:
      return IMAGE_RAIL_HAUT_VERS_DROITE;
    case Type_de_case.Rail_droite_vers_bas:
      return IMAGE_RAIL_DROITE_VERS_BAS;
    case Type_de_case.Rail_bas_vers_droite:
      return IMAGE_RAIL_BAS_VERS_DROITE;
    default:
      return null;
  }
}

function dessine_case(contexte, plateau, x, y) {
  const la_case = plateau.cases[x][y];
  let image_a_afficher = image_of_case(la_case);
  contexte.drawImage(
    image_a_afficher,
    x * LARGEUR_CASE,
    y * HAUTEUR_CASE,
    LARGEUR_CASE,
    HAUTEUR_CASE,
  );
}

function dessine_plateau(page, plateau) {
  for (let x = 0; x < plateau.largeur; x++) {
    for (let y = 0; y < plateau.hauteur; y++) {
      dessine_case(page, plateau, x, y);
    }
  }
}

function ajouterTrain(x, y, longueur) {
  if (x + longueur <= plateau.largeur && y < plateau.hauteur) {
    let train = [];
    for (let i = 0; i < longueur; i++) {
      if (plateau.cases[x + i][y] !== Type_de_case.Rail_horizontal) {
        return;
      }
      train.push({ x: x + i, y: y, type: 'wagon' });
    }
    train[0].type = 'locomotive';
    trains.push(train);
    train.forEach(wagon => dessine_case(context, plateau, wagon.x, wagon.y));
  }
}

function avancerTrains() {
  trains.forEach(train => {
    let direction = { x: 1, y: 0 };
    for (let i = train.length - 1; i >= 0; i--) {
      let wagon = train[i];
      if (i === 0) {
        // Dirige la locomotive selon les rails
        let prochaine_case = plateau.cases[wagon.x + direction.x][wagon.y + direction.y];
        switch (prochaine_case) {
          case Type_de_case.Rail_droite_vers_haut:
            direction = { x: 0, y: -1 };
            break;
          case Type_de_case.Rail_haut_vers_droite:
            direction = { x: 1, y: 0 };
            break;
          case Type_de_case.Rail_droite_vers_bas:
            direction = { x: 0, y: 1 };
            break;
          case Type_de_case.Rail_bas_vers_droite:
            direction = { x: 1, y: 0 };
            break;
          case Type_de_case.Rail_horizontal:
            direction = { x: 1, y: 0 };
            break;
          case Type_de_case.Rail_vertical:
            direction = { x: 0, y: 1 };
            break;
          default:
            // Collision
            trains.splice(trains.indexOf(train), 1);
            return;
        }
      }
      // Déplace les wagons
      if (i === train.length - 1) {
        dessine_case(context, plateau, wagon.x, wagon.y);
      }
      if (i === 0) {
        dessine_case(context, plateau, wagon.x, wagon.y);
      } else {
        train[i].x = train[i - 1].x;
        train[i].y = train[i - 1].y;
      }
      train[0].x += direction.x;
      train[0].y += direction.y;
      dessine_case(context, plateau, wagon.x, wagon.y);
    }
  });
}

/************************************************************/
// Auditeurs
/************************************************************/
function setupListeners() {
  document.querySelectorAll('#boutons input[type=image]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('#boutons input[type=image]').forEach(btn => btn.disabled = false);
      button.disabled = true;
      selectedType = button.alt;
    });
  });

  document.getElementById('simulateur').addEventListener('click', (event) => {
    let rect = event.target.getBoundingClientRect();
    let x = Math.floor((event.clientX - rect.left) / LARGEUR_CASE);
    let y = Math.floor((event.clientY - rect.top) / HAUTEUR_CASE);
    if (selectedType && x < plateau.largeur && y < plateau.hauteur) {
      plateau.cases[x][y] = Type_de_case[selectedType.replace(/ /g, '_')];
      dessine_case(context, plateau, x, y);
    }
  });

  document.getElementById('bouton_pause').addEventListener('click', () => {
    isPaused = !isPaused;
    document.getElementById('bouton_pause').textContent = isPaused ? 'Redémarrer' : 'Pause';
  });

  document.getElementById('bouton_recommencer').addEventListener('click', () => {
    plateau = new Plateau();
    cree_plateau_initial(plateau);
    dessine_plateau(context, plateau);
    trains = [];
  });

  document.querySelectorAll('#boutons input[id^=bouton_train]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('#boutons input[id^=bouton_train]').forEach(btn => btn.disabled = false);
      button.disabled = true;
      let trainLength = parseInt(button.alt.match(/\d+/));
      document.getElementById('simulateur').addEventListener('click', (event) => {
        let rect = event.target.getBoundingClientRect();
        let x = Math.floor((event.clientX - rect.left) / LARGEUR_CASE);
        let y = Math.floor((event.clientY - rect.top) / HAUTEUR_CASE);
        ajouterTrain(x, y, trainLength);
      }, { once: true });
    });
  });
}

/************************************************************/
// Plateau de jeu initial
/************************************************************/
function cree_plateau_initial(plateau) {
  plateau.cases[12][7] = Type_de_case.Rail_horizontal;
  plateau.cases[13][7] = Type_de_case.Rail_horizontal;
  plateau.cases[14][7] = Type_de_case.Rail_horizontal;
  plateau.cases[15][7] = Type_de_case.Rail_horizontal;
  plateau.cases[16][7] = Type_de_case.Rail_horizontal;
  plateau.cases[17][7] = Type_de_case.Rail_horizontal;
  plateau.cases[18][7] = Type_de_case.Rail_horizontal;
  plateau.cases[19][7] = Type_de_case.Rail_droite_vers_haut;
  plateau.cases[19][6] = Type_de_case.Rail_vertical;
  plateau.cases[19][5] = Type_de_case.Rail_droite_vers_bas;
  plateau.cases[12][5] = Type_de_case.Rail_horizontal;
  plateau.cases[13][5] = Type_de_case.Rail_horizontal;
  plateau.cases[14][5] = Type_de_case.Rail_horizontal;
  plateau.cases[15][5] = Type_de_case.Rail_horizontal;
  plateau.cases[16][5] = Type_de_case.Rail_horizontal;
  plateau.cases[17][5] = Type_de_case.Rail_horizontal;
  plateau.cases[18][5] = Type_de_case.Rail_horizontal;
  plateau.cases[11][5] = Type_de_case.Rail_haut_vers_droite;
  plateau.cases[11][6] = Type_de_case.Rail_vertical;
  plateau.cases[11][7] = Type_de_case.Rail_bas_vers_droite;

  plateau.cases[0][7] = Type_de_case.Rail_horizontal;
  plateau.cases[1][7] = Type_de_case.Rail_horizontal;
  plateau.cases[2][7] = Type_de_case.Rail_horizontal;
  plateau.cases[3][7] = Type_de_case.Rail_horizontal;
  plateau.cases[4][7] = Type_de_case.Rail_horizontal;
  plateau.cases[5][7] = Type_de_case.Eau;
  plateau.cases[6][7] = Type_de_case.Rail_horizontal;
  plateau.cases[7][7] = Type_de_case.Rail_horizontal;

  for (let x = 22; x <= 27; x++) {
    for (let y = 2; y <= 5; y++) {
      plateau.cases[x][y] = Type_de_case.Eau;
    }
  }

  plateau.cases[22][8] = Type_de_case.Rail_horizontal;
  plateau.cases[23][8] = Type_de_case.Rail_horizontal;
  plateau.cases[24][8] = Type_de_case.Rail_horizontal;
  plateau.cases[25][8] = Type_de_case.Rail_horizontal;
  plateau.cases[26][8] = Type_de_case.Rail_bas_vers_droite;
  plateau.cases[27][8] = Type_de_case.Rail_horizontal;
  plateau.cases[28][8] = Type_de_case.Rail_horizontal;
  plateau.cases[29][8] = Type_de_case.Rail_horizontal;

  plateau.cases[3][10] = Type_de_case.Eau;
  plateau.cases[4][10] = Type_de_case.Eau;
  plateau.cases[4][11] = Type_de_case.Eau;
  plateau.cases[4][12] = Type_de_case.Eau;
  plateau.cases[4][13] = Type_de_case.Eau;
  plateau.cases[4][13] = Type_de_case.Eau;
  plateau.cases[5][10] = Type_de_case.Eau;

  plateau.cases[7][10] = Type_de_case.Eau;
  plateau.cases[7][11] = Type_de_case.Eau;
  plateau.cases[7][12] = Type_de_case.Eau;
  plateau.cases[7][13] = Type_de_case.Eau;
  plateau.cases[8][10] = Type_de_case.Eau;
  plateau.cases[9][10] = Type_de_case.Eau;
  plateau.cases[8][13] = Type_de_case.Eau;
  plateau.cases[9][13] = Type_de_case.Eau;

  plateau.cases[11][10] = Type_de_case.Eau;
  plateau.cases[11][11] = Type_de_case.Eau;
  plateau.cases[11][12] = Type_de_case.Eau;
  plateau.cases[11][13] = Type_de_case.Eau;
  plateau.cases[12][11] = Type_de_case.Eau;
  plateau.cases[13][10] = Type_de_case.Eau;
  plateau.cases[13][11] = Type_de_case.Eau;
  plateau.cases[13][12] = Type_de_case.Eau;
  plateau.cases[13][13] = Type_de_case.Eau;

  plateau.cases[15][10] = Type_de_case.Eau;
  plateau.cases[15][11] = Type_de_case.Eau;
  plateau.cases[15][12] = Type_de_case.Eau;
  plateau.cases[15][13] = Type_de_case.Eau;
  plateau.cases[16][10] = Type_de_case.Eau;
  plateau.cases[16][13] = Type_de_case.Eau;
  plateau.cases[17][10] = Type_de_case.Eau;
  plateau.cases[17][11] = Type_de_case.Eau;
  plateau.cases[17][12] = Type_de_case.Eau;
  plateau.cases[17][13] = Type_de_case.Eau;

  plateau.cases[19][10] = Type_de_case.Eau;
  plateau.cases[19][11] = Type_de_case.Eau;
  plateau.cases[19][12] = Type_de_case.Eau;
  plateau.cases[19][13] = Type_de_case.Eau;
  plateau.cases[20][13] = Type_de_case.Eau;
  plateau.cases[21][10] = Type_de_case.Eau;
  plateau.cases[21][11] = Type_de_case.Eau;
  plateau.cases[21][12] = Type_de_case.Eau;
  plateau.cases[21][13] = Type_de_case.Eau;
}

/************************************************************/
// Fonction principale
/************************************************************/
function tchou() {
  context = document.getElementById("simulateur").getContext("2d");
  plateau = new Plateau();
  cree_plateau_initial(plateau);
  dessine_plateau(context, plateau);
  setupListeners();

  function gameLoop() {
    if (!isPaused) {
      avancerTrains();
    }
    requestAnimationFrame(gameLoop);
  }
  gameLoop();
}

/************************************************************/
// Programme principal
/************************************************************/
window.addEventListener("load", () => {
  tchou();
});
