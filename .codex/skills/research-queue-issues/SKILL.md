---
name: research-queue-issues
description: Use when adding, updating, auditing, or explaining GitHub issues in daylight55/research-queue for the daylight55/research daily research automation, especially research topic queues, daily-research labels, priority numbering, issue body format, or automated report deliverables.
---

# Research Queue Issues

Use this skill to create durable `daylight55/research-queue` issues that the `daylight55/research` daily research workflow can turn into report PRs.

## Invariants

- Queue repository: `daylight55/research-queue`.
- Ready label: `daily-research`.
- Skip label: `research-skip`.
- Already-processed marker: `research-pr-opened`.
- The workflow selects the oldest open issue with `daily-research`, without `research-pr-opened`, and without `research-skip`.
- `daylight55/research` has issues disabled; do not create queue issues there.
- Public report deliverables must use current site paths:
  - `articles/report/<slug>/ja/index.mdx`
  - `articles/report/<slug>/en/index.mdx`
  - `articles/report/<slug>/mix-alignment.json`
  - `articles/report/<slug>/ja/source-notes.mdx`
  - `articles/report/<slug>/en/source-notes.mdx`
- Do not use obsolete completion paths such as `src/content/blog/<slug>.mdx` or `category/<category>/<slug>/research-tasks.md`.

## Workflow

1. Inspect existing queue state before creating issues:

```bash
gh issue list -R daylight55/research-queue --state all --limit 200 --json number,title,state,labels
gh label list -R daylight55/research-queue --limit 100
```

2. Check for duplicates by title, slug, country, region, and key concept. Include closed issues because completed reports may already cover the topic.

3. Choose numbering that extends the visible priority series. If the existing newest priority is `[50/50]` and adding 20 issues, use `[51/70]` through `[70/70]`. Use zero-padded two-digit current priority in titles.

4. Create issues with `gh issue create -R daylight55/research-queue --label daily-research`.

5. Verify every created issue:

```bash
gh issue list -R daylight55/research-queue --state open --limit 100 --json number,title,labels,url
gh issue view <number> -R daylight55/research-queue --json number,title,labels,body,url
```

6. If the user asked for a repository change in `daylight55/research`, commit and PR that change. If the only work is creating queue issues, report the created issue URLs and verification; no local diff is expected.

## Issue Title

Use this format:

```text
[NN/TT][地域] <調査テーマ>を調査する
```

Examples:

```text
[51/70][中国・サプライチェーン] 新疆ウイグル強制労働とサプライチェーン規制を調査する
[65/70][北米・米国南部] ルイジアナCancer Alleyの環境レイシズムを調査する
```

## Issue Body Template

Use Japanese. Keep the body specific enough that a future automation run can produce a deep report without chat context.

```markdown
## 調査命令
<topic>を、<main lenses>の観点から調査し、十分に深いレポート化する。

## 優先順位
- 優先順位: <NN>/<TT>
- 地域: <region>
- 重要度の理由: <why this topic matters internationally and why it fills the queue gap>

## 論ずべき問題
- <specific dispute, event, institution, or population>
- <structural driver>
- <internationalization path: sanctions, courts, migration, trade, conflict, resources, rights>
- <counter-argument, uncertainty, or affected community perspective>

## 調査観点
- 歴史的背景: 植民地経験、国家形成、国境線、同化政策、差別制度、記憶政治を短絡せず整理する。
- 現在の制度とアクター: 政府、地方政府、司法、軍・警察、企業、国際機関、市民社会、ディアスポラの利害を分ける。
- 差別・人権上の争点: 民族、宗教、言語、国籍、移民資格、土地、環境、ジェンダーの交差を扱う。
- 国際政治化の経路: 制裁、難民、越境犯罪、資源、通商、投資、同盟、国際裁判、国連・地域機構を確認する。
- 日本・東アジアへの含意: サプライチェーン、人権DD、外交、移民、企業活動、世論形成、研究上の比較軸を明示する。

## 初期参照候補
- [<primary or authoritative source>](<url>)
- [<primary or authoritative source>](<url>)
- [<primary or authoritative source>](<url>)

## 推奨カテゴリ・slug
- category: geopolitics
- slug: <short-kebab-case-slug>

## 調査方式
- geopolitical risk analysis / human rights analysis / historical narrative review / policy analysis を組み合わせる。
- 最新性が重要な情報は、レポート作成時点で政府資料、国際機関、裁判資料、現地一次資料、信頼できる現地報道、学術文献を確認する。
- 重要な主張には本文近くに SourceNote を置き、単なる参考情報一覧で済ませない。
- Mermaidで、時系列、アクター関係、制度構造、越境影響のいずれかを小さく図解する。
- 当事者集団を単一の声として扱わず、世代、階級、宗教、言語、都市・地方、ディアスポラ、政治的立場の違いを明示する。

## 完了条件
- articles/report/<slug>/ja/index.mdx に日本語本文の正本を作成する。
- articles/report/<slug>/en/index.mdx と articles/report/<slug>/mix-alignment.json を同期して作成する。
- articles/report/<slug>/ja/source-notes.mdx と articles/report/<slug>/en/source-notes.mdx に、公開可能な調査素材と採否判断をまとめる。
- 必要な場合は articles/report/<slug>/ja/research-log.mdx と英語側の調査ログを作成する。
- 主張、根拠、限界、当事者視点、国際政治上の含意、日本・東アジアへの含意を分けて書く。
- pnpm build で記事、カテゴリ、トップページへの反映を確認する。
```

## Source Selection

- Prefer primary or authoritative sources in initial references: UN/OHCHR, UNHCR, UNODC, ICJ, IACHR/OAS, ILO, government agencies, courts, treaty bodies, official statistics, central banks, regulator pages, or original reports.
- Use secondary reporting only when it identifies a current event or local debate that primary sources do not yet cover.
- For unstable topics, browse or otherwise verify current facts before writing issue text. Do not rely on memory for current sanctions, elections, court status, conflict status, prices, product specs, or official positions.
- Initial references are seeds, not a bibliography. The eventual report must verify claims again at writing time.

## Batch Creation Pattern

For 5 or more issues, generate a local array of issue objects and loop through `gh issue create`. Include fields for priority, region, title, slug, reason, command, problems, and sources. After creation, run a separate verification command instead of trusting the loop output.

Minimal Node shape:

```javascript
const { spawnSync } = require('node:child_process');

for (const issue of issues) {
  const title = `[${String(issue.priority).padStart(2, '0')}/${issue.total}][${issue.region}] ${issue.title}`;
  const body = renderBody(issue);
  const result = spawnSync('gh', [
    'issue',
    'create',
    '-R',
    'daylight55/research-queue',
    '--title',
    title,
    '--body',
    body,
    '--label',
    'daily-research'
  ], { encoding: 'utf8' });

  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  process.stdout.write(`${title}\n${result.stdout}`);
}
```

## Common Mistakes

- Creating issues in `daylight55/research`; that repository has issues disabled.
- Forgetting `daily-research`, which prevents scheduled processing.
- Adding `research-pr-opened` or `research-skip` to new research topics.
- Copying old issue bodies that point to `src/content/blog`.
- Creating broad country profile issues when the user asked for narrower discrimination, regional, diaspora, city/state, or community-level issues.
- Treating affected populations as uniform. Ask the issue to cover internal variation and uncertainty.
- Reporting success without checking the created issue body and labels.
