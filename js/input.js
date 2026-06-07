import { CONFIG } from './config.js';

/**
 * InputManager — centralise toutes les entrées (clavier + souris + tactile).
 * Deux actions exposées : « action » (Espace / clic / tap) et « pause » (P / Échap).
 */
export class InputManager {
  constructor(stage) {
    this._action = () => {};
    this._pause = () => {};

    // Souris / tactile : tout le canvas est cliquable (via la scène PIXI)
    stage.interactive = true;
    stage.hitArea = new PIXI.Rectangle(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
    stage.on('pointerdown', () => this._action());

    // Clavier
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // évite de faire défiler la page
        this._action();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        this._pause();
      }
    });
  }

  onAction(fn) {
    this._action = fn;
  }

  onPause(fn) {
    this._pause = fn;
  }
}
