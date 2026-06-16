import { strict as assert } from 'node:assert'
import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { test } from 'node:test'

const placeholderRe = /\b(TBD|TODO|FIXME|未定|要確認)\b/

function gitFiles(patterns) {
	return [
		...new Set(
			execFileSync(
				'git',
				['ls-files', '--cached', '--modified', '--others', '--exclude-standard', '--', ...patterns],
				{
					encoding: 'utf8'
				}
			)
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
		)
	]
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
		'public research material should be summarized in index.mdx, source-notes.mdx, or research-log.mdx'
	)

	for (const file of files) {
		assert.match(
			file,
			/^articles\/(?:report|news)\/[^/]+\/(?:ja|en)\/(?:index|research-log|source-notes)\.mdx$/,
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

test('published article frontmatter records the generation model', () => {
	for (const file of gitFiles(['articles/*/**/index.mdx'])) {
		const frontmatter = frontmatterOf(readFileSync(file, 'utf8'), file)

		assert.match(
			frontmatter,
			/^generation:\n\s+model: 'gpt-5\.4-mini'$/m,
			`${file} should record the article generation model`
		)
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
	for (const file of gitFiles([
		'articles/*/**/index.mdx',
		'articles/*/**/research-log.mdx',
		'articles/*/**/source-notes.mdx'
	])) {
		const source = readFileSync(file, 'utf8')

		assert.doesNotMatch(
			source,
			/import[ \t]+.*report\.md|<Report[ \t]\/>/,
			`${file} should not import a duplicate report.md body`
		)
		assert.doesNotMatch(source, placeholderRe, `${file} should not contain unresolved placeholders`)
	}
})

test('report headings avoid generic practical-implication labels', () => {
	const genericPracticalHeadingRe =
		/(?:^#{2,6}\s+\d+(?:\.\d+)?\.\s+|"(?:ja|en)":\s*"\d+(?:\.\d+)?\.\s*)(?:実務上の含意|実務的な含意|実務的含意|実務含意|実務への含意|業務への含意|実務上の見方|実務的な読み方|実務的な見方|実務上どう読むべきか|Practical Reading(?: Rules)?|Practical reading|Practical perspective|Practical Takeaways|Practical [Ii]mplications?)(?:"|$)/m
	const genericPracticalPhraseRe =
		/実務上の見方は単純|実務上の要点|実務上の推奨|実務的に見るべき|含意は明確|日本の含意は|The practical point is|The practical points are|There are three practical points|The practical recommendations are clear|For practical readers|The practical checklist is/
	const genericPracticalIdRe =
		/"id":\s*"(?:practical-implications|practice-implications|implications)"/

	for (const file of gitFiles([
		'articles/report/**/index.mdx',
		'articles/report/**/mix-alignment.json'
	])) {
		const source = readFileSync(file, 'utf8')

		assert.doesNotMatch(
			source,
			genericPracticalHeadingRe,
			`${file} should name decision-oriented sections after their actual context`
		)
		assert.doesNotMatch(
			source,
			genericPracticalPhraseRe,
			`${file} should avoid generic practical-view boilerplate in report body text`
		)
		assert.doesNotMatch(
			source,
			genericPracticalIdRe,
			`${file} should use context-specific mixed-section ids instead of generic implication ids`
		)
	}
})

test('published Japanese articles have public research logs', () => {
	for (const file of gitFiles(['articles/*/*/ja/index.mdx'])) {
		const logFile = path.join(path.dirname(file), 'research-log.mdx')

		assert.ok(existsSync(logFile), `${file} should have a public research-log.mdx`)
	}
})

test('research logs record public generation context and investigation input', () => {
	for (const file of gitFiles(['articles/*/**/research-log.mdx'])) {
		const { type } = articleKey(file.replace(/research-log\.mdx$/, 'index.mdx'))
		const source = readFileSync(file, 'utf8')

		assert.match(
			source,
			/^## (?:利用環境|Environment)$/m,
			`${file} should include generation context`
		)
		assert.match(
			source,
			/^-\s+(?:Automation\s+)?model:\s+`gpt-5\.4-mini`$/im,
			`${file} should record the model`
		)
		assert.match(
			source,
			/^## (?:調査命令|Research Instruction)$/m,
			`${file} should include the investigation input`
		)
		assert.doesNotMatch(
			source,
			/research-queue\/issues|github\.com\/daylight55\/research-queue\/issues/,
			`${file} should not expose private issue URLs`
		)

		if (type === 'news') {
			assert.match(
				source,
				/https:\/\/github\.com\/daylight55\/research\/blob\/main\/ops\/codex\/prompts\/daily-trend-news\.md/,
				`${file} should link to the public news prompt source`
			)
		} else {
			assert.match(
				source,
				/https:\/\/github\.com\/daylight55\/research\/blob\/main\/\.codex\/skills\/research-report\/SKILL\.md/,
				`${file} should link to the public report skill source`
			)
			assert.match(
				source,
				/https:\/\/github\.com\/daylight55\/research\/blob\/main\/ops\/codex\/prompts\/daily-issue-research\.md/,
				`${file} should link to the public report prompt source`
			)
		}
	}
})

test('articles with research logs have sibling indexes and public route support', () => {
	const logs = gitFiles([
		'articles/report/*/ja/research-log.mdx',
		'articles/report/*/en/research-log.mdx',
		'articles/news/*/ja/research-log.mdx',
		'articles/news/*/en/research-log.mdx'
	])
	const articleRouteChecks = [
		['src/pages/reports/[...slug].astro', /section='reports'/],
		['src/pages/en/reports/[...slug].astro', /section='reports'/],
		['src/pages/news/[...slug].astro', /section='news'/],
		['src/pages/en/news/[...slug].astro', /section='news'/]
	]
	const researchRouteChecks = [
		['src/pages/reports/[slug]/research.astro', /post\.data\.contentType === 'report'/],
		['src/pages/en/reports/[slug]/research.astro', /post\.data\.contentType === 'report'/],
		['src/pages/news/[slug]/research.astro', /post\.data\.contentType === 'news'/],
		['src/pages/en/news/[slug]/research.astro', /post\.data\.contentType === 'news'/]
	]

	for (const [file, researchHref] of articleRouteChecks) {
		const source = readFileSync(file, 'utf8')
		assert.match(source, /getCollection\('articleResearch'\)/)
		assert.match(source, /hasResearchLog/)
		assert.match(source, /<ArticleResearchLinks/)
		assert.match(source, researchHref)
	}

	for (const [file, contentTypeFilter] of researchRouteChecks) {
		const source = readFileSync(file, 'utf8')
		assert.match(source, /getCollection\('articleResearch'\)/)
		assert.match(source, contentTypeFilter, `${file} should publish only its article type`)
	}

	for (const log of logs) {
		const indexFile = path.join(path.dirname(log), 'index.mdx')
		assert.ok(existsSync(indexFile), `${log} should have a sibling index.mdx`)
	}
})

test('research routes select logs from the matching content locale', () => {
	const routeLocales = [
		['src/pages/reports/[slug]/research.astro', /getPostLocale\(entry\) === DEFAULT_LOCALE/],
		['src/pages/news/[slug]/research.astro', /getPostLocale\(entry\) === DEFAULT_LOCALE/],
		['src/pages/en/reports/[slug]/research.astro', /getPostLocale\(entry\) === 'en'/],
		['src/pages/en/news/[slug]/research.astro', /getPostLocale\(entry\) === 'en'/]
	]
	const articleLocales = [
		['src/pages/reports/[...slug].astro', /getPostLocale\(entry\) === locale/],
		['src/pages/news/[...slug].astro', /getPostLocale\(entry\) === locale/],
		['src/pages/en/reports/[...slug].astro', /getPostLocale\(entry\) === locale/],
		['src/pages/en/news/[...slug].astro', /getPostLocale\(entry\) === locale/],
		['src/pages/mix/reports/[...slug].astro', /getPostLocale\(entry\) === DEFAULT_LOCALE/],
		['src/pages/mix/news/[...slug].astro', /getPostLocale\(entry\) === DEFAULT_LOCALE/]
	]

	for (const [file, localeFilter] of routeLocales) {
		const source = readFileSync(file, 'utf8')
		assert.match(source, localeFilter, `${file} should filter research logs by locale`)
	}

	for (const [file, localeFilter] of articleLocales) {
		const source = readFileSync(file, 'utf8')
		assert.match(source, localeFilter, `${file} should detect research logs by locale`)
		assert.match(
			source,
			/getPostSlug\(entry\) === postSlug/,
			`${file} should still match research logs by article slug`
		)
	}
})

test('article source notes have sibling indexes and public route support', () => {
	const sourceNotes = gitFiles([
		'articles/report/*/ja/source-notes.mdx',
		'articles/report/*/en/source-notes.mdx',
		'articles/news/*/ja/source-notes.mdx',
		'articles/news/*/en/source-notes.mdx'
	])
	const articleRouteChecks = [
		['src/pages/reports/[...slug].astro', /section='reports'/],
		['src/pages/en/reports/[...slug].astro', /section='reports'/],
		['src/pages/news/[...slug].astro', /section='news'/],
		['src/pages/en/news/[...slug].astro', /section='news'/]
	]
	const sourceRouteChecks = [
		['src/pages/reports/[slug]/sources.astro', /post\.data\.contentType === 'report'/],
		['src/pages/en/reports/[slug]/sources.astro', /post\.data\.contentType === 'report'/],
		['src/pages/news/[slug]/sources.astro', /post\.data\.contentType === 'news'/],
		['src/pages/en/news/[slug]/sources.astro', /post\.data\.contentType === 'news'/]
	]
	const researchRouteChecks = [
		'src/pages/reports/[slug]/research.astro',
		'src/pages/en/reports/[slug]/research.astro',
		'src/pages/news/[slug]/research.astro',
		'src/pages/en/news/[slug]/research.astro'
	]

	const contentConfig = readFileSync('src/content.config.ts', 'utf8')
	const articleSupport = readFileSync('src/utils/articleSupport.ts', 'utf8')
	assert.match(contentConfig, /articleSourceNotes/)
	assert.match(contentConfig, /\*\*\/source-notes\.\{md,mdx\}/)
	assert.match(articleSupport, /source-notes\.\{md,mdx\}/)
	assert.match(articleSupport, /hasAnyArticleSourceNotes/)
	assert.match(articleSupport, /hasArticleSourceNotes/)

	const sidebar = readFileSync('src/components/ArticleResearchLinks.astro', 'utf8')
	assert.match(sidebar, /hasSourceNotes/)
	assert.match(sidebar, /\/\$\{section\}\/\$\{slug\}\/sources\//)

	for (const [file, sourceHref] of articleRouteChecks) {
		const source = readFileSync(file, 'utf8')
		assert.match(source, /hasArticleSourceNotes/)
		assert.match(source, /hasSourceNotes/)
		assert.match(source, /<ArticleResearchLinks/)
		assert.match(source, sourceHref)
	}

	for (const [file, contentTypeFilter] of sourceRouteChecks) {
		const source = readFileSync(file, 'utf8')
		assert.match(source, /hasAnyArticleSourceNotes/)
		assert.match(source, /getCollection\('articleSourceNotes'\)/)
		assert.match(source, contentTypeFilter, `${file} should publish only its article type`)
		assert.match(source, /getCollection\('articleResearch'\)/)
	}

	for (const file of researchRouteChecks) {
		const source = readFileSync(file, 'utf8')
		assert.match(source, /hasArticleSourceNotes/)
		assert.match(source, /\/sources\//)
	}

	for (const sourceNote of sourceNotes) {
		const indexFile = path.join(path.dirname(sourceNote), 'index.mdx')
		assert.ok(existsSync(indexFile), `${sourceNote} should have a sibling index.mdx`)
	}
})
