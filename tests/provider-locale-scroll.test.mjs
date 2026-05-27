import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = new URL('..', import.meta.url)
const providerLocalePath = join(repoRoot.pathname, 'src/components/ProviderLocale.astro')

test('locale switch scroll restoration cancels stale restore attempts', async () => {
	const source = await readFile(providerLocalePath, 'utf8')

	assert.match(source, /const ARTICLE_BLOCK_SELECTOR = 'h1, h2, h3, h4, p, li, blockquote, table'/)
	assert.match(source, /const ARTICLE_VIEWPORT_ANCHOR_RATIO = 0\.42/)
	assert.match(source, /const getArticleContentRoot = \(\) =>/)
	assert.match(source, /document\.querySelector\('article \[data-mixed-english\]'\)/)
	assert.match(source, /const getArticleScrollAnchor = \(\) =>/)
	assert.match(source, /blockIndex/)
	assert.match(source, /blockOffsetRatio/)
	assert.match(source, /viewportRatio: ARTICLE_VIEWPORT_ANCHOR_RATIO/)
	assert.match(source, /const scrollToArticleAnchor = \(anchor\) =>/)
	assert.match(source, /anchor: getArticleScrollAnchor\(\)/)
	assert.match(source, /if \(scrollToArticleAnchor\(saved\.anchor\)\)/)
	assert.match(source, /let scrollRestoreRun = 0/)
	assert.match(source, /const clearScheduledScrollRestores = \(\) =>/)
	assert.match(source, /if \(restoreRun !== scrollRestoreRun\) return/)
	assert.match(source, /if \(readSavedScrollPosition\(\) !== saved\) return/)
	assert.match(source, /clearSavedScrollPosition\(\)\s+clearScheduledScrollRestores\(\)/)
	assert.match(
		source,
		/clearWhenRestored\(\)\s+if \(readSavedScrollPosition\(\) !== saved\) return/
	)
	assert.doesNotMatch(source, /window\.setTimeout\(clearWhenRestored,\s*\d+/)
})

test('locale switch scroll restoration is aborted by user scroll input', async () => {
	const source = await readFile(providerLocalePath, 'utf8')

	assert.match(source, /const cancelScrollRestoreForUserInput = \(\) =>/)
	assert.match(
		source,
		/window\.addEventListener\('wheel', cancelScrollRestoreForUserInput, \{ passive: true \}\)/
	)
	assert.match(
		source,
		/window\.addEventListener\('touchmove', cancelScrollRestoreForUserInput, \{ passive: true \}\)/
	)
	assert.match(source, /window\.addEventListener\('keydown', cancelScrollRestoreForScrollKey\)/)
	assert.match(source, /'PageDown'/)
	assert.match(source, /'PageUp'/)
})

test('mobile horizontal swipes switch locale without replacing vertical scroll', async () => {
	const source = await readFile(providerLocalePath, 'utf8')

	assert.match(source, /const SWIPE_MAX_WIDTH = 768/)
	assert.match(source, /const SWIPE_MIN_DISTANCE = 72/)
	assert.match(source, /const SWIPE_MAX_VERTICAL_DISTANCE = 70/)
	assert.match(source, /let swipeStart = null/)
	assert.match(source, /const availableLocalesForPath = \(contentPath\) =>/)
	assert.match(
		source,
		/canRedirectToMixedArticle\(contentPath\) \? SUPPORTED_LOCALES : \['ja', 'en'\]/
	)
	assert.match(source, /const switchLocaleBySwipe = \(direction\) =>/)
	assert.match(source, /window\.addEventListener\(\s*'touchstart'/)
	assert.match(source, /window\.addEventListener\(\s*'touchend'/)
	assert.match(source, /event\.touches\.length !== 1/)
	assert.match(source, /isSwipeIgnoredTarget\(event\.target\)/)
	assert.match(source, /Math\.abs\(deltaX\) < SWIPE_MIN_DISTANCE/)
	assert.match(source, /Math\.abs\(deltaY\) > SWIPE_MAX_VERTICAL_DISTANCE/)
	assert.match(source, /switchLocaleBySwipe\(deltaX < 0 \? 1 : -1\)/)
	assert.match(source, /switchLocale\(targetLocale, targetHref\)/)
})
