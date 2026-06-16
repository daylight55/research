import { localizedPath, type Locale } from './i18n'

export const ARTICLE_LIST_PAGE_SIZE = 50

type ArticleListSection = 'news' | 'reports'

export type ArticleListPage<T> = {
	data: T[]
	start: number
	end: number
	size: number
	total: number
	currentPage: number
	lastPage: number
	url: {
		current: string
		prev: string | undefined
		next: string | undefined
	}
}

function articleListUrl(section: ArticleListSection, currentPage: number, locale: Locale) {
	const path = currentPage <= 1 ? `/${section}/` : `/${section}/page/${currentPage}/`
	return localizedPath(locale, path)
}

export function createArticleListPage<T>(
	items: T[],
	section: ArticleListSection,
	currentPage = 1,
	locale: Locale = 'ja'
): ArticleListPage<T> {
	const lastPage = Math.max(1, Math.ceil(items.length / ARTICLE_LIST_PAGE_SIZE))
	const safePage = Math.min(Math.max(currentPage, 1), lastPage)
	const start = (safePage - 1) * ARTICLE_LIST_PAGE_SIZE
	const end = Math.min(start + ARTICLE_LIST_PAGE_SIZE, items.length)

	return {
		data: items.slice(start, end),
		start,
		end,
		size: ARTICLE_LIST_PAGE_SIZE,
		total: items.length,
		currentPage: safePage,
		lastPage,
		url: {
			current: articleListUrl(section, safePage, locale),
			prev: safePage > 1 ? articleListUrl(section, safePage - 1, locale) : undefined,
			next: safePage < lastPage ? articleListUrl(section, safePage + 1, locale) : undefined
		}
	}
}

export function createArticleListStaticPaths<T>(
	items: T[],
	section: ArticleListSection,
	locale: Locale = 'ja'
) {
	const lastPage = Math.max(1, Math.ceil(items.length / ARTICLE_LIST_PAGE_SIZE))

	return Array.from({ length: Math.max(0, lastPage - 1) }, (_, index) => {
		const currentPage = index + 2
		return {
			params: { page: String(currentPage) },
			props: { page: createArticleListPage(items, section, currentPage, locale) }
		}
	})
}
