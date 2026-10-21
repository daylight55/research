import assert from 'node:assert/strict'
import test from 'node:test'
import { articleDay, filterArchiveEntries, emptyArchiveFilters } from '../src/utils/archive.ts'
const entries = [
	{
		id: 1,
		search: '日本 Japan 金利 AI',
		date: '2026-10-01',
		category: 'finance',
		countries: ['JP']
	},
	{
		id: 2,
		search: 'ウクライナ ロシア war',
		date: '2026-09-15',
		category: 'geopolitics',
		countries: ['UA', 'RU']
	},
	{ id: 3, search: '日本 Japan 政治', date: '2026-09-02', category: 'politics', countries: ['JP'] }
]
const filter = (changes) =>
	filterArchiveEntries(entries, { ...emptyArchiveFilters, ...changes }).map((entry) => entry.id)

test('archive combines country, month, category and normalized multi-word search', () => {
	assert.deepEqual(filter({ q: ' ＪＡＰＡＮ  ａｉ ' }), [1])
	assert.deepEqual(filter({ country: 'JP', month: '2026-09' }), [3])
	assert.deepEqual(filter({ country: 'RU' }), [2])
	assert.deepEqual(filter({ country: 'JP', category: 'geopolitics' }), [])
	assert.deepEqual(filter({ q: 'does not exist' }), [])
})
test('archive ordering is deterministic and does not mutate its source', () => {
	const before = structuredClone(entries)
	assert.deepEqual(filter({ order: 'oldest' }), [3, 2, 1])
	assert.deepEqual(filter({}), [1, 2, 3])
	assert.deepEqual(entries, before)
})
test('archive can find a matching article beyond the old 50-item first page', () => {
	const many = Array.from({ length: 65 }, (_, index) => ({
		...entries[0],
		search: `report-${index}`
	}))
	assert.equal(filterArchiveEntries(many, { ...emptyArchiveFilters, q: 'report-64' }).length, 1)
})
test('article dates use Japan time at UTC date boundaries', () => {
	assert.equal(articleDay(new Date('2026-10-20T15:30:00Z')), '2026-10-21')
	assert.equal(articleDay(new Date('2026-10-20T14:59:59Z')), '2026-10-20')
})
