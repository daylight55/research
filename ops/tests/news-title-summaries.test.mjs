import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

const GENERIC_NEWS_TITLE_RE = /^\d{4}-\d{2}-\d{2}\s+ホットトレンド[:：]\s*政治・経済・技術$/

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

function findFiles(...patterns) {
	return patterns
		.flatMap((pattern) =>
			execFileSync('find', ['articles/news', '-path', pattern, '-type', 'f'], {
				encoding: 'utf8'
			})
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
		)
		.sort()
}

test('news article titles summarize the day after the date', () => {
	const files = findFiles('articles/news/*/ja/index.mdx')

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
	const files = findFiles('articles/news/*/en/index.mdx')

	const digestLabelRe = /^(What happened|Why it matters|What to watch):/
	const staleLabelRe =
		/^(What Happened|Why it's important|Implications for practice|Practical implication|Practical Implications):/

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

test('news digests use forward-looking watch labels instead of practice implication labels', () => {
	const files = findFiles('articles/news/*/ja/index.mdx', 'articles/news/*/en/index.mdx')

	for (const file of files) {
		const source = readFileSync(file, 'utf8')
		const frontmatter = frontmatterOf(source, file)
		if (readScalar(frontmatter, 'contentType') !== 'news') continue
		if (readScalar(frontmatter, 'draft') === 'true') continue

		assert.doesNotMatch(
			source,
			/^(業務への含意|実務への含意|Implications for practice|Practical implication):/m,
			`${file} should not use stale practice implication labels`
		)

		const expectedLabel = file.includes('/en/') ? 'What to watch:' : '今後の注視点:'
		assert.match(
			source,
			new RegExp(`^${expectedLabel}`, 'm'),
			`${file} should use ${expectedLabel}`
		)
	}
})

test('news source cards appear directly below each topic heading', () => {
	const files = findFiles('articles/news/*/ja/index.mdx', 'articles/news/*/en/index.mdx')

	for (const file of files) {
		const source = readFileSync(file, 'utf8')
		const frontmatter = frontmatterOf(source, file)
		if (readScalar(frontmatter, 'contentType') !== 'news') continue
		if (readScalar(frontmatter, 'draft') === 'true') continue

		const lines = source.split('\n')
		for (const [index, line] of lines.entries()) {
			if (!line.startsWith('### ')) continue

			const nextContentLine = lines.slice(index + 1).find((candidate) => candidate.trim() !== '')
			assert.equal(
				nextContentLine,
				'<NewsSourceCard',
				`${file}:${index + 1} should place NewsSourceCard directly below the topic heading`
			)
		}
	}
})
