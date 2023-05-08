import { SSL_OP_MICROSOFT_SESS_ID_BUG } from "constants";

export class Settings {

    public playMusic: boolean;
    public playEvents: boolean;

    music: p5.SoundFile;


    menu:  p5.Element;
    full: p5.Element;
    
    constructor() {
        this.playMusic=false;
        this.playEvents=true;
        this.menu=createDiv();
        this.menu.style("background-color","rgba(27,212,121,0.60)");
        this.menu.position(30,30);
        this.menu.style("color","#000000");
        let music=createCheckbox("Play Music",this.playMusic);
        music.mousePressed(this.togglePlayMusic.bind(this));
        this.menu.child(music);
        let events=createCheckbox("Play Event Sounds",true);
        events.mousePressed(this.toogleEventSounds.bind(this));
        this.menu.child(events);
        this.full = createCheckbox("Full Screen",false);
        let myDiv = createDiv("W: Jump");
        let myDiv1 = createDiv("A: Left");
        let myDiv2 = createDiv("D: Right");
        let myDiv3 = createDiv("SPACE: Shoot");
        let myDiv4 = createDiv("SHIFT: Thrusters");
        this.full.mousePressed(this.toggleFullScreen.bind(this));
        this.menu.child(this.full);
        this.menu.child(myDiv);
        this.menu.child(myDiv1);
        this.menu.child(myDiv2);
        this.menu.child(myDiv3);
        this.menu.child(myDiv4);
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
        fullscreen(!fullscreen());
    }

    togglePlayMusic() {
        this.playMusic=!this.playMusic;
        if (this.playMusic) {
            this.music.setLoop(true);
            this.music.playMode("restart");
            this.music.play();
        } else {
            this.music.stop();
        }
    }

    setMusic(m:p5.SoundFile) {
        this.music=m;
    }

    toogleEventSounds() {
        this.playEvents=!this.playEvents;
    }
}