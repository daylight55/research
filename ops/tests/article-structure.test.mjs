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
	const match = file.match(/^articles\/(report|news)\/([^/]+)\/(?:ja|en)\/index\.mdx$/)
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
			/^articles\/(?:report|news)\/[^/]+\/(?:ja|en)\/(?:index|research-log)\.mdx$/,
			`${file} should use the article slug before locale directory contract`
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

test('article schema and templates support generation metadata', () => {
	const contentConfig = readFileSync('src/content.config.ts', 'utf8')
	const blogPostLayout = readFileSync('src/layouts/BlogPost.astro', 'utf8')
	const generationModel = readFileSync('src/components/ArticleGenerationModel.astro', 'utf8')
	const articlePages = [
		'src/pages/reports/[...slug].astro',
		'src/pages/news/[...slug].astro',
		'src/pages/en/reports/[...slug].astro',
		'src/pages/en/news/[...slug].astro',
		'src/pages/mix/reports/[...slug].astro',
		'src/pages/mix/news/[...slug].astro'
	]
	const reportTemplate = readFileSync('ops/codex/templates/blog-entry.mdx', 'utf8')
	const newsTemplate = readFileSync('ops/codex/templates/news-digest.mdx', 'utf8')

	assert.match(
		contentConfig,
		/generation:\s*z[\s\S]*?\.object\(\{[\s\S]*?model:\s*z\.string\(\)[\s\S]*?\}\)[\s\S]*?\.optional\(\)/,
		'article frontmatter schema should allow optional generation model metadata'
	)
	assert.doesNotMatch(
		contentConfig,
		/promptSource|promptSummary/,
		'article frontmatter schema should not store prompt details'
	)

	for (const [file, source] of [
		['ops/codex/templates/blog-entry.mdx', reportTemplate],
		['ops/codex/templates/news-digest.mdx', newsTemplate]
	]) {
		assert.match(
			source,
			/generation:\n\s+model: '<MODEL_USED_TO_CREATE_ARTICLE>'/,
			`${file} should include generation.model`
		)
		assert.doesNotMatch(
			source,
			/promptSource|promptSummary/,
			`${file} should not include prompt metadata`
		)
	}

	assert.doesNotMatch(
		blogPostLayout,
		/ArticleGenerationMeta/,
		'article body should not render prompt metadata'
	)
	assert.match(
		generationModel,
		/generation\?\.model/,
		'generation model component should be optional'
	)
	assert.match(generationModel, /Model/, 'generation model component should show a model label')
	assert.doesNotMatch(generationModel, /promptSource|promptSummary|プロンプト要約|Prompt summary/)

	for (const file of articlePages) {
		const source = readFileSync(file, 'utf8')
		assert.match(
			source,
			/ArticleGenerationModel/,
			`${file} should import the sidebar model component`
		)
		assert.match(
			source,
			/<ArticleGenerationModel generation=\{post\.data\.generation\} \/>/,
			`${file} should render the model in the article sidebar`
		)
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
	const logs = gitFiles([
		'articles/report/*/ja/research-log.mdx',
		'articles/report/*/en/research-log.mdx',
		'articles/news/*/ja/research-log.mdx',
		'articles/news/*/en/research-log.mdx'
	])
	const reportPage = readFileSync('src/pages/reports/[...slug].astro', 'utf8')
	const englishReportPage = readFileSync('src/pages/en/reports/[...slug].astro', 'utf8')

	for (const source of [reportPage, englishReportPage]) {
		assert.match(source, /getCollection\('articleResearch'\)/)
		assert.match(source, /hasResearchLog/)
		assert.match(source, /\/reports\/\$\{postSlug\}\/research\//)
	}

	for (const log of logs) {
		const indexFile = path.join(path.dirname(log), 'index.mdx')
		assert.ok(existsSync(indexFile), `${log} should have a sibling index.mdx`)
	}
})
