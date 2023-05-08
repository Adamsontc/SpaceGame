
import { GameMap } from "./GameMap.js";
import { ResourceManager } from "./ResourceManager.js";

const FONT_SIZE: number = 24;


export class Overlay {
	
    resources: ResourceManager;  //the resovoir of all loaded resources
    map: GameMap; //the current state of the game
    level: number;
    ammo: number;
    x: number;
    y: number;

    constructor() {
        this.level=0;
        this.ammo = 10;
        this.resources=new ResourceManager("assets/assets.json");
    }

    draw(){
        text(this.map.lives,45,70);
        fill(150,150,200,150);
        rect(10,10,55,185);
        fill(255,255,255);
        textSize(12);
        text(this.map.lives,45,70);
        text(this.map.medallions,45,36);
        text(this.map.player.getnumBullets(),45,53);
        //Math.trunc(this.map.player.fuel/100)/10
        //text("Fuel",26,65);
        let from = color(255, 0, 0);
        let to = color(0, 255, 0);
        let fuelColor = lerpColor(from, to, Math.trunc(this.map.player.fuel)/Math.trunc(this.map.player.MAX_FUEL));
        fill(150,150,255);
        rect(25,85,25,this.map.player.MAX_FUEL/75);
        fill(fuelColor);
        rect(25,85,25,this.map.player.fuel/75);
    }
}