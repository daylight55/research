import type { APIRoute, GetStaticPaths } from 'astro'
import { getPostSlug, getPosts } from '@/utils'

type Props = {
	body: string
}

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getPosts()

	return posts.map((post) => ({
		params: { slug: getPostSlug(post) },
		props: { body: post.body }
	}))
}

export const GET: APIRoute<Props> = ({ props }) => {
	return new Response(props.body.trimStart(), {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': 'inline'
		}
	})
}
