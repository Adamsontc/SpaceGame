import { Settings } from "./Settings.js";
import { GameAction } from "./GameAction.js";
import { GameMap } from "./GameMap.js";
import { InputManager } from "./InputManager.js";
import { ResourceManager } from "./ResourceManager.js";
import { SoundManager } from "./SoundManager.js";
import { CreatureState } from "./sprites/Creature.js";
import { Overlay } from "./Overlay.js";
import { Image, Renderer } from "p5";

export const GRAVITY: number =  0.002;
const FONT_SIZE: number = 24;

enum STATE {Loading, Menu, Running, Finished}

export class GameManager {
	
    overlay: Overlay;
    resources: ResourceManager;  //the resovoir of all loaded resources
    map: GameMap; //the current state of the game
    inputManager: InputManager; //mappings between user events (keyboard, mouse, etc.) and game actions (run-left, jump, etc.)
    settings: Settings;
    soundManager: SoundManager; //a player for background music and event sounds
    oldState: STATE;
    gameState: STATE; //the different possible states the game could be in (loading, menu, running, finished, etc.)
    level: number;
    ammo: number;
    moveRight: GameAction;
    moveLeft: GameAction;
    jump: GameAction;
    stop: GameAction;
    propel: GameAction;
    shoot: GameAction;
    blast: p5.SoundFile;
    restart: GameAction;
    

    constructor() {
        this.level=0;
        this.ammo = 10;
        this.oldState=STATE.Loading;
        this.gameState=STATE.Loading;
        this.overlay = new Overlay();
        this.resources=new ResourceManager("assets/assets.json");
        this.inputManager = new InputManager();
        this.settings = new Settings();
        this.soundManager = new SoundManager();
        this.moveRight=new GameAction();
        this.moveLeft=new GameAction();
        this.jump=new GameAction();
        this.stop=new GameAction();
        this.propel=new GameAction();
        this.shoot=new GameAction();
        this.restart=new GameAction();
        
    }

    draw() {
        switch (this.gameState) {
            case STATE.Running: {
                textStyle()
                this.map.draw();
                text(this.map.lives,45,70);
                fill(150,150,200,150);
                rect(10,10,55,185);
                fill(255,255,255);
                textSize(12);
                text(this.map.lives,45,70);
                text(this.map.medallions,45,36);
<<<<<<< HEAD
                text(this.map.player.getnumBullets(),45,53);
=======
                text(this.map.numBullets,45,53);
                //Math.trunc(this.map.player.fuel/100)/10
                //text("Fuel",26,65);
>>>>>>> main
                let from = color(255, 0, 0);
                let to = color(0, 255, 0);
                let fuelColor = lerpColor(from, to, Math.trunc(this.map.player.fuel)/Math.trunc(this.map.player.MAX_FUEL));
                fill(150,150,255);
                rect(25,85,25,this.map.player.MAX_FUEL/75);
                fill(fuelColor);
                rect(25,85,25,this.map.player.fuel/75);
                
                break;
            }
            case STATE.Menu: {
                this.map.draw();
                //this.settings.draw();
                this.settings.showMenu();
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
                    this.map=new GameMap(this.level,this.resources,this.settings);
                    this.settings.setMusic(this.resources.getLoad("music"));

                    this.inputManager.setGameAction(this.moveRight,RIGHT_ARROW);
                    this.inputManager.setGameAction(this.moveRight,68);

                    this.inputManager.setGameAction(this.moveLeft,LEFT_ARROW);
                    this.inputManager.setGameAction(this.moveLeft,65);

                    this.inputManager.setGameAction(this.jump,UP_ARROW);
                    this.inputManager.setGameAction(this.jump,87);

                    this.inputManager.setGameAction(this.propel,SHIFT);
                    this.inputManager.setGameAction(this.shoot,32);
                    this.inputManager.setGameAction(this.restart,82);


                    this.oldState=STATE.Running;
                    this.gameState=STATE.Menu;
                
                }
                break;
            }
            case STATE.Finished: {
                break;
            }
            default: {
                //should never happen
                break;
            }
        }
    }

    processActions() {
        let vel=this.map.player.getVelocity();
        vel.x=0;
        if (this.moveRight.isPressed() && this.map.player.getState()==CreatureState.NORMAL) {
            vel.x=this.map.player.getMaxSpeed();
        }
        if (this.moveLeft.isPressed() && this.map.player.getState()==CreatureState.NORMAL) {
            vel.x=-this.map.player.getMaxSpeed();
        }
        this.map.player.setVelocity(vel.x,vel.y);
        if (this.jump.isPressed() && this.map.player.getState()==CreatureState.NORMAL) {
            this.map.player.jump(false);
        }
        if (this.stop.isBeginPress()) {
            throw new Error("STOP"); //for testing purposes only
        }
        if(this.propel.isBeginPress() && this.map.player.getState()==CreatureState.NORMAL && this.map.player.fuel>0){
                this.map.player.turnOnJetPack();
        }
        if(this.propel.isEndPress() && this.map.player.getState()==CreatureState.NORMAL){
            this.map.player.turnOffJetPack();
        }
        if(this.shoot.isBeginPress() && this.map.player.getState()==CreatureState.NORMAL && this.map.numBullets>0){
            this.map.playShoot();
            let p=this.map.player;
            let pos=p.getPosition();
            let animName = p.getCurrAnimName();
            let bullet = this.resources.get("blast").clone();
            if (animName.toUpperCase().includes("RIGHT")) {
                bullet.setPosition(pos.x+40,pos.y+25);
                bullet.setRight(true);
            } else {
                bullet.setPosition(pos.x-30,pos.y+25);
                bullet.setRight(false);
            }
            this.map.numBullets-=1;
            this.map.sprites.push(bullet);
<<<<<<< HEAD
=======
            console.log(this.map.numBullets);
>>>>>>> main
        }
        if(this.restart.isBeginPress() && this.map.player.getState()==CreatureState.NORMAL){
            this.map.player.restartLevel();
        }

    }

    toggleFullScreen() {
        this.settings.toggleFullScreen();
    }

    toggleMenu() {
        if (this.gameState==STATE.Menu) {
            this.gameState=this.oldState;
            if (this.gameState!=STATE.Menu) {
                this.settings.hideMenu();
            } else {
                this.settings.showMenu();
            }
        } else {
            this.oldState=this.gameState;
            this.gameState=STATE.Menu;
            this.settings.showMenu();
        }
    }
}