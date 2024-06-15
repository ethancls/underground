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
const LARGEUR_PLATEAU = 45;
const HAUTEUR_PLATEAU = 20;

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

	static Building = new Type_de_case('building');

	static Explosion = new Type_de_case('explosion');

	static Bateau = new Type_de_case('bateau');

	static Avion = new Type_de_case('avion');

	static Undertale = new Type_de_case('undertale');

	constructor(nom) {
		this.nom = nom;
	}
}

/*------------------------------------------------------------*/
// Images
/*------------------------------------------------------------*/
const IMAGE_EAU = new Image();
IMAGE_EAU.src = 'images/eau.jpg';

const IMAGE_FORET = new Image();
IMAGE_FORET.src = 'images/foret.jpg';

const IMAGE_LOCO = new Image();
IMAGE_LOCO.src = 'images/locomotive.png';

const IMAGE_EXPLOSION = new Image();
IMAGE_EXPLOSION.src = 'images/explosion.png';

const IMAGE_BUILDING = new Image();
IMAGE_BUILDING.src = null;

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

const IMAGE_BATEAU = new Image();
IMAGE_BATEAU.src = 'images/bateau.png';

const IMAGE_AVION = new Image();
IMAGE_AVION.src = 'images/avion.png';

const IMAGE_UNDERTALE = new Image();
IMAGE_UNDERTALE.src = 'images/undertale.png';


/************************************************************/
// Variables globales
/************************************************************/

let pause = false;
let locomotives = [];
let bateau = [];
let avion = [];

/************************************************************/
/* Classes */
/************************************************************/

/*------------------------------------------------------------*/
// Plateau + direction
/*------------------------------------------------------------*/

const DIRECTION = {
	DROITE: 'droite',
	GAUCHE: 'gauche',
	HAUT: 'haut',
	BAS: 'bas'
};

class Plateau {
	/* Constructeur d'un plateau vierge */
	constructor() {
		this.largeur = LARGEUR_PLATEAU;
		this.hauteur = HAUTEUR_PLATEAU;

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
}

/*------------------------------------------------------------*/
// Locomotive
/*------------------------------------------------------------*/

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

	avancer(plateau, type, position) {
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
		if (this.avancer(plateau, Type_de_case.Loco, this) === false) {
			const index = locomotives.indexOf(this);
			setTimeout(() => {
				dessine_case_type(contexte, Type_de_case.Explosion, this.x, this.y);
				for (let i = 0; i < this.longueur; i++) {
					setTimeout(() => { dessine_case_type(contexte, Type_de_case.Explosion, this.wagons[i].x, this.wagons[i].y) }, 100);
				}
			}, 10);
			if (index > -1) {
				locomotives.splice(index, 1);
			}
			console.log("La locomotive ne peut pas avancer et est retirée.");
			return;
		}

		// Avance les wagons
		for (let i = 0; i < this.longueur; i++) {
			this.avancer(plateau, Type_de_case.Wagon, this.wagons[i]);
		}
	}

	case_occupee(x, y) {
		return locomotives.find(loco => {
			if (loco.x === x && loco.y === y) {
				return true;
			}
			return loco.wagons.find(wagon => wagon.x === x && wagon.y === y);
		});
	}

	peutAvancer(x, y, plateau, position) {
		if (x < 0 || x >= plateau.largeur || y < 0 || y >= plateau.hauteur || this.case_occupee(x, y)) {
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


/*------------------------------------------------------------*/
// Autres vehicules
/*------------------------------------------------------------*/

class Bateau {
	constructor(x, y, direction) {
		this.x = x;
		this.y = y;
		this.direction = direction;
	}

	avancer(plateau, type, position) {
		let newX = this.x;
		let newY = this.y;

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
			this.x = newX;
			this.y = newY;
			return true;
		}
		else {
			return false;
		}
	}

	peutAvancer(x, y, plateau, position) {
		if (x < 0 || x >= plateau.largeur || y < 0 || y >= plateau.hauteur) {
			return false;
		}

		const caseSuivante = plateau.cases[x][y];
		switch (this.direction) {
			case DIRECTION.DROITE:
				if (caseSuivante === Type_de_case.Eau) {
					return true;
				}
				else {
					this.changerDirection();
				}
				break;
			case DIRECTION.GAUCHE:
				if (caseSuivante === Type_de_case.Eau) {
					return true;
				} else {
					this.changerDirection();
				}
				break;
			case DIRECTION.HAUT:
				if (caseSuivante === Type_de_case.Eau) {
					return true;
				} else {
					this.changerDirection();
				}
				break;
			case DIRECTION.BAS:
				if (caseSuivante === Type_de_case.Eau) {
					return true;
				} else {
					this.changerDirection();
				}
				break;
		}

		return false;
	}

	changerDirection() {
		const directions = [DIRECTION.DROITE, DIRECTION.GAUCHE, DIRECTION.HAUT, DIRECTION.BAS];
		this.direction = directions[Math.floor(Math.random() * directions.length)];
	}
}

class Avion {
	constructor(x, y, direction) {
		this.x = x;
		this.y = y;
		this.direction = direction;
	}

	avancer(plateau, type, position, contexte) {
		let newX = this.x;
		let newY = this.y;

		switch (position.direction) {
			case DIRECTION.DROITE:
				newX++;
				newY++;
				break;
			case DIRECTION.GAUCHE:
				newX--;
				newY--;
				break;
			case DIRECTION.HAUT:
				newY--;
				newX++;
				break;
			case DIRECTION.BAS:
				newY++;
				newX--;
				break;
		}

		if (this.peutAvancer(newX, newY, plateau, position, contexte)) {
			this.x = newX;
			this.y = newY;
			return true;
		}
		else {
			avion.splice(avion.indexOf(this), 1);
			return false;
		}
	}

	peutAvancer(x, y, plateau, position, contexte) {
		if (x < 0 || x >= plateau.largeur || y < 0 || y >= plateau.hauteur) {
			return false;
		}

		if (avion.find(avion => Math.floor(avion.x) === x && Math.floor(avion.y) === y)) {
			setTimeout(() => { dessine_case_type(contexte, Type_de_case.Explosion, this.x, this.y); }, 100);
			return false;
		}
		return true;
	}
}

class Undertale {
	constructor(x, y, direction) {
		this.x = x;
		this.y = y;
		this.direction = direction;
	}

	avancer(plateau, type, position) {
		let newX = this.x;
		let newY = this.y;

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
	}
}


/************************************************************/
// Fonctions
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
		case Type_de_case.Building: return IMAGE_BUILDING;
		case Type_de_case.Explosion: return IMAGE_EXPLOSION;
		case Type_de_case.Bateau: return IMAGE_BATEAU;
		case Type_de_case.Avion: return IMAGE_AVION;
		case Type_de_case.Undertale: return IMAGE_UNDERTALE;
	}
}

function dessine_case(contexte, plateau, x, y) {
	const la_case = plateau.cases[x][y];
	let image_a_afficher = image_of_case(la_case);
	contexte.drawImage(image_a_afficher, x * LARGEUR_CASE, y * HAUTEUR_CASE, LARGEUR_CASE, HAUTEUR_CASE);
}

function dessine_case_type(contexte, type, x, y) {
	let image_a_afficher = image_of_case(type);
	contexte.drawImage(image_a_afficher, x * LARGEUR_CASE, y * HAUTEUR_CASE, LARGEUR_CASE, HAUTEUR_CASE);
}

function dessine_avion(contexte) {
	// Dessin des avions
	avion.forEach(avion => {
		let image_a_afficher = image_of_case(Type_de_case.Avion);
		let angle = 0;
		switch (avion.direction) {
			case DIRECTION.DROITE:
				angle = Math.PI / 2;
				break;
			case DIRECTION.GAUCHE:
				angle = -Math.PI / 2;
				break;
			case DIRECTION.HAUT:
				angle = 0;
				break;
			case DIRECTION.BAS:
				angle = -Math.PI;
				break;
		}
		contexte.save();
		contexte.translate(avion.x * LARGEUR_CASE + LARGEUR_CASE / 2, avion.y * HAUTEUR_CASE + HAUTEUR_CASE / 2);
		contexte.rotate(angle);
		contexte.drawImage(image_a_afficher, -LARGEUR_CASE / 2, -HAUTEUR_CASE / 2, LARGEUR_CASE, HAUTEUR_CASE);
		contexte.restore();
	});
}

function dessine_bateau(page) {
	// Dessin des bateaux
	bateau.forEach(bateau => {
		dessine_case_type(page, Type_de_case.Bateau, bateau.x, bateau.y);
	});
}

function dessine_train(page) {
	// Dessin des trains
	locomotives.forEach(loco => {
		dessine_case_type(page, Type_de_case.Loco, loco.x, loco.y);
		for (let i = 0; i < loco.longueur; i++) {
			dessine_case_type(page, Type_de_case.Wagon, loco.wagons[i].x, loco.wagons[i].y);
		}
	});
}

function dessine_plateau(page, plateau) {
	// Dessin du plateau avec paysages et rails
	for (let x = 0; x < plateau.largeur; x++) {
		for (let y = 0; y < plateau.hauteur; y++) {
			dessine_case(page, plateau, x, y);
		}
	}
}

function gameLoop(contexte, plateau) {

	if (!pause) {
		locomotives.forEach(loco => { loco.avancerLoco(contexte, plateau); });
		bateau.forEach(bateau => { bateau.avancer(plateau, Type_de_case.Bateau, bateau); });
		avion.forEach(avion => { avion.avancer(plateau, Type_de_case.Avion, avion, contexte); });
		dessine_plateau(contexte, plateau);
		dessine_train(contexte);
		dessine_bateau(contexte);
		dessine_avion(contexte);
	}
	setTimeout(gameLoop, 500, contexte, plateau);
}

function updateListeCartes() {
	const listeCartes = document.getElementById('liste_cartes');
	listeCartes.innerHTML = ''; // Clear existing options
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		const option = document.createElement('option');
		option.value = key;
		option.text = key;
		listeCartes.appendChild(option);
	}
}

function typeToString(type) {
	switch (type) {
		case Type_de_case.Foret:
			return 'Foret';
		case Type_de_case.Eau:
			return 'Eau';
		case Type_de_case.Rail_horizontal:
			return 'Rail_horizontal';
		case Type_de_case.Rail_vertical:
			return 'Rail_vertical';
		case Type_de_case.Rail_droite_vers_haut:
			return 'Rail_droite_vers_haut';
		case Type_de_case.Rail_haut_vers_droite:
			return 'Rail_haut_vers_droite';
		case Type_de_case.Rail_droite_vers_basb:
			return 'Rail_droite_vers_bas';
		case Type_de_case.Rail_bas_vers_droite:
			return 'Rail_bas_vers_droite';
		case Type_de_case.Wagon:
			return 'Wagon';
		case Type_de_case.Loco:
			return 'Loco';
		case Type_de_case.Building:
			return 'Building';
		case Type_de_case.Explosion:
			return 'Explosion';
		case Type_de_case.Bateau:
			return 'Bateau';
		case Type_de_case.Avion:
			return 'Avion';
		case Type_de_case.Undertale:
			return 'Undertale';
		default:
			return 'Foret';
	}
}

function stringToType(str) {
	switch (str) {
		case 'Foret':
			return Type_de_case.Foret;
		case 'Eau':
			return Type_de_case.Eau;
		case 'Rail_horizontal':
			return Type_de_case.Rail_horizontal;
		case 'Rail_vertical':
			return Type_de_case.Rail_vertical;
		case 'Rail_droite_vers_haut':
			return Type_de_case.Rail_droite_vers_haut;
		case 'Rail_haut_vers_droite':
			return Type_de_case.Rail_haut_vers_droite;
		case 'Rail_droite_vers_bas':
			return Type_de_case.Rail_droite_vers_bas;
		case 'Rail_bas_vers_droite':
			return Type_de_case.Rail_bas_vers_droite;
		case 'Wagon':
			return Type_de_case.Wagon;
		case 'Loco':
			return Type_de_case.Loco;
		case 'Building':
			return Type_de_case.Building;
		case 'Explosion':
			return Type_de_case.Explosion;
		case 'Bateau':
			return Type_de_case.Bateau;
		case 'Avion':
			return Type_de_case.Avion;
		case 'Undertale':
			return Type_de_case.Undertale;
		default:
			return null;
	}
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

	document.getElementById('simulateur').addEventListener('mousemove', (event) => {
		dessine_plateau(contexte, plateau);
		dessine_train(contexte);
		dessine_bateau(contexte);
		dessine_avion(contexte);
		let rect = event.target.getBoundingClientRect();
		let x = Math.floor((event.clientX - rect.left) / LARGEUR_CASE) * LARGEUR_CASE;
		let y = Math.floor((event.clientY - rect.top) / HAUTEUR_CASE) * HAUTEUR_CASE;
		contexte.fillStyle = 'orange';
		contexte.fillRect(x, y, LARGEUR_CASE, HAUTEUR_CASE);
	});

	let isMoving = false;
	let x = 0, y = 0;

	document.addEventListener("mousedown", (event) => {
		y = event.offsetY;
		x = event.offsetX;
		isMoving = true;
	});

	document.addEventListener("mouseup", (event) => {
		y = event.offsetY;
		x = event.offsetX;
		isMoving = false;
	})

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
					if (isTrackValid(x, y, 1)) {
						locomotives.push(new Loco(x, y, DIRECTION.DROITE, 0));
						dessine_train(contexte);
					}
					break;
				case 'bouton_train_2':
					if (isTrackValid(x, y, 2)) {
						locomotives.push(new Loco(x, y, DIRECTION.DROITE, 1));
						dessine_train(contexte);
					}
					break;
				case 'bouton_train_4':
					if (isTrackValid(x, y, 4)) {
						locomotives.push(new Loco(x, y, DIRECTION.DROITE, 3));
						dessine_train(contexte);
					}
					break;
				case 'bouton_train_6':
					if (isTrackValid(x, y, 6)) {
						locomotives.push(new Loco(x, y, DIRECTION.DROITE, 5));
						dessine_train(contexte);
					}
					break;
				case 'bouton_bateau':
					if (plateau.cases[x][y] === Type_de_case.Eau) {
						const directions = [DIRECTION.DROITE, DIRECTION.GAUCHE, DIRECTION.HAUT, DIRECTION.BAS];
						bateau.push(new Bateau(x, y, directions[Math.floor(Math.random() * directions.length)]));
					}
					break;
				case 'bouton_avion':
					const directions = [DIRECTION.DROITE, DIRECTION.GAUCHE, DIRECTION.HAUT, DIRECTION.BAS];
					avion.push(new Avion(x, y, directions[Math.floor(Math.random() * directions.length)]));
					break;
			}
		}
	});

	document.getElementById('simulateur').addEventListener('mousemove', handleMouseMove);

	function handleMouseMove(event) {
		if (isMoving) {
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
						if (isTrackValid(x, y, 1)) {
							locomotives.push(new Loco(x, y, DIRECTION.DROITE, 0));
							dessine_train(contexte);
						}
						break;
					case 'bouton_train_2':
						if (isTrackValid(x, y, 2)) {
							locomotives.push(new Loco(x, y, DIRECTION.DROITE, 1));
							dessine_train(contexte);
						}
						break;
					case 'bouton_train_4':
						if (isTrackValid(x, y, 4)) {
							locomotives.push(new Loco(x, y, DIRECTION.DROITE, 3));
							dessine_train(contexte);
						}
						break;
					case 'bouton_train_6':
						if (isTrackValid(x, y, 6)) {
							locomotives.push(new Loco(x, y, DIRECTION.DROITE, 5));
							dessine_train(contexte);
						}
						break;
					case 'bouton_bateau':
						if (plateau.cases[x][y] === Type_de_case.Eau) {
							const directions = [DIRECTION.DROITE, DIRECTION.GAUCHE, DIRECTION.HAUT, DIRECTION.BAS];
							bateau.push(new Bateau(x, y, directions[Math.floor(Math.random() * directions.length)]));
						}
						break;
					case 'bouton_avion':
						const directions = [DIRECTION.DROITE, DIRECTION.GAUCHE, DIRECTION.HAUT, DIRECTION.BAS];
						avion.push(new Avion(x, y, directions[Math.floor(Math.random() * directions.length)]));
						break;
				}
			}
		}
	}

	function isTrackValid(x, y, length) {
		for (let i = 0; i < length; i++) {
			if (x - i < 0 || plateau.cases[x - i][y] !== Type_de_case.Rail_horizontal || case_occupee(x - i, y)) {
				return false;
			}
		}
		return true;
	}

	function case_occupee(x, y) {
		return locomotives.find(loco => {
			if (loco.x === x && loco.y === y) {
				return true;
			}
			return loco.wagons.find(wagon => wagon.x === x && wagon.y === y);
		});
	}

	document.getElementById('bouton_pause').addEventListener('click', () => {
		pause = !pause;
		document.getElementById('bouton_pause').value = pause ? 'Redémarrer' : 'Pause';
	});

	document.getElementById('sauvegarder_carte').addEventListener('click', () => {
		const nomCarte = document.getElementById('nom_carte').value;
		if (nomCarte) {
			const mapData = plateau.cases.map(col => col.map(caseType => typeToString(caseType)));
			localStorage.setItem(nomCarte, JSON.stringify(mapData));
			alert('Carte sauvegardée avec succès !');
			updateListeCartes();
		} else {
			alert('Veuillez entrer un nom pour la carte.');
		}
	});

	document.getElementById('charger_carte').addEventListener('click', () => {
		const listeCartes = document.getElementById('liste_cartes');
		const nomCarte = listeCartes.options[listeCartes.selectedIndex].value;
		const savedMapData = localStorage.getItem(nomCarte);
		if (savedMapData) {
			const mapData = JSON.parse(savedMapData);
			plateau.cases.forEach((col, x) => {
				col.forEach((_, y) => {
					plateau.cases[x][y] = stringToType(mapData[x][y]);
				});
			});
			for (let x = 0; x < plateau.largeur; x++) {
				for (let y = 0; y < plateau.hauteur; y++) {
					if (plateau.cases[x][y] != Type_de_case.Foret) {
						// Convert the type to a string that represents the type in your code
						const typeString = typeToString(plateau.cases[x][y]);
						console.log(`plateau.cases[${x}][${y}] = ${typeString};`);
					}
				}
			}
			dessine_plateau(contexte, plateau);
			locomotives = [];
			bateau = [];
			avion = [];
			alert('Carte chargée avec succès !');
		} else {
			alert('Aucune carte sauvegardée trouvée.');
		}
	});
}

/************************************************************/
// Plateau de jeu initial
/************************************************************/


function cree_plateau_initial(plateau) {

	plateau.cases[6][9] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[6][10] = Type_de_case.Rail_vertical;
	plateau.cases[6][11] = Type_de_case.Rail_vertical;
	plateau.cases[6][12] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[7][6] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[7][7] = Type_de_case.Rail_vertical;
	plateau.cases[7][8] = Type_de_case.Rail_vertical;
	plateau.cases[7][9] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[7][12] = Type_de_case.Foret;
	plateau.cases[7][13] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[8][5] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[8][6] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[8][13] = Type_de_case.Foret;
	plateau.cases[8][14] = Type_de_case.Rail_vertical;
	plateau.cases[8][15] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[9][5] = Type_de_case.Rail_horizontal;
	plateau.cases[9][10] = Type_de_case.Eau;
	plateau.cases[9][15] = Type_de_case.Foret;
	plateau.cases[9][16] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[10][5] = Type_de_case.Rail_horizontal;
	plateau.cases[10][9] = Type_de_case.Eau;
	plateau.cases[10][10] = Type_de_case.Eau;
	plateau.cases[10][11] = Type_de_case.Eau;
	plateau.cases[10][12] = Type_de_case.Eau;
	plateau.cases[10][16] = Type_de_case.Rail_horizontal;
	plateau.cases[11][4] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[11][5] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[11][8] = Type_de_case.Eau;
	plateau.cases[11][9] = Type_de_case.Eau;
	plateau.cases[11][10] = Type_de_case.Eau;
	plateau.cases[11][11] = Type_de_case.Eau;
	plateau.cases[11][12] = Type_de_case.Eau;
	plateau.cases[11][16] = Type_de_case.Foret;
	plateau.cases[11][17] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[12][4] = Type_de_case.Rail_horizontal;
	plateau.cases[12][8] = Type_de_case.Eau;
	plateau.cases[12][9] = Type_de_case.Eau;
	plateau.cases[12][10] = Type_de_case.Eau;
	plateau.cases[12][11] = Type_de_case.Eau;
	plateau.cases[12][12] = Type_de_case.Eau;
	plateau.cases[12][13] = Type_de_case.Eau;
	plateau.cases[12][17] = Type_de_case.Rail_horizontal;
	plateau.cases[13][4] = Type_de_case.Rail_horizontal;
	plateau.cases[13][7] = Type_de_case.Eau;
	plateau.cases[13][8] = Type_de_case.Eau;
	plateau.cases[13][9] = Type_de_case.Eau;
	plateau.cases[13][10] = Type_de_case.Eau;
	plateau.cases[13][11] = Type_de_case.Eau;
	plateau.cases[13][12] = Type_de_case.Eau;
	plateau.cases[13][13] = Type_de_case.Eau;
	plateau.cases[13][17] = Type_de_case.Rail_horizontal;
	plateau.cases[14][4] = Type_de_case.Rail_horizontal;
	plateau.cases[14][7] = Type_de_case.Eau;
	plateau.cases[14][8] = Type_de_case.Eau;
	plateau.cases[14][9] = Type_de_case.Eau;
	plateau.cases[14][10] = Type_de_case.Eau;
	plateau.cases[14][11] = Type_de_case.Eau;
	plateau.cases[14][12] = Type_de_case.Eau;
	plateau.cases[14][13] = Type_de_case.Eau;
	plateau.cases[14][17] = Type_de_case.Rail_horizontal;
	plateau.cases[15][3] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[15][4] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[15][7] = Type_de_case.Eau;
	plateau.cases[15][8] = Type_de_case.Eau;
	plateau.cases[15][9] = Type_de_case.Eau;
	plateau.cases[15][10] = Type_de_case.Eau;
	plateau.cases[15][11] = Type_de_case.Eau;
	plateau.cases[15][12] = Type_de_case.Eau;
	plateau.cases[15][13] = Type_de_case.Eau;
	plateau.cases[15][14] = Type_de_case.Eau;
	plateau.cases[15][17] = Type_de_case.Rail_horizontal;
	plateau.cases[16][2] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[16][3] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[16][7] = Type_de_case.Eau;
	plateau.cases[16][8] = Type_de_case.Eau;
	plateau.cases[16][9] = Type_de_case.Eau;
	plateau.cases[16][10] = Type_de_case.Eau;
	plateau.cases[16][11] = Type_de_case.Eau;
	plateau.cases[16][12] = Type_de_case.Eau;
	plateau.cases[16][13] = Type_de_case.Eau;
	plateau.cases[16][14] = Type_de_case.Eau;
	plateau.cases[16][17] = Type_de_case.Rail_horizontal;
	plateau.cases[17][2] = Type_de_case.Rail_horizontal;
	plateau.cases[17][6] = Type_de_case.Eau;
	plateau.cases[17][7] = Type_de_case.Eau;
	plateau.cases[17][8] = Type_de_case.Eau;
	plateau.cases[17][9] = Type_de_case.Eau;
	plateau.cases[17][10] = Type_de_case.Eau;
	plateau.cases[17][11] = Type_de_case.Eau;
	plateau.cases[17][12] = Type_de_case.Eau;
	plateau.cases[17][13] = Type_de_case.Eau;
	plateau.cases[17][14] = Type_de_case.Eau;
	plateau.cases[17][17] = Type_de_case.Foret;
	plateau.cases[17][18] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[18][1] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[18][2] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[18][6] = Type_de_case.Eau;
	plateau.cases[18][7] = Type_de_case.Eau;
	plateau.cases[18][8] = Type_de_case.Eau;
	plateau.cases[18][9] = Type_de_case.Eau;
	plateau.cases[18][10] = Type_de_case.Eau;
	plateau.cases[18][11] = Type_de_case.Eau;
	plateau.cases[18][12] = Type_de_case.Eau;
	plateau.cases[18][13] = Type_de_case.Eau;
	plateau.cases[18][14] = Type_de_case.Eau;
	plateau.cases[18][18] = Type_de_case.Rail_horizontal;
	plateau.cases[19][1] = Type_de_case.Rail_horizontal;
	plateau.cases[19][5] = Type_de_case.Eau;
	plateau.cases[19][6] = Type_de_case.Eau;
	plateau.cases[19][7] = Type_de_case.Eau;
	plateau.cases[19][8] = Type_de_case.Eau;
	plateau.cases[19][9] = Type_de_case.Eau;
	plateau.cases[19][10] = Type_de_case.Eau;
	plateau.cases[19][11] = Type_de_case.Eau;
	plateau.cases[19][12] = Type_de_case.Eau;
	plateau.cases[19][13] = Type_de_case.Eau;
	plateau.cases[19][14] = Type_de_case.Eau;
	plateau.cases[19][18] = Type_de_case.Rail_horizontal;
	plateau.cases[20][1] = Type_de_case.Rail_horizontal;
	plateau.cases[20][4] = Type_de_case.Eau;
	plateau.cases[20][5] = Type_de_case.Eau;
	plateau.cases[20][6] = Type_de_case.Eau;
	plateau.cases[20][7] = Type_de_case.Eau;
	plateau.cases[20][8] = Type_de_case.Eau;
	plateau.cases[20][9] = Type_de_case.Eau;
	plateau.cases[20][10] = Type_de_case.Eau;
	plateau.cases[20][11] = Type_de_case.Eau;
	plateau.cases[20][12] = Type_de_case.Eau;
	plateau.cases[20][13] = Type_de_case.Eau;
	plateau.cases[20][14] = Type_de_case.Eau;
	plateau.cases[20][18] = Type_de_case.Rail_horizontal;
	plateau.cases[21][1] = Type_de_case.Rail_horizontal;
	plateau.cases[21][4] = Type_de_case.Eau;
	plateau.cases[21][5] = Type_de_case.Eau;
	plateau.cases[21][6] = Type_de_case.Eau;
	plateau.cases[21][7] = Type_de_case.Eau;
	plateau.cases[21][8] = Type_de_case.Eau;
	plateau.cases[21][9] = Type_de_case.Eau;
	plateau.cases[21][10] = Type_de_case.Eau;
	plateau.cases[21][11] = Type_de_case.Eau;
	plateau.cases[21][12] = Type_de_case.Eau;
	plateau.cases[21][13] = Type_de_case.Eau;
	plateau.cases[21][14] = Type_de_case.Eau;
	plateau.cases[21][15] = Type_de_case.Eau;
	plateau.cases[21][18] = Type_de_case.Rail_horizontal;
	plateau.cases[22][1] = Type_de_case.Rail_horizontal;
	plateau.cases[22][4] = Type_de_case.Eau;
	plateau.cases[22][5] = Type_de_case.Eau;
	plateau.cases[22][6] = Type_de_case.Eau;
	plateau.cases[22][7] = Type_de_case.Eau;
	plateau.cases[22][8] = Type_de_case.Eau;
	plateau.cases[22][9] = Type_de_case.Eau;
	plateau.cases[22][10] = Type_de_case.Eau;
	plateau.cases[22][11] = Type_de_case.Eau;
	plateau.cases[22][12] = Type_de_case.Eau;
	plateau.cases[22][13] = Type_de_case.Eau;
	plateau.cases[22][14] = Type_de_case.Eau;
	plateau.cases[22][15] = Type_de_case.Eau;
	plateau.cases[22][18] = Type_de_case.Rail_horizontal;
	plateau.cases[23][1] = Type_de_case.Rail_horizontal;
	plateau.cases[23][4] = Type_de_case.Eau;
	plateau.cases[23][5] = Type_de_case.Eau;
	plateau.cases[23][6] = Type_de_case.Eau;
	plateau.cases[23][7] = Type_de_case.Eau;
	plateau.cases[23][8] = Type_de_case.Eau;
	plateau.cases[23][9] = Type_de_case.Eau;
	plateau.cases[23][10] = Type_de_case.Eau;
	plateau.cases[23][11] = Type_de_case.Eau;
	plateau.cases[23][12] = Type_de_case.Eau;
	plateau.cases[23][13] = Type_de_case.Eau;
	plateau.cases[23][14] = Type_de_case.Eau;
	plateau.cases[23][15] = Type_de_case.Eau;
	plateau.cases[23][18] = Type_de_case.Rail_horizontal;
	plateau.cases[24][1] = Type_de_case.Rail_horizontal;
	plateau.cases[24][4] = Type_de_case.Eau;
	plateau.cases[24][5] = Type_de_case.Eau;
	plateau.cases[24][6] = Type_de_case.Eau;
	plateau.cases[24][7] = Type_de_case.Eau;
	plateau.cases[24][8] = Type_de_case.Eau;
	plateau.cases[24][9] = Type_de_case.Eau;
	plateau.cases[24][10] = Type_de_case.Eau;
	plateau.cases[24][11] = Type_de_case.Eau;
	plateau.cases[24][12] = Type_de_case.Eau;
	plateau.cases[24][13] = Type_de_case.Eau;
	plateau.cases[24][14] = Type_de_case.Eau;
	plateau.cases[24][15] = Type_de_case.Eau;
	plateau.cases[24][18] = Type_de_case.Rail_horizontal;
	plateau.cases[25][1] = Type_de_case.Rail_horizontal;
	plateau.cases[25][3] = Type_de_case.Eau;
	plateau.cases[25][4] = Type_de_case.Eau;
	plateau.cases[25][5] = Type_de_case.Eau;
	plateau.cases[25][6] = Type_de_case.Eau;
	plateau.cases[25][7] = Type_de_case.Eau;
	plateau.cases[25][8] = Type_de_case.Eau;
	plateau.cases[25][9] = Type_de_case.Eau;
	plateau.cases[25][10] = Type_de_case.Eau;
	plateau.cases[25][11] = Type_de_case.Eau;
	plateau.cases[25][12] = Type_de_case.Eau;
	plateau.cases[25][13] = Type_de_case.Eau;
	plateau.cases[25][14] = Type_de_case.Eau;
	plateau.cases[25][15] = Type_de_case.Eau;
	plateau.cases[25][18] = Type_de_case.Rail_horizontal;
	plateau.cases[26][1] = Type_de_case.Rail_horizontal;
	plateau.cases[26][3] = Type_de_case.Eau;
	plateau.cases[26][4] = Type_de_case.Eau;
	plateau.cases[26][5] = Type_de_case.Eau;
	plateau.cases[26][6] = Type_de_case.Eau;
	plateau.cases[26][7] = Type_de_case.Eau;
	plateau.cases[26][8] = Type_de_case.Eau;
	plateau.cases[26][9] = Type_de_case.Eau;
	plateau.cases[26][10] = Type_de_case.Eau;
	plateau.cases[26][11] = Type_de_case.Eau;
	plateau.cases[26][12] = Type_de_case.Eau;
	plateau.cases[26][13] = Type_de_case.Eau;
	plateau.cases[26][14] = Type_de_case.Eau;
	plateau.cases[26][18] = Type_de_case.Rail_horizontal;
	plateau.cases[27][1] = Type_de_case.Rail_horizontal;
	plateau.cases[27][3] = Type_de_case.Eau;
	plateau.cases[27][4] = Type_de_case.Eau;
	plateau.cases[27][5] = Type_de_case.Eau;
	plateau.cases[27][6] = Type_de_case.Eau;
	plateau.cases[27][7] = Type_de_case.Eau;
	plateau.cases[27][8] = Type_de_case.Eau;
	plateau.cases[27][9] = Type_de_case.Eau;
	plateau.cases[27][10] = Type_de_case.Eau;
	plateau.cases[27][11] = Type_de_case.Eau;
	plateau.cases[27][12] = Type_de_case.Eau;
	plateau.cases[27][13] = Type_de_case.Eau;
	plateau.cases[27][14] = Type_de_case.Eau;
	plateau.cases[27][18] = Type_de_case.Rail_horizontal;
	plateau.cases[28][1] = Type_de_case.Rail_horizontal;
	plateau.cases[28][4] = Type_de_case.Eau;
	plateau.cases[28][5] = Type_de_case.Eau;
	plateau.cases[28][6] = Type_de_case.Eau;
	plateau.cases[28][7] = Type_de_case.Eau;
	plateau.cases[28][8] = Type_de_case.Eau;
	plateau.cases[28][9] = Type_de_case.Eau;
	plateau.cases[28][10] = Type_de_case.Eau;
	plateau.cases[28][11] = Type_de_case.Eau;
	plateau.cases[28][12] = Type_de_case.Eau;
	plateau.cases[28][13] = Type_de_case.Eau;
	plateau.cases[28][14] = Type_de_case.Eau;
	plateau.cases[28][17] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[28][18] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[29][1] = Type_de_case.Rail_horizontal;
	plateau.cases[29][5] = Type_de_case.Eau;
	plateau.cases[29][6] = Type_de_case.Eau;
	plateau.cases[29][7] = Type_de_case.Eau;
	plateau.cases[29][8] = Type_de_case.Eau;
	plateau.cases[29][9] = Type_de_case.Eau;
	plateau.cases[29][10] = Type_de_case.Eau;
	plateau.cases[29][11] = Type_de_case.Eau;
	plateau.cases[29][12] = Type_de_case.Eau;
	plateau.cases[29][13] = Type_de_case.Eau;
	plateau.cases[29][17] = Type_de_case.Rail_horizontal;
	plateau.cases[30][1] = Type_de_case.Rail_horizontal;
	plateau.cases[30][5] = Type_de_case.Eau;
	plateau.cases[30][6] = Type_de_case.Eau;
	plateau.cases[30][7] = Type_de_case.Eau;
	plateau.cases[30][8] = Type_de_case.Eau;
	plateau.cases[30][9] = Type_de_case.Eau;
	plateau.cases[30][10] = Type_de_case.Eau;
	plateau.cases[30][11] = Type_de_case.Eau;
	plateau.cases[30][12] = Type_de_case.Eau;
	plateau.cases[30][16] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[30][17] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[31][1] = Type_de_case.Foret;
	plateau.cases[31][2] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[31][6] = Type_de_case.Eau;
	plateau.cases[31][7] = Type_de_case.Eau;
	plateau.cases[31][8] = Type_de_case.Eau;
	plateau.cases[31][9] = Type_de_case.Eau;
	plateau.cases[31][10] = Type_de_case.Eau;
	plateau.cases[31][11] = Type_de_case.Eau;
	plateau.cases[31][12] = Type_de_case.Eau;
	plateau.cases[31][15] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[31][16] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[32][2] = Type_de_case.Rail_horizontal;
	plateau.cases[32][6] = Type_de_case.Eau;
	plateau.cases[32][7] = Type_de_case.Eau;
	plateau.cases[32][8] = Type_de_case.Eau;
	plateau.cases[32][9] = Type_de_case.Eau;
	plateau.cases[32][10] = Type_de_case.Eau;
	plateau.cases[32][11] = Type_de_case.Eau;
	plateau.cases[32][14] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[32][15] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[33][2] = Type_de_case.Rail_horizontal;
	plateau.cases[33][7] = Type_de_case.Eau;
	plateau.cases[33][8] = Type_de_case.Eau;
	plateau.cases[33][9] = Type_de_case.Eau;
	plateau.cases[33][10] = Type_de_case.Eau;
	plateau.cases[33][14] = Type_de_case.Rail_horizontal;
	plateau.cases[34][2] = Type_de_case.Foret;
	plateau.cases[34][3] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[34][12] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[34][13] = Type_de_case.Rail_vertical;
	plateau.cases[34][14] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[35][3] = Type_de_case.Foret;
	plateau.cases[35][4] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[35][12] = Type_de_case.Rail_horizontal;
	plateau.cases[36][4] = Type_de_case.Foret;
	plateau.cases[36][5] = Type_de_case.Rail_vertical;
	plateau.cases[36][6] = Type_de_case.Rail_vertical;
	plateau.cases[36][7] = Type_de_case.Rail_vertical;
	plateau.cases[36][8] = Type_de_case.Rail_vertical;
	plateau.cases[36][9] = Type_de_case.Rail_vertical;
	plateau.cases[36][10] = Type_de_case.Rail_vertical;
	plateau.cases[36][11] = Type_de_case.Rail_vertical;
	plateau.cases[36][12] = Type_de_case.Rail_droite_vers_haut;

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

	// Mise à jour de la liste des cartes
	updateListeCartes();

}

/************************************************************/
// Programme principal
/************************************************************/
// NOTE: rien à modifier ici !
window.addEventListener("load", () => {
	// Appel à la fonction principale
	tchou();
});