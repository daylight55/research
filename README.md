# daylight55/research

公開サイト: https://research.daylight55.dev/

このリポジトリは、技術調査レポートをカテゴリ別に蓄積し、Astro製の静的サイトとして公開するためのリポジトリです。本文として公開する記事は `content/blog/*.mdx` に置き、調査タスク、補助メモ、収集資料、PoCなどは `category/<category-name>/<topic>/` 配下で管理します。

## 概要

- `content/blog/*.mdx`: 公開サイトに表示する記事本文の正本。
- `category/<category-name>/<topic>/`: 調査テーマごとの作業領域。
- `category/<category-name>/<topic>/research-tasks.md`: 調査タスク、完了状況、追加深掘り候補。
- `category/<category-name>/<topic>/notes/`, `sources/`, `figures/`, `prototype/`: 補助資料、収集資料、図版、PoC。
- `src/data/categories.ts`: サイトで使うカテゴリ定義。

## ワークフロー

1. 調査テーマごとに `category/<category-name>/<topic>/` を作成する。
2. 必要に応じて `research-tasks.md`、`notes/`、`sources/`、`figures/`、`prototype/` を追加する。
3. 公開記事は最初から `content/blog/<slug>.mdx` に書き、`report.md` は作らない。
4. 新しいカテゴリを使う場合は `src/data/categories.ts` に追加する。
5. Mermaidなどの差分管理しやすい図解を本文に含める。
6. `pnpm build` を実行し、対象記事、カテゴリページ、トップページが生成されることを確認する。
7. Pull Requestを作成し、Cloudflare Pages Previewまたはビルド成果物で公開表示を確認する。
