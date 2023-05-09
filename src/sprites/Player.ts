import { Vector } from "p5";
import { Creature, CreatureState } from "./Creature.js";
import { Sprite } from "./Sprite.js";

export class Player extends Creature {

    MAX_SPEED:number;
    JUMP_SPEED:number
    MAX_FUEL:number;
    onGround:boolean;
    jetPackOn:boolean;
    thrusterAmount:number;
    fuel:number;
    numBullets: number;
    lives: number;
    

    constructor() {
        super();
        this.MAX_FUEL=7500;
        this.MAX_SPEED=0.35;
        this.JUMP_SPEED=0.80;
        this.thrusterAmount=0.003;
        this.fuel=7500;
        this.numBullets = 3;
        this.lives = 3;
        this.onGround=false;
        this.jetPackOn=false;
    }

    getThursterAmount():number {
        if (this.jetPackOn) {
            this.fuel-=this.thrusterAmount;
            return this.thrusterAmount
        }
        return 0.0;
    }
    
    getLives():number{
        return this.lives;
    }
    isJetPackOn():boolean {
        return this.jetPackOn;
    }

    getMaxSpeed():number {
        return this.MAX_SPEED;
    }

    getnumBullets():number {
        return this.numBullets;
    }

    collideVertical() {
        if (this.velocity.y > 0) {
            this.onGround=true;
        }
        this.velocity.y=0;
    }

    collideHorizontal() {
        this.velocity.x=0;
    }

    restartLevel(){
        this.state=CreatureState.DEAD;
    }

    jump(forceJump:boolean) {
        if (this.onGround || forceJump) {
            this.onGround=false;
            this.setVelocity(0,-this.JUMP_SPEED);
        }
    }

    


    setPosition(x:number, y:number) {
        //check if falling
        if (Math.round(y) > Math.round(this.position.y)) {
            this.onGround=false;
        }
        super.setPosition(x,y);
    }

    addVelocity(x:number,y:number) {
        this.velocity.add(x,y);
        if (this.velocity.x>this.MAX_SPEED) {
            this.velocity.x=this.MAX_SPEED;
        } else if (this.velocity.x<=-this.MAX_SPEED) {
            this.velocity.x=-this.MAX_SPEED;
        }
        if (this.velocity.y>this.MAX_SPEED) {
            this.velocity.y=this.MAX_SPEED;
        } else if (this.velocity.y<-this.MAX_SPEED) {
            this.velocity.y=-this.MAX_SPEED;
        }
    }

    clone() {
        let p = new Player();
        p.position = this.position.copy();
        p.velocity = this.velocity.copy();
        p.animations={}; //throw away the animations from the new constructor call
        //and copy over the animations from this
        for (const key in this.animations) {
            if (Object.prototype.hasOwnProperty.call(this.animations, key)) {
                const element = this.animations[key];
                p.animations[key]=element.clone();
            }
        }
        p.currAnimName = this.currAnimName;
        p.currAnimation = p.animations[p.currAnimName];
        p.MAX_SPEED=this.MAX_SPEED;
        return p;
    }

    turnOnJetPack(){
        this.jetPackOn=true;
        this.onGround=false;
    }

    useFuel(){
        if(this.jetPackOn){
            this.fuel-=deltaTime;
        }
        if(this.fuel<=0){
            this.fuel=0;
            this.jetPackOn=false;
        }
    }

    turnOffJetPack(){
        this.jetPackOn=false;
    }
    
    changeMaxSpeed(speed: number){
        this.MAX_SPEED=speed;
    }

    changeJumpSpeed(speed: number){
        this.JUMP_SPEED=speed;
    }
    update(deltaTime:number) {
        let newAnim="";
        if (this.state==CreatureState.NORMAL) {
            this.useFuel();
            if (this.velocity.x<0) {
                if (this.jetPackOn) {
                    newAnim="jetLeft";
                } else {
                    newAnim="left";
                }
            } else if (this.velocity.x>0) {
                if (this.jetPackOn) {
                    newAnim="jetRight";
                } else {
                    newAnim="right";
                }
            } else {
                if (this.jetPackOn) {
                    if (this.currAnimName.toUpperCase().includes("LEFT")) {
                        newAnim="jetLeft";
                    } else {
                        newAnim="jetRight";
                    }
                } else {
                    if (this.currAnimName.toUpperCase().includes("LEFT")) {
                        newAnim="stillLeft";
                    } else {
                        newAnim="stillRight";
                    }
                }
            }
    }
        if (newAnim!="" && newAnim!=this.currAnimName) {
            this.setAnimation(newAnim);    
        } else {
            this.updateAnimation(deltaTime);
        }
        this.stateTime+=deltaTime;
        if (this.state == CreatureState.DYING && this.stateTime > this.DIE_TIME) {
            this.setState(CreatureState.DEAD);
        }
    }
}