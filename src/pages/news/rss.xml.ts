import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { siteConfig } from '@/site-config'
import { getNewsPosts, renderNewsRssContent, withBase } from '@/utils'

export const GET: APIRoute = async (context) => {
	const posts = await getNewsPosts()

	return rss({
		title: `${siteConfig.title} News`,
		description:
			'世界・日本の技術トレンド、公式発表、研究動向、脆弱性情報、政策・規制、日本・国際政治情勢の変化を追うニュース記事。',
		site: context.site ?? siteConfig.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.rssSummary ?? post.data.description,
			content: renderNewsRssContent(post.body),
			pubDate: post.data.pubDate,
			link: withBase(`/post/${post.id}/`),
			categories: [post.data.category, ...post.data.tags]
		}))
	})
}
