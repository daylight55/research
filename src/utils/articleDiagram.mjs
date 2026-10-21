import { parseMermaid, renderMermaidSVG } from 'beautiful-mermaid'

const plainLabel = (label) => label.replace(/<br\s*\/?>|\n/gi, ' ').trim()

export function diagramRelations(code) {
	if (/^(flowchart|graph)\b/.test(code)) {
		const graph = parseMermaid(code)
		return graph.edges.map((edge) => ({
			from: plainLabel(graph.nodes.get(edge.source).label),
			to: plainLabel(graph.nodes.get(edge.target).label),
			label: plainLabel(edge.label ?? ''),
			dotted: edge.style === 'dotted'
		}))
	}
	if (code.startsWith('sequenceDiagram')) {
		const actors = new Map()
		const conditions = []
		const relations = []
		for (const raw of code.split('\n')) {
			const line = raw.trim()
			const actor = line.match(/^participant (\S+) as (.+)$/)
			if (actor) actors.set(actor[1], actor[2])
			const start = line.match(/^(?:alt|opt) (.+)$/)
			if (start) conditions.push(start[1])
			const branch = line.match(/^else (.+)$/)
			if (branch) conditions[conditions.length - 1] = branch[1]
			if (line === 'end') conditions.pop()
			const message = line.match(/^(\w+)(--?>>)(\w+):\s*(.+)$/)
			if (message)
				relations.push({
					from: actors.get(message[1]) ?? message[1],
					to: actors.get(message[3]) ?? message[3],
					label: message[4],
					dotted: message[2].startsWith('--'),
					condition: conditions.join(' / ')
				})
		}
		return relations
	}
	throw new Error('Unsupported article diagram type')
}

export function readDiagram(source) {
	const title = source.match(/^\s*accTitle:\s*(.+)$/m)?.[1]?.trim()
	const description = source.match(/^\s*accDescr:\s*(.+)$/m)?.[1]?.trim()
	if (!title || !description) throw new Error('Article diagrams need accTitle and accDescr')
	const code = source.replace(/^\s*acc(?:Title|Descr):.*$/gm, '').trim()
	if (code.startsWith('timeline')) {
		const events = [...code.matchAll(/^\s*([^\n:]+?)\s*:\s*(.+)$/gm)].map((match) => ({
			year: match[1].trim(),
			label: match[2].trim()
		}))
		if (events.length === 0) throw new Error(`Empty timeline: ${title}`)
		return { title, description, code, events }
	}
	return { title, description, code, relations: diagramRelations(code) }
}

const options = {
	bg: 'var(--diagram-bg)',
	fg: 'var(--diagram-text)',
	line: 'var(--diagram-line)',
	accent: 'var(--diagram-accent)',
	muted: 'var(--diagram-muted)',
	surface: 'var(--diagram-node)',
	border: 'var(--diagram-border)',
	font: 'Manrope',
	transparent: true,
	padding: 16,
	nodeSpacing: 24,
	layerSpacing: 20
}

export function renderArticleDiagram(code, id) {
	// The library emits global text/svg selectors. Scope them to each figure and
	// remove external font requests; the site already provides its font locally.
	let svg = renderMermaidSVG(code, options)
		.replace(/@import url\([^;]+;/g, '')
		.replace(/(^|\n)(\s*)(text|svg|\.mono) \{/g, `$1$2#${id} $3 {`)
	const dimensions = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
	if (!dimensions) throw new Error(`Diagram has no viewBox: ${id}`)
	// Mermaid marker IDs are otherwise repeated between figures and MIX locales.
	const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
	for (const oldId of new Set(ids)) {
		svg = svg
			.replaceAll(`id="${oldId}"`, `id="${id}-${oldId}"`)
			.replaceAll(`url(#${oldId})`, `url(#${id}-${oldId})`)
	}
	svg = svg.replace('<svg ', '<svg aria-hidden="true" focusable="false" ')
	return { svg, width: Number(dimensions[1]), height: Number(dimensions[2]) }
}
