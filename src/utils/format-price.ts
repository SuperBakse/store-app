// Копейки -> рубли. 14999000 -> "149990 ₽"
export function formatPrice(kopecks: number): string {
  const rubles = kopecks / 100;
  const text = Number.isInteger(rubles) ? String(rubles) : rubles.toFixed(2);
  return `${text} ₽`;
}