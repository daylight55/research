import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { parse } from 'yaml'
import test from 'node:test'
import { validateArticleFrontmatter } from '../scripts/validate-article-frontmatter.mjs'
const source = (title, countries, category = 'geopolitics') =>
	`---\ntitle: '${title}'\ncountries: ${JSON.stringify(countries)}\ncategory: '${category}'\n---\n\n# ${title}\n`
const validate = (title, countries, locale = 'ja', category) =>
	validateArticleFrontmatter({
		file: `articles/report/example/${locale}/index.mdx`,
		source: source(title, countries, category)
	}).errors

test('country-title validation rejects missing, unknown, repeated and non-leading countries', () => {
	assert.equal(validate('日本｜金利政策', ['JP']).length, 0)
	assert.equal(validate('Japan: Rates', ['JP'], 'en').length, 0)
	assert.equal(validate('Ukraine / Russia: War', ['UA', 'RU'], 'en').length, 0)
	assert.match(validate('人口が減る日本', ['JP']).join(), /must start with 日本/)
	assert.match(validate('Unknown', ['XX']).join(), /registered country codes/)
	assert.match(validate('日本', ['JP', 'JP']).join(), /duplicate codes/)
	assert.match(validate('Japan', [], 'en', 'country-profiles').join(), /must declare countries/)
})
test('published country metadata and title prefixes remain synchronized between languages', () => {
	const files = execFileSync('git', ['ls-files', 'articles/report/*/ja/index.mdx'], {
		encoding: 'utf8'
	})
		.trim()
		.split('\n')
	for (const file of files) {
		const japanese = readFileSync(file, 'utf8')
		const englishFile = file.replace('/ja/', '/en/')
		const english = readFileSync(englishFile, 'utf8')
		const ja = parse(japanese.match(/^---\n([\s\S]*?)\n---/)[1])
		const en = parse(english.match(/^---\n([\s\S]*?)\n---/)[1])
		assert.deepEqual(ja.countries ?? [], en.countries ?? [], file)
		for (const [path, body] of [
			[file, japanese],
			[englishFile, english]
		]) {
			assert.deepEqual(validateArticleFrontmatter({ file: path, source: body }).errors, [], path)
			const title = parse(body.match(/^---\n([\s\S]*?)\n---/)[1]).title
			const heading = body.match(/^# (.+)$/m)?.[1]
			if (heading) assert.equal(heading, title, `${path} title and H1 should agree`)
		}
	}
})
