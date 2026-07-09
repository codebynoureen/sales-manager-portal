export function daysUntil(dateISO: string, now: number = Date.now()) {
  return Math.max(0, Math.ceil((new Date(dateISO).getTime() - now) / (1000 * 60 * 60 * 24)));
}
