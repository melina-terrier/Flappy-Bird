import { Game } from './game.js';

/**
 * Point d'entrée : on charge d'abord la police pixel (« Press Start 2P »)
 * pour que les textes PIXI s'affichent avec, puis on lance le jeu.
 */
async function boot() {
  if (document.fonts && document.fonts.load) {
    try {
      await Promise.all([
        document.fonts.load('16px "Press Start 2P"'),
        document.fonts.load('40px "Press Start 2P"'),
      ]);
    } catch (e) {
      /* police indisponible (hors ligne) : on continue avec la police de secours */
    }
  }
  new Game();
}

boot();
