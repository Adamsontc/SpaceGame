export class Settings {

    playSounds: boolean;
    playEvents: boolean;
    leftKey: number;
    rightKey: number;
    jumpKey: number;

    constructor() {
        this.playSounds=true;
        this.playEvents=true;
        this.leftKey=LEFT_ARROW;
        this.rightKey=RIGHT_ARROW;
        this.jumpKey=32; //spacebar key
    }

    draw() {
        fill(255,0,0,128);
        stroke("green");
        rect(10,10,800-20,600-20);
    }
}