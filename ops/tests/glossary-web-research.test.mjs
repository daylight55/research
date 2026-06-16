import { execFileSync } from 'node:child_process'
import { strict as assert } from 'node:assert'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { test } from 'node:test'

import {
	createCandidateMarkdown,
	selectGlossaryResearchCandidates
} from '../scripts/select-glossary-candidates.mjs'
import {
	buildGlossaryResearchQueries,
	createManualSearchUrls,
	createProfileDraftPrompt,
	searchWithBrave,
	searchWithTavily
} from '../scripts/research-glossary-term.mjs'

test('buildGlossaryResearchQueries includes term, context, official sources, and Wikipedia check', () => {
	const queries = buildGlossaryResearchQueries({
		category: 'ai-systems',
		locale: 'ja',
		related: ['Knowledge Graph', 'OAuth'],
		term: 'MCP'
	})

	assert.equal(queries.length, 3)
	assert.match(queries[0], /"MCP"/)
	assert.match(queries[0], /official documentation/)
	assert.match(queries[1], /Knowledge Graph/)
	assert.match(queries[2], /official site standard paper reference/)
	assert.match(queries[2], /Wikipedia/)
})

test('createManualSearchUrls points unresolved terms to web search', () => {
	const urls = createManualSearchUrls(['"MCP" definition official documentation'])

	assert.deepEqual(urls, [
		{
			query: '"MCP" definition official documentation',
			url: 'https://search.brave.com/search?q=%22MCP%22%20definition%20official%20documentation'
		}
	])
})

test('searchWithBrave calls the official web search endpoint shape', async () => {
	const calls = []
	const results = await searchWithBrave({
		apiKey: 'test-key',
		query: 'MCP definition',
		fetchImpl: async (url, options) => {
			calls.push({ url: String(url), options })
			return {
				ok: true,
				json: async () => ({
					web: {
						results: [
							{
								title: 'Model Context Protocol',
								url: 'https://modelcontextprotocol.io/',
								description: 'Open protocol for context.'
							}
						]
					}
				})
			}
		}
	})

	assert.match(calls[0].url, /^https:\/\/api\.search\.brave\.com\/res\/v1\/web\/search/)
	assert.equal(calls[0].options.headers['X-Subscription-Token'], 'test-key')
	assert.deepEqual(results, [
		{
			title: 'Model Context Protocol',
			url: 'https://modelcontextprotocol.io/',
			snippet: 'Open protocol for context.',
			source: 'brave'
		}
	])
})

test('searchWithTavily calls the search endpoint with a basic web query payload', async () => {
	const calls = []
	const results = await searchWithTavily({
		apiKey: 'test-key',
		query: 'MCP definition',
		fetchImpl: async (url, options) => {
			calls.push({ url: String(url), options })
			return {
				ok: true,
				json: async () => ({
					results: [
						{
							title: 'Model Context Protocol',
							url: 'https://modelcontextprotocol.io/',
							content: 'Open protocol for context.'
						}
					]
				})
			}
		}
	})

	assert.equal(calls[0].url, 'https://api.tavily.com/search')
	assert.equal(calls[0].options.headers.Authorization, 'Bearer test-key')
	assert.deepEqual(JSON.parse(calls[0].options.body), {
		include_answer: false,
		include_raw_content: false,
		max_results: 5,
		query: 'MCP definition',
		search_depth: 'basic'
	})
	assert.deepEqual(results, [
		{
			title: 'Model Context Protocol',
			url: 'https://modelcontextprotocol.io/',
			snippet: 'Open protocol for context.',
			source: 'tavily'
		}
	])
})

test('profile draft prompt forbids site-internal usage definitions', () => {
	const prompt = createProfileDraftPrompt({
		args: {
			category: 'ai-systems',
			locale: 'ja',
			related: ['Knowledge Graph'],
			term: 'MCP'
		},
		manualSearchUrls: createManualSearchUrls(['"MCP" definition official documentation']),
		results: [
			{
				title: 'Model Context Protocol',
				url: 'https://modelcontextprotocol.io/',
				snippet: 'Open protocol for context.',
				source: 'brave'
			}
		],
		wikipediaSummary: null
	})

	assert.match(prompt, /source-backed glossary research profile/)
	assert.match(
		prompt,
		/Prefer official sites, standards, papers, or authoritative references over Wikipedia/
	)
	assert.match(prompt, /Do not describe how the term is used inside this site/)
})

test('glossary research script can emit manual web-search prompts without API keys', () => {
	const output = execFileSync(
		'node',
		['ops/scripts/research-glossary-term.mjs', '--term', 'MCP', '--locale', 'ja', '--dry-run'],
		{ encoding: 'utf8' }
	)
	const payload = JSON.parse(output)

	assert.equal(payload.provider, 'manual')
	assert.equal(payload.term, 'MCP')
	assert.ok(payload.manualSearchUrls[0].url.startsWith('https://search.brave.com/search?q='))
	assert.match(payload.prompt, /Search evidence/)
})

test('selectGlossaryResearchCandidates prioritizes unresolved source-backed concepts', () => {
	const records = [
		{
			category: 'philosophy-knowledge',
			contentType: 'report',
			file: 'articles/report/sample/ja/index.mdx',
			id: 'report/sample',
			markdown: `---
title: "実践的推論とアブダクション"
category: "philosophy-knowledge"
tags: ["Abduction", "Practical Inference", "Knowledge Graph"]
---

## Abduction

Abduction is discussed as a niche inference concept. Abduction differs from deduction.

## Practical Inference

Practical Inference is the article's central argument. Practical Inference connects action and judgment.`,
			tags: ['Abduction', 'Practical Inference', 'Knowledge Graph'],
			title: '実践的推論とアブダクション'
		}
	]

	const candidates = selectGlossaryResearchCandidates(records, { maxTerms: 5, minScore: 1 })
	const labels = candidates.map((candidate) => candidate.label)

	assert.ok(labels.includes('Abduction'))
	assert.ok(labels.includes('Practical Inference'))
	assert.ok(!labels.includes('Knowledge Graph'))
	assert.ok(candidates.every((candidate) => candidate.score >= 1))
})

test('createCandidateMarkdown summarizes the cost cap and selected terms', () => {
	const markdown = createCandidateMarkdown({
		articleCount: 12,
		candidates: [
			{
				articleCount: 2,
				category: 'geopolitics',
				label: 'Axis of Resistance',
				related: ['Sanctions'],
				score: 21,
				slug: 'axis-of-resistance'
			}
		],
		maxTerms: 3,
		minScore: 9
	})

	assert.match(markdown, /Cost cap: 3 term\(s\), 9 minimum score/)
	assert.match(markdown, /## Axis of Resistance/)
	assert.match(markdown, /related: Sanctions/)
})

test('glossary candidate script writes JSON and Markdown artifacts', () => {
	const dir = mkdtempSync(join(tmpdir(), 'glossary-candidates-'))
	const articleDir = join(dir, 'articles', 'report', 'sample', 'ja')
	const out = join(dir, 'candidates.json')
	const markdownOut = join(dir, 'candidates.md')

	try {
		mkdirSync(articleDir, { recursive: true })
		writeFileSync(
			join(articleDir, 'index.mdx'),
			`---
title: "周縁的安全保障概念"
category: "geopolitics"
tags: ["Strategic Culture"]
---

## Strategic Culture

Strategic Culture is the main concept. Strategic Culture shapes threat perception.`
		)

		execFileSync(
			'node',
			[
				'--experimental-strip-types',
				'ops/scripts/select-glossary-candidates.mjs',
				'--articles-dir',
				join(dir, 'articles'),
				'--max-terms',
				'2',
				'--min-score',
				'1',
				'--out',
				out,
				'--markdown-out',
				markdownOut
			],
			{ encoding: 'utf8' }
		)

		const payload = JSON.parse(readFileSync(out, 'utf8'))
		assert.equal(payload.articleCount, 1)
		assert.equal(payload.candidates[0].label, 'Strategic Culture')
		assert.match(readFileSync(markdownOut, 'utf8'), /Strategic Culture/)
	} finally {
		rmSync(dir, { force: true, recursive: true })
	}
})

test('glossary maintenance workflow is scheduled and cost-capped outside normal build CI', () => {
	const workflow = readFileSync('.github/workflows/glossary-maintenance.yml', 'utf8')

	assert.match(workflow, /cron: "0 18 \*\/3 \* \*"/)
	assert.match(workflow, /MAX_TERMS: \$\{\{ github\.event\.inputs\.max_terms \|\| '3' \}\}/)
	assert.match(
		workflow,
		/MAX_RESULTS_PER_QUERY: \$\{\{ github\.event\.inputs\.max_results_per_query \|\| '3' \}\}/
	)
	assert.match(workflow, /actions\/upload-artifact@v4/)
	assert.doesNotMatch(workflow, /pnpm build/)
})
