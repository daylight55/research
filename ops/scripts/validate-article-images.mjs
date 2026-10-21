import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function attributes(source) {
	return Object.fromEntries(
		[...source.matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].map(
			(match) => [match[1], match[2] ?? match[3] ?? match[4] ?? '']
		)
	)
}

function textContent(source) {
	return source
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

export function validateArticleImages(
	html,
	{ file = 'article.html', assetExists = () => true } = {}
) {
	const errors = []
	const figures = [
		...html.matchAll(/<figure\b[^>]*\bdata-article-figure\b[^>]*>([\s\S]*?)<\/figure>/gi)
	]
	for (const [index, match] of figures.entries()) {
		const label = `${file}: figure ${index + 1}`
		const content = match[1]
		const image = content.match(/<img\b([^>]+)>/i)
		if (!image) {
			errors.push(`${label}: image did not render`)
			continue
		}
		const props = attributes(image[1])
		const imageLink = content.slice(0, image.index).match(/<a\b([^>]+)>/i)
		if (!props.alt?.trim()) errors.push(`${label}: descriptive alt text is required`)
		if (!(Number(props.width) > 0 && Number(props.height) > 0)) {
			errors.push(`${label}: intrinsic width and height are required`)
		}
		const sources = [
			props.src,
			imageLink && attributes(imageLink[1]).href,
			...(props.srcset ?? '').split(',').map((item) => item.trim().split(/\s+/)[0])
		].filter(Boolean)
		if (!props.src) errors.push(`${label}: image src is required`)
		for (const source of new Set(sources)) {
			if (!/^(?:https?:|data:|\/\/)/i.test(source) && !assetExists(source)) {
				errors.push(`${label}: missing image asset ${source}`)
			}
		}
		const caption = content.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1] ?? ''
		if (!textContent(caption)) errors.push(`${label}: visible caption is required`)
		const sourceLink = caption.match(/<a\b([^>]*\bdata-figure-source\b[^>]*)>([\s\S]*?)<\/a>/i)
		if (
			!sourceLink ||
			!textContent(sourceLink[2]) ||
			!/^https?:\/\//.test(attributes(sourceLink[1]).href ?? '')
		) {
			errors.push(`${label}: linked source credit is required`)
		}
		const rights =
			caption.match(/<span\b[^>]*\bdata-figure-rights\b[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? ''
		if (!textContent(rights)) errors.push(`${label}: rights information is required`)
	}
	return { count: figures.length, errors }
}

function htmlFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const file = path.join(dir, entry.name)
		return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : []
	})
}

function main() {
	const root = path.resolve('dist')
	if (!existsSync(root)) throw new Error('Build the site before validating article images.')
	const base = (process.env.ASTRO_BASE ?? '/').replace(/\/$/, '')
	let count = 0
	const errors = []
	for (const file of htmlFiles(root)) {
		const result = validateArticleImages(readFileSync(file, 'utf8'), {
			file: path.relative(root, file),
			assetExists: (source) => {
				let pathname = decodeURIComponent(source.replace(/&amp;/g, '&').split(/[?#]/)[0])
				if (base && pathname.startsWith(`${base}/`)) pathname = pathname.slice(base.length)
				return existsSync(
					path.resolve(root, `.${pathname.startsWith('/') ? pathname : `/${pathname}`}`)
				)
			}
		})
		count += result.count
		errors.push(...result.errors)
	}
	if (errors.length) {
		errors.forEach((error) => console.error(`::error::${error}`))
		process.exitCode = 1
	} else {
		console.log(
			`Validated ${count} rendered article figures: images, dimensions, captions, credits, and rights.`
		)
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
