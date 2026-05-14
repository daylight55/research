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
- [NewSQLとYugabyteDBの最近の潮流](category/data-infrastructure/newsql-yugabyte-brief/report.md)
- [戸建てを購入するときの注意点](category/real-estate/detached-house-purchase-checklist/report.md)

Cloudflare Pages infrastructure is intentionally handled in a separate branch so this design branch does not own hosting configuration.

## Repository Structure

```text
category/
  <category-name>/
    <topic>/
      report.md
      research-tasks.md
```

## Current Reports

- [AI / LLM / Ontology / Organizational Memory](category/ai-systems/ai-llm-ontology-memory/report.md)
- [Palantir](category/enterprise-ai-platforms/palantir/report.md)
- [金利政策と物価・賃金・債券・債務・為替介入の入門](category/macro-finance/interest-rate-policy-primer/report.md)

## Policy

各調査テーマは `category/<category-name>/<topic>/` に分け、少なくとも次のファイルを置きます。

- `report.md`: 調査結果の本文
- `research-tasks.md`: 調査タスク、残課題、追加深掘り候補

調査が実装やPoCに進む場合は、同じテーマディレクトリ内に `prototype/`、`notes/`、`sources/` などを追加します。
