import { getCollection } from 'astro:content'
import { CATEGORIES } from '@/data/categories'
import { DEFAULT_LOCALE, type Locale, getPostLocale } from './i18n'

export const getCategories = async (locale: Locale = DEFAULT_LOCALE) => {
	const posts = await getCollection('blog')
	const categories = new Set(
		posts
			.filter((post) => !post.data.draft && getPostLocale(post) === locale)
			.map((post) => post.data.category)
	)
	return Array.from(categories).sort((a, b) =>
		CATEGORIES.indexOf(a) < CATEGORIES.indexOf(b) ? -1 : 1
	)
}

export const getPosts = async (max?: number, locale: Locale = DEFAULT_LOCALE) => {
	return (await getCollection('blog'))
		.filter((post) => !post.data.draft && getPostLocale(post) === locale)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
		.slice(0, max)
}

export const getReportPosts = async (max?: number, locale: Locale = DEFAULT_LOCALE) => {
	return (await getPosts(undefined, locale))
		.filter((post) => post.data.contentType === 'report')
		.slice(0, max)
}

export const getNewsPosts = async (max?: number, locale: Locale = DEFAULT_LOCALE) => {
	return (await getPosts(undefined, locale))
		.filter((post) => post.data.contentType === 'news')
		.slice(0, max)
}

export const getTags = async (locale: Locale = DEFAULT_LOCALE) => {
	const posts = await getCollection('blog')
	const tags = new Set()
	posts
		.filter((post) => !post.data.draft && getPostLocale(post) === locale)
		.forEach((post) => {
			post.data.tags.forEach((tag) => {
				if (tag != '') {
					tags.add(tag.toLowerCase())
				}
			})
		})

	return Array.from(tags)
}

export const getPostByTag = async (tag: string, locale: Locale = DEFAULT_LOCALE) => {
	const posts = await getPosts(undefined, locale)
	const lowercaseTag = tag.toLowerCase()
	return posts
		.filter((post) => !post.data.draft)
		.filter((post) => {
			return post.data.tags.some((postTag) => postTag.toLowerCase() === lowercaseTag)
		})
}

export const filterPostsByCategory = async (category: string, locale: Locale = DEFAULT_LOCALE) => {
	const posts = await getPosts(undefined, locale)
	return posts
		.filter((post) => !post.data.draft)
		.filter((post) => post.data.category.toLowerCase() === category)
}
