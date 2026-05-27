import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const IMAGE_DIR = path.join('src', 'assets', 'images', 'hero')
const PLACEHOLDER_RE = /placeholder|banner\.jpg|book\.jpg|placeholder-social/i
const BLOG_GLOB = 'articles/*/*/*/index.mdx'
const NEWS_GENERIC_QUERY_RE = /\b(news|daily|trend|trends|hot|collage|headline|headlines)\b/gi
const GENERIC_FOCUS_TERMS = new Set([
	'Reuters',
	'Associated Press',
	'AP News',
	'BBC',
	'CNN',
	'CNBC',
	'Bloomberg',
	'Investing.com',
	'Marketscreener',
	'StreetInsider'
])

function changedBlogEntries() {
	if (process.argv.includes('--all')) {
		return execFileSync('git', ['ls-files', BLOG_GLOB], { encoding: 'utf8' })
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
	}

	const output = execFileSync(
		'git',
		['ls-files', '--modified', '--others', '--exclude-standard', '--', BLOG_GLOB],
		{ encoding: 'utf8' }
	)
	return output
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
}

function frontmatterOf(source, file) {
	const match = source.match(/^---\n([\s\S]*?)\n---/)
	if (!match) {
		throw new Error(`${file} does not start with frontmatter`)
	}
	return { raw: match[1], full: match[0] }
}

function readScalar(frontmatter, key) {
	const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
	if (!match) return ''
	return match[1].trim().replace(/^['"]|['"]$/g, '')
}

function readArrayItems(frontmatter, key) {
	const match = frontmatter.match(new RegExp(`^${key}:\\s*\\[(.*)\\]$`, 'm'))
	if (!match) return []
	return match[1]
		.split(',')
		.map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
		.filter(Boolean)
}

function quoteYaml(value) {
	return `'${value.replace(/'/g, "''")}'`
}

function upsertScalar(frontmatter, key, value, afterKey) {
	const line = `${key}: ${quoteYaml(value)}`
	const pattern = new RegExp(`^${key}:.*$`, 'm')

	if (pattern.test(frontmatter)) {
		return frontmatter.replace(pattern, line)
	}

	const afterPattern = new RegExp(`^${afterKey}:.*$`, 'm')
	if (afterPattern.test(frontmatter)) {
		return frontmatter.replace(afterPattern, (matched) => `${matched}\n${line}`)
	}

	return `${frontmatter}\n${line}`
}

function imageUrl(rawUrl) {
	const separator = rawUrl.includes('?') ? '&' : '?'
	return `${rawUrl}${separator}w=1600&h=900&fit=crop&crop=entropy&fm=jpg&q=85`
}

export function imageHash(bytes) {
	return createHash('sha256').update(bytes).digest('hex')
}

function unsplashPhotoKey(photo) {
	return photo?.id ? `unsplash:${photo.id}` : ''
}

function normalizeCreditUrl(value) {
	if (!value) return ''
	try {
		const url = new URL(value)
		url.search = ''
		url.hash = ''
		return url.toString().replace(/\/$/, '')
	} catch {
		return value.trim()
	}
}

function extractFocusTerms(source, frontmatter) {
	const terms = []
	const add = (term) => {
		const normalized = term
			.replace(/\s+/g, ' ')
			.replace(/[「」『』()[\]{}]/g, '')
			.trim()
		if (!normalized || GENERIC_FOCUS_TERMS.has(normalized)) return
		if (normalized.length < 3 || normalized.length > 48) return
		if (!terms.includes(normalized)) terms.push(normalized)
	}

	for (const value of [
		readScalar(frontmatter, 'title'),
		readScalar(frontmatter, 'description'),
		...readArrayItems(frontmatter, 'tags')
	]) {
		for (const match of value.matchAll(/[A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*){0,4}/g)) {
			add(match[0])
		}
	}

	for (const match of source.matchAll(/\b(?:source|title)=['"]([^'"]+)['"]/g)) {
		add(match[1])
	}

	for (const match of source.matchAll(/^###\s+(.+)$/gm)) {
		for (const candidate of match[1].split(/[、:：・/]| and | with /i)) {
			add(candidate)
		}
	}

	return terms.slice(0, 8)
}

export function buildRetryQueries(query, { contentType = '', focusTerms = [] } = {}) {
	const baseQueries = query
		.split(',')
		.map((candidate) => candidate.trim())
		.filter(Boolean)

	const queries = []
	const add = (candidate) => {
		const normalized = candidate.replace(/\s+/g, ' ').trim()
		if (normalized && !queries.includes(normalized)) queries.push(normalized)
	}

	if (contentType === 'news') {
		for (const term of focusTerms) {
			add(`${term} news`)
		}
	}

	for (const candidate of baseQueries) add(candidate)

	const specificTerms = query.replace(NEWS_GENERIC_QUERY_RE, ' ').replace(/\s+/g, ' ').trim()
	if (specificTerms) add(specificTerms)

	if (contentType === 'news') {
		add('global newsroom editorial')
	} else {
		add(`${query} editorial`)
	}

	return queries
}

function resolveHeroPath(file, heroImage) {
	if (!heroImage) return ''
	return path.normalize(path.join(path.dirname(file), heroImage))
}

function existingHeroState({ currentFile = '' } = {}) {
	const files = execFileSync('git', ['ls-files', BLOG_GLOB], { encoding: 'utf8' })
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
	const imageHashes = new Map()
	const imageHashFiles = new Map()
	const photoKeys = new Set()
	const creditUrls = new Set()

	for (const file of files) {
		const source = readFileSync(file, 'utf8')
		const { raw } = frontmatterOf(source, file)
		const heroImage = readScalar(raw, 'heroImage')
		const sourceId = readScalar(raw, 'heroImageSourceId')
		const creditUrl = normalizeCreditUrl(readScalar(raw, 'heroImageCreditUrl'))
		const heroPath = resolveHeroPath(file, heroImage)

		if (sourceId) photoKeys.add(sourceId)
		if (creditUrl) creditUrls.add(creditUrl)

		if (!heroPath || !existsSync(heroPath)) continue
		const hash = imageHash(readFileSync(heroPath))
		const imageFiles = imageHashFiles.get(hash) ?? []
		imageFiles.push(file)
		imageHashFiles.set(hash, imageFiles)
		imageHashes.set(file, hash)
	}

	const currentHash = currentFile ? imageHashes.get(currentFile) : ''
	const duplicateCurrentHero = currentHash
		? (imageHashFiles.get(currentHash)?.length ?? 0) > 1
		: false
	const existingImageHashes = new Set(imageHashFiles.keys())
	if (currentHash) existingImageHashes.delete(currentHash)

	return {
		duplicateCurrentHero,
		existingImageHashes,
		existingPhotoKeys: photoKeys,
		existingCreditUrls: creditUrls
	}
}

async function fetchJson(url) {
	const response = await fetch(url, {
		headers: {
			Authorization: `Client-ID ${ACCESS_KEY}`,
			'Accept-Version': 'v1'
		}
	})

	if (!response.ok) {
		throw new Error(`Unsplash request failed: ${response.status} ${response.statusText}`)
	}

	return response.json()
}

async function downloadPhotoBytes(photo) {
	await fetchJson(photo.links.download_location)

	const response = await fetch(imageUrl(photo.urls.raw))
	if (!response.ok) {
		throw new Error(`Unsplash image download failed: ${response.status} ${response.statusText}`)
	}

	return Buffer.from(await response.arrayBuffer())
}

async function downloadImage(photo, outputPath, bytes) {
	const imageBytes = bytes ?? (await downloadPhotoBytes(photo))
	await mkdir(path.dirname(outputPath), { recursive: true })
	await writeFile(outputPath, imageBytes)
}

function photoCreditUrl(photo) {
	const userUrl = photo.user?.links?.html ?? photo.links.html
	const url = new URL(userUrl)
	url.searchParams.set('utm_source', 'daylight_research_atlas')
	url.searchParams.set('utm_medium', 'referral')
	return url.toString()
}

export async function selectUniqueUnsplashPhoto({
	queries,
	existingImageHashes,
	existingPhotoKeys,
	searchPhotos,
	downloadPhotoBytes
}) {
	for (const query of queries) {
		const photos = await searchPhotos(query)

		for (const photo of photos) {
			if (!photo.urls?.raw || !photo.links?.download_location) continue

			const photoKey = unsplashPhotoKey(photo)
			if (photoKey && existingPhotoKeys.has(photoKey)) continue

			const bytes = await downloadPhotoBytes(photo)
			const hash = imageHash(bytes)
			if (existingImageHashes.has(hash)) continue

			return { photo, query, bytes, hash }
		}
	}

	return null
}

async function searchUnsplashPhotos(query) {
	const searchUrl = new URL('https://api.unsplash.com/search/photos')
	searchUrl.searchParams.set('query', query)
	searchUrl.searchParams.set('orientation', 'landscape')
	searchUrl.searchParams.set('content_filter', 'high')
	searchUrl.searchParams.set('per_page', '10')

	const result = await fetchJson(searchUrl)
	return result.results ?? []
}

async function selectHero(file) {
	const source = await readFile(file, 'utf8')
	const { raw, full } = frontmatterOf(source, file)
	const query = readScalar(raw, 'heroImageQuery')
	const currentHero = readScalar(raw, 'heroImage')
	const contentType = readScalar(raw, 'contentType')

	if (!query) return false
	const state = existingHeroState({ currentFile: file })
	if (currentHero && !PLACEHOLDER_RE.test(currentHero) && !state.duplicateCurrentHero) return false
	if (!ACCESS_KEY) {
		throw new Error('UNSPLASH_ACCESS_KEY is required when heroImageQuery is set')
	}

	const queries = buildRetryQueries(query, {
		contentType,
		focusTerms: extractFocusTerms(source, raw)
	})

	const selected = await selectUniqueUnsplashPhoto({
		queries,
		existingImageHashes: state.existingImageHashes,
		existingPhotoKeys: state.existingPhotoKeys,
		searchPhotos: searchUnsplashPhotos,
		downloadPhotoBytes
	})

	if (!selected) {
		console.warn(`No Unsplash photo found for ${file}; keeping existing heroImage: ${query}`)
		return false
	}

	const slug = path.basename(path.dirname(file))
	const outputPath = path.join(IMAGE_DIR, `${slug}.jpg`)
	await downloadImage(selected.photo, outputPath, selected.bytes)

	const relativeHeroPath = path
		.relative(path.dirname(file), outputPath)
		.split(path.sep)
		.join(path.posix.sep)
	const alt =
		readScalar(raw, 'heroImageAlt') ||
		selected.photo.alt_description ||
		selected.photo.description ||
		`${query} header image`
	const credit = `Photo by ${selected.photo.user.name} on Unsplash`

	let nextFrontmatter = raw
	nextFrontmatter = upsertScalar(nextFrontmatter, 'heroImage', relativeHeroPath, 'pubDate')
	nextFrontmatter = upsertScalar(nextFrontmatter, 'heroImageAlt', alt, 'heroImage')
	nextFrontmatter = upsertScalar(nextFrontmatter, 'heroImageCredit', credit, 'heroImageAlt')
	nextFrontmatter = upsertScalar(
		nextFrontmatter,
		'heroImageCreditUrl',
		photoCreditUrl(selected.photo),
		'heroImageCredit'
	)
	nextFrontmatter = upsertScalar(
		nextFrontmatter,
		'heroImageSourceId',
		unsplashPhotoKey(selected.photo),
		'heroImageCreditUrl'
	)

	await writeFile(file, source.replace(full, `---\n${nextFrontmatter}\n---`))
	console.log(`Selected Unsplash hero for ${file}: ${selected.query}`)
	return true
}

async function main() {
	const files = changedBlogEntries()
	let changed = false

	for (const file of files) {
		try {
			changed = (await selectHero(file)) || changed
		} catch (error) {
			console.error(`Failed to select Unsplash hero for ${file}: ${error.message}`)
			if (!process.argv.includes('--all')) {
				throw error
			}
		}
	}

	if (!changed) {
		console.log('No blog entries needed Unsplash hero selection.')
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	await main()
}
