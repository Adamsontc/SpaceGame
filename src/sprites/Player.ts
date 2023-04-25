import { Vector } from "p5";
import { Creature } from "./Creature.js";
import { Sprite } from "./Sprite.js";

export class Player extends Creature {

    MAX_SPEED:number;
    JUMP_SPEED:number
    onGround:boolean;

    constructor() {
        super();

        this.MAX_SPEED=.5;
        this.JUMP_SPEED=.95 ;

        this.onGround=false;
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
        } if (this.velocity.x<0 && this.currAnimName!="left") {
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
}