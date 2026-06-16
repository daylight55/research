import { getRelativeLocaleUrl } from 'astro:i18n'
import type { CollectionEntry } from 'astro:content'
import { withBase } from './basePath'

export const DEFAULT_LOCALE = 'ja'
export const SUPPORTED_LOCALES = ['ja', 'en', 'mix'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
const CONTENT_LOCALES = ['ja', 'en'] as const
type ContentLocale = (typeof CONTENT_LOCALES)[number]

type BlogPost = CollectionEntry<'blog'>
type PostLike = Pick<BlogPost, 'id'>
type RoutablePost = Pick<BlogPost, 'id' | 'data'>

const ARTICLE_TYPES = new Set(['report', 'news'])
const ARTICLE_SECTIONS = {
	report: 'reports',
	news: 'news'
} as const

export function isLocale(value: string | undefined): value is Locale {
	return SUPPORTED_LOCALES.includes(value as Locale)
}

function isContentLocale(value: string | undefined): value is ContentLocale {
	return CONTENT_LOCALES.includes(value as ContentLocale)
}

export function getPostLocale(post: PostLike): Locale {
	return post.id.split('/').find(isContentLocale) ?? DEFAULT_LOCALE
}

export function articleSlugFromId(id: string): string {
	const segments = id.split('/').filter(Boolean)
	const last = segments.at(-1)
	if (
		last === 'index' ||
		last === 'research' ||
		last === 'research-log' ||
		last === 'source-notes'
	) {
		segments.pop()
	}

	const normalized = segments.filter((segment) => !isLocale(segment) && !ARTICLE_TYPES.has(segment))
	return normalized.join('/')
}

export function getPostSlug(post: PostLike): string {
	return articleSlugFromId(post.id)
}

export function getPostSection(
	post: RoutablePost
): (typeof ARTICLE_SECTIONS)[keyof typeof ARTICLE_SECTIONS] {
	return ARTICLE_SECTIONS[post.data.contentType]
}

export function stripLocaleFromPath(pathname: string): string {
	const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
	const [maybeLocale, ...rest] = normalized.replace(/^\/+/, '').split('/')
	return isLocale(maybeLocale) && maybeLocale !== DEFAULT_LOCALE ? `/${rest.join('/')}` : normalized
}

export function localizedPath(locale: Locale, path = '/'): string {
	const normalized = path.replace(/^\/+/, '').replace(/\/$/, '')
	if (locale === 'mix') {
		const href = `/mix/${normalized}`.replace(/\/+$/, '')
		return withBase(`${href || '/mix'}/`)
	}

	const localized = getRelativeLocaleUrl(locale, normalized)
	const href = localized.endsWith('/') ? localized : `${localized}/`
	return withBase(href)
}

export function getPostUrl(post: RoutablePost): string {
	return localizedPath(getPostLocale(post), `/${getPostSection(post)}/${getPostSlug(post)}/`)
}

export function findPostTranslation(
	posts: BlogPost[],
	post: Pick<BlogPost, 'id'>,
	locale: Locale
): BlogPost | undefined {
	const slug = getPostSlug(post)
	return posts.find(
		(candidate) => getPostLocale(candidate) === locale && getPostSlug(candidate) === slug
	)
}
