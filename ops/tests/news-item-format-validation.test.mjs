import { strict as assert } from 'node:assert'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

import { validateNewsItemFormat } from '../scripts/validate-news-item-format.mjs'

const japaneseSmartBrevityNews = `---
title: '2026-06-12 テスト'
contentType: news
draft: false
---

import NewsSourceCard from '../../../../src/components/mdx/NewsSourceCard.astro'

# 2026-06-12 テスト

## 政治

### 見出し

<NewsSourceCard
\thref='https://example.com'
\tsource='Example'
\ttitle='Example source'
\tdescription='Example memo'
\timageUrl='https://example.com/image.jpg'
\timageAlt='Example image'
/>

要点: 政策判断に直結する変更が発表された。

何が起きたか: 政府は新しい規制案を公表し、企業に追加対応を求めた。

なぜ重要か: 対応期限が短く、運用と投資判断の両方に影響する。

今後の注視点: 最終規則の文言と主要企業の対応時期を見る。
`

const englishSmartBrevityNews = `---
title: '2026-06-12 Test'
contentType: news
draft: false
---

import NewsSourceCard from '../../../../src/components/mdx/NewsSourceCard.astro'

# 2026-06-12 Test

## Politics

### Headline

<NewsSourceCard
\thref='https://example.com'
\tsource='Example'
\ttitle='Example source'
\tdescription='Example memo'
\timageUrl='https://example.com/image.jpg'
\timageAlt='Example image'
/>

The bottom line: A policy shift changes the operating assumptions for regulated firms.

What happened: The agency published a proposed rule and asked companies to prepare new disclosures.

Why it matters: The timeline is short, so compliance work and investment decisions now move together.

What to watch: Watch the final rule text and the first response from major firms.
`

test('news item format accepts Axios-inspired Smart Brevity labels in Japanese news', () => {
	const result = validateNewsItemFormat({
		file: 'articles/news/example/ja/index.mdx',
		source: japaneseSmartBrevityNews
	})

	assert.deepEqual(result.errors, [])
})

test('news item format accepts Axios-inspired Smart Brevity labels in English news', () => {
	const result = validateNewsItemFormat({
		file: 'articles/news/example/en/index.mdx',
		source: englishSmartBrevityNews
	})

	assert.deepEqual(result.errors, [])
})

test('news item format rejects changed news topics without a bottom-line summary', () => {
	const result = validateNewsItemFormat({
		file: 'articles/news/example/ja/index.mdx',
		source: japaneseSmartBrevityNews.replace(/^要点:.*\n\n/m, '')
	})

	assert.match(
		result.errors.join('\n'),
		/articles\/news\/example\/ja\/index\.mdx:13 should include 要点: before 何が起きたか:/,
		'changed Japanese news topics should include a bottom-line summary before details'
	)
})

test('news item format keeps Smart Brevity labels as short single paragraphs', () => {
	const result = validateNewsItemFormat({
		file: 'articles/news/example/en/index.mdx',
		source: englishSmartBrevityNews.replace(
			/^The bottom line:.*$/m,
			`The bottom line: ${'This summary is too long. '.repeat(16)}`
		)
	})

	assert.match(
		result.errors.join('\n'),
		/articles\/news\/example\/en\/index\.mdx:13 The bottom line: should stay brief/,
		'bottom-line summaries should stay concise enough to scan'
	)
})

test('changed news item format validation succeeds when the changed range has no news files', () => {
	const output = execFileSync(
		'node',
		['ops/scripts/validate-news-item-format.mjs', '--changed', 'HEAD...HEAD'],
		{ encoding: 'utf8' }
	)

	assert.match(output, /Validated news item format for 0 file\(s\)\./)
})
