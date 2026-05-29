import { readFileSync } from 'node:fs'
import { strict as assert } from 'node:assert'

const workflow = readFileSync('.github/workflows/daily-issue-research.yml', 'utf8')
const trendWorkflow = readFileSync('.github/workflows/daily-trend-news.yml', 'utf8')
const dailyIssuePrompt = readFileSync('ops/codex/prompts/daily-issue-research.md', 'utf8')
const cloudflarePreviewWorkflow = readFileSync(
	'.github/workflows/cloudflare-pages-preview.yml',
	'utf8'
)
const cloudflareDeployWorkflow = readFileSync(
	'.github/workflows/cloudflare-pages-deploy.yml',
	'utf8'
)
const translateBlogWorkflow = readFileSync('.github/workflows/translate-blog-en.yml', 'utf8')
const testWorkflow = readFileSync('.github/workflows/test.yml', 'utf8')

assert.match(
	workflow,
	/- name: Restore cached generated article[\s\S]*?uses: actions\/cache\/restore@v4[\s\S]*?key: daily-issue-research-\$\{\{ steps\.select_issue\.outputs\.issue_number \}\}/,
	'workflow should restore generated article artifacts from an issue-specific cache before running Codex'
)

assert.match(
	workflow,
	/- name: Run Codex research[\s\S]*?if: steps\.select_issue\.outputs\.issue_found == 'true' && steps\.restore_generated_article\.outputs\.cache-hit != 'true'/,
	'workflow should skip Codex generation when generated article artifacts were restored from cache'
)

assert.match(
	workflow,
	/OPENAI_MODEL: gpt-5\.4-mini[\s\S]*?model: \$\{\{ env\.OPENAI_MODEL \}\}[\s\S]*?OPENAI_USAGE_MODEL: \$\{\{ env\.OPENAI_MODEL \}\}/,
	'Daily Issue Research should define the Codex model once and reuse it for generation and usage reporting'
)

assert.match(
	workflow,
	/## Automation Metadata[\s\S]*?- Model: \$\{OPENAI_MODEL\}[\s\S]*?research-report[\s\S]*?ops\/codex\/prompts\/daily-issue-research\.md/,
	'Daily Issue Research should pass model, skill, and prompt metadata into the generated research prompt'
)

assert.doesNotMatch(
	workflow,
	/Selected Issue Context[\s\S]*?- URL: \\\(\.url\\\)/,
	'Daily Issue Research should not pass private research queue issue URLs into the generated prompt'
)

assert.match(
	workflow,
	/Required skill: \[research-report\]\(https:\/\/github\.com\/\$\{GITHUB_REPOSITORY\}\/blob\/main\/\.codex\/skills\/research-report\/SKILL\.md\)[\s\S]*?Prompt source: \[ops\/codex\/prompts\/daily-issue-research\.md\]\(https:\/\/github\.com\/\$\{GITHUB_REPOSITORY\}\/blob\/main\/ops\/codex\/prompts\/daily-issue-research\.md\)/,
	'Daily Issue Research should pass public GitHub URLs for skill and prompt source metadata'
)

assert.match(
	dailyIssuePrompt,
	/research-log\.mdx[\s\S]*?## 利用環境[\s\S]*?model[\s\S]*?research-report[\s\S]*?ops\/codex\/prompts\/daily-issue-research\.md/,
	'Daily Issue Research prompt should require model, skill, and prompt metadata in research logs'
)

assert.match(
	dailyIssuePrompt,
	/generation[\s\S]*?model/,
	'Daily Issue Research prompt should require frontmatter generation model metadata for generated reports'
)

assert.doesNotMatch(
	dailyIssuePrompt,
	/frontmatter[\s\S]*?promptSource|frontmatter[\s\S]*?promptSummary/,
	'Daily Issue Research prompt should not ask article frontmatter to store prompt details'
)

assert.match(
	trendWorkflow,
	/OPENAI_MODEL: gpt-5\.4-mini[\s\S]*?model: \$\{\{ env\.OPENAI_MODEL \}\}/,
	'Daily Trend News should define the Codex model once and reuse it for generation'
)

assert.match(
	trendWorkflow,
	/## Automation Metadata[\s\S]*?- Model: \$\{OPENAI_MODEL\}[\s\S]*?ops\/codex\/prompts\/daily-trend-news\.md/,
	'Daily Trend News should pass model and prompt metadata into the generated news prompt'
)

assert.match(
	trendWorkflow,
	/Prompt source: \[ops\/codex\/prompts\/daily-trend-news\.md\]\(https:\/\/github\.com\/\$\{GITHUB_REPOSITORY\}\/blob\/main\/ops\/codex\/prompts\/daily-trend-news\.md\)/,
	'Daily Trend News should pass a public GitHub URL for prompt source metadata'
)

assert.match(
	trendWorkflow,
	/OPENAI_USAGE_MODEL: \$\{\{ env\.OPENAI_MODEL \}\}/,
	'Daily Trend News should reuse the configured model for usage reporting'
)

assert.match(
	dailyIssuePrompt,
	/articles\/report\/<topic>\/ja\/research-log\.mdx[\s\S]*?## 調査命令[\s\S]*?issue[\s\S]*?title[\s\S]*?body/,
	'Daily Issue Research prompt should ask research logs to summarize the issue-based research instruction'
)

assert.match(
	dailyIssuePrompt,
	/Do not include an issue URL because the research queue[\s\S]*?may be private/,
	'Daily Issue Research prompt should keep private issue URLs out of research logs'
)

assert.match(
	dailyIssuePrompt,
	/## 利用環境[\s\S]*?model[\s\S]*?research-report[\s\S]*?ops\/codex\/prompts\/daily-issue-research\.md/,
	'Daily Issue Research prompt should keep execution metadata in research logs separately from the research instruction'
)

assert.match(
	readFileSync('ops/codex/prompts/daily-trend-news.md', 'utf8'),
	/research-log\.mdx[\s\S]*?## 調査命令[\s\S]*?Run Context[\s\S]*?topic hint/,
	'Daily Trend News prompt should ask optional research logs to summarize the run instruction context'
)

assert.match(
	readFileSync('ops/codex/prompts/daily-trend-news.md', 'utf8'),
	/title[\s\S]*?80 characters or fewer/,
	'Daily Trend News prompt should keep generated titles within the Astro schema limit'
)

assert.match(
	workflow,
	/- name: Restore Node for site build[\s\S]*?uses: actions\/setup-node@v4[\s\S]*?node-version-file: \.nvmrc/,
	'workflow should restore the repository Node.js version after Codex before running Node-based checks and builds'
)

assert.match(
	workflow,
	/- name: Save generated article cache[\s\S]*?uses: actions\/cache\/save@v4[\s\S]*?key: daily-issue-research-\$\{\{ steps\.select_issue\.outputs\.issue_number \}\}/,
	'workflow should save completed generated article artifacts in an issue-specific cache'
)

assert.match(
	workflow,
	/- name: Create research repository token[\s\S]*?id: research_app_token[\s\S]*?uses: actions\/create-github-app-token@v3[\s\S]*?repositories: \$\{\{ env\.RESEARCH_REPOSITORY \}\}/,
	'workflow should create a GitHub App installation token for the research repository'
)

assert.match(
	workflow,
	/- name: Create research pull request[\s\S]*?GH_TOKEN: \$\{\{ github\.token \}\}[\s\S]*?PR_GH_TOKEN: \$\{\{ steps\.research_app_token\.outputs\.token \}\}[\s\S]*?GH_TOKEN="\$\{PR_GH_TOKEN\}" gh pr create/,
	'Daily Issue Research should push refs with GITHUB_TOKEN and create PRs with the GitHub App token'
)

assert.match(
	workflow,
	/- name: Merge completed research pull request[\s\S]*?if: steps\.create_pr\.outputs\.pr_url != ''/,
	'Daily Issue Research should merge created research PRs without requiring an opt-in label'
)

assert.match(
	workflow,
	/- name: Create research pull request[\s\S]*?head_ref_oid="\$\(git rev-parse HEAD\)"[\s\S]*?echo "head_ref_oid=\$\{head_ref_oid\}"/,
	'Daily Issue Research should expose the generated PR head SHA for preview checkout'
)

assert.match(
	workflow,
	/- name: Dispatch Cloudflare preview deploy[\s\S]*?PREVIEW_CHECKOUT_REF: \$\{\{ steps\.create_pr\.outputs\.head_ref_oid \}\}[\s\S]*?-f checkout_ref="\$\{PREVIEW_CHECKOUT_REF\}"/,
	'Daily Issue Research should dispatch previews with an immutable checkout SHA instead of a branch that can be deleted after merge'
)

assert.doesNotMatch(
	workflow,
	/auto_merge_allowed|daily-research-auto-merge|AUTO_MERGE_LABEL/,
	'Daily Issue Research should not gate auto-merge on an issue label'
)

assert.match(
	trendWorkflow,
	/- name: Create research repository token[\s\S]*?id: research_app_token[\s\S]*?uses: actions\/create-github-app-token@v3[\s\S]*?repositories: \$\{\{ env\.RESEARCH_REPOSITORY \}\}/,
	'Daily Trend News should create a GitHub App installation token for the research repository'
)

assert.match(
	trendWorkflow,
	/- name: Create trend news pull request[\s\S]*?GH_TOKEN: \$\{\{ github\.token \}\}[\s\S]*?PR_GH_TOKEN: \$\{\{ steps\.research_app_token\.outputs\.token \}\}[\s\S]*?GH_TOKEN="\$\{PR_GH_TOKEN\}" gh pr create/,
	'Daily Trend News should push refs with GITHUB_TOKEN and create PRs with the GitHub App token'
)

assert.match(
	trendWorkflow,
	/- name: Create trend news pull request[\s\S]*?echo "base_ref_oid=\$\{base_ref_oid\}"/,
	'Daily Trend News should record the base ref used before generating the merge PR'
)

assert.match(
	trendWorkflow,
	/- name: Create trend news pull request[\s\S]*?head_ref_oid="\$\(git rev-parse HEAD\)"[\s\S]*?echo "head_ref_oid=\$\{head_ref_oid\}"/,
	'Daily Trend News should expose the generated PR head SHA for preview checkout'
)

assert.match(
	trendWorkflow,
	/- name: Dispatch Cloudflare preview deploy[\s\S]*?PREVIEW_CHECKOUT_REF: \$\{\{ steps\.create_pr\.outputs\.head_ref_oid \}\}[\s\S]*?-f checkout_ref="\$\{PREVIEW_CHECKOUT_REF\}"/,
	'Daily Trend News should dispatch previews with an immutable checkout SHA instead of a branch that can be deleted after merge'
)

assert.match(
	trendWorkflow,
	/- name: Merge completed trend news pull request[\s\S]*?if: steps\.create_pr\.outputs\.pr_url != ''[\s\S]*?--match-head-commit "\$\{head_ref_oid\}"/,
	'Daily Trend News should merge created trend PRs in the same workflow run'
)

assert.match(
	trendWorkflow,
	/- name: Dispatch English translation workflow[\s\S]*?if: steps\.merge_pr\.outcome == 'success'[\s\S]*?gh workflow run translate-blog-en\.yml --ref main/,
	'Daily Trend News should dispatch the English translation workflow after merging a generated news PR'
)

assert.match(
	translateBlogWorkflow,
	/allow-bot-users: daylight55-research-queue\[bot\]/,
	'Translate Blog English should allow the research queue GitHub App bot that dispatches the workflow'
)

assert.match(
	translateBlogWorkflow,
	/- name: Validate translated site[\s\S]*?node ops\/scripts\/validate-mix-alignment\.mjs --changed/,
	'Translate Blog English should validate mix-alignment coverage for newly translated articles'
)

assert.match(
	translateBlogWorkflow,
	/- name: Validate existing mixed article alignment[\s\S]*?node ops\/scripts\/validate-mix-alignment\.mjs(?! --changed)/,
	'Translate Blog English should validate existing mixed article alignment even when no English articles are missing'
)

assert.match(
	testWorkflow,
	/fetch-depth: 0[\s\S]*?node ops\/scripts\/validate-mix-alignment\.mjs --changed origin\/\$\{\{ github\.base_ref \}\}\.\.\.HEAD/,
	'Pull request tests should validate mix-alignment coverage for changed article files against the base branch'
)

assert.match(
	testWorkflow,
	/- name: Validate all mixed article alignment[\s\S]*?if: github\.event_name != 'pull_request'[\s\S]*?node ops\/scripts\/validate-mix-alignment\.mjs(?! --changed)/,
	'Main and manual test runs should validate all mixed article alignment, including articles generated by Actions'
)

assert.match(
	dailyIssuePrompt,
	/articles\/report\/<topic>\/mix-alignment\.json[\s\S]*?semantic[\s\S]*?Japanese-English reading map[\s\S]*?at least 35%/,
	'Daily Issue Research prompt should require a sufficiently covered mix-alignment file for generated bilingual reports'
)

assert.match(
	trendWorkflow,
	/cache_key="daily-trend-news-\$\{report_date\}"[\s\S]*?cache_key="\$\{cache_key\}-\$\{topic_hint_hash\}"/,
	'trend news workflow should derive a date cache key and include topic hint when present'
)

assert.match(
	trendWorkflow,
	/- name: Restore cached generated news article[\s\S]*?uses: actions\/cache\/restore@v4[\s\S]*?key: \$\{\{ steps\.run_context\.outputs\.cache_key \}\}/,
	'trend news workflow should restore generated news artifacts from the run cache before running Codex'
)

assert.doesNotMatch(
	trendWorkflow,
	/echo "::error::News article already exists for \$\{report_date\}/,
	'trend news workflow should not fail before cache restore when the dated article already exists'
)

assert.match(
	trendWorkflow,
	/echo "article_exists=\$\{article_exists\}"[\s\S]*?steps\.run_context\.outputs\.article_exists != 'true' && steps\.restore_generated_news_article\.outputs\.cache-hit != 'true'/,
	'trend news workflow should record existing articles and skip Codex when the dated article already exists'
)

assert.match(
	trendWorkflow,
	/- name: Apply cached generated news article[\s\S]*?if: steps\.run_context\.outputs\.article_exists != 'true' && steps\.restore_generated_news_article\.outputs\.cache-hit == 'true'/,
	'trend news workflow should apply cached generated artifacts only when the dated article is not already committed'
)

assert.match(
	trendWorkflow,
	/- name: Run Codex trend news research[\s\S]*?if: steps\.run_context\.outputs\.article_exists != 'true' && steps\.restore_generated_news_article\.outputs\.cache-hit != 'true'/,
	'trend news workflow should skip Codex generation when generated news artifacts were restored from cache or the article already exists'
)

assert.match(
	trendWorkflow,
	/import NewsSourceCard from '\.\.\/\.\.\/\.\.\/\.\.\/src\/components\/mdx\/NewsSourceCard\.astro'/,
	'trend news workflow should require generated articles to import NewsSourceCard'
)

assert.match(
	trendWorkflow,
	/News article title must summarize the day's overall situation instead of listing generic categories/,
	'trend news workflow should reject generic date plus category-list titles'
)

assert.match(
	trendWorkflow,
	/News article title and H1 must match/,
	'trend news workflow should require News title and H1 to match'
)

assert.match(
	trendWorkflow,
	/for localized_article_path in "articles\/news\/\$\{SLUG\}"\/\{ja,en\}\/index\.mdx[\s\S]*?News article titles must be 80 characters or fewer/,
	'Daily Trend News should reject localized titles that exceed the Astro schema limit before building'
)

assert.match(
	trendWorkflow,
	/for localized_article_path in "articles\/news\/\$\{SLUG\}"\/\{ja,en\}\/index\.mdx[\s\S]*?section_open_count="\$\(grep -cF "<NewsDigestSection tone="[\s\S]*?section_close_count="\$\(grep -cF "<\/NewsDigestSection>"[\s\S]*?exactly three balanced NewsDigestSection blocks/,
	'Daily Trend News should reject localized MDX with unbalanced NewsDigestSection tags before building'
)

assert.match(
	readFileSync('ops/codex/prompts/daily-trend-news.md', 'utf8'),
	/exactly three balanced[\s\S]*?NewsDigestSection[\s\S]*?one politics[\s\S]*?one economy[\s\S]*?one technology/,
	'Daily Trend News prompt should require balanced localized NewsDigestSection blocks'
)

assert.match(
	trendWorkflow,
	/source_card_count="\$\(grep -cF "<NewsSourceCard" "\$\{ARTICLE_PATH\}" \|\| true\)"[\s\S]*?source_card_count < 15/,
	'trend news workflow should require at least one NewsSourceCard source memo card per topic'
)

assert.match(
	trendWorkflow,
	/NewsSourceCard for source memos instead of plain 出典メモ: lines/,
	'trend news workflow should reject plain source memo lines in News digests'
)

assert.match(
	workflow,
	/- name: Verify unique hero images[\s\S]*?pnpm test:hero-images/,
	'Daily Issue Research should verify all published hero images are concrete and unique after selecting Unsplash heroes'
)

assert.match(
	workflow,
	/- name: Verify generated mixed article alignment[\s\S]*?node ops\/scripts\/validate-mix-alignment\.mjs --changed/,
	'Daily Issue Research should reject generated bilingual articles without enough mix-alignment coverage'
)

assert.match(
	trendWorkflow,
	/- name: Verify unique hero images[\s\S]*?pnpm test:hero-images/,
	'Daily Trend News should verify all published hero images are concrete and unique after selecting Unsplash heroes'
)

assert.match(
	trendWorkflow,
	/heroImageQuery.*generic news collage query/,
	'trend news workflow should reject generic catch-image search phrases'
)

assert.match(
	trendWorkflow,
	/image_url_count="\$\(grep -cF "imageUrl=" "\$\{ARTICLE_PATH\}" \|\| true\)"[\s\S]*?image_url_count < 15/,
	'trend news workflow should require imageUrl on each NewsSourceCard'
)

assert.match(
	trendWorkflow,
	/image_alt_count="\$\(grep -cF "imageAlt=" "\$\{ARTICLE_PATH\}" \|\| true\)"[\s\S]*?image_alt_count < 15/,
	'trend news workflow should require imageAlt on each NewsSourceCard'
)

assert.match(
	trendWorkflow,
	/source\.unsplash\.com[\s\S]*?deprecated source\.unsplash\.com dynamic URLs/,
	'trend news workflow should reject deprecated dynamic Unsplash image URLs'
)

assert.match(
	trendWorkflow,
	/duplicate_image_urls="\$\([\s\S]*?count\[url\] == 2[\s\S]*?NewsSourceCard imageUrl values must be unique within one article/,
	'trend news workflow should reject duplicate NewsSourceCard imageUrl values within one article'
)

assert.match(
	trendWorkflow,
	/- name: Save generated news article cache[\s\S]*?uses: actions\/cache\/save@v4[\s\S]*?key: \$\{\{ steps\.run_context\.outputs\.cache_key \}\}/,
	'trend news workflow should save completed generated news artifacts in the run cache'
)

assert.match(
	cloudflarePreviewWorkflow,
	/concurrency:[\s\S]*?group: cloudflare-pages-preview-[\s\S]*?cancel-in-progress: false/,
	'Cloudflare preview should not cancel the pull_request check when generated PR workflows dispatch a second preview for the same branch'
)

assert.match(
	cloudflareDeployWorkflow,
	/command: pages deploy dist --project-name=daylight-research --branch=main --commit-message="Cloudflare Pages production deploy \$\{\{ github\.sha \}\}" --commit-dirty=true/,
	'Cloudflare production deploy should pass an ASCII commit message to Wrangler'
)
