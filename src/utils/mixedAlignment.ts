import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export type MixedArticleAlignmentPair = {
	en: string
	ja: string
	note?: string
}

export type MixedArticleAlignmentSection = {
	id?: string
	heading?: {
		en: string
		ja: string
	}
	pairs: MixedArticleAlignmentPair[]
}

export type MixedArticleAlignment = {
	version: 1
	sourceLocale: 'ja'
	targetLocale: 'en'
	pairs?: MixedArticleAlignmentPair[]
	sections?: MixedArticleAlignmentSection[]
}

function isAlignmentPair(value: unknown): value is MixedArticleAlignmentPair {
	if (!value || typeof value !== 'object') return false
	const pair = value as Record<string, unknown>
	return typeof pair.en === 'string' && typeof pair.ja === 'string'
}

function isMixedArticleAlignment(value: unknown): value is MixedArticleAlignment {
	if (!value || typeof value !== 'object') return false
	const alignment = value as Record<string, unknown>

	const hasTopLevelPairs =
		alignment.pairs === undefined ||
		(Array.isArray(alignment.pairs) && alignment.pairs.every(isAlignmentPair))
	const hasSectionPairs =
		alignment.sections === undefined ||
		(Array.isArray(alignment.sections) &&
			alignment.sections.every((section) => {
				if (!section || typeof section !== 'object') return false
				const { pairs } = section as Record<string, unknown>
				return Array.isArray(pairs) && pairs.every(isAlignmentPair)
			}))

	return (
		alignment.version === 1 &&
		alignment.sourceLocale === 'ja' &&
		alignment.targetLocale === 'en' &&
		hasTopLevelPairs &&
		hasSectionPairs
	)
}

export async function getMixedArticleAlignment(contentType: 'report' | 'news', slug: string) {
	const alignmentPath = join(process.cwd(), 'articles', contentType, slug, 'mix-alignment.json')

	try {
		const raw = await readFile(alignmentPath, 'utf8')
		const alignment = JSON.parse(raw)
		return isMixedArticleAlignment(alignment) ? alignment : undefined
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return undefined
		throw error
	}
}
