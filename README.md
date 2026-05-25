# daylight55/research

公開サイト: https://research.daylight55.dev/

このリポジトリは、技術調査レポートを記事単位で蓄積し、Astro製の静的サイトとして公開するためのリポジトリです。公開記事は `articles/<slug>/index.mdx`、公開可能な調査プロセスは `articles/<slug>/research-log.mdx` にまとめます。

## 概要

- `articles/<slug>/index.mdx`: 公開サイトに表示する記事本文の正本。
- `articles/<slug>/research-log.mdx`: 公開可能な調査プロセス、根拠、判断ログ。必要な記事だけに置く。
- `src/data/categories.ts`: サイトで使うカテゴリ定義。
- `ops/`: Codex生成プロンプト、テンプレート、運用スクリプト、ワークフロー用テスト。

## ワークフロー

1. 調査テーマごとに `articles/<slug>/` を作成する。
2. 公開記事は最初から `articles/<slug>/index.mdx` に書く。
3. 調査過程を公開できる場合は `articles/<slug>/research-log.mdx` にまとめ、記事本文から辿れるようにする。
4. 新しいカテゴリを使う場合は `src/data/categories.ts` に追加する。
5. Mermaidなどの差分管理しやすい図解を本文に含める。
6. `pnpm build` を実行し、対象記事、カテゴリページ、トップページが生成されることを確認する。
7. Pull Requestを作成し、Cloudflare Pages Previewまたはビルド成果物で公開表示を確認する。
