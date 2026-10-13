// Копейки -> рубли с пробелом как разделителем тысяч.
// 499900 -> "4 999 ₽", 1250050 -> "12 500,50 ₽"
export function formatPrice(kopecks: number): string {
  const rubles = Math.floor(kopecks / 100);
  const rest = Math.abs(kopecks % 100);

  const rublesText = String(rubles).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const kopecksText = rest === 0 ? '' : `,${String(rest).padStart(2, '0')}`;

  return `${rublesText}${kopecksText} ₽`;
}
