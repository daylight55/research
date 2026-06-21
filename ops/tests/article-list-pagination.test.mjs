import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = new URL('../..', import.meta.url)

const listPages = [
	{
		label: 'Japanese reports',
		indexPath: 'src/pages/reports/index.astro',
		pagePath: 'src/pages/reports/page/[page].astro'
	},
	{
		label: 'English reports',
		indexPath: 'src/pages/en/reports/index.astro',
		pagePath: 'src/pages/en/reports/page/[page].astro'
	},
	{
		label: 'Japanese news',
		indexPath: 'src/pages/news/index.astro',
		pagePath: 'src/pages/news/page/[page].astro'
	},
	{
		label: 'English news',
		indexPath: 'src/pages/en/news/index.astro',
		pagePath: 'src/pages/en/news/page/[page].astro'
	}
]

async function readRepoFile(path) {
	return readFile(join(repoRoot.pathname, path), 'utf8')
}

test('report and news list pages use 50-item shared pagination', async () => {
	const paginationSource = await readRepoFile('src/utils/listPagination.ts')
	assert.match(
		paginationSource,
		/export const ARTICLE_LIST_PAGE_SIZE = 50/,
		'article list pagination should use 50 posts per page'
	)

	for (const { label, indexPath, pagePath } of listPages) {
		const indexSource = await readRepoFile(indexPath)
		assert.match(indexSource, /createArticleListPage/, `${label} index should build page data`)
		assert.match(indexSource, /<ListPosts posts=\{posts\}/, `${label} index should use ListPosts`)
		assert.match(
			indexSource,
			/<Pagination page=\{page\}/,
			`${label} index should render pagination`
		)

		const pagedSource = await readRepoFile(pagePath)
		assert.match(
			pagedSource,
			/createArticleListStaticPaths/,
			`${label} paged route should generate article-list pages`
		)
		assert.match(
			pagedSource,
			/<ListPosts posts=\{posts\}/,
			`${label} paged route should use ListPosts`
		)
		assert.match(
			pagedSource,
			/<Pagination page=\{page\}/,
			`${label} paged route should render pagination`
		)
	}
})

test('news list pages use report-list card layout instead of the home carousel', async () => {
	for (const { label, indexPath } of listPages.filter((page) =>
		page.indexPath.includes('/news/')
	)) {
		const source = await readRepoFile(indexPath)

		assert.match(source, /import ListPosts/, `${label} should use the shared post list component`)
		assert.doesNotMatch(
			source,
			/overflow-x-auto overscroll-x-contain/,
			`${label} should not use the horizontal home-news carousel`
		)
		assert.doesNotMatch(
			source,
			/flex snap-x snap-mandatory flex-nowrap gap-4/,
			`${label} should not use scroll-snap carousel cards`
		)
	}
})

test('news list pages use compact list cards to keep page height manageable', async () => {
	const listPostsSource = await readRepoFile('src/components/ListPosts.astro')
	const postCardSource = await readRepoFile('src/components/PostCard.astro')

	assert.match(
		listPostsSource,
		/variant\?: 'card' \| 'compact'/,
		'ListPosts should expose an explicit compact variant'
	)
	assert.match(
		postCardSource,
		/variant === 'compact'[\s\S]*?lg:grid-cols-\[10rem_minmax\(0,1fr\)\][\s\S]*?lg:aspect-auto/,
		'PostCard compact variant should use a short horizontal card without aspect-ratio overflow on wide screens'
	)

	for (const { label, indexPath, pagePath } of listPages) {
		const indexSource = await readRepoFile(indexPath)
		const pagedSource = await readRepoFile(pagePath)

		if (indexPath.includes('/news/')) {
			assert.match(
				indexSource,
				/<ListPosts posts=\{posts\}[^>]*variant='compact'/,
				`${label} index should use compact news cards`
			)
			assert.match(
				pagedSource,
				/<ListPosts posts=\{posts\}[^>]*variant='compact'/,
				`${label} paged route should use compact news cards`
			)
		} else {
			assert.doesNotMatch(
				indexSource,
				/variant='compact'/,
				`${label} index should keep full report cards`
			)
			assert.doesNotMatch(
				pagedSource,
				/variant='compact'/,
				`${label} paged route should keep full report cards`
			)
		}
	}
})
