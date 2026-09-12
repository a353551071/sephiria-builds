/**
 * Author registry (v1.7) — E-E-A-T enrichment for the article `author` field.
 *
 * 👉 APPLY TEMPLATE: edit for your own authors (or leave empty — a bare
 * author name still renders, it just won't link out).
 *
 * Key = the exact `author:` value in article frontmatter.
 * Value = optional profile URL (linked on the article header + used as
 * `Person` JSON-LD `sameAs`). Avatar is not yet rendered — URLs only for now.
 */
export interface AuthorInfo {
  /** Profile page (personal site, social, or your site's author page). */
  url?: string;
  /** Professional title / role (e.g. Lead Builder & Data Verifier). */
  title?: string;
  /** Short bio for author cards (E-E-A-T signal). */
  bio?: string;
  /** Social profiles folded into JSON-LD sameAs. */
  sameAs?: string[];
}

export const authors: Record<string, AuthorInfo> = {
  'Kaelen "KatanaZero" Vance': {
    url: '/about',
    title: 'Lead Builder & Frame Data Verifier',
    bio: 'Roguelite veteran with 300+ hours across Dungreed and Sephiria. Specializes in frame data testing, evasion breakpoint math, and Boss Floor 60 endgame routing.',
    sameAs: ['https://store.steampowered.com/app/2436940/Sephiria/'],
  },
  'Forge Master Kael': { url: '/about' },
};

/** Look up an author by frontmatter name (undefined = no entry). */
export function getAuthor(name: string | undefined): AuthorInfo | undefined {
  if (!name) return undefined;
  return authors[name];
}
