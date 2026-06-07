// Small formatting helpers shared across screens.

export function parseDate(raw?: string | null): Date | null {
  if (!raw) return null;
  const t = Date.parse(raw);
  return isNaN(t) ? null : new Date(t);
}

export function timeAgo(raw?: string | null): string {
  const d = parseDate(raw);
  if (!d) return '';
  const secs = (Date.now() - d.getTime()) / 1000;
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function money(value?: number | null): string {
  if (!value || value <= 0) return '-';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
}

export function runtime(min?: number | null): string {
  if (!min || min <= 0) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function year(releaseDate?: string | null): string {
  return releaseDate && releaseDate.length >= 4 ? releaseDate.slice(0, 4) : '';
}
