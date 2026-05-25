# English translation job

Translate missing Japanese articles into English for the Astro research site.

Rules:

- Source articles are the canonical Japanese files under `content/blog/*.mdx`.
- Create one English article per missing source under `content/blog/en/<same-slug>.mdx`.
- Preserve all frontmatter keys and values unless the value is Japanese prose that should be translated, such as `title`, `description`, `rssSummary`, `heroImageAlt`, and `heroImageCredit`.
- Adjust relative `heroImage` paths from `../../src/...` to `../../../src/...` because English articles live one directory deeper.
- Translate the Markdown/MDX body into natural English while preserving headings, tables, lists, Mermaid blocks, MDX components, links, and source URLs.
- Translate Mermaid diagram labels, axis labels, sequence participants, and messages into English. Do not leave Japanese text inside English Mermaid blocks.
- Keep source-adjacent `出典メモ:` paragraphs as English `Source note:` paragraphs.
- Do not use TeX-style backtick quotes such as ``example''. Use normal double quotes for quoted phrases.
- For news digest articles, keep the topic labels as standalone paragraphs with blank lines between `What happened:`, `Why it matters:`, `Implications for practice:`, and the following `NewsSourceCard`, matching the Japanese layout.
- Do not translate code identifiers, URLs, file paths, product names, or proper nouns unless an established English name exists.
- Do not add placeholders such as `TBD`, `TODO`, `FIXME`, `未定`, or `要確認`.
- After writing files, run `pnpm build` and ensure the generated English article pages are present under `dist/en/post/`.

Reference pages:

- When a Japanese reference page is added or updated under `src/pages/reference/<slug>.astro`, add or update the matching English page under `src/pages/en/reference/<slug>.astro` in the same change.
- Keep shared reference lists in locale-aware data helpers, such as `getReferenceItems(locale)`, so the Japanese and English indexes stay synchronized.
- English reference pages must not contain Japanese user-facing text.
