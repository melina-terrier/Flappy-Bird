import { CONFIG } from './config.js';

/**
 * Pattern State — chaque état du jeu est un objet avec enter / update / exit
 * et réagit aux entrées (handleAction / handlePause). Game délègue à l'état courant.
 */
export class State {
  enter(game) {}
  update(game) {}
  exit(game) {}
  handleAction(game) {}
  handlePause(game) {}
}

// En attente : l'oiseau flotte, le décor défile, on attend l'appui pour lancer
export class ReadyState extends State {
  enter(game) {
    game.reset();
  }
  update(game) {
    game.scrollGround();
    game.bird.updateFloating();
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
  update(game) {
    game.scrollGround();
    game.bird.updateFloating();
    this.frames--;
    if (this.frames <= 0) {
      game.changeState(game.states.playing);
      return;
    }
    game.hud.showCountdown(Math.ceil(this.frames / CONFIG.COUNTDOWN_STEP_FRAMES));
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
  update(game) {
    game.scrollGround();
    game.bird.updatePlaying();
    if (game.checkCollisions()) {
      game.die();
      return;
    }
    game.pipeManager.update(game.gameSpeed, game.bird.x, () => game.addPoint());
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
  update(game) {
    game.bird.updateDying(game.groundTop());
  }
  handleAction(game) {
    game.changeState(game.states.ready);
  }
}
