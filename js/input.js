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

    // Clavier : plusieurs touches pour « sauter », P/Échap pour la pause
    const actionKeys = ['Space', 'ArrowUp', 'Enter', 'KeyW'];
    const pauseKeys = ['KeyP', 'Escape'];
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return; // ignore la répétition clavier (touche maintenue)
      if (actionKeys.includes(e.code)) {
        e.preventDefault(); // évite le défilement de la page (Espace / flèches)
        this._action();
      } else if (pauseKeys.includes(e.code)) {
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
