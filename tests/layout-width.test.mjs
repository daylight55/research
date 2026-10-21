import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('site shell separates navigation from the main reading landmark', () => {
	const layout = readFileSync('src/layouts/BaseLayout.astro', 'utf8')
	const css = readFileSync('src/styles/global.css', 'utf8')
	assert.match(layout, /href='#main-content'/)
	assert.match(layout, /<main id='main-content'/)
	assert.ok(layout.indexOf('<Header') < layout.indexOf('<main'))
	assert.match(css, /max-width: 86rem/)
	assert.doesNotMatch(layout, /overflow-hidden/)
})

test('article pages reserve a bounded reading column and a separate table of contents', () => {
	const css = readFileSync('src/styles/global.css', 'utf8')
	assert.match(css, /minmax\(0, 46rem\) minmax\(0, 14rem\)/)
	for (const prefix of ['', 'en/', 'mix/']) {
		for (const section of ['reports', 'news']) {
			const source = readFileSync(`src/pages/${prefix}${section}/[...slug].astro`, 'utf8')
			assert.match(source, /class='article-layout'/)
			assert.match(source, /class='article-content'/)
			assert.match(source, /class='article-toc'/)
			assert.match(source, /h1: ArticleBodyTitle/)
		}
	}
	const layout = readFileSync('src/layouts/BlogPost.astro', 'utf8')
	assert.match(layout, /class='mobile-toc'/)
	assert.match(layout, /<h1>/)
})

test('post sidebar keeps the research trail link immediately before share', () => {
	const postPage = readFileSync('src/pages/reports/[...slug].astro', 'utf8')
	const englishPostPage = readFileSync('src/pages/en/reports/[...slug].astro', 'utf8')
	const articleResearchLinks = readFileSync('src/components/ArticleResearchLinks.astro', 'utf8')

	for (const source of [postPage, englishPostPage]) {
		const researchIndex = source.lastIndexOf('<ArticleResearchLinks')
		const shareIndex = source.lastIndexOf('<Share title={post.data.title} />')

		assert.ok(researchIndex > 0)
		assert.ok(shareIndex > researchIndex)
	}

	assert.match(articleResearchLinks, /Research trail/)
	assert.match(articleResearchLinks, /Source notes/)
	assert.match(
		articleResearchLinks,
		/href=\{localizedPath\(locale, `\/\$\{section\}\/\$\{slug\}\/research\/`\)\}/
	)
	assert.doesNotMatch(
		articleResearchLinks,
		/href=\{localizedPath\('ja', `\/\$\{section\}\/\$\{slug\}\/research\/`\)\}/
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
	assert.match(
		englishResearchPage,
		/href=\{localizedPath\(locale, `\/reports\/\$\{postSlug\}\/`\)\}/
	)
	assert.match(englishResearchPage, /Back to article/)
})

test('post lists use at most two columns without hiding long titles', () => {
	const card = readFileSync('src/components/PostCard.astro', 'utf8')
	const css = readFileSync('src/styles/global.css', 'utf8')
	assert.match(css, /\.post-list\s*\{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/)
	assert.doesNotMatch(card, /line-clamp/)
	assert.match(card, /<Heading>\s*<a href=\{postUrl\}>/)
})

test('mobile theme toggle has a visible light-mode fallback', () => {
	const header = readFileSync('src/components/Header.astro', 'utf8')
	const toggleTheme = readFileSync('src/components/ToggleTheme.astro', 'utf8')

	assert.match(header, /class='header-tools'/)
	assert.match(toggleTheme, /<theme-toggle class='relative block h-9 w-9 shrink-0'>/)
	assert.match(toggleTheme, /type='button'/)
	assert.match(toggleTheme, /aria-pressed='false'/)
	assert.match(toggleTheme, /theme-toggle__moon/)
	assert.match(toggleTheme, /button\[aria-pressed='false'\] \.theme-toggle__moon/)
	assert.doesNotMatch(toggleTheme, /group-aria-\[/)
})
