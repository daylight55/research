import assert from 'node:assert/strict'
import test from 'node:test'

import { validateArticleMixAlignment } from '../scripts/validate-mix-alignment.mjs'

const englishArticle = `---
title: Example
---

# Example

First sentence explains the context. Second sentence adds the implication. Third sentence states the recommendation. Fourth sentence names the limit.
`

const japaneseArticle = `---
title: 例
---

# 例

最初の文は背景を説明する。二つ目の文は含意を加える。三つ目の文は推奨を述べる。四つ目の文は限界を示す。
`

test('mix alignment validation rejects missing alignment for bilingual articles', () => {
	const result = validateArticleMixAlignment({
		type: 'report',
		slug: 'example',
		englishArticle,
		japaneseArticle
	})

	assert.equal(result.ok, false)
	assert.match(result.errors.join('\n'), /mix-alignment\.json is required/)
})

test('mix alignment validation rejects sparse alignment coverage', () => {
	const result = validateArticleMixAlignment({
		type: 'report',
		slug: 'example',
		englishArticle,
		japaneseArticle,
		alignmentJson: JSON.stringify({
			version: 1,
			sourceLocale: 'ja',
			targetLocale: 'en',
			sections: [
				{
					id: 'summary',
					heading: { ja: '例', en: 'Example' },
					pairs: [
						{
							en: 'First sentence explains the context.',
							ja: '最初の文は背景を説明する。'
						}
					]
				}
			]
		})
	})

	assert.equal(result.ok, false)
	assert.match(result.errors.join('\n'), /covers 25%/)
})

test('mix alignment validation accepts covered exact English pairs', () => {
	const result = validateArticleMixAlignment({
		type: 'report',
		slug: 'example',
		englishArticle,
		japaneseArticle,
		alignmentJson: JSON.stringify({
			version: 1,
			sourceLocale: 'ja',
			targetLocale: 'en',
			sections: [
				{
					id: 'summary',
					heading: { ja: '例', en: 'Example' },
					pairs: [
						{
							en: 'First sentence explains the context.',
							ja: '最初の文は背景を説明する。'
						},
						{
							en: 'Second sentence adds the implication.',
							ja: '二つ目の文は含意を加える。'
						}
					]
				}
			]
		})
	})

	assert.equal(result.ok, true)
	assert.deepEqual(result.errors, [])
})
