import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import {
	buildRetryQueries,
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
