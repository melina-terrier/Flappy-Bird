# TODO — Flappy Bird

Le projet a été simplifié pour se concentrer sur le code client et la Programmation Orientée Objet (POO).

## Base du TD
- [x] Appréhender le code de base (Oiseau, Tuyaux, Jeu)
- [x] Implémenter le calcul de scores

## Comportement classique
- [x] Flux continu de tuyaux (au lieu d'un seul recyclé)
- [x] Une seule vie : collision = game over, l'oiseau tombe
- [x] Démarrage doux puis vitesse de croisière

## Améliorations
- [x] Meilleur score persistant (`localStorage`) + médailles + badge « NEW! »
- [x] Compte à rebours 3·2·1 avant le départ
- [x] Sons synthétisés (saut, point, collision, game over)
- [x] Flash d'impact + « pop » du score
- [x] Pause (P / Échap) + bouton « Rejouer » cliquable
- [x] Police pixel, parallaxe, canvas responsive, support tactile

## Architecture POO (modules ES)
- [x] Constantes regroupées (`CONFIG`)
- [x] Classe de base `Entity` (héritage : `Bird`, `Pipe`)
- [x] Classes dédiées : `PipeManager`, `InputManager`, `HUD`, `SoundManager`
- [x] Pattern State (`Ready` / `Countdown` / `Playing` / `Paused` / `GameOver`)

---

# 🚀 Mise en ligne

Les ⚠️ sont les points **spécifiques à ce projet**.

## 1. Vérifier que le jeu tourne pour de vrai
- [x] Lancer via un **serveur HTTP** (⚠️ modules ES, ne marche pas en `file://`) — testé
- [ ] Tester sur **plusieurs navigateurs** : Chrome, Firefox, Safari → **à faire par toi**
- [ ] Tester sur **mobile** (tactile, pas de zoom/scroll) → **à faire par toi**
- [x] Vérifier chaque état (attente → compte à rebours → jeu → pause → game over → rejouer) — validé par tests
- [ ] Écouter le **son** (saut, point, collision, game over) → **à faire par toi** (aucune erreur côté code)
- [x] **Meilleur score** persiste après rechargement — validé (`localStorage`)

## 2. Dépendances externes — ✅ tout auto-hébergé
- [x] **PIXI.js** auto-hébergé dans `vendor/pixi.min.js` (plus de CDN, marche hors-ligne)
- [x] **Police « Press Start 2P »** auto-hébergée dans `assets/fonts/` (`@font-face`)
- [x] Décision prise : tout local → aucune dépendance externe
- [x] SRI sans objet (plus de `<script>` distant)

## 3. Chemins & build
- [x] Chemins relatifs des assets OK (compatibles sous-dossier type GitHub Pages)
- [x] Aucun fichier de test (`_test_*.html`) ni `console.log` de debug
- [x] `.gitignore` vérifié

## 4. Finitions de la page
- [x] **Favicon** ajouté (`assets/favicon.svg`)
- [x] `<title>` et `lang="fr"` OK + `meta description`
- [x] Balises **Open Graph** (titre + image)

## 5. Choix de l'hébergement → **à faire par toi**
- [ ] Choisir une plateforme statique gratuite : GitHub Pages, Netlify ou Vercel
- [ ] Déployer et obtenir l'URL en **HTTPS**
- [ ] Ouvrir l'URL en ligne et refaire un tour complet (desktop + mobile)

## 6. Dépôt Git
- [x] `git add` / `commit` propre des fichiers actuels
- [ ] **Pousser** sur le dépôt distant (`git push`) → **à faire par toi**
- [x] README à jour (contrôles, lancement, architecture)

---

### Rappels du projet
- **Lancer en local** : `python3 -m http.server 8000` puis http://localhost:8000
- **Contrôles** : Espace / clic / tap = sauter · P / Échap = pause
- **Architecture** : modules ES dans `js/` (voir [README.md](README.md))
