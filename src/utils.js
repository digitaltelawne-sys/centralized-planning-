// utils.js
export function daysDiff(d1, d2) {
  if (!d1 || !d2) return null;
  return Math.round((new Date(d2) - new Date(d1)) / 86400000);
}