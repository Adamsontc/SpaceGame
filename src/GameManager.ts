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

export enum STATE {Loading, Menu, Running, Finished}
/**
 * this class runs our game and manages it
 */
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
    propel: GameAction; //the jetpack 
    shoot: GameAction;
    blast: p5.SoundFile; //gun sound
    restart: GameAction;
    img1: Image;
    img2: Image;
    img3: Image;

    
    /**
     * this constructor initializes different values for each aspect of our game
     */
    constructor() {
        this.img1 = loadImage("assets/images/medallion1.png");
        this.img2 = loadImage("assets/images/blast.png");
        this.img3 = loadImage("assets/images/life1.png");
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
    /**
     * this draws our game
     */
    draw() {
        /**
         * checks to see if the game is running
         */
        switch (this.gameState) {
            /**
             * if it is running, then certain things happen
             */
            case STATE.Running: { 
                /**
                 * sets it to a certian text style
                 * draws the map of out game, and it fills it with
                 * different colors using the RGB scale
                 */
                textStyle()
                this.map.draw();
                text(this.map.lives,45,70);
                fill(150,150,200,150);
                rect(10,10,55,185);
                fill(255,255,255);
                image(this.img1, 15, 15, 32, 32);
	            image(this.img2, 19, 46);
	            image(this.img3, 8, 41, 48, 48);
                /**
                 * sets the size of the text
                 */
                textSize(12);
                /**
                 * the position of the count of lives, medaillions and number of bullets
                 */
                text(this.map.lives,45,70);
                text(this.map.medallions,45,36);
                text(this.map.numBullets,45,53);
                let from = color(255, 0, 0);
                let to = color(0, 255, 0);
                /**
                 * sets the color of the level of fuel the jetpack has
                 * draws the rectangle
                 * and fills it
                 */
                let fuelColor = lerpColor(from, to, Math.trunc(this.map.player.fuel)/Math.trunc(this.map.player.MAX_FUEL));
                fill(150,150,255);
                rect(25,85,25,this.map.player.MAX_FUEL/75);
                fill(fuelColor);
                rect(25,85,25,this.map.player.fuel/75);
                
                break;
            }
            /**
             * draws an overlay which is an menu that has a description of the game
             */
            case STATE.Menu: {
                this.map.draw();
                this.settings.showMenu();
                break;
            }
            /**
             * this is the state of our game which means its loading
             */
            case STATE.Loading: {
                break;
            }
            /**
             * the code is done, not doing anything
             */
            case STATE.Finished: {
                fill(255,0,0);
                rect(0,0,800,600);
                fill(0,0,255);
                rect(30,30,740,540);
                fill(0,0,0);
                rect(60,60,680,480);
                textSize(64);
                fill(227,197,0);
                text("You Win!",265,200);
                textSize(32);
                text("Creators",325,280);
                textSize(16);
                text("Henry Roeth",340,330);
                text("Tristan Adamson",324,405);
                text("Aidan Griffin",340,480);
                text("Reload server to restart!",308,100);
                break;
            }
            default: {
                /**
                 * should never happen
                 */
                break;
            }
        }
    }
    /**
     * this method runs while the game is running and it updates the game
     * as the player plays it
     */
    update() {
        /**
         * checks to see if the game is running
         */
        switch (this.gameState) {
            /**
             * if the game is running then certain actions happen
             */
            case STATE.Running: {
                /**
                 * this.map.update updates the map as the player plays
                 * this.inputManager.checkInput checks to see what keys are being pressed
                 * this.processActions checks to see what action needs to happen, it correlates
                 * with the inputManager
                 */
                this.map.update();
                this.inputManager.checkInput();
                this.processActions();
                break;
            }
            /**
             * it checks to see if the menu is shown
             */
            case STATE.Menu: {
                break;
            }
            /**
             * it checks to see if the game is loading
             */
            case STATE.Loading: {
                /**
                 * if the game is loaded, there are certain key listeners and actions 
                 * that happen
                 */
                if (this.resources.isLoaded()) {
                    /**
                     * this sets up the maps or levels for the game
                     */
                    this.map=new GameMap(this.level,this.resources,this.settings,this);
                    /**
                     * this sets up the music and loads it
                     */
                    this.settings.setMusic(this.resources.getLoad("music"));
                    /**
                     * sets the right arrow key or the "A" key to move right
                     */

                    this.inputManager.setGameAction(this.moveRight,RIGHT_ARROW);
                    this.inputManager.setGameAction(this.moveRight,68);
                    /**
                     * sets the left arrow key or the "D" key to move left
                     */
                    this.inputManager.setGameAction(this.moveLeft,LEFT_ARROW);
                    this.inputManager.setGameAction(this.moveLeft,65);
                     /**
                     * sets the up arrow key or the "W" key to move jump
                     */
                    this.inputManager.setGameAction(this.jump,UP_ARROW);
                    this.inputManager.setGameAction(this.jump,87);
                     /**
                     * sets the "SHIFT" key to thrust or use the jetpack
                     */
                    this.inputManager.setGameAction(this.propel,SHIFT);
                    /**
                     * sets the "SPACE" key to thrust or use the jetpack
                     */
                    this.inputManager.setGameAction(this.shoot,32);
                    /**
                     * sets the "R" key to restart our game
                     */
                    this.inputManager.setGameAction(this.restart,82);

                    /**
                     * sets the old state to running
                     */
                    this.oldState=STATE.Running;
                    /**
                     * sets the game state to menu once the game is restarted
                     */
                    this.gameState=STATE.Menu;
                
                }
                break;
            }
            /**
             * the code is done, not doing anything
             */
            case STATE.Finished: {
                break;
            }
            default: {
                //should never happen
                break;
            }
        }
    }
    /**
    * Processes the player's input actions and updates the game state accordingly.
    */
    processActions() {
        /**
         * gets the players current velocity
         */
        let vel=this.map.player.getVelocity();
        vel.x=0;
        /**
         * if the moveRight is pressed, and the player is in the normal state, set the x velocity to max
         */
        if (this.moveRight.isPressed() && this.map.player.getState()==CreatureState.NORMAL) {
            vel.x=this.map.player.getMaxSpeed();
        }
        /**
         * if the moveLeft is pressed, and the player is in the normal state, set the x velocity to max
         */
        if (this.moveLeft.isPressed() && this.map.player.getState()==CreatureState.NORMAL) {
            vel.x=-this.map.player.getMaxSpeed();
        }
        /**
         * update the players velocity
         */
        this.map.player.setVelocity(vel.x,vel.y);
        /**
         * if the jump is pressed and the player is in the normal state, player will jump
         */
        if (this.jump.isPressed() && this.map.player.getState()==CreatureState.NORMAL) {
            this.map.player.jump(false);
        }
        /**
         * if stop is being pressed, throw an error out
         */
        if (this.stop.isBeginPress()) {
            throw new Error("STOP"); 
        }
        /**
         * if the propel is beginpress and the player is in the normal state and the jetpack
         * has fuel, the jetpack will turn on
         */
        if(this.propel.isBeginPress() && this.map.player.getState()==CreatureState.NORMAL && this.map.player.fuel>0){
                this.map.player.turnOnJetPack();
        }
        /**
         * if the propel is endpress and the player is in the normal state, the jetpack 
         * will turn off
         */
        if(this.propel.isEndPress() && this.map.player.getState()==CreatureState.NORMAL){
            this.map.player.turnOffJetPack();
        }
        /**
         * if shoot is begin press, and the player is in the normal state, and the player
         * has  bullets left, they will shoot bullets
         */
        if(this.shoot.isBeginPress() && this.map.player.getState()==CreatureState.NORMAL && this.map.numBullets>0){
            this.map.playShoot();
            /**
             * get the players current position and current animation name
             */
            let p=this.map.player;
            let pos=p.getPosition();
            let animName = p.getCurrAnimName();
            /**
             * create a new bullet sprite, and it sets its position and direction based on the 
             * players current animation
             */
            let bullet = this.resources.get("blast").clone();
            if (animName.toUpperCase().includes("RIGHT")) {
                bullet.setPosition(pos.x+40,pos.y+25);
                bullet.setRight(true);
            } else {
                bullet.setPosition(pos.x-30,pos.y+25);
                bullet.setRight(false);
            }
            /**
             * subtract the total number of bullets by how many you fired and add the bullet sprite
             * to the map sprites
             */
            this.map.numBullets-=1;
            this.map.sprites.push(bullet);
            console.log(this.map.numBullets);
        }
        if(this.restart.isBeginPress()){
            this.level==0;
            this.map.initialize();
            this.map.medallions=0;
            this.gameState=STATE.Running;
        /**
         * if restart is being pressed and the player is in its normal state
         * restart level
         */
        
        }

    }
    /**
     * this method allows the user to toggle full screen if they choose to do so
     */
    toggleFullScreen() {
        this.settings.toggleFullScreen();
    }
    /**
     * this method allows the user to toggle the begining menu
     */
    toggleMenu() {
        /**
         * the if loop is saying if this.gameState is STATE.Menu
         * then this.gameState equals oldstate
         */
        if (this.gameState==STATE.Menu) {
            this.gameState=this.oldState;
            /**
             * this is saying that if the game state does not equal STATE.Menu, the menu will hide
             * otherwise the menu will show
             * and the game will run until they choose to see the menu again
             */
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