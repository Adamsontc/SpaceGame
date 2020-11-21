import { timeStamp } from "console";
import { GameAction } from "./GameAction.js";
import { GameMap } from "./GameMap.js";
import { InputManager } from "./InputManager.js";
import { ResourceManager } from "./ResourceManager.js";
import { SoundManager } from "./SoundManager.js";
import { Sprite } from "./Sprite.js";

export const GRAVITY: number = 0.002;
const FONT_SIZE: number = 24;

enum STATE {Loading, Menu, Running, Finished}

export class GameManager {
	
    resources: ResourceManager;  //the resovoir of all loaded resources
    map: GameMap; //the current state of the game
    inputManager: InputManager; //mappings between user events (keyboard, mouse, etc.) and game actions (run-left, jump, etc.)
    soundManager: SoundManager; //a player for background music and event sounds
    gameState: STATE; //the different possible states the game could be in (loading, menu, running, finished, etc.)
    level: number;
    moveRight: GameAction;
    moveLeft: GameAction;
    jump: GameAction;
    stop: GameAction;

    constructor() {
        this.level=0;
        this.gameState=STATE.Loading;
        this.resources=new ResourceManager("assets/assets.json");
        this.inputManager = new InputManager();
        this.soundManager = new SoundManager();
        this.moveRight=new GameAction();
        this.moveLeft=new GameAction();
        this.jump=new GameAction();
        this.stop=new GameAction();
    }

    draw() {
        switch (this.gameState) {
            case STATE.Running: {
                this.map.draw();
                break;
            }
            case STATE.Menu: {
                break;
            }
            case STATE.Loading: {
                break;
            }
            case STATE.Finished: {
                break;
            }
            default: {
                //should never happen
                console.log("IMPOSSIBLE STATE IN GAME");
                break;
            }
        }
    }
    
    update() {
        switch (this.gameState) {
            case STATE.Running: {
                this.map.update();
                this.inputManager.checkInput();
                this.processActions();
                break;
            }
            case STATE.Menu: {
                break;
            }
            case STATE.Loading: {
                if (this.resources.isLoaded()) {
                    //now setup the first map
                    this.map=new GameMap(this.level,this.resources);
                    console.log("Everything is loaded!");
                    this.gameState=STATE.Running;
                    this.inputManager.setGameAction(this.moveRight,RIGHT_ARROW);
                    this.inputManager.setGameAction(this.moveLeft,LEFT_ARROW);
                    this.inputManager.setGameAction(this.jump,32);
                    this.inputManager.setGameAction(this.stop,UP_ARROW); 
                }
                break;
            }
            case STATE.Finished: {
                break;
            }
            default: {
                //should never happen
                console.log("IMPOSSIBLE STATE IN GAME");
                break;
            }
        }
    }

    processActions() {
        if (this.moveRight.isBeginPress()) {
            this.map.player.addVelocity(0.1,0);
        }
        if (this.moveRight.isEndPress()) {
            console.log("end press right");
            this.map.player.addVelocity(-0.1,0);   
        }
        if (this.moveLeft.isBeginPress()) {
            this.map.player.addVelocity(-0.1,0);
        }
        if (this.moveLeft.isEndPress()) {
            console.log("end press left");
            this.map.player.addVelocity(0.1,0);
        }
        if (this.jump.isBeginPress()) {
            console.log("**************************************jumping");
            this.map.player.jump(false);
            //throw new Error("STOP");
        }
        if (this.stop.isBeginPress()) {
            throw new Error("STOP");
        }
    }
}