# Technical Research Repository Instructions

このリポジトリは、広範な技術調査をテーマ別ディレクトリで継続管理するためのものです。

## Repository Structure

- 新しい調査テーマは `research/<topic>/` を作成して管理する。
- 各テーマには原則として次を置く。
  - `report.md`: 調査レポート本文
  - `research-tasks.md`: 調査タスク、完了状況、追加深掘り候補
- PoC、実験、収集資料が必要な場合は同じテーマ配下に `prototype/`、`notes/`、`sources/`、`figures/` などを追加する。

## Required Skill

調査レポート、技術選定、研究整理、論文比較、実務導入方針を作るときは、repo-local skill `technical-research-report` を使う。

## Research Standards

- 最新性が関係する情報は必ず確認する。特にAI製品、Anthropic、MCP、Graphiti、Palantir、ライブラリ、規格、ロードマップ、価格、仕様は記憶だけで書かない。
- 重要な主張には、近くに出典リンクを置く。
- 引用元の記述を使う場合は、長い逐語引用を避け、短い原文句と日本語要約を組み合わせる。
- 参考情報一覧だけで済ませず、本文中の該当段落近くに `出典メモ:` を置く。
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

## Writing Style

- 既定の言語は日本語。
- 読者は実務でAI・データ・組織ナレッジ活用を検討する技術者・意思決定者とする。
- 学術的厳密さと実務判断の両方を重視する。
- 主張、根拠、限界、実務含意を分けて書く。
- 「できること」と「できないこと」を明確にする。

