/**
 * Entity — classe de base pour tout objet du jeu possédant un sprite.
 * Bird et Pipe en héritent (illustration de l'héritage en POO).
 */
export class Entity {
  constructor(sprite) {
    this.sprite = sprite;
  }

  // Accès pratique à la position via le sprite
  get x() {
    return this.sprite.x;
  }
  set x(value) {
    this.sprite.x = value;
  }
  get y() {
    return this.sprite.y;
  }
  set y(value) {
    this.sprite.y = value;
  }

  getBounds() {
    return this.sprite.getBounds();
  }

  // À surcharger par les classes filles
  update() {}
}
