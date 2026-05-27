# daylight55/research

Public site: https://research.daylight55.dev/

This repository is a public research atlas for technical, economic, geopolitical,
and knowledge-system topics. It is built to keep research outputs readable as
articles while preserving enough of the research trail for readers to inspect
how conclusions were reached.

## Concept

The project treats each article as a durable research artifact, not a one-off
note. The goal is to connect current source-based investigation with practical
judgment: what happened, why it matters, what is still uncertain, and what a
technical or business decision maker should watch next.

When useful and publishable, an article also has a research log. The log records
the questions checked, sources used, assumptions made, rejected leads, and open
follow-ups. This makes the article easier to audit without cluttering the main
reading flow.

## What You Can Find

- Long-form research reports on AI systems, data infrastructure, developer
  tools, organizational knowledge, finance, geopolitics, and related domains.
- News-style digests for recent political, economic, and technology signals.
- Source notes placed near the claims they support.
- Diagrams and tables when they make the argument easier to verify.
- Optional research logs linked from article pages when the investigation trail
  is useful to publish.

## What This Repository Does

- Publishes reports from `articles/report/<slug>/<locale>/index.mdx`.
- Publishes news digests from `articles/news/<slug>/<locale>/index.mdx`.
- Publishes research trails from `articles/<type>/<slug>/<locale>/research-log.mdx` when present.
- Builds the site with Astro.
- Keeps category metadata in `src/data/categories.ts`.
- Keeps generation prompts, templates, scripts, and workflow tests under `ops/`.

## Repository Shape

```text
articles/
  report/
    <slug>/
      ja/
        index.mdx
        research-log.mdx
      en/
        index.mdx
  news/
    <slug>/
      ja/
        index.mdx
      en/
        index.mdx
src/
public/
ops/
infra/
```

`ja/index.mdx` is the canonical Japanese article body. `en/index.mdx` mirrors
the same slug for English readers. `research-log.mdx` is optional and should
contain only information that is appropriate to publish.
