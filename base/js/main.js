/**
 * États possibles du jeu
 */
const GameState = {
  READY: 0,
  PLAYING: 1,
  GAME_OVER: 2
};

/* =========================================
   CLASSE BIRD : Encapsule la logique de l'oiseau
   ========================================= */
class Bird {
  constructor(textures, startX, startY) {
    this.startX = startX;
    this.startY = startY;

    this.sprite = new PIXI.AnimatedSprite([
      textures['bird0.png'],
      textures['bird1.png'],
      textures['bird2.png'],
      textures['bird3.png']
    ]);
    this.sprite.anchor.set(0.5);
    this.sprite.animationSpeed = 0.25;
    this.sprite.play();

    this.velocityY = 0;
    this.gravity = 0.5;
    this.jumpStrength = -7;
    this.floatTimer = 0; // Variable utilisée pour l'animation de flottement

    this.reset();
  }

  reset() {
    this.sprite.x = this.startX;
    this.sprite.y = this.startY;
    this.velocityY = 0;
    this.sprite.rotation = 0;
    this.floatTimer = 0;
  }

  jump() {
    this.velocityY = this.jumpStrength;
  }

  updateFloating() {
    this.floatTimer += 0.03;
    this.sprite.y = this.startY + (50 * Math.cos(this.floatTimer));
  }

  updatePlaying() {
    this.sprite.y += this.velocityY;
    this.sprite.rotation = this.velocityY * 0.01;
    this.velocityY = Math.min(10, this.velocityY + this.gravity);

    // Empêcher l'oiseau de sortir par le haut de l'écran
    if (this.sprite.y < this.sprite.height * 0.5) {
      this.velocityY = 0;
      this.sprite.y = this.sprite.height * 0.5;
    }
  }

  getBounds() {
    return this.sprite.getBounds();
  }
}

/* =========================================
   CLASSE PIPE : Encapsule la logique d'un tuyau
   ========================================= */
class Pipe {
  constructor(textures, startX, screenHeight = 700) {
    this.screenHeight = screenHeight;
    this.sprite = new PIXI.Sprite(textures['pipe.png']);
    this.sprite.anchor.set(0.5);

    // Zone de collision supérieure (hitbox)
    this.topHitbox = new PIXI.Graphics();
    this.topHitbox.x = -45;
    this.topHitbox.y = -572;
    this.topHitbox.beginFill(0x000000, 0.5); // Visibilité à des fins de debug
    this.topHitbox.drawRect(0, 0, 90, 486);
    this.sprite.addChild(this.topHitbox);

    // Zone de collision inférieure (hitbox)
    this.bottomHitbox = new PIXI.Graphics();
    this.bottomHitbox.x = -45;
    this.bottomHitbox.y = 87;
    this.bottomHitbox.beginFill(0x000000, 0.5); // Visibilité à des fins de debug
    this.bottomHitbox.drawRect(0, 0, 90, 486);
    this.sprite.addChild(this.bottomHitbox);

    this.reset(startX);
  }

  randomY() {
    // Calcule une hauteur aléatoire entre 20% et 40% de la hauteur de l'écran
    const min = this.screenHeight * 0.2;
    const max = this.screenHeight * 0.4;
    return min + Math.random() * (max - min);
  }

  reset(startX) {
    this.sprite.x = startX;
    this.sprite.y = this.randomY();
  }

  update(speedX) {
    this.sprite.x -= speedX;
  }

  isOffScreen() {
    return this.sprite.x < -this.sprite.width * 0.5;
  }
}

/* =========================================
   CLASSE GAME : L'orchestrateur (Application, Boucle)
   ========================================= */
class Game {
  constructor() {
    this.screenWidth = 500;
    this.screenHeight = 700;
    this.gameSpeed = 3;
    this.state = GameState.READY;
    this.lives = 5;
    this.score = 0;
    this.lifeSprites = [];

    this.app = new PIXI.Application({
      width: this.screenWidth,
      height: this.screenHeight,
      backgroundColor: 0x33CCFF,
    });
    document.body.appendChild(this.app.view);

    const loader = PIXI.Loader.shared;
    loader.add('spriteSheet', 'assets/flappy_bird.json');
    loader.load((_, resources) => {
      this.textures = resources.spriteSheet.textures;
      this.init();
    });
  }

  init() {
    this.backGround = new PIXI.Sprite(this.textures['background.png']);
    this.app.stage.addChild(this.backGround);

    this.ground = new PIXI.Sprite(this.textures['ground.png']);
    this.ground.y = this.screenHeight - this.ground.height * 0.7;
    this.app.stage.addChild(this.ground);

    this.bird = new Bird(this.textures, this.screenWidth * 0.3, this.screenHeight * 0.5);
    this.app.stage.addChild(this.bird.sprite);

    this.pipe = new Pipe(this.textures, this.screenWidth + 100, this.screenHeight);
    this.app.stage.addChild(this.pipe.sprite);

    this.getReady = new PIXI.Sprite(this.textures['get_ready.png']);
    this.getReady.anchor.set(0.5);
    this.getReady.x = this.screenWidth * 0.5;
    this.getReady.y = this.screenHeight * 0.5;
    this.app.stage.addChild(this.getReady);

    this.gameOver = new PIXI.Sprite(this.textures['game_over.png']);
    this.gameOver.anchor.set(0.5);
    this.gameOver.x = this.screenWidth * 0.5;
    this.gameOver.y = this.screenHeight * 0.5;

    for (let i = 0; i < this.lives; i++) {
      const lifeSprite = new PIXI.Sprite(this.textures['bird0.png']);
      lifeSprite.scale.set(0.5);
      lifeSprite.y = this.screenHeight - (lifeSprite.height + 8);
      lifeSprite.x = this.screenWidth - (i + 1) * (lifeSprite.width + 5);
      this.app.stage.addChild(lifeSprite);
      this.lifeSprites.push(lifeSprite);
    }

    this.scoreLabel = new PIXI.Text(`Pts : ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0x1b1b1f,
      align: 'center',
      fontWeight: 'bold'
    });
    this.scoreLabel.x = 10;
    this.scoreLabel.y = this.screenHeight - 26;
    this.app.stage.addChild(this.scoreLabel);

    // On utilise une fonction fléchée pour conserver le "this" du Game
    window.addEventListener('keydown', (e) => this.onKeyDown(e));

    this.app.ticker.add(() => this.update());
  }

  update() {
    this.ground.x -= this.gameSpeed;
    this.ground.x %= 120; // 120 correspond à la largeur de répétition du motif du sol

    if (this.state === GameState.READY) {
      this.bird.updateFloating();
    } else if (this.state === GameState.PLAYING) {
      this.bird.updatePlaying();

      // Collisions
      const birdBounds = this.bird.getBounds();
      if (
        this.collide(this.pipe.topHitbox.getBounds(), birdBounds) ||
        this.collide(this.pipe.bottomHitbox.getBounds(), birdBounds) ||
        this.collide(this.ground.getBounds(), birdBounds)
      ) {
        this.handleCollision();
      }

      // Défilement et recyclage des tuyaux
      this.pipe.update(this.gameSpeed);
      if (this.pipe.isOffScreen()) {
        this.pipe.reset(this.screenWidth + this.pipe.sprite.width * 0.5);
        this.score++;
        this.scoreLabel.text = `Pts : ${this.score}`;
      }
    }
  }

  handleCollision() {
    this.bird.reset();
    // Fix: * 0.5 au lieu de + 0.5 pour cibler le centre de l'écran pour la réinitialisation
    this.pipe.reset(this.screenWidth + this.pipe.sprite.width * 0.5);

    this.lives--;

    if (this.lives < 0) {
      this.app.stage.addChild(this.gameOver);
      this.state = GameState.GAME_OVER;
    } else {
      const lifeIndicator = this.lifeSprites[this.lives];
      if (lifeIndicator) {
        lifeIndicator.alpha = 0.5;
      }
    }
  }

  onKeyDown(e) {
    if (e.code === 'Space') { // Remplacement de l'ancien 'e.keyCode === 32'
      if (this.state === GameState.READY) {
        this.app.stage.removeChild(this.getReady);
        this.state = GameState.PLAYING;
      } else if (this.state === GameState.PLAYING) {
        this.bird.jump();
      } else if (this.state === GameState.GAME_OVER) {
        this.resetGame();
      }
    }
  }

  resetGame() {
    this.bird.reset();
    this.lives = 5;
    this.score = 0;
    this.scoreLabel.text = `Pts : ${this.score}`;

    for (const sprite of this.lifeSprites) {
      sprite.alpha = 1.0;
    }

    this.app.stage.removeChild(this.gameOver);
    this.app.stage.addChild(this.getReady);
    this.state = GameState.READY;
  }

  collide(r1, r2) {
    return !(
      r1.x + r1.width < r2.x ||
      r2.x + r2.width < r1.x ||
      r1.y + r1.height < r2.y ||
      r2.y + r2.height < r1.y
    );
  }
}

// C'est parti !
new Game();
