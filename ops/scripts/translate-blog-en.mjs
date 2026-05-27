import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const repoRoot = process.cwd()
const articleTypes = ['report', 'news']
const runtimeDir = join(repoRoot, 'ops/codex/runtime')
const promptPath = join(runtimeDir, 'translate-blog-en-prompt.md')
const missingPath = join(runtimeDir, 'translate-blog-en-missing.json')

async function listSourceArticles(type) {
	const dir = join(repoRoot, 'articles', type)
	const entries = await readdir(dir, { withFileTypes: true })
	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => ({
			type,
			slug: entry.name,
			sourcePath: `articles/${type}/${entry.name}/ja/index.mdx`,
			outputPath: `articles/${type}/${entry.name}/en/index.mdx`
		}))
}

async function listExistingEnglishSlugs(type) {
	const dir = join(repoRoot, 'articles', type)
	try {
		const entries = await readdir(dir, { withFileTypes: true })
		const slugs = []

		for (const entry of entries) {
			if (!entry.isDirectory()) continue

			try {
				const localeEntries = await readdir(join(dir, entry.name), { withFileTypes: true })
				if (localeEntries.some((localeEntry) => localeEntry.isDirectory() && localeEntry.name === 'en')) {
					slugs.push(entry.name)
				}
			} catch (error) {
				if (error.code !== 'ENOENT') throw error
			}
		}

		return new Set(slugs)
	} catch (error) {
		if (error.code === 'ENOENT') return new Set()
		throw error
	}
}

async function main() {
	const missing = []
	for (const type of articleTypes) {
		const sourceArticles = await listSourceArticles(type)
		const englishSlugs = await listExistingEnglishSlugs(type)
		missing.push(...sourceArticles.filter((article) => !englishSlugs.has(article.slug)))
	}

	await mkdir(runtimeDir, { recursive: true })
	await writeFile(missingPath, `${JSON.stringify(missing, null, 2)}\n`)

	const template = await readFile(join(repoRoot, 'ops/codex/prompts/translate-blog-en.md'), 'utf8')
	const sourceList = missing.map((article) => `- ${article.sourcePath}`).join('\n')
	const outputList = missing.map((article) => `- ${article.outputPath}`).join('\n')
	const prompt = `${template.trim()}\n\n## Missing English articles\n\n${sourceList || '- None'}\n\n## Expected output files\n\n${outputList || '- None'}\n`
	await writeFile(promptPath, prompt)

	console.log(`missing=${missing.length}`)
	console.log(`prompt=${promptPath}`)
	console.log(`missing_json=${missingPath}`)
	if (missing.length > 0) {
		console.log(`first_missing=${missing[0].slug}`)
	}
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
