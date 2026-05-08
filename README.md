# daylight55/research Astro site (atlas)

This branch prototypes an Astro static site for the research report repository.

- Base theme: OpenBlog by danielcgilibert
- Variant: 白基調の読み物向けデザイン
- Content source: Markdown reports under `category/<category>/<topic>/report.md`, copied into Astro content entries for this prototype
- Build: `pnpm install && pnpm build`
- Output: `dist/`

Cloudflare Pages infrastructure is intentionally handled in a separate branch so this design branch does not own hosting configuration.
