---
name: technical-research-report
description: Use when creating or updating research reports in this repository, especially broad technical investigations, literature-backed technology surveys, AI/LLM/MCP/ontology/memory research, source-grounded reports, diagram-rich explanations, or practical adoption recommendations. Store research outputs under category/<category-name>/<topic>/.
---

# Technical Research Report

Use this skill for any report or investigation in this repository.

## Output Location

- For website-facing reports, write the article body directly in `content/blog/<slug>.mdx`. Treat that MDX file as the canonical reader-facing text.
- Do not maintain duplicate bodies in both `category/<category-name>/<topic>/report.md` and `content/blog/<slug>.mdx`. The duplicate-report pattern makes one copy drift, become shallow, or stop midway.
- Use `category/<category-name>/<topic>/` only when supporting materials are useful: `research-tasks.md`, `notes/`, `sources/`, `figures/`, `prototype/`.
- Use a short kebab-case category name such as `ai-systems`, `enterprise-ai-platforms`, `developer-tools`, or `data-infrastructure`.

## Astro Site Visibility

If the report must appear on the website, PR preview, top page, or category pages, `content/blog/<slug>.mdx` is the primary deliverable.

Cloudflare Pages Preview is the preferred PR preview surface for this repository. If the Cloudflare branch alias URL or deployment URL renders the report, a separate GitHub Pages PR preview is not required.

Also do all of the following:

1. Add or update `content/blog/<slug>.mdx` with frontmatter and the full article body.
2. Add or update the matching English article under `content/blog/en/<same-slug>.mdx` in the same PR, unless the user explicitly asks to defer translation. Japanese is the canonical source, but published routes must remain synchronized.
3. Add any new category to `src/data/categories.ts`.
4. Preserve existing categories when rebasing or resolving conflicts; merge category lists as a union.
5. Treat the article header image as a minor supporting element. Do not add low-information Codex-generated abstract category images by default; prefer existing meaningful images or a restrained placeholder until a genuinely useful source image or diagram exists.
6. Avoid hardcoded homepage counts. Use data-derived values such as `posts.length` and `CATEGORIES.length`.
7. Use `.github/codex/templates/blog-entry.mdx` as the shape for new site entries.
   Keep the full article body directly in the MDX file after frontmatter. Do not
   write a separate `report.md` first and copy it later, and do not use
   `import Report from '../../../category/.../report.md'` plus `<Report />`.
   Imported Markdown headings are not exposed to Astro's table-of-contents data,
   which makes the desktop article sidebar empty.
8. For reference pages, keep `src/pages/reference/<slug>.astro` and `src/pages/en/reference/<slug>.astro` in route parity. Use locale-aware shared data such as `getReferenceItems(locale)` for reference indexes and homepage cards.
9. Keep English article Mermaid diagrams, English reference pages, and English card copy free of Japanese user-facing text.
10. Run `pnpm build`.
11. Confirm the build generated:

- `dist/index.html`
- `dist/post/<slug>/index.html`
- `dist/category/<category-name>/1/index.html`

12. Check `dist/index.html` or `curl` against local preview for the slug, title, and category link before saying the report is visible.
13. After PR creation, use the Cloudflare Pages Preview PR comment or GitHub Actions run details to identify the Cloudflare preview URL. When preview visibility is part of the deliverable, verify that Cloudflare URL with `curl` for the slug, title, and category link before reporting.

## Research Workflow

1. Define the research question, audience, and practical decision the report should support.
2. Create or update `research-tasks.md` only when a task log or follow-up list is useful.
3. Gather sources before drafting.
4. Prefer primary sources:
   - peer-reviewed papers
   - arXiv papers when relevant and clearly labeled
   - official documentation
   - official company announcements
   - standards/specifications
5. Use secondary sources only for orientation or market context.
6. Distinguish:
   - established claims
   - emerging evidence
   - product claims
   - inference from public announcements
   - open questions
7. Write or update the full article body in `content/blog/<slug>.mdx`.
8. Verify links, unresolved placeholders, and internal consistency.
9. If website visibility or preview visibility is part of the deliverable, complete the Astro Site Visibility checklist before publication.
10. For research requests in this repository, treat a draft Pull Request as the standard delivery path even when the user does not explicitly say `PRにして`. Do not stop at chat-only reporting or local files unless the user explicitly says not to create files, not to publish, or that a chat-only answer is enough.
11. When publishing a research report, add or update the MDX site entry needed for Astro visibility, run the required checks, commit, push, and create a GitHub Pull Request. Write the PR title and body in Japanese, using `.github/PULL_REQUEST_TEMPLATE.md` as the structure.
12. After creating or updating the PR, check CI with `gh pr checks <PR_NUMBER>` or equivalent. If any check is failing, cancelled, or pending, inspect the relevant GitHub Actions run/logs and either fix the root cause or explicitly report why the non-successful run is superseded or non-actionable.
13. User-requested changes may be committed per work unit without asking for separate commit approval. Before committing, inspect the intended diff and avoid staging unrelated changes.
14. When the requested change is covered by explicit tests or verification steps, list those checks in the PR body. If the requested checks, `git diff --check`, unresolved-placeholder scan, required build, preview workflow, and all required CI pass, and the PR is not conflicting with `main`, enable or perform auto-merge unless the user explicitly asked to keep the PR unmerged or in draft.
15. Before auto-merge, convert draft PRs to ready if the remaining review surface is covered by tests. Do not auto-merge when factual review, translation review, external approval, or other human judgment remains outside the requested tests; instead, state the residual review item in the PR and final report.
16. Use a head-commit guard for auto-merge. Prefer `gh pr merge <PR_NUMBER> --squash --auto --match-head-commit <HEAD_SHA>`; if repository auto-merge is unavailable, re-check the conditions immediately before `gh pr merge <PR_NUMBER> --squash --match-head-commit <HEAD_SHA>`.

## Citation Requirements

- Place citations near the claims they support, not only in a final bibliography.
- Use `<SourceNote>...</SourceNote>` near important claims or paragraphs. It renders as a small, muted, parenthesized citation note in article prose.
- Include source links inside the `SourceNote` itself.
- `SourceNote` is registered by the post renderer, so ordinary report MDX does not need an import. News digests are the exception: keep using `NewsSourceCard` there.
- When quoting source wording, keep quotes short and specific.
- For copyrighted sources, do not paste long passages. Prefer brief quoted phrases plus Japanese paraphrase.
- If a source is an official roadmap, call it a roadmap. If not, write `公表情報からの推定`.

Good pattern:

```markdown
Anthropicの方向性は、MCP、長文脈、エージェント実行、企業統制に寄っている。
<SourceNote>MCP発表は [Anthropic, Introducing the Model Context Protocol](...)。Opus 4.6の1M contextとagent teamsは [Claude Opus 4.6](...) に基づく。ここでの「方向性」は公式ロードマップではなく、公表済み機能からの推定である。</SourceNote>
```

## Diagram Requirements

Every substantial report should include diagrams unless the topic is purely textual.

Preferred order:

1. Mermaid diagrams embedded in Markdown.
2. Official diagrams or images linked near the discussion, with source and rights context.
3. Excalidraw MCP diagrams if the tool is available.
4. Nanobanaa CLI generated images if the tool is available.

If Excalidraw MCP or Nanobanaa CLI is not available, use Mermaid and mention no special tooling.

Recommended diagram types:

- timeline for history
- flowchart for architecture and process
- sequence diagram for protocol/tool interaction
- graph for ontology/entity relationships
- comparison table for alternatives

Mermaid authoring constraints:

- Use Mermaid as a compact aid to the prose, not as a replacement for the prose.
- Keep one Mermaid diagram to 3-7 nodes by default. Do not exceed 9 nodes unless the user explicitly asks for a dense technical diagram.
- Keep node labels short: prefer short noun phrases; target about 15 Japanese characters and cap at about 25 characters. Put explanations in prose near the diagram.
- Use `flowchart LR` only for simple left-to-right relationships or comparisons. If it becomes wide, split it or use a Markdown table.
- Use `flowchart TD` only for short procedures of about 3-5 steps. If it exceeds 6 steps, write the detailed sequence as a numbered list and diagram only the core loop.
- For `timeline`, use years plus short event names only. Explain event details in the paragraph or `<SourceNote>...</SourceNote>` immediately around the diagram.
- Do not mix timeline, architecture, operational steps, and risks in one diagram. Decide one purpose per diagram: history, relationship, procedure, or comparison.
- Before publishing, verify the rendered Mermaid in local preview or generated HTML. If text is unreadable, whitespace is excessive, or the diagram needs too much scrolling to understand, simplify or split it.

## Report Structure

Use this default shape unless the topic needs something else:

```markdown
# <Title>

## 1. エグゼクティブサマリー

## 2. 背景と研究史

## 3. 技術原理

## 4. 主要アプローチ比較

## 5. 実務活用

## 6. リスク・限界

## 7. 推奨方針

## 参考情報
```

## Quality Checklist

Before finishing:

- No `TBD`, `TODO`, `未定`, or unresolved placeholders.
- Japanese and English published routes are synchronized for articles and reference pages.
- English article Mermaid diagrams and English reference pages contain no Japanese user-facing text.
- Important claims have nearby links.
- Current product/spec claims were verified against current sources.
- Diagrams render as Mermaid-compatible Markdown where possible.
- The report distinguishes evidence from inference.
- `research-tasks.md` reflects completed and remaining work if the change includes one.
- `git diff --check` passes before committing.
- Before committing a user-requested change, the staged diff includes only the intended files.
- If creating a PR, unresolved placeholders such as `TBD`, `TODO`, `未定`, `要確認`, and `FIXME` have been checked and removed or intentionally explained.
- If creating a PR, the PR title and body are written in Japanese and follow `.github/PULL_REQUEST_TEMPLATE.md`.
- If creating or updating a PR, CI status has been checked after push, and any failing/cancelled/pending check has been investigated before reporting completion.
- If requested behavior is captured by tests and no human-only review remains, auto-merge has been enabled or completed with a head-commit guard.
- If creating a PR, the final response includes the verified PR URL, base branch, head branch, and draft/ready state.
- If website visibility was expected, the full article is in `content/blog/<slug>.mdx`, any new category is registered in `src/data/categories.ts`, `pnpm build` generated the post/category/index pages, the top page HTML contains the slug/title/category, and the Cloudflare Pages preview URL has been checked when available.
