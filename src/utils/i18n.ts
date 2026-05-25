import { getRelativeLocaleUrl } from 'astro:i18n'
import type { CollectionEntry } from 'astro:content'
import { withBase } from './basePath'

export const DEFAULT_LOCALE = 'ja'
export const SUPPORTED_LOCALES = ['ja', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

type BlogPost = CollectionEntry<'blog'>

export function isLocale(value: string | undefined): value is Locale {
	return SUPPORTED_LOCALES.includes(value as Locale)
}

export function getPostLocale(post: Pick<BlogPost, 'id'>): Locale {
	const [firstSegment] = post.id.split('/')
	return isLocale(firstSegment) && firstSegment !== DEFAULT_LOCALE ? firstSegment : DEFAULT_LOCALE
}

export function getPostSlug(post: Pick<BlogPost, 'id'>): string {
	const locale = getPostLocale(post)
	return locale === DEFAULT_LOCALE ? post.id : post.id.replace(`${locale}/`, '')
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

export function getPostUrl(post: Pick<BlogPost, 'id'>): string {
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
