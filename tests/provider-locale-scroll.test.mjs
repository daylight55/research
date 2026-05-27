import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = new URL('..', import.meta.url)
const providerLocalePath = join(repoRoot.pathname, 'src/components/ProviderLocale.astro')

test('locale switch scroll restoration cancels stale restore attempts', async () => {
	const source = await readFile(providerLocalePath, 'utf8')

	assert.match(source, /let scrollRestoreRun = 0/)
	assert.match(source, /const clearScheduledScrollRestores = \(\) =>/)
	assert.match(source, /if \(restoreRun !== scrollRestoreRun\) return/)
	assert.match(source, /if \(readSavedScrollPosition\(\) !== saved\) return/)
	assert.match(source, /clearSavedScrollPosition\(\)\s+clearScheduledScrollRestores\(\)/)
	assert.match(
		source,
		/clearWhenRestored\(\)\s+if \(readSavedScrollPosition\(\) !== saved\) return/
	)
	assert.doesNotMatch(source, /window\.setTimeout\(clearWhenRestored,\s*\d+/)
})

test('locale switch scroll restoration is aborted by user scroll input', async () => {
	const source = await readFile(providerLocalePath, 'utf8')

	assert.match(source, /const cancelScrollRestoreForUserInput = \(\) =>/)
	assert.match(
		source,
		/window\.addEventListener\('wheel', cancelScrollRestoreForUserInput, \{ passive: true \}\)/
	)
	assert.match(
		source,
		/window\.addEventListener\('touchmove', cancelScrollRestoreForUserInput, \{ passive: true \}\)/
	)
	assert.match(source, /window\.addEventListener\('keydown', cancelScrollRestoreForScrollKey\)/)
	assert.match(source, /'PageDown'/)
	assert.match(source, /'PageUp'/)
})
