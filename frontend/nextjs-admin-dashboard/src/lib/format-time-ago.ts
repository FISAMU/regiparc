/**
 * Formate une date ISO en « il y a X » (français).
 */
export function formatTimeAgoFr(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null;

  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return null;

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (seconds < 10) return "à l'instant";
  if (seconds < 60) return `il y a ${seconds} s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} j`;

  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;

  const years = Math.floor(days / 365);
  return `il y a ${years} an${years > 1 ? "s" : ""}`;
}
