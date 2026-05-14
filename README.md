# daylight55/research Astro site (atlas)

This branch prototypes an Astro static site for the research report repository.

- Base theme: OpenBlog by danielcgilibert
- Variant: 白基調の読み物向けデザイン
- Content source: Markdown reports under `category/<category>/<topic>/report.md`, copied into Astro content entries for this prototype
- Build: `pnpm install && pnpm build`
- Output: `dist/`

## Current Reports

- [AI / LLM / Ontology / Organizational Memory](category/ai-systems/ai-llm-ontology-memory/report.md)
- [Palantir](category/enterprise-ai-platforms/palantir/report.md)
- [オントロジー概念の基礎と実務活用](category/knowledge-systems/ontology-concept/report.md)
- [NewSQLとYugabyteDBの最近の潮流](category/data-infrastructure/newsql-yugabyte-brief/report.md)
- [戸建てを購入するときの注意点](category/real-estate/detached-house-purchase-checklist/report.md)

Cloudflare Pages infrastructure is intentionally handled in a separate branch so this design branch does not own hosting configuration.
