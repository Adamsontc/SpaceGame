import { Player } from "./sprites/Player.js";
import { ResourceManager } from "./ResourceManager.js";
import { Sprite } from "./sprites/Sprite.js";
import { GRAVITY, STATE, GameManager } from './GameManager.js';
import { Creature, CreatureState, Grub } from "./sprites/Creature.js";
import { Heart, Music, PowerUp, Star, AmmoBox, Power } from "./sprites/PowerUp.js";
import { Projectile, EnemyProjectile } from './sprites/Projectile.js';
import { Lava } from "./sprites/Lava.js"
import { Fireball } from './sprites/Fireball.js';
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
    blast: p5.SoundFile;
    black_hole: p5.SoundFile;
    dying: p5.SoundFile;
    full_death: p5.SoundFile;
    medallions: number;
    ALPHALEVEL: number;
    lives: number;
    numBullets: number;
    boost: p5.SoundFile;
    ammo: p5.SoundFile;
    oneUp: p5.SoundFile;
    game: GameManager;

    constructor(level:number, resources:ResourceManager, settings:Settings, game: GameManager) {
        this.ALPHALEVEL=20;
        this.settings=settings;
        this.level=level;
        this.resources=resources;
        this.medallions=0;
        this.lives=3;
        this.numBullets=3;
        this.game=game;
        this.initialize();
    }

    initialize() {
        this.oneUp=this.resources.getLoad("1up");
        this.ammo=this.resources.getLoad("ammo");
        this.boost=this.resources.getLoad("boost");
        this.prize=this.resources.getLoad("prize");
        this.music=this.resources.getLoad("music");
        this.boop=this.resources.getLoad("boop2");
        this.blast=this.resources.getLoad("gun_blast");
        this.full_death=this.resources.getLoad("full_death");
        this.black_hole=this.resources.getLoad("blackHole");
        this.dying = this.resources.getLoad("dying");
        this.sprites=[];
        this.background=[];//this.resources.get("background");
        this.tile_size=this.resources.get("TILE_SIZE");
        let mappings=this.resources.get("mappings");
        let map=this.resources.getLoad(this.resources.get("levels")[this.level]);
        console.log("map=",map);
        if (!map) {
            this.level=0;
            this.game.gameState=STATE.Finished;
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

    draw() {
        
        let myW=800;
        let myH=600;
        let mapWidth=this.tilesToPixels(this.width);
        let mapHeight = this.tilesToPixels(this.height);
        let position=this.player.getPosition();
        let offsetX = myW / 2 - Math.round(position.x) - this.tile_size;
        offsetX = Math.min(offsetX,0);
        offsetX = Math.trunc(Math.max(offsetX, myW - mapWidth));
        let offsetY = myH / 2 - Math.round(position.y) - this.tile_size;
        offsetY = Math.min(offsetY,0);
        offsetY = Math.trunc(Math.max(offsetY, myH - mapHeight));
        this.background.forEach(bg => {
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
            //if (this.pp_collision(s,other)) {
            if (this.isCollision(s,other)) {
                return other;
            }
        }
        return null;
    }

    checkPlayerCollision(p: Player, canKill: boolean) {
        if (p.getState()!=CreatureState.NORMAL) return;
        let s=this.getSpriteCollision(p);
        if (s && this.pp_collision(p,s)) {
            if (s instanceof Creature || s instanceof EnemyProjectile) {
                if(this.lives==1){
                    p.setState(CreatureState.DYING)
                    this.full_death.play();
                    this.level=0;
                    this.medallions=0;
                    this.numBullets=3;
                    this.lives+=3;
                }
                if(this.lives>1){
                    p.setState(CreatureState.DYING);
                    this.dying.play();
                    this.medallions=0;
                    this.lives-=1;
                }
                
            }   else if (s instanceof Lava) {
                p.setState(CreatureState.DYING);
                this.dying.play();
                this.medallions=0;

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
            // if (this.settings.playEvents) {
                this.prize.play();
                this.medallions+=1;
            // }
        } else if (p instanceof Music) {

        } else if (p instanceof Heart) {
            if(this.level==0 && this.medallions==9) {
                this.level+=1;
                this.medallions=0;
                this.black_hole.play();
                this.initialize();
            }
            if(this.level==1 && this.medallions==20) {
                this.black_hole.play();
                this.level+=1;
                this.medallions=0;
                this.initialize();
            }
            if(this.level==2 && this.medallions==10) {
                this.black_hole.play();
                this.level+=1;
                this.medallions=0;
                this.initialize();
            }
            if(this.level==3 && this.medallions==160) {
                this.black_hole.play();
                this.level+=1;
                this.medallions=0;
                this.initialize();
            }
        } else if (p instanceof AmmoBox){
            this.numBullets+=3;
            this.ammo.play();
        } else if (p instanceof Power){
            this.boost.play();
            this.player.fuel+=2500;
            if(this.player.fuel>this.player.MAX_FUEL){
                this.player.fuel=this.player.MAX_FUEL
            } 
        } else if (p instanceof PowerUp) {
            if(this.lives>0){
                this.oneUp.play();
                this.lives+=1;
            }
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

    playShoot(){
        this.blast.play();
    }

    updateProjectile(proj:Projectile) {
        let newPos = proj.getPosition().copy();
        if (proj instanceof EnemyProjectile && proj.followPlayer) {
            let pos=this.player.getPosition().copy();
            pos.x+=this.player.getImage().width/2;
            pos.y+=this.player.getImage().height/2;
            let vec=p5.Vector.sub(pos,proj.getPosition());
            vec.normalize().mult(0.05);
            proj.setVelocity(vec.x,vec.y);
        }
        let vel = proj.getVelocity();
        newPos.x += vel.x*deltaTime;
        newPos.y += vel.y*deltaTime;
        //newPos.add(proj.getVelocity().mult(deltaTime));
        let point = this.getTileCollision(proj,newPos);
        if (point) {
            this.removeSprite(proj);
        } else {
            let spriteCollided=this.getSpriteCollision(proj);
            if (spriteCollided) {
                if (spriteCollided instanceof Creature &&
                    !(spriteCollided instanceof Lava) &&
                    !(spriteCollided instanceof Fireball) &&
                    ! (proj instanceof EnemyProjectile)) {
                    this.boop.play();
                    spriteCollided.setState(CreatureState.DYING);
                    this.removeSprite(proj);
                }
            }
            proj.setPosition(newPos.x,newPos.y);
        }
    }

    updateSprite(s:Sprite) {
        //update velocity due to gravity
        let oldVel = s.getVelocity();
        let newPos = s.getPosition().copy();

        if (!s.isFlying()) {
            if (s instanceof Player) {
                let thrust=(s as Player).getThursterAmount();
                oldVel.y=oldVel.y+(GRAVITY-thrust)*deltaTime;
                s.setVelocity(oldVel.x,oldVel.y);
            } else {
                oldVel.y=oldVel.y+GRAVITY*deltaTime;
                s.setVelocity(oldVel.x,oldVel.y);
            }
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
        } else {
            let spriteCollided=this.getSpriteCollision(s);
            if (spriteCollided && !(spriteCollided instanceof Projectile)) {
                let oldVel=s.getVelocity();
                s.setVelocity(oldVel.x*-1, - oldVel.y);
            }
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
                    sprite.effectMap(this);
                }
            } else if (sprite instanceof PowerUp) {
                sprite.update(deltaTime);
            } else if (sprite instanceof Projectile) {
                this.updateProjectile(sprite);
            }
        });
    }

    /**Per-Pixel Collision Detection
     * Got code from https://openprocessing.org/sketch/149174/ which implements this
     * in Processing (An older precurser to p5.js)
     * I've modified it to work with p5.js and TypeScript
    */
    pp_collision(a:Sprite, b:Sprite):boolean {

        //convert my parameters to the parameters from original code
        let imgA = a.getImage();
        let aPos = a.getPosition();
        let aix = aPos.x;
        let aiy = aPos.y;
        let imgB = b.getImage();
        let bPos = b.getPosition();
        let bix = bPos.x;
        let biy = bPos.y;

        return this.pp_image_collision(imgA,aix,aiy,imgB,bix,biy);
    }

    pp_image_collision(imgA:p5.Image, aix:number, aiy:number, imgB:p5.Image, bix:number, biy:number) {
        let topA   = aiy;
        let botA   = aiy + imgA.height;
        let leftA  = aix;
        let rightA = aix + imgA.width;
        let topB   = biy;
        let botB   = biy + imgB.height;
        let leftB  = bix;
        let rightB = bix + imgB.width;

        if (botA <= topB  || botB <= topA || rightA <= leftB || rightB <= leftA)
            return false;

        // If we get here, we know that there is an overlap
        // So we work out where the sides of the overlap are
        let leftO = (leftA < leftB) ? leftB : leftA;
        let rightO = (rightA > rightB) ? rightB : rightA;
        let botO = (botA > botB) ? botB : botA;
        let topO = (topA < topB) ? topB : topA;


        // P is the top-left, S is the bottom-right of the overlap
        let APx = leftO-leftA;   
        let APy = topO-topA;
        let ASx = rightO-leftA;  
        let ASy = botO-topA-1;
        let BPx = leftO-leftB;   
        let BPy = topO-topB;

        let widthO = rightO - leftO;
        let foundCollision = false;

        // Images to test
        imgA.loadPixels();
        imgB.loadPixels();

        // These are widths in BYTES. They are used inside the loop
        //  to avoid the need to do the slow multiplications
        let surfaceWidthA = imgA.width;
        let surfaceWidthB = imgB.width;

        let pixelAtransparent = true;
        let pixelBtransparent = true;

        // Get start pixel positions
        let pA = (APy * surfaceWidthA) + APx;
        let pB = (BPy * surfaceWidthB) + BPx;

        let ax = APx; 
        let ay = APy;
        let bx = BPx; 
        let by = BPy;
        for (ay = APy; ay < ASy; ay++) {
            bx = BPx;
            for (ax = APx; ax < ASx; ax++) {
                //modified imgA.pixels[pA] in row below
                //processing kept color data type inside pixels (which were 4 numbers)
                //while p5.js keeps a single array that is 4 times as large
                let pixelAtransparent = imgA.pixels[pA*4] < this.ALPHALEVEL;
                let pixelBtransparent = imgB.pixels[pB*4] < this.ALPHALEVEL;

                if (!pixelAtransparent && !pixelBtransparent) {
                    foundCollision = true;
                    break;
                }
                pA ++;
                pB ++;
                bx++;
            }
            if (foundCollision) break;
            pA = pA + surfaceWidthA - widthO;
            pB = pB + surfaceWidthB - widthO;
            by++;
        }
        return foundCollision;
    }


}