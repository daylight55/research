---
name: research-report
description: Use when creating or updating source-grounded research reports, news digests, broad investigations, literature-backed surveys, policy/economic/geopolitical/technology analyses, diagram-rich explanations, or practical adoption recommendations in this repository.
---

# Research Report

Use this skill for durable research artifacts in this repository. Follow `AGENTS.md` first when it is present; this skill exists to keep the report workflow aligned with the current site shape.

## Canonical Output

- Reports live under `articles/report/<slug>/<locale>/index.mdx`.
- News digests live under `articles/news/<slug>/<locale>/index.mdx`.
- Use short kebab-case slugs because they become public route segments.
- Treat `articles/<type>/<slug>/ja/index.mdx` as the canonical Japanese reader-facing body.
- Keep `articles/<type>/<slug>/en/index.mdx` synchronized in the same PR when adding or updating a published article. Do not add Japanese-only public routes unless the user explicitly asks to defer English output.
- Put the full article body directly in `index.mdx`. Do not create `report.md`, `research-tasks.md`, `notes/`, `sources/`, `figures/`, or `prototype/` under `articles/`.
- If the research trail is useful and publishable, summarize it in `articles/<type>/<slug>/ja/research-log.mdx`; add or update the English research log when that route is published.
- When creating a report, use `ops/codex/templates/blog-entry.mdx` as the frontmatter and body shape.
- Ensure frontmatter `contentType` matches the directory type when it is present: `report` for `articles/report` and `news` for `articles/news`.

## Site Visibility

If the report or digest must appear on the website, top page, category pages, or PR preview:

1. Write or update `articles/report/<slug>/ja/index.mdx` for reports, or `articles/news/<slug>/ja/index.mdx` for news.
2. Write or update the matching `en/index.mdx` in the same article directory.
3. Add or update `mix-alignment.json` when maintaining the mixed Japanese-English reading view.
4. Add any new category to `src/data/categories.ts`; preserve existing categories as a union when resolving conflicts.
5. Keep reference pages in route parity: `src/pages/reference/<slug>.astro` and `src/pages/en/reference/<slug>.astro`.
6. Use locale-aware shared data such as `getReferenceItems(locale)` for reference indexes and homepage cards.
7. Avoid hardcoded homepage counts; derive values from content data such as collection lengths or `CATEGORIES.length`.
8. Run `pnpm build` for public article changes.
9. Confirm the build generated the expected pages:
   - report: `dist/reports/<slug>/index.html`
   - report research log: `dist/reports/<slug>/research/index.html` when `research-log.mdx` exists
   - news: `dist/news/<slug>/index.html`
   - category: `dist/category/<category-name>/1/index.html`
   - homepage: `dist/index.html`
10. Check `dist/index.html` or a local preview with `curl` for the slug, title, and category link before saying the article is visible.
11. If preview visibility is explicitly requested, identify the current preview URL from the repository's deploy mechanism and verify that URL with `curl` for the slug, title, and category link.

## Research Workflow

1. Define the research question, audience, and practical decision the article should support.
2. Gather sources before drafting.
3. Prefer primary sources: papers, specifications, official documentation, official announcements, standards, government documents, central-bank or international-organization reports, treaty/legal texts, and source repositories.
4. Use secondary sources only for orientation, market context, or competing interpretations.
5. Verify current product, AI model, pricing, roadmap, library, specification, politics, sanctions, conflict, election, and diplomacy claims against current sources.
6. Distinguish established facts, emerging evidence, product/vendor claims, inference from public information, open questions, limitations, and practical implications.
7. Write in Japanese for practitioners, researchers, and decision makers who need source-grounded judgment.
8. Keep the article standalone; future readers should not need the GitHub issue or chat context.
9. Use `research-log.mdx` for publishable questions checked, sources used, assumptions, rejected leads, limits, and follow-up items.
10. Verify links, placeholders, SourceNote formatting, diagrams, and Japanese-English parity before publication.

## Publication Workflow

- For research requests in this repository, a draft Pull Request is the standard delivery path unless the user explicitly says chat-only, no files, no PR, or only wants a plan.
- For explicit repository updates, do not stop at local changes: inspect the diff, run verification, commit, push, and create a draft PR.
- Write PR titles and bodies in Japanese. Follow `.github/PULL_REQUEST_TEMPLATE.md` without deleting template headings.
- Before committing, inspect the intended diff and avoid staging unrelated files.
- At minimum run `git diff --check` and check for unresolved placeholders such as `TBD`, `TODO`, `FIXME`, `未定`, and `要確認`.
- If public article content changed, run `pnpm build` and confirm the generated pages listed in Site Visibility.
- After PR creation, run `gh pr checks <PR_NUMBER>` or equivalent. Investigate failing, cancelled, or pending checks before reporting completion.
- After push, verify the PR is not conflicting with `main` using `gh pr view <PR_NUMBER> --json mergeable,mergeStateStatus`.
- When the requested change is covered by explicit tests or verification steps and no human-only review remains, enable or perform auto-merge with a head-commit guard:
  `gh pr merge <PR_NUMBER> --squash --auto --match-head-commit <HEAD_SHA>`.
- Do not auto-merge when factual review, translation review, external approval, or other human judgment remains outside the requested tests.
- If auto-merge is not appropriate, state the residual review item in the PR and final report.
- Final reports after PR creation should include the PR URL, base branch, head branch, draft/ready state, check status, and any remaining risk.

## Citation Requirements

- Place citations near the claims they support, not only in a final bibliography.
- Use `<SourceNote>...</SourceNote>` near important claims or paragraphs. Include source links inside the `SourceNote`.
- Write each `SourceNote` as a single inline MDX element on one line. Do not place the opening or closing tag on its own line, and do not wrap the note body across multiple lines.
- Do not write manual citation wrappers inside `SourceNote`: no `（...）`, `( ... )`, `出典:`, `Source note:`, or `Source:`.
- `SourceNote` is registered by the report and news renderers, so ordinary article MDX does not need an import.
- News digests may use `NewsSourceCard` where the established news layout calls for it.
- Keep quotes short and specific. Prefer brief quoted phrases plus Japanese paraphrase instead of long copied passages.
- If a source is an official roadmap, call it a roadmap. If not, write `公表情報からの推定`.

Good pattern:

```markdown
Anthropicの方向性は、MCP、長文脈、エージェント実行、企業統制に寄っている。<SourceNote>MCP発表は [Anthropic, Introducing the Model Context Protocol](...)。ここでの「方向性」は公式ロードマップではなく、公表済み機能からの推定である。</SourceNote>
```

## Diagram Requirements

Substantial reports should include diagrams when they materially improve understanding.

Preferred order:

1. Mermaid diagrams embedded in Markdown.
2. Official diagrams or images with source and rights context.
3. Excalidraw MCP diagrams if available.
4. Nanobanaa CLI generated images if available.

Mermaid constraints:

- Use Mermaid as a compact aid to the prose, not as a replacement for prose.
- Keep one Mermaid diagram to 3-7 nodes by default; do not exceed 9 nodes unless explicitly requested.
- Keep node labels short: target about 15 Japanese characters, cap around 25.
- Use `flowchart LR` only for simple relationships or comparisons; split wide flows or use a table.
- Use `flowchart TD` only for short procedures of about 3-5 steps.
- For `timeline`, use years plus short event names only; explain details in prose with nearby citations.
- Do not mix timeline, architecture, operational steps, and risks in one diagram.
- Before publishing, verify rendered Mermaid in local preview or generated HTML and simplify unreadable diagrams.

## Default Report Shape

Use this shape unless the topic needs something else:

```markdown
# <Title>

## 1. エグゼクティブサマリー

## 2. 背景と研究史

## 3. 構造・原理

## 4. 主要アプローチ比較

## 5. 実務活用

## 6. リスク・限界

## 7. 推奨方針

## 参考情報
```

## Quality Checklist

Before finishing:

- Article files use `articles/(report|news)/<slug>/(ja|en)/(index|research-log).mdx`.
- No duplicate `report.md`, `research-tasks.md`, `notes/`, `sources/`, `figures/`, or `prototype/` material exists under `articles/`.
- Japanese and English published routes are synchronized.
- `mix-alignment.json` is valid when the mixed reading view is maintained.
- New categories are registered in `src/data/categories.ts`.
- Reference routes and reference data remain locale-aware and in parity.
- English article Mermaid diagrams, reference pages, cards, and source labels contain no Japanese user-facing text.
- Important claims have nearby links.
- `SourceNote` elements are inline, one-line MDX, without manual parentheses or source labels inside.
- Current and unstable claims were verified against current sources.
- Diagrams render as Mermaid-compatible Markdown where possible.
- The article distinguishes evidence from inference.
- `git diff --check` passes.
- Unresolved placeholders such as `TBD`, `TODO`, `FIXME`, `未定`, and `要確認` are absent or intentionally explained outside published prose.
- If public content changed, `pnpm build` generated the expected report/news/category/home pages and the homepage HTML contains the slug, title, and category link.
- If creating a PR, the PR title and body are Japanese, follow `.github/PULL_REQUEST_TEMPLATE.md`, CI has been checked, conflicts with `main` have been checked, and final output includes verified PR metadata.
