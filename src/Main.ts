
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

import { Sprite } from "./Sprite.js";

import { GameManager } from "./GameManager.js";  //handles loading of resources, keeping track and updating the state of everything in the game
import { Renderer } from "p5";

let game: GameManager;
let canvas: Renderer;

console.log("**** Loading Script ****");

export function preload() {
	console.log("**** Starting Preload ****");
	game = new GameManager(); //all resources are loaded via the constructor of the GameManager
	console.log("**** Done Preload ****");
}

export function setup() {
	console.log("**** Starting Setup ****");
	frameRate(60);
	canvas=createCanvas(windowWidth,windowHeight);
	//canvas.elt.width=800;
	//canvas.elt.height=600;
	canvas.style('display','block');
	canvas.style('padding','0px');
	canvas.style('margin','0px');
	console.log("**** Done Setup ****");
}
export function draw() {
	background(128); //just for testing purposes.  this probably can be removed when done.
	game.draw();
	game.update();
}


export function windowResized() {
	console.log("**** Window Resized ****");
	resizeCanvas(windowWidth, windowHeight);
	//canvas.elt.width=800;
	//canvas.elt.height=600;
}

console.log("**** Done Loading Script ****");