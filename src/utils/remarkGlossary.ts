import { extractGlossaryTermsFromMarkdown, type GlossaryTerm } from './glossary'

const SKIP_TYPES = new Set([
	'code',
	'inlineCode',
	'link',
	'linkReference',
	'definition',
	'html',
	'mdxJsxFlowElement',
	'mdxJsxTextElement',
	'mdxFlowExpression',
	'mdxTextExpression',
	'mdxjsEsm'
])

const basePath = (process.env.ASTRO_BASE ?? '/').replace(/\/$/, '')

const getSourceLocale = (file: any) => {
	const filePath = String(file.path ?? file.history?.[0] ?? '')
	return /(?:^|[/\\])content[/\\]blog[/\\]en[/\\]/.test(filePath) ? 'en' : 'ja'
}

const glossaryHref = (slug: string, locale: 'ja' | 'en') =>
	`${basePath}${locale === 'en' ? '/en' : ''}/glossary/${encodeURIComponent(slug)}/`

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

const linkTextNode = (
	node: any,
	terms: GlossaryTerm[],
	linkedSlugs: Set<string>,
	locale: 'ja' | 'en'
) => {
	const text = node.value as string
	let bestMatch: { term: GlossaryTerm; index: number } | null = null

	for (const term of terms) {
		if (linkedSlugs.has(term.slug)) continue
		const index = findTermIndex(text, term.label)
		if (index < 0) continue
		if (
			!bestMatch ||
			index < bestMatch.index ||
			(index === bestMatch.index && term.label.length > bestMatch.term.label.length)
		) {
			bestMatch = { term, index }
		}
	}

	if (!bestMatch) return [node]

	const { term, index } = bestMatch
	const before = text.slice(0, index)
	const mention = text.slice(index, index + term.label.length)
	const after = text.slice(index + term.label.length)
	linkedSlugs.add(term.slug)

	const replacement = []
	if (before) replacement.push({ type: 'text', value: before })
	replacement.push({
		type: 'link',
		url: glossaryHref(term.slug, locale),
		title: null,
		data: { hProperties: { className: ['glossary-term-link'] } },
		children: [{ type: 'text', value: mention }]
	})
	if (after) {
		for (const child of linkTextNode({ type: 'text', value: after }, terms, linkedSlugs, locale)) {
			replacement.push(child)
		}
	}

	return replacement
}

const transformChildren = (
	node: any,
	terms: GlossaryTerm[],
	linkedSlugs: Set<string>,
	locale: 'ja' | 'en'
) => {
	if (!node || !Array.isArray(node.children)) return

	const nextChildren = []
	for (const child of node.children) {
		if (SKIP_TYPES.has(child.type)) {
			nextChildren.push(child)
			continue
		}
		if (child.type === 'text') {
			nextChildren.push(...linkTextNode(child, terms, linkedSlugs, locale))
			continue
		}
		transformChildren(child, terms, linkedSlugs, locale)
		nextChildren.push(child)
	}
	node.children = nextChildren
}

export function remarkGlossary() {
	return function (tree: any, file: any) {
		const source = String(file.value ?? '')
		const terms = extractGlossaryTermsFromMarkdown(source)
		const locale = getSourceLocale(file)
		file.data.astro.frontmatter.glossaryTerms = terms
		transformChildren(
			tree,
			[...terms].sort((a, b) => b.label.length - a.label.length),
			new Set(),
			locale
		)
	}
}
