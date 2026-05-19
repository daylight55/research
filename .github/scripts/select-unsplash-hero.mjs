import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const IMAGE_DIR = path.join('src', 'assets', 'images', 'hero')
const PLACEHOLDER_RE = /placeholder|banner\.jpg|book\.jpg|placeholder-social/i

function changedBlogEntries() {
	const output = execFileSync(
		'git',
		['ls-files', '--modified', '--others', '--exclude-standard', '--', 'src/content/blog/*.mdx'],
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

async function downloadImage(photo, outputPath) {
	await fetchJson(photo.links.download_location)

	const response = await fetch(imageUrl(photo.urls.raw))
	if (!response.ok) {
		throw new Error(`Unsplash image download failed: ${response.status} ${response.statusText}`)
	}

	const bytes = Buffer.from(await response.arrayBuffer())
	await mkdir(path.dirname(outputPath), { recursive: true })
	await writeFile(outputPath, bytes)
}

function photoCreditUrl(photo) {
	const userUrl = photo.user?.links?.html ?? photo.links.html
	const url = new URL(userUrl)
	url.searchParams.set('utm_source', 'daylight_research_atlas')
	url.searchParams.set('utm_medium', 'referral')
	return url.toString()
}

async function selectHero(file) {
	const source = await readFile(file, 'utf8')
	const { raw, full } = frontmatterOf(source, file)
	const query = readScalar(raw, 'heroImageQuery')
	const currentHero = readScalar(raw, 'heroImage')

	if (!query) return false
	if (currentHero && !PLACEHOLDER_RE.test(currentHero)) return false
	if (!ACCESS_KEY) {
		throw new Error('UNSPLASH_ACCESS_KEY is required when heroImageQuery is set')
	}

	const searchUrl = new URL('https://api.unsplash.com/search/photos')
	searchUrl.searchParams.set('query', query)
	searchUrl.searchParams.set('orientation', 'landscape')
	searchUrl.searchParams.set('content_filter', 'high')
	searchUrl.searchParams.set('per_page', '10')

	const result = await fetchJson(searchUrl)
	const photo = result.results?.find((candidate) => candidate.urls?.raw && candidate.links?.download_location)
	if (!photo) {
		throw new Error(`No Unsplash photo found for query: ${query}`)
	}

	const slug = path.basename(file, path.extname(file))
	const outputPath = path.join(IMAGE_DIR, `${slug}.jpg`)
	await downloadImage(photo, outputPath)

	const relativeHeroPath = path.posix.join('../../assets/images/hero', `${slug}.jpg`)
	const alt =
		readScalar(raw, 'heroImageAlt') ||
		photo.alt_description ||
		photo.description ||
		`${query} header image`
	const credit = `Photo by ${photo.user.name} on Unsplash`

	let nextFrontmatter = raw
	nextFrontmatter = upsertScalar(nextFrontmatter, 'heroImage', relativeHeroPath, 'pubDate')
	nextFrontmatter = upsertScalar(nextFrontmatter, 'heroImageAlt', alt, 'heroImage')
	nextFrontmatter = upsertScalar(nextFrontmatter, 'heroImageCredit', credit, 'heroImageAlt')
	nextFrontmatter = upsertScalar(nextFrontmatter, 'heroImageCreditUrl', photoCreditUrl(photo), 'heroImageCredit')

	await writeFile(file, source.replace(full, `---\n${nextFrontmatter}\n---`))
	console.log(`Selected Unsplash hero for ${file}: ${query}`)
	return true
}

const files = changedBlogEntries()
let changed = false

for (const file of files) {
	changed = (await selectHero(file)) || changed
}

if (!changed) {
	console.log('No blog entries needed Unsplash hero selection.')
}
