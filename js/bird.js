import { Entity } from './entity.js';
import { CONFIG } from './config.js';

/**
 * Bird — l'oiseau du joueur. Hérite d'Entity.
 * Gère la physique (gravité, saut), l'animation de flottement et la chute à la mort.
 *
 * Toutes les méthodes d'animation reçoivent `delta` (le delta-time du ticker PIXI,
 * ≈ 1 à 60 fps) pour rester indépendantes du taux de rafraîchissement.
 */
export class Bird extends Entity {
  constructor(textures, startX, startY) {
    const sprite = new PIXI.AnimatedSprite([
      textures['bird0.png'],
      textures['bird1.png'],
      textures['bird2.png'],
      textures['bird3.png'],
    ]);
    sprite.anchor.set(0.5);
    sprite.animationSpeed = 0.25;
    sprite.play();
    super(sprite);

    this.startX = startX;
    this.startY = startY;
    this.velocityY = 0;
    this.floatTimer = 0; // pour l'animation de flottement en attente

    this.reset();
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.velocityY = 0;
    this.sprite.rotation = 0;
    this.floatTimer = 0;
  }

  jump() {
    this.velocityY = CONFIG.JUMP_STRENGTH;
  }

  // Animation d'attente : l'oiseau flotte doucement
  updateFloating(delta = 1) {
    this.floatTimer += 0.03 * delta;
    this.y = this.startY + 50 * Math.cos(this.floatTimer);
  }

  // Physique en jeu : gravité, inclinaison, plafond
  updatePlaying(delta = 1) {
    this.y += this.velocityY * delta;
    // Nez vers le haut au saut, piqué quand l'oiseau tombe
    this.sprite.rotation = Math.max(-0.5, Math.min(1.2, this.velocityY * 0.08));
    this.velocityY = Math.min(CONFIG.MAX_FALL_SPEED, this.velocityY + CONFIG.GRAVITY * delta);

    // Empêche de sortir par le haut
    if (this.y < this.sprite.height * 0.5) {
      this.velocityY = 0;
      this.y = this.sprite.height * 0.5;
    }
  }

  // Après la collision : l'oiseau pique du nez et tombe jusqu'au sol
  updateDying(maxY, delta = 1) {
    if (this.y < maxY) {
      this.velocityY = Math.min(CONFIG.MAX_FALL_SPEED, this.velocityY + CONFIG.GRAVITY * delta);
      this.y = Math.min(maxY, this.y + this.velocityY * delta);
    }
    this.sprite.rotation = Math.min(Math.PI / 2, this.sprite.rotation + 0.1 * delta);
  }
}
