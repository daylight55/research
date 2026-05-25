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
