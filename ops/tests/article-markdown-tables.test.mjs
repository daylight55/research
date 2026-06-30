import { strict as assert } from 'node:assert'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

function articleMdxFiles() {
	return execFileSync(
		'git',
		[
			'ls-files',
			'--cached',
			'--modified',
			'--others',
			'--exclude-standard',
			'--',
			'articles/report/**/*.mdx',
			'articles/news/**/*.mdx'
		],
		{ encoding: 'utf8' }
	)
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
}

function splitTableRow(line) {
	const trimmed = line.trim()
	const withoutLeadingPipe = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed
	const body = withoutLeadingPipe.endsWith('|')
		? withoutLeadingPipe.slice(0, -1)
		: withoutLeadingPipe
	const cells = []
	let current = ''
	let escaped = false
	let inCode = false

	for (const char of body) {
		if (escaped) {
			current += char
			escaped = false
			continue
		}

		if (char === '\\') {
			current += char
			escaped = true
			continue
		}

		if (char === '`') {
			current += char
			inCode = !inCode
			continue
		}

		if (char === '|' && !inCode) {
			cells.push(current.trim())
			current = ''
			continue
		}

		current += char
	}

	cells.push(current.trim())
	return cells
}

function isTableDivider(line) {
	const cells = splitTableRow(line)
	return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function tableBlocks(source) {
	const lines = source.split(/\r?\n/)
	const blocks = []

	for (let index = 0; index < lines.length; index += 1) {
		if (
			/^\s*\|/.test(lines[index]) &&
			index + 1 < lines.length &&
			isTableDivider(lines[index + 1])
		) {
			let end = index + 2
			while (end < lines.length && /^\s*\|/.test(lines[end])) {
				end += 1
			}

			blocks.push({ start: index, end, lines: lines.slice(index, end) })
			index = end - 1
		}
	}

	return blocks
}

test('article markdown tables keep the same cell count on every row', () => {
	const failures = []

	for (const file of articleMdxFiles()) {
		const source = readFileSync(file, 'utf8')

		for (const block of tableBlocks(source)) {
			const expectedCells = splitTableRow(block.lines[0]).length

			block.lines.forEach((line, offset) => {
				const actualCells = splitTableRow(line).length
				if (actualCells !== expectedCells) {
					failures.push(
						`${file}:${block.start + offset + 1} expected ${expectedCells} cells, found ${actualCells}`
					)
				}
			})
		}
	}

	assert.deepEqual(failures, [])
})

test('Astro MDX config enables GitHub-flavored markdown tables', () => {
	const config = readFileSync('astro.config.mjs', 'utf8')

	assert.match(config, /from 'remark-gfm'/)
	assert.match(config, /remarkPlugins:\s*\[[^\]]*remarkGfm[^\]]*\]/)
})
