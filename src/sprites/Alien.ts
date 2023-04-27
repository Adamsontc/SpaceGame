import { Fly } from "./Creature.js";

/**
 * An alien is a Sprite that is affected by gravity and can die.
 */

export enum AlienState { DEAD, DYING, NORMAL };

export class Alien extends Fly {

}