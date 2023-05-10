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

/**
 * This class controlls the main actions of the game for the player and the sprites
 */
export class GameMap {

    tiles: p5.Image[][];
    tile_size:number;
    sprites: Sprite[];
    player: Player;
    background: p5.Image[];
    width: number; // width in tiles
    height: number; // height in tiles
    level: number;
    resources: ResourceManager;
    game: GameManager;
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

    constructor(level:number, resources:ResourceManager, settings:Settings, game: GameManager) {
    /**
     * This initializes different aspects of the game
     * @param level 
     * @param resources 
     * @param settings 
     */
    
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
        /**
         * These load all of the neccesary resources for the game 
         */
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
        /**
         * These initialze arrays to store sprites and backgrounds 
         */
        this.sprites=[];
        this.background=[];
        /**
         * These get the tile size and the level map data
         */
        this.tile_size=this.resources.get("TILE_SIZE");
        let mappings=this.resources.get("mappings");
        let map=this.resources.getLoad(this.resources.get("levels")[this.level]);
        /**
         * The if statement states that if the level data isn't found, 
         * start at level 0
         */
        if (!map) {
            this.level=0;
            this.game.gameState=STATE.Finished;
            map=this.resources.getLoad(this.resources.get("levels")[this.level]);
        }
        /**
         * The analyze the level data and draw the sprites, tiles, 
         */
        let lines=[];
        let width=0;
        let height=0;
        map.forEach(line => {
            if (!line.startsWith("#")) { //ignore comment lines
                if (line.startsWith("@")) {
                    let parts=line.split(" ");
                    switch (parts[0]) {
                        case "@parallax-layer": {
                            //loads background images
                            this.background.push(this.resources.getLoad(parts[1]));
                            break;
                        }
                        /**
                         * this loads the music
                         */
                        case "@music": {
                            this.music=this.resources.getLoad(parts[1]);
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                } else {
                    lines.push(line);
                    width = Math.max(width,line.length);
                }
            }
        });
        /**
         * Calculates the level height and width based on the analyzed level data 
         */
        height=lines.length;
        this.width=width;
        this.height=height;
        this.tiles=[...Array(width)].map(x=>Array(height))
        /**
         * creates tiles and sprites based on the analyzed level, sprite and tiles data
         */
        for(let y=0; y<height; y++) {
            let line=lines[y];
            for (let x=0; x<line.length; x++) {
                let ch = line.charAt(x);
                if (ch===" ") continue;
                //tiles are A-Z, sprites are a-z, 0-9, and special characters
                if (ch.match(/[A-Z]/)) { 
                    this.tiles[x][y]=this.resources.get(ch);
                } else {
                    /**
                     * these creates sprites based on mappings
                     */
                    let s = this.resources.get(mappings[ch]).clone();
                    s.setPosition(this.tilesToPixels(x)+this.tile_size-s.getImage().width/2,
                                  this.tilesToPixels(y)+this.tile_size-s.getImage().height);
                    /**
                     * below is a special case for the 
                     */
                    if (ch=='0') { // check if character is '0', which denotes the player sprite
                        this.player=s; // assign the sprite to the 'player' variable
                    } else {
                        this.sprites.push(s); // otherwise, add the sprite to the 'sprites' array
                    }
                }
            }
        }
        
    }
    /**
     * Convert tile position to pixel position
     * @param x 
     * @returns 
     */
    tilesToPixels(x:number):number {
        return Math.floor(x*this.tile_size);
    }
    /**
     * Convert pixel position to tile position
     * @param x 
     * @returns 
     */
    pixelsToTiles(x:number):number {
        return Math.floor(x/this.tile_size);
    }
    /**
     * this method calls upon the draw function and it draws a bunch of the images 
     * within the game 
     */
    draw() {
        /**
         * These define the screen demension
         */
        let myW=800;
        let myH=600;
        /**
         * These define the map demensions and the location of the player
         */
        let mapWidth=this.tilesToPixels(this.width);
        let mapHeight = this.tilesToPixels(this.height);
        let position=this.player.getPosition();
        /**
         * These calculate the offset values for smooth scrolling
         */
        let offsetX = myW / 2 - Math.round(position.x) - this.tile_size;
        offsetX = Math.min(offsetX,0);
        offsetX = Math.trunc(Math.max(offsetX, myW - mapWidth));
        let offsetY = myH / 2 - Math.round(position.y) - this.tile_size;
        offsetY = Math.min(offsetY,0);
        offsetY = Math.trunc(Math.max(offsetY, myH - mapHeight));
        /**
         * These create the background of the game
         */
        this.background.forEach(bg => {
            let x = Math.trunc(offsetX * (myW - bg.width)/(myW-mapWidth));
            let y = Math.trunc(myH - bg.height);
            image(bg,0,0,myW,myH,0-x,0-y,800,600);
        });
        /**
         * These lines of code creates the tiles of the video game that are visible
         */
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
        /**
         * These lines of code creates the player and its position
         */
        image(this.player.getImage(),
            Math.trunc(Math.trunc(position.x) + offsetX),
            Math.trunc(Math.trunc(position.y) + offsetY));
        /**
         * These lines of codes draws every other sprite (alien) in the game
         */
        this.sprites.forEach(sprite => {
            let p=sprite.getPosition();
            image(sprite.getImage(),
                Math.trunc(Math.trunc(p.x) + offsetX),
                Math.trunc(Math.trunc(p.y) + offsetY));
        /**
         * This if statement says if the sprites are visible on the screen, they move
         * if they aren't visible they stay still until they are on the screen 
         */
            if (sprite instanceof Creature && p.x+offsetX> 0 && p.x+offsetX<myW) {
                sprite.wakeUp();
            }
        });
    }
    /**
     * This method checkts to see if there is a colisino between the sprites
     * It returns a boolean if they collide or not
     * @param s1 
     * @param s2 
     * @returns 
     */
    isCollision(s1:Sprite,s2:Sprite):boolean {
        /**
         * The function checks to see if s1 and s2 are the same, 
         * it automatically returns false because an object cannot collide with itself.
         */
        if (s1==s2) return false;
        /** 
         * check if s1 and s2 are details of the Creature class and it checks to see if they're in a normal state or not 
         * If they're not in a nomal state, it returns false
        */
        if (s1 instanceof Creature && (s1 as Creature).getState()!=CreatureState.NORMAL) return false;
        if (s2 instanceof Creature && (s2 as Creature).getState()!=CreatureState.NORMAL) return false;
        /**
         * it then gets the position of s1 and s2 and it rounds each x and y value to the nearest integer
         */
        let pos1=s1.getPosition().copy();
        let pos2=s2.getPosition().copy();
        pos1.x=Math.round(pos1.x);
        pos1.y=Math.round(pos1.y);
        pos2.x=Math.round(pos2.x);
        pos2.y=Math.round(pos2.y);
        /**
         * then it gets the image of s1 and s2
         */
        let i1=s1.getImage();
        let i2=s2.getImage();
        /**
         * it then checks to see if there is a collison between s1 and s2, if there is, it returns true, if there isn't
         * it returns false
         */
        let val = (pos1.x < pos2.x + i2.width &&
            pos2.x < pos1.x + i1.width &&
            pos1.y < pos2.y + i2.height &&
            pos2.y < pos1.y + i1.height);
        return val;
    }
    /**
     * This methods checks to see if s(sprite) collides with another sprite in the sprite array list
     * if there is a collision, it returns the collided sprite,
     * if there isn't a collision, it returns null
     * @param s 
     * @returns 
     */
    getSpriteCollision(s:Sprite):Sprite {
        /**
         * in this for loop, it checks to see if s collides with the current sprite in the loop
         */
        for (const other of this.sprites) {
            /**
             * if a collision is detected, it will return the first collided sprite
             */
            if (this.isCollision(s,other)) {
                return other;
            }
        }
        /**
         * if there is no collision, it returns null
         */
        return null;
    }
    /**
     * This checks to see if there is a player collision with a sprite and it initializes
     * that the player can kill the sprite
     * @param p 
     * @param canKill 
     * @returns 
     */
    checkPlayerCollision(p: Player, canKill: boolean) {
        /**
         * This if statement checks to see if the player is in the normal state
         * if it is in a normal state it continues on
         * but if its not in a normal state, it stops because the player can't collide
         * with sprites in different states
         */
        if (p.getState()!=CreatureState.NORMAL) return;
        /**
         * It calls upon the getSpriteCollision method to check to see if 'p' collided
         * with any of the sprites
         */
        let s=this.getSpriteCollision(p);
        if (s && this.pp_collision(p,s)) {
            /**
             * this if loop states that if the 'p' collides with an Enemy Projectile, then the player either dies or loses a life
             */
            if (s instanceof Creature || s instanceof EnemyProjectile) {
                /**
                 * this if loop states that if the lives of the player is equal to 1, then the player dies, 
                 * sets the number of medaillions to 0, gives the player 3 bullets and 3 lives, then 
                 * resets their game and places them at the first level.
                 */
                if(this.lives==1){
                    p.setState(CreatureState.DYING)
                    this.full_death.play();
                    this.level=0;
                    this.medallions=0;
                    this.numBullets=3;
                    this.lives+=3;
                }
                /**
                 * this if loop states that if the lives are greater than 1, then the player dies, 
                 * the medaillions reset to 0 and you get one less life than what you had originally
                 */
                if(this.lives>1){
                    p.setState(CreatureState.DYING);
                    this.dying.play();
                    this.medallions=0;
                    this.lives-=1;
                }
                
            }   
                /**
                 * If the player collideded with Lava, then the player is set to a dying state,
                 * medaillions reset to 0
                 */
                else if (s instanceof Lava) {
                p.setState(CreatureState.DYING);
                this.dying.play();
                this.medallions=0;

            } 
                /**
                 * If the player comes across the power up, it calls upon the acquirePowerUp method 
                 */
            else if (s instanceof PowerUp) {
                this.acquirePowerUp(s);
            }
        }
    }
    /**
     * This takes a sprite and removes them from an array of sprites called this.sprites 
     * @param s 
     */
    removeSprite(s:Sprite) {
        /**
         * The if loop states that if the index is greater than -1, it removes it from the array
         */
        let i=this.sprites.indexOf(s);
        if (i>-1) this.sprites.splice(i,1);
    }
    /**
     * This method checks to see if the player aquires a power up or not. 
     * @param p 
     */
    acquirePowerUp(p:PowerUp) {
        /**
         * this removes the sprite 'p' 
         */
        this.removeSprite(p);
        /**
         * this if loop checks to see if 'p' is in instance of star
         */
        if (p instanceof Star) {
            /**
             * this if loop states that if the player collects a start, the medaillion count increases by 1
             * there will be an event sound that plays as well
             */
            if (this.settings.playEvents) {
                this.prize.play();
                this.medallions+=1;
            }
            /**
             * this else if checks to see if 'p' is in instance of Music
             */
        } else if (p instanceof Music) {

        } 
            /**
             * this else if checks to see if 'p' is in instance of a Heart
             */
            else if (p instanceof Heart) {
            /**
             * the if loop states that if the level is 0 and you have 9 medaillions, you can proceed to the next level
             * and the sound black_hole will play
             * if you don't have 9 medaillions then you cannot proceed to the next level
             */
            if(this.level==0 && this.medallions==9) {
            this.black_hole.play();
            this.level+=1;
            this.medallions=0;
            this.initialize();
            }
            /**
             * the if loop states that if the level is 1 and you have 20 medaillions, you can proceed to the next level
             * and the sound black_hole will play
             * if you don't have 20 medaillions then you cannot proceed to the next level
             */
            if(this.level==1 && this.medallions==20) {
                this.black_hole.play();
                this.level+=1;
                this.medallions=0;
                this.initialize();
            }
            /**
             * the if loop states that if the level is 1 and you have 10 medaillions, you can proceed to the next level
             * and the sound black_hole will play
             * if you don't have 10 medaillions then you cannot proceed to the next level
             */
            if(this.level==2 && this.medallions==10) {
                this.black_hole.play();
                this.level+=1;
                this.medallions=0;
                this.initialize();
            }
            /**
             * the if loop states that if the level is 1 and you have 160 medaillions, you can proceed to the next level
             * and the sound black_hole will play
             * if you don't have 160 medaillions then you cannot proceed to the next level
             */
            if(this.level==3 && this.medallions==160) {
                this.black_hole.play();
                this.level+=1;
                this.medallions=0;
                this.initialize();
            }
        } 
          /**
           * this checks to see if 'p' is instance of AmmoBox
           * then it checks if you collect an AmmoBox, your bullet count increased by 3
           * then the ammo sound plays
           */
        else if (p instanceof AmmoBox){
            this.numBullets+=3;
            this.ammo.play();
        } 
        /**
         * this checks to see if 'p' is instance of Power
         * then it checks to see if you collect the power boost
         * if you collect it, then you get 2500 fuel added to what you originally had
         * then it plays the boost sound
         */
        else if (p instanceof Power){
            this.boost.play();
            this.player.fuel+=2500;
            /**
             * this if statement checks to see if the player fuel is more than the MAX_FUEL
             * if it is more than the MAX_FUEL, it sets the fuel to max
             */
            if(this.player.fuel>this.player.MAX_FUEL){
                this.player.fuel=this.player.MAX_FUEL
            } 
        }
        /**
         * this checks to see if 'p' is instance of PowerUp
         * then it checks to see if you collected this PowerUp
         * if you did, and your lives are greater than 0,
         * it adds a life to your number of lives you have
         * then the sound file oneUp plays once you collect it
         */
         else if (p instanceof PowerUp) {
            if(this.lives>0){
                this.oneUp.play();
                this.lives+=1;
            }
        }
    }
    /**
     * This method checks collisions between the sprites and the tiles throughout the levels
     * @param s 
     * @param newPos 
     * @returns 
     */
    getTileCollision(s:Sprite, newPos:p5.Vector) {
        /**
         * saves the old sprite position
         */
        let oldPos=s.getPosition();
        /**
         * these calculate sprites bounding boxes for 
         * their new and old positions
         */
        let fromX = Math.min(oldPos.x,newPos.x);
        let fromY = Math.min(oldPos.y,newPos.y);
        let toX = Math.max(oldPos.x,newPos.x);
        let toY = Math.max(oldPos.y,newPos.y);
        /**
         * these statements convert the bounding box for tiles 
         * from pixels to tiles
         */
        let fromTileX = this.pixelsToTiles(fromX);
        let fromTileY = this.pixelsToTiles(fromY);
        let toTileX = this.pixelsToTiles(toX + s.getImage().width-1);
        let toTileY = this.pixelsToTiles(toY + s.getImage().height -1);
        /**
         * this for loop checks the bounding boxes of tiles for collision
         */
        for(let x=fromTileX; x<=toTileX; x++) {
            for(let y=fromTileY;y<=toTileY;y++) {
                /**
                 * this if statement checks to see if the current tile is out of 
                 * the game world bounds or contains a tile object
                 */
                if (x<0 || x >= this.tiles.length || this.tiles[x][y]) {
                    /**
                     * if there is a collision, return the vector that was created
                     */
                    return createVector(x,y);
                }
            }
        }
        /**
         * if there is no collision, return null
         */
        return null;
    }
    /**
     * this method plays a sound when you shoot your blaster
     */
    playShoot(){
        /**
         * this is the sound file that plays when your blaster gets fired
         */
        this.blast.play();
    }
    /**
     * this method updates the position of the projectile
     * it also checks for collisions
     * @param proj 
     */
    updateProjectile(proj:Projectile) {
        /**
         * these calculate the new projectiles position based on the velocity
         * of the projectile and deltaTime
         */
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
        /**
         * this checks to see if the projectile collides with a tile
         */
        let point = this.getTileCollision(proj,newPos);
        if (point) {
            /**
             * if the projectile collides with a tile it gets removed
             */
            this.removeSprite(proj);
        } else {
            /**
             * if it doesn't collide with a tile, check to see if it collides 
             * with something else
             */
            let spriteCollided=this.getSpriteCollision(proj);
            if (spriteCollided) {
                /**
                 * if the sprite collides with the creature, and is not the lava
                 * or fireball or an enemy projectile, 
                 * the sound boop plays, and it sets the creature state that got hit
                 * to dying and it removes the sprite that got hit
                 */
                if (spriteCollided instanceof Creature &&
                    !(spriteCollided instanceof Lava) &&
                    !(spriteCollided instanceof Fireball) &&
                    ! (proj instanceof EnemyProjectile)) {
                    this.boop.play();
                    spriteCollided.setState(CreatureState.DYING);
                    this.removeSprite(proj);
                }
            }
            /**
             * this updates the projectiles position
             */
            proj.setPosition(newPos.x,newPos.y);
        }
    }
    /**
     * This method updates the sprites based on deltaTime and gravity
     * @param s 
     */
    updateSprite(s:Sprite) {
        //update velocity due to gravity
        let oldVel = s.getVelocity();
        let newPos = s.getPosition().copy();
        /**
         * this if statement checks to see if the sprite is not flying
         */
        if (!s.isFlying()) {
            if (s instanceof Player) {
                /**
                 * Gets the available amount of thrust you can get
                 * it also calculates the new velocity based on 
                 * gravity and delta time
                 * then it sets the new velocity for the player
                 */
                let thrust=(s as Player).getThursterAmount();
                oldVel.y=oldVel.y+(GRAVITY-thrust)*deltaTime;
                s.setVelocity(oldVel.x,oldVel.y);
            } else { 
            /**
             * if the object isn't a player then it updates the object 
             * based off of gravity 
             * then it sets the new velocity for the object
             */
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
        /**
         * update the y position by using old velocity and delta time
         */
        let oldY = newPos.y;
        newPos.y = newPos.y + oldVel.y*deltaTime;
        /**
         * check for collision with a tile at the new location
         */
        point = this.getTileCollision(s,newPos);
        if (point) {
            /** 
             * if the object is moving up, adjust the y position to the bottom of the tile
             * it collided with
             */
            if (oldVel.y > 0 ) {
                newPos.y = this.tilesToPixels(point.y) - (s.getImage().height);
            }
            /**
             * if the object is moving down, adjust the y position to the top of the tile
             * it collided with
             */
             else if (oldVel.y < 0) {
                newPos.y = this.tilesToPixels(point.y+1);
            }
            /**
             * notify the object saying that they collided veritically
             */
            s.collideVertical();
        }
        /**
         * set the position of the object based off of the adjusted y position
         */
        s.setPosition(newPos.x,newPos.y);
        /**
         * if the object is a player, check for collision with objects and other sprites
         */
        if (s instanceof Player) {
            this.checkPlayerCollision(s as Player, oldY < newPos.y);
        } 
        /**
         * if the object is not a player, check for collision with other sprites
         * if they collide, bounce off of eachother and change directions
         */
        else {
            let spriteCollided=this.getSpriteCollision(s);
            if (spriteCollided && !(spriteCollided instanceof Projectile)) {
                let oldVel=s.getVelocity();
                s.setVelocity(oldVel.x*-1, - oldVel.y);
            }
        }
    }
    
    /**
     * This method runs while the game is running, it updates the whole game as it is going on. 
     * @returns 
     */
    update() {
        /**
         * this if statement states that if the player is dead, you have to start the level over 
         * until you run out of lives
         */
        if (this.player.getState() == CreatureState.DEAD) {

            this.initialize(); //start the level over
            return;
        }
        /**
         * this method moves the sprites within the game
         */
        this.updateSprite(this.player);
        /**
         * this method updates the animation of the sprites in the game
         */
        this.player.update(deltaTime); 
        /**
         * look for all the sprites
         */
        this.sprites.forEach((sprite,index,obj) => {
            /**
             * check to see if the sprite is a creature
             */
            if (sprite instanceof Creature ) {
                /**
                 * if the sprite is dead, remove the sprite
                 */
                if (sprite.getState() == CreatureState.DEAD) {
                    obj.splice(index,1);
                } 
                /**
                 * if the sprite is not dead, update the sprites position
                 */
                else {
                    this.updateSprite(sprite);
                    sprite.update(deltaTime);
                /**
                 * update the sprites effect on the map
                 */
                    sprite.effectMap(this);
                }
            }
            /**
             * If the Sprite is a powerup, update its position 
             */
            else if (sprite instanceof PowerUp) {
                sprite.update(deltaTime);
            } 
            /**
             *  If the sprite is a Projectile, update its position and check for collisions
             */
            else if (sprite instanceof Projectile) {
                this.updateProjectile(sprite);
            }
        });
    }

    /**Per-Pixel Collision Detection
     * Got code from https://openprocessing.org/sketch/149174/ which implements this
     * in Processing (An older precurser to p5.js)
     * I've modified it to work with p5.js and TypeScript
     * this method gets the position of the sprite and calls upon the image collision
    */
    pp_collision(a:Sprite, b:Sprite):boolean {

        /**
         * these parameters get the image of the sprite, they get the position of the sprite
         * they set the position of the sprite
         * then calls upon the image collision method to check for collisions
         */
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
    /**
     * this method deals with the exact pixels that collide with each other in the images
     * @param imgA 
     * @param aix 
     * @param aiy 
     * @param imgB 
     * @param bix 
     * @param biy 
     * @returns 
     */
    pp_image_collision(imgA:p5.Image, aix:number, aiy:number, imgB:p5.Image, bix:number, biy:number) {
        let topA   = aiy;
        let botA   = aiy + imgA.height;
        let leftA  = aix;
        let rightA = aix + imgA.width;
        let topB   = biy;
        let botB   = biy + imgB.height;
        let leftB  = bix;
        let rightB = bix + imgB.width;
        /**
         * the if statement states that if it returns false it will end 
         * the program, but if it returns true there is a collision
         */
        if (botA <= topB  || botB <= topA || rightA <= leftB || rightB <= leftA)
            return false;

        /** 
         * the code below is trying to calculate the point of collision
         * and gathering the data
         */
        let leftO = (leftA < leftB) ? leftB : leftA;
        let rightO = (rightA > rightB) ? rightB : rightA;
        let botO = (botA > botB) ? botB : botA;
        let topO = (topA < topB) ? topB : topA;


        /** 
         * defining the exact location
         */
        let APx = leftO-leftA;   
        let APy = topO-topA;
        let ASx = rightO-leftA;  
        let ASy = botO-topA-1;
        let BPx = leftO-leftB;   
        let BPy = topO-topB;

        let widthO = rightO - leftO;
        let foundCollision = false;

        /**
         * load test images
         */
        imgA.loadPixels();
        imgB.loadPixels();

        /**
         *  These are widths in BYTES. They are used inside the loop
         *  to avoid the need to do the slow multiplications
         */
        let surfaceWidthA = imgA.width;
        let surfaceWidthB = imgB.width;

        let pixelAtransparent = true;
        let pixelBtransparent = true;

        /**
         *  Get start pixel positions
         */ 
        let pA = (APy * surfaceWidthA) + APx;
        let pB = (BPy * surfaceWidthB) + BPx;

        let ax = APx; 
        let ay = APy;
        let bx = BPx; 
        let by = BPy;
        /**
         * loop through each pixel in each image, image A and image B
         */
        for (ay = APy; ay < ASy; ay++) {
            bx = BPx;
            for (ax = APx; ax < ASx; ax++) {
                /**
                 * modified imgA.pixels[pA] in row below
                 * processing kept color data type inside pixels (which were 4 numbers)
                 * sets the transparency of pixel A and pixel B
                 */                
                let pixelAtransparent = imgA.pixels[pA*4] < this.ALPHALEVEL;
                let pixelBtransparent = imgB.pixels[pB*4] < this.ALPHALEVEL;
                /**
                 * if both images are not transparent, there has been a collision
                 */
                if (!pixelAtransparent && !pixelBtransparent) {
                    foundCollision = true;
                    break;
                }
                /**
                 * move to the next pixel in image A and image B
                 */
                pA ++;
                pB ++;
                bx++;
            }
            /**\
             * if a collision has been found, get out of the loop
             */
            if (foundCollision) break;
            /**
             * moves to the start of the next row for image A and image B
             */
            pA = pA + surfaceWidthA - widthO;
            pB = pB + surfaceWidthB - widthO;
            by++;
        }
        /**
         * return true if there has been a collision, otherwise return false
         */
        return foundCollision;
    }


}