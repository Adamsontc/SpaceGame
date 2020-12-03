import { SSL_OP_MICROSOFT_SESS_ID_BUG } from "constants";

export class Settings {

    playSounds: boolean;
    playEvents: boolean;

    menu:  p5.Element;
    full: p5.Element;

    constructor() {
        this.playSounds=true;
        this.playEvents=true;
        this.menu=createDiv();
        this.menu.style("background-color","rgba(0,0,0,0.75)");
        this.menu.position(30,30);
        let music=createCheckbox("Play Music",true);
        this.menu.child(music);
        let events=createCheckbox("Play Event Sounds",true);
        this.menu.child(events);
        this.full = createCheckbox("Full Screen",false);
        console.log("FULL======",this.full);
        this.full.changed(this.toggleFullScreen);
        this.menu.child(this.full);
        this.menu.hide();
        
    }

    showMenu() {
        let scaleFactor=min(width/800,height/600);
        this.menu.size(800*scaleFactor-60,600*scaleFactor-60);
        this.menu.show();
    }

    hideMenu() {
        this.menu.hide();
    }

    toggleFullScreen() {
        console.log("in 1");
        fullscreen(!fullscreen());
        console.log("in 2");
        //this.full.value(fullscreen());
        console.log("in 3");
        console.log("fullscreen=",fullscreen());
        console.log("FULL======",this.full);
    }
}