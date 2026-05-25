import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { siteConfig } from '@/site-config'
import { getPostSlug, getPosts, withBase } from '@/utils'

export const GET: APIRoute = async (context) => {
	const posts = await getPosts()

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: context.site ?? siteConfig.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.rssSummary ?? post.data.description,
			pubDate: post.data.pubDate,
			link: withBase(`/post/${getPostSlug(post)}/`),
			categories: [post.data.category, ...post.data.tags]
		}))
	})
}
