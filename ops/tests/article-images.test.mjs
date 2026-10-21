import assert from 'node:assert/strict'
import test from 'node:test'
import { validateArticleImages } from '../scripts/validate-article-images.mjs'

const figure = `<figure data-article-figure>
<a href='/art.jpg'><img src='/art.webp' srcset='/art-480.webp 480w, /art.webp 960w' alt='A standing marble figure' width='900' height='1200'></a>
<figcaption><span>A sculpture discussed in the following paragraph.</span>
<a data-figure-source href='https://museum.example/collection/1'>Museum credit</a>
<span data-figure-rights><a href='https://creativecommons.org/publicdomain/zero/1.0/'>CC0</a></span></figcaption>
</figure>`

test('published figures require descriptive alternatives and reserved image space', () => {
	assert.equal(validateArticleImages(figure).count, 1)
	assert.deepEqual(validateArticleImages(figure).errors, [])
	assert.match(
		validateArticleImages(figure.replace("alt='A standing marble figure'", "alt=''")).errors.join(),
		/alt text/
	)
	assert.match(
		validateArticleImages(figure.replace("height='1200'", '')).errors.join(),
		/width and height/
	)
})

test('published figures catch missing responsive image variants', () => {
	const result = validateArticleImages(figure, { assetExists: (src) => src !== '/art-480.webp' })
	assert.deepEqual(result.errors, ['article.html: figure 1: missing image asset /art-480.webp'])
})

test('the full-size image link must also exist after building', () => {
	const result = validateArticleImages(figure, { assetExists: (src) => src !== '/art.jpg' })
	assert.deepEqual(result.errors, ['article.html: figure 1: missing image asset /art.jpg'])
})

test('published figures retain visible captions, source credits, and rights', () => {
	assert.match(
		validateArticleImages(figure.replace(/<figcaption>[\s\S]*?<\/figcaption>/, '')).errors.join(),
		/caption/
	)
	assert.match(
		validateArticleImages(
			figure.replace('https://museum.example/collection/1', '/untraceable')
		).errors.join(),
		/source credit/
	)
	assert.match(
		validateArticleImages(
			figure.replace(/<span data-figure-rights>[\s\S]*?<\/span>/, '')
		).errors.join(),
		/rights information/
	)
})

test('figure validation leaves ordinary article content and remote assets intact', () => {
	assert.deepEqual(validateArticleImages('<p>Plain prose.</p>'), { count: 0, errors: [] })
	const remote = figure
		.replace(/src='[^']*'/, "src='https://museum.example/art.jpg'")
		.replace("href='/art.jpg'", "href='https://museum.example/art.jpg'")
		.replace(/srcset='[^']*'/, '')
	assert.deepEqual(validateArticleImages(remote, { assetExists: () => false }).errors, [])
})
