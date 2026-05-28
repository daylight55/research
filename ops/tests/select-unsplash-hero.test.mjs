import { strict as assert } from 'node:assert'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
	articleSlugFromFile,
	buildRetryQueries,
	existingHeroState,
	imageHash,
	selectUniqueUnsplashPhoto
} from '../scripts/select-unsplash-hero.mjs'

test('buildRetryQueries prioritizes news-specific people and organizations before generic news terms', () => {
	assert.deepEqual(
		buildRetryQueries('news collage politics economy technology', {
			contentType: 'news',
			focusTerms: ['OpenAI', 'White House', 'Volodymyr Zelenskyy', 'OpenAI']
		}),
		[
			'OpenAI news',
			'White House news',
			'Volodymyr Zelenskyy news',
			'news collage politics economy technology',
			'politics economy technology',
			'global newsroom editorial'
		]
	)
})

test('articleSlugFromFile derives the article slug rather than the locale directory', () => {
	assert.equal(
		articleSlugFromFile('articles/news/daily-trends-2026-05-28/en/index.mdx'),
		'daily-trends-2026-05-28'
	)
	assert.equal(
		articleSlugFromFile('articles/report/cognitive-schema-update-language-learning/ja/index.mdx'),
		'cognitive-schema-update-language-learning'
	)
})

test('selectUniqueUnsplashPhoto retries with another query when a candidate duplicates an existing hero image', async () => {
	const duplicateBytes = Buffer.from('same-image')
	const uniqueBytes = Buffer.from('different-image')
	const existingImageHashes = new Set([imageHash(duplicateBytes)])
	const searchedQueries = []

	const selected = await selectUniqueUnsplashPhoto({
		queries: ['tehran skyline dusk', 'iran parliament'],
		existingImageHashes,
		existingPhotoKeys: new Set(),
		searchPhotos: async (query) => {
			searchedQueries.push(query)
			return query === 'tehran skyline dusk'
				? [
						{
							id: 'duplicate-photo',
							urls: { raw: 'https://images.unsplash.test/duplicate' },
							links: { download_location: 'https://api.unsplash.test/duplicate/download' },
							user: { name: 'Duplicate Author' }
						}
					]
				: [
						{
							id: 'unique-photo',
							urls: { raw: 'https://images.unsplash.test/unique' },
							links: { download_location: 'https://api.unsplash.test/unique/download' },
							user: { name: 'Unique Author' }
						}
					]
		},
		downloadPhotoBytes: async (photo) =>
			photo.id === 'duplicate-photo' ? duplicateBytes : uniqueBytes
	})

	assert.equal(selected.photo.id, 'unique-photo')
	assert.equal(selected.query, 'iran parliament')
	assert.deepEqual(searchedQueries, ['tehran skyline dusk', 'iran parliament'])
})

test('selectUniqueUnsplashPhoto rejects previously used Unsplash photo ids without downloading', async () => {
	let downloads = 0

	const selected = await selectUniqueUnsplashPhoto({
		queries: ['openai office'],
		existingImageHashes: new Set(),
		existingPhotoKeys: new Set(['unsplash:already-used']),
		searchPhotos: async () => [
			{
				id: 'already-used',
				urls: { raw: 'https://images.unsplash.test/already-used' },
				links: { download_location: 'https://api.unsplash.test/already-used/download' },
				user: { name: 'Used Author' }
			},
			{
				id: 'new-photo',
				urls: { raw: 'https://images.unsplash.test/new' },
				links: { download_location: 'https://api.unsplash.test/new/download' },
				user: { name: 'New Author' }
			}
		],
		downloadPhotoBytes: async (photo) => {
			downloads += 1
			return Buffer.from(photo.id)
		}
	})

	assert.equal(selected.photo.id, 'new-photo')
	assert.equal(downloads, 1)
})

test('existingHeroState treats an untracked current article as duplicate when it reuses a tracked hero', () => {
	const previousCwd = process.cwd()
	const tempDir = mkdtempSync(join(tmpdir(), 'hero-state-'))

	try {
		process.chdir(tempDir)
		execFileSync('git', ['init', '--quiet'])
		mkdirSync('src/assets/images/hero', { recursive: true })
		mkdirSync('articles/report/existing/en', { recursive: true })
		mkdirSync('articles/news/generated/en', { recursive: true })
		writeFileSync('src/assets/images/hero/en.jpg', 'same-image')
		writeFileSync(
			'articles/report/existing/en/index.mdx',
			`---
title: Existing
contentType: report
heroImage: '../../../../src/assets/images/hero/en.jpg'
draft: false
---
`
		)
		writeFileSync(
			'articles/news/generated/en/index.mdx',
			`---
title: Generated
contentType: news
heroImage: '../../../../src/assets/images/hero/en.jpg'
heroImageQuery: generated news
draft: false
---
`
		)
		execFileSync('git', ['add', 'articles/report/existing/en/index.mdx', 'src/assets/images/hero/en.jpg'])

		assert.equal(
			existingHeroState({ currentFile: 'articles/news/generated/en/index.mdx' }).duplicateCurrentHero,
			true
		)
	} finally {
		process.chdir(previousCwd)
		rmSync(tempDir, { recursive: true, force: true })
	}
})
