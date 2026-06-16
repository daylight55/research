import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const LOCALES = ['ja', 'en']
const EXPECTED_SECTIONS = ['politics', 'economy', 'technology']
const REQUIRED_TAGS = ['news', 'politics', 'economy', 'technology']
const SECTION_LABELS = {
	politics: { ja: '政治', en: 'Politics' },
	economy: { ja: '経済', en: 'Economy' },
	technology: { ja: '技術', en: 'Technology' }
}
const ARTICLE_LABELS = {
	ja: {
		crossCutting: '横断的な見立て',
		watchItems: '追跡すべき未確定事項',
		bottomLine: '要点:',
		whatHappened: '何が起きたか:',
		whyItMatters: 'なぜ重要か:',
		whatToWatch: '今後の注視点:'
	},
	en: {
		crossCutting: 'Cross-cutting read',
		watchItems: 'What to watch next',
		bottomLine: 'The bottom line:',
		whatHappened: 'What happened:',
		whyItMatters: 'Why it matters:',
		whatToWatch: 'What to watch:'
	}
}
const LABEL_LINE_LIMIT = {
	ja: 150,
	en: 240
}
const UNRESOLVED_PLACEHOLDER_RE = /<(?!https?:\/\/)[^<>]{2,80}>/
const TONE_ALIASES = {
	politics: 'politics',
	political: 'politics',
	政治: 'politics',
	economy: 'economy',
	economic: 'economy',
	markets: 'economy',
	market: 'economy',
	経済: 'economy',
	technology: 'technology',
	tech: 'technology',
	技術: 'technology'
}
const FIELD_ALIASES = {
	bottomLine: ['bottomLine', 'bottom_line', 'bottomline', 'summary', 'theBottomLine'],
	whatHappened: ['whatHappened', 'what_happened', 'happened', 'facts'],
	whyItMatters: ['whyItMatters', 'why_it_matters', 'importance', 'impact'],
	whatToWatch: ['whatToWatch', 'what_to_watch', 'watch', 'next']
}

function isRecord(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function valueAt(data, keyPath) {
	return keyPath.split('.').reduce((value, key) => (isRecord(value) ? value[key] : undefined), data)
}

function hasText(value) {
	return typeof value === 'string' && value.trim().length > 0
}

function normalizedWhitespace(value) {
	return String(value).replace(/\s+/g, ' ').trim()
}

function compactObject(value) {
	return JSON.parse(JSON.stringify(value))
}

function firstText(...values) {
	for (const value of values.flat()) {
		if (hasText(value)) return normalizedWhitespace(value)
	}
	return ''
}

function firstValue(data, keys) {
	if (!isRecord(data)) return undefined
	for (const key of keys) {
		if (data[key] !== undefined) return data[key]
	}
	return undefined
}

function normalizeLocaleText(value, fallback = '') {
	if (isRecord(value)) {
		const ja = firstText(
			value.ja,
			value.japanese,
			value.jp,
			value.en,
			value.english,
			fallback?.ja,
			fallback
		)
		const en = firstText(
			value.en,
			value.english,
			value.ja,
			value.japanese,
			value.jp,
			fallback?.en,
			fallback
		)
		return { ja, en }
	}
	return {
		ja: firstText(value, fallback?.ja, fallback),
		en: firstText(value, fallback?.en, fallback)
	}
}

function normalizeTextArray(value) {
	if (Array.isArray(value)) return value.map((entry) => normalizedWhitespace(entry)).filter(Boolean)
	if (!hasText(value)) return []
	return normalizedWhitespace(value)
		.split(/\s*(?:\n+|(?:^|\s)[-*]\s+)\s*/)
		.map((entry) => entry.trim())
		.filter(Boolean)
}

function normalizeTitle(value, date) {
	const title = normalizedWhitespace(value)
	if (!hasText(title)) return title
	if (!hasText(date)) return title
	const withDate = title.startsWith(`${date} `) ? title : `${date} ${title}`
	return withDate.length <= 80 ? withDate : withDate.slice(0, 80).trimEnd()
}

function stripRenderedLabel(value, locale, field) {
	const text = normalizedWhitespace(value)
	const labels = new Set([
		ARTICLE_LABELS[locale][field],
		ARTICLE_LABELS.ja[field],
		ARTICLE_LABELS.en[field]
	])
	for (const label of labels) {
		if (text.startsWith(label)) return text.slice(label.length).trim()
	}
	return text
}

function canonicalTone(value) {
	const key = normalizedWhitespace(value).toLowerCase()
	return TONE_ALIASES[key] ?? undefined
}

function normalizeSource(source) {
	const sourceData = isRecord(source) ? source : {}
	const imageData = isRecord(sourceData.image) ? sourceData.image : {}
	return {
		href: firstText(firstValue(sourceData, ['href', 'url', 'link'])),
		source: firstText(firstValue(sourceData, ['source', 'name', 'publisher', 'outlet'])),
		title: normalizeLocaleText(firstValue(sourceData, ['title', 'headline', 'sourceTitle'])),
		description: normalizeLocaleText(
			firstValue(sourceData, ['description', 'memo', 'summary', 'sourceMemo'])
		),
		imageUrl: firstText(
			firstValue(sourceData, ['imageUrl', 'image_url', 'imageHref']),
			firstValue(imageData, ['url', 'href', 'src']),
			hasText(sourceData.image) ? sourceData.image : ''
		),
		imageAlt: normalizeLocaleText(
			firstValue(sourceData, ['imageAlt', 'image_alt', 'alt']) ??
				firstValue(imageData, ['alt', 'imageAlt', 'image_alt'])
		)
	}
}

function normalizeTopic(topic, tone, index) {
	const topicData = isRecord(topic) ? topic : {}
	const source = normalizeSource(
		topicData.source ?? topicData.sourceCard ?? topicData.citation ?? topicData.sources?.[0]
	)
	const normalized = {
		id: firstText(topicData.id, `${tone}-${index + 1}`),
		title: normalizeLocaleText(
			firstValue(topicData, ['title', 'heading', 'headline', 'name', 'topic'])
		),
		source
	}

	for (const field of ['bottomLine', 'whatHappened', 'whyItMatters', 'whatToWatch']) {
		const text = normalizeLocaleText(firstValue(topicData, FIELD_ALIASES[field]))
		normalized[field] = {
			ja: stripRenderedLabel(text.ja, 'ja', field),
			en: stripRenderedLabel(text.en, 'en', field)
		}
	}

	return normalized
}

function rawSections(value) {
	if (Array.isArray(value)) return value
	if (!isRecord(value)) return []
	return Object.entries(value).map(([tone, section]) =>
		isRecord(section) ? { tone, ...section } : { tone, topics: section }
	)
}

function normalizeSection(section, fallbackTone) {
	const tone =
		canonicalTone(section?.tone) ??
		canonicalTone(section?.category) ??
		canonicalTone(section?.heading) ??
		canonicalTone(section?.title) ??
		canonicalTone(section?.name) ??
		fallbackTone
	const defaultHeading = SECTION_LABELS[tone] ?? { ja: tone, en: tone }
	const heading = normalizeLocaleText(
		section?.heading ?? section?.title ?? section?.name,
		defaultHeading
	)
	const topics = firstValue(section, ['topics', 'items', 'stories', 'articles'])
	return {
		tone,
		heading,
		topics: (Array.isArray(topics) ? topics : [])
			.filter(isRecord)
			.slice(0, 5)
			.map((topic, index) => normalizeTopic(topic, tone, index))
	}
}

function normalizeSections(sections) {
	const sectionsByTone = new Map()
	for (const section of rawSections(sections)) {
		const tone =
			canonicalTone(section?.tone) ??
			canonicalTone(section?.category) ??
			canonicalTone(section?.heading) ??
			canonicalTone(section?.title) ??
			canonicalTone(section?.name)
		if (tone && !sectionsByTone.has(tone)) sectionsByTone.set(tone, section)
	}

	return EXPECTED_SECTIONS.map((tone) => normalizeSection(sectionsByTone.get(tone) ?? {}, tone))
}

function normalizeLocaleBlock(localeData, date) {
	const data = isRecord(localeData) ? localeData : {}
	return {
		title: normalizeTitle(data.title, date),
		description: firstText(data.description),
		rssSummary: firstText(data.rssSummary, data.rss_summary),
		opening: firstText(data.opening, data.summary, data.lede),
		crossCutting: normalizeTextArray(data.crossCutting ?? data.cross_cutting),
		watchItems: normalizeTextArray(data.watchItems ?? data.watch_items),
		sourceNotes: {
			politics: normalizeTextArray(data.sourceNotes?.politics),
			economy: normalizeTextArray(data.sourceNotes?.economy),
			technology: normalizeTextArray(data.sourceNotes?.technology),
			decisions: normalizeTextArray(data.sourceNotes?.decisions ?? data.sourceNotes?.selection)
		},
		researchLog: {
			instruction: normalizeTextArray(data.researchLog?.instruction),
			decisionNotes: normalizeTextArray(
				data.researchLog?.decisionNotes ?? data.researchLog?.decisions
			),
			followUps: normalizeTextArray(data.researchLog?.followUps ?? data.researchLog?.follow_ups)
		}
	}
}

export function normalizeDailyTrendNewsData(data) {
	if (!isRecord(data)) return data
	const normalized = compactObject(data)
	const date = firstText(normalized.date, normalized.slug?.match(/\d{4}-\d{2}-\d{2}/)?.[0])
	const slug = firstText(normalized.slug, date ? `daily-trends-${date}` : '')

	normalized.version = normalized.version ?? 1
	normalized.date = date
	normalized.slug = slug
	normalized.category = normalized.category ?? 'tech-news'
	normalized.tags = REQUIRED_TAGS
	normalized.generation = {
		model: firstText(normalized.generation?.model, process.env.OPENAI_MODEL, 'gpt-5.4-mini')
	}
	normalized.heroImage = {
		query: firstText(normalized.heroImage?.query, normalized.heroImageQuery),
		alt: normalizeLocaleText(
			normalized.heroImage?.alt ?? normalized.heroImageAlt,
			normalized.heroImage?.query
		)
	}
	normalized.locales = {
		ja: normalizeLocaleBlock(normalized.locales?.ja, date),
		en: normalizeLocaleBlock(normalized.locales?.en, date)
	}
	normalized.sections = normalizeSections(normalized.sections)

	return normalized
}

function ensureText(errors, data, keyPath) {
	const value = valueAt(data, keyPath)
	if (!hasText(value)) errors.push(`${keyPath} must be a non-empty string`)
	if (hasText(value) && UNRESOLVED_PLACEHOLDER_RE.test(value)) {
		errors.push(`${keyPath} must not contain unresolved angle-bracket placeholders`)
	}
}

function ensureTextArray(errors, data, keyPath, { min = 1 } = {}) {
	const value = valueAt(data, keyPath)
	if (!Array.isArray(value)) {
		errors.push(`${keyPath} must be an array`)
		return
	}
	const emptyIndex = value.findIndex((entry) => !hasText(entry))
	if (emptyIndex !== -1) errors.push(`${keyPath}[${emptyIndex}] must be a non-empty string`)
	const placeholderIndex = value.findIndex(
		(entry) => hasText(entry) && UNRESOLVED_PLACEHOLDER_RE.test(entry)
	)
	if (placeholderIndex !== -1) {
		errors.push(
			`${keyPath}[${placeholderIndex}] must not contain unresolved angle-bracket placeholders`
		)
	}
	if (value.length < min) errors.push(`${keyPath} must contain at least ${min} item(s)`)
}

function ensureUrl(errors, value, keyPath) {
	if (!hasText(value)) {
		errors.push(`${keyPath} must be a non-empty URL string`)
		return
	}
	try {
		const parsed = new URL(value)
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			errors.push(`${keyPath} must use http or https`)
		}
	} catch {
		errors.push(`${keyPath} must be a valid URL`)
	}
}

function canonicalImageUrl(value) {
	try {
		const url = new URL(value)
		return `${url.origin}${url.pathname}`
	} catch {
		return value
	}
}

function ensureLocalizedText(errors, data, keyPath) {
	for (const locale of LOCALES) ensureText(errors, data, `${keyPath}.${locale}`)
}

function ensureTopicText(errors, topic, keyPath, field) {
	for (const locale of LOCALES) {
		const value = topic[field]?.[locale]
		if (!hasText(value)) {
			errors.push(`${keyPath}.${field}.${locale} must be a non-empty string`)
			continue
		}
		if (UNRESOLVED_PLACEHOLDER_RE.test(value)) {
			errors.push(
				`${keyPath}.${field}.${locale} must not contain unresolved angle-bracket placeholders`
			)
		}

		const label = ARTICLE_LABELS[locale][field]
		if (value.trim().startsWith(label)) {
			errors.push(`${keyPath}.${field}.${locale} should not include the rendered label`)
		}

		const renderedLength = `${label} ${normalizedWhitespace(value)}`.length
		if (renderedLength > LABEL_LINE_LIMIT[locale]) {
			errors.push(`${keyPath}.${field}.${locale} is too long for a single Smart Brevity paragraph`)
		}
	}
}

function validateLocales(errors, data) {
	if (!isRecord(data.locales)) {
		errors.push('locales must contain ja and en objects')
		return
	}

	for (const locale of LOCALES) {
		const basePath = `locales.${locale}`
		const localeData = data.locales[locale]
		if (!isRecord(localeData)) {
			errors.push(`${basePath} must be an object`)
			continue
		}

		for (const field of ['title', 'description', 'rssSummary', 'opening']) {
			ensureText(errors, data, `${basePath}.${field}`)
		}

		const title = localeData.title
		if (hasText(title)) {
			if (!title.startsWith(`${data.date} `)) {
				errors.push(`${basePath}.title must start with "${data.date} "`)
			}
			if (title.length > 80) errors.push(`${basePath}.title must be 80 characters or fewer`)
		}

		ensureTextArray(errors, data, `${basePath}.crossCutting`, { min: 3 })
		ensureTextArray(errors, data, `${basePath}.watchItems`, { min: 3 })

		for (const section of [...EXPECTED_SECTIONS, 'decisions']) {
			ensureTextArray(errors, data, `${basePath}.sourceNotes.${section}`, { min: 1 })
		}

		for (const field of ['instruction', 'decisionNotes', 'followUps']) {
			ensureTextArray(errors, data, `${basePath}.researchLog.${field}`, { min: 1 })
		}
	}
}

function validateSections(errors, data) {
	if (!Array.isArray(data.sections)) {
		errors.push('sections must be an array')
		return
	}
	if (data.sections.length !== EXPECTED_SECTIONS.length) {
		errors.push('sections must contain politics, economy, and technology')
	}

	const imageUrls = new Map()
	data.sections.forEach((section, sectionIndex) => {
		const expectedTone = EXPECTED_SECTIONS[sectionIndex]
		const sectionPath = `sections[${sectionIndex}]`
		if (!isRecord(section)) {
			errors.push(`${sectionPath} must be an object`)
			return
		}
		if (section.tone !== expectedTone) {
			errors.push(`${sectionPath}.tone must be ${expectedTone}`)
		}
		for (const locale of LOCALES) {
			if (!hasText(section.heading?.[locale])) {
				errors.push(`${sectionPath}.heading.${locale} must be a non-empty string`)
			}
		}
		if (!Array.isArray(section.topics)) {
			errors.push(`${sectionPath}.topics must be an array`)
			return
		}
		if (section.topics.length !== 5) {
			errors.push(`${expectedTone} section must contain exactly 5 topics`)
		}

		section.topics.forEach((topic, topicIndex) => {
			const topicPath = `${sectionPath}.topics[${topicIndex}]`
			if (!isRecord(topic)) {
				errors.push(`${topicPath} must be an object`)
				return
			}
			ensureText(errors, topic, 'id')
			ensureLocalizedText(errors, topic, 'title')
			for (const field of ['bottomLine', 'whatHappened', 'whyItMatters', 'whatToWatch']) {
				ensureTopicText(errors, topic, topicPath, field)
			}

			ensureUrl(errors, topic.source?.href, `${topicPath}.source.href`)
			ensureText(errors, topic, 'source.source')
			ensureLocalizedText(errors, topic, 'source.title')
			ensureLocalizedText(errors, topic, 'source.description')
			ensureUrl(errors, topic.source?.imageUrl, `${topicPath}.source.imageUrl`)
			ensureLocalizedText(errors, topic, 'source.imageAlt')

			if (hasText(topic.source?.imageUrl)) {
				if (topic.source.imageUrl.startsWith('https://source.unsplash.com/')) {
					errors.push(`${topicPath}.source.imageUrl must not use source.unsplash.com`)
				}
				const canonical = canonicalImageUrl(topic.source.imageUrl)
				const firstTopic = imageUrls.get(canonical)
				if (firstTopic) {
					errors.push(`${topicPath}.source.imageUrl duplicates ${firstTopic}`)
				} else {
					imageUrls.set(canonical, topicPath)
				}
			}
		})
	})
}

export function validateDailyTrendNewsData(data) {
	const errors = []
	if (!isRecord(data)) return { errors: ['Daily Trend News data must be a JSON object'] }
	const normalized = normalizeDailyTrendNewsData(data)

	if (normalized.version !== 1) errors.push('version must be 1')
	if (!/^daily-trends-\d{4}-\d{2}-\d{2}$/.test(normalized.slug ?? '')) {
		errors.push('slug must use daily-trends-YYYY-MM-DD')
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized.date ?? '')) {
		errors.push('date must use YYYY-MM-DD')
	}
	if (
		hasText(normalized.slug) &&
		hasText(normalized.date) &&
		normalized.slug !== `daily-trends-${normalized.date}`
	) {
		errors.push('slug must match date')
	}
	if (normalized.category !== 'tech-news') errors.push('category must be tech-news')
	if (
		!Array.isArray(normalized.tags) ||
		REQUIRED_TAGS.some((tag) => !normalized.tags.includes(tag))
	) {
		errors.push(`tags must include ${REQUIRED_TAGS.join(', ')}`)
	}

	ensureText(errors, normalized, 'generation.model')
	ensureText(errors, normalized, 'heroImage.query')
	ensureLocalizedText(errors, normalized, 'heroImage.alt')
	validateLocales(errors, normalized)
	validateSections(errors, normalized)

	return { errors }
}

function escapeMdxText(value) {
	return normalizedWhitespace(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/{/g, '&#123;')
		.replace(/}/g, '&#125;')
}

function escapeMdxAttribute(value) {
	return escapeMdxText(value).replace(/'/g, '&#39;')
}

function yamlSingleQuoted(value) {
	return normalizedWhitespace(value).replace(/'/g, "''")
}

function frontmatter(data, locale) {
	const localeData = data.locales[locale]
	return `---
title: '${yamlSingleQuoted(localeData.title)}'
description: '${yamlSingleQuoted(localeData.description)}'
rssSummary: '${yamlSingleQuoted(localeData.rssSummary)}'
contentType: news
pubDate: '${data.date}'
heroImage: '../../../../src/assets/images/placeholder-hero.jpg'
heroImageQuery: '${yamlSingleQuoted(data.heroImage.query)}'
heroImageAlt: '${yamlSingleQuoted(data.heroImage.alt[locale])}'
category: 'tech-news'
tags: [${data.tags.map((tag) => `'${yamlSingleQuoted(tag)}'`).join(', ')}]
generation:
  model: '${yamlSingleQuoted(data.generation.model)}'
draft: false
---

import NewsDigestSection from '../../../../src/components/mdx/NewsDigestSection.astro'
import NewsSourceCard from '../../../../src/components/mdx/NewsSourceCard.astro'
`
}

function sourceCard(topic, locale) {
	const source = topic.source
	return `<NewsSourceCard
\thref='${escapeMdxAttribute(source.href)}'
\tsource='${escapeMdxAttribute(source.source)}'
\ttitle='${escapeMdxAttribute(source.title[locale])}'
\tdescription='${escapeMdxAttribute(source.description[locale])}'
\timageUrl='${escapeMdxAttribute(source.imageUrl)}'
\timageAlt='${escapeMdxAttribute(source.imageAlt[locale])}'
/>`
}

function topicBlock(topic, locale) {
	const labels = ARTICLE_LABELS[locale]
	return `### ${escapeMdxText(topic.title[locale])}

${sourceCard(topic, locale)}

${labels.bottomLine} ${escapeMdxText(topic.bottomLine[locale])}

${labels.whatHappened} ${escapeMdxText(topic.whatHappened[locale])}

${labels.whyItMatters} ${escapeMdxText(topic.whyItMatters[locale])}

${labels.whatToWatch} ${escapeMdxText(topic.whatToWatch[locale])}`
}

function sectionBlock(section, locale) {
	const topics = section.topics.map((topic) => topicBlock(topic, locale)).join('\n\n')
	return `<NewsDigestSection tone='${section.tone}'>

## ${escapeMdxText(section.heading[locale])}

${topics}

</NewsDigestSection>`
}

function bulletList(items) {
	return items.map((item) => `- ${escapeMdxText(item)}`).join('\n')
}

function renderArticle(data, locale) {
	const localeData = data.locales[locale]
	const labels = ARTICLE_LABELS[locale]
	const sections = data.sections.map((section) => sectionBlock(section, locale)).join('\n\n')
	return `${frontmatter(data, locale)}

# ${escapeMdxText(localeData.title)}

${escapeMdxText(localeData.opening)}

${sections}

## ${labels.crossCutting}

${bulletList(localeData.crossCutting)}

## ${labels.watchItems}

${bulletList(localeData.watchItems)}
`
}

function renderSourceNotes(data, locale) {
	const localeData = data.locales[locale]
	const sectionNotes = EXPECTED_SECTIONS.map((section) => {
		const heading = SECTION_LABELS[section][locale]
		return `## ${heading}

${bulletList(localeData.sourceNotes[section])}`
	}).join('\n\n')

	const decisionsHeading = locale === 'ja' ? '採否判断' : 'Selection Notes'
	return `# source-notes

${sectionNotes}

## ${decisionsHeading}

${bulletList(localeData.sourceNotes.decisions)}
`
}

function renderResearchLog(data, locale) {
	const localeData = data.locales[locale]
	const environmentHeading = locale === 'ja' ? '利用環境' : 'Environment'
	const instructionHeading = locale === 'ja' ? '調査命令' : 'Research Instruction'
	const notesHeading = locale === 'ja' ? '判断メモ' : 'Decision Notes'
	const followUpsHeading = locale === 'ja' ? '残課題' : 'Follow-ups'

	return `# research-log

## ${environmentHeading}

- Automation model: \`${escapeMdxText(data.generation.model)}\`
- Prompt source: [ops/codex/prompts/daily-trend-news.md](https://github.com/daylight55/research/blob/main/ops/codex/prompts/daily-trend-news.md)

## ${instructionHeading}

${bulletList(localeData.researchLog.instruction)}

## ${notesHeading}

${bulletList(localeData.researchLog.decisionNotes)}

## ${followUpsHeading}

${bulletList(localeData.researchLog.followUps)}
`
}

function alignmentPairs(data) {
	const pairs = [
		{
			ja: escapeMdxText(data.locales.ja.opening),
			en: escapeMdxText(data.locales.en.opening)
		}
	]

	for (const section of data.sections) {
		for (const topic of section.topics) {
			for (const field of ['bottomLine', 'whatHappened', 'whyItMatters', 'whatToWatch']) {
				pairs.push({
					ja: escapeMdxText(topic[field].ja),
					en: escapeMdxText(topic[field].en)
				})
			}
		}
	}

	data.locales.ja.crossCutting.forEach((item, index) => {
		pairs.push({
			ja: escapeMdxText(item),
			en: escapeMdxText(data.locales.en.crossCutting[index])
		})
	})
	data.locales.ja.watchItems.forEach((item, index) => {
		pairs.push({
			ja: escapeMdxText(item),
			en: escapeMdxText(data.locales.en.watchItems[index])
		})
	})

	return pairs
}

function renderMixAlignment(data) {
	return `${JSON.stringify(
		{
			version: 1,
			sourceLocale: 'ja',
			targetLocale: 'en',
			pairs: alignmentPairs(data)
		},
		null,
		2
	)}
`
}

function writeTextFile(rootDir, file, source) {
	const absolutePath = path.join(rootDir, file)
	mkdirSync(path.dirname(absolutePath), { recursive: true })
	writeFileSync(absolutePath, source)
	return file
}

function readDataFile(dataFile, rootDir) {
	const absolutePath = path.isAbsolute(dataFile) ? dataFile : path.join(rootDir, dataFile)
	if (!existsSync(absolutePath)) throw new Error(`Structured news data file not found: ${dataFile}`)
	return JSON.parse(readFileSync(absolutePath, 'utf8'))
}

export function renderDailyTrendNews({ dataFile, rootDir = process.cwd(), validateOnly = false }) {
	if (!dataFile) throw new Error('dataFile is required')
	const data = normalizeDailyTrendNewsData(readDataFile(dataFile, rootDir))
	const validation = validateDailyTrendNewsData(data)
	if (validation.errors.length > 0) {
		throw new Error(`Structured Daily Trend News data is invalid:\n${validation.errors.join('\n')}`)
	}

	if (validateOnly) return { slug: data.slug, files: [] }

	const articleRoot = `articles/news/${data.slug}`
	const files = []
	for (const locale of LOCALES) {
		files.push(
			writeTextFile(rootDir, `${articleRoot}/${locale}/index.mdx`, renderArticle(data, locale))
		)
		files.push(
			writeTextFile(
				rootDir,
				`${articleRoot}/${locale}/source-notes.mdx`,
				renderSourceNotes(data, locale)
			)
		)
		files.push(
			writeTextFile(
				rootDir,
				`${articleRoot}/${locale}/research-log.mdx`,
				renderResearchLog(data, locale)
			)
		)
	}
	files.push(writeTextFile(rootDir, `${articleRoot}/mix-alignment.json`, renderMixAlignment(data)))

	return { slug: data.slug, files }
}

function main() {
	const args = process.argv.slice(2)
	const validateOnly = args.includes('--validate-only')
	const dataFile = args.find((arg) => !arg.startsWith('-'))
	try {
		const result = renderDailyTrendNews({ dataFile, validateOnly })
		if (validateOnly) {
			console.log(`Validated structured Daily Trend News data for ${result.slug}.`)
		} else {
			console.log(`Rendered structured Daily Trend News article for ${result.slug}.`)
			result.files.forEach((file) => console.log(file))
		}
	} catch (error) {
		console.error(`::error::${error.message}`)
		process.exit(1)
	}
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] === currentFile) {
	main()
}
