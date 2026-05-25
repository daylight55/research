import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

test('published report articles use SourceNote instead of plain source memo labels', () => {
	const files = execFileSync('git', ['ls-files', 'articles/report/*/index.mdx'], {
		encoding: 'utf8'
	})
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)

	for (const file of files) {
		const source = readFileSync(file, 'utf8')
		assert.doesNotMatch(
			source,
			/出典メモ:/,
			`${file} should use <SourceNote>...</SourceNote> instead of plain 出典メモ: labels`
		)
	}
})
