import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

const GENERIC_NEWS_TITLE_RE =
	/^\d{4}-\d{2}-\d{2}\s+ホットトレンド[:：]\s*政治・経済・技術$/

function frontmatterOf(source, file) {
	const match = source.match(/^---\n([\s\S]*?)\n---/)
	assert.ok(match, `${file} should start with frontmatter`)
	return match[1]
}

function readScalar(frontmatter, key) {
	const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
	if (!match) return ''
	return match[1].trim().replace(/^['"]|['"]$/g, '')
}

test('news article titles summarize the day after the date', () => {
	const files = execFileSync('git', ['ls-files', 'articles/news/*/index.mdx'], { encoding: 'utf8' })
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)

	for (const file of files) {
		const source = readFileSync(file, 'utf8')
		const frontmatter = frontmatterOf(source, file)
		if (readScalar(frontmatter, 'contentType') !== 'news') continue
		if (readScalar(frontmatter, 'draft') === 'true') continue

		const title = readScalar(frontmatter, 'title')
		assert.match(title, /^\d{4}-\d{2}-\d{2}\s+\S/, `${file} title should start with a date`)
		assert.doesNotMatch(
			title,
			GENERIC_NEWS_TITLE_RE,
			`${file} title should summarize the overall situation, not just list categories`
		)
		assert.ok(
			title.replace(/^\d{4}-\d{2}-\d{2}\s+/, '').length >= 12,
			`${file} title should include a substantive summary after the date`
		)

		const h1 = source.match(/^#\s+(.+)$/m)?.[1] ?? ''
		assert.equal(h1, title, `${file} H1 should match frontmatter title`)
	}
})

test('translated news digest labels stay paragraph-separated', () => {
	const files = execFileSync('git', ['ls-files', 'articles/news/en/*/index.mdx'], {
		encoding: 'utf8'
	})
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)

	const digestLabelRe = /^(What happened|Why it matters|Implications for practice):/
	const staleLabelRe = /^(What Happened|Why it's important|Practical Implications):/

	for (const file of files) {
		const source = readFileSync(file, 'utf8')
		assert.doesNotMatch(
			source,
			/``[^`\n]+?''/,
			`${file} should use normal quotation marks instead of TeX-style backtick quotes`
		)

		const frontmatter = frontmatterOf(source, file)
		if (readScalar(frontmatter, 'contentType') !== 'news') continue
		if (readScalar(frontmatter, 'draft') === 'true') continue

		const lines = source.split('\n')
		for (const [index, line] of lines.entries()) {
			assert.doesNotMatch(line, staleLabelRe, `${file}:${index + 1} should use canonical labels`)
			if (!digestLabelRe.test(line) && !line.startsWith('<NewsSourceCard')) continue

			assert.equal(
				lines[index - 1],
				'',
				`${file}:${index + 1} should have a blank line before news digest labels and cards`
			)
		}
	}
})
