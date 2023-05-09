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
        let myDiv6 = createDiv("Welcome to Apollo 18!");
        this.menu.child(myDiv6);
        let music=createCheckbox("Play Music",this.playMusic);
        //music.changed(this.togglePlayMusic.bind(this));
        music.mousePressed(this.togglePlayMusic.bind(this));
        this.menu.child(music);
        let events=createCheckbox("Play Event Sounds",true);
        //events.changed(this.toogleEventSounds.bind(this));
        events.mousePressed(this.toogleEventSounds.bind(this));
        this.menu.child(events);
        this.full = createCheckbox("Full Screen",false);
        let myDiv = createDiv("W or Up: Jump");
        let myDiv1 = createDiv("A  or Left: Left");
        let myDiv2 = createDiv("D or Right: Right");
        let myDiv3 = createDiv("SPACE: Shoot");
        let myDiv4 = createDiv("SHIFT: Thrusters");
        let myDiv5 = createDiv("Objective: Collect all of the medallions on each level to advance to the next. You can collect ammo packs and shoot bullets at enemies. You can also thrust upwards with your jetpack and collect fuel packs to fly longer. If you lose all of you lives you are taken back to the beginning of the game.");
        //myDiv.style('font-size', '18px');
        //myDiv.style('color', '#ff0000');
        //myDiv.position(20, 65);
        console.log("FULL======",this.full);
        //this.full.changed(this.toggleFullScreen.bind(this));
        this.full.mousePressed(this.toggleFullScreen.bind(this));
        this.menu.child(this.full);
        this.menu.child(myDiv);
        this.menu.child(myDiv1);
        this.menu.child(myDiv2);
        this.menu.child(myDiv3);
        this.menu.child(myDiv4);
        this.menu.child(myDiv5);
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
        console.log(this.music);
    }

    toogleEventSounds() {
        this.playEvents=!this.playEvents;
    }
}