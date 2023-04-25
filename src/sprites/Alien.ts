import { Sprite } from "./Sprite.js";

/**
 * An alien is a Sprite that is affected by gravity and can die.
 */

export enum AlienState { DEAD, DYING, NORMAL };

export class Alien extends Sprite {

    DIE_TIME = 1000;

    state:AlienState;
    stateTime:number;

    constructor() {
        super();
        this.state=AlienState.NORMAL;
        this.stateTime=0;
    }

    clone() {
         let s = super.clone();
         s.state = this.state;
         s.stateTime = this.stateTime;
         return s;
    }

    getState() {
        return this.state;
    }

    setState(st:AlienState) {
        if (st!=this.state) {
            this.stateTime=0;
            this.state=st;
            if (this.state == AlienState.DYING) {
                this.setVelocity(0,0);
                if (this.currAnimName=="left") {
                    console.log("deadLeft");
                    this.setAnimation("deadLeft");
                }
                if (this.currAnimName=="right") {
                    console.log("deadRight");
                    this.setAnimation("deadRight");
                }
            }
        }
    }

    wakeUp() {
        if (this.getState() == AlienState.NORMAL && this.velocity.x == 0) {
            this.setVelocity(-this.getMaxSpeed(),0);
        }
    }

    getMaxSpeed() {
        return 0;
    }

    update(deltaTime:number) {
        let newAnim=""
        if (this.velocity.x < 0 ) {
            newAnim="left";
        } else if (this.velocity.x > 0) {
            newAnim="right";
        }
        if (newAnim!="" && newAnim!=this.currAnimName) {
            this.setAnimation(newAnim);    
        } else {
            super.update(deltaTime);
        }
        this.stateTime+=deltaTime;
        if (this.state == AlienState.DYING && this.stateTime > this.DIE_TIME) {
            this.setState(AlienState.DEAD);
        }
    }

}

export class Alien1 extends Alien {
    getMaxSpeed() {
        return 0.05;
    }
}

export class Alien2 extends Alien {

    isFlying() {
        return this.state==AlienState.NORMAL;
    }

    getMaxSpeed() {
        return 0.2;
    }
}