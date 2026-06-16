import assert from 'node:assert/strict'
import test from 'node:test'

import {
	buildGlossaryIndex,
	createWikipediaSearchApiUrl,
	createWikipediaSearchQuery,
	createWikipediaSummaryApiUrl,
	createWikipediaValidationKeywords,
	extractGlossaryTermsFromMarkdown,
	getWikipediaLocaleForLabel,
	groupGlossaryTermsByCategory,
	linkFirstGlossaryMentions,
	selectExternalReference
} from '../src/utils/glossary.ts'
import { GLOSSARY_RESEARCH_PROFILES } from '../src/data/glossaryResearch.ts'
import { remarkGlossary } from '../src/utils/remarkGlossary.ts'

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

	assert.deepEqual(labels, ['Graphiti', 'MCP', 'Knowledge Graph', 'MCPサーバー'])
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
				heroImage: { src: '/graphiti.jpg', width: 1200, height: 675, format: 'jpg' },
				heroImageAlt: 'Graphiti knowledge graph',
				tags: ['Graphiti', 'MCP', 'Knowledge Graph']
			},
			body: sampleBody
		}
	])

	const mcp = index.terms.find((term) => term.slug === 'mcp')
	assert.equal(mcp?.postCount, 1)
	assert.match(mcp?.explanation ?? '', /Graphiti と MCP の関係/)
	assert.equal(mcp?.image?.src, '/graphiti.jpg')
	assert.equal(mcp?.imageAlt, 'Graphiti knowledge graph')
	assert.equal(mcp?.imageSourceTitle, 'Graphiti MCP Memory')
	assert.equal(mcp?.wikipediaLocale, 'en')
	assert.equal(mcp?.wikipediaSearchQuery, 'Model Context Protocol')
	assert.equal(
		mcp?.wikipediaUrl,
		'https://en.wikipedia.org/wiki/Model_Context_Protocol'
	)
	assert.equal(mcp?.externalReference?.url, 'https://modelcontextprotocol.io/specification/')
	assert.equal(mcp?.externalReference?.kind, 'official')
	assert.equal(mcp?.researchProfile.wikipedia.status, 'verified')
	assert.match(mcp?.researchProfile.definition ?? '', /MCP/)
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

test('builds glossary entries across article support pages', () => {
	const index = buildGlossaryIndex([
		{
			id: 'report/graphiti-mcp-memory/ja/index',
			data: {
				title: 'Graphiti MCP Memory',
				description: 'Graphiti と MCP の関係',
				category: 'ai-systems',
				contentType: 'report',
				tags: ['Graphiti', 'MCP'],
				glossaryPageKind: 'article',
				glossaryPageUrl: '/reports/graphiti-mcp-memory/'
			},
			body: sampleBody
		},
		{
			id: 'report/graphiti-mcp-memory/ja/source-notes',
			data: {
				title: 'Graphiti MCP Memory source notes',
				description: 'Graphiti と MCP の調査素材',
				category: 'ai-systems',
				contentType: 'report',
				tags: ['Graphiti', 'MCP'],
				glossaryPageKind: 'sources',
				glossaryPageUrl: '/reports/graphiti-mcp-memory/sources/'
			},
			body: `# MCP source notes

MCP specification and Graphiti documentation are checked as source material.
`
		}
	])

	const mcp = index.terms.find((term) => term.slug === 'mcp')
	assert.equal(mcp?.postCount, 2)
	assert.deepEqual(
		mcp?.posts.map((post) => post.url),
		['/reports/graphiti-mcp-memory/', '/reports/graphiti-mcp-memory/sources/']
	)
	assert.deepEqual(
		mcp?.contexts.map((context) => context.url),
		['/reports/graphiti-mcp-memory/', '/reports/graphiti-mcp-memory/sources/']
	)
})

test('builds glossary terms from Astro post data when body omits frontmatter', () => {
	const index = buildGlossaryIndex([
		{
			id: 'daily-trends',
			data: {
				title: 'Daily Trends',
				description: 'A news digest.',
				category: 'tech-news',
				contentType: 'news',
				tags: ['news', 'politics', 'economy', 'technology']
			},
			body: `
# Daily Trends

Google, Microsoft, Gemini, SDK, GPU, OPEC, and FRB appear in a news digest body.
`
		},
		{
			id: 'graphiti-mcp-memory',
			data: {
				title: 'Graphiti MCP Memory',
				description: 'Graphiti と MCP の関係',
				category: 'ai-systems',
				tags: ['Graphiti', 'MCP', 'Knowledge Graph']
			},
			body: `
# Graphiti MCP Memory

Graphiti は Knowledge Graph と MCP の実装論点を扱う。
`
		}
	])

	assert.deepEqual(
		index.terms.map((term) => term.label),
		['Graphiti', 'Knowledge Graph', 'MCP']
	)
})

test('keeps source-backed frontmatter concepts with generic words', () => {
	const terms = extractGlossaryTermsFromMarkdown(`---
title: Language Games and LLMs
tags: ['Language Games', 'Philosophy of Language']
---

# Language Games and LLMs
`)

	assert.deepEqual(
		terms.map((term) => term.slug),
		['language-games', 'philosophy-of-language']
	)
})

test('remark glossary uses Astro frontmatter tags for article sidebars', () => {
	const tree = {
		type: 'root',
		children: [
			{
				type: 'paragraph',
				children: [{ type: 'text', value: 'Language Games connect LLM outputs to practice.' }]
			}
		]
	}
	const file = {
		value: '# Language Games and LLMs',
		path: 'articles/report/language-games-intentionality-llm/en/index.mdx',
		data: {
			astro: {
				frontmatter: {
					title: 'Language Games, Intentionality, and LLMs',
					category: 'philosophy-knowledge',
					tags: ['Language Games', 'Philosophy of Language']
				}
			}
		}
	}

	remarkGlossary()(tree, file)

	assert.deepEqual(
		file.data.astro.frontmatter.glossaryTerms.map((term) => term.slug),
		['language-games', 'philosophy-of-language']
	)
	assert.equal(tree.children[0].children[0].url, '/en/glossary/language-games/')
})

test('groups glossary terms by one representative article category', () => {
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
		['Graphiti', 'MCP']
	)
	assert.equal(
		groups.flatMap((group) => group.terms).filter((term) => term.slug === 'knowledge-graph')
			.length,
		1
	)
})

test('chooses the most frequent glossary category before category order', () => {
	const groups = groupGlossaryTermsByCategory(
		[
			{
				label: 'RAG',
				slug: 'rag',
				count: 3,
				postCount: 3,
				posts: [
					{ category: 'knowledge-systems' },
					{ category: 'ai-systems' },
					{ category: 'ai-systems' }
				]
			}
		],
		['knowledge-systems', 'ai-systems']
	)

	assert.deepEqual(
		groups.map((group) => [group.category, group.terms.map((term) => term.label)]),
		[['ai-systems', ['RAG']]]
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

test('selects English Wikipedia for English glossary labels', () => {
	assert.equal(getWikipediaLocaleForLabel('Ontology'), 'en')
	assert.equal(getWikipediaLocaleForLabel('MCP'), 'en')
	assert.equal(getWikipediaLocaleForLabel('Knowledge Graph'), 'en')
	assert.equal(getWikipediaLocaleForLabel('OAuth 2.1'), 'en')
	assert.equal(getWikipediaLocaleForLabel('MCP サーバー'), 'ja')
	assert.equal(getWikipediaLocaleForLabel('オントロジー'), 'ja')
	assert.equal(getWikipediaLocaleForLabel('オントロジー', 'en'), 'ja')
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

	assert.equal(createWikipediaSearchQuery(term, 'en'), 'Ontology (information science)')
	assert.deepEqual(createWikipediaValidationKeywords(term, 'en').slice(0, 4), [
		'information science',
		'knowledge representation',
		'semantic web',
		'ontology'
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
	assert.match(mcp?.explanation ?? '', /appears on "Graphiti and MCP Memory"/)
	assert.match(mcp?.explanation ?? '', /A practical report/)
	assert.equal(
		mcp?.wikipediaUrl,
		'https://en.wikipedia.org/wiki/Model_Context_Protocol'
	)
	assert.equal(mcp?.externalReference?.url, 'https://modelcontextprotocol.io/specification/')
})

test('does not publish glossary entries without source-backed external profiles', () => {
	const index = buildGlossaryIndex([
		{
			id: 'report/ja/temporary-concept',
			data: {
				title: 'Temporary Concept',
				description: 'A local article concept.',
				category: 'ai-systems',
				tags: ['Ephemeral Agent Layer']
			},
			body: `---
title: Temporary Concept
tags: [Ephemeral Agent Layer]
---

Ephemeral Agent Layer はこの記事内でだけ使う概念である。
`
		}
	])

	const term = index.terms.find((candidate) => candidate.slug === 'ephemeral-agent-layer')
	assert.equal(term, undefined)
})

test('keeps standalone glossary definitions independent from site article usage', () => {
	for (const profiles of Object.values(GLOSSARY_RESEARCH_PROFILES)) {
		for (const profile of Object.values(profiles)) {
			assert.doesNotMatch(profile.definition, /このサイト|記事|On this site|article/i)
			assert.doesNotMatch(profile.position, /このサイト|On this site|Within this site/i)
		}
	}
})

test('prefers official or standard sources over Wikipedia for external references', () => {
	const officialFirst = selectExternalReference({
		definition: 'PKCE definition',
		background: 'PKCE background',
		position: 'PKCE position',
		distinctions: [],
		sources: [
			{
				title: 'Wikipedia fallback',
				url: 'https://en.wikipedia.org/wiki/Proof_Key_for_Code_Exchange',
				kind: 'wikipedia'
			},
			{
				title: 'RFC 7636',
				url: 'https://www.rfc-editor.org/rfc/rfc7636',
				kind: 'standard'
			}
		],
		wikipedia: {
			status: 'verified',
			title: 'Proof Key for Code Exchange',
			url: 'https://en.wikipedia.org/wiki/Proof_Key_for_Code_Exchange',
			reason: 'Fallback page.'
		}
	})
	assert.equal(officialFirst?.url, 'https://www.rfc-editor.org/rfc/rfc7636')
	assert.equal(officialFirst?.kind, 'standard')
})

test('does not keep placeholder definitions for unresearched terms', async () => {
	const source = await import('node:fs/promises').then((fs) =>
		fs.readFile(new URL('../src/utils/glossary.ts', import.meta.url), 'utf8')
	)

	assert.doesNotMatch(source, /まだ外部出典にもとづく独立した定義/)
	assert.doesNotMatch(source, /does not yet have a source-backed standalone definition/)
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

## 補足
## まだ避けるべきケース
## FFM-Iran-Update-13-September-2024.pdf
## MCP仕様

MCP仕様 と Knowledge Graph を比較する。Knowledge Graph は中心概念である。

## 参考情報
- Reuters
`)
	const labels = terms.map((term) => term.label)

	assert.ok(!labels.includes('Google I/O 2026はAIを製品群の中心に据え直した'))
	assert.ok(!labels.includes('参考情報'))
	assert.ok(!labels.includes('まだ避けるべきケース'))
	assert.ok(!labels.includes('FFM-Iran-Update-13-September-2024.pdf'))
	assert.ok(!labels.includes('MCP仕様'))
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

	assert.deepEqual(labels.slice(0, 3), ['OpenAI', 'NVIDIA', 'AIインフラ'])
	assert.ok(!labels.includes('SDK'))
	assert.ok(!labels.includes('Vera CPU'))
	assert.ok(!labels.includes('政治'))
	assert.ok(!labels.includes('経済'))
	assert.ok(!labels.includes('技術'))
	assert.ok(!labels.includes('Daily Trends 2026-05-25'))
	assert.ok(!labels.includes('WH47-Social-Share-Card.jpg'))
	assert.ok(!labels.includes('U.S. Bureau'))
	assert.ok(terms.length <= 8)
})

test('normalizes duplicate labels and strips citation source names', () => {
	const terms = extractGlossaryTermsFromMarkdown(`
---
title: Citation Noise
tags: [AI 要約, MCP サーバ, Ludwig Wittgenstein]
---

AI要約 と MCPサーバー は記事の中心概念である。
Wittgenstein は暗黙知の記事の中心人物として扱う。

<SourceNote>Reuters と USIP Iran Primer と Google Books を参照した。</SourceNote>

## 参考情報
- Reuters
- USIP Iran Primer
`)
	const labels = terms.map((term) => term.label)

	assert.deepEqual(labels, ['AI要約', 'MCPサーバー', 'Wittgenstein'])
	assert.ok(!labels.includes('Reuters'))
	assert.ok(!labels.includes('USIP Iran Primer'))
	assert.ok(!labels.includes('Ludwig Wittgenstein'))
	assert.equal(new Set(terms.map((term) => term.slug)).size, terms.length)
})

test('removes source-note organizations and overly granular body concepts', () => {
	const terms = extractGlossaryTermsFromMarkdown(`
# Kioxia and policy sources

NAND と SSD は記事の中心概念である。NAND と SSD は市場構造の説明でも使う。
HBM と DRAM と BiCS FLASH は細部としてだけ触れる。
GuardianCouncil と ExpertAssembly は見出し断片として混ざった文字列である。

Source note: U.S. Treasury, OFAC, CEC, Zakon Rada, OSCE/ODIHR, Amnesty International, OHCHR, and UNHCR were checked.

NAND と SSD は最後にも議論する。
`)
	const labels = terms.map((term) => term.label)

	assert.ok(labels.includes('NAND'))
	assert.ok(labels.includes('SSD'))
	assert.ok(!labels.includes('HBM'))
	assert.ok(!labels.includes('DRAM'))
	assert.ok(!labels.includes('BiCS FLASH'))
	assert.ok(!labels.includes('GuardianCouncil'))
	assert.ok(!labels.includes('ExpertAssembly'))
	assert.ok(!labels.includes('U.S. Treasury'))
	assert.ok(!labels.includes('OHCHR'))
})

test('does not promote incidental body terms from daily news digests', () => {
	const terms = extractGlossaryTermsFromMarkdown(`
---
title: Daily Trends
contentType: news
tags: [news, politics, economy, technology]
---

Google と NVIDIA と OPEC が同じ日に報じられた。NVIDIA は GPU を更新した。
`)

	assert.deepEqual(terms, [])
})
