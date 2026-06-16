import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { validateArticleMdx } from '../scripts/validate-article-mdx.mjs'
import { validateArticleMixAlignment } from '../scripts/validate-mix-alignment.mjs'
import { validateNewsItemFormat } from '../scripts/validate-news-item-format.mjs'
import {
	renderDailyTrendNews,
	validateDailyTrendNewsData
} from '../scripts/render-daily-trend-news.mjs'

const sectionConfig = [
	{ tone: 'politics', ja: '政治', en: 'Politics' },
	{ tone: 'economy', ja: '経済', en: 'Economy' },
	{ tone: 'technology', ja: '技術', en: 'Technology' }
]

function makeTopic(section, index) {
	const topicNumber = index + 1
	return {
		id: `${section.tone}-${topicNumber}`,
		title: {
			ja: `${section.ja}トピック${topicNumber}`,
			en: `${section.en} topic ${topicNumber}`
		},
		source: {
			href: `https://example.com/${section.tone}/${topicNumber}`,
			source: 'Example Wire',
			title: {
				ja: `${section.ja}出典${topicNumber}`,
				en: `${section.en} source ${topicNumber}`
			},
			description: {
				ja: `${section.ja}の根拠${topicNumber}を示す短い出典メモ。`,
				en: `A short source memo for ${section.en.toLowerCase()} topic ${topicNumber}.`
			},
			imageUrl: `https://images.example.com/${section.tone}-${topicNumber}.jpg`,
			imageAlt: {
				ja: `${section.ja}画像${topicNumber}`,
				en: `${section.en} image ${topicNumber}`
			}
		},
		bottomLine: {
			ja:
				section.tone === 'politics' && topicNumber === 1
					? '制度変更は & 記号と <https://example.com/raw> を含んでも壊れない。'
					: `${section.ja}の要点${topicNumber}は意思決定の前提を動かす。`,
			en:
				section.tone === 'politics' && topicNumber === 1
					? 'The shift stays readable even with & and <https://example.com/raw> markers.'
					: `${section.en} signal ${topicNumber} changes the operating baseline.`
		},
		whatHappened: {
			ja: `${section.ja}の更新${topicNumber}が公表され、関係者は次の対応を確認した。`,
			en: `${section.en} update ${topicNumber} was published and stakeholders checked the next step.`
		},
		whyItMatters: {
			ja: `${section.ja}の論点${topicNumber}は予算、規制、運用計画に影響する。`,
			en: `${section.en} topic ${topicNumber} affects budgets, rules, and operating plans.`
		},
		whatToWatch: {
			ja: `${section.ja}の次の発表${topicNumber}と主要組織の反応を見る。`,
			en: `Watch the next ${section.en.toLowerCase()} release ${topicNumber} and major responses.`
		}
	}
}

function makeStructuredData(overrides = {}) {
	const sections = sectionConfig.map((section) => ({
		tone: section.tone,
		heading: {
			ja: section.ja,
			en: section.en
		},
		topics: Array.from({ length: 5 }, (_, index) => makeTopic(section, index))
	}))

	return {
		version: 1,
		slug: 'daily-trends-2026-06-17',
		date: '2026-06-17',
		category: 'tech-news',
		tags: ['news', 'politics', 'economy', 'technology'],
		generation: {
			model: 'gpt-5.4-mini'
		},
		heroImage: {
			query: 'United States election campaign signs',
			alt: {
				ja: '米国の選挙看板',
				en: 'United States election campaign signs'
			}
		},
		locales: {
			ja: {
				title: '2026-06-17 政策と市場、AI運用が同時に動く',
				description: '政策、市場、AI運用を横断して17日の注目点を整理する。',
				rssSummary: '政策、市場、AI運用の注目点を整理。',
				opening: '6月17日は政策判断、市場の反応、AI運用の安定性が同時に注目された日だった。',
				crossCutting: [
					'政策と市場の反応は、短期の価格より運用上の制約を強く示している。',
					'AI関連の話題は、機能よりも停止、制限、監査の重みが増している。',
					'組織は個別ニュースではなく、複数領域の前提変化を合わせて読む必要がある。'
				],
				watchItems: [
					'政策発表が次の市場反応にどこまでつながるか。',
					'主要企業がAI運用の制限と障害対応をどう説明するか。',
					'サイバー関連の追加通知がどの範囲に広がるか。'
				],
				sourceNotes: {
					politics: ['政治は当日の制度変更と投票動向を優先した。'],
					economy: ['経済は市場価格と景気見通しの接続を重視した。'],
					technology: ['技術はAI運用、障害、セキュリティを並べた。'],
					decisions: ['採否判断では、出典と画像を確認できる話題を優先した。']
				},
				researchLog: {
					instruction: [
						'Research date: 2026-06-17',
						'Article slug: `daily-trends-2026-06-17`',
						'Topic counts: politics 5, economy 5, technology 5'
					],
					decisionNotes: [
						'政治、経済、技術の各5本を構造化データとして整理した。',
						'出典カード画像は各トピックで異なるURLにした。'
					],
					followUps: ['翌日の更新で公式発表の有無を再確認する。']
				}
			},
			en: {
				title: '2026-06-17 Policy, markets, and AI operations move together',
				description: 'A concise daily digest across policy, markets, and AI operations.',
				rssSummary: 'Policy, markets, and AI operations in one daily digest.',
				opening:
					'June 17 brought policy decisions, market reactions, and AI operating reliability into the same frame.',
				crossCutting: [
					'Policy and market reactions point to operating constraints more than one-day prices.',
					'AI stories are increasingly about restrictions, outages, and audits rather than features.',
					'Organizations need to read the combined shift, not only each individual headline.'
				],
				watchItems: [
					'Whether policy announcements carry into the next market move.',
					'How major companies explain AI restrictions and outage response.',
					'Whether cyber notices expand to additional systems.'
				],
				sourceNotes: {
					politics: ['Politics prioritized same-day rule and voting signals.'],
					economy: ['Economy topics connected market prices with growth assumptions.'],
					technology: ['Technology topics grouped AI operations, outages, and security.'],
					decisions: ['Selection favored topics with sources and card images.']
				},
				researchLog: {
					instruction: [
						'Research date: 2026-06-17',
						'Article slug: `daily-trends-2026-06-17`',
						'Topic counts: politics 5, economy 5, technology 5'
					],
					decisionNotes: [
						'The three sections use five structured items each.',
						'Every source card uses a unique image URL.'
					],
					followUps: ['Check the next run for official follow-up statements.']
				}
			}
		},
		sections,
		...overrides
	}
}

test('structured Daily Trend News data enforces the required section counts', () => {
	const valid = validateDailyTrendNewsData(makeStructuredData())
	assert.deepEqual(valid.errors, [])

	const invalidData = makeStructuredData({
		sections: sectionConfig.map((section, sectionIndex) => ({
			tone: section.tone,
			heading: { ja: section.ja, en: section.en },
			topics: Array.from({ length: sectionIndex === 0 ? 4 : 5 }, (_, index) =>
				makeTopic(section, index)
			)
		}))
	})
	const invalid = validateDailyTrendNewsData(invalidData)
	assert.match(invalid.errors.join('\n'), /politics section must contain exactly 5 topics/)
})

test('structured Daily Trend News data rejects unresolved template placeholders', () => {
	const data = makeStructuredData()
	data.locales.ja.title = '2026-06-17 <SUMMARY_PHRASE>'

	const result = validateDailyTrendNewsData(data)
	assert.match(result.errors.join('\n'), /locales\.ja\.title must not contain unresolved/)
})

test('structured Daily Trend News renderer writes valid localized article artifacts', async () => {
	const rootDir = mkdtempSync(path.join(tmpdir(), 'daily-trend-news-render-'))
	const data = makeStructuredData()
	const dataFile = path.join(rootDir, 'daily-trend-news.json')
	writeFileSync(dataFile, JSON.stringify(data, null, 2))

	const result = renderDailyTrendNews({ dataFile, rootDir })
	assert.equal(result.slug, data.slug)

	for (const file of [
		`articles/news/${data.slug}/ja/index.mdx`,
		`articles/news/${data.slug}/en/index.mdx`,
		`articles/news/${data.slug}/ja/source-notes.mdx`,
		`articles/news/${data.slug}/en/source-notes.mdx`,
		`articles/news/${data.slug}/ja/research-log.mdx`,
		`articles/news/${data.slug}/en/research-log.mdx`,
		`articles/news/${data.slug}/mix-alignment.json`
	]) {
		assert.equal(existsSync(path.join(rootDir, file)), true, `${file} should be written`)
	}

	const jaArticlePath = `articles/news/${data.slug}/ja/index.mdx`
	const enArticlePath = `articles/news/${data.slug}/en/index.mdx`
	const jaArticle = readFileSync(path.join(rootDir, jaArticlePath), 'utf8')
	const enArticle = readFileSync(path.join(rootDir, enArticlePath), 'utf8')

	assert.match(jaArticle, /要点: 制度変更は &amp; 記号と &lt;https:\/\/example\.com\/raw&gt;/)
	assert.doesNotMatch(jaArticle, /<https:\/\/example\.com\/raw>/)
	assert.match(
		enArticle,
		/The bottom line: The shift stays readable even with &amp; and &lt;https:\/\/example\.com\/raw&gt;/
	)

	assert.deepEqual(
		(await validateArticleMdx({ file: jaArticlePath, source: jaArticle })).errors,
		[]
	)
	assert.deepEqual(
		(await validateArticleMdx({ file: enArticlePath, source: enArticle })).errors,
		[]
	)
	assert.deepEqual(validateNewsItemFormat({ file: jaArticlePath, source: jaArticle }).errors, [])
	assert.deepEqual(validateNewsItemFormat({ file: enArticlePath, source: enArticle }).errors, [])

	const alignment = readFileSync(
		path.join(rootDir, `articles/news/${data.slug}/mix-alignment.json`),
		'utf8'
	)
	const alignmentResult = validateArticleMixAlignment({
		type: 'news',
		slug: data.slug,
		japaneseArticle: jaArticle,
		englishArticle: enArticle,
		alignmentJson: alignment
	})
	assert.deepEqual(alignmentResult.errors, [])
})
