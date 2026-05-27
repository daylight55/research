import type { ImageMetadata } from 'astro'
import { getGlossaryResearchProfile } from '../data/glossaryResearch.ts'

type PostLike = {
	id: string
	body?: string
	data: {
		title: string
		description?: string
		category: string
		contentType?: string
		tags?: string[]
		draft?: boolean
		heroImage?: ImageMetadata
		heroImageAlt?: string
	}
}

export type GlossaryTerm = {
	label: string
	slug: string
	count: number
	sources: string[]
}

export type GlossaryPostReference = {
	id: string
	title: string
	description?: string
	category: string
	heroImage?: ImageMetadata
	heroImageAlt?: string
}

export type GlossaryTermContext = {
	postId: string
	postTitle: string
	category: string
	excerpt: string
}

export type GlossaryIndexTerm = {
	label: string
	slug: string
	count: number
	postCount: number
	explanation: string
	image?: ImageMetadata
	imageAlt?: string
	imageSourceTitle?: string
	researchProfile: GlossaryResearchProfile
	wikipediaUrl: string
	wikipediaLocale: WikipediaLocale
	wikipediaSearchQuery: string
	wikipediaValidationKeywords: string[]
	contexts: GlossaryTermContext[]
	posts: GlossaryPostReference[]
	relatedTerms: { label: string; slug: string; weight: number }[]
}

export type GlossaryIndex = {
	terms: GlossaryIndexTerm[]
	bySlug: Map<string, GlossaryIndexTerm>
}

export type GlossaryCategoryGroup = {
	category: string
	terms: GlossaryIndexTerm[]
}

type GlossaryLocale = 'ja' | 'en'
export type WikipediaLocale = 'ja' | 'en'
export type GlossaryResearchSourceKind = 'official' | 'standard' | 'paper' | 'reference' | 'wikipedia'
export type GlossaryWikipediaVerification =
	| {
			status: 'verified'
			title: string
			url: string
			reason: string
	  }
	| {
			status: 'unverified'
			reason: string
	  }
export type GlossaryResearchProfile = {
	definition: string
	background: string
	position: string
	distinctions: string[]
	sources: {
		title: string
		url: string
		kind: GlossaryResearchSourceKind
	}[]
	wikipedia: GlossaryWikipediaVerification
}

const MAX_TERMS_PER_ARTICLE = 5
const MAX_RELATED_TERMS = 12
const MAX_WIKIPEDIA_CONTEXT_KEYWORDS = 8
const ENGLISH_WIKIPEDIA_LABEL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .+#&'():-]*$/

export const hasGlossaryResearchProfile = (slug: string, locale: GlossaryLocale = 'ja') =>
	Boolean(getGlossaryResearchProfile(slug, locale))

const CATEGORY_WIKIPEDIA_CONTEXT_EN: Record<string, string[]> = {
	'ai-systems': [
		'artificial intelligence',
		'machine learning',
		'large language model',
		'knowledge graph',
		'agent'
	],
	'enterprise-ai-platforms': [
		'enterprise software',
		'operational artificial intelligence',
		'Palantir',
		'data platform'
	],
	'developer-tools': ['software', 'protocol', 'authentication', 'API', 'developer tools'],
	'knowledge-systems': ['knowledge representation', 'semantic web', 'ontology', 'knowledge graph'],
	'philosophy-knowledge': ['philosophy', 'knowledge', 'tacit knowledge', 'epistemology'],
	'data-infrastructure': ['database', 'SQL', 'distributed database', 'data infrastructure'],
	'tech-news': ['technology', 'company', 'product', 'industry'],
	'semiconductor-memory': ['semiconductor', 'memory', 'NAND', 'SSD'],
	'macro-finance': ['economics', 'monetary policy', 'inflation', 'finance'],
	geopolitics: ['international relations', 'government', 'war', 'geopolitics'],
	'real-estate': ['real estate', 'housing', 'mortgage', 'property']
}

const CATEGORY_WIKIPEDIA_CONTEXT_JA: Record<string, string[]> = {
	'ai-systems': ['人工知能', '機械学習', '大規模言語モデル', 'ナレッジグラフ', 'エージェント'],
	'enterprise-ai-platforms': ['企業ソフトウェア', '運用AI', 'Palantir', 'データ基盤'],
	'developer-tools': ['ソフトウェア', 'プロトコル', '認証', 'API', '開発者'],
	'knowledge-systems': [
		'知識表現',
		'セマンティックウェブ',
		'オントロジー',
		'ナレッジグラフ',
		'情報科学'
	],
	'philosophy-knowledge': ['哲学', '知識', '暗黙知', '認識論'],
	'data-infrastructure': ['データベース', 'SQL', '分散データベース', 'データ基盤'],
	'tech-news': ['技術', '企業', '製品', '産業'],
	'semiconductor-memory': ['半導体', 'メモリ', 'NAND', 'SSD'],
	'macro-finance': ['経済', '金融政策', 'インフレ', '金融'],
	geopolitics: ['国際関係', '政府', '戦争', '地政学'],
	'real-estate': ['不動産', '住宅', '住宅ローン', '物件']
}

const JAPANESE_TERM_PATTERN =
	/[A-Za-z][A-Za-z0-9.+#-]*(?:[ \t]+[A-Za-z][A-Za-z0-9.+#-]*)?[ \t]*[\p{Script=Han}\p{Script=Katakana}ー]{2,}/gu
const LATIN_TERM_PATTERN =
	/\b(?:[A-Z][A-Za-z0-9.+#-]*|[A-Z]{2,})(?:[ \t]+(?:[A-Z][A-Za-z0-9.+#-]*|[A-Z]{2,})){0,3}\b/g
const HEADING_PATTERN = /^#{1,3}\s+(.+)$/gm
const STOPWORDS = new Set([
	'AI',
	'AI需要',
	'API',
	'AP',
	'Apple Group',
	'Are',
	'Arms Transfer Strategy',
	'AIT',
	'B2B',
	'B2C',
	'BI',
	'Boundary',
	'CBA',
	'CAP',
	'BiCS FLASH',
	'Cognitive Task Analysis',
	'FA',
	'DB',
	'DGBAS',
	'Dell Group',
	'DRAM',
	'Did',
	'Fixed',
	'Garbage',
	'GAAP',
	'GDP',
	'EUMAM',
	'HBM',
	'HBF',
	'HDD',
	'HDD置換',
	'Housing Dispute Resolution Support',
	'ICT',
	'Leave',
	'LR',
	'IMF',
	'HTTP',
	'JATEC',
	'JV',
	'NGO',
	'NVMe SSD',
	'PMI',
	'PC',
	'PRACTICE',
	'PURL',
	'S-1',
	'URL',
	'OK',
	'OHCHR',
	'Web',
	'News',
	'Reports',
	'Reference',
	'Registration',
	'Tags',
	'FAQ',
	'README',
	'Can',
	'Comprehensive',
	'Consider',
	'GPU',
	'KIOXIA Holdings',
	'Kitakami Plant',
	'NSATU',
	'OS',
	'Points',
	'Philosophicus',
	'QLC',
	'Save',
	'Samsung',
	'Sandisk Group',
	'SEP',
	'SK',
	'SK Group',
	'Silence',
	'Smart Devices',
	'Storage',
	'Support',
	'Tacit',
	'US Policy',
	'US',
	'U.S',
	'Ukraine Facility',
	'TAD',
	'Tb',
	'TB',
	'TD',
	'TLC',
	'Toshiba Memory',
	'Toshiba',
	'Unchecked',
	'Water',
	'World Bank',
	'YMTC',
	'Yokkaichi',
	'Executive Summary',
	'Effective situations',
	"Situations where it doesn't work",
	'Cases to be introduced',
	'Cases to still avoid',
	'Google I',
	'参考情報',
	'補足',
	'効く場面',
	'効かない場面',
	'導入すべきケース',
	'まだ避けるべきケース',
	'横断的な見立て',
	'追跡すべき未確定事項',
	'政治',
	'経済',
	'技術',
	'Daily Trends',
	'住宅購入',
	'戸建て'
])

const ENGLISH_STOPWORDS = new Set([
	'a',
	'an',
	'and',
	'as',
	'at',
	'by',
	'for',
	'from',
	'have',
	'how',
	'however',
	'if',
	'in',
	'into',
	'is',
	'it',
	'may',
	'of',
	'on',
	'or',
	'rather',
	'see',
	'source',
	'the',
	'therefore',
	'this',
	'to',
	'what',
	'when',
	'where',
	'why',
	'article',
	'articles',
	'archives',
	'check',
	'claim',
	'experts',
	'first',
	'implications',
	'infrastructure',
	'land',
	'ministry',
	'politics',
	'president',
	'referenced',
	'reference',
	'technology',
	'there',
	'transport',
	'tourism',
	'economy',
	'news',
	'cross-sectional',
	'cross-sectional-view',
	'uncertainty',
	'track',
	'uncertainty-to-track',
	'action',
	'actions',
	'bank',
	'client',
	'cross-cutting-view',
	'checklist',
	'defense',
	'governance',
	'humanitarian',
	'implications',
	'memory',
	'open-items-to-track',
	'philosophy',
	'supremeleader',
	'war',
	'april',
	'march',
	'may'
])

const GLOSSARY_LABEL_ALIASES = new Map([
	['AI 要約', 'AI要約'],
	['MCP サーバ', 'MCPサーバー'],
	['MCP サーバー', 'MCPサーバー'],
	['NANDフラッシュ', 'NAND'],
	['Michael Polanyi', 'Polanyi'],
	['PRC', 'China'],
	['ROC', 'Taiwan'],
	['SECI モデル', 'SECI'],
	['SECIモデル', 'SECI'],
	['SSDs', 'SSD'],
	['Tractatus Logico-Philosophique', 'Tractatus'],
	['Ludwig Wittgenstein', 'Wittgenstein']
])

const SOURCE_OR_REFERENCE_LABEL_PATTERN =
	/\b(?:AAAI|Amnesty International|CEC|CSIS|Google Books|Human Rights Watch|IAEA GOV|Medact|National Tax Agency|Neighborhood Association|NHS England|ODIHR|OFAC|OSCE|PACE|Reuters|Rossiyskaya Gazeta|Source|Stanford Encyclopedia|U\.S\. Treasury|UChicago Press|UNHCR|USIP Iran Primer|Western Digital|Wikipedia|Wikisource|Zakon Rada|Chicago Press|Polanyi Society|Constitute Project)\b/i

const WIKIPEDIA_SEARCH_QUERY_OVERRIDES = new Map([
	['agents', 'Intelligent agent'],
	['ai要約', '自動要約'],
	['aip', 'Palantir Artificial Intelligence Platform'],
	['apollo', 'Palantir Apollo'],
	['boj', 'Bank of Japan'],
	['claude', 'Claude (language model)'],
	['constitution', 'Constitution of Iran'],
	['cpi', 'Consumer price index'],
	['elections', 'Election'],
	['eu', 'European Union'],
	['generative ai', 'Generative AI'],
	['graphiti', 'Zep Graphiti temporal knowledge graph'],
	['human rights', 'Human rights'],
	['irgc', 'Islamic Revolutionary Guard Corps'],
	['jcpoa', 'Iran nuclear deal'],
	['khamenei', 'Ali Khamenei'],
	['khomeini', 'Ruhollah Khomeini'],
	['knowledge graph', 'Knowledge graph'],
	['llm', 'Large language model'],
	['martial law', 'Martial law'],
	['mcp', 'Model Context Protocol'],
	['mcpサーバー', 'Model Context Protocol server'],
	['monetary policy', 'Monetary policy'],
	['mortgage', 'Mortgage'],
	['nand', 'Flash memory'],
	['oauth 2.1', 'OAuth'],
	['ohchr', 'Office of the United Nations High Commissioner for Human Rights'],
	['oidc', 'OpenID'],
	['ontology', 'Ontology (information science)'],
	['owl', 'Web Ontology Language'],
	['pkce', 'Proof Key for Code Exchange'],
	['polanyi', 'Michael Polanyi'],
	['protests', 'Protest'],
	['prc', 'China'],
	['putin', 'Vladimir Putin'],
	['rag', 'Retrieval-augmented generation'],
	['rdf', 'Resource Description Framework'],
	['sanctions', 'Economic sanctions'],
	['seci', 'SECI model'],
	['semantic web', 'Semantic Web'],
	['semiconductors', 'Semiconductor'],
	['ssd', 'Solid-state drive'],
	['tacit knowledge', 'Tacit knowledge'],
	['tractatus', 'Tractatus Logico-Philosophicus'],
	['uk', 'United Kingdom'],
	['un', 'United Nations'],
	['value judgment', 'Value judgment'],
	['wittgenstein', 'Ludwig Wittgenstein'],
	['ycc', 'Yield curve control'],
	['zelensky', 'Volodymyr Zelenskyy'],
	['債券', '債券'],
	['決算', ''],
	['金利政策', '金融政策'],
	['戸建て', '一戸建て'],
	['住宅購入', ''],
	['為替', '外国為替'],
	['物価', '物価'],
	['賃金', '賃金']
])

const WIKIPEDIA_VALIDATION_KEYWORDS_BY_LABEL = new Map([
	['aip', ['Palantir', 'artificial intelligence platform']],
	['graphiti', ['Zep', 'temporal knowledge graph', 'agent memory']],
	['mcp', ['model context protocol', 'anthropic', 'tools']],
	['mcpサーバー', ['model context protocol', 'server', 'tools']],
	['ontology', ['information science', 'knowledge representation', 'semantic web']],
	['rag', ['retrieval', 'generation', 'large language model']],
	['seci', ['knowledge management', 'tacit knowledge', 'explicit knowledge']]
])

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()

const normalizeGlossaryLabel = (label: string) => {
	const normalized = normalizeWhitespace(label.replace(/[`*_#]/g, '')).normalize('NFKC')
	return GLOSSARY_LABEL_ALIASES.get(normalized) ?? normalized
}

export const createGlossarySlug = (label: string) =>
	normalizeWhitespace(label)
		.normalize('NFKC')
		.toLowerCase()
		.replace(/[・/／]+/g, '-')
		.replace(/[^\p{Letter}\p{Number}.+# -]+/gu, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')

const stripFrontmatter = (markdown: string) => markdown.replace(/^\s*---[\s\S]*?---\s*/, '')

const stripExtractionNoise = (markdown: string) =>
	stripFrontmatter(markdown)
		.replace(/<SourceNote\b[\s\S]*?<\/SourceNote>/g, ' ')
		.replace(/\s*(?:Source notes?|出典メモ):[\s\S]*?(?=\n\s*\n|\n#{1,6}\s|$)/gim, ' ')
		.replace(/\n##\s+(?:参考情報|References|Sources|出典)[\s\S]*$/i, ' ')

const stripMarkdownSyntax = (markdown: string) =>
	stripExtractionNoise(markdown)
		.replace(/^import\s+.+$/gm, ' ')
		.replace(/<[/]?[A-Z][\s\S]*?(?:\/>|>)/g, ' ')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/^>\s?/gm, '')
		.replace(/[*_~]/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

const parseInlineYamlList = (value: string) =>
	value
		.replace(/^\[/, '')
		.replace(/\]$/, '')
		.split(',')
		.map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
		.filter(Boolean)

const parseFrontmatterTerms = (markdown: string) => {
	const frontmatter = markdown.match(/^\s*---\n([\s\S]*?)\n---/)?.[1] ?? ''
	const terms: string[] = []
	const inlineTags = frontmatter.match(/^tags:\s*(\[.+\])$/m)?.[1]
	if (inlineTags) {
		terms.push(...parseInlineYamlList(inlineTags))
	} else {
		const tagsBlock = frontmatter.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m)?.[1]
		if (tagsBlock) {
			terms.push(
				...tagsBlock
					.split('\n')
					.map((line) =>
						line
							.trim()
							.replace(/^-\s+/, '')
							.replace(/^['"]|['"]$/g, '')
					)
					.filter(Boolean)
			)
		}
	}

	return terms
}

const getFrontmatterValue = (markdown: string, key: string) => {
	const frontmatter = markdown.match(/^\s*---\n([\s\S]*?)\n---/)?.[1] ?? ''
	return (
		frontmatter
			.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]
			?.trim()
			.replace(/^['"]|['"]$/g, '') ?? ''
	)
}

const shouldKeepTerm = (label: string, source: string) => {
	if (!label || STOPWORDS.has(label)) return false
	if (label.length < 2 || label.length > 48) return false
	if (SOURCE_OR_REFERENCE_LABEL_PATTERN.test(label)) return false
	if (/^[A-Z]\d$/i.test(label)) return false
	if (/^[A-Z]{1,3}-\d+$/i.test(label)) return false
	if (/[A-Z]{2,}\d/.test(label)) return false
	if (/[A-Za-z]\d{3,}/.test(label)) return false
	if (source !== 'frontmatter' && /^[A-Z][a-z]+[A-Z][A-Za-z]+$/.test(label)) return false
	if (/(?:方向|国境地帯|試作)$/.test(label)) return false
	if (/(?:単一セグメント|単体)$/.test(label)) return false
	if (/^(?:AI活用|AI時代|LIM|Logical Philosophy|チェックリスト|決算)$/.test(label)) return false
	const latinWords = label.match(/[A-Za-z][A-Za-z0-9.+#-]*/g) ?? []
	const latinOnly = latinWords.join(' ') === label.replace(/\s+/g, ' ')
	if (latinOnly && latinWords.length > 0) {
		const lowerWords = latinWords.map((word) => word.toLowerCase())
		if (lowerWords.every((word) => ENGLISH_STOPWORDS.has(word))) return false
		if (lowerWords.length <= 3 && ENGLISH_STOPWORDS.has(lowerWords[0])) return false
		if (
			source !== 'frontmatter' &&
			latinWords.length === 1 &&
			!/^[A-Z0-9.+#-]{2,}$/.test(label) &&
			!/[A-Z][a-z0-9.+#-]{2,}/.test(label) &&
			!/[A-Z][a-z0-9.+#-]*[A-Z]/.test(label)
		) {
			return false
		}
	}
	if (/^\d/.test(label)) return false
	if (/^\d{4}[-/年]/.test(label)) return false
	if (/\.(?:pdf|md|htm|html)$/i.test(label)) return false
	if (/[。！？!?]/.test(label)) return false
	if (/\b(?:GitHub|Bureau|Statistics|Card|Share)\b/i.test(label)) return false
	if (/(?:Card|Section|Component|Layout)$/.test(label)) return false
	if (
		source !== 'frontmatter' &&
		/(?:が|を|へ|で|から|まで|より|の).{1,18}(?:始動|加速|拡大|後退|上昇|低下|急増|再編|揺らす|動かす|重なる)$/.test(
			label
		)
	) {
		return false
	}
	if (/(?:する|した|している|している|なった|なっている|続く|示した|固める|入った)$/.test(label)) {
		return false
	}
	if (/[\p{Script=Hiragana}]/u.test(label) && !/[A-Za-z]/.test(label) && label.length > 12) {
		return false
	}
	if (/[\p{Script=Hiragana}]/u.test(label) && /[A-Za-z]/.test(label) && label.length > 24) {
		return false
	}
	return /[\p{Letter}\p{Script=Han}\p{Script=Katakana}\p{Script=Hiragana}]/u.test(label)
}

const scoreTerm = (term: GlossaryTerm) => {
	let score = term.count
	if (term.sources.includes('frontmatter')) score += 100
	if (term.sources.includes('heading')) score += 20
	if (
		/[\p{Script=Han}\p{Script=Katakana}ー]{2,}/u.test(term.label) &&
		/[A-Za-z]/.test(term.label)
	) {
		score += 8
	}
	if (/^[A-Z0-9.+#-]{2,}$/.test(term.label)) score += 6
	if (/^[A-Z][A-Za-z0-9.+#-]+(?:\s+[A-Z][A-Za-z0-9.+#-]+){1,3}$/.test(term.label)) {
		score += 6
	}
	if (term.label.length > 32) score -= 12
	if (
		term.sources.includes('heading') &&
		term.count <= 1 &&
		!term.sources.includes('frontmatter')
	) {
		score -= 24
	}
	return score
}

const shouldPromoteExtractedTerm = (term: GlossaryTerm) => {
	if (term.sources.includes('frontmatter')) return true
	if (term.count >= 3) return true
	if (
		/[\p{Script=Han}\p{Script=Katakana}ー]{2,}/u.test(term.label) &&
		/[A-Za-z]/.test(term.label)
	) {
		return (
			term.count >= 2 && /(サーバー?|基盤|モデル|インフラ|認証|メモリ|記憶|グラフ)/.test(term.label)
		)
	}
	if (/^[A-Z0-9.+#-]{2,}$/.test(term.label)) return term.count >= 2
	if (/^[A-Z][A-Za-z0-9.+#-]+(?:\s+[A-Z][A-Za-z0-9.+#-]+){1,3}$/.test(term.label)) {
		return term.count >= 2
	}
	return false
}

const pushCandidate = (terms: Map<string, GlossaryTerm>, label: string, source: string) => {
	const normalizedLabel = normalizeGlossaryLabel(label)
	if (!shouldKeepTerm(normalizedLabel, source)) return

	const slug = createGlossarySlug(normalizedLabel)
	if (!slug) return

	const existing = terms.get(slug)
	if (existing) {
		existing.count += 1
		if (!existing.sources.includes(source)) existing.sources.push(source)
		return
	}

	terms.set(slug, {
		label: normalizedLabel,
		slug,
		count: 1,
		sources: [source]
	})
}

export function extractGlossaryTermsFromMarkdown(
	markdown: string,
	maxTerms = MAX_TERMS_PER_ARTICLE
) {
	const terms = new Map<string, GlossaryTerm>()
	const body = stripExtractionNoise(markdown)
	const contentType = getFrontmatterValue(markdown, 'contentType')
	const bodyWithoutHeadings = body
		.replace(/^import\s+.+$/gm, ' ')
		.replace(/<[/]?[A-Z][\s\S]*?(?:\/>|>)/g, ' ')
		.replace(HEADING_PATTERN, ' ')

	for (const tag of parseFrontmatterTerms(markdown)) {
		pushCandidate(terms, tag, 'frontmatter')
	}

	if (contentType === 'news') {
		return Array.from(terms.values())
			.filter(shouldPromoteExtractedTerm)
			.sort((a, b) => scoreTerm(b) - scoreTerm(a))
			.slice(0, maxTerms)
	}

	for (const match of body.matchAll(HEADING_PATTERN)) {
		if (!match[0].startsWith('# ')) {
			pushCandidate(terms, match[1], 'heading')
		}
	}

	for (const match of bodyWithoutHeadings.matchAll(JAPANESE_TERM_PATTERN)) {
		pushCandidate(terms, match[0], 'body')
	}

	for (const match of bodyWithoutHeadings.matchAll(LATIN_TERM_PATTERN)) {
		pushCandidate(terms, match[0], 'body')
	}

	return Array.from(terms.values())
		.filter(shouldPromoteExtractedTerm)
		.sort((a, b) => {
			const sourceRank = (term: GlossaryTerm) =>
				term.sources.includes('frontmatter') ? 0 : term.sources.includes('heading') ? 1 : 2
			const rankDifference = sourceRank(a) - sourceRank(b)
			if (rankDifference !== 0) return rankDifference
			if (sourceRank(a) === 0) return 0
			return scoreTerm(b) - scoreTerm(a)
		})
		.slice(0, maxTerms)
}

const isWordChar = (character: string) => /[\p{Letter}\p{Number}_-]/u.test(character)

const findTermIndex = (text: string, label: string) => {
	const haystack = text.toLowerCase()
	const needle = label.toLowerCase()
	let index = haystack.indexOf(needle)

	while (index >= 0) {
		const before = index > 0 ? text[index - 1] : ''
		const after = text[index + label.length] ?? ''
		const needsBoundary = /^[A-Za-z0-9 .+#-]+$/.test(label)
		if (!needsBoundary || ((!before || !isWordChar(before)) && (!after || !isWordChar(after)))) {
			return index
		}
		index = haystack.indexOf(needle, index + needle.length)
	}

	return -1
}

const findMarkdownLinkRanges = (markdown: string) => {
	const ranges: { start: number; end: number }[] = []
	const linkPattern = /\[[^\]]+\]\([^)]+\)/g
	for (const match of markdown.matchAll(linkPattern)) {
		ranges.push({ start: match.index ?? 0, end: (match.index ?? 0) + match[0].length })
	}
	return ranges
}

const isInsideRange = (index: number, ranges: { start: number; end: number }[]) =>
	ranges.some((range) => index >= range.start && index < range.end)

const splitSentences = (text: string) =>
	text
		.split(/(?<=[。！？!?])\s+|\n+/)
		.map(normalizeWhitespace)
		.filter((sentence) => sentence.length >= 12)

const createContextExcerpt = (body: string, label: string) => {
	const text = stripMarkdownSyntax(body)
	const directSentence = splitSentences(text).find(
		(sentence) => findTermIndex(sentence, label) >= 0
	)
	const fallbackIndex = findTermIndex(text, label)
	if (!directSentence && fallbackIndex < 0) return ''

	const excerpt =
		directSentence ??
		text.slice(
			Math.max(0, fallbackIndex - 64),
			Math.min(text.length, fallbackIndex + label.length + 120)
		)
	return excerpt.length > 180 ? `${excerpt.slice(0, 177)}...` : excerpt
}

const createTermExplanation = (term: GlossaryIndexTerm, locale: GlossaryLocale) => {
	const primaryPost = term.posts[0]
	const primaryContext = term.contexts[0]
	if (!primaryPost) {
		return locale === 'en'
			? `${term.label} is a term extracted from articles on this site.`
			: `${term.label} は、このサイトの記事から抽出された用語です。`
	}

	const usage = primaryPost.description || primaryContext?.excerpt
	if (usage) {
		if (locale === 'en') {
			return `${term.label} appears in "${primaryPost.title}" in the context of: "${usage}"`
		}
		return `${term.label} は、記事「${primaryPost.title}」では「${usage}」という文脈で扱われています。`
	}

	if (locale === 'en') {
		return `${term.label} appears in the ${primaryPost.category} article "${primaryPost.title}".`
	}
	return `${term.label} は、${primaryPost.category} カテゴリの記事「${primaryPost.title}」で扱われている用語です。`
}

const uniqueValues = (values: string[]) => {
	const seen = new Set<string>()
	const unique: string[] = []
	for (const value of values.map(normalizeWhitespace).filter(Boolean)) {
		const key = value.toLowerCase()
		if (seen.has(key)) continue
		seen.add(key)
		unique.push(value)
	}
	return unique
}

const getTermCategories = (term: Pick<GlossaryIndexTerm, 'posts'>) =>
	uniqueValues(term.posts.map((post) => post.category))

const getWikipediaCategoryKeywords = (categories: string[], locale: GlossaryLocale) => {
	const contextMap = locale === 'en' ? CATEGORY_WIKIPEDIA_CONTEXT_EN : CATEGORY_WIKIPEDIA_CONTEXT_JA
	return uniqueValues(categories.flatMap((category) => contextMap[category] ?? [category]))
}

const quoteYamlString = (value: string) => JSON.stringify(value)

const createExtractionFrontmatterForPost = (post: PostLike) => {
	const tags = post.data.tags ?? []
	return [
		'---',
		`title: ${quoteYamlString(post.data.title)}`,
		`category: ${quoteYamlString(post.data.category)}`,
		post.data.contentType ? `contentType: ${quoteYamlString(post.data.contentType)}` : '',
		tags.length ? `tags: [${tags.map(quoteYamlString).join(', ')}]` : '',
		'---'
	]
		.filter(Boolean)
		.join('\n')
}

const createExtractionMarkdownForPost = (post: PostLike) => {
	const frontmatter = createExtractionFrontmatterForPost(post)

	return `${frontmatter}\n\n${post.body ?? ''}`
}

const isEnglishWikipediaLabel = (label: string) =>
	ENGLISH_WIKIPEDIA_LABEL_PATTERN.test(normalizeWhitespace(label))

export const getWikipediaLocaleForLabel = (
	label: string,
	locale: GlossaryLocale = 'ja'
): WikipediaLocale => {
	if (locale === 'en' && isEnglishWikipediaLabel(label)) return 'en'
	return isEnglishWikipediaLabel(label) ? 'en' : 'ja'
}

const getTermTitleKeywords = (term: Pick<GlossaryIndexTerm, 'posts'>) =>
	uniqueValues(
		term.posts
			.flatMap((post) => [post.title, post.description ?? ''])
			.flatMap(
				(text) => text.match(/[A-Z][A-Za-z0-9.+#-]{2,}(?:\s+[A-Z][A-Za-z0-9.+#-]{2,}){0,2}/g) ?? []
			)
	)

export const createWikipediaValidationKeywords = (
	term: Pick<GlossaryIndexTerm, 'label' | 'posts' | 'relatedTerms'>,
	locale: WikipediaLocale = 'ja'
) => {
	const labelKeywords =
		locale === 'en'
			? WIKIPEDIA_VALIDATION_KEYWORDS_BY_LABEL.get(normalizeWhitespace(term.label).toLowerCase())
			: undefined
	const categories = getTermCategories(term)
	const categoryKeywords = getWikipediaCategoryKeywords(categories, locale)
	const relatedKeywords = term.relatedTerms.slice(0, 5).map((related) => related.label)
	const titleKeywords = getTermTitleKeywords(term).filter(
		(keyword) => keyword.toLowerCase() !== term.label.toLowerCase()
	)

	return uniqueValues([
		...(labelKeywords ?? []),
		...categoryKeywords,
		...relatedKeywords,
		...titleKeywords
	]).slice(0, MAX_WIKIPEDIA_CONTEXT_KEYWORDS)
}

export const createWikipediaSearchQuery = (
	term: Pick<GlossaryIndexTerm, 'label' | 'posts' | 'relatedTerms'>,
	locale: WikipediaLocale = 'ja'
) => {
	void locale
	const override = WIKIPEDIA_SEARCH_QUERY_OVERRIDES.get(
		normalizeWhitespace(term.label).toLowerCase()
	)
	if (override) return override
	return term.label
}

export const createWikipediaUrl = (label: string, locale: WikipediaLocale = 'ja') => {
	const wikipediaLocale = locale === 'en' ? 'en' : 'ja'
	return `https://${wikipediaLocale}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(label)}`
}

export const createWikipediaSearchApiUrl = (
	label: string,
	locale: WikipediaLocale = 'ja',
	limit = 5
) => {
	const wikipediaLocale = locale === 'en' ? 'en' : 'ja'
	const params = new URLSearchParams({
		action: 'query',
		list: 'search',
		srsearch: label,
		format: 'json',
		origin: '*',
		srlimit: String(limit)
	})
	return `https://${wikipediaLocale}.wikipedia.org/w/api.php?${params.toString()}`
}

export const createWikipediaSummaryApiUrl = (title: string, locale: WikipediaLocale = 'ja') => {
	const wikipediaLocale = locale === 'en' ? 'en' : 'ja'
	return `https://${wikipediaLocale}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`
}

export function linkFirstGlossaryMentions(
	markdown: string,
	terms: Pick<GlossaryTerm, 'label' | 'slug'>[],
	basePath = ''
) {
	let linked = markdown
	const seen = new Set<string>()

	for (const term of [...terms].sort((a, b) => b.label.length - a.label.length)) {
		if (seen.has(term.slug)) continue
		const ranges = findMarkdownLinkRanges(linked)
		let index = findTermIndex(linked, term.label)
		while (index >= 0 && isInsideRange(index, ranges)) {
			const offset = index + term.label.length
			index = findTermIndex(linked.slice(offset), term.label)
			if (index >= 0) index += offset
		}
		if (index < 0) continue

		const mention = linked.slice(index, index + term.label.length)
		const href = `${basePath}/glossary/${encodeURIComponent(term.slug)}/`
		linked = `${linked.slice(0, index)}[${mention}](${href})${linked.slice(index + term.label.length)}`
		seen.add(term.slug)
	}

	return linked
}

export function buildGlossaryIndex(
	posts: PostLike[],
	locale: GlossaryLocale = 'ja'
): GlossaryIndex {
	const bySlug = new Map<string, GlossaryIndexTerm>()
	const cooccurrences = new Map<string, Map<string, number>>()
	const termOrder = new Map<string, number>()

	for (const post of posts.filter((entry) => !entry.data.draft)) {
		const frontmatterTerms = extractGlossaryTermsFromMarkdown(createExtractionFrontmatterForPost(post))
		const maxTerms =
			frontmatterTerms.length >= 3 && post.data.category === 'semiconductor-memory'
				? frontmatterTerms.length
				: MAX_TERMS_PER_ARTICLE
		const extractionMarkdown = createExtractionMarkdownForPost(post)
		const terms = extractGlossaryTermsFromMarkdown(extractionMarkdown, maxTerms).filter((term) =>
			hasGlossaryResearchProfile(term.slug, locale)
		)
		const postRef = {
			id: post.id,
			title: post.data.title,
			description: post.data.description,
			category: post.data.category,
			heroImage: post.data.heroImage,
			heroImageAlt: post.data.heroImageAlt
		}

		for (const term of terms) {
			const contextExcerpt = createContextExcerpt(post.body ?? '', term.label)
			const context = contextExcerpt
				? {
						postId: post.id,
						postTitle: post.data.title,
						category: post.data.category,
						excerpt: contextExcerpt
					}
				: null
			const existing = bySlug.get(term.slug)
			if (existing) {
				existing.count += term.count
				if (!existing.posts.some((candidate) => candidate.id === post.id)) {
					existing.posts.push(postRef)
					existing.postCount += 1
				}
				if (!existing.image && postRef.heroImage) {
					existing.image = postRef.heroImage
					existing.imageAlt = postRef.heroImageAlt
					existing.imageSourceTitle = postRef.title
				}
				if (
					context &&
					!existing.contexts.some(
						(candidate) =>
							candidate.postId === context.postId && candidate.excerpt === context.excerpt
					)
				) {
					existing.contexts.push(context)
				}
			} else {
				termOrder.set(term.slug, termOrder.size)
				const wikipediaLocale = getWikipediaLocaleForLabel(term.label, locale)
				bySlug.set(term.slug, {
					label: term.label,
					slug: term.slug,
					count: term.count,
					postCount: 1,
					explanation: '',
					image: postRef.heroImage,
					imageAlt: postRef.heroImageAlt,
					imageSourceTitle: postRef.heroImage ? postRef.title : undefined,
					wikipediaUrl: createWikipediaUrl(term.label, wikipediaLocale),
					wikipediaLocale,
					wikipediaSearchQuery: term.label,
					wikipediaValidationKeywords: [],
					contexts: context ? [context] : [],
					posts: [postRef],
					relatedTerms: []
				})
			}
		}

		for (const source of terms) {
			const related = cooccurrences.get(source.slug) ?? new Map<string, number>()
			for (const target of terms) {
				if (source.slug === target.slug) continue
				related.set(target.slug, (related.get(target.slug) ?? 0) + 1)
			}
			cooccurrences.set(source.slug, related)
		}
	}

	for (const term of bySlug.values()) {
		term.contexts = term.contexts.slice(0, 6)
		term.explanation = createTermExplanation(term, locale)
		term.relatedTerms = Array.from(cooccurrences.get(term.slug)?.entries() ?? [])
			.map(([slug, weight]) => {
				const related = bySlug.get(slug)
				return related ? { label: related.label, slug: related.slug, weight } : null
			})
			.filter((related): related is { label: string; slug: string; weight: number } =>
				Boolean(related)
			)
			.sort(
				(a, b) =>
					b.weight - a.weight ||
					(termOrder.get(a.slug) ?? 0) - (termOrder.get(b.slug) ?? 0) ||
					a.label.localeCompare(b.label)
			)
			.slice(0, MAX_RELATED_TERMS)
		const researchProfile = getGlossaryResearchProfile(term.slug, locale)
		if (!researchProfile) {
			throw new Error(
				`Glossary term "${term.label}" requires a source-backed research profile before publication.`
			)
		}
		term.researchProfile = researchProfile
		term.wikipediaLocale = getWikipediaLocaleForLabel(term.label, locale)
		term.wikipediaValidationKeywords = createWikipediaValidationKeywords(term, term.wikipediaLocale)
		term.wikipediaSearchQuery = createWikipediaSearchQuery(term, term.wikipediaLocale)
		term.wikipediaUrl =
			term.researchProfile.wikipedia.status === 'verified'
				? term.researchProfile.wikipedia.url
				: ''
	}

	const terms = Array.from(bySlug.values()).sort(
		(a, b) => b.postCount - a.postCount || b.count - a.count || a.label.localeCompare(b.label)
	)

	return { terms, bySlug }
}

export function groupGlossaryTermsByCategory(
	terms: GlossaryIndexTerm[],
	categoryOrder: readonly string[] = []
): GlossaryCategoryGroup[] {
	const categoryRank = new Map(categoryOrder.map((category, index) => [category, index]))
	const groups = new Map<string, GlossaryIndexTerm[]>()

	for (const term of terms) {
		const categories = new Set(term.posts.map((post) => post.category))
		for (const category of categories) {
			const groupTerms = groups.get(category) ?? []
			groupTerms.push(term)
			groups.set(category, groupTerms)
		}
	}

	return Array.from(groups.entries())
		.map(([category, groupTerms]) => ({
			category,
			terms: groupTerms.sort(
				(a, b) => b.postCount - a.postCount || b.count - a.count || a.label.localeCompare(b.label)
			)
		}))
		.sort((a, b) => {
			const rankA = categoryRank.get(a.category) ?? Number.MAX_SAFE_INTEGER
			const rankB = categoryRank.get(b.category) ?? Number.MAX_SAFE_INTEGER
			return rankA - rankB || a.category.localeCompare(b.category)
		})
}
