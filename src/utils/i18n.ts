import { getRelativeLocaleUrl } from 'astro:i18n'
import type { CollectionEntry } from 'astro:content'
import { withBase } from './basePath'

export const DEFAULT_LOCALE = 'ja'
export const SUPPORTED_LOCALES = ['ja', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

type BlogPost = CollectionEntry<'blog'>
type PostLike = Pick<BlogPost, 'id'>

const ARTICLE_TYPES = new Set(['report', 'news'])

export function isLocale(value: string | undefined): value is Locale {
	return SUPPORTED_LOCALES.includes(value as Locale)
}

export function getPostLocale(post: PostLike): Locale {
	const [firstSegment, secondSegment] = post.id.split('/')
	if (isLocale(firstSegment) && firstSegment !== DEFAULT_LOCALE) return firstSegment
	if (ARTICLE_TYPES.has(firstSegment) && isLocale(secondSegment) && secondSegment !== DEFAULT_LOCALE) {
		return secondSegment
	}
	return DEFAULT_LOCALE
}

export function articleSlugFromId(id: string): string {
	const segments = id.split('/').filter(Boolean)
	const last = segments.at(-1)
	if (last === 'index' || last === 'research' || last === 'research-log') {
		segments.pop()
	}

	const normalized = segments.filter((segment) => !isLocale(segment) && !ARTICLE_TYPES.has(segment))
	return normalized.join('/')
}

export function getPostSlug(post: PostLike): string {
	return articleSlugFromId(post.id)
}

export function stripLocaleFromPath(pathname: string): string {
	const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
	const [maybeLocale, ...rest] = normalized.replace(/^\/+/, '').split('/')
	return isLocale(maybeLocale) && maybeLocale !== DEFAULT_LOCALE ? `/${rest.join('/')}` : normalized
}

export function localizedPath(locale: Locale, path = '/'): string {
	const normalized = path.replace(/^\/+/, '').replace(/\/$/, '')
	const localized = getRelativeLocaleUrl(locale, normalized)
	const href = localized.endsWith('/') ? localized : `${localized}/`
	return withBase(href)
}

export function getPostUrl(post: PostLike): string {
	return localizedPath(getPostLocale(post), `/post/${getPostSlug(post)}/`)
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
