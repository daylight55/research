import assert from 'node:assert/strict'
import test from 'node:test'

import {
	buildGlossaryIndex,
	createWikipediaSearchApiUrl,
	createWikipediaSearchQuery,
	createWikipediaSummaryApiUrl,
	createWikipediaValidationKeywords,
	extractGlossaryTermsFromMarkdown,
	groupGlossaryTermsByCategory,
	linkFirstGlossaryMentions
} from '../src/utils/glossary.ts'

const sampleBody = `---
title: Graphiti MCP Memory
tags: [Graphiti, MCP, Knowledge Graph]
---

# Graphiti MCP Memory

Graphiti は時間変化を扱う Knowledge Graph で、MCP サーバーと組み合わせられる。

MCP サーバーは Knowledge Graph を検索し、Graphiti に新しいエピソードを追加する。
`

test('extracts glossary terms from article-level concepts and technical discussion points', () => {
	const terms = extractGlossaryTermsFromMarkdown(sampleBody)
	const labels = terms.map((term) => term.label)

	assert.deepEqual(labels, ['Graphiti', 'MCP', 'Knowledge Graph', 'MCP サーバー'])
	assert.equal(terms.find((term) => term.label === 'MCP')?.slug, 'mcp')
})

test('builds a glossary index with post counts and related terms', () => {
	const index = buildGlossaryIndex([
		{
			id: 'graphiti-mcp-memory',
			data: {
				title: 'Graphiti MCP Memory',
				description: 'Graphiti と MCP の関係',
				category: 'ai-systems',
				tags: ['Graphiti', 'MCP', 'Knowledge Graph']
			},
			body: sampleBody
		}
	])

	const mcp = index.terms.find((term) => term.slug === 'mcp')
	assert.equal(mcp?.postCount, 1)
	assert.match(mcp?.explanation ?? '', /Graphiti と MCP の関係/)
	assert.equal(mcp?.wikipediaSearchQuery, 'MCP')
	assert.equal(mcp?.wikipediaUrl, 'https://ja.wikipedia.org/wiki/Special:Search?search=MCP')
	assert.deepEqual(
		mcp?.contexts.slice(0, 1).map((context) => context.postId),
		['graphiti-mcp-memory']
	)
	assert.match(mcp?.contexts[0]?.excerpt ?? '', /MCP/)
	assert.deepEqual(
		mcp?.relatedTerms.slice(0, 2).map((term) => term.label),
		['Graphiti', 'Knowledge Graph']
	)
})

test('groups glossary terms by article category order', () => {
	const index = buildGlossaryIndex([
		{
			id: 'graphiti-mcp-memory',
			data: {
				title: 'Graphiti MCP Memory',
				description: 'Graphiti と MCP の関係',
				category: 'ai-systems',
				tags: ['Graphiti', 'MCP', 'Knowledge Graph']
			},
			body: sampleBody
		},
		{
			id: 'ontology-concept',
			data: {
				title: 'Ontology Concept',
				description: 'Ontology と Knowledge Graph の関係',
				category: 'knowledge-systems',
				tags: ['Ontology', 'Knowledge Graph']
			},
			body: `---
title: Ontology Concept
tags: [Ontology, Knowledge Graph]
---

Ontology は Knowledge Graph の概念設計に関わる。
`
		}
	])

	const groups = groupGlossaryTermsByCategory(index.terms, ['knowledge-systems', 'ai-systems'])

	assert.deepEqual(
		groups.map((group) => group.category),
		['knowledge-systems', 'ai-systems']
	)
	assert.deepEqual(
		groups.find((group) => group.category === 'knowledge-systems')?.terms.map((term) => term.label),
		['Knowledge Graph', 'Ontology']
	)
	assert.deepEqual(
		groups.find((group) => group.category === 'ai-systems')?.terms.map((term) => term.label),
		['Knowledge Graph', 'Graphiti', 'MCP', 'MCP サーバー']
	)
})

test('creates Wikipedia API URLs for external glossary context', () => {
	assert.equal(
		createWikipediaSearchApiUrl('MCP'),
		'https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=MCP&format=json&origin=*&srlimit=5'
	)
	assert.equal(
		createWikipediaSearchApiUrl('MCP', 'en', 3),
		'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=MCP&format=json&origin=*&srlimit=3'
	)
	assert.equal(
		createWikipediaSummaryApiUrl('Model Context Protocol', 'en'),
		'https://en.wikipedia.org/api/rest_v1/page/summary/Model%20Context%20Protocol?redirect=true'
	)
})

test('builds context-aware Wikipedia search queries and validation keywords', () => {
	const term = {
		label: 'Ontology',
		posts: [
			{
				id: 'ontology-concept',
				title: 'Ontology and Knowledge Graph',
				description: 'Semantic Web and knowledge representation.',
				category: 'knowledge-systems'
			}
		],
		relatedTerms: [
			{ label: 'RDF', slug: 'rdf', weight: 2 },
			{ label: 'OWL', slug: 'owl', weight: 2 }
		]
	}

	assert.equal(createWikipediaSearchQuery(term, 'en'), 'Ontology')
	assert.deepEqual(createWikipediaValidationKeywords(term, 'en').slice(0, 4), [
		'knowledge representation',
		'semantic web',
		'ontology',
		'knowledge graph'
	])
	assert.deepEqual(createWikipediaValidationKeywords(term, 'ja').slice(0, 4), [
		'知識表現',
		'セマンティックウェブ',
		'オントロジー',
		'ナレッジグラフ'
	])
})

test('builds English glossary explanations from English article context', () => {
	const index = buildGlossaryIndex(
		[
			{
				id: 'en/graphiti-mcp-memory',
				data: {
					title: 'Graphiti and MCP Memory',
					description: 'A practical report on Graphiti and MCP for agent memory.',
					category: 'ai-systems',
					tags: ['Graphiti', 'MCP', 'Knowledge Graph']
				},
				body: sampleBody
			}
		],
		'en'
	)

	const mcp = index.terms.find((term) => term.slug === 'mcp')
	assert.match(mcp?.explanation ?? '', /appears in "Graphiti and MCP Memory"/)
	assert.match(mcp?.explanation ?? '', /A practical report/)
	assert.equal(mcp?.wikipediaUrl, 'https://en.wikipedia.org/wiki/Special:Search?search=MCP')
})

test('links only the first plain-text mention for each article term', () => {
	const linked = linkFirstGlossaryMentions(
		'Graphiti と MCP は関連する。Graphiti は追加で説明する。[MCP](https://example.com) は既存リンク。',
		[
			{ label: 'Graphiti', slug: 'graphiti' },
			{ label: 'MCP', slug: 'mcp' }
		]
	)

	assert.equal(
		linked,
		'[Graphiti](/glossary/graphiti/) と [MCP](/glossary/mcp/) は関連する。Graphiti は追加で説明する。[MCP](https://example.com) は既存リンク。'
	)
})

test('filters sentence-like headings and source filenames from glossary terms', () => {
	const terms = extractGlossaryTermsFromMarkdown(`
# Google I/O 2026はAIを製品群の中心に据え直した

## 参考情報
## まだ避けるべきケース
## FFM-Iran-Update-13-September-2024.pdf
## MCP仕様

MCP仕様 と Knowledge Graph を比較する。
`)
	const labels = terms.map((term) => term.label)

	assert.ok(!labels.includes('Google I/O 2026はAIを製品群の中心に据え直した'))
	assert.ok(!labels.includes('参考情報'))
	assert.ok(!labels.includes('まだ避けるべきケース'))
	assert.ok(!labels.includes('FFM-Iran-Update-13-September-2024.pdf'))
	assert.ok(labels.includes('MCP仕様'))
	assert.ok(labels.includes('Knowledge Graph'))
})

test('keeps glossary extraction focused on salient concepts instead of incidental names', () => {
	const terms = extractGlossaryTermsFromMarkdown(`
---
title: Daily Trends 2026-05-25
tags: [OpenAI, NVIDIA, AIインフラ]
---

# Daily Trends 2026-05-25

## 政治
## 経済
## 技術

OpenAI は SDK と API を更新し、AIインフラの運用論点を押し上げた。
NVIDIA は Vera CPU と GPU の供給計画を示し、AIインフラの制約を議論した。
GOV.UK と U.S. Bureau of Labor Statistics は CPI と PPI を更新した。
WH47-Social-Share-Card.jpg は出典カード画像である。
`)
	const labels = terms.map((term) => term.label)

	assert.deepEqual(labels.slice(0, 5), ['OpenAI', 'NVIDIA', 'AIインフラ', 'SDK', 'Vera CPU'])
	assert.ok(!labels.includes('政治'))
	assert.ok(!labels.includes('経済'))
	assert.ok(!labels.includes('技術'))
	assert.ok(!labels.includes('Daily Trends 2026-05-25'))
	assert.ok(!labels.includes('WH47-Social-Share-Card.jpg'))
	assert.ok(!labels.includes('U.S. Bureau'))
	assert.ok(terms.length <= 8)
})
