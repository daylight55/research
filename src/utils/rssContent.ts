type NewsSourceCard = {
	href?: string
	source?: string
	title?: string
	description?: string
	imageUrl?: string
	imageAlt?: string
}

const escapeHtmlText = (value: string) => value.replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const escapeHtmlAttribute = (value: string) =>
	escapeHtmlText(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')

const getProp = (block: string, prop: keyof NewsSourceCard) => {
	const match = block.match(new RegExp(`${prop}='([^']*)'`))
	return match?.[1]
}

const renderSourceCard = (block: string) => {
	const card: NewsSourceCard = {
		href: getProp(block, 'href'),
		source: getProp(block, 'source'),
		title: getProp(block, 'title'),
		description: getProp(block, 'description'),
		imageUrl: getProp(block, 'imageUrl'),
		imageAlt: getProp(block, 'imageAlt')
	}

	if (!card.href || !card.title) {
		return ''
	}

	const image = card.imageUrl
		? `<img src="${escapeHtmlAttribute(card.imageUrl)}" alt="${escapeHtmlAttribute(card.imageAlt ?? card.title)}" />`
		: ''
	const source = card.source ? `<p><strong>出典: ${escapeHtmlText(card.source)}</strong></p>` : ''
	const description = card.description ? `<p>${escapeHtmlText(card.description)}</p>` : ''

	return `<aside>${image}${source}<p><a href="${escapeHtmlAttribute(card.href)}">${escapeHtmlText(card.title)}</a></p>${description}</aside>`
}

export const renderRssContent = (body: string) => {
	const content: string[] = []
	const lines = body.split('\n')
	let inFencedBlock = false

	for (let index = 0; index < lines.length; index += 1) {
		const trimmed = lines[index].trim()

		if (trimmed.startsWith('```')) {
			inFencedBlock = !inFencedBlock
			continue
		}

		if (inFencedBlock) {
			continue
		}

		if (
			trimmed === '' ||
			trimmed.startsWith('import ') ||
			trimmed.startsWith('</NewsDigestSection') ||
			trimmed.startsWith('<NewsDigestSection')
		) {
			continue
		}

		if (trimmed.startsWith('<NewsSourceCard')) {
			const block = [trimmed]
			while (!lines[index].includes('/>') && index < lines.length - 1) {
				index += 1
				block.push(lines[index].trim())
			}
			const sourceCard = renderSourceCard(block.join('\n'))
			if (sourceCard) {
				content.push(sourceCard)
			}
			continue
		}

		const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
		if (heading) {
			content.push(`<h${heading[1].length}>${escapeHtmlText(heading[2])}</h${heading[1].length}>`)
			continue
		}

		if (!trimmed.startsWith('<')) {
			content.push(`<p>${escapeHtmlText(trimmed)}</p>`)
		}
	}

	return content.join('\n')
}

export const renderReportRssContent = (body: string) => {
	const lines = body.split('\n')
	const summaryStart = lines.findIndex((line) =>
		/^##\s+(?:\d+\.\s*)?(?:エグゼクティブサマリー|Executive Summary|概要|要約)\s*$/i.test(
			line.trim()
		)
	)

	if (summaryStart === -1) {
		return ''
	}

	const sectionLines = []

	for (let index = summaryStart; index < lines.length; index += 1) {
		const trimmed = lines[index].trim()

		if (index > summaryStart && /^#{2,}\s+/.test(trimmed)) {
			break
		}

		if (trimmed.startsWith('出典メモ:')) {
			continue
		}

		const sourceNoteStart = lines[index].indexOf('出典メモ:')
		sectionLines.push(
			sourceNoteStart === -1 ? lines[index] : lines[index].slice(0, sourceNoteStart)
		)
	}

	return renderRssContent(sectionLines.join('\n'))
}

export const renderNewsRssContent = renderRssContent
