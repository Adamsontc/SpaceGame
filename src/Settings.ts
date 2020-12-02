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
        fill(0,0,0,224);
        stroke("green");
        rect(20,20,800-40,600-40);
    }
}