import { CONFIG } from './config.js';

/**
 * Pattern State — chaque état du jeu est un objet avec enter / update / exit
 * et réagit aux entrées (handleAction / handlePause). Game délègue à l'état courant.
 *
 * update(game, delta) reçoit le delta-time du ticker PIXI (≈ 1 à 60 fps) pour
 * que la vitesse réelle soit identique quel que soit le taux de rafraîchissement.
 */
export class State {
  enter(game) {}
  update(game, delta = 1) {}
  exit(game) {}
  handleAction(game) {}
  handlePause(game) {}
}

// En attente : l'oiseau flotte, le décor défile, on attend l'appui pour lancer
export class ReadyState extends State {
  enter(game) {
    game.reset();
  }
  update(game, delta = 1) {
    game.scrollGround(delta);
    game.bird.updateFloating(delta);
  }
  handleAction(game) {
    game.changeState(game.states.countdown);
  }
}

// Compte à rebours 3·2·1 avant le départ
export class CountdownState extends State {
  enter(game) {
    game.sound.resume(); // réveille l'audio dans le geste utilisateur
    game.hud.hideGetReady();
    this.frames = CONFIG.COUNTDOWN_FROM * CONFIG.COUNTDOWN_STEP_FRAMES;
    game.hud.showCountdown(CONFIG.COUNTDOWN_FROM);
  }
  update(game, delta = 1) {
    game.scrollGround(delta);
    game.bird.updateFloating(delta);
    this.frames -= delta;
    if (this.frames <= 0) {
      game.changeState(game.states.playing);
      return;
    }
    game.hud.showCountdown(Math.ceil(this.frames / CONFIG.COUNTDOWN_STEP_FRAMES));
  }
  // Appuyer pendant le décompte démarre tout de suite (et fait sauter l'oiseau)
  handleAction(game) {
    game.changeState(game.states.playing);
    game.bird.jump();
    game.sound.jump();
  }
  exit(game) {
    game.hud.hideCountdown();
  }
}

// En jeu : physique, collisions, comptage, défilement des tuyaux
export class PlayingState extends State {
  enter(game) {
    // Départ propre de l'oiseau au centre
    game.bird.y = game.bird.startY;
    game.bird.velocityY = 0;
    game.hud.showBigScore();
  }
  update(game, delta = 1) {
    game.scrollGround(delta);
    game.bird.updatePlaying(delta);
    if (game.checkCollisions()) {
      game.die();
      return;
    }
    game.pipeManager.update(game.gameSpeed, game.bird.x, () => game.addPoint(), delta);
  }
  handleAction(game) {
    game.bird.jump();
    game.sound.jump();
  }
  handlePause(game) {
    game.changeState(game.states.paused);
  }
}

// En pause : tout est figé
export class PausedState extends State {
  enter(game) {
    game.hud.showPause();
  }
  exit(game) {
    game.hud.hidePause();
  }
  handlePause(game) {
    game.changeState(game.states.playing);
  }
}

// Game over : l'oiseau tombe, on affiche le panneau (score, record, médaille)
export class GameOverState extends State {
  enter(game) {
    game.bird.sprite.stop();
    game.sound.die();
    const isNewBest = game.score > game.bestScore;
    if (isNewBest) {
      game.bestScore = game.score;
      game.saveBest();
    }
    game.hud.showGameOver(game.score, game.bestScore, isNewBest);
  }
  update(game, delta = 1) {
    game.bird.updateDying(game.groundTop(), delta);
  }
  handleAction(game) {
    game.changeState(game.states.ready);
  }
}
