import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = new URL('..', import.meta.url)
const providerLocalePath = join(repoRoot.pathname, 'src/components/ProviderLocale.astro')
const mixedArticleContentPath = join(repoRoot.pathname, 'src/components/MixedArticleContent.astro')

test('locale switch scroll restoration cancels stale restore attempts', async () => {
	const source = await readFile(providerLocalePath, 'utf8')

	assert.match(source, /const ARTICLE_BLOCK_SELECTOR = 'h1, h2, h3, h4, p, li, blockquote, table'/)
	assert.match(source, /const ARTICLE_VIEWPORT_ANCHOR_RATIO = 0\.42/)
	assert.match(source, /const getArticleContentRoot = \(\) =>/)
	assert.match(source, /document\.querySelector\('article \[data-mixed-english\]'\)/)
	assert.match(source, /const getArticleScrollAnchor = \(\) =>/)
	assert.match(source, /blockIndex/)
	assert.match(source, /blockOffsetRatio/)
	assert.match(source, /textByLocale: getBlockTextAnchors\(visibleBlock\)/)
	assert.match(source, /const findArticleBlockByTextAnchor = \(anchor, blocks\) =>/)
	assert.match(source, /findArticleBlockByTextAnchor\(anchor, blocks\) \?\?/)
	assert.match(source, /viewportRatio: ARTICLE_VIEWPORT_ANCHOR_RATIO/)
	assert.match(source, /const scrollToArticleAnchor = \(anchor\) =>/)
	assert.match(source, /anchor: isAtPageTop \? null : getArticleScrollAnchor\(\)/)
	assert.match(source, /if \(scrollToArticleAnchor\(saved\.anchor\)\)/)
	assert.match(source, /let scrollRestoreRun = 0/)
	assert.match(source, /const clearScheduledScrollRestores = \(\) =>/)
	assert.match(source, /if \(restoreRun !== scrollRestoreRun\) return/)
	assert.match(source, /if \(readSavedScrollPosition\(\) !== saved\) return/)
	assert.match(source, /pendingScrollRestore = raw \? JSON\.parse\(raw\) : null/)
	assert.match(source, /clearSavedScrollPosition\(\)\s+clearScheduledScrollRestores\(\)/)
	assert.match(
		source,
		/clearWhenRestored\(\)\s+if \(readSavedScrollPosition\(\) !== saved\) return/
	)
	assert.match(source, /scheduleRestore\(1200, true\)/)
	assert.match(source, /window\.requestAnimationFrame\(\(\) => clearWhenRestored\(\)\)/)
	assert.doesNotMatch(source, /window\.setTimeout\(clearWhenRestored,\s*\d+/)
	assert.doesNotMatch(source, /window\.requestAnimationFrame\(clearWhenRestored\)/)
})

test('locale switch from the top keeps absolute top position instead of article anchor', async () => {
	const source = await readFile(providerLocalePath, 'utf8')

	assert.match(source, /const isAtPageTop = window\.scrollY <= 1/)
	assert.match(source, /anchor: isAtPageTop \? null : getArticleScrollAnchor\(\)/)
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

test('mixed article blocks expose bilingual scroll anchors', async () => {
	const source = await readFile(mixedArticleContentPath, 'utf8')

	assert.match(
		source,
		/function setBlockScrollAnchors\(block, englishSentences, japaneseSentences\)/
	)
	assert.match(source, /block\.dataset\.scrollAnchorEn = englishText/)
	assert.match(source, /block\.dataset\.scrollAnchorJa = japaneseText/)
	assert.match(source, /setBlockScrollAnchors\(block, englishSentences, pairedJapaneseSentences\)/)
})

test('sparse explicit mixed alignment falls back to section pairing for the remaining article', async () => {
	const source = await readFile(mixedArticleContentPath, 'utf8')

	assert.doesNotMatch(source, /block\.dataset\.mixedExplicit = 'true'/)
	assert.doesNotMatch(source, /!block\.dataset\.mixedExplicit/)
	assert.doesNotMatch(
		source,
		/function pairBlocksWithExplicitAlignment|pairBlocksWithExplicitAlignment\(/
	)
})

test('mobile horizontal swipes switch locale without replacing vertical scroll', async () => {
	const source = await readFile(providerLocalePath, 'utf8')

	assert.match(source, /const SWIPE_MAX_WIDTH = 768/)
	assert.match(source, /const SWIPE_MIN_DISTANCE = 72/)
	assert.match(source, /const SWIPE_MAX_VERTICAL_DISTANCE = 70/)
	assert.match(source, /let swipeStart = null/)
	assert.match(source, /window\.__localeAvailability/)
	assert.match(source, /AVAILABLE_LOCALES_FOR_CURRENT_PATH/)
	assert.match(source, /const availableLocalesForPath = \(contentPath\) =>/)
	assert.match(source, /normalizePath\(contentPath\) === normalizePath\(CURRENT_CONTENT_PATH\)/)
	assert.match(source, /\? AVAILABLE_LOCALES_FOR_CURRENT_PATH/)
	assert.match(source, /canRedirectToMixedArticle\(contentPath\)/)
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
