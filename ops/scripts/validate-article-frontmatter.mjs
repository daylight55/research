import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { LineCounter, parseDocument } from 'yaml'

const ARTICLE_MDX_RE =
	/^articles\/(?:report|news)\/[^/]+\/(?:ja|en)\/(?:index|research-log|source-notes)\.mdx$/

function changedFilesFromGit(args) {
	const range = args.find((arg) => !arg.startsWith('-'))
	if (range) {
		return execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMRT', range], {
			encoding: 'utf8'
		})
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
	}

	const files = new Set()
	for (const command of [
		['diff', '--name-only', '--diff-filter=ACMRT'],
		['diff', '--cached', '--name-only', '--diff-filter=ACMRT'],
		['ls-files', '--others', '--exclude-standard']
	]) {
		execFileSync('git', command, { encoding: 'utf8' })
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
			.forEach((file) => files.add(file))
	}
	return [...files]
}

function allArticleMdxFiles() {
	if (!existsSync('articles')) return []
	return execFileSync('find', ['articles', '-path', '*/ja/*.mdx', '-o', '-path', '*/en/*.mdx'], {
		encoding: 'utf8'
	})
		.split('\n')
		.map((line) => line.trim())
		.filter((file) => ARTICLE_MDX_RE.test(file))
		.sort()
}

function candidateFiles(args) {
	const changedOnly = args.includes('--changed')
	const positional = args.filter((arg) => !arg.startsWith('-'))
	const candidates = changedOnly
		? changedFilesFromGit(positional)
		: positional.length > 0
			? positional
			: allArticleMdxFiles()
	return candidates.filter((file) => file.endsWith('.mdx')).sort()
}

function frontmatterOf(source) {
	const match = source.match(/^---\n([\s\S]*?)\n---/)
	return match?.[1]
}

function errorLine(error) {
	const frontmatterLine = error.linePos?.[0]?.line
	return Number.isInteger(frontmatterLine) ? frontmatterLine + 1 : 1
}

export function validateArticleFrontmatter({ file, source }) {
	const frontmatter = frontmatterOf(source)
	if (frontmatter === undefined) return { errors: [] }

	const lineCounter = new LineCounter()
	const document = parseDocument(frontmatter, { lineCounter })
	const errors = document.errors.map(
		(error) => `${file}:${errorLine(error)} should contain valid YAML frontmatter: ${error.message}`
	)

	return { errors }
}

function main() {
	const args = process.argv.slice(2)
	const files = candidateFiles(args)
	const errors = files.flatMap(
		(file) => validateArticleFrontmatter({ file, source: readFileSync(file, 'utf8') }).errors
	)

	if (errors.length > 0) {
		errors.forEach((error) => console.error(`::error::${error}`))
		process.exit(1)
	}

	console.log(`Validated article frontmatter for ${files.length} file(s).`)
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] === currentFile) {
	main()
}
