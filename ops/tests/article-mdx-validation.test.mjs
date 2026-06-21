import { strict as assert } from 'node:assert'
import { execFileSync } from 'node:child_process'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { validateArticleMdx } from '../scripts/validate-article-mdx.mjs'

const validMdx = `---
title: '2026-06-16 Markets move on policy signals'
description: 'A concise daily news summary.'
contentType: news
pubDate: '2026-06-16'
draft: false
---

# 2026-06-16 Markets move on policy signals

<NewsSourceCard
\thref='https://example.com/source'
\tsource='Example'
\ttitle='Example source'
\tdescription='A concise source memo.'
\timageUrl='https://example.com/image.jpg'
\timageAlt='Example image'
/>
`

const invalidMdx = `---
title: '2026-06-16 Markets move on policy signals'
description: 'A concise daily news summary.'
contentType: news
pubDate: '2026-06-16'
draft: false
---

# 2026-06-16 Markets move on policy signals

The source memo mentions <https://example.com/source.path> directly in prose.
`

test('article MDX validation accepts valid article MDX', async () => {
	const result = await validateArticleMdx({
		file: 'articles/news/example/en/index.mdx',
		source: validMdx
	})

	assert.deepEqual(result.errors, [])
})

test('article MDX validation rejects raw angle-bracket prose before Astro build', async () => {
	const result = await validateArticleMdx({
		file: 'articles/news/daily-trends-2026-06-16/en/index.mdx',
		source: invalidMdx
	})

	assert.match(
		result.errors.join('\n'),
		/articles\/news\/daily-trends-2026-06-16\/en\/index\.mdx:11:\d+ should contain valid MDX/,
		'bad MDX should be caught before Astro build'
	)
})

test('changed article MDX validation succeeds when changed range has no article files', () => {
	const output = execFileSync(
		'node',
		['ops/scripts/validate-article-mdx.mjs', '--changed', 'HEAD...HEAD'],
		{ encoding: 'utf8' }
	)

	assert.match(output, /Validated article MDX syntax for 0 file\(s\)\./)
})

test('changed article MDX validation ignores non-article MDX templates', () => {
	const file = 'ops/codex/templates/tmp-validation-ignore.mdx'
	writeFileSync(file, '<PlaceholderTemplate />\n')

	try {
		const output = execFileSync('node', ['ops/scripts/validate-article-mdx.mjs', '--changed'], {
			encoding: 'utf8'
		})

		assert.doesNotMatch(output, /tmp-validation-ignore\.mdx/)
	} finally {
		rmSync(file, { force: true })
	}
})

test('article MDX validation CLI reports malformed explicit article files', () => {
	const dir = mkdtempSync(path.join(tmpdir(), 'mdx-validation-'))
	const file = path.join(dir, 'broken.mdx')
	writeFileSync(file, invalidMdx)

	const result = spawnSync('node', ['ops/scripts/validate-article-mdx.mjs', file], {
		encoding: 'utf8'
	})

	assert.notEqual(result.status, 0)
	assert.match(result.stderr, /broken\.mdx:11:\d+ should contain valid MDX/)
})
