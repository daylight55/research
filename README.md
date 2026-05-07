# Technical Research

このリポジトリは、技術調査レポートをカテゴリ別ディレクトリで管理するためのものです。

## Structure

```text
<category>/
  <topic>/
    report.md
    research-tasks.md
```

## Current Reports

- [AI / LLM / Ontology / Organizational Memory](ai-systems/ai-llm-ontology-memory/report.md)
- [Palantir](enterprise-ai-platforms/palantir/report.md)

## Policy

各調査テーマは `<category>/<topic>/` に分け、少なくとも次のファイルを置きます。

- `report.md`: 調査結果の本文
- `research-tasks.md`: 調査タスク、残課題、追加深掘り候補

調査が実装やPoCに進む場合は、同じテーマディレクトリ内に `prototype/`、`notes/`、`sources/` などを追加します。
