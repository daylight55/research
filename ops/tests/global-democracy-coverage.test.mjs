import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const root = 'articles/report/global-democracy-protest-history'
const unMemberCodes = `AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TZ UA UG US UY UZ VC VE VN VU WS YE ZA ZM ZW`.split(' ')
const manifest = JSON.parse(readFileSync(`${root}/country-coverage.json`, 'utf8'))

// Membership source: https://research.un.org/en/unmembers/currentmembers
// Scope snapshot: 2026-10-21 JST; this tests coverage, not state recognition.
test('democracy atlas covers exactly 193 UN members, two observers, and two supplements', () => {
	const { countries } = manifest
	assert.equal(manifest.asOf, '2026-10-21')
	assert.equal(countries.length, 197)
	assert.equal(new Set(countries.map((entry) => entry.iso2)).size, 197)
	for (const [scope, expected] of [
		['un_member', unMemberCodes],
		['un_observer', ['PS', 'VA']],
		['supplement', ['TW', 'XK']]
	]) {
		assert.deepEqual(
			countries.filter((entry) => entry.scope === scope).map((entry) => entry.iso2).sort(),
			expected.sort(),
			`${scope} should match the declared country universe`
		)
	}
})

test('every country has historical context, outcomes, explicit depth, and public evidence', () => {
	for (const entry of manifest.countries) {
		for (const key of ['nameJa', 'nameEn', 'milestone', 'cause', 'outcome', 'milestoneEn', 'causeEn', 'outcomeEn']) {
			assert.ok(typeof entry[key] === 'string' && entry[key].trim(), `${entry.iso2}: ${key}`)
		}
		assert.ok(['A', 'B'].includes(entry.depth), `${entry.iso2}: depth should be explicit`)
		assert.ok(entry.sourceURLs.length > 0, `${entry.iso2}: evidence is required`)
		for (const url of entry.sourceURLs) {
			const parsed = new URL(url)
			assert.equal(parsed.protocol, 'https:')
			assert.doesNotMatch(parsed.hostname, /(?:^|\.)(?:notion\.com|notion\.so)$/)
		}
	}
})

test('both source-note languages contain the full country index and coverage caveats', () => {
	for (const locale of ['ja', 'en']) {
		const source = readFileSync(`${root}/${locale}/source-notes.mdx`, 'utf8')
		for (const entry of manifest.countries) {
			assert.ok(source.includes(`| ${entry.iso2} |`), `${locale} index missing ${entry.iso2}`)
		}
		assert.match(source, /195/)
		assert.match(source, /193/)
		assert.doesNotMatch(source, /app\.notion\.com|\/workspace\/|<transcript_evidence>/)
	}
})

test('both articles distinguish current France evidence from analysis and historical protest', () => {
	const ja = readFileSync(`${root}/ja/index.mdx`, 'utf8')
	const en = readFileSync(`${root}/en/index.mdx`, 'utf8')
	assert.match(ja, /2026年10月/)
	assert.match(en, /October 2026/)
	assert.match(ja, /2023年/)
	assert.match(en, /2023/)
	assert.match(ja, /分析|推定/)
	assert.match(en, /assessment|analysis/i)
	for (const source of [ja, en]) {
		assert.ok((source.match(/<SourceNote>/g) ?? []).length >= 15)
		assert.doesNotMatch(source, /app\.notion\.com|\/workspace\/|<transcript_evidence>/)
	}
})


test('published languages retain the same public citations and exact reading pairs', () => {
	const read = (locale, name) => readFileSync(`${root}/${locale}/${name}.mdx`, 'utf8')
	const urls = (source) => [...new Set(source.match(/https:\/\/[^\s)<>"']+/g) ?? [])].sort()
	for (const name of ['index', 'source-notes', 'research-log']) {
		assert.deepEqual(urls(read('ja', name)), urls(read('en', name)), `${name}: public evidence parity`)
	}
	const normalize = (source) => source.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[`*]/g, '').replace(/\s+/g, ' ').trim()
	const ja = normalize(read('ja', 'index'))
	const en = normalize(read('en', 'index'))
	const alignment = JSON.parse(readFileSync(`${root}/mix-alignment.json`, 'utf8'))
	for (const pair of alignment.pairs) {
		assert.ok(ja.includes(normalize(pair.ja)), `Japanese sentence does not match: ${pair.ja}`)
		assert.ok(en.includes(normalize(pair.en)), `English sentence does not match: ${pair.en}`)
	}
})

test('democracy article metadata and research logs match their render routes', () => {
	for (const locale of ['ja', 'en']) {
		const article = readFileSync(`${root}/${locale}/index.mdx`, 'utf8')
		const title = article.match(/^title: '(.+)'$/m)?.[1]
		assert.ok(title && title.length <= 80, `${locale}: title must fit the content schema`)
		const log = readFileSync(`${root}/${locale}/research-log.mdx`, 'utf8')
		assert.doesNotMatch(log, /<SourceNote>/, 'Research routes do not register SourceNote; use Markdown links')
	}
})
