/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

// variable
// dimension de la scène
let wST = 500;
let hST = 700;

// references les textures du SpriteSheet
let textures;
// reference les elements graphiques
let backGround, ground, bird, pipe, gameOver, getReady;


// vitesse, amplitude, angle
let vX = 3;
let vY = 0, acceleration =0.5, impulsion = -7;

// reference les rectangles pour les colision
let rTop, rBottom
let yb = 0;
let starVar = 0;

// tableau pour les images qui symbolisent les vies et le nombre de vies attribuées au joueur
let tLives = [], nbLives = 5;
let labelPts, nbPts = 0;

// méthode d'initialisation
// creation d'une application PIXI
// ajouter des options
const app = new PIXI.Application({
  width: wST,
  height: hST,
  backgroundColor: 0x33CCFF,
});

// ajout de la vue PIXI dans le DOM
document.body.appendChild(app.view);

// charger les actifs externes
// utilise le loader par defaut de PIXI
const loader = PIXI.Loader.shared;
// ajout du fichier à charger
// premier paramètre : identifiant
// second paramètre : chemin d'accès vers le fichier
loader.add('spriteSheet', 'assets/flappy_bird.json');
// lander le chargement
loader.load((loader, resources) => {
  textures = resources.spriteSheet.textures;
  // les textures (images) chargées, on initialise les élément graphiques du jeu
  init();
});

// fonction d'initialisation
function init() {
  createBg();
  createGround();
  createBird();
  createPipe();
  createGr();
  createLives();
  createGameOver();
  createPts();

  // ecouteur d'evenement clavier
  window.addEventListener('keydown', onKeyDown);
  // mise en place du ticker (horloge)
  app.ticker.add(() => {
    ground.x -= vX;
    ground.x %= 120;

    // phase du jeu 0
    if (starVar === 0) {
      yb += 0.03;
      bird.y = hST * 0.5 + (50 * (Math.cos(yb)));
    } else if (starVar === 1) {
      // phase du jeu 1
      // gestion de l'oiseau
      bird.y += vY;
      bird.rotation = vY * 0.01;
      vY = Math.min(10, vY + acceleration);

      // pour empécher l'oiseau de sortir vers le haut
      if (bird.y < bird.height * 0.5) {
        vY = 0;
        bird.y= bird.height * 0.5;
      }
      // test si l'oiseau entre en contact avec le sol, les tuyaux
      if (collide(rTop.getBounds(), bird.getBounds()) || collide(rBottom.getBounds(), bird.getBounds()) || collide(ground.getBounds(), bird.getBounds())) {
        // replace l'oiseau
        bird.y = hST*0.5;
        // replace les tuyaux
        pipe.x = wST + pipe.width + 0.5;
        pipe.y = rdm(hST*0.2, hST*0.4);
        // réinitialise la vitesse verticale
        vY = 0;
        // vérifie le nombre de vie restante
        let l = tLives[--nbLives];
        if (nbLives<0) {
          app.stage.addChild(gameOver);
          starVar = 2;
        } else {
          l.alpha=0.5;
        }
      }

      // gestion des tuxaux
      pipe.x -= vX;
      if (pipe.x<-pipe.width*0.5) {
        pipe.x = wST + pipe.width*0.5;
        pipe.y = rdm(hST*0.2, hST*0.4);
        nbPts ++;
        labelPts.text = `Pts:${nbPts}`;
      }
    }
  });
}

function onKeyDown(e) {
  if (e.keyCode===32) {
    if (starVar === 0) {
      app.stage.removeChild(getReady);
      starVar = 1;
    } else if (starVar === 1) {
      vY = impulsion;
    } else if (starVar===2) {
      bird.y = hST * 0.5;
      vY = 0;
      bird.rotation = 0;
      nbLives = 5;
      for (let v of tLives) v.alpha=1.0;
      app.stage.removeChild(gameOver);
      app.stage.addChild(getReady);
      starVar = 0;
    }
  }
};

function createBg() {
  backGround = new PIXI.Sprite(textures['background.png']);
  app.stage.addChild(backGround);
}

function createGround() {
  ground = new PIXI.Sprite(textures['ground.png']);
  ground.y = hST-ground.height*0.7;
  app.stage.addChild(ground);
}

function createBird() {
  bird = new PIXI.AnimatedSprite([
    textures['bird0.png'],
    textures['bird1.png'],
    textures['bird2.png'],
    textures['bird3.png']]);
  bird.y = hST*0.5;
  bird.x = wST*0.3;
  bird.anchor.set(0.5);
  bird.animationSpeed = 0.25;
  bird.play();
  app.stage.addChild(bird);
}

function createPipe() {
  pipe = new PIXI.Sprite(textures['pipe.png']);
  pipe.anchor.set(0.5);
  pipe.x = wST + pipe.width;
  pipe.y = hST * 0.5;
  app.stage.addChild(pipe);

  // création des rectangles pour les colisions avec l'oiseau
  rTop = new PIXI.Graphics();
  rTop.x = -45;
  rTop.y = -572;
  rTop.beginFill(0, 0.5);
  rTop.drawRect(0, 0, 90, 486);
  pipe.addChild(rTop);

  rBottom = new PIXI.Graphics();
  rBottom.x = -45;
  rBottom.y = 87;
  rBottom.beginFill(0, 0.5);
  rBottom.drawRect(0, 0, 90, 486);
  pipe.addChild(rBottom);
}

function createGameOver() {
  gameOver = new PIXI.Sprite(textures['game_over.png']);
  gameOver.anchor.set(0.5);
  gameOver.x = wST * 0.5;
  gameOver.y = hST * 0.5;
}

function createLives() {
  for (let i=0; i<nbLives; i++) {
    let b = new PIXI.Sprite(textures['bird0.png']);
    b.scale.set(0.5);
    b.y = hST - (b.height+8);
    b.x = wST - (i+1) * (b.width+5);
    app.stage.addChild(b);
    tLives.push(b);
  }
}

function createPts() {
  labelPts = new PIXI.Text('Pts :' + nbPts, {fontFamily: 'Arial', fontSizes: 16, fill: 0x1b1b1f, align: 'center', fontWeigh: 700});
  labelPts.x = 10;
  labelPts.y = hST -26;
  app.stage.addChild(labelPts);
}

function createGr() {
  getReady = new PIXI.Sprite(textures['get_ready.png']);
  app.stage.addChild(getReady);
  getReady.anchor.set(0.5);
  getReady.y = hST * 0.5;
  getReady.x = wST * 0.5;
}

// generation de nombre aléatoire
function rdm(x = NaN, y = NaN) {
  // si x et y sont définies
  if (!isNaN(x) && !isNaN(y)) {
    return x + Math.random() * (y-x);
  };
  if (!isNaN(x)) {
    return Math.random() * x;
  }
  return Math.random();
}

function collide(r1, r2) {
  if (r1.x + r1.width < r2.x || r2.x + r2.width < r1.x ||r1.y + r1.height < r2.y ||r2.y + r2.height < r1.y) {
    return false;
  } else {
    return true;
  }
}

/*
    let s1 = new PIXI.Graphics();
    s1.beginFill(0x00ff00);
    s1.drawRect(0, 0, 50, 50);
    s1.endFill();
    s1.x = 100;
    s1.y = 100;
    s1.interactive = true;
    app.stage.addChild(s1);

    let s2 = new PIXI.Graphics();
    s2.beginFill(0xff0000);
    s2.drawRect(0, 0, 50, 50);
    s2.endFill();
    s2.x = 300;
    s2.y = 100;
    s2.interactive = true;
    app.stage.addChild(s2);

    s2.on('pointermove', function (e) {
        s2.x = e.data.global.x;
        s2.y = e.data.global.y;
        if(collide(s1.getBounds(), s2.getBounds())){
            s2.alpha = 0.5;
        }
        else {
            s2.alpha = 1.0;
        }
    });
*/
