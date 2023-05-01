import { Player } from "./sprites/Player.js";
import { ResourceManager } from "./ResourceManager.js";
import { Sprite } from "./sprites/Sprite.js";
import { GRAVITY } from './GameManager.js';
import { Creature, CreatureState, Grub } from "./sprites/Creature.js";
import { Heart, Music, PowerUp, Star } from "./sprites/PowerUp.js";
import { Settings } from "./Settings.js";

export class GameMap {

    tiles: p5.Image[][];
    tile_size:number;
    sprites: Sprite[];
    player: Player;
    background: p5.Image[];
    width: number; //height and width in tiles
    height: number;
    level: number;
    resources: ResourceManager;
    settings: Settings;
    prize: p5.SoundFile;
    music: p5.SoundFile;
    boop: p5.SoundFile;

    shouldFlip: boolean;

    constructor(level:number, resources:ResourceManager, settings:Settings) {
        this.shouldFlip=false;
        this.settings=settings;
        this.level=level;
        this.resources=resources;
        this.initialize();
        console.log("map for level",this.level,"is ready!")
        console.log("tiles",this.tiles);
        console.log("sprites",this.sprites);
    }

    initialize() {
        this.prize=this.resources.getLoad("prize");
        this.music=this.resources.getLoad("music");
        this.boop=this.resources.getLoad("boop2");
        this.sprites=[];
        this.background=[];//this.resources.get("background");
        this.tile_size=this.resources.get("TILE_SIZE");
        let mappings=this.resources.get("mappings");
        let map=this.resources.getLoad(this.resources.get("levels")[this.level]);
        console.log("map=",map);
        if (!map) {
            this.level=0;
            map=this.resources.getLoad(this.resources.get("levels")[this.level]);
        }
        let lines=[];
        let width=0;
        let height=0;
        map.forEach(line => {
            if (!line.startsWith("#")) { //ignore comment lines
                if (line.startsWith("@")) {
                    let parts=line.split(" ");
                    switch (parts[0]) {
                        case "@parallax-layer": {
                            this.background.push(this.resources.getLoad(parts[1]));
                            break;
                        }
                        case "@music": {
                            this.music=this.resources.getLoad(parts[1]);
                            break;
                        }
                        default: {
                            console.log("don't know how to handle this tag:"+parts[0]);
                            break;
                        }
                    }
                } else {
                    lines.push(line);
                    width = Math.max(width,line.length);
                }
            }
        });
        height=lines.length;
        this.width=width;
        this.height=height;
        this.tiles=[...Array(width)].map(x=>Array(height))
        for(let y=0; y<height; y++) {
            let line=lines[y];
            for (let x=0; x<line.length; x++) {
                let ch = line.charAt(x);
                if (ch===" ") continue;
                //tiles are A-Z, sprites are a-z, 0-9, and special characters
                if (ch.match(/[A-Z]/)) { //no need to look at mappings for tiles.
                    this.tiles[x][y]=this.resources.get(ch);
                } else {
                    let s = this.resources.get(mappings[ch]).clone();
                    s.setPosition(this.tilesToPixels(x)+this.tile_size-s.getImage().width/2,
                                  this.tilesToPixels(y)+this.tile_size-s.getImage().height);
                    if (ch=='0') { //I don't like hard-coding in the character for the player.
                        this.player=s;
                    } else {
                        this.sprites.push(s);
                    }
                }
            }
        }
        console.log("background is",this.background);
    }

    tilesToPixels(x:number):number {
        return Math.floor(x*this.tile_size);
    }

    pixelsToTiles(x:number):number {
        return Math.floor(x/this.tile_size);
    }
    flipMap(){
        this.shouldFlip=!this.shouldFlip;
    }


    draw() {
        if (this.shouldFlip){
            rotate(PI/60);
        }
        let myW=800;
        let myH=600;
        let mapWidth=this.tilesToPixels(this.width);
        let position=this.player.getPosition();
        let offsetX = myW / 2 - Math.round(position.x) - this.tile_size;
        offsetX = Math.min(offsetX,0);
        offsetX = Math.trunc(Math.max(offsetX, myW - mapWidth));

        let offsetY = Math.trunc(myH - this.tilesToPixels(this.height));
        this.background.forEach(bg => {
            console.log("drawing background layer with"+bg);
            let x = Math.trunc(offsetX * (myW - bg.width)/(myW-mapWidth));
            let y = Math.trunc(myH - bg.height);
            image(bg,0,0,myW,myH,0-x,0-y,800,600);
        });
        

        let firstTileX = Math.trunc(this.pixelsToTiles(-offsetX));
        let lastTileX = Math.trunc(firstTileX + this.pixelsToTiles(myW) + 1);
        for (let y = 0; y < this.height; y++) {
            for(let x=firstTileX; x <= lastTileX; x++) {
                if (this.tiles[x] && this.tiles[x][y]) {
                    image(this.tiles[x][y],
                        this.tilesToPixels(x) + offsetX,
                        this.tilesToPixels(y) + offsetY);
                }
            }
        }

        image(this.player.getImage(),
            Math.trunc(Math.trunc(position.x) + offsetX),
            Math.trunc(Math.trunc(position.y) + offsetY));

        this.sprites.forEach(sprite => {
            let p=sprite.getPosition();
            image(sprite.getImage(),
                Math.trunc(Math.trunc(p.x) + offsetX),
                Math.trunc(Math.trunc(p.y) + offsetY));
            if (sprite instanceof Creature && p.x+offsetX> 0 && p.x+offsetX<myW) {
                sprite.wakeUp();
            }
        });
    }

    isCollision(s1:Sprite,s2:Sprite):boolean {
        if (s1==s2) return false;
        if (s1 instanceof Creature && (s1 as Creature).getState()!=CreatureState.NORMAL) return false;
        if (s2 instanceof Creature && (s2 as Creature).getState()!=CreatureState.NORMAL) return false;
        let pos1=s1.getPosition().copy();
        let pos2=s2.getPosition().copy();
        pos1.x=Math.round(pos1.x);
        pos1.y=Math.round(pos1.y);
        pos2.x=Math.round(pos2.x);
        pos2.y=Math.round(pos2.y);
        let i1=s1.getImage();
        let i2=s2.getImage();
        let val = (pos1.x < pos2.x + i2.width &&
            pos2.x < pos1.x + i1.width &&
            pos1.y < pos2.y + i2.height &&
            pos2.y < pos1.y + i1.height);
        return val;
    }

    getSpriteCollision(s:Sprite):Sprite {
        for (const other of this.sprites) {
            if (this.isCollision(s,other)) {
                return other;
            }
        }
        return null;
    }

    checkPlayerCollision(p: Player, canKill: boolean) {
        if (p.getState()!=CreatureState.NORMAL) return;
        let s=this.getSpriteCollision(p);
        if (s) {
            if (s instanceof Creature) {
                if (canKill) {
                    s.setState(CreatureState.DYING);
                    if (this.settings.playEvents) {
                        this.boop.play();
                    }
                    let pos=s.getPosition();
                    p.setPosition(p.getPosition().x,pos.y-p.getImage().height);
                    p.jump(true);
                } else {
                    p.setState(CreatureState.DYING);
                }
            } else if (s instanceof PowerUp) {
                this.acquirePowerUp(s);
            }
        }
    }

    removeSprite(s:Sprite) {
        let i=this.sprites.indexOf(s);
        if (i>-1) this.sprites.splice(i,1);
    }

    acquirePowerUp(p:PowerUp) {
        this.removeSprite(p);
        if (p instanceof Star) {
            if (this.settings.playEvents) {
                this.prize.play();
            }
        } else if (p instanceof Music) {

        } else if (p instanceof Heart) {
            this.level+=1;
            this.initialize();
        }
    }

    getTileCollision(s:Sprite, newPos:p5.Vector) {
        let oldPos=s.getPosition();
        let fromX = Math.min(oldPos.x,newPos.x);
        let fromY = Math.min(oldPos.y,newPos.y);
        let toX = Math.max(oldPos.x,newPos.x);
        let toY = Math.max(oldPos.y,newPos.y);
        let fromTileX = this.pixelsToTiles(fromX);
        let fromTileY = this.pixelsToTiles(fromY);
        let toTileX = this.pixelsToTiles(toX + s.getImage().width-1);
        let toTileY = this.pixelsToTiles(toY + s.getImage().height -1);
        for(let x=fromTileX; x<=toTileX; x++) {
            for(let y=fromTileY;y<=toTileY;y++) {
                if (x<0 || x >= this.tiles.length || this.tiles[x][y]) {
                    return createVector(x,y);
                }
            }
        }
        return null;
    }

    updateSprite(s:Sprite) {
        //update velocity due to gravity
        let oldVel = s.getVelocity();
        let newPos = s.getPosition().copy();

        if (!s.isFlying()) {
            oldVel.y=oldVel.y+GRAVITY*deltaTime;
            s.setVelocity(oldVel.x,oldVel.y);
        }

        //update the x part of position first
        newPos.x = newPos.x + oldVel.x*deltaTime;
        //see if there was a collision with a tile at the new location
        let point = this.getTileCollision(s,newPos);
        if (point) {
            if (oldVel.x > 0) { //moving to the right
                newPos.x = this.tilesToPixels(point.x) - s.getImage().width;
            } else if (oldVel.x < 0) { //moving to the left
                newPos.x = this.tilesToPixels(point.x+1);
            }
            s.collideHorizontal();
        }
        s.setPosition(newPos.x,newPos.y);
        if (s instanceof Player) {
            this.checkPlayerCollision(s as Player, false);
        }

        //now update the y part of the position
        let oldY = newPos.y;
        newPos.y = newPos.y + oldVel.y*deltaTime;
        point = this.getTileCollision(s,newPos);
        if (point) {
            if (oldVel.y > 0 ) {
                newPos.y = this.tilesToPixels(point.y) - (s.getImage().height);
            } else if (oldVel.y < 0) {
                newPos.y = this.tilesToPixels(point.y+1);
            }
            s.collideVertical();
        }
        s.setPosition(newPos.x,newPos.y);
        if (s instanceof Player) {
            this.checkPlayerCollision(s as Player, oldY < newPos.y);
        }
    }

    update() {
        if (this.player.getState() == CreatureState.DEAD) {
            this.initialize(); //start the level over
            return;
        }
        this.updateSprite(this.player); //moves sprite within the game
        this.player.update(deltaTime); //updates the animation of the sprite

        this.sprites.forEach((sprite,index,obj) => {
            if (sprite instanceof Creature ) {
                if (sprite.getState() == CreatureState.DEAD) {
                    //remove the sprite
                    obj.splice(index,1);
                } else {
                    this.updateSprite(sprite);
                    sprite.update(deltaTime);
                }
            } else if (sprite instanceof PowerUp) {
                sprite.update(deltaTime);
            }
        });
    }
}