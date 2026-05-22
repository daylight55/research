# オントロジー概念調査 Research Tasks

作成日: 2026-05-09

## 目的

オントロジーという概念を、哲学、知識表現、Semantic Web、知識グラフ、業務AI活用の各文脈から整理し、実務で「何を作ればオントロジーと呼べるのか」「どこまで形式化すべきか」を判断できる基礎資料にする。

## 調査方式

ナラティブレビュー。古典的定義、標準仕様、実務向け設計ガイド、近年のLLM/知識グラフ文献を横断して、概念の使い分けと実務含意を整理する。

## タスク

- [x] **1. スコープ定義**: 哲学的オントロジー、情報科学のオントロジー、実務AIでの operational ontology を分けて扱う。
- [x] **2. 方法論選定**: 網羅的システマティックレビューではなく、実務意思決定向けのナラティブレビューとして設計する。
- [x] **3. 基礎文献確認**: Gruber、Guarino、Ontology Development 101、Semantic Web、知識グラフ文献を確認する。
- [x] **4. 標準仕様確認**: RDF、OWL 2、SKOS、SPARQL、SHACL、BFO/ISO、schema.org、Palantir Ontology の一次情報を確認する。
- [x] **5. 概念比較**: taxonomy、controlled vocabulary、schema、data model、knowledge graph、semantic layer との違いを整理する。
- [x] **6. 実務設計方針**: 小さく始める ontology lite、competency questions、制約・検証・運用の設計方針をまとめる。
- [x] **7. 図解追加**: Mermaidで概念レイヤー、構成要素、判断フロー、業務例を図解する。
- [x] **8. 批判的評価**: 過剰形式化、偽の精密さ、更新不能、組織合意不足、LLM任せの危険を整理する。
- [x] **9. レポート作成**: `content/blog/ontology-concept.mdx` に出典メモ付きでまとめる。
- [ ] **10. 追加深掘り候補**: 必要に応じて、具体的な研究リポジトリ向け ontology lite や Obsidian/Notion 連携モデルへ発展させる。

## 追加深掘り候補

- このリポジトリの調査テーマ、ソース、主張、判断、図解を表す repo-local ontology lite を設計する。
- Notion / Obsidian / GitHub / MCP を横断する個人知識管理オントロジーを設計する。
- RDF/OWL/SHACL を使う場合と、JSON Schema / TypeScript / property graph で十分な場合の判断基準を実装例つきで比較する。
- LLMによる ontology extraction / ontology alignment の実用性と評価方法を深掘りする。
