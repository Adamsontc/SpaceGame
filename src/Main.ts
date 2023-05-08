
/**
 * This is a p5.js script (written in TypeScript).  You can read more about
 * p5.js at https://p5js.org.  
 * 
 * The global variables contain all the components/resources for a game.
 * These variables are initiailized in the preload() function.
 * the setup() function runs once and then the draw() function is called
 * multiple times per second while the game is running.
 * 
 * All p5 "hooks" (functions which are called by p5) must be mapped onto
 * the global namespace.  See index.html to see how this is done.
 */

import { Sprite } from "./sprites/Sprite.js";

import { GameManager } from "./GameManager.js";  //handles loading of resources, keeping track and updating the state of everything in the game
import { Image, Renderer } from "p5";

let game: GameManager;
let canvas: Renderer;
let img1,img2,img3: Image;



export function preload() {

	game = new GameManager(); //all resources are loaded via the constructor of the GameManager

	img1 = loadImage("assets/images/medallion1.png");
	img2 = loadImage("assets/images/blast.png");
	img3 = loadImage("assets/images/life1.png");
}

export function setup() {

	frameRate(60);
	canvas=createCanvas(windowWidth,windowHeight);
	canvas.style('display','block');
	canvas.style('padding','0px');
	canvas.style('margin','0px');

	
}
export function draw() {
	background(255); //just for testing purposes.  this probably can be removed when done.
	let scaleFactor=min(width/800,height/600)
	scale(scaleFactor,scaleFactor);
	if (focused) {
		game.update();
	}
	game.draw();
	image(img1, 15, 15, 32, 32);
	image(img2, 19, 46);
	image(img3, 8, 41, 48, 48);
	fill(255);
	stroke(255);
	rect(800,0,width*10,height*10); //a hack to make sure even with scaling only the correct portion of the game will be shown
}


export function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	//canvas.elt.width=800;
	//canvas.elt.height=600;
}

export function keyPressed() {
	if (key=='m') {
		game.toggleMenu();
	}
	if (keyCode==ESCAPE) {
		game.toggleFullScreen();
	}
}

