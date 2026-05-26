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
	const dir = locale === 'en' ? join(articlesDir, type, 'en') : join(articlesDir, type)
	const entries = await readdir(dir, { withFileTypes: true })
	return entries
		.filter((entry) => entry.isDirectory() && entry.name !== 'en')
		.map((entry) => entry.name)
		.sort()
}

async function englishArticleFiles() {
	const files = []
	for (const type of articleTypes) {
		for (const slug of await articleSlugs(type, 'en')) {
			files.push({ type, slug, path: join(articlesDir, type, 'en', slug, 'index.mdx') })
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
	const japanesePostPage = await readFile(
		join(repoRoot.pathname, 'src/pages/post/[...slug].astro'),
		'utf8'
	)
	const englishPostPage = await readFile(
		join(repoRoot.pathname, 'src/pages/en/post/[...slug].astro'),
		'utf8'
	)

	for (const source of [japanesePostPage, englishPostPage]) {
		assert.match(source, /import MermaidRenderer from '@\/components\/MermaidRenderer'/)
		assert.match(source, /<MermaidRenderer \/>/)
	}
})

test('localized post pages build related posts from the active locale only', async () => {
	const japanesePostPage = await readFile(
		join(repoRoot.pathname, 'src/pages/post/[...slug].astro'),
		'utf8'
	)
	const englishPostPage = await readFile(
		join(repoRoot.pathname, 'src/pages/en/post/[...slug].astro'),
		'utf8'
	)

	assert.match(japanesePostPage, /getPostLocale\(post\)\s*===\s*locale/)
	assert.doesNotMatch(japanesePostPage, /post\.id\.split\('\/'\)\[0\]\s*!==\s*['"]en['"]/)
	assert.match(englishPostPage, /getPostLocale\(post\)\s*===\s*locale/)
	assert.doesNotMatch(englishPostPage, /post\.id\.startsWith\(`\$\{locale\}\/`\)/)
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
	assert.match(workflow, /articles\/report\/en/)
	assert.match(workflow, /articles\/news\/en/)
	assert.match(prompt, /Do not use TeX-style backtick quotes/)
	assert.match(prompt, /Mermaid diagram labels/)
	assert.match(prompt, /news digest articles/)
	assert.match(prompt, /What happened:/)
	assert.match(prompt, /What to watch:/)
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
	assert.match(header, /<LocaleToggle\s+locale=\{locale\}\s*\/>/)
	assert.doesNotMatch(header, /transition:persist='navbar'/)
	assert.match(floatingSwitch, /<LocaleToggle\s+locale=\{locale\}\s+variant='floating'\s*\/>/)
	assert.match(localeToggle, /aria-label='Language'/)
	assert.match(localeToggle, /data-locale-switch='ja'/)
	assert.match(localeToggle, /data-locale-switch='en'/)
	assert.match(localeToggle, /localizedPath\('ja', currentContentPath\)/)
	assert.match(localeToggle, /localizedPath\('en', currentContentPath\)/)
	assert.match(localeToggle, /fixed bottom-4 left-1\/2/)
})
