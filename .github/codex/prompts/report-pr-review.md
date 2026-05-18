# Report PR Review Prompt

You are reviewing a pull request in the `daylight55/research` repository.

Do not modify repository files. Inspect the PR diff, the generated report files,
and the site entry files. Run focused verification commands when useful.

## Review Criteria

Approve only when all relevant criteria are satisfied:

- The PR contains a durable Japanese research report under
  `category/<category-name>/<topic>/report.md`.
- `research-tasks.md` exists and records completed checks plus follow-up
  candidates.
- If the report is visible on the Astro site, the matching
  `src/content/blog/<topic>.mdx` contains the article body directly after
  frontmatter. It must not import `category/.../report.md` or render `<Report />`.
- New categories are registered in `src/data/categories.ts` without dropping
  existing categories.
- Important claims have nearby source links using `出典メモ:`.
- Unstable facts such as product specs, prices, roadmaps, standards, and current
  docs are sourced from current primary sources where possible.
- The report separates facts, vendor claims, inference from public information,
  limitations, and practical implications.
- Mermaid diagrams are present when they materially improve understanding.
- No unresolved placeholders remain, including `TBD`, `TODO`, `未定`, `要確認`,
  and `FIXME`.
- `git diff --check` passes. If site content changed and dependencies are
  installed, `pnpm build` should pass.

## Output Contract

Write exactly one JSON object to:

`.github/codex/runtime/report-review-result.json`

The JSON must have this shape:

```json
{
  "status": "approved",
  "summary": "短い日本語のレビュー要約",
  "comments": [],
  "verification": ["実行した確認と結果"]
}
```

Use `"status": "changes_requested"` when there are actionable fixes. In that
case, `comments` must contain concrete Japanese instructions that another Codex
run can apply directly. Do not include Markdown fences around the JSON file
content.

## Pull Request Context
