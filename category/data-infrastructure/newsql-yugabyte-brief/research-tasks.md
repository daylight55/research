# Research Tasks: NewSQLとYugabyteDBの最近の潮流

作成日: 2026-05-10

## 目的

2026-05-13に予定されているYugabyte担当者との面談に向けて、NewSQL/Distributed SQLの基礎概念、最近の潮流、YugabyteDBのサービス体系、公開情報から見える注力領域、面談質問を整理する。

## 完了タスク

- [x] リポジトリの配置ルールとAstroプレビュー構成を確認する。
- [x] NewSQLの基礎文献として、CattellのSIGMOD Record調査とSpanner論文ページを確認する。
- [x] 最近の市場潮流として、Spanner、Aurora DSQL、CockroachDB、TiDBの公式情報を確認する。
- [x] YugabyteDBのアーキテクチャ、YSQL/YCQL、DocDB、tablet、Raft、multi-region、xClusterを公式ドキュメントで確認する。
- [x] YugabyteDB Aeon、Aeon BYOC、Anywhere、Voyager、Mekoの公開情報を確認する。
- [x] YugabyteDB v2025.2 LTS、PostgreSQL 15 compatibility、EPCM、pgvector/AI関連訴求を確認する。
- [x] `report.md` に日本語レポートを作成する。
- [x] Astro preview用に `src/content/blog/newsql-yugabyte-brief.mdx` を作成する。

## 残課題・追加深掘り候補

- [ ] Yugabyte担当者との面談後に、公開情報では確認できない日本リージョン実績、顧客事例、SLA、価格、ロードマップを追記する。
- [ ] 実アプリ移行を検討する場合、PostgreSQL互換性チェックリスト、schema/extension/transaction patternの棚卸しテンプレートを作成する。
- [ ] Aurora DSQL、Spanner、CockroachDB、TiDB、YugabyteDBの実務比較表を別レポートとして作る。
- [ ] YugabyteDB AeonまたはOSS版で小さなPoCを行い、multi-regionではなく単一リージョンでの接続、DDL、transaction、pgvector、backup/restoreを検証する。
