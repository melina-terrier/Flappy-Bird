import { CONFIG } from './config.js';

const W = CONFIG.SCREEN_WIDTH;
const H = CONFIG.SCREEN_HEIGHT;

/**
 * HUD — toute l'interface : score (bas + gros score central animé),
 * écran « Get Ready », compte à rebours, panneau de game over (score,
 * meilleur score, médaille, bouton Rejouer), overlay de pause et flash.
 */
export class HUD {
  constructor(textures) {
    // Deux couches pour gérer le z-order autour de l'oiseau :
    //  - backLayer : « Get Ready » + compte à rebours → DERRIÈRE l'oiseau (il reste visible)
    //  - frontLayer : score, game over, pause, flash → DEVANT l'oiseau
    this.backLayer = new PIXI.Container();
    this.frontLayer = new PIXI.Container();
    this._pop = 1; // facteur d'agrandissement du gros score (animation « pop »)
    this._replayCb = () => {};

    // --- Écran « Get Ready » (derrière l'oiseau) ---
    this.getReady = new PIXI.Sprite(textures['get_ready.png']);
    this.getReady.anchor.set(0.5);
    this.getReady.position.set(W / 2, H * 0.22); // remonté pour ne pas chevaucher l'oiseau
    this.backLayer.addChild(this.getReady);

    // --- Compte à rebours (derrière l'oiseau) ---
    this.countdown = new PIXI.Text('', this._style(56, 8));
    this.countdown.anchor.set(0.5);
    this.countdown.position.set(W / 2, H * 0.3);
    this.countdown.visible = false;
    this.backLayer.addChild(this.countdown);

    // --- Score en bas à gauche ---
    this.scoreLabel = new PIXI.Text('Pts : 0', this._style(12));
    this.scoreLabel.position.set(10, H - 30);
    this.frontLayer.addChild(this.scoreLabel);

    // --- Gros score central (pendant la partie) ---
    this.bigScore = new PIXI.Text('0', this._style(40, 6));
    this.bigScore.anchor.set(0.5);
    this.bigScore.position.set(W / 2, 90);
    this.bigScore.visible = false;
    this.frontLayer.addChild(this.bigScore);

    // --- Panneau de game over ---
    this.gameOverPanel = this._buildGameOverPanel(textures);
    this.gameOverPanel.visible = false;
    this.frontLayer.addChild(this.gameOverPanel);

    // --- Overlay de pause ---
    this.pauseOverlay = new PIXI.Container();
    const dim = new PIXI.Graphics();
    dim.beginFill(0x000000, 0.45).drawRect(0, 0, W, H).endFill();
    const pauseTxt = new PIXI.Text('PAUSE', this._style(28, 6));
    pauseTxt.anchor.set(0.5);
    pauseTxt.position.set(W / 2, H / 2);
    this.pauseOverlay.addChild(dim, pauseTxt);
    this.pauseOverlay.visible = false;
    this.frontLayer.addChild(this.pauseOverlay);

    // --- Flash blanc (impact), tout au-dessus ---
    this.flashRect = new PIXI.Graphics();
    this.flashRect.beginFill(0xffffff).drawRect(0, 0, W, H).endFill();
    this.flashRect.alpha = 0;
    this.frontLayer.addChild(this.flashRect);
  }

  // Style de texte commun (police pixel + contour)
  _style(fontSize, strokeThickness = 4, fill = 0xffffff) {
    return {
      fontFamily: CONFIG.FONT,
      fontSize,
      fill,
      stroke: 0x1b1b1f,
      strokeThickness,
      fontWeight: 'bold',
    };
  }

  _buildGameOverPanel(textures) {
    const c = new PIXI.Container();
    c.position.set(W / 2, H / 2);

    // Titre « Game Over »
    const title = new PIXI.Sprite(textures['game_over.png']);
    title.anchor.set(0.5);
    title.position.set(0, -120);
    c.addChild(title);

    // Plaque
    const board = new PIXI.Graphics();
    board.lineStyle(4, 0x5e5b3f).beginFill(0xded895).drawRoundedRect(-120, -80, 240, 160, 14).endFill();
    c.addChild(board);

    // Médaille (cercle coloré dessiné selon le score)
    this.medal = new PIXI.Graphics();
    this.medal.position.set(-65, 0);
    c.addChild(this.medal);

    // Colonnes Score / Best (à droite de la médaille)
    const lblScore = new PIXI.Text('SCORE', this._style(8, 3, 0x5e5b3f));
    lblScore.anchor.set(0.5);
    lblScore.position.set(45, -42);
    c.addChild(lblScore);

    this.finalScoreText = new PIXI.Text('0', this._style(20, 4));
    this.finalScoreText.anchor.set(0.5);
    this.finalScoreText.position.set(45, -18);
    c.addChild(this.finalScoreText);

    const lblBest = new PIXI.Text('BEST', this._style(8, 3, 0x5e5b3f));
    lblBest.anchor.set(0.5);
    lblBest.position.set(45, 14);
    c.addChild(lblBest);

    this.bestScoreText = new PIXI.Text('0', this._style(20, 4));
    this.bestScoreText.anchor.set(0.5);
    this.bestScoreText.position.set(45, 38);
    c.addChild(this.bestScoreText);

    // Badge « NEW! » (nouveau record)
    this.newBest = new PIXI.Text('NEW!', this._style(8, 3, 0xff4444));
    this.newBest.anchor.set(0.5);
    this.newBest.position.set(95, 38);
    this.newBest.visible = false;
    c.addChild(this.newBest);

    // Bouton Rejouer (cliquable)
    this.replayBtn = new PIXI.Container();
    const btnBg = new PIXI.Graphics();
    btnBg.lineStyle(3, 0x9c5a00).beginFill(0xf8a01c).drawRoundedRect(-75, -18, 150, 36, 8).endFill();
    const btnTxt = new PIXI.Text('REJOUER', this._style(12, 3));
    btnTxt.anchor.set(0.5);
    this.replayBtn.addChild(btnBg, btnTxt);
    this.replayBtn.position.set(0, 115);
    this.replayBtn.interactive = true;
    this.replayBtn.cursor = 'pointer'; // curseur main (compatible PIXI v5 et v7)
    this.replayBtn.on('pointerdown', (e) => {
      e.stopPropagation(); // empêche le clic « jouer » global de se déclencher aussi
      this._replayCb();
    });
    c.addChild(this.replayBtn);

    return c;
  }

  onReplay(fn) {
    this._replayCb = fn;
  }

  // Animations par frame (pop du score + disparition du flash), pondérées par delta
  update(delta = 1) {
    this._pop += (1 - this._pop) * 0.2 * delta;
    this.bigScore.scale.set(this._pop);
    if (this.flashRect.alpha > 0) {
      this.flashRect.alpha = Math.max(0, this.flashRect.alpha - 0.06 * delta);
    }
  }

  setScore(score) {
    this.scoreLabel.text = `Pts : ${score}`;
    this.bigScore.text = `${score}`;
    this._pop = 1.6; // déclenche l'animation « pop »
  }

  flash() {
    this.flashRect.alpha = 0.8;
  }

  showGetReady() {
    this.getReady.visible = true;
  }
  hideGetReady() {
    this.getReady.visible = false;
  }

  showBigScore() {
    this.bigScore.visible = true;
  }

  showCountdown(n) {
    this.countdown.visible = true;
    this.countdown.text = `${n}`;
  }
  hideCountdown() {
    this.countdown.visible = false;
  }

  showPause() {
    this.pauseOverlay.visible = true;
  }
  hidePause() {
    this.pauseOverlay.visible = false;
  }

  showGameOver(score, best, isNewBest) {
    this.bigScore.visible = false;
    this.finalScoreText.text = `${score}`;
    this.bestScoreText.text = `${best}`;
    this.newBest.visible = isNewBest;
    this._drawMedal(score);
    this.gameOverPanel.visible = true;
  }
  hideGameOver() {
    this.gameOverPanel.visible = false;
  }

  // Remet le HUD dans l'état « prêt »
  reset() {
    this.scoreLabel.text = 'Pts : 0';
    this.bigScore.text = '0';
    this.bigScore.visible = false;
    this.gameOverPanel.visible = false;
    this.pauseOverlay.visible = false;
    this.countdown.visible = false;
    this.getReady.visible = true;
  }

  // Éclaircit (f > 1) ou assombrit (f < 1) une couleur hexadécimale
  _shade(color, f) {
    const r = Math.min(255, Math.round(((color >> 16) & 0xff) * f));
    const g = Math.min(255, Math.round(((color >> 8) & 0xff) * f));
    const b = Math.min(255, Math.round((color & 0xff) * f));
    return (r << 16) | (g << 8) | b;
  }

  // Points (tableau plat x,y,…) d'une étoile à `spikes` branches, pointe en haut
  _starPoints(spikes, outer, inner) {
    const pts = [];
    let rot = -Math.PI / 2;
    const step = Math.PI / spikes;
    for (let i = 0; i < spikes; i++) {
      pts.push(Math.cos(rot) * outer, Math.sin(rot) * outer); rot += step;
      pts.push(Math.cos(rot) * inner, Math.sin(rot) * inner); rot += step;
    }
    return pts;
  }

  // Dessine une médaille « métallique » : tranche + biseau, faux dégradé
  // lumière/ombre, anneau gravé, étoile centrale et reflet.
  _drawMedal(score) {
    const g = this.medal;
    g.clear();
    const medal = CONFIG.MEDALS.find((m) => score >= m.min);
    if (!medal) {
      g.visible = false;
      return;
    }
    g.visible = true;

    const base = medal.color;
    const rimEdge = this._shade(base, 0.45); // tranche extérieure
    const rim = this._shade(base, 0.62);     // rebord métallique
    const faceLo = this._shade(base, 0.85);  // bas (ombre)
    const faceHi = this._shade(base, 1.18);  // haut (lumière)
    const star = this._shade(base, 1.4);     // étoile claire

    // Rebord (tranche foncée + biseau)
    g.lineStyle(0);
    g.beginFill(rimEdge).drawCircle(0, 0, 27).endFill();
    g.beginFill(rim).drawCircle(0, 0, 26).endFill();

    // Face : disque sombre, disque clair décalé vers le haut, puis couleur de base
    g.beginFill(faceLo).drawCircle(0, 0, 23).endFill();
    g.beginFill(faceHi).drawCircle(0, -2, 21).endFill();
    g.beginFill(base).drawCircle(0, 0, 19).endFill();

    // Anneau gravé juste à l'intérieur du rebord
    g.lineStyle(1.5, rim, 0.9).drawCircle(0, 0, 20);
    g.lineStyle(0);

    // Étoile centrale gravée (remplissage clair + léger contour pour le relief)
    const pts = this._starPoints(5, 14, 6);
    g.beginFill(star).drawPolygon(pts).endFill();
    g.lineStyle(1, rim, 0.6).drawPolygon(pts);
    g.lineStyle(0);

    // Reflet (brillance) en haut à gauche
    g.beginFill(0xffffff, 0.5).drawCircle(-7, -8, 4).endFill();
  }
}
