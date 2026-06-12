import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NEWS_INDEX_RE = /^articles\/news\/[^/]+\/(ja|en)\/index\.mdx$/
const LABEL_MAX_LENGTH = {
	ja: 150,
	en: 240
}

const LABELS = {
	ja: ['要点:', '何が起きたか:', 'なぜ重要か:', '今後の注視点:'],
	en: ['The bottom line:', 'What happened:', 'Why it matters:', 'What to watch:']
}

function frontmatterOf(source) {
	return source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
}

function readScalar(frontmatter, key) {
	const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
	if (!match) return ''
	return match[1].trim().replace(/^['"]|['"]$/g, '')
}

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

function allNewsIndexFiles() {
	if (!existsSync('articles/news')) return []
	return execFileSync('find', ['articles/news', '-path', '*/index.mdx', '-type', 'f'], {
		encoding: 'utf8'
	})
		.split('\n')
		.map((line) => line.trim())
		.filter((file) => NEWS_INDEX_RE.test(file))
		.sort()
}

function candidateFiles(args) {
	const changedOnly = args.includes('--changed')
	const positional = args.filter((arg) => !arg.startsWith('-'))
	const candidates = changedOnly
		? changedFilesFromGit(positional)
		: positional.length > 0
			? positional
			: allNewsIndexFiles()
	return candidates.filter((file) => NEWS_INDEX_RE.test(file)).sort()
}

function topicBlocks(lines) {
	const starts = lines
		.map((line, index) => ({ line, index }))
		.filter((entry) => entry.line.startsWith('### '))

	return starts.map((entry, position) => {
		const nextStart =
			starts[position + 1]?.index ??
			lines.findIndex((line, index) => index > entry.index && line.startsWith('## '))
		return {
			startIndex: entry.index,
			endIndex: nextStart === -1 ? lines.length : nextStart,
			lines: lines.slice(entry.index, nextStart === -1 ? lines.length : nextStart)
		}
	})
}

function firstMissingLabel(labels, positions) {
	const missingIndex = positions.findIndex((position) => position === -1)
	return missingIndex === -1 ? undefined : labels[missingIndex]
}

export function validateNewsItemFormat({ file, source }) {
	const locale = file.match(NEWS_INDEX_RE)?.[1]
	if (!locale) return { errors: [] }

	const frontmatter = frontmatterOf(source)
	if (readScalar(frontmatter, 'contentType') !== 'news') return { errors: [] }
	if (readScalar(frontmatter, 'draft') === 'true') return { errors: [] }

	const labels = LABELS[locale]
	const lines = source.split('\n')
	const errors = []

	for (const block of topicBlocks(lines)) {
		const headingLine = block.startIndex + 1
		const body = block.lines.slice(1)
		const positions = labels.map((label) => body.findIndex((line) => line.startsWith(label)))
		const missingLabel = firstMissingLabel(labels, positions)

		if (missingLabel) {
			const nextLabel = labels[labels.indexOf(missingLabel) + 1]
			const before = nextLabel ? ` before ${nextLabel}` : ''
			errors.push(`${file}:${headingLine} should include ${missingLabel}${before}`)
			continue
		}

		for (let index = 1; index < positions.length; index += 1) {
			if (positions[index] <= positions[index - 1]) {
				errors.push(`${file}:${headingLine} should keep Smart Brevity labels in the expected order`)
				break
			}
		}

		for (const [index, label] of labels.entries()) {
			const bodyIndex = positions[index]
			const line = body[bodyIndex]
			const content = line.slice(label.length).trim()
			if (!content) {
				errors.push(`${file}:${headingLine} ${label} should not be empty`)
			}
			if (line.length > LABEL_MAX_LENGTH[locale]) {
				errors.push(`${file}:${headingLine} ${label} should stay brief`)
			}
			const nextLine = body[bodyIndex + 1] ?? ''
			if (nextLine.trim() !== '') {
				errors.push(`${file}:${headingLine} ${label} should be a single paragraph`)
			}
		}
	}

	return { errors }
}

function main() {
	const args = process.argv.slice(2)
	const files = candidateFiles(args)
	const errors = files.flatMap(
		(file) => validateNewsItemFormat({ file, source: readFileSync(file, 'utf8') }).errors
	)

	if (errors.length > 0) {
		errors.forEach((error) => console.error(`::error::${error}`))
		process.exit(1)
	}

	console.log(`Validated news item format for ${files.length} file(s).`)
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] === currentFile) {
	main()
}
