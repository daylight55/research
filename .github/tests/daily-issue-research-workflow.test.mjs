import { readFileSync } from 'node:fs'
import { strict as assert } from 'node:assert'

const workflow = readFileSync(
	'.github/workflows/daily-issue-research.yml',
	'utf8',
)

assert.match(
	workflow,
	/- name: Restore cached generated article[\s\S]*?uses: actions\/cache\/restore@v4[\s\S]*?key: daily-issue-research-\$\{\{ steps\.select_issue\.outputs\.issue_number \}\}/,
	'workflow should restore generated article artifacts from an issue-specific cache before running Codex',
)

assert.match(
	workflow,
	/- name: Run Codex research[\s\S]*?if: steps\.select_issue\.outputs\.issue_found == 'true' && steps\.restore_generated_article\.outputs\.cache-hit != 'true'/,
	'workflow should skip Codex generation when generated article artifacts were restored from cache',
)

assert.match(
	workflow,
	/- name: Restore Node for site build[\s\S]*?uses: actions\/setup-node@v4[\s\S]*?node-version-file: \.nvmrc/,
	'workflow should restore the repository Node.js version after Codex before running Node-based checks and builds',
)

assert.match(
	workflow,
	/- name: Save generated article cache[\s\S]*?uses: actions\/cache\/save@v4[\s\S]*?key: daily-issue-research-\$\{\{ steps\.select_issue\.outputs\.issue_number \}\}/,
	'workflow should save completed generated article artifacts in an issue-specific cache',
)
