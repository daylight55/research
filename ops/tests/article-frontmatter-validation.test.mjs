import { strict as assert } from 'node:assert'
import { execFileSync } from 'node:child_process'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { validateArticleFrontmatter } from '../scripts/validate-article-frontmatter.mjs'

const validMdx = `---
title: '2026-06-13 Markets move on policy signals'
description: 'A concise daily news summary.'
contentType: news
pubDate: '2026-06-13'
draft: false
---

# 2026-06-13 Markets move on policy signals
`

const invalidMdx = `---
title: 2026-06-13 Markets: policy signals
description: 'A concise daily news summary.'
contentType: news
pubDate: '2026-06-13'
draft: false
---

# 2026-06-13 Markets
`

test('article frontmatter validation accepts valid MDX YAML frontmatter', () => {
	const result = validateArticleFrontmatter({
		file: 'articles/news/example/en/index.mdx',
		source: validMdx
	})

	assert.deepEqual(result.errors, [])
})

test('article frontmatter validation rejects the malformed YAML seen in generated news CI', () => {
	const result = validateArticleFrontmatter({
		file: 'articles/news/daily-trends-2026-06-13/en/index.mdx',
		source: invalidMdx
	})

	assert.match(
		result.errors.join('\n'),
		/articles\/news\/daily-trends-2026-06-13\/en\/index\.mdx:2 should contain valid YAML frontmatter/,
		'bad frontmatter should be caught before Astro build'
	)
})

test('changed article frontmatter validation succeeds when changed range has no article files', () => {
	const output = execFileSync(
		'node',
		['ops/scripts/validate-article-frontmatter.mjs', '--changed', 'HEAD...HEAD'],
		{ encoding: 'utf8' }
	)

	assert.match(output, /Validated article frontmatter for 0 file\(s\)\./)
})

test('article frontmatter validation CLI reports malformed changed article files', () => {
	const dir = mkdtempSync(path.join(tmpdir(), 'frontmatter-validation-'))
	const file = path.join(dir, 'broken.mdx')
	writeFileSync(file, invalidMdx)

	const result = spawnSync('node', ['ops/scripts/validate-article-frontmatter.mjs', file], {
		encoding: 'utf8'
	})

	assert.notEqual(result.status, 0)
	assert.match(result.stderr, /broken\.mdx:2 should contain valid YAML frontmatter/)
})
