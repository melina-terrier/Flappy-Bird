/**
 * SoundManager — effets sonores synthétisés avec l'API Web Audio
 * (aucun fichier audio à embarquer). Sons : saut, point, collision, game over.
 */
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  // Crée / réveille le contexte audio (à appeler depuis un geste utilisateur)
  resume() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        this.enabled = false;
        return;
      }
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Petit bip paramétrable (fréquence, durée, forme, volume, glissando)
  _beep(freq, duration, type = 'square', volume = 0.15, slideTo = null) {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
    }

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  jump() {
    this._beep(600, 0.1, 'square', 0.12, 900);
  }

  point() {
    this._beep(880, 0.12, 'sine', 0.15, 1320);
  }

  hit() {
    this._beep(200, 0.2, 'sawtooth', 0.2, 80);
  }

  die() {
    this._beep(150, 0.5, 'sawtooth', 0.18, 50);
  }
}
