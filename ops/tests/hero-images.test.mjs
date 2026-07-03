import { strict as assert } from 'node:assert'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { test } from 'node:test'

const DEFAULT_FALLBACK_HERO_SOURCE_ID = 'fallback:unsplash:lVZjvw-u9V8'

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

function sha256(file) {
	return createHash('sha256').update(readFileSync(file)).digest('hex')
}

function canonicalPostKey(file) {
	const postId = file.replace(/^articles\/(?:report|news)\//, '').replace(/\/index\.mdx$/, '')
	return postId.replace(/\/(?:ja|en)$/, '')
}

test('published blog entries use concrete non-duplicated hero images', () => {
	const files = execFileSync(
		'find',
		['articles', '-path', 'articles/*/*/*/index.mdx', '-type', 'f'],
		{
			encoding: 'utf8'
		}
	)
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
	const seen = new Map()

	for (const file of files) {
		const frontmatter = frontmatterOf(readFileSync(file, 'utf8'), file)
		const draft = readScalar(frontmatter, 'draft')
		if (draft === 'true') continue

		const heroImage = readScalar(frontmatter, 'heroImage')
		assert.ok(heroImage, `${file} should declare heroImage`)
		assert.ok(
			!/(placeholder|banner\.jpg|book\.jpg|placeholder-social)/i.test(heroImage),
			`${file} should not use a placeholder hero image`
		)
		const sourceId = readScalar(frontmatter, 'heroImageSourceId')
		assert.ok(
			!sourceId.startsWith('codex:'),
			`${file} should use a source-traceable hero image instead of Codex-generated artwork`
		)

		const imagePath = path.normalize(path.join(path.dirname(file), heroImage))
		assert.ok(existsSync(imagePath), `${file} hero image should exist: ${imagePath}`)

		const hash = sha256(imagePath)
		const duplicate = seen.get(hash)
		const isFallbackHero = sourceId === DEFAULT_FALLBACK_HERO_SOURCE_ID
		const duplicateIsFallbackHero = duplicate?.sourceId === DEFAULT_FALLBACK_HERO_SOURCE_ID
		assert.ok(
			!duplicate ||
				duplicate.postKey === canonicalPostKey(file) ||
				isFallbackHero ||
				duplicateIsFallbackHero,
			`${file} duplicates hero image used by ${duplicate?.file}: ${imagePath}`
		)
		seen.set(hash, { file, postKey: canonicalPostKey(file), sourceId })
	}
})

test('localized versions of the same entry use the same hero image source', () => {
	const files = execFileSync(
		'find',
		['articles', '-path', 'articles/*/*/*/index.mdx', '-type', 'f'],
		{
			encoding: 'utf8'
		}
	)
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
	const posts = new Map()
	const sharedHeroFields = [
		'heroImage',
		'heroImageCredit',
		'heroImageCreditUrl',
		'heroImageSourceId'
	]

	for (const file of files) {
		const localeMatch = file.match(/\/(ja|en)\/index\.mdx$/)
		if (!localeMatch) continue

		const frontmatter = frontmatterOf(readFileSync(file, 'utf8'), file)
		const draft = readScalar(frontmatter, 'draft')
		if (draft === 'true') continue

		const postKey = canonicalPostKey(file)
		const locale = localeMatch[1]
		const entry = Object.fromEntries(
			sharedHeroFields.map((field) => [field, readScalar(frontmatter, field)])
		)
		const localized = posts.get(postKey) ?? {}
		localized[locale] = { file, entry }
		posts.set(postKey, localized)
	}

	for (const [postKey, localized] of posts) {
		if (!localized.ja || !localized.en) continue

		for (const field of sharedHeroFields) {
			assert.equal(
				localized.ja.entry[field],
				localized.en.entry[field],
				`${postKey} should share ${field} across ja/en (${localized.ja.file} vs ${localized.en.file})`
			)
		}
	}
})
