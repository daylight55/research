import { existsSync, readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'

function loadDotEnv(file = '.env') {
	if (!existsSync(file)) return

	for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) continue

		const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
		if (!match) continue

		const [, key, rawValue] = match
		if (process.env[key]) continue

		process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, '')
	}
}

loadDotEnv()

const BRAVE_SEARCH_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search'
const TAVILY_SEARCH_ENDPOINT = 'https://api.tavily.com/search'

export function parseArgs(argv) {
	const args = {
		category: '',
		dryRun: false,
		locale: 'ja',
		maxResults: 5,
		out: '',
		provider: 'auto',
		related: [],
		term: '',
		wikipediaTitle: ''
	}

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index]
		const next = argv[index + 1]

		if (arg === '--dry-run') {
			args.dryRun = true
			continue
		}
		if (arg === '--term' && next) {
			args.term = next
			index += 1
			continue
		}
		if (arg === '--locale' && next) {
			args.locale = next === 'en' ? 'en' : 'ja'
			index += 1
			continue
		}
		if (arg === '--category' && next) {
			args.category = next
			index += 1
			continue
		}
		if (arg === '--provider' && next) {
			args.provider = next
			index += 1
			continue
		}
		if (arg === '--related' && next) {
			args.related = next
				.split(',')
				.map((value) => value.trim())
				.filter(Boolean)
			index += 1
			continue
		}
		if (arg === '--wikipedia-title' && next) {
			args.wikipediaTitle = next
			index += 1
			continue
		}
		if (arg === '--max-results' && next) {
			args.maxResults = Math.max(1, Number(next) || args.maxResults)
			index += 1
			continue
		}
		if (arg === '--out' && next) {
			args.out = next
			index += 1
		}
	}

	if (!args.term) {
		throw new Error('Usage: pnpm glossary:research -- --term "MCP" [--locale ja|en]')
	}

	return args
}

export function buildGlossaryResearchQueries({ category = '', locale = 'ja', related = [], term }) {
	const quoted = `"${term}"`
	const context = [category, ...related].filter(Boolean).join(' ')
	const languageHint = locale === 'en' ? 'English sources' : 'Japanese explanation English primary sources'

	return [
		`${quoted} definition ${context} official documentation`.trim(),
		`${quoted} ${context} overview ${languageHint}`.trim(),
		`${quoted} Wikipedia ${context}`.trim()
	]
}

export function createManualSearchUrls(queries) {
	return queries.map((query) => ({
		query,
		url: `https://search.brave.com/search?q=${encodeURIComponent(query)}`
	}))
}

function normalizeBraveResults(payload, limit) {
	return (payload?.web?.results ?? []).slice(0, limit).map((result) => ({
		title: result.title ?? '',
		url: result.url ?? '',
		snippet: result.description ?? '',
		source: 'brave'
	}))
}

function normalizeTavilyResults(payload, limit) {
	return (payload?.results ?? []).slice(0, limit).map((result) => ({
		title: result.title ?? '',
		url: result.url ?? '',
		snippet: result.content ?? '',
		source: 'tavily'
	}))
}

export async function searchWithBrave({ apiKey, fetchImpl = fetch, limit = 5, query }) {
	const url = new URL(BRAVE_SEARCH_ENDPOINT)
	url.searchParams.set('q', query)
	url.searchParams.set('count', String(limit))
	url.searchParams.set('text_decorations', 'false')

	const response = await fetchImpl(url, {
		headers: {
			Accept: 'application/json',
			'Accept-Encoding': 'gzip',
			'X-Subscription-Token': apiKey
		}
	})

	if (!response.ok) {
		throw new Error(`Brave Search API failed: ${response.status} ${response.statusText}`)
	}

	return normalizeBraveResults(await response.json(), limit)
}

export async function searchWithTavily({ apiKey, fetchImpl = fetch, limit = 5, query }) {
	const response = await fetchImpl(TAVILY_SEARCH_ENDPOINT, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			include_answer: false,
			include_raw_content: false,
			max_results: limit,
			query,
			search_depth: 'basic'
		})
	})

	if (!response.ok) {
		throw new Error(`Tavily Search API failed: ${response.status} ${response.statusText}`)
	}

	return normalizeTavilyResults(await response.json(), limit)
}

async function fetchWikipediaSummary({ fetchImpl = fetch, locale, title }) {
	if (!title) return null

	const response = await fetchImpl(
		`https://${locale}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`
	)
	if (!response.ok) return null

	const payload = await response.json()
	return {
		extract: payload.extract ?? '',
		title: payload.title ?? title,
		url: payload.content_urls?.desktop?.page ?? ''
	}
}

function uniqueResults(results) {
	const seen = new Set()
	const unique = []

	for (const result of results) {
		if (!result.url || seen.has(result.url)) continue
		seen.add(result.url)
		unique.push(result)
	}

	return unique
}

export function createProfileDraftPrompt({ args, manualSearchUrls, results, wikipediaSummary }) {
	const sourceLines = results
		.map(
			(result, index) =>
				`${index + 1}. ${result.title}\n   ${result.url}\n   ${result.snippet}`.trimEnd()
		)
		.join('\n')
	const manualLines = manualSearchUrls.map((entry) => `- ${entry.query}: ${entry.url}`).join('\n')
	const wikipediaBlock = wikipediaSummary
		? `\nWikipedia candidate:\n- ${wikipediaSummary.title}: ${wikipediaSummary.url}\n  ${wikipediaSummary.extract}`
		: ''

	return `Create a source-backed glossary research profile for "${args.term}".

Locale: ${args.locale}
Category hint: ${args.category || 'none'}
Related concepts: ${args.related.join(', ') || 'none'}

Use the web search evidence below to write:
- definition
- background
- conceptual position
- distinctions from ambiguous meanings
- sources
- Wikipedia verification status. If the Wikipedia candidate is not a good conceptual match, set status to unverified.

Do not describe how the term is used inside this site.

Search queries:
${manualLines}
${wikipediaBlock}

Search evidence:
${sourceLines || '- No API search results were fetched. Use the search queries above before writing the profile.'}
`
}

async function collectSearchResults(args) {
	const queries = buildGlossaryResearchQueries(args)
	const manualSearchUrls = createManualSearchUrls(queries)
	const braveKey = process.env.BRAVE_SEARCH_API_KEY
	const tavilyKey = process.env.TAVILY_API_KEY
	const provider =
		args.provider === 'auto'
			? braveKey
				? 'brave'
				: tavilyKey
					? 'tavily'
					: 'manual'
			: args.provider

	if (args.dryRun || provider === 'manual') {
		return { manualSearchUrls, provider: 'manual', queries, results: [] }
	}

	const results = []
	for (const query of queries) {
		const nextResults =
			provider === 'brave'
				? await searchWithBrave({ apiKey: braveKey, limit: args.maxResults, query })
				: await searchWithTavily({ apiKey: tavilyKey, limit: args.maxResults, query })
		results.push(...nextResults)
	}

	return {
		manualSearchUrls,
		provider,
		queries,
		results: uniqueResults(results).slice(0, args.maxResults * queries.length)
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2))
	const collected = await collectSearchResults(args)
	const wikipediaSummary = await fetchWikipediaSummary({
		locale: args.locale,
		title: args.wikipediaTitle
	})
	const prompt = createProfileDraftPrompt({
		args,
		manualSearchUrls: collected.manualSearchUrls,
		results: collected.results,
		wikipediaSummary
	})
	const output = {
		provider: collected.provider,
		term: args.term,
		locale: args.locale,
		category: args.category,
		related: args.related,
		manualSearchUrls: collected.manualSearchUrls,
		results: collected.results,
		wikipediaSummary,
		prompt
	}
	const serialized = `${JSON.stringify(output, null, 2)}\n`

	if (args.out) {
		await writeFile(args.out, serialized)
		return
	}

	process.stdout.write(serialized)
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error(error.message)
		process.exitCode = 1
	})
}
