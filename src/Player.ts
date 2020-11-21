import { Vector } from "p5";
import { Sprite } from "./Sprite.js";

export class Player extends Sprite {

    MAX_SPEED:Vector;
    JUMP_SPEED:number
    onGround:boolean;

    constructor() {
        super();
        this.MAX_SPEED=createVector(1,1);
        this.JUMP_SPEED=0.4;
        this.onGround=false;
    }

    collideVertical() {
        if (this.velocity.y > 0) {
            this.onGround=true;
        }
        this.velocity.y=0;
    }

    jump(forceJump:boolean) {
        if (this.onGround || forceJump) {
            this.onGround=false;
            this.setVelocity(0,-this.JUMP_SPEED);
            console.log("velocity:",this.velocity);
        }
    }


    addVelocity(x,y) {
        this.velocity.add(x,y);
        if (this.velocity.x>this.MAX_SPEED.x) {
            this.velocity.x=this.MAX_SPEED.x;
        } else if (this.velocity.x<=-this.MAX_SPEED.x) {
            this.velocity.x=-this.MAX_SPEED.x;
        }
        if (this.velocity.y>this.MAX_SPEED.y) {
            this.velocity.y=this.MAX_SPEED.y;
        } else if (this.velocity.y<-this.MAX_SPEED.y) {
            this.velocity.y=-this.MAX_SPEED.y;
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

    update(elapsedTime:number) {
        super.update(elapsedTime); 
    }
}