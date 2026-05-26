import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = new URL('../..', import.meta.url)

const homePages = [
	{ locale: 'ja', path: join(repoRoot.pathname, 'src/pages/index.astro') },
	{ locale: 'en', path: join(repoRoot.pathname, 'src/pages/en/index.astro') }
]

test('home pages keep latest news as a horizontal snap carousel', async () => {
	for (const { locale, path } of homePages) {
		const source = await readFile(path, 'utf8')

		assert.match(
			source,
			/getNewsPosts\(12(?:,\s*locale)?\)/,
			`${locale} home should fetch enough news posts for horizontal browsing`
		)
		assert.match(
			source,
			/overflow-x-auto overscroll-x-contain/,
			`${locale} home latest-news section should scroll horizontally`
		)
		assert.match(
			source,
			/flex snap-x snap-mandatory flex-nowrap gap-4/,
			`${locale} home latest-news list should use scroll snap`
		)
		assert.match(
			source,
			/flex-\[0_0_100%\] snap-start/,
			`${locale} home news cards should show one full card at mobile width`
		)
		assert.match(
			source,
			/md:flex-\[0_0_calc\(\(100%_-_1rem\)\/2\)\]/,
			`${locale} home news cards should fit two full cards at medium width`
		)
		assert.match(
			source,
			/xl:flex-\[0_0_calc\(\(100%_-_2rem\)\/3\)\]/,
			`${locale} home news cards should fit three full cards at wide width`
		)
		assert.doesNotMatch(
			source,
			/grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4/,
			`${locale} home latest-news section should not regress to static grid cards`
		)
	}
})
