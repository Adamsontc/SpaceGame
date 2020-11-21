import { NumberDict } from "p5";
import { Player } from "./Player.js";
import { ResourceManager } from "./ResourceManager.js";
import { Sprite, SpriteState } from "./Sprite.js";
import { GRAVITY } from './GameManager.js';

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
                    console.log("tile match:",ch);
                    this.tiles[x][y]=this.resources.get(ch);
                } else {
                    console.log("ch=",ch);
                    let s = this.resources.get(mappings[ch]).clone();
                    console.log("adding in sprite",s);
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
            // if (sprite instanceof Creature) {
            //     sprite.wakeUp();
            // }
        });
    }

    getSpriteCollision(s:Sprite) {
        return null;
    }

    checkPlayerCollision(p: Player, canKill: boolean) {
        if (p.getState()!=SpriteState.NORMAL) return;
        let s=this.getSpriteCollision(p);
        if (s) {

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
        if (s instanceof Player) console.log("at beginning:",oldVel.y,"deltaT",deltaTime);
        if (!s.isFlying()) {
            oldVel.y=oldVel.y+GRAVITY*deltaTime;
            //s.setVelocity(oldVel.x,oldVel.y);
        }
        if (s instanceof Player) console.log("after 1:",oldVel.y);
        //update x position first
        //so any sideways collisions will happen first
        let oldPos = s.getPosition();
        if (s instanceof Player) console.log("after 2: ---pos",oldPos.y);
        let newPos = oldPos.copy();
        newPos.x +=  oldVel.x*deltaTime;
        
        let point = this.getTileCollision(s,newPos);
        if (s instanceof Player) console.log("XXXXXXX: point.y:",(point==null?"null":point.y));
        if (point) { //there was a collision with a tile when changing the x part of position
            //move sprite to be right next to the tile instead of over it
            if (oldVel.x > 0) { //moving to the right
                console.log("MOVING BACK FROM BUMP");
                newPos.x = this.tilesToPixels(point.x) - s.getImage().width;
            } else if (oldVel.x < 0) { //moving to the left
                console.log("MOVING AHEAD FROM BUMP");
                newPos.x = this.tilesToPixels(point.x+1);
            }
            s.collideHorizontal();
        }
        if (s instanceof Player) {
            this.checkPlayerCollision(s as Player, false);
        }

        //update y position
        newPos.y += oldVel.y*deltaTime;
        if (s instanceof Player) console.log("after 3: ---newPos",newPos.y);
        point = this.getTileCollision(s,newPos);
        if (s instanceof Player) console.log("after 4: point.y:",(point==null?"null":point.y));
        if (point) { //collision when changing y part of position
            if (oldVel.y > 0) {
                newPos.y = this.tilesToPixels(point.y) - (s.getImage().height);
            } else if (oldVel.y < 0) {
                newPos.y = this.tilesToPixels(point.y+1);
            }
            s.collideVertical();
        } else {
            if (s instanceof Player) console.log("point was null :",oldVel.y);
        }
        s.setPosition(newPos.x,newPos.y);
        if (s instanceof Player) {
            this.checkPlayerCollision(s as Player,oldPos.y < newPos.y);
            console.log("Player pos:",newPos.y,"vel:",s.getVelocity().y);
        }
        
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