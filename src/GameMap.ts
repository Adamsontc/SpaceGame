import { NumberDict } from "p5";
import { Player } from "./Player.js";
import { ResourceManager } from "./ResourceManager.js";
import { Sprite, SpriteState } from "./Sprite.js";
import { GRAVITY } from './GameManager.js';
import { hasUncaughtExceptionCaptureCallback } from "process";

export class GameMap {

    tiles: p5.Image[][];
    tile_size:number;
    sprites: Sprite[];
    player: Player;
    background: p5.Image;
    width: number;
    height: number;
    level: number;
    resources: ResourceManager;

    constructor(level:number, resources:ResourceManager) {
        this.level=level;
        this.resources=resources;
        this.initialize();
    }

    initialize() {
        this.sprites=[];
        this.background=this.resources.get("background");
        this.tile_size=this.resources.get("TILE_SIZE");
        let mappings=this.resources.get("mappings");
        let map=this.resources.getLoad(this.resources.get("levels")[this.level]);
        let lines=[];
        let width=0;
        let height=0;
        map.forEach(line => {
            if (!line.startsWith("#")) { //ignore comment lines
                lines.push(line);
                width = Math.max(width,line.length);
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
        console.log("map for level",this.level,"is ready!")
        console.log("tiles",this.tiles);
        console.log("sprites",this.sprites);
    }

    tilesToPixels(x:number):number {
        return Math.floor(x*this.tile_size);
    }

    pixelsToTiles(x:number):number {
        return Math.floor(x/this.tile_size);
    }

    draw() {
        let mapWidth=this.tilesToPixels(this.width);
        let position=this.player.getPosition();
        let offsetX = width / 2 - Math.round(position.x) - this.tile_size;
        offsetX = Math.min(offsetX,0);
        offsetX = Math.trunc(Math.max(offsetX, width - mapWidth));

        let offsetY = Math.trunc(height - this.tilesToPixels(this.height));

        let x = Math.trunc(offsetX * (width - this.background.width)/(width-mapWidth));
        let y = Math.trunc(height - this.background.height);
        image(this.background,x,y);

        let firstTileX = Math.trunc(this.pixelsToTiles(-offsetX));
        let lastTileX = Math.trunc(firstTileX + this.pixelsToTiles(width) + 1);
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
            Math.trunc(Math.round(position.x) + offsetX),
            Math.trunc(Math.round(position.y) + offsetY));

        this.sprites.forEach(sprite => {
            let p=sprite.getPosition();
            image(sprite.getImage(),
                Math.trunc(Math.round(p.x) + offsetX),
                Math.trunc(Math.round(p.y) + offsetY));
            // if (sprite instanceof Creature) {  //come back after distinction made between creatures and powerups and background sprites
            //     sprite.wakeUp();
            // }
        });
    }

    isCollision(s1:Sprite,s2:Sprite):boolean {
        if (s1==s2) return false;
        if (s1 instanceof Player && (s1 as Player).getState()!=SpriteState.NORMAL) return false;
        if (s2 instanceof Player && (s2 as Player).getState()!=SpriteState.NORMAL) return false;
        let pos1=s1.getPosition().copy();
        let pos2=s2.getPosition().copy();
        pos1.x=Math.round(pos1.x);
        pos1.y=Math.round(pos1.y);
        pos2.x=Math.round(pos2.x);
        pos2.y=Math.round(pos2.y);
        return (pos1.x < pos2.x + s2.getImage().width &&
            pos2.x < pos1.x + s1.getImage().width &&
            pos1.y < pos2.y + s2.getImage().height &&
            pos2.y < pos1.y + s1.getImage().height);
    }

    getSpriteCollision(s:Sprite):Sprite {
        this.sprites.forEach(other => {
            if (this.isCollision(s,other)) {
                console.log("colliding",other);
                return other;
            }
        });
        return null;
    }

    checkPlayerCollision(p: Player, canKill: boolean) {
        if (p.getState()!=SpriteState.NORMAL) return;
        let s=this.getSpriteCollision(p);
        if (s) {
            s.setState(SpriteState.DYING);
            console.log("set to dying:",s);
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
        if (s instanceof Player) {
            this.checkPlayerCollision(s as Player, false);
        }

        //now update the y part of the position
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
        if (s instanceof Player) {
            this.checkPlayerCollision(s as Player, s.getPosition().y < newPos.y);
        }
        s.setPosition(newPos.x,newPos.y);
    }

    update() {
        if (this.player.getState() == SpriteState.DEAD) {
            this.initialize(); //start the level over
            return;
        }
        this.updateSprite(this.player); //moves sprite within the game
        this.player.update(deltaTime); //updates the animation of the sprite

        this.sprites.forEach((sprite,index,obj) => {
            if (sprite.getState() == SpriteState.DEAD) {
                //remove the sprite
                obj.splice(index,1);
                console.log("REMOVING SPRITE");
            } else {
                this.updateSprite(sprite);
                sprite.update(deltaTime);
            }
        });
    }
}