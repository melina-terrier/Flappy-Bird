import { CONFIG } from './config.js';
import { aabbIntersect } from './utils.js';
import { Bird } from './bird.js';
import { PipeManager } from './pipeManager.js';
import { HUD } from './hud.js';
import { SoundManager } from './sound.js';
import { InputManager } from './input.js';
import { ReadyState, CountdownState, PlayingState, PausedState, GameOverState } from './states.js';

/**
 * Game — l'orchestrateur. Possède la scène PIXI, les entités et les états,
 * et fournit les mécaniques partagées (défilement, collisions, score…).
 * La logique propre à chaque phase vit dans les classes d'état (pattern State).
 */
export class Game {
  constructor() {
    this.score = 0;
    this.gameSpeed = CONFIG.START_SPEED;
    this.bestScore = this._loadBest();

    this.app = new PIXI.Application({
      width: CONFIG.SCREEN_WIDTH,
      height: CONFIG.SCREEN_HEIGHT,
      backgroundColor: CONFIG.BG_COLOR,
    });
    document.body.appendChild(this.app.view);
    // Accessibilité : nom du canvas pour les lecteurs d'écran
    this.app.view.setAttribute('aria-label',
      'Jeu Flappy Bird — appuyez sur Espace, cliquez ou touchez l’écran pour faire voler l’oiseau');
    this._fit();
    window.addEventListener('resize', () => this._fit());

    const loader = PIXI.Loader.shared;
    if (!loader.resources.spriteSheet) {
      loader.add('spriteSheet', 'assets/flappy_bird.json');
    }
    loader.load((_, resources) => {
      this.textures = resources.spriteSheet.textures;
      this.init();
    });
  }

  init() {
    const t = this.textures;

    // Fond avec parallaxe : deux sprites identiques qui défilent et bouclent
    this.bg1 = new PIXI.Sprite(t['background.png']);
    this.bg2 = new PIXI.Sprite(t['background.png']);
    this.bgWidth = this.bg1.width;
    this.bg2.x = this.bgWidth;
    this.app.stage.addChild(this.bg1);
    this.app.stage.addChild(this.bg2);

    // Tuyaux (derrière le sol et l'oiseau)
    this.pipeManager = new PipeManager(t, this.app.stage);

    // Sol
    this.ground = new PIXI.Sprite(t['ground.png']);
    this.ground.y = CONFIG.SCREEN_HEIGHT - this.ground.height * 0.7;
    this.app.stage.addChild(this.ground);

    // Interface — couche ARRIÈRE (Get Ready / compte à rebours), sous l'oiseau
    this.hud = new HUD(t);
    this.app.stage.addChild(this.hud.backLayer);

    // Oiseau (au-dessus de l'écran « Get Ready » → toujours visible)
    this.bird = new Bird(t, CONFIG.SCREEN_WIDTH * CONFIG.BIRD_X_RATIO, CONFIG.SCREEN_HEIGHT * 0.5);
    this.app.stage.addChild(this.bird.sprite);

    // Interface — couche AVANT (score, game over, pause, flash), au-dessus de tout
    this.app.stage.addChild(this.hud.frontLayer);
    this.hud.onReplay(() => this.handleAction());

    // Son et entrées
    this.sound = new SoundManager();
    this.input = new InputManager(this.app.stage);
    this.input.onAction(() => this.handleAction());
    this.input.onPause(() => this.handlePause());

    // Pause automatique quand on quitte l'onglet (évite un saut de physique au retour)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.currentState === this.states.playing) {
        this.handlePause();
      }
    });

    // États (pattern State)
    this.states = {
      ready: new ReadyState(),
      countdown: new CountdownState(),
      playing: new PlayingState(),
      paused: new PausedState(),
      gameover: new GameOverState(),
    };
    this.currentState = null;

    // Boucle de jeu : delta-time + filet de sécurité contre une exception
    this.app.ticker.add((delta) => {
      try {
        this.hud.update(delta);
        this.currentState.update(this, delta);
      } catch (e) {
        console.error('Erreur dans la boucle de jeu :', e);
      }
    });

    this.changeState(this.states.ready);
  }

  // --- Délégation à l'état courant ---
  changeState(state) {
    if (this.currentState) this.currentState.exit(this);
    this.currentState = state;
    state.enter(this);
  }
  handleAction() {
    this.currentState.handleAction(this);
  }
  handlePause() {
    this.currentState.handlePause(this);
  }

  // --- Mécaniques partagées entre les états ---
  reset() {
    this.score = 0;
    this.gameSpeed = CONFIG.START_SPEED;
    this.bird.reset();
    this.bird.sprite.play();
    this.pipeManager.reset();
    this.hud.reset();
  }

  scrollGround(delta = 1) {
    this.ground.x -= this.gameSpeed * delta;
    this.ground.x %= CONFIG.GROUND_PATTERN;

    // Parallaxe : le fond défile plus lentement que le sol, et boucle
    const dx = this.gameSpeed * CONFIG.PARALLAX_FACTOR * delta;
    this.bg1.x -= dx;
    this.bg2.x -= dx;
    if (this.bg1.x <= -this.bgWidth) this.bg1.x = this.bg2.x + this.bgWidth;
    if (this.bg2.x <= -this.bgWidth) this.bg2.x = this.bg1.x + this.bgWidth;
  }

  checkCollisions() {
    const b = this.bird.getBounds();
    return aabbIntersect(this.ground.getBounds(), b) || this.pipeManager.collidesWith(b);
  }

  addPoint() {
    this.score++;
    this.hud.setScore(this.score);
    this.sound.point();
    // Montée en douceur jusqu'à la vitesse de croisière
    this.gameSpeed = Math.min(CONFIG.MAX_SPEED, CONFIG.START_SPEED + this.score * CONFIG.SPEED_PER_POINT);
  }

  die() {
    this.sound.hit();
    this.hud.flash();
    this.changeState(this.states.gameover);
  }

  groundTop() {
    return this.ground.y - this.bird.sprite.height * 0.5;
  }

  // Lecture protégée : localStorage peut lever (navigation privée, stockage bloqué)
  _loadBest() {
    try {
      return Number(localStorage.getItem(CONFIG.BEST_SCORE_KEY)) || 0;
    } catch (e) {
      /* localStorage indisponible : on démarre sans meilleur score */
      return 0;
    }
  }

  saveBest() {
    try {
      localStorage.setItem(CONFIG.BEST_SCORE_KEY, String(this.bestScore));
    } catch (e) {
      /* localStorage indisponible : on ignore */
    }
  }

  // Canvas responsive : s'adapte à la fenêtre en gardant le ratio
  _fit() {
    const scale = Math.min(
      window.innerWidth / CONFIG.SCREEN_WIDTH,
      window.innerHeight / CONFIG.SCREEN_HEIGHT
    );
    this.app.view.style.width = Math.round(CONFIG.SCREEN_WIDTH * scale) + 'px';
    this.app.view.style.height = Math.round(CONFIG.SCREEN_HEIGHT * scale) + 'px';
  }
}
