
import { GameMap } from "./GameMap.js";
import { ResourceManager } from "./ResourceManager.js";

const FONT_SIZE: number = 24;

/**
 * these are all overlays of our game that show
 */
export class Overlay {
	/**
     * the resovoir of all loaded resources
     */
    resources: ResourceManager;  
    /**
     * the current state of the game
     */
    map: GameMap;
    level: number;
    ammo: number;
    x: number;
    y: number;

    constructor() {
        /**
         * this sets the starting level to 0
         */
        this.level=0;
        /**
         * this sets your starting ammo to 10
         */
        this.ammo = 10;
        /**
         * this creates a new ResourceManager and sends it down to the the assets.json file
         */
        this.resources=new ResourceManager("assets/assets.json");
    }

    draw(){
        /**
         * this draws the players remaining lives
         */
        text(this.map.lives,45,70);
        /**
         * draws an rectangle that contains the text of ammo, medaillions and fuel
         */
        fill(150,150,200,150);
        rect(10,10,55,185);
        /**
         * draws text on top of the rectangle that says the amount of ammo you have
         * how many medaillions you have 
         * how much fuel you have
         * and how many lives you have
         */
        fill(255,255,255);
        textSize(12);
        text(this.map.lives,45,70);
        text(this.map.medallions,45,36);
        text(this.map.player.getnumBullets(),45,53);
        /**
         * this creates a rectangle that goes down as you use fuel, but it changes color
         * it goes from green to red depending on the amount of fuel you have
         */
        let from = color(255, 0, 0);
        let to = color(0, 255, 0);
        let fuelColor = lerpColor(from, to, Math.trunc(this.map.player.fuel)/Math.trunc(this.map.player.MAX_FUEL));
        fill(150,150,255);
        rect(25,85,25,this.map.player.MAX_FUEL/75);
        fill(fuelColor);
        rect(25,85,25,this.map.player.fuel/75);
    }
}