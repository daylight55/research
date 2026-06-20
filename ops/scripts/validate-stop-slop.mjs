import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ARTICLE_INDEX_RE = /^articles\/(?:report|news)\/[^/]+\/(?:ja|en)\/index\.mdx$/

const EN_ALLOWED_PREFIX_RE = /^(What happened|Why it matters|What to watch(?: next)?):/

const RULES = [
	{
		id: 'stop-slop-en-filler',
		message: 'remove Stop Slop filler or announcement phrasing',
		pattern:
			/\b(?:here's the thing|here's what|here's why|it turns out|the uncomfortable truth is|let me be clear|this matters because|make no mistake|at its core|it's worth noting|at the end of the day|the reality is|think about it|and that's okay)\b/i
	},
	{
		id: 'stop-slop-en-business-jargon',
		message: 'replace Stop Slop business jargon with concrete wording',
		pattern:
			/\b(?:game-changer|deep dive|moving forward|lean into|take a step back|when it comes to)\b/i
	},
	{
		id: 'stop-slop-en-binary-contrast',
		message: 'rewrite the formulaic "not just ... but also" contrast',
		pattern: /\bnot just\b[\s\S]{0,160}\bbut also\b/i
	},
	{
		id: 'stop-slop-en-wh-opener',
		message: 'rewrite Wh- opener into a direct statement',
		pattern: /^\s*(?:What is important|What matters|What actually)\b/i,
		lineOnly: true
	},
	{
		id: 'stop-slop-ja-summary-crutch',
		message: 'replace Japanese summary crutch with a direct claim',
		pattern: /要するに/
	}
]

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

function allArticleIndexFiles() {
	if (!existsSync('articles')) return []
	return execFileSync('find', [
		'articles',
		'-path',
		'*/ja/index.mdx',
		'-o',
		'-path',
		'*/en/index.mdx'
	], {
		encoding: 'utf8'
	})
		.split('\n')
		.map((line) => line.trim())
		.filter((file) => ARTICLE_INDEX_RE.test(file))
		.sort()
}

function candidateFiles(args) {
	const changedOnly = args.includes('--changed')
	const positional = args.filter((arg) => !arg.startsWith('-'))
	const candidates = changedOnly
		? changedFilesFromGit(positional)
		: positional.length > 0
			? positional
			: allArticleIndexFiles()
	return candidates.filter((file) => ARTICLE_INDEX_RE.test(file)).sort()
}

function stripFrontmatter(source) {
	if (!source.startsWith('---\n')) return source
	const end = source.indexOf('\n---\n', 4)
	return end === -1 ? source : source.slice(end + 5)
}

function isGeneratedStructureLine(line) {
	return EN_ALLOWED_PREFIX_RE.test(line.trim())
}

function sourceLines(source) {
	const body = stripFrontmatter(source)
	const lines = []
	let inCodeFence = false
	let inMdxBlock = false

	for (const [index, line] of body.split('\n').entries()) {
		const trimmed = line.trim()
		if (trimmed.startsWith('```')) {
			inCodeFence = !inCodeFence
			continue
		}
		if (inCodeFence) continue
		if (/^<[A-Z][\w.:-]*\b/.test(trimmed) && !trimmed.includes('</')) {
			inMdxBlock = !trimmed.endsWith('/>')
			continue
		}
		if (inMdxBlock) {
			if (trimmed.endsWith('/>') || /^<\/[A-Z][\w.:-]*>/.test(trimmed)) inMdxBlock = false
			continue
		}
		if (trimmed.length === 0 || trimmed.startsWith('|') || trimmed.startsWith('#')) continue
		if (isGeneratedStructureLine(line)) continue
		lines.push({ lineNumber: index + 1, text: line })
	}

	return lines
}

export function validateStopSlop({ file, source }) {
	const errors = []
	for (const { lineNumber, text } of sourceLines(source)) {
		for (const rule of RULES) {
			if (rule.pattern.test(rule.lineOnly ? text : text.replace(/\s+/g, ' '))) {
				errors.push(`${file}:${lineNumber}: ${rule.message} (${rule.id})`)
			}
		}
	}
	return { errors }
}

async function main() {
	const args = process.argv.slice(2)
	const files = candidateFiles(args)
	const errors = []

	for (const file of files) {
		const result = validateStopSlop({ file, source: readFileSync(file, 'utf8') })
		errors.push(...result.errors)
	}

	if (errors.length > 0) {
		errors.forEach((error) => console.error(`::error::${error}`))
		process.exit(1)
	}

	console.log(`Validated Stop Slop prose rules for ${files.length} article file(s).`)
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] === currentFile) {
	await main()
}
