import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const repoRoot = process.cwd()
const blogDir = join(repoRoot, 'content/blog')
const englishDir = join(blogDir, 'en')
const runtimeDir = join(repoRoot, '.github/codex/runtime')
const promptPath = join(runtimeDir, 'translate-blog-en-prompt.md')
const missingPath = join(runtimeDir, 'translate-blog-en-missing.json')

async function listExistingEnglishSlugs() {
	try {
		const entries = await readdir(englishDir, { withFileTypes: true })
		return new Set(
			entries
				.filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
				.map((entry) => entry.name.replace(/\.mdx$/, ''))
		)
	} catch (error) {
		if (error.code === 'ENOENT') return new Set()
		throw error
	}
}

async function main() {
	const rootEntries = await readdir(blogDir, { withFileTypes: true })
	const japaneseFiles = rootEntries
		.filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
		.map((entry) => entry.name)
		.sort()
	const englishSlugs = await listExistingEnglishSlugs()
	const missing = japaneseFiles
		.map((name) => name.replace(/\.mdx$/, ''))
		.filter((slug) => !englishSlugs.has(slug))

	await mkdir(runtimeDir, { recursive: true })
	await writeFile(missingPath, `${JSON.stringify(missing, null, 2)}\n`)

	const template = await readFile(
		join(repoRoot, '.github/codex/prompts/translate-blog-en.md'),
		'utf8'
	)
	const sourceList = missing.map((slug) => `- content/blog/${slug}.mdx`).join('\n')
	const outputList = missing.map((slug) => `- content/blog/en/${slug}.mdx`).join('\n')
	const prompt = `${template.trim()}\n\n## Missing English articles\n\n${sourceList || '- None'}\n\n## Expected output files\n\n${outputList || '- None'}\n`
	await writeFile(promptPath, prompt)

	console.log(`missing=${missing.length}`)
	console.log(`prompt=${promptPath}`)
	console.log(`missing_json=${missingPath}`)
	if (missing.length > 0) {
		console.log(`first_missing=${basename(missing[0])}`)
	}
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
