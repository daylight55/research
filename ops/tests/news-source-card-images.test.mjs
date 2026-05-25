import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

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

function newsSourceCards(source) {
	return [...source.matchAll(/<NewsSourceCard\b[\s\S]*?\/>/g)].map((match) => match[0])
}

function hasProp(block, prop) {
	return new RegExp(`\\b${prop}=(['"])\\S[\\s\\S]*?\\1`).test(block)
}

test('published news articles provide images for every NewsSourceCard', () => {
	const files = execFileSync('git', ['ls-files', 'articles/*/index.mdx'], { encoding: 'utf8' })
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)

	for (const file of files) {
		const source = readFileSync(file, 'utf8')
		const frontmatter = frontmatterOf(source, file)
		if (readScalar(frontmatter, 'contentType') !== 'news') continue
		if (readScalar(frontmatter, 'draft') === 'true') continue

		const cards = newsSourceCards(source)
		assert.ok(cards.length > 0, `${file} should include NewsSourceCard blocks`)

		cards.forEach((card, index) => {
			assert.ok(
				hasProp(card, 'imageUrl'),
				`${file} NewsSourceCard ${index + 1} should include imageUrl`
			)
			assert.ok(
				hasProp(card, 'imageAlt'),
				`${file} NewsSourceCard ${index + 1} should include imageAlt`
			)
			assert.ok(
				!/imageUrl=(['"])data:image\//.test(card),
				`${file} NewsSourceCard ${index + 1} should use a real article, official, web, or Unsplash image`
			)
		})
	}
})
