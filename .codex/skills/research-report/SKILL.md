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
- Keep reader-facing `index.mdx` standalone. Do not expose prompt, issue, or user-question framing in article prose; recast corrections and assumptions as article-scope statements. `source-notes.mdx` and `research-log.mdx` may still record publishable investigation scope, process, and input context.
- Use `articles/<type>/<slug>/<locale>/source-notes.mdx` for publishable pre-article research material: source inventory, evidence notes, issue structure, and inclusion or exclusion decisions. Keep it as an intermediate research note, not a duplicate copy of the final article.
- If the research trail is useful and publishable, summarize it in `articles/<type>/<slug>/ja/research-log.mdx`; add or update the English research log when that route is published.
- When creating a report, use `ops/codex/templates/blog-entry.mdx` as the frontmatter and body shape.
- Ensure frontmatter `contentType` matches the directory type when it is present: `report` for `articles/report` and `news` for `articles/news`.
- Published `index.mdx` frontmatter must record `generation.model: 'gpt-5.4-mini'` exactly. Do not substitute the runtime model name such as `gpt-5`; `ops/tests/article-structure.test.mjs` asserts this fixed metadata contract.
- Published `research-log.mdx` files must include an environment section with `model: \`gpt-5.4-mini\``, the repo-local skill link, and a prompt source link to `https://github.com/daylight55/research/blob/main/ops/codex/prompts/daily-issue-research.md`.

## Site Visibility

If the report or digest must appear on the website, top page, category pages, or PR preview:

1. Write or update `articles/report/<slug>/ja/index.mdx` for reports, or `articles/news/<slug>/ja/index.mdx` for news.
2. Write or update the matching `en/index.mdx` in the same article directory.
3. Add or update `mix-alignment.json` when maintaining the mixed Japanese-English reading view.
   - Treat `mix-alignment.json` as an exact sentence-level reading map derived from the final `ja/index.mdx` and `en/index.mdx`, not as a summary or rewrite layer.
   - Keep `pairs[].ja` and `pairs[].en` equal to sentences that actually appear in the corresponding article body after normal whitespace normalization.
   - If a pair would require generic boilerplate such as `実務上のポイントは`, `The practical point is`, or `Practical implications`, revise the article prose first so both article and MIX pair name the concrete context-specific reading, risk, monitoring point, or decision.
4. Add any new category to `src/data/categories.ts`; preserve existing categories as a union when resolving conflicts.
5. Keep reference pages in route parity: `src/pages/reference/<slug>.astro` and `src/pages/en/reference/<slug>.astro`.
6. Use locale-aware shared data such as `getReferenceItems(locale)` for reference indexes and homepage cards.
7. Avoid hardcoded homepage counts; derive values from content data such as collection lengths or `CATEGORIES.length`.
8. Use a source-traceable hero image for public articles. Prefer Unsplash, Wikimedia Commons, or official images with clear credit and rights context. Do not use Codex-generated abstract images for article heroes, and do not set `heroImageSourceId` to a `codex:` value.
9. Run `pnpm build` for public article changes.
10. Confirm the build generated the expected pages:
   - report: `dist/reports/<slug>/index.html`
   - report research log: `dist/reports/<slug>/research/index.html` when `research-log.mdx` exists
   - report source notes: `dist/reports/<slug>/sources/index.html` when `source-notes.mdx` exists
   - news: `dist/news/<slug>/index.html`
   - news source notes: `dist/news/<slug>/sources/index.html` when `source-notes.mdx` exists
   - category: `dist/category/<category-name>/1/index.html`
   - homepage: `dist/index.html`
11. Check `dist/index.html` or a local preview with `curl` for the slug, title, and category link before saying the article is visible.
12. If preview visibility is explicitly requested, identify the current preview URL from the repository's deploy mechanism and verify that URL with `curl` for the slug, title, and category link.

## Research Workflow

1. Define the research question, audience, and practical decision the article should support.
2. Gather sources before drafting.
3. Prefer primary sources: papers, specifications, official documentation, official announcements, standards, government documents, central-bank or international-organization reports, treaty/legal texts, and source repositories.
4. Use secondary sources only for orientation, market context, or competing interpretations.
5. Verify current product, AI model, pricing, roadmap, library, specification, politics, sanctions, conflict, election, and diplomacy claims against current sources.
6. Distinguish established facts, emerging evidence, product/vendor claims, inference from public information, open questions, limitations, and decision points or operational consequences only when they are materially tied to the topic.
7. Write in Japanese for practitioners, researchers, and decision makers who need source-grounded judgment.
8. Keep the article standalone; future readers should not need the GitHub issue or chat context.
9. Article body should read as a self-contained publication, not as a direct answer to a prompt. Avoid phrases such as "your question," "your interpretation," or "the first correction is"; explain scope and caveats as part of the article itself.
10. Use `source-notes.mdx` for publishable source inventory, evidence notes, competing interpretations, and inclusion/exclusion decisions before drafting the reader-facing article.
11. Use `research-log.mdx` for publishable questions checked, automation context, assumptions, rejected leads, limits, and follow-up items.
12. Verify links, placeholders, SourceNote formatting, diagrams, and Japanese-English parity before publication.

## Source Notes First

For broad surveys, rankings, comparisons, country profiles, historical lists, or selection-heavy reports, write `source-notes.mdx` as research-before-writing notes rather than after-the-fact bibliography. It should record what was checked first, selection axes, country/topic-specific evidence notes, inclusion/exclusion decisions, and weak spots before polished article prose compresses them.

Do not let `source-notes.mdx` become only a thin source list or duplicate final prose. It should preserve the useful pre-article material a future reviewer needs to understand why the article selected, excluded, grouped, or ranked items the way it did.

## Publication Workflow

- For research requests in this repository, a draft Pull Request is the standard delivery path unless the user explicitly says chat-only, no files, no PR, or only wants a plan.
- For explicit repository updates, do not stop at local changes: inspect the diff, run verification, commit, push, and create a draft PR.
- Write PR titles and bodies in Japanese. Follow `.github/PULL_REQUEST_TEMPLATE.md` without deleting template headings.
- Before committing, inspect the intended diff and avoid staging unrelated files.
- At minimum run `git diff --check` and check for unresolved placeholders such as `TBD`, `TODO`, `FIXME`, `未定`, and `要確認`.
- When published article prose changes, run the repo Stop Slop check (`node ops/scripts/validate-stop-slop.mjs` or `pnpm test:stop-slop`) so high-confidence AI tells from the APM-installed `stop-slop` skill fail locally.
- After committing and before push or PR readiness, run `pnpm ci:pr` from a clean working tree to reproduce the GitHub pull_request Test workflow on a temporary worktree that merges the current HEAD with the latest `origin/main`.
- Use `pnpm ci:head` or targeted tests only as fast inner-loop checks. Do not treat them as PR-equivalent when `main` may have advanced or when GitHub will test a merge commit.
- When adding article files, make sure local validation sees the same file set that CI will see. Stage intended new files before relying on `git ls-files`-based checks, or use validators that explicitly include untracked files.
- If CI fails after local checks passed, treat it as a parity defect. Compare CI logs, workflow commands, base/head refs, tracked versus untracked files, dependency/runtime versions, environment variables, and cache behavior; then update local tests, scripts, or this skill so the same class fails before push next time.
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

## 5. 意思決定・運用への接続

## 6. リスク・限界

## 7. 推奨方針

## 参考情報
```

## Quality Checklist

Before finishing:

- Article files use `articles/(report|news)/<slug>/(ja|en)/(index|research-log|source-notes).mdx`.
- No duplicate `report.md`, `research-tasks.md`, `notes/`, `sources/`, `figures/`, or `prototype/` material exists under `articles/`.
- Japanese and English published routes are synchronized.
- Published article frontmatter and research logs use the CI-required `gpt-5.4-mini` model string, and research logs link to `ops/codex/prompts/daily-issue-research.md`.
- `mix-alignment.json` is valid when the mixed reading view is maintained.
- New categories are registered in `src/data/categories.ts`.
- Reference routes and reference data remain locale-aware and in parity.
- English article Mermaid diagrams, reference pages, cards, and source labels contain no Japanese user-facing text.
- Important claims have nearby links.
- `SourceNote` elements are inline, one-line MDX, without manual parentheses or source labels inside.
- Published prose passes the Stop Slop check for high-confidence filler, business jargon, mechanical contrasts, and Japanese summary crutches.
- Current and unstable claims were verified against current sources.
- Diagrams render as Mermaid-compatible Markdown where possible.
- The article distinguishes evidence from inference.
- `git diff --check` passes.
- `pnpm ci:pr` passes before push or PR readiness, especially when the base branch has advanced.
- Unresolved placeholders such as `TBD`, `TODO`, `FIXME`, `未定`, and `要確認` are absent or intentionally explained outside published prose.
- If public content changed, `pnpm build` generated the expected report/news/category/home pages and the homepage HTML contains the slug, title, and category link.
- If creating a PR, the PR title and body are Japanese, follow `.github/PULL_REQUEST_TEMPLATE.md`, CI has been checked, conflicts with `main` have been checked, and final output includes verified PR metadata.
