import { Pipe } from './pipe.js';
import { CONFIG } from './config.js';
import { aabbIntersect } from './utils.js';

/**
 * PipeManager — gère le flux continu de tuyaux : création, défilement,
 * recyclage (sans trou) et comptage des points. Sort cette logique de Game
 * (responsabilité unique).
 */
export class PipeManager {
  constructor(textures, stage) {
    this.pipes = [];
    for (let i = 0; i < CONFIG.PIPE_COUNT; i++) {
      const x = CONFIG.SCREEN_WIDTH + CONFIG.PIPE_FIRST_OFFSET + i * CONFIG.PIPE_SPACING;
      const pipe = new Pipe(textures, x);
      stage.addChild(pipe.sprite);
      this.pipes.push(pipe);
    }
  }

  /**
   * Fait défiler les tuyaux, recycle ceux sortis à gauche et appelle
   * onScore() quand l'oiseau (en birdX) dépasse un tuyau.
   */
  update(speed, birdX, onScore) {
    for (const pipe of this.pipes) {
      pipe.update(speed);

      if (!pipe.passed && pipe.x < birdX) {
        pipe.passed = true;
        onScore();
      }

      if (pipe.isOffScreen()) {
        pipe.reset(this._rightmostX() + CONFIG.PIPE_SPACING);
      }
    }
  }

  // L'oiseau touche-t-il l'un des tuyaux ?
  collidesWith(birdBounds) {
    for (const pipe of this.pipes) {
      if (
        aabbIntersect(pipe.topHitbox.getBounds(), birdBounds) ||
        aabbIntersect(pipe.bottomHitbox.getBounds(), birdBounds)
      ) {
        return true;
      }
    }
    return false;
  }

  reset() {
    for (let i = 0; i < this.pipes.length; i++) {
      const x = CONFIG.SCREEN_WIDTH + CONFIG.PIPE_FIRST_OFFSET + i * CONFIG.PIPE_SPACING;
      this.pipes[i].reset(x);
    }
  }

  _rightmostX() {
    let max = -Infinity;
    for (const pipe of this.pipes) {
      if (pipe.x > max) max = pipe.x;
    }
    return max;
  }
}
