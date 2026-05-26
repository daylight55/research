import { readFileSync } from 'node:fs'
import { strict as assert } from 'node:assert'

const workflow = readFileSync(
	'.github/workflows/daily-issue-research.yml',
	'utf8',
)
const trendWorkflow = readFileSync(
	'.github/workflows/daily-trend-news.yml',
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

assert.match(
	workflow,
	/- name: Create research repository token[\s\S]*?id: research_app_token[\s\S]*?uses: actions\/create-github-app-token@v3[\s\S]*?repositories: \$\{\{ env\.RESEARCH_REPOSITORY \}\}/,
	'workflow should create a GitHub App installation token for the research repository',
)

assert.match(
	workflow,
	/- name: Create research pull request[\s\S]*?GH_TOKEN: \$\{\{ github\.token \}\}[\s\S]*?PR_GH_TOKEN: \$\{\{ steps\.research_app_token\.outputs\.token \}\}[\s\S]*?GH_TOKEN="\$\{PR_GH_TOKEN\}" gh pr create/,
	'Daily Issue Research should push refs with GITHUB_TOKEN and create PRs with the GitHub App token',
)

assert.match(
	workflow,
	/- name: Merge completed research pull request[\s\S]*?if: steps\.create_pr\.outputs\.pr_url != ''/,
	'Daily Issue Research should merge created research PRs without requiring an opt-in label',
)

assert.doesNotMatch(
	workflow,
	/auto_merge_allowed|daily-research-auto-merge|AUTO_MERGE_LABEL/,
	'Daily Issue Research should not gate auto-merge on an issue label',
)

assert.match(
	trendWorkflow,
	/- name: Create research repository token[\s\S]*?id: research_app_token[\s\S]*?uses: actions\/create-github-app-token@v3[\s\S]*?repositories: \$\{\{ env\.RESEARCH_REPOSITORY \}\}/,
	'Daily Trend News should create a GitHub App installation token for the research repository',
)

assert.match(
	trendWorkflow,
	/- name: Create trend news pull request[\s\S]*?GH_TOKEN: \$\{\{ github\.token \}\}[\s\S]*?PR_GH_TOKEN: \$\{\{ steps\.research_app_token\.outputs\.token \}\}[\s\S]*?GH_TOKEN="\$\{PR_GH_TOKEN\}" gh pr create/,
	'Daily Trend News should push refs with GITHUB_TOKEN and create PRs with the GitHub App token',
)

assert.match(
	trendWorkflow,
	/- name: Create trend news pull request[\s\S]*?echo "base_ref_oid=\$\{base_ref_oid\}"/,
	'Daily Trend News should record the base ref used before generating the merge PR',
)

assert.match(
	trendWorkflow,
	/- name: Merge completed trend news pull request[\s\S]*?if: steps\.create_pr\.outputs\.pr_url != ''[\s\S]*?--match-head-commit "\$\{head_ref_oid\}"/,
	'Daily Trend News should merge created trend PRs in the same workflow run',
)

assert.match(
	trendWorkflow,
	/cache_key="daily-trend-news-\$\{report_date\}"[\s\S]*?cache_key="\$\{cache_key\}-\$\{topic_hint_hash\}"/,
	'trend news workflow should derive a date cache key and include topic hint when present',
)

assert.match(
	trendWorkflow,
	/- name: Restore cached generated news article[\s\S]*?uses: actions\/cache\/restore@v4[\s\S]*?key: \$\{\{ steps\.run_context\.outputs\.cache_key \}\}/,
	'trend news workflow should restore generated news artifacts from the run cache before running Codex',
)

assert.match(
	trendWorkflow,
	/- name: Run Codex trend news research[\s\S]*?if: steps\.restore_generated_news_article\.outputs\.cache-hit != 'true'/,
	'trend news workflow should skip Codex generation when generated news artifacts were restored from cache',
)

assert.match(
	trendWorkflow,
	/import NewsSourceCard from '\.\.\/\.\.\/\.\.\/src\/components\/mdx\/NewsSourceCard\.astro'/,
	'trend news workflow should require generated articles to import NewsSourceCard',
)

assert.match(
	trendWorkflow,
	/News article title must summarize the day's overall situation instead of listing generic categories/,
	'trend news workflow should reject generic date plus category-list titles',
)

assert.match(
	trendWorkflow,
	/News article title and H1 must match/,
	'trend news workflow should require News title and H1 to match',
)

assert.match(
	trendWorkflow,
	/source_card_count="\$\(grep -cF "<NewsSourceCard" "\$\{ARTICLE_PATH\}" \|\| true\)"[\s\S]*?source_card_count < 15/,
	'trend news workflow should require at least one NewsSourceCard source memo card per topic',
)

assert.match(
	trendWorkflow,
	/NewsSourceCard for source memos instead of plain 出典メモ: lines/,
	'trend news workflow should reject plain source memo lines in News digests',
)

assert.match(
	workflow,
	/- name: Verify unique hero images[\s\S]*?pnpm test:hero-images/,
	'Daily Issue Research should verify all published hero images are concrete and unique after selecting Unsplash heroes',
)

assert.match(
	trendWorkflow,
	/- name: Verify unique hero images[\s\S]*?pnpm test:hero-images/,
	'Daily Trend News should verify all published hero images are concrete and unique after selecting Unsplash heroes',
)

assert.match(
	trendWorkflow,
	/heroImageQuery.*generic news collage query/,
	'trend news workflow should reject generic catch-image search phrases',
)

assert.match(
	trendWorkflow,
	/image_url_count="\$\(grep -cF "imageUrl=" "\$\{ARTICLE_PATH\}" \|\| true\)"[\s\S]*?image_url_count < 15/,
	'trend news workflow should require imageUrl on each NewsSourceCard',
)

assert.match(
	trendWorkflow,
	/image_alt_count="\$\(grep -cF "imageAlt=" "\$\{ARTICLE_PATH\}" \|\| true\)"[\s\S]*?image_alt_count < 15/,
	'trend news workflow should require imageAlt on each NewsSourceCard',
)

assert.match(
	trendWorkflow,
	/source\.unsplash\.com[\s\S]*?deprecated source\.unsplash\.com dynamic URLs/,
	'trend news workflow should reject deprecated dynamic Unsplash image URLs',
)

assert.match(
	trendWorkflow,
	/- name: Save generated news article cache[\s\S]*?uses: actions\/cache\/save@v4[\s\S]*?key: \$\{\{ steps\.run_context\.outputs\.cache_key \}\}/,
	'trend news workflow should save completed generated news artifacts in the run cache',
)
