
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
/**
 * handles loading of resources, keeping track and updating the state of everything in the game
 */
import { GameManager } from "./GameManager.js";  
import { Image, Renderer } from "p5";

let game: GameManager;
let canvas: Renderer;



/**
 * this function runs before anything is shown to the person
 */
export function preload() {
	/**
	 * all resources are loaded via the constructor of the GameManager
	 */
	game = new GameManager();
}
/**
 * this function sets up our game
 */
export function setup() {
	/**
	 * the number of frames to be produced each second
	 * it creates a canvas related to your window width and height
	 * 
	 */
	frameRate(60);
	canvas=createCanvas(windowWidth,windowHeight);
	/**
 	* Set the display style of the canvas to 'block' so that it fills the entire width of its container
 	*/	
	canvas.style('display', 'block');
	/**
	 * Set the padding of the canvas to 0px so that there is no extra space around it
	 */
	canvas.style('padding', '0px');
	/**
	 * Set the margin of the canvas to 0px so that there is no space between it
	 */
	canvas.style('margin', '0px');

	
}
export function draw() {
	/**
	 * draws the background in a certain color
	 * it sets the background to a certain size
	 * if the game is focused or playable, then it will update
	 * then it draws the images and it fills them with certain colors
	 * then it draws another rectangle to hide things from off screen or 
	 * so it will only show a certain portion of the game
	 */
	background(255); //just for testing purposes.  this probably can be removed when done.
	let scaleFactor=min(width/800,height/600)
	scale(scaleFactor,scaleFactor);
	if (focused) {
		game.update();
	}
	game.draw();
	fill(255);
	stroke(255);
	rect(800,0,width*10,height*10); 
}

/**
 * this function says whether or not you can resize the game to your liking
 */
export function windowResized() {
	/**
	 * you can resize it to your window width and window height if you'd like
	 */
	resizeCanvas(windowWidth, windowHeight);
}
/**
 * this function is a key pressed and if you press a certain key, 
 * then that key does something to the game
 */
export function keyPressed() {
	/**
	 * if the 'm' key is pressed, then toggle menu will be initialized
	 */
	if (key=='m') {
		game.toggleMenu();
	}
	/**
	 * if the 'ESCAPE' key is pressed, then toggle fullscreen will be initialized
	 */
	if (keyCode==ESCAPE) {
		game.toggleFullScreen();
	}
}
