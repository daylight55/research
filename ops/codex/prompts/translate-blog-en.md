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
- For news digest articles, keep each `NewsSourceCard` directly below its `###` topic heading, followed by standalone paragraphs for `What happened:`, `Why it matters:`, and `What to watch:` with blank lines between them, matching the Japanese layout. Translate `今後の注視点:` as `What to watch:` and keep the content focused on what readers should monitor next.
- Do not translate code identifiers, URLs, file paths, product names, or proper nouns unless an established English name exists.
- Do not add placeholders such as `TBD`, `TODO`, `FIXME`, `未定`, or `要確認`.
- Create or update `articles/<type>/<slug>/mix-alignment.json` together with the English article. This file is the semantic Japanese-English reading map for the MIX page.
- Use this JSON shape:
  `{ "version": 1, "sourceLocale": "ja", "targetLocale": "en", "sections": [{ "id": "short-section-id", "heading": { "ja": "日本語見出し", "en": "English heading" }, "pairs": [{ "ja": "日本語の1文", "en": "Matching English sentence" }] }] }`.
- Keep `pairs[].en` exactly equal to the English sentence that appears in `en/index.mdx` after normal whitespace normalization. Keep `pairs[].ja` as the corresponding Japanese sentence from `ja/index.mdx`.
- Prefer semantic sentence correspondence over paragraph position. When the English translation combines, splits, or reorders Japanese sentences, write the pair that best preserves meaning rather than relying on ordinal order.
- Build `mix-alignment.json` only after the final English article text is written. Do not use the MIX file to invent, summarize, smooth, or reframe article claims; it is a reading map, not a second translation surface.
- If a Japanese sentence would translate into generic boilerplate such as `The practical point is`, `Practical implications`, or `For practical readers`, revise the English article sentence to name the actual context-specific reading, risk, monitoring point, or decision, then copy that exact final sentence into `pairs[].en`.
- Exclude source notes, citations, code blocks, Mermaid blocks, tables, and UI-only labels from `mix-alignment.json` unless they are part of the article prose that should appear as a Japanese translation under an English sentence.
- Include enough pairs to cover at least 35% of English prose sentences, prioritizing summaries, major claims, recommendations, limits, and all news item summaries. Sparse files with only a few sample pairs are not acceptable.
- After writing files, run `node ops/scripts/validate-mix-alignment.mjs --changed`; fix every reported coverage or exact-text error before finishing.
- After writing files, run `pnpm build` and ensure the generated English article pages are present under `dist/en/news/` or `dist/en/reports/`.

Reference pages:

- When a Japanese reference page is added or updated under `src/pages/reference/<slug>.astro`, add or update the matching English page under `src/pages/en/reference/<slug>.astro` in the same change.
- Keep shared reference lists in locale-aware data helpers, such as `getReferenceItems(locale)`, so the Japanese and English indexes stay synchronized.
- English reference pages must not contain Japanese user-facing text.
