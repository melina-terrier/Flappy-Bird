import { Entity } from './entity.js';
import { CONFIG } from './config.js';

/**
 * Pipe — un tuyau (paire haut/bas avec un trou). Hérite d'Entity.
 * Porte ses deux zones de collision invisibles (topHitbox / bottomHitbox).
 */
export class Pipe extends Entity {
  constructor(textures, startX) {
    const sprite = new PIXI.Sprite(textures['pipe.png']);
    sprite.anchor.set(0.5);
    super(sprite);

    this.screenHeight = CONFIG.SCREEN_HEIGHT;

    // Zone de collision supérieure (invisible : alpha 0)
    this.topHitbox = new PIXI.Graphics();
    this.topHitbox.position.set(-45, -572);
    this.topHitbox.beginFill(0x000000, 0).drawRect(0, 0, 90, 486).endFill();
    sprite.addChild(this.topHitbox);

    // Zone de collision inférieure (invisible : alpha 0)
    this.bottomHitbox = new PIXI.Graphics();
    this.bottomHitbox.position.set(-45, 87);
    this.bottomHitbox.beginFill(0x000000, 0).drawRect(0, 0, 90, 486).endFill();
    sprite.addChild(this.bottomHitbox);

    this.passed = false; // l'oiseau a-t-il déjà dépassé ce tuyau ? (comptage)
    this.reset(startX);
  }

  // Hauteur aléatoire du trou (entre 20 % et 40 % de la hauteur)
  randomY() {
    const min = this.screenHeight * 0.2;
    const max = this.screenHeight * 0.4;
    return min + Math.random() * (max - min);
  }

  reset(startX) {
    this.x = startX;
    this.y = this.randomY();
    this.passed = false;
  }

  // dx = déplacement déjà multiplié par le delta-time
  update(dx) {
    this.x -= dx;
  }

  isOffScreen() {
    return this.x < -this.sprite.width * 0.5;
  }
}
