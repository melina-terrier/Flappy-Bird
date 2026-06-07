/**
 * Détection de collision entre deux rectangles (AABB — Axis-Aligned Bounding Box).
 * Renvoie true si les rectangles r1 et r2 se chevauchent.
 */
export function aabbIntersect(r1, r2) {
  return !(
    r1.x + r1.width < r2.x ||
    r2.x + r2.width < r1.x ||
    r1.y + r1.height < r2.y ||
    r2.y + r2.height < r1.y
  );
}
