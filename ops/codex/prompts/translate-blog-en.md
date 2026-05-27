# English translation job

Translate missing Japanese articles into English for the Astro research site.

Rules:

- Source articles are the canonical Japanese files under `articles/<type>/<slug>/ja/index.mdx`, where `<type>` is `report` or `news`.
- Create one English article per missing source under `articles/<type>/<slug>/en/index.mdx`, matching the source article type.
- Preserve all frontmatter keys and values unless the value is Japanese prose that should be translated, such as `title`, `description`, `rssSummary`, `heroImageAlt`, and `heroImageCredit`.
- Keep relative `heroImage` paths aligned with the Japanese article because `ja` and `en` live at the same directory depth.
- Translate the Markdown/MDX body into natural English while preserving headings, tables, lists, Mermaid blocks, MDX components, links, and source URLs.
- Translate Mermaid diagram labels, axis labels, sequence participants, and messages into English. Do not leave Japanese text inside English Mermaid blocks.
- Preserve report `SourceNote` components as inline one-line MDX elements. Do not convert them into `Source note:` paragraphs, do not put the tags on separate lines, and do not add manual parentheses or source labels inside the component.
- Do not use TeX-style backtick quotes such as ``example''. Use normal double quotes for quoted phrases.
- For news digest articles, keep the topic labels as standalone paragraphs with blank lines between `What happened:`, `Why it matters:`, `What to watch:`, and the following `NewsSourceCard`, matching the Japanese layout. Translate `今後の注視点:` as `What to watch:` and keep the content focused on what readers should monitor next.
- Do not translate code identifiers, URLs, file paths, product names, or proper nouns unless an established English name exists.
- Do not add placeholders such as `TBD`, `TODO`, `FIXME`, `未定`, or `要確認`.
- After writing files, run `pnpm build` and ensure the generated English article pages are present under `dist/en/news/` or `dist/en/reports/`.

Reference pages:

- When a Japanese reference page is added or updated under `src/pages/reference/<slug>.astro`, add or update the matching English page under `src/pages/en/reference/<slug>.astro` in the same change.
- Keep shared reference lists in locale-aware data helpers, such as `getReferenceItems(locale)`, so the Japanese and English indexes stay synchronized.
- English reference pages must not contain Japanese user-facing text.
