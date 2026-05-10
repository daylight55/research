const baseUrl = import.meta.env.BASE_URL ?? '/'

const normalizedBase = baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '')

export function withBase(path: string) {
	if (
		path.startsWith('#') ||
		path.startsWith('mailto:') ||
		path.startsWith('tel:') ||
		/^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(path)
	) {
		return path
	}

	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	if (normalizedBase && (normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`))) {
		return normalizedPath
	}

	return `${normalizedBase}${normalizedPath}` || '/'
}

export function withoutBase(path: string) {
	if (!normalizedBase) return path
	if (path === normalizedBase) return '/'
	if (path.startsWith(`${normalizedBase}/`)) return path.slice(normalizedBase.length)
	return path
}
