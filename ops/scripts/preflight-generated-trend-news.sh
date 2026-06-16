#!/usr/bin/env bash
set -euo pipefail

: "${ARTICLE_PATH:?ARTICLE_PATH is required}"
: "${SLUG:?SLUG is required}"

git ls-files --modified --others --exclude-standard -z -- '*.md' '*.mdx' \
	| while IFS= read -r -d '' file; do
		perl -0pi -e 's/[ \t]+$//mg; s/\n+\z/\n/s' "${file}"
	done

changed_mdx_list="$(mktemp)"
git ls-files --modified --others --exclude-standard -- '*.mdx' > "${changed_mdx_list}"
if [[ -s "${changed_mdx_list}" ]]; then
	xargs pnpm exec prettier --plugin-search-dir=. --check < "${changed_mdx_list}"
fi
rm -f "${changed_mdx_list}"

for required_file in \
	"${ARTICLE_PATH}" \
	"articles/news/${SLUG}/ja/index.mdx" \
	"articles/news/${SLUG}/en/index.mdx" \
	"articles/news/${SLUG}/ja/source-notes.mdx" \
	"articles/news/${SLUG}/en/source-notes.mdx" \
	"articles/news/${SLUG}/ja/research-log.mdx" \
	"articles/news/${SLUG}/en/research-log.mdx" \
	"articles/news/${SLUG}/mix-alignment.json"; do
	if [[ ! -f "${required_file}" ]]; then
		echo "::error file=${required_file}::Generated news output is missing a required localized article, research log, or MIX alignment file."
		exit 1
	fi
done

structured_data_path="articles/news/${SLUG}/daily-trend-news.json"
if [[ -f "${structured_data_path}" ]]; then
	node ops/scripts/render-daily-trend-news.mjs "articles/news/${SLUG}/daily-trend-news.json" --validate-only
fi

node --test ops/tests/article-structure.test.mjs ops/tests/news-title-summaries.test.mjs
node ops/scripts/validate-article-frontmatter.mjs --changed
node ops/scripts/validate-article-mdx.mjs --changed
node ops/scripts/validate-news-item-format.mjs --changed
node ops/scripts/validate-mix-alignment.mjs --changed
