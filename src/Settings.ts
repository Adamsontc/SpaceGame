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
        this.menu.style("color","#ffffff");
        let music=createCheckbox("Play Music",this.playMusic);
        music.changed(this.togglePlayMusic.bind(this));
        this.menu.child(music);
        let events=createCheckbox("Play Event Sounds",true);
        events.changed(this.toogleEventSounds.bind(this));
        this.menu.child(events);
        this.full = createCheckbox("Full Screen",false);
        console.log("FULL======",this.full);
        this.full.changed(this.toggleFullScreen.bind(this));
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