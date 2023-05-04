import { Vector } from "p5";
import { Creature, CreatureState } from "./Creature.js";
import { Sprite } from "./Sprite.js";

export class Player extends Creature {

    MAX_SPEED:number;
    JUMP_SPEED:number
    onGround:boolean;
    jetPackOn:boolean;
    

    constructor() {
        super();
        this.MAX_SPEED=0.35;
        this.JUMP_SPEED=0.95;
        this.onGround=false;
        this.jetPackOn=false;
    }

    getMaxSpeed() {
        return this.MAX_SPEED;
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

    jump(forceJump:boolean) {
        if (this.onGround || forceJump) {
            this.onGround=false;
            this.setVelocity(0,-this.JUMP_SPEED);
        }
    }

    fly(forceJump:boolean) {
        if (this.onGround || forceJump) {
            this.onGround=false;
            let currVel=this.getVelocity();
            this.setVelocity(currVel.x,-this.JUMP_SPEED);
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
        if (this.velocity.x>0 && this.currAnimName!="right") {
            this.setAnimation("right");
        }
        if (this.velocity.x<0 && this.currAnimName!="left") {
            this.setAnimation("left");
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
        let newAnim=""
        if(!this.jetPackOn){
            if (this.velocity.x < 0 ) {
                newAnim="left";
                console.log("LEFT");
            } else if (this.velocity.x > 0) {
                newAnim="right";
                console.log("RIGHT");
            } else if (this.velocity.x == 0 && this instanceof Player) {
                if (this.currAnimName=="left") {
                    console.log("stillLeft");
                    newAnim="stillLeft";
                } else if (this.currAnimName=="right") {
                    console.log("stillRight");
                    newAnim="stillRight";
                }
            }
        }
        else {
            if(this.currAnimName=="left"||this.currAnimName=="stillLeft" && this.velocity.y<0){
                newAnim="jetLeft";
            }
            else if(this.currAnimName=="right"||this.currAnimName=="stillRight" && this.velocity.y<0){
                newAnim="jetRight";
            }
        }
        if (newAnim!="" && newAnim!=this.currAnimName) {
            this.setAnimation(newAnim);    
        } else {
            super.update(deltaTime);
        }
        this.stateTime+=deltaTime;
        if (this.state == CreatureState.DYING && this.stateTime > this.DIE_TIME) {
            this.setState(CreatureState.DEAD);
        }
    }
}