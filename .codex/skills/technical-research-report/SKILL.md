---
name: technical-research-report
description: Use when creating or updating research reports in this repository, especially broad technical investigations, literature-backed technology surveys, AI/LLM/MCP/ontology/memory research, source-grounded reports, diagram-rich explanations, or practical adoption recommendations. Store research outputs under category/<category-name>/<topic>/.
---

# Technical Research Report

Use this skill for any report or investigation in this repository.

## Output Location

- Put each topic under `category/<category-name>/<topic>/`.
- Treat `category/<category-name>/<topic>/` as the canonical location for research information in this repository. Do not put new reports under a top-level `research/` directory or directly at the repository root.
- Use a short kebab-case category name such as `ai-systems`, `enterprise-ai-platforms`, `developer-tools`, or `data-infrastructure`.
- Maintain at least:
  - `report.md`
  - `research-tasks.md`
- Add optional folders only when useful: `figures/`, `sources/`, `notes/`, `prototype/`.

## Astro Site Visibility

If the report must appear on the website, PR preview, top page, or category pages, `category/<category-name>/<topic>/report.md` is not enough.

Also do all of the following:

1. Add a matching `src/content/blog/<slug>.mdx` entry with frontmatter and the report body.
2. Add any new category to `src/data/categories.ts`.
3. Preserve existing categories when rebasing or resolving conflicts; merge category lists as a union.
4. Avoid hardcoded homepage counts. Use data-derived values such as `posts.length` and `CATEGORIES.length`.
5. Use `.github/codex/templates/blog-entry.mdx` as the shape for new site entries.
   Keep the report body directly in the MDX file after frontmatter. Do not use
   `import Report from '../../../category/.../report.md'` plus `<Report />`;
   imported Markdown headings are not exposed to Astro's table-of-contents data,
   which makes the desktop article sidebar empty.
6. Run `pnpm build`.
7. Confirm the build generated:
   - `dist/index.html`
   - `dist/post/<slug>/index.html`
   - `dist/category/<category-name>/1/index.html`
8. Check `dist/index.html` or `curl` against local preview for the slug, title, and category link before saying the report is visible.

## Research Workflow

1. Define the research question, audience, and practical decision the report should support.
2. Create or update `research-tasks.md` with small, verifiable tasks.
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
7. Write or update `report.md`.
8. Verify links, unresolved placeholders, and internal consistency.
9. If website visibility or preview visibility is part of the deliverable, complete the Astro Site Visibility checklist before publication.
10. When the user asks for repository publication, such as `PRにして`, `PRを作成して`, or `レポートにまとめてPRにして`, do not stop at local files. Commit, push, and create a GitHub Pull Request. Write the PR title and body in Japanese, using `.github/PULL_REQUEST_TEMPLATE.md` as the structure.
11. User-requested changes may be committed per work unit without asking for separate commit approval. Before committing, inspect the intended diff and avoid staging unrelated changes.

## Citation Requirements

- Place citations near the claims they support, not only in a final bibliography.
- Use a short `出典メモ:` paragraph after important claims or paragraphs.
- Include the link in the `出典メモ:` itself.
- When quoting source wording, keep quotes short and specific.
- For copyrighted sources, do not paste long passages. Prefer brief quoted phrases plus Japanese paraphrase.
- If a source is an official roadmap, call it a roadmap. If not, write `公表情報からの推定`.

Good pattern:

```markdown
Anthropicの方向性は、MCP、長文脈、エージェント実行、企業統制に寄っている。

出典メモ: MCP発表は [Anthropic, Introducing the Model Context Protocol](...)。Opus 4.6の1M contextとagent teamsは [Claude Opus 4.6](...) に基づく。ここでの「方向性」は公式ロードマップではなく、公表済み機能からの推定である。
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

## Report Structure

Use this default shape unless the topic needs something else:

```markdown
# <Title>

作成日: YYYY-MM-DD
調査方式: <narrative review / literature review / product evaluation / architecture survey>
対象: <scope>

## 引用方針

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
- Important claims have nearby links.
- Current product/spec claims were verified against current sources.
- Diagrams render as Mermaid-compatible Markdown where possible.
- The report distinguishes evidence from inference.
- `research-tasks.md` reflects completed and remaining work.
- `git diff --check` passes before committing.
- Before committing a user-requested change, the staged diff includes only the intended files.
- If creating a PR, unresolved placeholders such as `TBD`, `TODO`, `未定`, `要確認`, and `FIXME` have been checked and removed or intentionally explained.
- If creating a PR, the PR title and body are written in Japanese and follow `.github/PULL_REQUEST_TEMPLATE.md`.
- If creating a PR, the final response includes the verified PR URL, base branch, head branch, and draft/ready state.
- If website visibility was expected, a matching `src/content/blog/<slug>.mdx` exists, any new category is registered in `src/data/categories.ts`, `pnpm build` generated the post/category/index pages, and the top page HTML contains the slug/title/category.
