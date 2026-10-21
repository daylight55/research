import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8')

test('home gives news and reports bounded previews with access to their full archives', async () => {
	const home = await read('src/components/HomePage.astro')
	assert.match(home, /allNews\.slice\(0, 4\)/)
	assert.match(home, /allReports\.slice\(0, 6\)/)
	assert.match(home, /localizedPath\(locale, '\/news\/'\)/)
	assert.match(home, /localizedPath\(locale, '\/reports\/'\)/)
	assert.match(home, /allNews\.length/)
	assert.match(home, /allReports\.length/)
	assert.doesNotMatch(home, /snap-mandatory|overflow-x-auto/)
	for (const [path, locale] of [
		['src/pages/index.astro', 'ja'],
		['src/pages/en/index.astro', 'en']
	]) {
		assert.match(await read(path), new RegExp(`<HomePage locale='${locale}'`))
	}
})
