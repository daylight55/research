import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

function reportArticleFiles() {
	return execFileSync('find', ['articles/report', '-path', 'articles/report/*/*/index.mdx', '-type', 'f'], {
		encoding: 'utf8'
	})
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
}

function japaneseReportArticleFiles() {
	return reportArticleFiles().filter((file) => file.includes('/ja/'))
}

test('published report articles use SourceNote instead of plain source memo labels', () => {
	const files = japaneseReportArticleFiles()

	for (const file of files) {
		const source = readFileSync(file, 'utf8')
		assert.doesNotMatch(
			source,
			/^出典メモ:/m,
			`${file} should use <SourceNote>...</SourceNote> instead of plain 出典メモ: labels`
		)
	}
})

test('SourceNote is written inline without duplicated citation punctuation', () => {
	const files = reportArticleFiles()

	for (const file of files) {
		const source = readFileSync(file, 'utf8')
		assert.doesNotMatch(
			source,
			/<SourceNote(?:\s+[^>]*)?>\s*\n/,
			`${file} should write SourceNote content inline to avoid separated citation parentheses`
		)
		assert.doesNotMatch(
			source,
			/\n\s*<\/SourceNote>/,
			`${file} should close SourceNote on the same line as its content`
		)
		assert.doesNotMatch(
			source,
			/<SourceNote(?:\s+[^>]*)?>\s*(?:[（(]|出典[:：]|Source(?: note)?[:：])/i,
			`${file} should not add manual parentheses or source labels inside SourceNote`
		)
	}
})
