import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('publication workflow defines test-gated auto-merge policy', async () => {
	const agents = await readFile('AGENTS.md', 'utf8')
	const skill = await readFile('.codex/skills/research-report/SKILL.md', 'utf8')
	const template = await readFile('.github/PULL_REQUEST_TEMPLATE.md', 'utf8')

	assert.match(agents, /命令内容を規定するテスト/)
	assert.match(agents, /自動マージを有効化または実行/)
	assert.match(agents, /--match-head-commit <head_sha>/)
	assert.match(agents, /テストで十分に規定できないレビュー観点が残る場合は自動マージせず/)

	assert.match(skill, /requested change is covered by explicit tests or verification steps/)
	assert.match(skill, /enable or perform auto-merge/)
	assert.match(skill, /--match-head-commit <HEAD_SHA>/)
	assert.match(
		skill,
		/Do not auto-merge when factual review, translation review, external approval/
	)

	assert.match(template, /命令内容を規定するテストまたは検証手順/)
	assert.match(template, /## 自動マージ判定/)
	assert.match(template, /自動マージしてよい/)
	assert.match(template, /自動マージしない/)
})

test('local PR CI parity command mirrors the GitHub pull_request test workflow', async () => {
	const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
	const script = await readFile('ops/scripts/run-pr-ci-locally.sh', 'utf8')

	assert.equal(packageJson.scripts['ci:pr'], 'bash ops/scripts/run-pr-ci-locally.sh')
	assert.equal(
		packageJson.scripts['ci:head'],
		'git diff --check && pnpm test && pnpm lint && pnpm build'
	)

	for (const command of [
		'git status --porcelain',
		'git fetch origin "${base_branch}"',
		'git worktree add --detach "${worktree_dir}" "${head_ref}"',
		'git merge --no-edit "${base_ref}"',
		'pnpm install --frozen-lockfile',
		'git diff --check',
		'pnpm test',
		'pnpm lint',
		'node ops/scripts/validate-news-item-format.mjs --changed "${base_ref}...HEAD"',
		'node ops/scripts/validate-mix-alignment.mjs --changed "${base_ref}...HEAD"',
		'node ops/scripts/validate-mix-alignment.mjs',
		'pnpm build'
	]) {
		assert.ok(script.includes(command), `local PR CI script should include: ${command}`)
	}
})
