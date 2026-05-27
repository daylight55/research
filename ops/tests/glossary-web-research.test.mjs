import { execFileSync } from 'node:child_process'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'

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
	assert.match(prompt, /Prefer official sites, standards, papers, or authoritative references over Wikipedia/)
	assert.match(prompt, /Do not describe how the term is used inside this site/)
})

test('glossary research script can emit manual web-search prompts without API keys', () => {
	const output = execFileSync(
		'node',
		[
			'ops/scripts/research-glossary-term.mjs',
			'--term',
			'MCP',
			'--locale',
			'ja',
			'--dry-run'
		],
		{ encoding: 'utf8' }
	)
	const payload = JSON.parse(output)

	assert.equal(payload.provider, 'manual')
	assert.equal(payload.term, 'MCP')
	assert.ok(payload.manualSearchUrls[0].url.startsWith('https://search.brave.com/search?q='))
	assert.match(payload.prompt, /Search evidence/)
})
