/**
 * Tier colors — single source of truth for tier chips across the site.
 *
 * Backed by the Sephiria Design System --sp-tier-* tokens (globals.css), not
 * hardcoded Tailwind palette classes. S = gold (accent), A = ice (secondary),
 * B/C/D step down through steel/ash/ember so tiers read as distinct ranks on
 * the near-black card background. Update the token in globals.css to re-theme
 * every tier chip site-wide; do not edit classes here.
 */
export const TIER_COLORS: Record<string, string> = {
  S: 'bg-[hsl(var(--sp-tier-s)/0.16)] text-[hsl(var(--sp-tier-s))]',
  A: 'bg-[hsl(var(--sp-tier-a)/0.16)] text-[hsl(var(--sp-tier-a))]',
  B: 'bg-[hsl(var(--sp-tier-b)/0.16)] text-[hsl(var(--sp-tier-b))]',
  C: 'bg-[hsl(var(--sp-tier-c)/0.16)] text-[hsl(var(--sp-tier-c))]',
  D: 'bg-[hsl(var(--sp-tier-d)/0.16)] text-[hsl(var(--sp-tier-d))]',
};

/** Fallback chip for unknown tier labels. */
export const TIER_FALLBACK = 'bg-[hsl(var(--sp-tier-c)/0.16)] text-[hsl(var(--sp-tier-c))]';
