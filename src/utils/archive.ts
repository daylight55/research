export type ArchiveEntry = {
	search: string
	date: string
	category: string
	countries: string[]
}

export type ArchiveFilters = {
	q: string
	category: string
	country: string
	month: string
	order: string
}

export const emptyArchiveFilters: ArchiveFilters = {
	q: '',
	category: '',
	country: '',
	month: '',
	order: 'newest'
}

export function articleDay(date: Date) {
	return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' })
}

export function formatArticleDate(date: Date, locale = 'ja') {
	return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-GB', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'Asia/Tokyo'
	})
}

const normalize = (value: string) => value.normalize('NFKC').toLowerCase()

export function filterArchiveEntries<T extends ArchiveEntry>(
	entries: T[],
	filters: ArchiveFilters
) {
	const terms = normalize(filters.q).trim().split(/\s+/).filter(Boolean)
	return entries
		.filter(
			(entry) =>
				(!filters.category || entry.category === filters.category) &&
				(!filters.country || entry.countries.includes(filters.country)) &&
				(!filters.month || entry.date.startsWith(filters.month)) &&
				terms.every((term) => normalize(entry.search).includes(term))
		)
		.sort((a, b) =>
			filters.order === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
		)
}
