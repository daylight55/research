import { strict as assert } from 'node:assert'
import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { test } from 'node:test'

const placeholderRe = /\b(TBD|TODO|FIXME|未定|要確認)\b/

function gitFiles(patterns) {
	return execFileSync('git', ['ls-files', ...patterns], { encoding: 'utf8' })
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
}

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

function articleKey(file) {
	const match = file.match(/^articles\/(report|news)\/(?:en\/)?([^/]+)\/index\.mdx$/)
	assert.ok(match, `${file} should be an article index file`)
	return { type: match[1], slug: match[2] }
}

test('published articles live in canonical shallow article directories', () => {
	const files = gitFiles(['articles/**/*.mdx'])
	const forbiddenSupportFiles = gitFiles([
		'articles/**/report.md',
		'articles/**/research-tasks.md',
		'articles/**/notes/**',
		'articles/**/sources/**',
		'articles/**/figures/**',
		'articles/**/prototype/**'
	])

	assert.deepEqual(
		forbiddenSupportFiles,
		[],
		'public research material should be summarized in index.mdx or research-log.mdx'
	)

	for (const file of files) {
		assert.match(
			file,
			/^articles\/(?:report|news)\/(?:en\/)?[^/]+\/(?:index|research-log)\.mdx$/,
			`${file} should use the shallow article directory contract`
		)
	}
})

test('article frontmatter contentType matches its directory type', () => {
	for (const file of gitFiles(['articles/*/**/index.mdx'])) {
		const { type } = articleKey(file)
		const frontmatter = frontmatterOf(readFileSync(file, 'utf8'), file)
		const contentType = readScalar(frontmatter, 'contentType') || 'report'

		assert.equal(contentType, type, `${file} contentType should match articles/${type}`)
	}
})

test('article body does not import duplicate report bodies or unresolved placeholders', () => {
	for (const file of gitFiles(['articles/*/**/index.mdx', 'articles/*/**/research-log.mdx'])) {
		const source = readFileSync(file, 'utf8')

		assert.doesNotMatch(
			source,
			/import[ \t]+.*report\.md|<Report[ \t]\/>/,
			`${file} should not import a duplicate report.md body`
		)
		assert.doesNotMatch(source, placeholderRe, `${file} should not contain unresolved placeholders`)
	}
})

test('articles with research logs have sibling indexes and public route support', () => {
	const logs = gitFiles(['articles/report/*/research-log.mdx', 'articles/news/*/research-log.mdx'])
	const postPage = readFileSync('src/pages/post/[...slug].astro', 'utf8')
	const englishPostPage = readFileSync('src/pages/en/post/[...slug].astro', 'utf8')

	for (const source of [postPage, englishPostPage]) {
		assert.match(source, /getCollection\('articleResearch'\)/)
		assert.match(source, /hasResearchLog/)
		assert.match(source, /\/post\/\$\{postSlug\}\/research\//)
	}

	for (const log of logs) {
		const indexFile = path.join(path.dirname(log), 'index.mdx')
		assert.ok(existsSync(indexFile), `${log} should have a sibling index.mdx`)
	}
})
