
import './scss/index.scss';//стили
//подключаем графику
import {
	createImage,
	platformImage, playerImage, playerImageLeft, playerCollisionLeft, playerCollisionRight, background, platformSmallImage, platformMini, stoneImage, unit, boss, bossRight, win, winMountain,
	platformImage2, playerImage2, playerImageLeft2, playerCollisionLeft2, playerCollisionRight2, background2, platformSmallImage2, platformMini2, stoneImage2, unit2, boss2, win2, winMountain2,
	platformImage3, playerImage3, playerImageLeft3, playerCollisionLeft3, playerCollisionRight3, background3, platformSmallImage3, platformMini3, stoneImage3, unit3, unitRight3, boss3, bossRight3, win3, winMountain3
} from './images.js';
import { canvas, scoreEl, coinEl, heartEl, numberLevel, bg, winLevel3, scoreWin, coinWin, heartWin, restart } from './htmlElements';//импортируем все дом элементы


const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 590;

//Переменные статистики: Общий счет, Монеты, Жизнь
let score = 0;
let scoreCoins = 0;
let scoreLife = 100;

//для начисления 10 очков за каждые 10 сек игры
let timerLife;

//гравитация player
const gravity = 1.8;

//для остановки анимации
let conditionWin = false;

//параллакс фона
let scrollOffset = 0;

//платформа
class Platform {
	constructor({ x, y, image }) {
		this.position = {
			x,
			y
		};

		this.image = image;

		this.width = image.width;
		this.height = image.height;
	}

	draw() {
		c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
	}
};

//предметы декора
class DecorObjects {
	constructor({ x, y, image }) {
		this.position = {
			x,
			y
		};

		this.image = image;

		this.width = image.width;
		this.height = image.height;
	}

	draw() {
		c.drawImage(this.image, this.position.x, this.position.y);
	}
};

//игрок - Дино
class Player {
	constructor({ image, imageleft, collisionRight, collisionLeft }) {
		this.speed = 10;
		this.position = {
			x: 100,
			y: 100,
		};
		this.movement = {
			x: 0,
			y: 0,
		};
		this.width = 80;
		this.height = 80;
		this.image = image;
		this.frames = 0;

		this.sprites = {
			right: image,
			left: imageleft,
			collision: {
				right: collisionRight,
				left: collisionLeft
			}
		};

		this.currentSprite = this.sprites.right;
	}

	draw() {
		if (this.currentSprite === this.sprites.collision.right || this.currentSprite === this.sprites.collision.left) {
			c.drawImage(this.currentSprite, 175 * this.frames, 0, 171, 175, this.position.x, this.position.y, this.width, this.height);
			return;
		}
		c.drawImage(this.currentSprite, this.position.x, this.position.y, this.width, this.height);
	}

	update() {
		if (this.currentSprite === this.sprites.collision.right || this.currentSprite === this.sprites.collision.left) {
			this.frames++;
			if (this.frames > 15) this.frames = 0;
		}
		this.draw();
		this.position.x += this.movement.x;
		this.position.y += this.movement.y;

		if (this.position.y + this.height + this.movement.y <= canvas.height) {
			this.movement.y += gravity;
		}
	}
}

//монета
class Coin {
	constructor({ x, y }) {
		this.position = {
			x,
			y
		};

		this.width = 35;
		this.height = 35;
		this.image = createImage('./../static/coin.png');
	}

	draw() {
		c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
	}
}

//камни
class Stones {
	constructor({ x, y, image }) {
		this.position = {
			x,
			y
		};

		this.width = 80;
		this.height = 60;
		this.image = image;
	}

	draw() {
		c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
	}
};

//юниты
class Unit {
	constructor({ x, y, maxPos, minPos, image, imageRight }) {
		this.speed = 2;
		this.position = {
			x,
			y
		};
		this.maxPos = maxPos;
		this.minPos = minPos;
		this.image = image;

		this.width = image.width;
		this.height = image.height;

		this.sprites = {
			left: image,
			right: imageRight
		};

		this.currentSprite = this.sprites.left;
	}

	draw() {
		c.drawImage(this.currentSprite, this.position.x, this.position.y, this.width, this.height);
	}

	update() {
		this.draw();
		//аниамция юнитов
		if (this.position.x > this.maxPos) {
			this.currentSprite = this.sprites.left;
			this.speed = - this.speed;
		} else if (this.position.x < this.minPos) {
			this.currentSprite = this.sprites.right;
			this.speed = - this.speed;
		}
		this.position.x += this.speed;
	}
}

//нажата клавиша или нет
const keys = {
	right: {
		pressed: false
	},
	left: {
		pressed: false
	},
	top: {
		pressed: false
	}
};

//конкретный уровень
let level = 1;

//проверка есть ли в локалсторадж уровень, чтобы при перезагрузке не слетало
if (window.localStorage.getItem('level')) {
	level = Number(window.localStorage.getItem('level'));
}

//создаю игрока, платформы, фон, монетки, камни, юнитов
let player;
let platforms = [];
let decorObjects = [];
let coins = [];
let stones = [];
let units = [];

//уровни и их инициализация
let levels = {
	1: {
		init: () => {
			player = new Player({
				image: playerImage,
				imageleft: playerImageLeft,
				collisionLeft: playerCollisionLeft,
				collisionRight: playerCollisionRight
			});

			decorObjects = [
				new DecorObjects({
					x: -1,
					y: -1,
					image: background
				}),
				new DecorObjects({
					x: 7240,
					y: 300,
					image: win
				}),
				new DecorObjects({
					x: 7260,
					y: 300,
					image: winMountain
				}),
			];

			platforms = [
				//mini
				new Platform({
					x: 2273,
					y: 400,
					image: platformMini
				}),
				new Platform({
					x: 4820,
					y: 400,
					image: platformMini
				}),
				new Platform({
					x: 8524,
					y: 400,
					image: platformMini
				}),
				new Platform({
					x: 8778,
					y: 350,
					image: platformMini
				}),
				new Platform({
					x: 9030,
					y: 300,
					image: platformMini
				}),
				new Platform({
					x: 9320,
					y: 350,
					image: platformMini
				}),
				new Platform({
					x: 10067,
					y: 350,
					image: platformMini
				}),
				//высокие
				new Platform({
					x: 4008,
					y: 450,
					image: platformSmallImage
				}),
				new Platform({
					x: 5736,
					y: 450,
					image: platformSmallImage
				}),
				new Platform({
					x: 5987,
					y: 450,
					image: platformSmallImage
				}),
				//длинные
				new Platform({
					x: -1,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 565,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 1230,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 1998,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 2664,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 3330,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 4153,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 5070,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 6240,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 6806,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 7552,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 8250,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 8816,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 9382,
					y: 500,
					image: platformImage
				}),
				new Platform({
					x: 10350,
					y: 500,
					image: platformImage
				}),
			];

			coins = [
				new Coin({
					x: 600,
					y: 450
				}),
				new Coin({
					x: 820,
					y: 450
				}),
				new Coin({
					x: 1700,
					y: 450
				}),
				new Coin({
					x: 2330,
					y: 350
				}),
				new Coin({
					x: 2800,
					y: 450
				}),
				new Coin({
					x: 3500,
					y: 450
				}),
				new Coin({
					x: 3940,
					y: 350
				}),
				new Coin({
					x: 4875,
					y: 350
				}),
				new Coin({
					x: 5795,
					y: 400
				}),
				new Coin({
					x: 6045,
					y: 400
				}),
				new Coin({
					x: 8850,
					y: 450
				}),
				new Coin({
					x: 9000,
					y: 450
				}),
				new Coin({
					x: 9150,
					y: 450
				}),
				new Coin({
					x: 9300,
					y: 450
				}),
				new Coin({
					x: 9450,
					y: 450
				}),
			];

			stones = [
				new Stones({
					x: 700,
					y: 443,
					image: stoneImage
				}),
				new Stones({
					x: 3000,
					y: 443,
					image: stoneImage
				}),
				new Stones({
					x: 7000,
					y: 443,
					image: stoneImage
				}),
			];

			units = [
				new Unit({
					x: 1700,
					y: 443,
					maxPos: 1750,
					minPos: 1250,
					image: unit,
					imageRight: unit
				}),
				new Unit({
					x: 2450,
					y: 443,
					maxPos: 2500,
					minPos: 2000,
					image: unit,
					imageRight: unit
				}),
				new Unit({
					x: 4450,
					y: 443,
					maxPos: 4650,
					minPos: 4180,
					image: unit,
					imageRight: unit
				}),
				new Unit({
					x: 6450,
					y: 443,
					maxPos: 6940,
					minPos: 6250,
					image: unit,
					imageRight: unit
				}),
				new Unit({
					x: 8450,
					y: 443,
					maxPos: 9100,
					minPos: 8250,
					image: unit,
					imageRight: unit
				}),
				new Unit({
					x: 9800,
					y: 408,
					maxPos: 9850,
					minPos: 9300,
					image: boss,
					imageRight: bossRight
				}),
			];

			//обнуляем счет
			score = 0;
			scoreEl.innerHTML = score;

			//обнуляем счет монеток
			scoreCoins = 0;
			coinEl.innerHTML = scoreCoins;

			//восстанавливаем хп
			scoreLife = 100;
			heartEl.innerHTML = scoreLife;

			//начисляем 10 очков за каждые 10 секунд игры
			timerLife = setInterval(() => {
				score += 10;
				scoreEl.innerHTML = score;
			}, 10000);

			scrollOffset = 0;
		}
	},
	2: {
		init: () => {
			player = new Player({
				image: playerImage2,
				imageleft: playerImageLeft2,
				collisionLeft: playerCollisionLeft2,
				collisionRight: playerCollisionRight2
			});

			decorObjects = [
				new DecorObjects({
					x: -2,
					y: -1,
					image: background2
				}),
				new DecorObjects({
					x: 7230,
					y: 300,
					image: win2
				}),
				new DecorObjects({
					x: 7260,
					y: 300,
					image: winMountain2
				}),
			];

			platforms = [
				//mini
				new Platform({
					x: 2804,
					y: 400,
					image: platformMini2
				}),
				new Platform({
					x: 3262,
					y: 350,
					image: platformMini2
				}),
				new Platform({
					x: 6318,
					y: 350,
					image: platformMini2
				}),
				new Platform({
					x: 7275,
					y: 350,
					image: platformMini2
				}),
				new Platform({
					x: 9228,
					y: 350,
					image: platformMini2
				}),
				//высокие
				new Platform({
					x: 1452,
					y: 450,
					image: platformSmallImage2
				}),
				new Platform({
					x: 1752,
					y: 450,
					image: platformSmallImage2
				}),
				new Platform({
					x: 6070,
					y: 450,
					image: platformSmallImage2
				}),
				new Platform({
					x: 6573,
					y: 450,
					image: platformSmallImage2
				}),
				new Platform({
					x: 6973,
					y: 450,
					image: platformSmallImage2
				}),
				//длинные
				new Platform({
					x: -1,
					y: 500,
					image: platformImage2
				}),
				new Platform({
					x: 650,
					y: 500,
					image: platformImage2
				}),
				new Platform({
					x: 2053,
					y: 500,
					image: platformImage2
				}),
				new Platform({
					x: 3059,
					y: 500,
					image: platformImage2
				}),
				new Platform({
					x: 3709,
					y: 500,
					image: platformImage2
				}),
				new Platform({
					x: 4566,
					y: 500,
					image: platformImage2
				}),
				new Platform({
					x: 5217,
					y: 500,
					image: platformImage2
				}),
				new Platform({
					x: 7600,
					y: 500,
					image: platformImage2
				}),
				new Platform({
					x: 8435,
					y: 500,
					image: platformImage2
				}),
				new Platform({
					x: 9500,
					y: 500,
					image: platformImage2
				}),
				new Platform({
					x: 10340,
					y: 500,
					image: platformImage2
				}),
			];

			coins = [
				new Coin({
					x: 900,
					y: 450
				}),
				new Coin({
					x: 1000,
					y: 450
				}),
				new Coin({
					x: 1100,
					y: 450
				}),
				new Coin({
					x: 1510,
					y: 400
				}),
				new Coin({
					x: 1810,
					y: 400
				}),
				new Coin({
					x: 2860,
					y: 350
				}),
				new Coin({
					x: 3320,
					y: 300
				}),
				new Coin({
					x: 4450,
					y: 300
				}),
				new Coin({
					x: 6130,
					y: 400
				}),
				new Coin({
					x: 6375,
					y: 300
				}),
				new Coin({
					x: 6630,
					y: 400
				}),
				new Coin({
					x: 7030,
					y: 400
				}),
				new Coin({
					x: 7330,
					y: 300
				}),
				new Coin({
					x: 9285,
					y: 300
				}),
			];

			stones = [
				new Stones({
					x: 760,
					y: 444,
					image: stoneImage2
				}),
				new Stones({
					x: 3800,
					y: 444,
					image: stoneImage2
				}),
				new Stones({
					x: 5500,
					y: 444,
					image: stoneImage2
				}),
				new Stones({
					x: 7900,
					y: 444,
					image: stoneImage2
				}),
			];

			units = [
				new Unit({
					x: 2450,
					y: 443,
					maxPos: 2650,
					minPos: 2050,
					image: unit2,
					imageRight: unit2
				}),
				new Unit({
					x: 3150,
					y: 443,
					maxPos: 3750,
					minPos: 3060,
					image: unit2,
					imageRight: unit2
				}),
				new Unit({
					x: 4000,
					y: 443,
					maxPos: 4300,
					minPos: 3890,
					image: unit2,
					imageRight: unit2
				}),
				new Unit({
					x: 4700,
					y: 443,
					maxPos: 5400,
					minPos: 4560,
					image: unit2,
					imageRight: unit2
				}),
				new Unit({
					x: 8600,
					y: 443,
					maxPos: 9000,
					minPos: 8450,
					image: unit2,
					imageRight: unit2
				}),
				new Unit({
					x: 9600,
					y: 408,
					maxPos: 10050,
					minPos: 9500,
					image: boss2,
					imageRight: unit2
				}),
			];

			//восстанавливаем хп
			scoreLife = 100;
			heartEl.innerHTML = scoreLife;

			//начисляем 10 очков за каждые 10 секунд игры
			timerLife = setInterval(() => {
				score += 10;
				scoreEl.innerHTML = score;
			}, 10000);

			scrollOffset = 0;
		}
	},
	3: {
		init: () => {
			player = new Player({
				image: playerImage3,
				imageleft: playerImageLeft3,
				collisionLeft: playerCollisionLeft3,
				collisionRight: playerCollisionRight3
			});

			decorObjects = [
				new DecorObjects({
					x: -16,
					y: -17,
					image: background3
				}),
				new DecorObjects({
					x: 7220,
					y: 300,
					image: win3
				}),
				new DecorObjects({
					x: 7250,
					y: 300,
					image: winMountain3
				}),
			];

			platforms = [
				//mini
				new Platform({
					x: 753,
					y: 350,
					image: platformMini3
				}),
				new Platform({
					x: 1024,
					y: 400,
					image: platformMini3
				}),
				new Platform({
					x: 2709,
					y: 350,
					image: platformMini3
				}),
				new Platform({
					x: 3009,
					y: 300,
					image: platformMini3
				}),
				new Platform({
					x: 3360,
					y: 300,
					image: platformMini3
				}),
				new Platform({
					x: 5917,
					y: 400,
					image: platformMini3
				}),
				new Platform({
					x: 6169,
					y: 350,
					image: platformMini3
				}),
				new Platform({
					x: 6419,
					y: 300,
					image: platformMini3
				}),
				new Platform({
					x: 6529,
					y: 300,
					image: platformMini3
				}),

				//высокие
				new Platform({
					x: 2107,
					y: 450,
					image: platformSmallImage3
				}),
				new Platform({
					x: 2410,
					y: 450,
					image: platformSmallImage3
				}),
				new Platform({
					x: 3710,
					y: 450,
					image: platformSmallImage3
				}),
				new Platform({
					x: 4816,
					y: 450,
					image: platformSmallImage3
				}),
				new Platform({
					x: 6870,
					y: 450,
					image: platformSmallImage3
				}),
				new Platform({
					x: 8726,
					y: 450,
					image: platformSmallImage3
				}),
				new Platform({
					x: 8976,
					y: 450,
					image: platformSmallImage3
				}),
				new Platform({
					x: 9229,
					y: 450,
					image: platformSmallImage3
				}),
				//длинные
				new Platform({
					x: -1,
					y: 500,
					image: platformImage3
				}),
				new Platform({
					x: 1305,
					y: 500,
					image: platformImage3
				}),
				new Platform({
					x: 4012,
					y: 500,
					image: platformImage3
				}),
				new Platform({
					x: 5116,
					y: 500,
					image: platformImage3
				}),
				new Platform({
					x: 7172,
					y: 500,
					image: platformImage3
				}),
				new Platform({
					x: 7974,
					y: 500,
					image: platformImage3
				}),
				new Platform({
					x: 9500,
					y: 500,
					image: platformImage3
				}),
				new Platform({
					x: 10332,
					y: 500,
					image: platformImage3
				}),
			];

			coins = [
				new Coin({
					x: 810,
					y: 300
				}),
				new Coin({
					x: 1080,
					y: 350
				}),
				new Coin({
					x: 2165,
					y: 400
				}),
				new Coin({
					x: 2465,
					y: 400
				}),
				new Coin({
					x: 2765,
					y: 300
				}),
				new Coin({
					x: 3065,
					y: 250
				}),
				new Coin({
					x: 3415,
					y: 250
				}),
				new Coin({
					x: 3765,
					y: 400
				}),
				new Coin({
					x: 4875,
					y: 400
				}),
				new Coin({
					x: 5975,
					y: 350
				}),
				new Coin({
					x: 6225,
					y: 300
				}),
				new Coin({
					x: 6455,
					y: 250
				}),
				new Coin({
					x: 6600,
					y: 250
				}),
				new Coin({
					x: 6928,
					y: 400
				}),
				new Coin({
					x: 8785,
					y: 400
				}),
				new Coin({
					x: 9030,
					y: 400
				}),
				new Coin({
					x: 9285,
					y: 400
				}),
			];

			stones = [
				new Stones({
					x: 1750,
					y: 442,
					image: stoneImage3
				}),
				new Stones({
					x: 8300,
					y: 442,
					image: stoneImage3
				}),
			];

			units = [
				new Unit({
					x: 1500,
					y: 443,
					maxPos: 1680,
					minPos: 1300,
					image: unit3,
					imageRight: unitRight3
				}),
				new Unit({
					x: 4100,
					y: 443,
					maxPos: 4570,
					minPos: 4000,
					image: unit3,
					imageRight: unitRight3
				}),
				new Unit({
					x: 5350,
					y: 443,
					maxPos: 5700,
					minPos: 5100,
					image: unit3,
					imageRight: unitRight3
				}),
				new Unit({
					x: 7300,
					y: 443,
					maxPos: 7750,
					minPos: 7200,
					image: unit3,
					imageRight: unitRight3
				}),
				new Unit({
					x: 9800,
					y: 380,
					maxPos: 10050,
					minPos: 9500,
					image: boss3,
					imageRight: bossRight3
				}),
			];

			//восстанавливаем хп
			scoreLife = 100;
			heartEl.innerHTML = scoreLife;

			//начисляем 10 очков за каждые 10 секунд игры
			timerLife = setInterval(() => {
				score += 10;
				scoreEl.innerHTML = score;
			}, 10000);

			scrollOffset = 0;
		}
	}
};

//функция, которая сработает при выигрыше и переходе на другой уровень
function winGame() {
	if (level === 3) {
		conditionWin = true;
		scoreWin.innerHTML = score;
		coinWin.innerHTML = scoreCoins;
		heartWin.innerHTML = scoreLife;
		bg.style.opacity = 1;
		winLevel3.style.opacity = 1;
		window.localStorage.removeItem('level');

		return true;
	}

	conditionWin = true;
	level++;
	bg.style.opacity = 1;
	numberLevel.innerHTML = `level ${level}`;
	window.localStorage.setItem('level', level);

	setTimeout(() => {
		numberLevel.innerHTML = '';
		bg.style.opacity = 0;
		conditionWin = false;
		levels[level].init();
		animate();
	}, 2000);
};

//функция нахождения столкновений игрока с препятствиями и юнитами
function collision(obj1, obj2, str) {
	//столкновение слева
	if (
		(obj1.position.x + obj1.width - 10 >= obj2.position.x) &&
		(obj1.position.x + obj1.width <= obj2.position.x + obj2.width) &&
		(obj1.position.y + obj1.height >= obj2.position.y)
	) {
		obj1.currentSprite = obj1.sprites.collision.right;
		setTimeout(() => {
			obj1.currentSprite = obj1.sprites.right;
		}, 2000);

		if (str === 'stone') {
			obj1.position.x -= 30;
		} else if (str === 'unit') {
			if (obj2.image === unit || obj2.image === unit2 || obj2.image === unit3) {
				obj1.position.x -= 80;
				scoreLife -= 20;
				heartEl.innerHTML = scoreLife;

			} else if (obj2.image === boss || obj2.image === boss2 || obj2.image === boss3) {
				obj1.position.x -= 80;
				scoreLife -= 50;
				heartEl.innerHTML = scoreLife;
			}
		}

		//столкновение справа
	} else if (
		(obj1.position.x + 10 <= obj2.position.x + obj2.width) &&
		(obj1.position.x > obj2.position.x) &&
		(obj1.position.y + obj1.height >= obj2.position.y)
	) {

		obj1.currentSprite = obj1.sprites.collision.left;
		setTimeout(() => {
			obj1.currentSprite = obj1.sprites.left;
		}, 3000);

		if (str === 'stone') {
			obj1.position.x += 30;
		} else if (str === 'unit') {
			if (obj2.image === unit || obj2.image === unit2 || obj2.image === unit3) {
				obj1.position.x += 80;

				scoreLife -= 20;
				heartEl.innerHTML = scoreLife;

			} else if (obj2.image === boss || obj2.image === boss2 || obj2.image === boss3) {
				obj1.position.x += 80;
				scoreLife -= 50;
				heartEl.innerHTML = scoreLife;
			}
		}
	} else {
		return false;
	}
};

//перепрыгул игрок препятствие или нет
function jumped(obj1, obj2, str) {
	if (
		(obj1.position.x > obj2.position.x + obj2.width) &&
		(obj1.position.x < obj2.position.x + obj2.width + 11) &&
		(keys.right.pressed)
	) {
		if (str === 'stone') {
			score += 10;
		} else if (str === 'unit') {
			score += 30;
		}
		scoreEl.innerHTML = score;
	}
};

//функция отрисовки всей графики
function drawGame() {
	//отрисовываем весь декор
	decorObjects.forEach((decorObject) => {
		decorObject.draw();
	});

	//отрисовываем платформы
	platforms.forEach((platform) => {
		platform.draw();
	});

	//отрисовываем монетки, а также проверяем столкновение с монеткой и ее удаляем
	for (let i = coins.length - 1; i >= 0; i--) {
		const coin = coins[i];
		coin.draw();
		if (Math.hypot(
			coin.position.x - player.position.x,
			coin.position.y - player.position.y) < (coin.width / 2 + player.width / 2)
		) {
			coins.splice(i, 1);
			scoreCoins += 10;
			coinEl.innerHTML = scoreCoins;
		}
	};

	//отрисовываем камни
	stones.forEach((stone) => {
		stone.draw();
		collision(player, stone, 'stone');
		jumped(player, stone, 'stone');
	});

	//отрисовываем юнитов
	units.forEach((unit) => {
		unit.update();
		collision(player, unit, 'unit');
		jumped(player, unit, 'unit');
	});
}

//АНИМАЦИЯ ИГРЫ
function animate() {
	if (conditionWin) return;

	requestAnimationFrame(animate);

	c.fillStyle = 'black';
	c.fillRect(0, 0, canvas.width, canvas.height);

	//отрисовываем всю графику
	drawGame();
	player.update();

	//передвижение вправо и влево
	if (keys.right.pressed && player.position.x < 400) {
		player.movement.x = player.speed;
	} else if ((keys.left.pressed && player.position.x > 100) || keys.left.pressed && scrollOffset === 0 && player.position.x > 0) {
		player.movement.x = -player.speed;
	} else {
		player.movement.x = 0;

		if (keys.right.pressed) {
			scrollOffset += 1;

			if (scrollOffset < decorObjects[0].position.x + decorObjects[0].width - 350) {
				//двигаем платформы, фон, камни, юнитов, монетки влево при движении вправо
				platforms.forEach((platform) => {
					platform.position.x -= player.speed;
				});

				decorObjects.forEach((decorObject) => {
					decorObject.position.x -= player.speed * 0.66;
				});

				coins.forEach((coin) => {
					coin.position.x -= player.speed;
				});

				stones.forEach((stone) => {
					stone.position.x -= player.speed;
				});

				units.forEach((unit) => {
					unit.position.x -= player.speed;
					unit.minPos -= player.speed;
					unit.maxPos -= player.speed;
				});

			} else if (scrollOffset > decorObjects[0].position.x + decorObjects[0].width - 350) {
				player.movement.x = player.speed;
			}

		} else if (keys.left.pressed && scrollOffset > 0) {
			scrollOffset -= 1;

			//двигаем платформы, фон, камни, юнитов, монетки вправо при движении влево
			platforms.forEach((platform) => {
				platform.position.x += player.speed;
			});

			decorObjects.forEach((decorObject) => {
				decorObject.position.x += player.speed * 0.66;
			});

			coins.forEach((coin) => {
				coin.position.x += player.speed;
			});

			stones.forEach((stone) => {
				stone.position.x += player.speed;
			});

			units.forEach((unit) => {
				unit.position.x += player.speed;
				unit.minPos += player.speed;
				unit.maxPos += player.speed;
			});
		}

	};

	//отслеживание столкновений c платформой, чтобы при попадании на нее, он оставался на ней, а иначе падал
	platforms.forEach((platform) => {
		if (
			(player.position.y + player.height <= platform.position.y) &&
			(player.position.y + player.height + player.movement.y >= platform.position.y) &&
			(player.position.x + player.width >= platform.position.x) &&
			(player.position.x <= platform.position.x + platform.width)
		) {
			player.movement.y = 0
		}
	});

	//условие проигрыша
	if (player.position.y > canvas.height || scoreLife === 0) {
		clearInterval(timerLife);
		levels[level].init();
	}

	//условие победы в уровне
	if (player.position.x + player.width >= decorObjects[2].position.x && player.movement.y === 0 && level <= 3) {
		winGame();
	}
};

//Инициализируем уровень
levels[level].init();

//запускаем анимацию
animate();


//прослушивание событий
//нажатие клавиш wsda
addEventListener('keydown', ({ keyCode }) => {
	if (keyCode === 65 || keyCode === 37) {
		keys.left.pressed = true;
		player.currentSprite = player.sprites.left;
	} else if (keyCode === 68 || keyCode === 39) {
		keys.right.pressed = true;
		player.currentSprite = player.sprites.right;
	} else if (keyCode === 87 || keyCode === 38) {
		if (event.repeat) return;
		keys.top.pressed = true;
		player.movement.y -= 25;
	}
});

//отпускание клавиш
addEventListener('keyup', ({ keyCode }) => {
	if (keyCode === 65 || keyCode === 37) {
		keys.left.pressed = false;
	} else if (keyCode === 68 || keyCode === 39) {
		keys.right.pressed = false;
	} else if (keyCode === 87 || keyCode === 38) {
		keys.top.pressed = false;
	}
});

//обработчик кнопки рестарта игры
restart.addEventListener('click', () => {
	level = 1;
	conditionWin = false;
	numberLevel.innerHTML = '';
	bg.style.opacity = 0;
	winLevel3.style.opacity = 0;
	levels[level].init();
	animate();
});