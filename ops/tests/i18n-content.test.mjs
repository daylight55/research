import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = new URL('../..', import.meta.url)
const articlesDir = join(repoRoot.pathname, 'articles')
const referenceDir = join(repoRoot.pathname, 'src/pages/reference')
const englishReferenceDir = join(repoRoot.pathname, 'src/pages/en/reference')
const articleTypes = ['report', 'news']
const japaneseText = /[\u3040-\u30ff\u3400-\u9fff]/

async function articleSlugs(type, locale = 'ja') {
	const dir = join(articlesDir, type)
	const entries = await readdir(dir, { withFileTypes: true })
	const slugs = []

	for (const entry of entries) {
		if (!entry.isDirectory()) continue

		const localeEntries = await readdir(join(dir, entry.name), { withFileTypes: true })
		if (
			localeEntries.some((localeEntry) => localeEntry.isDirectory() && localeEntry.name === locale)
		) {
			slugs.push(entry.name)
		}
	}

	return slugs.sort()
}

async function englishArticleFiles() {
	const files = []
	for (const type of articleTypes) {
		for (const slug of await articleSlugs(type, 'en')) {
			files.push({ type, slug, path: join(articlesDir, type, slug, 'en', 'index.mdx') })
		}
	}
	return files
}

async function mixedAlignmentFiles() {
	const files = []
	for (const type of articleTypes) {
		for (const slug of await articleSlugs(type, 'ja')) {
			const entries = await readdir(join(articlesDir, type, slug), { withFileTypes: true })
			if (entries.some((entry) => entry.isFile() && entry.name === 'mix-alignment.json')) {
				files.push({ type, slug, path: join(articlesDir, type, slug, 'mix-alignment.json') })
			}
		}
	}
	return files
}

test('Astro i18n is configured for Japanese and English', async () => {
	const config = await readFile(join(repoRoot.pathname, 'astro.config.mjs'), 'utf8')

	assert.match(config, /i18n\s*:/)
	assert.match(config, /locales\s*:\s*\[\s*['"]ja['"]\s*,\s*['"]en['"]\s*\]/)
	assert.match(config, /defaultLocale\s*:\s*['"]ja['"]/)
})

test('English articles mirror every Japanese article slug by article type', async () => {
	for (const type of articleTypes) {
		const japanesePosts = await articleSlugs(type)
		const englishPosts = await articleSlugs(type, 'en')

		assert.ok(japanesePosts.length > 0)
		assert.deepEqual(englishPosts, japanesePosts)
	}
})

test('articles are grouped by slug before locale', async () => {
	for (const type of articleTypes) {
		const legacyEntries = await readdir(join(articlesDir, type), { withFileTypes: true })
		assert.ok(
			!legacyEntries.some((entry) => entry.isDirectory() && entry.name === 'en'),
			`articles/${type}/en should not be used; use articles/${type}/<slug>/en instead`
		)

		for (const slug of await articleSlugs(type)) {
			const localeEntries = await readdir(join(articlesDir, type, slug), { withFileTypes: true })
			const locales = localeEntries
				.filter((entry) => entry.isDirectory())
				.map((entry) => entry.name)
				.sort()

			assert.deepEqual(locales, ['en', 'ja'], `${type}/${slug} should contain ja and en`)
		}
	}
})

test('English Mermaid diagrams do not contain Japanese labels', async () => {
	for (const file of await englishArticleFiles()) {
		const source = await readFile(file.path, 'utf8')
		const mermaidBlocks = [...source.matchAll(/```mermaid\n([\s\S]*?)\n```/g)]

		for (const block of mermaidBlocks) {
			assert.doesNotMatch(
				block[1],
				japaneseText,
				`${file.type}/${file.slug} Mermaid diagrams should use English labels only`
			)
		}
	}
})

test('localized post pages include the shared Mermaid renderer', async () => {
	const localizedPostPages = await Promise.all(
		[
			'src/pages/reports/[...slug].astro',
			'src/pages/en/reports/[...slug].astro',
			'src/pages/news/[...slug].astro',
			'src/pages/en/news/[...slug].astro'
		].map((file) => readFile(join(repoRoot.pathname, file), 'utf8'))
	)

	for (const source of localizedPostPages) {
		assert.match(source, /import MermaidRenderer from '@\/components\/MermaidRenderer'/)
		assert.match(source, /<MermaidRenderer \/>/)
	}
})

test('localized post pages build related posts from the active locale only', async () => {
	const localizedPostPages = await Promise.all(
		[
			'src/pages/reports/[...slug].astro',
			'src/pages/en/reports/[...slug].astro',
			'src/pages/news/[...slug].astro',
			'src/pages/en/news/[...slug].astro'
		].map((file) => readFile(join(repoRoot.pathname, file), 'utf8'))
	)

	for (const source of localizedPostPages) {
		assert.match(source, /getPostLocale\(post\)\s*===\s*locale/)
		assert.doesNotMatch(source, /post\.id\.split\('\/'\)\[0\]\s*!==\s*['"]en['"]/)
		assert.doesNotMatch(source, /post\.id\.startsWith\(`\$\{locale\}\/`\)/)
	}
})

test('tag routes use URL-safe slugs for generated pages and links', async () => {
	const tagSlug = await readFile(join(repoRoot.pathname, 'src/utils/tagSlug.ts'), 'utf8')
	const tagPages = await Promise.all(
		[
			'src/pages/tags/index.astro',
			'src/pages/en/tags/index.astro',
			'src/pages/tags/[...tag]/index.astro',
			'src/pages/en/tags/[...tag]/index.astro',
			'src/pages/reports/[...slug].astro',
			'src/pages/en/reports/[...slug].astro',
			'src/pages/news/[...slug].astro',
			'src/pages/en/news/[...slug].astro',
			'src/components/Tag.astro'
		].map((file) => readFile(join(repoRoot.pathname, file), 'utf8'))
	)

	assert.match(tagSlug, /replace\(\/\[\^a-z0-9\]\+\/g,\s*'-'\)/)
	assert.match(tagSlug, /TextEncoder/)

	for (const source of tagPages) {
		assert.match(source, /tagSlug\(tag\)/)
		assert.doesNotMatch(source, /encodeURIComponent\(tag/)
	}
})

test('English reference pages mirror Japanese reference routes', async () => {
	const japaneseReferencePages = (await readdir(referenceDir))
		.filter((name) => name.endsWith('.astro') && name !== 'index.astro')
		.sort()

	const englishReferencePages = (await readdir(englishReferenceDir))
		.filter((name) => name.endsWith('.astro') && name !== 'index.astro')
		.sort()

	assert.ok(japaneseReferencePages.length > 0)
	assert.deepEqual(englishReferencePages, japaneseReferencePages)
})

test('English reference pages and index data do not contain Japanese text', async () => {
	const englishReferencePages = (await readdir(englishReferenceDir))
		.filter((name) => name.endsWith('.astro'))
		.sort()
	const referenceData = await readFile(join(repoRoot.pathname, 'src/data/references.ts'), 'utf8')

	for (const file of englishReferencePages) {
		const source = await readFile(join(englishReferenceDir, file), 'utf8')
		assert.doesNotMatch(source, japaneseText, `${file} should use English user-facing text`)
	}

	assert.match(referenceData, /title:\s*\{\s*ja:/)
	assert.match(referenceData, /description:\s*\{\s*ja:/)
	assert.match(referenceData, /export function getReferenceItems/)
})

test('Codex translation workflow exists for missing English articles', async () => {
	const workflow = await readFile(
		join(repoRoot.pathname, '.github/workflows/translate-blog-en.yml'),
		'utf8'
	)
	const prompt = await readFile(
		join(repoRoot.pathname, 'ops/codex/prompts/translate-blog-en.md'),
		'utf8'
	)

	assert.match(workflow, /workflow_dispatch:/)
	assert.match(workflow, /codex/i)
	assert.match(workflow, /mkdir -p ops\/codex\/runtime/)
	assert.match(workflow, /Restore Node for site build/)
	assert.match(workflow, /grep -RInE/)
	assert.match(workflow, /git status --porcelain -- articles\/report articles\/news/)
	assert.doesNotMatch(workflow, /rg -n '\\b\(TBD\|TODO\|FIXME\|未定\|要確認\)\\b'/)
	assert.match(workflow, /articles\/report\/\\\$\{slug\}\/en/)
	assert.match(workflow, /articles\/news\/\\\$\{slug\}\/en/)
	assert.match(prompt, /Do not use TeX-style backtick quotes/)
	assert.match(prompt, /Mermaid diagram labels/)
	assert.match(prompt, /news digest articles/)
	assert.match(prompt, /What happened:/)
	assert.match(prompt, /What to watch:/)
	assert.match(prompt, /articles\/<type>\/<slug>\/en\/index\.mdx/)
	assert.match(prompt, /Reference pages/)
})

test('preferred locale provider defaults to Japanese and persists manual switches', async () => {
	const layout = await readFile(join(repoRoot.pathname, 'src/layouts/BaseLayout.astro'), 'utf8')
	const provider = await readFile(
		join(repoRoot.pathname, 'src/components/ProviderLocale.astro'),
		'utf8'
	)
	const header = await readFile(join(repoRoot.pathname, 'src/components/Header.astro'), 'utf8')
	const floatingSwitch = await readFile(
		join(repoRoot.pathname, 'src/components/FloatingLocaleSwitch.astro'),
		'utf8'
	)
	const localeToggle = await readFile(
		join(repoRoot.pathname, 'src/components/LocaleToggle.astro'),
		'utf8'
	)

	assert.match(layout, /<ProviderLocale\s*\/>/)
	assert.match(layout, /<FloatingLocaleSwitch\s+locale=\{locale\}\s*\/>/)
	assert.match(provider, /window\.localStorage\.getItem\(STORAGE_KEY\)/)
	assert.match(provider, /getStoredLocale\(\) \?\? DEFAULT_LOCALE/)
	assert.doesNotMatch(provider, /navigator\.languages/)
	assert.doesNotMatch(provider, /navigator\.language/)
	assert.match(provider, /window\.location\.replace/)
	assert.match(provider, /window\.location\.replace/)
	assert.match(provider, /canRedirectToEnglish/)
	assert.match(provider, /canRedirectToMixedArticle/)
	assert.match(provider, /setStoredLocale\(currentLocale\)/)
	assert.match(provider, /currentLocale === preferredLocale/)
	assert.match(header, /<LocaleToggle\s+locale=\{locale\}\s*\/>/)
	assert.match(header, /sm:block/)
	assert.doesNotMatch(header, /transition:persist='navbar'/)
	assert.match(floatingSwitch, /<LocaleToggle\s+locale=\{locale\}\s+variant='floating'\s*\/>/)
	assert.match(localeToggle, /aria-label='Language'/)
	assert.match(localeToggle, /isArticleDetailPath/)
	assert.match(localeToggle, /showMixedToggle/)
	assert.match(localeToggle, /data-locale-switch='ja'/)
	assert.match(localeToggle, /data-locale-switch='en'/)
	assert.match(localeToggle, /data-locale-switch='mix'/)
	assert.match(localeToggle, /class:list=\{controlClass\}/)
	assert.match(localeToggle, /localizedPath\('ja', currentContentPath\)/)
	assert.match(localeToggle, /localizedPath\('en', currentContentPath\)/)
	assert.match(localeToggle, /localizedPath\('mix', currentContentPath\)/)
	assert.match(localeToggle, /fixed bottom-4 left-1\/2/)
})

test('mixed Japanese-English article pages are generated as a third reading mode', async () => {
	const mixedArticleComponent = await readFile(
		join(repoRoot.pathname, 'src/components/MixedArticleContent.astro'),
		'utf8'
	)
	const mixedPages = await Promise.all(
		['src/pages/mix/reports/[...slug].astro', 'src/pages/mix/news/[...slug].astro'].map((file) =>
			readFile(join(repoRoot.pathname, file), 'utf8')
		)
	)
	const mixedAlignmentUtils = await readFile(
		join(repoRoot.pathname, 'src/utils/mixedAlignment.ts'),
		'utf8'
	)
	const translationPrompt = await readFile(
		join(repoRoot.pathname, 'ops/codex/prompts/translate-blog-en.md'),
		'utf8'
	)
	const sampleAlignment = await readFile(
		join(repoRoot.pathname, 'articles/report/khomeini-to-khamenei-transition/mix-alignment.json'),
		'utf8'
	)
	const localeUtils = await readFile(join(repoRoot.pathname, 'src/utils/i18n.ts'), 'utf8')
	const provider = await readFile(
		join(repoRoot.pathname, 'src/components/ProviderLocale.astro'),
		'utf8'
	)

	assert.match(
		localeUtils,
		/SUPPORTED_LOCALES\s*=\s*\[\s*['"]ja['"]\s*,\s*['"]en['"]\s*,\s*['"]mix['"]\s*\]/
	)
	assert.match(
		provider,
		/SUPPORTED_LOCALES\s*=\s*\[\s*['"]ja['"]\s*,\s*['"]en['"]\s*,\s*['"]mix['"]\s*\]/
	)
	assert.match(provider, /\/mix\//)
	assert.match(mixedArticleComponent, /data-mixed-article/)
	assert.match(mixedArticleComponent, /data-mixed-english/)
	assert.match(mixedArticleComponent, /data-mixed-japanese/)
	assert.match(mixedArticleComponent, /data-mixed-alignment/)
	assert.match(mixedArticleComponent, /data-mixed-translation/)
	assert.match(mixedArticleComponent, /from 'sentence-splitter'/)
	assert.match(mixedArticleComponent, /fallbackSplitSentences/)
	assert.match(mixedArticleComponent, /splitSentences/)
	assert.match(mixedArticleComponent, /alignmentPairsFromData/)
	assert.match(mixedArticleComponent, /normalizeAlignmentText/)
	assert.match(mixedArticleComponent, /\[“”\]/)
	assert.match(mixedArticleComponent, /\[‘’\]/)
	assert.match(mixedArticleComponent, /\(\(\) =>/)
	assert.match(mixedArticleComponent, /createSentencePair/)
	assert.match(mixedArticleComponent, /mapTranslation/)
	assert.match(mixedArticleComponent, /pairableText/)
	assert.match(mixedArticleComponent, /\.source-note/)
	assert.match(mixedArticleComponent, /Source memo/)
	assert.match(mixedArticleComponent, /__DECIMAL_/)
	assert.doesNotMatch(mixedArticleComponent, /mixed-source-notes/)
	assert.match(mixedArticleComponent, /japaneseSentences\[sentenceIndex\] \?\? ''/)
	assert.match(mixedArticleComponent, /block\.replaceChildren/)
	assert.match(mixedArticleComponent, /mixed-sentence__text/)
	assert.doesNotMatch(mixedArticleComponent, /const splitSentences/)

	const packageJson = await readFile(join(repoRoot.pathname, 'package.json'), 'utf8')
	assert.match(packageJson, /"sentence-splitter":/)
	assert.match(mixedAlignmentUtils, /mix-alignment\.json/)
	assert.match(mixedAlignmentUtils, /getMixedArticleAlignment/)
	assert.match(mixedAlignmentUtils, /version: 1/)
	assert.match(translationPrompt, /mix-alignment\.json/)
	assert.match(translationPrompt, /semantic Japanese-English reading map/)

	const parsedSampleAlignment = JSON.parse(sampleAlignment)
	assert.equal(parsedSampleAlignment.version, 1)
	assert.equal(parsedSampleAlignment.sourceLocale, 'ja')
	assert.equal(parsedSampleAlignment.targetLocale, 'en')
	assert.ok(parsedSampleAlignment.sections.some((section) => section.pairs.length > 0))

	for (const { path } of await mixedAlignmentFiles()) {
		const alignment = JSON.parse(await readFile(path, 'utf8'))
		assert.equal(alignment.version, 1)
		assert.equal(alignment.sourceLocale, 'ja')
		assert.equal(alignment.targetLocale, 'en')
		assert.ok(
			alignment.pairs?.length > 0 || alignment.sections?.some((section) => section.pairs.length > 0)
		)
		assert.doesNotMatch(JSON.stringify(alignment), /Source note|Source memo|^import\s/m)
	}

	for (const source of mixedPages) {
		assert.match(source, /const locale = 'mix'/)
		assert.match(source, /findPostTranslation\(allPosts,\s*post,\s*DEFAULT_LOCALE\)/)
		assert.match(source, /findPostTranslation\(allPosts,\s*post,\s*'en'\)/)
		assert.match(source, /getMixedArticleAlignment/)
		assert.match(source, /<MixedArticleContent alignment=\{mixedAlignment\}>/)
		assert.match(source, /slot='english'/)
		assert.match(source, /slot='japanese'/)
		assert.match(source, /<MermaidRenderer \/>/)
	}
})
