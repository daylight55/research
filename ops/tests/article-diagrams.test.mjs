import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { parseMermaid } from 'beautiful-mermaid'
import {
	diagramRelations,
	readDiagram,
	renderArticleDiagram
} from '../../src/utils/articleDiagram.mjs'
import { remarkArticleDiagrams } from '../../src/utils/remarkArticleDiagrams.mjs'

const files = execFileSync('git', ['ls-files', 'articles/**/*.mdx'], { encoding: 'utf8' })
	.trim()
	.split('\n')
	.filter(Boolean)
const diagrams = files.flatMap((file) =>
	[...readFileSync(file, 'utf8').matchAll(/```mermaid\n([\s\S]*?)\n```/g)].map((match, index) => ({
		file,
		index,
		...readDiagram(match[1])
	}))
)

test('published diagrams have localized reading guidance and compact, renderable content', () => {
	assert.ok(diagrams.length > 0)
	for (const [index, diagram] of diagrams.entries()) {
		const label = `${diagram.file} figure ${diagram.index + 1}`
		assert.ok(diagram.title.length >= 5, label)
		assert.ok(diagram.description.length >= 25, label)
		if (diagram.file.includes('/en/')) {
			assert.doesNotMatch(
				diagram.title + diagram.description + diagram.code,
				/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u,
				label
			)
		}
		if (diagram.events) {
			assert.ok(diagram.events.length <= 9, `${label}: keep chronology compact`)
			continue
		}
		assert.ok(diagram.relations.length > 0, `${label}: readable mobile relationships`)
		for (const relation of diagram.relations) {
			assert.ok(relation.from && relation.to, label)
			assert.doesNotMatch(relation.from + relation.to + relation.label, /<br|\n/, label)
		}
		if (/^(flowchart|graph)\b/.test(diagram.code)) {
			const graph = parseMermaid(diagram.code)
			assert.ok(graph.nodes.size >= 3 && graph.nodes.size <= 9, `${label}: node budget`)
			for (const edge of graph.edges) {
				assert.ok(graph.nodes.has(edge.source) && graph.nodes.has(edge.target), label)
			}
		}
		const { svg, width, height } = renderArticleDiagram(diagram.code, `test-${index}`)
		assert.ok(width > 0 && height > 0, label)
		assert.match(svg, /<svg aria-hidden="true" focusable="false"/, label)
		assert.doesNotMatch(svg, /@import|<script|<foreignObject|onload=/i, label)
		assert.match(svg, new RegExp(`#test-${index} text \\{`), label)
		assert.doesNotMatch(svg, /(?:^|\n)\s*(?:svg|text|\.mono) \{/m, `${label}: scoped SVG styles`)
	}
})

test('mobile sequence relationships preserve optional and denied branches', () => {
	const relations = diagramRelations(`sequenceDiagram
participant H as Host
participant P as Policy
opt Persistence needed
  H->>P: Approval request
  alt Allowed
    P-->>H: Authorized scope
  else Denied
    P-->>H: Do not write
  end
end
H->>P: Unconditional follow-up`)
	assert.equal(relations[0].condition, 'Persistence needed')
	assert.equal(relations[1].condition, 'Persistence needed / Allowed')
	assert.equal(relations[2].condition, 'Persistence needed / Denied')
	assert.equal(relations[3].condition, '')
})

test('Japanese and English diagrams have matching types, node IDs and connections', () => {
	for (const ja of diagrams.filter((diagram) => diagram.file.includes('/ja/'))) {
		const en = diagrams.find(
			(diagram) => diagram.file === ja.file.replace('/ja/', '/en/') && diagram.index === ja.index
		)
		assert.ok(en, ja.file)
		assert.equal(Boolean(ja.events), Boolean(en.events), ja.file)
		if (ja.events) {
			assert.deepEqual(
				ja.events.map((event) => event.year.replace(/以降/, '+')),
				en.events.map((event) => event.year.replace(/ onward/, '+')),
				ja.file
			)
		} else if (ja.code.startsWith('flowchart')) {
			const jp = parseMermaid(ja.code),
				english = parseMermaid(en.code)
			assert.deepEqual([...jp.nodes.keys()], [...english.nodes.keys()], ja.file)
			assert.deepEqual(
				jp.edges.map(({ source, target, style }) => [source, target, style]),
				english.edges.map(({ source, target, style }) => [source, target, style]),
				ja.file
			)
		}
	}
})

test('the Markdown transform replaces only Mermaid fences with static figure components', () => {
	const tree = {
		type: 'root',
		children: [
			{ type: 'code', lang: 'js', value: 'console.log(1)' },
			{ type: 'code', lang: 'mermaid', value: 'flowchart LR\n A --> B' }
		]
	}
	remarkArticleDiagrams()(tree, { path: '/articles/report/example/en/index.mdx' })
	assert.equal(tree.children[0].type, 'mdxjsEsm')
	assert.equal(tree.children[1].lang, 'js')
	assert.equal(tree.children[2].name, 'ArticleDiagram')
	assert.equal(tree.children[2].attributes.find(({ name }) => name === 'locale').value, 'en')
	const ordinary = { children: [{ type: 'code', lang: 'js', value: '1' }] }
	remarkArticleDiagrams()(ordinary, { path: '' })
	assert.equal(ordinary.children.length, 1)
	assert.throws(() => readDiagram('flowchart LR\n A --> B'), /accTitle and accDescr/)
})

test('SVG definitions are unique per figure and diagram controls do not load renderers', () => {
	const source = 'flowchart LR\n A["One"] --> B["Two"] --> C["Three"]'
	const a = renderArticleDiagram(source, 'one').svg
	const b = renderArticleDiagram(source, 'two').svg
	const ids = (svg) => [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
	assert.ok(ids(a).every((id) => !ids(b).includes(id)))
	const client = readFileSync('src/components/MermaidRenderer.astro', 'utf8')
	assert.doesNotMatch(client, /import\(['"](?:mermaid|beautiful-mermaid)/)
	assert.match(client, /<dialog/)
	assert.match(client, /showModal\(\)/)
	assert.match(client, /diagramTrigger\?\.focus\(\)/)
	const layout = readFileSync('src/layouts/BlogPost.astro', 'utf8')
	assert.doesNotMatch(layout, /article-date-note|掲載時点の調査|at the publication date/)
})
