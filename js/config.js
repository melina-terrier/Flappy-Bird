/**
 * CONFIG — toutes les constantes du jeu regroupées (plus de nombres « magiques »).
 */
export const CONFIG = {
  // Écran
  SCREEN_WIDTH: 500,
  SCREEN_HEIGHT: 700,
  BG_COLOR: 0x33ccff,

  // Police (avec police de secours si « Press Start 2P » n'est pas dispo)
  FONT: '"Press Start 2P", Arial, sans-serif',

  // Oiseau / physique
  GRAVITY: 0.5,
  JUMP_STRENGTH: -7,
  MAX_FALL_SPEED: 10,
  BIRD_X_RATIO: 0.3, // position horizontale de l'oiseau (30 % de la largeur)

  // Vitesse de défilement (démarrage doux puis vitesse de croisière)
  START_SPEED: 2,
  MAX_SPEED: 3,
  SPEED_PER_POINT: 0.1,

  // Tuyaux
  PIPE_COUNT: 3,
  PIPE_SPACING: 260, // distance horizontale entre deux tuyaux
  PIPE_FIRST_OFFSET: 100, // décalage du premier tuyau au-delà du bord droit

  // Décor
  GROUND_PATTERN: 120, // largeur du motif répété du sol
  PARALLAX_FACTOR: 0.3, // le fond défile à 30 % de la vitesse du sol

  // Compte à rebours avant le départ
  COUNTDOWN_FROM: 3,
  COUNTDOWN_STEP_FRAMES: 40, // ~0,66 s par chiffre à 60 fps

  // Médailles selon le score
  MEDALS: [
    { min: 40, color: 0xe5e4e2 }, // platine
    { min: 30, color: 0xffd700 }, // or
    { min: 20, color: 0xc0c0c0 }, // argent
    { min: 10, color: 0xcd7f32 }, // bronze
  ],

  // Stockage
  BEST_SCORE_KEY: 'flappy_best',
};
