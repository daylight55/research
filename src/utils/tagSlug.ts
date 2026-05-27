export function tagSlug(tag: string): string {
	const normalized = tag
		.toLowerCase()
		.trim()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')

	if (normalized) return normalized

	const bytes = new TextEncoder().encode(tag.toLowerCase().trim())
	const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
	return `u-${hex}`
}
