import type { Locale } from './i18n'

const sourceNoteFiles = import.meta.glob(
	'../../articles/{report,news}/*/{ja,en}/source-notes.{md,mdx}'
)

const sourceNoteKeys = new Set(
	Object.keys(sourceNoteFiles).flatMap((file) => {
		const match = file.match(
			/articles\/(?:report|news)\/([^/]+)\/(ja|en)\/source-notes\.(?:md|mdx)$/
		)
		if (!match) return []
		return [`${match[2]}:${match[1]}`]
	})
)

export function hasAnyArticleSourceNotes() {
	return sourceNoteKeys.size > 0
}

export function hasArticleSourceNotes(slug: string, locale: Locale) {
	return sourceNoteKeys.has(`${locale}:${slug}`)
}
