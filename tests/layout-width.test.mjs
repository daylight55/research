import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('site shell uses a wider desktop container', () => {
	const baseLayout = readFileSync('src/layouts/BaseLayout.astro', 'utf8')

	assert.match(baseLayout, /md:max-w-\[82rem\]/)
	assert.match(baseLayout, /2xl:max-w-\[90rem\]/)
	assert.match(baseLayout, /xl:px-0/)
	assert.doesNotMatch(baseLayout, /lg:px-0/)
})

test('post layout keeps readable spacing around sidebars on wide screens', () => {
	const postPage = readFileSync('src/pages/reports/[...slug].astro', 'utf8')
	const newsPage = readFileSync('src/pages/news/[...slug].astro', 'utf8')

	for (const source of [postPage, newsPage]) {
		assert.match(source, /lg:grid-cols-\[10rem_minmax\(0,1fr\)_9rem\]/)
		assert.match(source, /xl:grid-cols-\[12rem_minmax\(0,56rem\)_10rem\]/)
		assert.match(source, /2xl:grid-cols-\[14rem_minmax\(0,62rem\)_12rem\]/)
	}
})

test('post sidebar keeps the research trail link immediately before share', () => {
	const postPage = readFileSync('src/pages/reports/[...slug].astro', 'utf8')
	const englishPostPage = readFileSync('src/pages/en/reports/[...slug].astro', 'utf8')

	for (const source of [postPage, englishPostPage]) {
		const researchIndex = source.lastIndexOf('Research trail')
		const shareIndex = source.lastIndexOf('<Share title={post.data.title} />')

		assert.ok(researchIndex > 0)
		assert.ok(shareIndex > researchIndex)
	}

	assert.match(
		englishPostPage,
		/href=\{localizedPath\(locale, `\/reports\/\$\{postSlug\}\/research\/`\)\}/
	)
	assert.doesNotMatch(
		englishPostPage,
		/href=\{localizedPath\('ja', `\/reports\/\$\{postSlug\}\/research\/`\)\}/
	)
})

test('research process page uses a wider reading surface', () => {
	const researchPage = readFileSync('src/pages/reports/[slug]/research.astro', 'utf8')
	const englishResearchPage = readFileSync('src/pages/en/reports/[slug]/research.astro', 'utf8')

	for (const source of [researchPage, englishResearchPage]) {
		assert.match(source, /max-w-6xl/)
		assert.match(source, /max-w-4xl/)
		assert.doesNotMatch(source, /max-w-3xl/)
	}
})

test('English research process route links back to the English article', () => {
	const englishResearchPage = readFileSync('src/pages/en/reports/[slug]/research.astro', 'utf8')

	assert.match(englishResearchPage, /const locale = 'en'/)
	assert.match(englishResearchPage, /href=\{localizedPath\(locale, `\/reports\/\$\{postSlug\}\/`\)\}/)
	assert.match(englishResearchPage, /Back to article/)
})

test('post lists keep cards readable at intermediate viewport widths', () => {
	const listPosts = readFileSync('src/components/ListPosts.astro', 'utf8')

	assert.match(listPosts, /repeat\(auto-fit,minmax\(min\(100%,17rem\),1fr\)\)/)
	assert.match(listPosts, /lg:grid-cols-3/)
	assert.doesNotMatch(listPosts, /md:grid-cols-3/)
})
