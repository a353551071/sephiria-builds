# Sephiria Builds ⚔️

Fan-made community wiki for **Sephiria** — the action roguelite by Team Horay (creators of Dungreed). Best builds, weapon tier lists, and beginner guides, updated for the 1.0 patch.

**Site:** https://sephiriabuilds.xyz
**Steam:** https://store.steampowered.com/app/2436940/Sephiria/

> **Disclaimer:** Sephiria Builds is a fan-made community site. Not affiliated with or endorsed by Team Horay.

---

## Tech stack

- **[Astro 5](https://astro.build)** static site (output: `dist/`, zero client JS)
- **Tailwind CSS 3** with a CSS-variable theme (brand color lives in `src/styles/globals.css`)
- **AnvilWiki template** ([MIT](https://github.com/PNGTRID/AnvilWiki)) — a game-wiki template with an AI-native content workflow
- Pagefind search, satori-generated OG covers, RSS/sitemap/robots/llms.txt baked in

## Local development

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # static build to dist/ (+ pagefind)
pnpm preview      # serve dist/ locally
```

Set `SITE_URL` when building locally so canonical/OG URLs point at `https://sephiriabuilds.xyz`:

```bash
SITE_URL=https://sephiriabuilds.xyz pnpm build
```

## Content

Articles live in `src/content/wiki/en/` (categories: `builds`, `weapons`, `guides`). Homepage copy is data-driven from `src/locales/en.json`. All builds are tagged with the game version and an evidence grade (video-verified > community claim).

## Deployment

Cloudflare Pages (build: `pnpm build`, output: `dist/`). `wrangler.toml` is the source of truth for Pages env vars.
