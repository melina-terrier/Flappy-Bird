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
    this.container = new PIXI.Container();
    this._pop = 1; // facteur d'agrandissement du gros score (animation « pop »)
    this._replayCb = () => {};

    // --- Écran « Get Ready » ---
    this.getReady = new PIXI.Sprite(textures['get_ready.png']);
    this.getReady.anchor.set(0.5);
    this.getReady.position.set(W / 2, H * 0.42);
    this.container.addChild(this.getReady);

    // --- Score en bas à gauche ---
    this.scoreLabel = new PIXI.Text('Pts : 0', this._style(12));
    this.scoreLabel.position.set(10, H - 30);
    this.container.addChild(this.scoreLabel);

    // --- Gros score central (pendant la partie) ---
    this.bigScore = new PIXI.Text('0', this._style(40, 6));
    this.bigScore.anchor.set(0.5);
    this.bigScore.position.set(W / 2, 90);
    this.bigScore.visible = false;
    this.container.addChild(this.bigScore);

    // --- Compte à rebours ---
    this.countdown = new PIXI.Text('', this._style(56, 8));
    this.countdown.anchor.set(0.5);
    this.countdown.position.set(W / 2, H / 2);
    this.countdown.visible = false;
    this.container.addChild(this.countdown);

    // --- Panneau de game over ---
    this.gameOverPanel = this._buildGameOverPanel(textures);
    this.gameOverPanel.visible = false;
    this.container.addChild(this.gameOverPanel);

    // --- Overlay de pause ---
    this.pauseOverlay = new PIXI.Container();
    const dim = new PIXI.Graphics();
    dim.beginFill(0x000000, 0.45).drawRect(0, 0, W, H).endFill();
    const pauseTxt = new PIXI.Text('PAUSE', this._style(28, 6));
    pauseTxt.anchor.set(0.5);
    pauseTxt.position.set(W / 2, H / 2);
    this.pauseOverlay.addChild(dim, pauseTxt);
    this.pauseOverlay.visible = false;
    this.container.addChild(this.pauseOverlay);

    // --- Flash blanc (impact) ---
    this.flashRect = new PIXI.Graphics();
    this.flashRect.beginFill(0xffffff).drawRect(0, 0, W, H).endFill();
    this.flashRect.alpha = 0;
    this.container.addChild(this.flashRect);
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
    this.replayBtn.buttonMode = true;
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

  // Animations par frame (pop du score + disparition du flash)
  update() {
    this._pop += (1 - this._pop) * 0.2;
    this.bigScore.scale.set(this._pop);
    if (this.flashRect.alpha > 0) {
      this.flashRect.alpha = Math.max(0, this.flashRect.alpha - 0.06);
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

  _drawMedal(score) {
    this.medal.clear();
    const medal = CONFIG.MEDALS.find((m) => score >= m.min);
    if (!medal) {
      this.medal.visible = false;
      return;
    }
    this.medal.visible = true;
    this.medal.lineStyle(3, 0xffffff, 0.6).beginFill(medal.color).drawCircle(0, 0, 24).endFill();
    this.medal.lineStyle(0).beginFill(0x000000, 0.12).drawCircle(0, 0, 13).endFill();
  }
}
