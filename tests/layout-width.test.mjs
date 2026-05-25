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

test('post layout gives the article column more room on wide screens', () => {
	const postPage = readFileSync('src/pages/post/[...slug].astro', 'utf8')

	assert.match(postPage, /xl:grid-cols-\[10rem_minmax\(0,56rem\)_10rem\]/)
	assert.match(postPage, /2xl:grid-cols-\[12rem_minmax\(0,62rem\)_12rem\]/)
})

test('post lists keep cards readable at intermediate viewport widths', () => {
	const listPosts = readFileSync('src/components/ListPosts.astro', 'utf8')

	assert.match(listPosts, /repeat\(auto-fit,minmax\(min\(100%,17rem\),1fr\)\)/)
	assert.match(listPosts, /lg:grid-cols-3/)
	assert.doesNotMatch(listPosts, /md:grid-cols-3/)
})
