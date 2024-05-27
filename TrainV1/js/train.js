/************************************************************/
/**
 * Université Sorbonne Paris Nord, Programmation Web
 * Auteurs                       : Ethan Nicolas && 
 * Création                      : 2023/12/11
 * Dernière modification         : 2024/04/27
 */
/************************************************************/

'use strict'

/************************************************************/
/* Constantes */
/************************************************************/

/*------------------------------------------------------------*/
// Dimensions du plateau
/*------------------------------------------------------------*/

// Nombre de cases par défaut du simulateur
const LARGEUR_PLATEAU = 30;
const HAUTEUR_PLATEAU = 15;

// Dimensions des cases par défaut en pixels
const LARGEUR_CASE = 35;
const HAUTEUR_CASE = 40;


/*------------------------------------------------------------*/
// Types des cases
/*------------------------------------------------------------*/
class Type_de_case {
	static Foret = new Type_de_case('foret');

	static Eau = new Type_de_case('eau');

	static Rail_horizontal = new Type_de_case('rail horizontal');

	static Rail_vertical = new Type_de_case('rail vertical');

	// NOTE: faisant la jonction de horizontal à vertical en allant vers la droite puis vers le haut (ou de vertical vers horizontal en allant de bas vers gauche)
	static Rail_droite_vers_haut = new Type_de_case('rail droite vers haut');

	// NOTE: faisant la jonction de vertical à horizontal en allant vers le haut puis vers la droite (ou de horizontal à vertical en allant de gauche vers le bas)
	static Rail_haut_vers_droite = new Type_de_case('rail haut vers droite');

	// NOTE: faisant la jonction de horizontal à vertical en allant vers la droite puis vers le bas (ou de vertical vers horizontal en allant de haut vers gauche)
	static Rail_droite_vers_bas = new Type_de_case('rail droite vers bas');

	// NOTE: faisant la jonction de vertical à horizontal en allant vers le bas puis vers la droite (ou de horizontal à vertical en allant de gauche vers le haut)
	static Rail_bas_vers_droite = new Type_de_case('rail bas vers droite');

	static Wagon = new Type_de_case('wagon');

	static Loco = new Type_de_case('locomotive');

	constructor(nom) {
		this.nom = nom;
	}
}



/*------------------------------------------------------------*/
// Images
/*------------------------------------------------------------*/
const IMAGE_EAU = new Image();
IMAGE_EAU.src = 'images/eau.png';

const IMAGE_FORET = new Image();
IMAGE_FORET.src = 'images/foret.png';

const IMAGE_LOCO = new Image();
IMAGE_LOCO.src = 'images/locomotive.png';

const IMAGE_WAGON = new Image();
IMAGE_WAGON.src = 'images/wagon.png';

const IMAGE_RAIL_HORIZONTAL = new Image();
IMAGE_RAIL_HORIZONTAL.src = 'images/rail-horizontal.png';

const IMAGE_RAIL_VERTICAL = new Image();
IMAGE_RAIL_VERTICAL.src = 'images/rail-vertical.png';

const IMAGE_RAIL_BAS_VERS_DROITE = new Image();
IMAGE_RAIL_BAS_VERS_DROITE.src = 'images/rail-bas-vers-droite.png';

const IMAGE_RAIL_DROITE_VERS_BAS = new Image();
IMAGE_RAIL_DROITE_VERS_BAS.src = 'images/rail-droite-vers-bas.png';

const IMAGE_RAIL_DROITE_VERS_HAUT = new Image();
IMAGE_RAIL_DROITE_VERS_HAUT.src = 'images/rail-droite-vers-haut.png';

const IMAGE_RAIL_HAUT_VERS_DROITE = new Image();
IMAGE_RAIL_HAUT_VERS_DROITE.src = 'images/rail-haut-vers-droite.png';


/************************************************************/
// Variables globales
/************************************************************/

let pause = false;
let locomotives = [];


/************************************************************/
/* Classes */
/************************************************************/

/*------------------------------------------------------------*/
// Plateau
/*------------------------------------------------------------*/

class Plateau {
	/* Constructeur d'un plateau vierge */
	constructor() {
		this.largeur = LARGEUR_PLATEAU;
		this.hauteur = HAUTEUR_PLATEAU;

		// NOTE: à compléter…

		// État des cases du plateau
		// NOTE: tableau de colonnes, chaque colonne étant elle-même un tableau de cases (beaucoup plus simple à gérer avec la syntaxe case[x][y] pour une coordonnée (x,y))
		this.cases = [];
		for (let x = 0; x < this.largeur; x++) {
			this.cases[x] = [];
			for (let y = 0; y < this.hauteur; y++) {
				this.cases[x][y] = Type_de_case.Foret;
			}
		}
	}

	// NOTE: à compléter…

}

// TODO : d'autres classes si besoin


/************************************************************/
// Méthodes
/************************************************************/

function image_of_case(type_de_case) {
	switch (type_de_case) {
		case Type_de_case.Foret: return IMAGE_FORET;
		case Type_de_case.Eau: return IMAGE_EAU;
		case Type_de_case.Rail_horizontal: return IMAGE_RAIL_HORIZONTAL;
		case Type_de_case.Rail_vertical: return IMAGE_RAIL_VERTICAL;
		case Type_de_case.Rail_droite_vers_haut: return IMAGE_RAIL_DROITE_VERS_HAUT;
		case Type_de_case.Rail_haut_vers_droite: return IMAGE_RAIL_HAUT_VERS_DROITE;
		case Type_de_case.Rail_droite_vers_bas: return IMAGE_RAIL_DROITE_VERS_BAS;
		case Type_de_case.Rail_bas_vers_droite: return IMAGE_RAIL_BAS_VERS_DROITE;
		case Type_de_case.Wagon: return IMAGE_WAGON;
		case Type_de_case.Loco: return IMAGE_LOCO;


	}
}

function dessine_case(contexte, plateau, x, y) {
	const la_case = plateau.cases[x][y];

	// NOTE: à améliorer

	let image_a_afficher = image_of_case(la_case);
	contexte.drawImage(image_a_afficher, x * LARGEUR_CASE, y * HAUTEUR_CASE, LARGEUR_CASE, HAUTEUR_CASE);
}

function dessine_train(contexte, train, x, y) {
	let image_a_afficher = image_of_case(train);
	contexte.drawImage(image_a_afficher, x * LARGEUR_CASE, y * HAUTEUR_CASE, LARGEUR_CASE, HAUTEUR_CASE);
}

function dessine_plateau(page, plateau) {
	// Dessin du plateau avec paysages et rails
	for (let x = 0; x < plateau.largeur; x++) {
		for (let y = 0; y < plateau.hauteur; y++) {
			dessine_case(page, plateau, x, y);
		}
	}

	// NOTE: à compléter…
}

const DIRECTION = {
	DROITE: 'droite',
	GAUCHE: 'gauche',
	HAUT: 'haut',
	BAS: 'bas'
};

class Loco {
	constructor(x, y, direction, longueur) {
		this.x = x;
		this.y = y;
		this.direction = direction;
		this.longueur = longueur;
		this.wagons = [];
		for (let i = 1; i <= this.longueur; i++) {
			this.wagons.push({ x: this.x - i, y: this.y, direction: this.direction });
		}
	}

	avancer(contexte, plateau, type, position) {
		let newX = position.x;
		let newY = position.y;

		switch (position.direction) {
			case DIRECTION.DROITE:
				newX++;
				break;
			case DIRECTION.GAUCHE:
				newX--;
				break;
			case DIRECTION.HAUT:
				newY--;
				break;
			case DIRECTION.BAS:
				newY++;
				break;
		}

		if (this.peutAvancer(newX, newY, plateau, position)) {
			dessine_train(contexte, type, newX, newY);
			dessine_case(contexte, plateau, position.x, position.y);
			position.x = newX;
			position.y = newY;
			this.miseAJourDirection(plateau, position);
			return true;
		}
		else {
			return false;
		}
	}

	avancerLoco(contexte, plateau) {
		// Avance la locomotive
		if(this.avancer(contexte, plateau, Type_de_case.Loco, this) === false) {
			const index = locomotives.indexOf(this);
			dessine_case(contexte, plateau, this.x, this.y);
			for (let i = 0; i < this.longueur; i++) {
				dessine_case(contexte, plateau, this.wagons[i].x, this.wagons[i].y);
			}
			if (index > -1) {
				locomotives.splice(index, 1);
			}
			console.log("La locomotive ne peut pas avancer et est retirée.");
			return;
		}

		// Avance les wagons
		for (let i = 0; i < this.longueur; i++) {
			this.avancer(contexte, plateau, Type_de_case.Wagon, this.wagons[i]);
		}
	}

	peutAvancer(x, y, plateau, position) {
		if (x < 0 || x >= plateau.largeur || y < 0 || y >= plateau.hauteur) {
			return false;
		}

		const caseSuivante = plateau.cases[x][y];
		switch (position.direction) {
			case DIRECTION.DROITE:
				if (caseSuivante === Type_de_case.Rail_horizontal ||
					caseSuivante === Type_de_case.Rail_droite_vers_haut ||
					caseSuivante === Type_de_case.Rail_droite_vers_bas) {
					return true;
				}
				break;
			case DIRECTION.GAUCHE:
				if (caseSuivante === Type_de_case.Rail_horizontal ||
					caseSuivante === Type_de_case.Rail_haut_vers_droite ||
					caseSuivante === Type_de_case.Rail_bas_vers_droite) {
					return true;
				}
				break;
			case DIRECTION.HAUT:
				if (caseSuivante === Type_de_case.Rail_vertical ||
					caseSuivante === Type_de_case.Rail_droite_vers_bas ||
					caseSuivante === Type_de_case.Rail_haut_vers_droite) {
					return true;
				}
				break;
			case DIRECTION.BAS:
				if (caseSuivante === Type_de_case.Rail_vertical ||
					caseSuivante === Type_de_case.Rail_droite_vers_haut ||
					caseSuivante === Type_de_case.Rail_bas_vers_droite) {
					return true;
				}
				break;

		}
		return false;
	}

	miseAJourDirection(plateau, position) {
		const caseActuelle = plateau.cases[position.x][position.y];
		switch (caseActuelle) {
			case Type_de_case.Rail_droite_vers_haut:
				if (position.direction === DIRECTION.DROITE) {
					position.direction = DIRECTION.HAUT;
				}
				else if (position.direction === DIRECTION.BAS) {
					position.direction = DIRECTION.GAUCHE;
				}
				break;
			case Type_de_case.Rail_haut_vers_droite:
				if (position.direction === DIRECTION.HAUT) {
					position.direction = DIRECTION.DROITE;
				}
				else if (position.direction === DIRECTION.GAUCHE) {
					position.direction = DIRECTION.BAS;
				}
				break;
			case Type_de_case.Rail_droite_vers_bas:
				if (position.direction === DIRECTION.DROITE) {
					position.direction = DIRECTION.BAS;
				}
				else if (position.direction === DIRECTION.HAUT) {
					position.direction = DIRECTION.GAUCHE;
				}
				break;
			case Type_de_case.Rail_bas_vers_droite:
				if (position.direction === DIRECTION.BAS) {
					position.direction = DIRECTION.DROITE;
				}
				else if (position.direction === DIRECTION.GAUCHE) {
					position.direction = DIRECTION.HAUT;
				}
				break;
		}
	}
}

function gameLoop(contexte, plateau) {

	if (!pause) {
		locomotives.forEach(loco => { loco.avancerLoco(contexte, plateau); });
	}
	setTimeout(gameLoop, 500, contexte, plateau);
}


/************************************************************/
// Auditeurs
/************************************************************/

function setupListeners(contexte, plateau) {

	let selectedType = null;

	document.querySelectorAll('#boutons input[type=image]').forEach(button => {
		button.addEventListener('click', () => {
			document.querySelectorAll('#boutons input[type=image]').forEach(btn => btn.disabled = false);
			button.disabled = true;
			selectedType = button.id;
		});
	});

	document.getElementById('simulateur').addEventListener('click', (event) => {
		let rect = event.target.getBoundingClientRect();
		let x = Math.floor((event.clientX - rect.left) / LARGEUR_CASE);
		let y = Math.floor((event.clientY - rect.top) / HAUTEUR_CASE);
		if (selectedType && x < LARGEUR_PLATEAU && y < HAUTEUR_PLATEAU) {
			switch (selectedType) {
				case 'bouton_eau':
					plateau.cases[x][y] = Type_de_case.Eau;
					dessine_case(contexte, plateau, x, y);
					break;
				case 'bouton_foret':
					plateau.cases[x][y] = Type_de_case.Foret;
					dessine_case(contexte, plateau, x, y);
					break;
				case 'bouton_rail_horizontal':
					plateau.cases[x][y] = Type_de_case.Rail_horizontal;
					dessine_case(contexte, plateau, x, y);
					break;
				case 'bouton_rail_vertical':
					plateau.cases[x][y] = Type_de_case.Rail_vertical;
					dessine_case(contexte, plateau, x, y);
					break;
				case 'bouton_rail_droite_vers_haut':
					plateau.cases[x][y] = Type_de_case.Rail_droite_vers_haut;
					dessine_case(contexte, plateau, x, y);
					break;
				case 'bouton_rail_haut_vers_droite':
					plateau.cases[x][y] = Type_de_case.Rail_haut_vers_droite;
					dessine_case(contexte, plateau, x, y);
					break;
				case 'bouton_rail_droite_vers_bas':
					plateau.cases[x][y] = Type_de_case.Rail_droite_vers_bas;
					dessine_case(contexte, plateau, x, y);
					break;
				case 'bouton_rail_bas_vers_droite':
					plateau.cases[x][y] = Type_de_case.Rail_bas_vers_droite;
					dessine_case(contexte, plateau, x, y);
					break;
				case 'bouton_train_1':
					if (plateau.cases[x][y] == Type_de_case.Rail_horizontal) {
						dessine_train(contexte, Type_de_case.Loco, x, y);
					}
					locomotives.push(new Loco(x, y, DIRECTION.DROITE, 0));
					break;
				case 'bouton_train_2':
					for (let i = 0; i < 2; i++) {
						if (plateau.cases[x - i][y] != Type_de_case.Rail_horizontal) {
							return;
						}
					}
					dessine_train(contexte, Type_de_case.Loco, x, y);
					for (let i = 1; i < 2; i++) {
						dessine_train(contexte, Type_de_case.Wagon, x - i, y);
					}
					locomotives.push(new Loco(x, y, DIRECTION.DROITE, 1));
					break;
				case 'bouton_train_4':
					for (let i = 0; i < 4; i++) {
						if (plateau.cases[x - i][y] != Type_de_case.Rail_horizontal) {
							return;
						}
					}
					dessine_train(contexte, Type_de_case.Loco, x, y);
					for (let i = 1; i < 4; i++) {
						dessine_train(contexte, Type_de_case.Wagon, x - i, y);
					}
					locomotives.push(new Loco(x, y, DIRECTION.DROITE, 3));
					break;
				case 'bouton_train_6':
					for (let i = 0; i < 6; i++) {
						if (plateau.cases[x - i][y] != Type_de_case.Rail_horizontal) {
							return;
						}
					}
					dessine_train(contexte, Type_de_case.Loco, x, y);
					for (let i = 1; i < 6; i++) {
						dessine_train(contexte, Type_de_case.Wagon, x - i, y);
					}
					locomotives.push(new Loco(x, y, DIRECTION.DROITE, 5));
					break;
			}
		}
	});

	document.getElementById('bouton_pause').addEventListener('click', () => {
		pause = !pause;
		document.getElementById('bouton_pause').textContent = pause ? 'Redémarrer' : 'Pause';
	});
}

/************************************************************/
// Plateau de jeu initial
/************************************************************/


// NOTE : ne pas modifier le plateau initial
function cree_plateau_initial(plateau) {
	// Circuit
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

	// Segment isolé à gauche
	plateau.cases[0][7] = Type_de_case.Rail_horizontal;
	plateau.cases[1][7] = Type_de_case.Rail_horizontal;
	plateau.cases[2][7] = Type_de_case.Rail_horizontal;
	plateau.cases[3][7] = Type_de_case.Rail_horizontal;
	plateau.cases[4][7] = Type_de_case.Rail_horizontal;
	plateau.cases[5][7] = Type_de_case.Eau;
	plateau.cases[6][7] = Type_de_case.Rail_horizontal;
	plateau.cases[7][7] = Type_de_case.Rail_horizontal;

	// Plan d'eau
	for (let x = 22; x <= 27; x++) {
		for (let y = 2; y <= 5; y++) {
			plateau.cases[x][y] = Type_de_case.Eau;
		}
	}

	// Segment isolé à droite
	plateau.cases[22][8] = Type_de_case.Rail_horizontal;
	plateau.cases[23][8] = Type_de_case.Rail_horizontal;
	plateau.cases[24][8] = Type_de_case.Rail_horizontal;
	plateau.cases[25][8] = Type_de_case.Rail_horizontal;
	plateau.cases[26][8] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[27][8] = Type_de_case.Rail_horizontal;
	plateau.cases[28][8] = Type_de_case.Rail_horizontal;
	plateau.cases[29][8] = Type_de_case.Rail_horizontal;

	// TCHOU
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
	console.log("Tchou, attention au départ !");
	/*------------------------------------------------------------*/
	// Variables DOM
	/*------------------------------------------------------------*/
	const contexte = document.getElementById('simulateur').getContext("2d");

	// NOTE: ce qui suit est sûrement à compléter voire à réécrire intégralement

	// Création du plateau
	let plateau = new Plateau();
	cree_plateau_initial(plateau);

	// Dessine le plateau
	dessine_plateau(contexte, plateau);

	// Auditeurs
	setupListeners(contexte, plateau);

	// Boucle de jeu
	gameLoop(contexte, plateau);

}

/************************************************************/
// Programme principal
/************************************************************/
// NOTE: rien à modifier ici !
window.addEventListener("load", () => {
	// Appel à la fonction principale
	tchou();
});
