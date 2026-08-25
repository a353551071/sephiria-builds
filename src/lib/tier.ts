/**
 * Tier colors — single source of truth for tier chips across the site.
 *
 * Shared by the homepage TierGrid module and the TierBadge MDX component.
 * Site theme is dark-first + dark gold; S stays the brightest gold highlight,
 * A uses violet (gold's complement) and B/C step down through blue-gray so
 * tiers read as distinct ranks on the near-black card background.
 */
export const TIER_COLORS: Record<string, string> = {
  S: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  A: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  B: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  C: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400',
};

/** Fallback chip for unknown tier labels. */
export const TIER_FALLBACK = 'bg-muted text-muted-foreground';
