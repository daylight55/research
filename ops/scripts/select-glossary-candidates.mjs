import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import {
	extractGlossaryTermsFromMarkdown,
	hasGlossaryResearchProfile
} from '../../src/utils/glossary.ts'

const DEFAULT_ARTICLES_DIR = 'articles'
const DEFAULT_MAX_TERMS = 3
const DEFAULT_MIN_SCORE = 9
const MAX_EXTRACTION_TERMS_PER_ARTICLE = 8

const GENERIC_TERM_SLUGS = new Set([
	'ai',
	'agent',
	'api',
	'china',
	'constitution',
	'economy',
	'elections',
	'eu',
	'iran',
	'israel',
	'japan',
	'middle-east',
	'news',
	'policy',
	'politics',
	'religion',
	'russia',
	'syria',
	'taiwan',
	'technology',
	'turkey',
	'ukraine',
	'un',
	'us'
])

const HIGH_CONTEXT_CATEGORIES = new Set([
	'ai-systems',
	'developer-tools',
	'geopolitics',
	'knowledge-systems',
	'philosophy-knowledge'
])

export function parseCandidateArgs(argv) {
	const args = {
		articlesDir: DEFAULT_ARTICLES_DIR,
		maxTerms: DEFAULT_MAX_TERMS,
		minScore: DEFAULT_MIN_SCORE,
		out: '',
		markdownOut: ''
	}

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index]
		const next = argv[index + 1]

		if (arg === '--articles-dir' && next) {
			args.articlesDir = next
			index += 1
			continue
		}
		if (arg === '--max-terms' && next) {
			args.maxTerms = Math.max(1, Number(next) || DEFAULT_MAX_TERMS)
			index += 1
			continue
		}
		if (arg === '--min-score' && next) {
			args.minScore = Math.max(0, Number(next) || DEFAULT_MIN_SCORE)
			index += 1
			continue
		}
		if (arg === '--out' && next) {
			args.out = next
			index += 1
			continue
		}
		if (arg === '--markdown-out' && next) {
			args.markdownOut = next
			index += 1
		}
	}

	return args
}

const walkArticleIndexes = (rootDir) => {
	if (!existsSync(rootDir)) return []

	const files = []
	const visit = (dir) => {
		for (const entry of readdirSync(dir)) {
			const path = join(dir, entry)
			const stats = statSync(path)
			if (stats.isDirectory()) {
				visit(path)
				continue
			}
			if (path.endsWith('/ja/index.mdx')) files.push(path)
		}
	}

	visit(rootDir)
	return files.sort()
}

const parseFrontmatter = (markdown) => markdown.match(/^\s*---\n([\s\S]*?)\n---/)?.[1] ?? ''

const parseScalarFrontmatterValue = (frontmatter, key) =>
	frontmatter
		.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]
		?.trim()
		.replace(/^['"]|['"]$/g, '') ?? ''

const parseTags = (frontmatter) => {
	const inline = frontmatter.match(/^tags:\s*\[(.*?)\]\s*$/m)?.[1]
	if (inline) {
		return inline
			.split(',')
			.map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
			.filter(Boolean)
	}

	const block = frontmatter.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m)?.[1] ?? ''
	return block
		.split(/\r?\n/)
		.map(
			(line) =>
				line
					.match(/^\s+-\s+(.+)$/)?.[1]
					?.trim()
					.replace(/^['"]|['"]$/g, '') ?? ''
		)
		.filter(Boolean)
}

const readArticleRecord = (file, articlesDir) => {
	const markdown = readFileSync(file, 'utf8')
	const frontmatter = parseFrontmatter(markdown)
	const id = relative(articlesDir, file).replace(/\/ja\/index\.mdx$/, '')

	return {
		body: markdown.replace(/^\s*---\n[\s\S]*?\n---\s*/, ''),
		category: parseScalarFrontmatterValue(frontmatter, 'category') || 'uncategorized',
		contentType: parseScalarFrontmatterValue(frontmatter, 'contentType'),
		description: parseScalarFrontmatterValue(frontmatter, 'description'),
		file,
		id,
		markdown,
		tags: parseTags(frontmatter),
		title: parseScalarFrontmatterValue(frontmatter, 'title') || id
	}
}

const isKnownOrTooGeneric = (slug) =>
	GENERIC_TERM_SLUGS.has(slug) ||
	hasGlossaryResearchProfile(slug, 'ja') ||
	hasGlossaryResearchProfile(slug, 'en')

const scoreCandidate = (candidate) => {
	let score = Math.min(candidate.count, 8)
	score += candidate.sources.has('frontmatter') ? 14 : 0
	score += candidate.sources.has('heading') ? 5 : 0
	score += candidate.articleCount >= 2 ? 8 : 0
	score += candidate.categories.some((category) => HIGH_CONTEXT_CATEGORIES.has(category)) ? 3 : 0
	if (/^[A-Z0-9.+#-]{2,}$/.test(candidate.label)) score += 4
	if (/^[A-Z][A-Za-z0-9.+#-]+(?:\s+[A-Z][A-Za-z0-9.+#-]+){1,3}$/.test(candidate.label)) {
		score += 3
	}
	if (
		/[\p{Script=Han}\p{Script=Katakana}ー]{2,}/u.test(candidate.label) &&
		/[A-Za-z]/.test(candidate.label)
	) {
		score += 3
	}
	if (candidate.label.length > 32) score -= 5
	if (!candidate.sources.has('frontmatter') && candidate.articleCount === 1) score -= 8
	if (candidate.contentTypes.every((type) => type === 'news')) score -= 4
	return score
}

const createCandidateSummary = (candidate) => ({
	label: candidate.label,
	slug: candidate.slug,
	score: candidate.score,
	count: candidate.count,
	articleCount: candidate.articleCount,
	category: candidate.categories[0] ?? 'uncategorized',
	categories: candidate.categories,
	related: candidate.related.slice(0, 5),
	sources: candidate.sourcesList,
	articles: candidate.articles.slice(0, 5)
})

export function selectGlossaryResearchCandidates(records, options = {}) {
	const maxTerms = options.maxTerms ?? DEFAULT_MAX_TERMS
	const minScore = options.minScore ?? DEFAULT_MIN_SCORE
	const candidates = new Map()
	const articleTerms = new Map()

	for (const record of records) {
		const extractionMarkdown = `---
title: ${JSON.stringify(record.title)}
category: ${JSON.stringify(record.category)}
${record.contentType ? `contentType: ${JSON.stringify(record.contentType)}\n` : ''}${
			record.tags.length
				? `tags: [${record.tags.map((tag) => JSON.stringify(tag)).join(', ')}]\n`
				: ''
		}---

${record.body}`
		const terms = extractGlossaryTermsFromMarkdown(
			extractionMarkdown,
			MAX_EXTRACTION_TERMS_PER_ARTICLE
		)
		articleTerms.set(record.id, terms)

		for (const term of terms) {
			if (isKnownOrTooGeneric(term.slug)) continue

			const existing = candidates.get(term.slug) ?? {
				articles: [],
				categories: [],
				contentTypes: [],
				count: 0,
				label: term.label,
				related: [],
				slug: term.slug,
				sources: new Set()
			}

			existing.count += term.count
			existing.articles.push({
				id: record.id,
				title: record.title,
				category: record.category,
				path: record.file
			})
			if (!existing.categories.includes(record.category)) existing.categories.push(record.category)
			if (!existing.contentTypes.includes(record.contentType || 'report')) {
				existing.contentTypes.push(record.contentType || 'report')
			}
			for (const source of term.sources) existing.sources.add(source)
			candidates.set(term.slug, existing)
		}
	}

	for (const candidate of candidates.values()) {
		const related = new Map()
		for (const article of candidate.articles) {
			for (const term of articleTerms.get(article.id) ?? []) {
				if (term.slug === candidate.slug) continue
				if (
					!hasGlossaryResearchProfile(term.slug, 'ja') &&
					!hasGlossaryResearchProfile(term.slug, 'en')
				) {
					continue
				}
				related.set(term.label, (related.get(term.label) ?? 0) + term.count)
			}
		}
		candidate.related = [...related.entries()]
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
			.map(([label]) => label)
		candidate.articleCount = new Set(candidate.articles.map((article) => article.id)).size
		candidate.sourcesList = [...candidate.sources].sort()
		candidate.score = scoreCandidate(candidate)
	}

	return [...candidates.values()]
		.filter((candidate) => candidate.score >= minScore)
		.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, 'ja'))
		.slice(0, maxTerms)
		.map(createCandidateSummary)
}

export function createCandidateMarkdown(payload) {
	const lines = [
		'# Glossary Research Candidates',
		'',
		`Generated from ${payload.articleCount} Japanese article pages.`,
		`Cost cap: ${payload.maxTerms} term(s), ${payload.minScore} minimum score.`,
		''
	]

	if (payload.candidates.length === 0) {
		lines.push('No unresolved glossary candidates met the score threshold.')
		return `${lines.join('\n')}\n`
	}

	for (const candidate of payload.candidates) {
		lines.push(`## ${candidate.label}`)
		lines.push('')
		lines.push(`- slug: ${candidate.slug}`)
		lines.push(`- score: ${candidate.score}`)
		lines.push(`- category: ${candidate.category}`)
		lines.push(`- articles: ${candidate.articleCount}`)
		lines.push(`- related: ${candidate.related.join(', ') || 'none'}`)
		lines.push('')
	}

	return `${lines.join('\n')}\n`
}

const writeOutputFile = (file, content) => {
	mkdirSync(dirname(file), { recursive: true })
	writeFileSync(file, content)
}

export function createGlossaryCandidatePayload(args) {
	const files = walkArticleIndexes(args.articlesDir)
	const records = files.map((file) => readArticleRecord(file, args.articlesDir))
	const candidates = selectGlossaryResearchCandidates(records, args)

	return {
		articleCount: records.length,
		candidates,
		generatedAt: new Date().toISOString(),
		maxTerms: args.maxTerms,
		minScore: args.minScore
	}
}

async function main() {
	const args = parseCandidateArgs(process.argv.slice(2))
	const payload = createGlossaryCandidatePayload(args)
	const json = `${JSON.stringify(payload, null, 2)}\n`

	if (args.out) writeOutputFile(args.out, json)
	if (args.markdownOut) writeOutputFile(args.markdownOut, createCandidateMarkdown(payload))
	if (!args.out && !args.markdownOut) process.stdout.write(json)
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error(error)
		process.exitCode = 1
	})
}
