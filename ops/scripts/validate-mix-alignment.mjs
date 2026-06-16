import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_MIN_COVERAGE = 0.35
const ARTICLE_PATH_RE =
	/^articles\/(report|news)\/([^/]+)\/(?:(ja|en)\/index\.mdx|mix-alignment\.json)$/

function stripFrontmatter(source) {
	return source.replace(/^---\n[\s\S]*?\n---\n?/, '')
}

function stripNonProse(source) {
	return stripFrontmatter(source)
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<SourceNote[\s\S]*?<\/SourceNote>/g, ' ')
		.replace(/<NewsSourceCard[\s\S]*?\/>/g, ' ')
		.replace(/^\s*(Source notes?|Source memos?|出典(?:メモ)?)[:：].*$/gim, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/^\s*import\s+.*$/gm, ' ')
		.replace(/^\s*#{1,6}\s+.*$/gm, ' ')
		.replace(/^\s*\|.*\|\s*$/gm, ' ')
}

function stripComparableText(source) {
	return stripFrontmatter(source)
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<SourceNote[\s\S]*?<\/SourceNote>/g, ' ')
		.replace(/<NewsSourceCard[\s\S]*?\/>/g, ' ')
		.replace(/^\s*(Source notes?|Source memos?|出典(?:メモ)?)[:：].*$/gim, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/^\s*import\s+.*$/gm, ' ')
		.replace(/^\s*#{1,6}\s+/gm, '')
}

export function normalizeAlignmentText(text) {
	return text
		.replace(/[“”]/g, '"')
		.replace(/[‘’]/g, "'")
		.replace(/[`*]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

export function englishSentences(source) {
	const prose = normalizeAlignmentText(stripNonProse(source))
	return (prose.match(/[^.!?]+[.!?]["'”’)]*|[^.!?]+$/g) ?? [])
		.map((sentence) => normalizeAlignmentText(sentence))
		.filter((sentence) => sentence.length >= 24 && /[a-z]/i.test(sentence))
}

function flattenPairs(alignment) {
	const topLevelPairs = Array.isArray(alignment?.pairs) ? alignment.pairs : []
	const sectionPairs = Array.isArray(alignment?.sections)
		? alignment.sections.flatMap((section) => (Array.isArray(section?.pairs) ? section.pairs : []))
		: []
	return [...topLevelPairs, ...sectionPairs]
}

function readOptional(file) {
	return existsSync(file) ? readFileSync(file, 'utf8') : undefined
}

function articlePubDate(source) {
	return source?.match(/pubDate:\s*['"]([^'"]+)['"]/)?.[1] ?? ''
}

function latestJapaneseNewsSlug() {
	const dir = path.join('articles', 'news')
	if (!existsSync(dir)) return undefined

	return execFileSync('find', [dir, '-maxdepth', '1', '-mindepth', '1', '-type', 'd'], {
		encoding: 'utf8'
	})
		.split('\n')
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => {
			const slug = path.basename(entry)
			return {
				slug,
				pubDate: articlePubDate(readOptional(path.join(entry, 'ja', 'index.mdx')))
			}
		})
		.filter((entry) => entry.pubDate)
		.sort((a, b) => b.pubDate.localeCompare(a.pubDate) || b.slug.localeCompare(a.slug))[0]?.slug
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

function articleRootsFromChangedFiles(files) {
	const roots = new Map()
	for (const file of files) {
		const match = file.match(ARTICLE_PATH_RE)
		if (!match) continue
		const [, type, slug] = match
		roots.set(`articles/${type}/${slug}`, { type, slug })
	}
	return [...roots.values()]
}

export function validateArticleMixAlignment({
	type,
	slug,
	englishArticle,
	japaneseArticle,
	alignmentJson,
	minCoverage = DEFAULT_MIN_COVERAGE
}) {
	const label = `${type}/${slug}`
	const errors = []

	if (!japaneseArticle)
		errors.push(`${label}: Japanese article is required at articles/${type}/${slug}/ja/index.mdx`)
	if (!englishArticle)
		errors.push(`${label}: English article is required at articles/${type}/${slug}/en/index.mdx`)
	if (!alignmentJson)
		errors.push(`${label}: mix-alignment.json is required for MIX article display`)
	if (errors.length > 0) return { ok: false, errors }

	let alignment
	try {
		alignment = JSON.parse(alignmentJson)
	} catch (error) {
		return { ok: false, errors: [`${label}: mix-alignment.json is invalid JSON: ${error.message}`] }
	}

	if (alignment.version !== 1) errors.push(`${label}: mix-alignment.json version must be 1`)
	if (alignment.sourceLocale !== 'ja') errors.push(`${label}: sourceLocale must be ja`)
	if (alignment.targetLocale !== 'en') errors.push(`${label}: targetLocale must be en`)

	const pairs = flattenPairs(alignment)
	if (pairs.length === 0) errors.push(`${label}: mix-alignment.json must contain sentence pairs`)

	const normalizedEnglishArticle = normalizeAlignmentText(stripComparableText(englishArticle))
	const sentenceCount = englishSentences(englishArticle).length
	const matchedPairs = new Set()

	pairs.forEach((pair, index) => {
		if (typeof pair?.en !== 'string' || typeof pair?.ja !== 'string') {
			errors.push(`${label}: pair ${index + 1} must contain string en and ja fields`)
			return
		}
		const normalizedEnglish = normalizeAlignmentText(pair.en)
		const normalizedJapanese = normalizeAlignmentText(pair.ja)
		if (!normalizedEnglish || !normalizedJapanese) {
			errors.push(`${label}: pair ${index + 1} must not be empty`)
			return
		}
		if (!normalizedEnglishArticle.includes(normalizedEnglish)) {
			errors.push(`${label}: pair ${index + 1} English text does not match en/index.mdx`)
			return
		}
		matchedPairs.add(normalizedEnglish)
	})

	if (sentenceCount > 0) {
		const coverage = matchedPairs.size / sentenceCount
		if (coverage < minCoverage) {
			errors.push(
				`${label}: mix-alignment.json covers ${Math.round(coverage * 100)}% of English prose sentences; expected at least ${Math.round(minCoverage * 100)}%`
			)
		}
	}

	return { ok: errors.length === 0, errors }
}

function validateArticleFromDisk({ type, slug }) {
	const root = path.join('articles', type, slug)
	const englishArticle = readOptional(path.join(root, 'en', 'index.mdx'))
	const japaneseArticle = readOptional(path.join(root, 'ja', 'index.mdx'))
	if (type === 'news' && japaneseArticle && !englishArticle && slug === latestJapaneseNewsSlug()) {
		return { ok: true, errors: [] }
	}

	return validateArticleMixAlignment({
		type,
		slug,
		englishArticle,
		japaneseArticle,
		alignmentJson: readOptional(path.join(root, 'mix-alignment.json'))
	})
}

function main() {
	const args = process.argv.slice(2)
	const changedOnly = args.includes('--changed')
	const changedArgs = args.filter((arg) => arg !== '--changed')
	const articles = changedOnly
		? articleRootsFromChangedFiles(changedFilesFromGit(changedArgs))
		: ['report', 'news'].flatMap((type) => {
				const dir = path.join('articles', type)
				if (!existsSync(dir)) return []
				return execFileSync('find', [dir, '-maxdepth', '1', '-mindepth', '1', '-type', 'd'], {
					encoding: 'utf8'
				})
					.split('\n')
					.map((entry) => entry.trim())
					.filter(Boolean)
					.map((entry) => ({ type, slug: path.basename(entry) }))
			})

	const errors = articles.flatMap((article) => validateArticleFromDisk(article).errors)
	if (errors.length > 0) {
		errors.forEach((error) => console.error(`::error::${error}`))
		process.exit(1)
	}

	console.log(`Validated mixed article alignment for ${articles.length} article(s).`)
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] === currentFile) {
	main()
}
