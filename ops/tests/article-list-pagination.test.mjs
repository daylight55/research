import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8')

test('archives search the entire collection while existing paginated URLs stay available', async () => {
	for (const prefix of ['', 'en/']) {
		for (const [section, getter] of [
			['reports', 'getReportPosts'],
			['news', 'getNewsPosts']
		]) {
			const index = await read(`src/pages/${prefix}${section}/index.astro`)
			assert.match(
				index,
				new RegExp(`${getter}\\(undefined, locale\\)`),
				'filtering must include articles beyond the old first 50'
			)
			assert.match(index, /<ArticleArchive posts=\{posts\}/)
			const legacy = await read(`src/pages/${prefix}${section}/page/[page].astro`)
			assert.match(legacy, /createArticleListStaticPaths/)
			assert.match(legacy, /<ListPosts posts=\{posts\}/)
			assert.match(legacy, /<Pagination page=\{page\}/)
		}
	}
	assert.match(await read('src/utils/listPagination.ts'), /ARTICLE_LIST_PAGE_SIZE = 50/)
})

test('archive filtering is a progressive enhancement of server-rendered article links', async () => {
	const archive = await read('src/components/ArticleArchive.astro')
	assert.match(archive, /posts\.map\(/)
	assert.match(archive, /href=\{getPostUrl\(post\)\}/)
	assert.match(archive, /data-archive-controls\s+hidden/)
	assert.match(archive, /role='status'/)
	assert.match(archive, /history\.replaceState/)
	assert.match(archive, /popstate/)
	assert.doesNotMatch(archive, /fetch\(/, 'browsing metadata should not need another API')
})
