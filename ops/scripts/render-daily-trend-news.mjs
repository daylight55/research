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

	if (data.version !== 1) errors.push('version must be 1')
	if (!/^daily-trends-\d{4}-\d{2}-\d{2}$/.test(data.slug ?? '')) {
		errors.push('slug must use daily-trends-YYYY-MM-DD')
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date ?? '')) {
		errors.push('date must use YYYY-MM-DD')
	}
	if (hasText(data.slug) && hasText(data.date) && data.slug !== `daily-trends-${data.date}`) {
		errors.push('slug must match date')
	}
	if (data.category !== 'tech-news') errors.push('category must be tech-news')
	if (!Array.isArray(data.tags) || REQUIRED_TAGS.some((tag) => !data.tags.includes(tag))) {
		errors.push(`tags must include ${REQUIRED_TAGS.join(', ')}`)
	}

	ensureText(errors, data, 'generation.model')
	ensureText(errors, data, 'heroImage.query')
	ensureLocalizedText(errors, data, 'heroImage.alt')
	validateLocales(errors, data)
	validateSections(errors, data)

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
	const data = readDataFile(dataFile, rootDir)
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
