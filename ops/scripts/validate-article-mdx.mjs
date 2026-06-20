import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { compile } from '@mdx-js/mdx'

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
	if (!changedOnly && positional.length > 0) {
		return candidates.filter((file) => file.endsWith('.mdx')).sort()
	}
	return candidates.filter((file) => ARTICLE_MDX_RE.test(file)).sort()
}

function errorLocation(error) {
	const line = error.line ?? error.position?.start?.line ?? 1
	const column = error.column ?? error.position?.start?.column ?? 1
	return `${line}:${column}`
}

export async function validateArticleMdx({ file, source }) {
	try {
		await compile(source, { jsx: false })
		return { errors: [] }
	} catch (error) {
		return {
			errors: [`${file}:${errorLocation(error)} should contain valid MDX: ${error.message}`]
		}
	}
}

async function main() {
	const args = process.argv.slice(2)
	const files = candidateFiles(args)
	const errors = []

	for (const file of files) {
		const result = await validateArticleMdx({ file, source: readFileSync(file, 'utf8') })
		errors.push(...result.errors)
	}

	if (errors.length > 0) {
		errors.forEach((error) => console.error(`::error::${error}`))
		process.exit(1)
	}

	console.log(`Validated article MDX syntax for ${files.length} file(s).`)
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] === currentFile) {
	await main()
}
