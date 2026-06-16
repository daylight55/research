import { getCollection, type CollectionEntry } from 'astro:content'
import {
	DEFAULT_LOCALE,
	type Locale,
	getPostLocale,
	getPostSection,
	getPostSlug,
	localizedPath
} from './i18n'
import type { GlossaryPageKind } from './glossary'

type BlogPost = CollectionEntry<'blog'>
type SupportEntry = CollectionEntry<'articleResearch'> | CollectionEntry<'articleSourceNotes'>

type GlossarySourcePage = {
	id: string
	body?: string
	data: BlogPost['data'] & {
		glossaryPageKind: GlossaryPageKind
		glossaryPageUrl: string
	}
}

const supportTitle = (
	post: BlogPost,
	entry: SupportEntry,
	pageKind: 'research' | 'sources',
	locale: Locale
) => {
	if (entry.data.title) return entry.data.title
	if (locale === 'en') return `${post.data.title} ${pageKind === 'research' ? 'research trail' : 'source notes'}`
	return `${post.data.title}${pageKind === 'research' ? 'の調査プロセス' : 'の調査素材'}`
}

const supportUrl = (post: BlogPost, pageKind: 'research' | 'sources', locale: Locale) =>
	localizedPath(locale, `/${getPostSection(post)}/${getPostSlug(post)}/${pageKind}/`)

const articlePage = (post: BlogPost, locale: Locale): GlossarySourcePage => ({
	id: post.id,
	body: post.body,
	data: {
		...post.data,
		glossaryPageKind: 'article',
		glossaryPageUrl: localizedPath(locale, `/${getPostSection(post)}/${getPostSlug(post)}/`)
	}
})

const supportPage = (
	post: BlogPost,
	entry: SupportEntry,
	pageKind: 'research' | 'sources',
	locale: Locale
): GlossarySourcePage => ({
	id: entry.id,
	body: entry.body,
	data: {
		...post.data,
		title: supportTitle(post, entry, pageKind, locale),
		description: post.data.description,
		tags: post.data.tags,
		glossaryPageKind: pageKind,
		glossaryPageUrl: supportUrl(post, pageKind, locale)
	}
})

export async function getGlossarySourcePages(
	locale: Locale = DEFAULT_LOCALE
): Promise<GlossarySourcePage[]> {
	const posts = (await getCollection('blog')).filter(
		(post) => getPostLocale(post) === locale && !post.data.draft
	)
	const postBySlug = new Map(posts.map((post) => [getPostSlug(post), post]))
	const researchEntries = (await getCollection('articleResearch')).filter(
		(entry) => getPostLocale(entry) === locale
	)
	const sourceEntries = (await getCollection('articleSourceNotes')).filter(
		(entry) => getPostLocale(entry) === locale
	)

	return [
		...posts.map((post) => articlePage(post, locale)),
		...researchEntries.flatMap((entry) => {
			const post = postBySlug.get(getPostSlug(entry))
			return post ? [supportPage(post, entry, 'research', locale)] : []
		}),
		...sourceEntries.flatMap((entry) => {
			const post = postBySlug.get(getPostSlug(entry))
			return post ? [supportPage(post, entry, 'sources', locale)] : []
		})
	]
}
