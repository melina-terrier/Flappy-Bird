# 🐦 Flappy Bird

> Clone de Flappy Bird en JavaScript / PIXI.js.
> TD de Programmation Orientée Objet et Événementielle — projet purement front-end centré sur la POO.

## 🚀 Lancer le projet

Aucune installation nécessaire. PIXI.js (`vendor/`) et la police pixel
(`assets/fonts/`) sont **auto-hébergés** — le jeu fonctionne sans connexion.
Le code étant en **modules ES**, il faut le servir via HTTP (pas en `file://`) :

```bash
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

## 🎮 Contrôles

| Touche / geste              | Action                      |
| --------------------------- | --------------------------- |
| **Espace** / clic / tap     | Sauter / démarrer / rejouer |
| **P** ou **Échap**          | Pause                       |

## ✨ Fonctionnalités

- Flux continu de tuyaux, une seule vie, l'oiseau tombe à la mort
- Démarrage doux puis vitesse de croisière, compte à rebours **3·2·1**
- **Meilleur score** persistant (`localStorage`), **médailles** et badge « NEW! »
- **Sons** synthétisés (saut, point, collision, game over)
- Flash d'impact, **pop** du score, **parallaxe** du décor
- Police pixel *Press Start 2P*, **canvas responsive**, support tactile

## 📁 Architecture (modules ES)

```
.
├── index.html              # Page + PIXI.js (auto-hébergé) + police pixel
├── vendor/pixi.min.js      # PIXI.js auto-hébergé (pas de CDN)
├── js/
│   ├── main.js             # Bootstrap : charge la police puis lance Game
│   ├── config.js           # CONFIG : toutes les constantes du jeu
│   ├── utils.js            # aabbIntersect (collision AABB)
│   ├── entity.js           # Entity : classe de base (sprite, position)
│   ├── bird.js             # Bird  extends Entity — physique de l'oiseau
│   ├── pipe.js             # Pipe  extends Entity — un tuyau + hitboxes
│   ├── pipeManager.js      # PipeManager — flux continu, recyclage, comptage
│   ├── input.js            # InputManager — clavier + souris + tactile
│   ├── sound.js            # SoundManager — effets Web Audio synthétisés
│   ├── hud.js              # HUD — score, get ready, game over, pause, flash
│   ├── states.js           # Pattern State : Ready/Countdown/Playing/Paused/GameOver
│   └── game.js             # Game — orchestrateur (scène, entités, boucle)
└── assets/
    ├── flappy_bird.png     # Spritesheet
    ├── flappy_bird.json    # Atlas TexturePacker
    ├── favicon.svg         # Favicon
    └── fonts/              # Police « Press Start 2P » auto-hébergée
```

### Notions POO illustrées
- **Héritage** : `Bird` et `Pipe` héritent de `Entity`.
- **Responsabilité unique** : `PipeManager`, `InputManager`, `HUD`, `SoundManager` ont chacun un rôle clair.
- **Pattern State** : chaque phase du jeu est une classe avec `enter` / `update` / `exit`, `Game` délègue à l'état courant.
- **Encapsulation & constantes** centralisées dans `CONFIG`.

## ✅ TODO

Voir [todo.md](todo.md).
