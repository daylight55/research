import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = new URL('../..', import.meta.url)
const blogDir = join(repoRoot.pathname, 'content/blog')

test('Astro i18n is configured for Japanese and English', async () => {
	const config = await readFile(join(repoRoot.pathname, 'astro.config.mjs'), 'utf8')

	assert.match(config, /i18n\s*:/)
	assert.match(config, /locales\s*:\s*\[\s*['"]ja['"]\s*,\s*['"]en['"]\s*\]/)
	assert.match(config, /defaultLocale\s*:\s*['"]ja['"]/)
})

test('English articles mirror every Japanese article slug', async () => {
	const japanesePosts = (await readdir(blogDir))
		.filter((name) => name.endsWith('.mdx'))
		.map((name) => name.replace(/\.mdx$/, ''))
		.sort()

	const englishPosts = (await readdir(join(blogDir, 'en')))
		.filter((name) => name.endsWith('.mdx'))
		.map((name) => name.replace(/\.mdx$/, ''))
		.sort()

	assert.ok(japanesePosts.length > 0)
	assert.deepEqual(englishPosts, japanesePosts)
})

test('Codex translation workflow exists for missing English articles', async () => {
	const workflow = await readFile(
		join(repoRoot.pathname, '.github/workflows/translate-blog-en.yml'),
		'utf8'
	)

	assert.match(workflow, /workflow_dispatch:/)
	assert.match(workflow, /codex/i)
	assert.match(workflow, /content\/blog\/en/)
})

test('preferred locale provider detects browser language and persists manual switches', async () => {
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

	assert.match(layout, /<ProviderLocale\s*\/>/)
	assert.match(layout, /<FloatingLocaleSwitch\s+locale=\{locale\}\s*\/>/)
	assert.match(provider, /navigator\.languages/)
	assert.match(provider, /window\.localStorage\.getItem\(STORAGE_KEY\)/)
	assert.match(provider, /window\.location\.replace/)
	assert.match(provider, /canRedirectToEnglish/)
	assert.match(header, /data-locale-switch='ja'/)
	assert.match(header, /data-locale-switch='en'/)
	assert.doesNotMatch(header, /transition:persist='navbar'/)
	assert.match(floatingSwitch, /aria-label='Language'/)
	assert.match(floatingSwitch, /fixed bottom-4 right-4/)
	assert.match(floatingSwitch, /localizedPath\('ja', currentContentPath\)/)
	assert.match(floatingSwitch, /localizedPath\('en', currentContentPath\)/)
	assert.match(floatingSwitch, /data-locale-switch='ja'/)
	assert.match(floatingSwitch, /data-locale-switch='en'/)
})
