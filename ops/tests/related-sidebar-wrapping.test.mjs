import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const articleTemplates = [
	'src/pages/reports/[...slug].astro',
	'src/pages/en/reports/[...slug].astro',
	'src/pages/news/[...slug].astro',
	'src/pages/en/news/[...slug].astro'
]

test('article sidebar related links allow narrow English titles to wrap', () => {
	for (const template of articleTemplates) {
		const source = readFileSync(template, 'utf8')
		assert.match(
			source,
			/class='[^']*min-w-0[^']*max-w-full[^']*\[overflow-wrap:anywhere\][^']*'/,
			`${template} should constrain and wrap related sidebar titles`
		)
	}
})
