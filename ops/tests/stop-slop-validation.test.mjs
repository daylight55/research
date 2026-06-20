import { strict as assert } from 'node:assert'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { validateStopSlop } from '../scripts/validate-stop-slop.mjs'

const frontmatter = `---
title: 'Example'
description: 'Example.'
contentType: report
pubDate: '2026-06-20'
draft: false
---
`

test('Stop Slop validation accepts direct article prose', () => {
	const result = validateStopSlop({
		file: 'articles/report/example/en/index.mdx',
		source: `${frontmatter}
# Example

The constraint is budget discipline. The team can reduce scope or move the date.
`
	})

	assert.deepEqual(result.errors, [])
})

test('Stop Slop validation rejects high-confidence AI tells', () => {
	const result = validateStopSlop({
		file: 'articles/report/example/en/index.mdx',
		source: `${frontmatter}
# Example

It turns out that the market is not just larger, but also faster.
`
	})

	assert.match(result.errors.join('\n'), /remove Stop Slop filler/)
	assert.match(result.errors.join('\n'), /not just .* but also/)
})

test('Stop Slop validation allows structured news labels', () => {
	const result = validateStopSlop({
		file: 'articles/news/example/en/index.mdx',
		source: `${frontmatter}
# Example

What happened: The agency published the report.
Why it matters: The new rule changes procurement timing.
What to watch: Watch whether vendors update contracts.
`
	})

	assert.deepEqual(result.errors, [])
})

test('Stop Slop validation rejects Japanese summary crutches', () => {
	const result = validateStopSlop({
		file: 'articles/report/example/ja/index.mdx',
		source: `${frontmatter}
# Example

要するに、この表現は直接的ではない。
`
	})

	assert.match(result.errors.join('\n'), /Japanese summary crutch/)
})

test('Stop Slop validation CLI supports changed ranges with no article files', () => {
	const output = execFileSync(
		'node',
		['ops/scripts/validate-stop-slop.mjs', '--changed', 'HEAD...HEAD'],
		{ encoding: 'utf8' }
	)

	assert.match(output, /Validated Stop Slop prose rules for 0 article file\(s\)\./)
})

test('Stop Slop validation CLI ignores non-article explicit paths', () => {
	const dir = mkdtempSync(path.join(tmpdir(), 'stop-slop-validation-'))
	const file = path.join(dir, 'index.mdx')
	writeFileSync(
		file,
		`${frontmatter}
# Example

要するに、この表現は直接的ではない。
`
	)

	const result = spawnSync('node', ['ops/scripts/validate-stop-slop.mjs', file], {
		encoding: 'utf8'
	})

	assert.equal(result.status, 0, 'non-article temp paths should be ignored')
})
