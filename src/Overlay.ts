import { GameMap } from "./GameMap.js";
import { Image, Renderer } from "p5";
import { ResourceManager } from "./ResourceManager.js";
export enum STATE {Loading, Menu, Running, Finished}
export class Overlay {
    resources: ResourceManager;  //the resovoir of all loaded resources
    map: GameMap; //the current state of the game
    oldState: STATE;
    gameState: STATE; //the different possible states the game could be in (loading, menu, running, finished, etc.)
    img1: Image;
    img2: Image;
    img3: Image;
    level: number;
    ammo: number;
    constructor() {
        this.resources=new ResourceManager("assets/assets.json");
        this.img1 = loadImage("assets/images/medallion1.png");
        this.img2 = loadImage("assets/images/blast.png");
        this.img3 = loadImage("assets/images/life1.png");
        this.level=0;
        this.ammo = 10;
        this.oldState=STATE.Loading;
        this.gameState=STATE.Loading;
    }
    draw(){
        if(this.gameState==STATE.Running){
            textStyle()
            this.map.draw();
            text(this.map.lives,45,70);
            fill(150,150,200,150);
            rect(10,10,55,185);
            fill(255,255,255);
            image(this.img1, 15, 15, 32, 32);
            image(this.img2, 19, 46);
            image(this.img3, 8, 41, 48, 48);
            textSize(12);
            text(this.map.lives,45,70);
            text(this.map.medallions,45,36);
            text(this.map.numBullets,45,53);
            let from = color(255, 0, 0);
            let to = color(0, 255, 0);
            let fuelColor = lerpColor(from, to, Math.trunc(this.map.player.fuel)/Math.trunc(this.map.player.MAX_FUEL));
            fill(150,150,255);
            rect(25,85,25,this.map.player.MAX_FUEL/75);
            fill(fuelColor);
            rect(25,85,25,this.map.player.fuel/75);
        }
    }
}