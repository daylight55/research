import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { siteConfig } from '@/site-config'
import { getReportPosts, withBase } from '@/utils'

export const GET: APIRoute = async (context) => {
	const posts = await getReportPosts()

	return rss({
		title: `${siteConfig.title} Reports`,
		description:
			'AI、データ、組織ナレッジ、技術、経済、地政学の長文調査レポートを追うRSSフィード。',
		site: context.site ?? siteConfig.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.rssSummary ?? post.data.description,
			pubDate: post.data.pubDate,
			link: withBase(`/post/${post.slug}/`),
			categories: [post.data.category, ...post.data.tags]
		}))
	})
}
