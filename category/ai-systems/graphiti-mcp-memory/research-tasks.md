# Graphiti と MCP で作る AI エージェント記憶基盤 Research Tasks

作成日: 2026-05-15

## 目的

Graphiti と MCP を中心に、AI エージェントの長期記憶、時系列ナレッジグラフ、組織ナレッジ活用を実務導入する際の設計論を、導入判断に使える形で整理する。

## タスク

- [x] **1. スコープ定義**: Graphiti、MCP、temporal knowledge graph、RAG、ベクトルDB、従来KGの比較軸を定義した。
- [x] **2. 一次情報収集**: Graphiti README、Zep 論文、MCP 公式仕様、MCP security、Mem0、Letta の公式情報を確認した。
- [x] **3. 実務論点整理**: MCP サーバとして記憶基盤を公開する利点とリスクを、read/write 分離と監査を中心に整理した。
- [x] **4. 適用条件整理**: temporal knowledge graph が効く場面と効かない場面を、個人研究・組織ナレッジ・業務エージェントの文脈で整理した。
- [x] **5. 代替手段比較**: 2026年時点の主要 OSS / 商用候補を、Graphiti/Zep、Mem0、Letta、MCP memory reference で比較した。
- [x] **6. 図解作成**: 記憶基盤アーキテクチャ、MCP 公開フロー、採用判断の Mermaid 図を追加した。
- [x] **7. レポート作成**: 実務意思決定向けの日本語レポートを作成した。
- [x] **8. 公開用記事作成**: Astro サイト向けの `src/content/blog/graphiti-mcp-memory.mdx` を追加した。
- [ ] **9. 追加深掘り**: PoC 時の評価指標、抽出品質の測定方法、権限/削除の実装指針を別稿に分解する。
- [ ] **10. 継続調査候補**: Graphiti / Zep / Mem0 / Letta の 2026 年後半のリリース差分を追跡する。
