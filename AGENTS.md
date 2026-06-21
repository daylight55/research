# Research Repository Instructions

このリポジトリは、広範な調査レポートとニュース整理を記事種別ごとの浅いディレクトリで継続管理するためのものです。

## Repository Structure

- 新しい調査テーマは `articles/report/<slug>/` を作成して管理する。
- ニュースダイジェストは `articles/news/<slug>/` を作成して管理する。
- `<slug>` は記事URLにも使う短い kebab-case 名にする。例: `graphiti-mcp-memory`, `oauth21-pkce-mcp-auth`。
- Webサイト上に表示する調査テーマでは、`articles/report/<slug>/ja/index.mdx` を日本語本文の正本として扱う。
- Webサイト上に表示するニュースでは、`articles/news/<slug>/ja/index.mdx` を日本語本文の正本として扱う。
- 記事化する手前の調査素材、一次情報、論点整理、採否判断は、公開可能な範囲で同じ記事ディレクトリの `ja/source-notes.mdx` にまとめる。これは記事本文を読みやすく編集するための中間ノートであり、最終記事本文の重複コピーにはしない。
- 公開可能な調査プロセス、実行条件、判断ログ、残課題がある場合は同じ記事ディレクトリの `ja/research-log.mdx` にまとめる。
- `notes/`, `sources/`, `figures/`, `prototype/` などの非公開作業ディレクトリは原則作らない。公開価値のある素材は `source-notes.mdx` に、公開価値のあるプロセスは `research-log.mdx` に要約、リンク、図表として含める。
- 記事本文から `research-log.mdx` と `source-notes.mdx` へ辿れる導線を維持する。サイト側に調査ログが存在する場合は `/reports/<slug>/research/` を、調査素材ノートが存在する場合は `/reports/<slug>/sources/` を公開する。ニュースでは `/news/<slug>/research/` と `/news/<slug>/sources/` を使う。

## Required Skill

調査レポート、研究整理、論文比較、技術・政策・経済・地政学などの論点整理や考察を書くときは、repo-local skill `research-report` を使う。
公開記事の本文を作成・更新・レビューするときは、APMで導入し Codex からも発見できる `.codex/skills/stop-slop/SKILL.md` の repo-local skill `stop-slop` の観点を適用し、AI的な定型句、過剰な前置き、機械的な二項対立、不要な要約句を避ける。

## Astro Site Publication Workflow

- Webサイト上に表示する調査レポートは、最初から `articles/report/<slug>/ja/index.mdx` に本文を書く。
- `report.md` などの別本文を作ってから `index.mdx` へコピーする運用は禁止する。本文が二重化し、片方だけ浅い/古い状態になりやすいため。
- 公開記事本文（`index.mdx`）は、依頼文・質問文・プロンプトへの返答として書かない。読者が依頼元を知らなくても成立するよう、主題、範囲、論点を記事内の自然な文脈として説明し、「依頼文では」「あなたの質問」「まず誤解を直す」のようなメタな導入を避ける。`source-notes.mdx` と `research-log.mdx` では、公開可能な範囲で調査範囲、判断ログ、入力条件を書いてよい。
- 調査素材を公開する場合は、単独の `sources/` ディレクトリや `notes/` ディレクトリではなく同じ記事ディレクトリの `source-notes.mdx` にまとめる。
- 調査タスクや残課題を公開する場合は、単独のタスクリストではなく同じ記事ディレクトリの `research-log.mdx` に調査プロセスとしてまとめる。
- 新しいカテゴリを使う場合は、`src/data/categories.ts` の `CATEGORIES` に追加する。既存カテゴリとのコンフリクト時は、main側のカテゴリを消さずに和集合で解消する。
- サイト用記事のヘッダー画像は補助要素として控えめに扱う。本文の可読性を優先し、情報的価値が薄いCodex生成の抽象画像をカテゴリ画像として追加しない。
- トップページなどの件数表示は固定値にしない。カテゴリ数は `CATEGORIES.length` など、実データから算出する。
- PRプレビューは既定では作成しない。プレビュー表示を明示的に求められた場合だけ、現在のデプロイ方式に合わせて一時的な確認手段を用意する。
- 日英対応では、日本語を正本として扱い、公開される記事・reference・導線を更新する場合は同じPRで英語側も同期する。翻訳レビューなどテストで規定できない人手確認が残る場合は、自動マージせず残課題として明記する。
- `articles/report/<slug>/ja/index.mdx` または `articles/news/<slug>/ja/index.mdx` を追加・更新した場合は、対応する `articles/report/<slug>/en/index.mdx` または `articles/news/<slug>/en/index.mdx` も追加・更新する。英語生成を別ジョブに回す場合も、PR内で同期状態をテストし、未生成のまま公開導線だけ増やさない。
- 公開記事のfrontmatter `generation.model` と、公開する `research-log.mdx` の利用環境 `model` は、CI契約として必ず `gpt-5.4-mini` と書く。実行時の実モデル名をそのまま書かない。`ops/tests/article-structure.test.mjs` がこの文字列を検査しているため、`gpt-5` など別表記にするとCIが失敗する。
- `research-log.mdx` の利用環境には、`model: \`gpt-5.4-mini\``、repo-local skillリンク、`ops/codex/prompts/daily-issue-research.md` へのprompt sourceリンクを含める。
- `src/pages/reference/<slug>.astro` を追加・更新した場合は `src/pages/en/reference/<slug>.astro` も追加・更新する。reference一覧やトップページのカードは、`getReferenceItems(locale)` のようなlocale-awareな共有データから引き、片方だけの手書き重複を避ける。
- 英語ページ内のMermaid、reference本文、カード説明、出典周辺ラベルには日本語を残さない。日本語混入や日英route parityは `ops/tests/i18n-content.test.mjs` で検出できる形にする。
- PRやプレビュー表示を求められた場合、または公開対象の本文を更新した場合は、`pnpm build` を実行し、生成ログに次が含まれることを確認する。
  - ニュースの場合は `/news/<slug>/index.html`
  - レポートの場合は `/reports/<slug>/index.html`
  - `research-log.mdx` がある場合は `/reports/<slug>/research/index.html`
  - `source-notes.mdx` がある場合は `/reports/<slug>/sources/index.html` または `/news/<slug>/sources/index.html`
  - `/category/<category-name>/1/index.html`
  - `/index.html`
- さらに、`dist/index.html` またはローカル preview への `curl` で、トップページに `<slug>`、記事タイトル、カテゴリリンクが含まれることを確認する。
- PR作成後は `gh pr checks` でCI状態を確認する。プレビュー表示を明示的に求められた場合は、発行された一時URLに対して `<slug>`、記事タイトル、カテゴリリンクが含まれることを `curl` で確認する。
- 「トップページに出ていない」「レンダリング対象に入っていない」と言われたら、まず `articles/report/<slug>/ja/index.mdx` または `articles/news/<slug>/ja/index.mdx` と `src/data/categories.ts` の登録漏れを疑う。

## GitHub Publication Workflow

- ユーザーがこのリポジトリで調査を依頼した場合、単なるチャット回答やローカルファイル作成で止めず、原則として調査レポートをリポジトリに保存し、draft Pull Requestを作成して報告する。「PRにして」と明示されていなくても、調査成果物の標準納品はPRである。
- 例外は、ユーザーが「チャットだけでよい」「まだファイル化しない」「PR不要」「調査方針だけ」など、保存・公開しない意図を明示した場合に限る。
- ユーザーが「PRにして」「PRを作成して」「レポートにまとめてPRにして」など、PR化やGitHub公開を求めた場合は、ローカルファイル作成で止めず、コミット、push、Pull Request作成まで行う。
- ユーザーがこのリポジトリに対して明示的な修正・実装・更新を命令した場合は、特に「PRにして」と明記されていなくても、変更をローカルに残して終わらせず、差分確認、検証、コミット、push、Pull Request作成までを通常の完了条件とする。
- PRは指定がなければdraftで作成する。
- PRタイトルと本文は日本語で書く。固有名詞、コマンド、ブランチ名、ファイルパス、英語の技術用語は原語のままでよい。
- PR本文は `.github/PULL_REQUEST_TEMPLATE.md` に沿って書く。テンプレートの見出しを削らず、該当しない項目は「該当なし」または理由を短く書く。
- PR本文には、要約、背景・目的、主な変更点、確認したこと、レビュー観点、残課題・フォローアップを含める。
- PR作成前に、対象差分を確認し、無関係な変更を含めない。
- ユーザーが明示的に依頼した変更は、作業単位ごとにコミットしてよい。追加確認なしでコミットしてよいが、コミット前に対象差分を確認し、無関係な変更を含めない。
- ローカル検証はCIが見る状態と一致させる。コミット後・push前にcleanな作業ツリーで `pnpm ci:pr` を実行し、最新の `origin/main` と現在のHEADをmergeしたPR Test workflow相当の状態で `install`、`git diff --check`、`test`、`lint`、changed validators、full mix-alignment、`build` が通ることを確認する。
- 短時間の修正確認では `pnpm ci:head` や個別テストを使ってよいが、それだけでPR可否を判断しない。GitHubの `pull_request` workflowはhead単体ではなくbase branchとのmerge結果を検証するため、base branchが進んだときは必ず `pnpm ci:pr` で確認する。
- 新規記事・素材ファイルを追加した直後は、未trackedのまま `git ls-files` 系テストだけを実行してもCI相当にならない。検証前に意図したファイルをstageするか、未trackedも拾う検証コマンドを使い、push後に初めて発覚する状態を作らない。
- ローカルで通ったのにCIで落ちた場合は、落ちた箇所だけを直して終わらない。CIログ、workflow定義、base/head ref、tracked/untracked差分、依存関係・Node/pnpmバージョン、環境変数、キャッシュ差を比較し、同じ種類の不一致を次回ローカルで検出できるようにテスト、script、AGENTS.md、またはskillへ反映する。
- 少なくとも `git diff --check` を実行し、Markdown内の未解決プレースホルダ（例: `TBD`, `TODO`, `未定`, `要確認`, `FIXME`）が残っていないことを確認する。
- 公開記事本文を追加・更新した場合は `node ops/scripts/validate-stop-slop.mjs` または `pnpm test:stop-slop` で、APM導入済みの `stop-slop` skill に基づく高確度なAI臭の検査が通ることを確認する。
- push後はPRが最新の `main` とコンフリクトしていないことを確認する。`gh pr view <PR番号> --json mergeable,mergeStateStatus` で `CONFLICTING` / `DIRTY` の場合は、`origin/main` を取り込み、コンフリクトを解消してから再pushする。
- PR作成後は `gh pr checks <PR番号>` などでCI状態を確認する。失敗、キャンセル、pendingが残る場合は、該当runのログと最新runの状態を確認し、失敗原因を修正またはキャンセル理由を明示してから報告する。
- Cloudflare Pages Preview などのPreview系workflowがある場合は、PRのhead branchまたはPR番号に対応する最新runを確認する。Previewが失敗している、またはchecksが出ていない場合は、`gh run list` / `gh run view --log` で原因を確認し、必要なら再pushまたはworkflow再実行後に再確認する。
- ユーザーが明示的に命令した実装・修正・更新について、その命令内容を規定するテストまたは検証手順を追加・更新した場合は、PR本文の「確認したこと」に該当テストを明記する。
- ユーザーが「マージしない」「レビュー待ち」「draftのまま」など明示しない限り、命令内容を規定するテスト、`git diff --check`、未解決プレースホルダ検査、必要な `pnpm build`、Preview系workflow、すべての必須CIが成功し、PRが `main` とコンフリクトしていなければ、自動マージを有効化または実行する。
- 自動マージ前にdraft PRはreadyに変更してよい。ただし、調査本文の事実確認、人手翻訳レビュー、外部承認などテストで十分に規定できないレビュー観点が残る場合は自動マージせず、残る確認事項をPR本文と報告に明記する。
- 自動マージはhead commitを固定して行う。`gh pr merge <PR番号> --squash --auto --match-head-commit <head_sha>` を優先し、リポジトリ設定でauto-mergeが使えない場合は、全条件を再確認した直後に `gh pr merge <PR番号> --squash --match-head-commit <head_sha>` を使う。
- PR作成後は、PR URL、base branch、head branch、draft/ready状態を確認してユーザーに報告する。

## Research Standards

- 最新性が関係する情報は必ず確認する。特にAI製品、Anthropic、MCP、Graphiti、Palantir、ライブラリ、規格、ロードマップ、価格、仕様は記憶だけで書かない。
- 重要な主張には、近くに出典リンクを置く。
- 引用元の記述を使う場合は、長い逐語引用を避け、短い原文句と日本語要約を組み合わせる。
- 参考情報一覧だけで済ませず、本文中の該当段落近くに `<SourceNote>...</SourceNote>` を置く。表示は本文より小さく薄いカッコ付きの出典メモとして扱う。
- `SourceNote` は必ず同一行のインライン要素として書く。`<SourceNote>` と `</SourceNote>` を独立行に置いたり、内部を複数行に折り返したりしない。コンポーネント側が括弧とラベルを付けるため、内部に `（...）`、`( ... )`、`出典:`、`Source note:`、`Source:` を書かない。
- `SourceNote` は `src/pages/reports/[...slug].astro` と `src/pages/news/[...slug].astro` でMDXコンポーネント登録済みなので、通常記事では個別importしない。ニュースダイジェストでは従来どおり `NewsSourceCard` を使う。
- 一次情報を優先する。論文、公式ドキュメント、仕様書、企業公式発表、標準仕様を優先し、二次記事は補助に留める。
- 公式ロードマップが存在しない場合は、必ず「公表情報からの推定」と明記する。

## Visual Explanation Policy

調査レポートには、可能な限り図解を含める。

優先順:

1. Mermaid: GitHub上で表示でき、差分管理しやすいため第一候補。
2. 公式図・公開図: インターネットから取得またはリンクする場合は、出典、権利、引用意図を明記する。
3. Excalidraw MCP: 利用可能な場合、概念図・アーキテクチャ図・関係図に使う。
4. Nanobanaa CLI: 利用可能な場合、生成図や説明画像に使う。

Excalidraw MCPやNanobanaa CLIが利用できない場合は、Mermaidで代替する。

### Mermaid Authoring Constraints

Mermaidは、本文を置き換える巨大な図ではなく、本文理解を助ける小さな図として書く。

- 1つのMermaid図は原則3〜7ノードに収める。やむを得ない場合でも9ノードを上限にする。
- 1ノードのラベルは短い名詞句または短文にする。目安は日本語15文字前後、長くても25文字以内。説明文は図ではなく本文に書く。
- 横フロー（`flowchart LR`）は、比較・関係・左から右への1段階の流れに限定する。横に長くなる場合は表か複数図に分ける。
- 縦フロー（`flowchart TD`）は、3〜5ステップ程度の手順に限定する。6ステップを超える場合は番号付きリストを本文に置き、図は要点だけにする。
- timelineは年号と短い節目名だけを書く。出来事の説明は直後の本文や `<SourceNote>...</SourceNote>` に置く。
- 同じ図に抽象概念、時系列、実装手順、リスクを混ぜない。目的ごとに図を分ける。
- Mermaidを書く前に、図の目的を「時系列」「関係」「手順」「比較」のどれか1つに決める。1文で目的を説明できない図は作らない。
- 図が大きくなりそうな場合は、MermaidよりもMarkdown表、番号付きリスト、または本文中の小見出しで表現する。
- レポート公開前に、ローカルpreviewまたは生成HTMLでMermaidの可読性を確認する。文字が読めない、余白が大きい、スクロールしないと意味が取れない場合は、図を小さく分割または簡略化する。

## Writing Style

- 既定の言語は日本語。
- 読者はAI・データ・組織ナレッジ・経済・政策・地政学などの調査内容そのものに関心を持つ人とする。
- 学術的厳密さと、調査対象そのものに基づく考察を重視する。
- 主張、根拠、限界、調査内容に基づく考察を分けて書く。
- 「できること」と「できないこと」を明確にする。
