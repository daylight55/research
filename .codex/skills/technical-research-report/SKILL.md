---
name: technical-research-report
description: Use when creating or updating research reports in this repository, especially broad technical investigations, literature-backed technology surveys, AI/LLM/MCP/ontology/memory research, source-grounded reports, diagram-rich explanations, or practical adoption recommendations. Store research outputs under root-level category/topic directories: <category>/<topic>/.
---

# Technical Research Report

Use this skill for any report or investigation in this repository.

## Output Location

- Put each topic under `<category>/<topic>/` at the repository root.
- Treat `<category>/<topic>/` as the canonical location for research information in this repository. Do not put new reports under a top-level `research/` directory.
- Use a short kebab-case category directory such as `ai-systems`, `enterprise-ai-platforms`, `developer-tools`, or `data-infrastructure`.
- Maintain at least:
  - `report.md`
  - `research-tasks.md`
- Add optional folders only when useful: `figures/`, `sources/`, `notes/`, `prototype/`.

## Research Workflow

1. Define the research question, audience, and practical decision the report should support.
2. Create or update `research-tasks.md` with small, verifiable tasks.
3. Gather sources before drafting.
4. Prefer primary sources:
   - peer-reviewed papers
   - arXiv papers when relevant and clearly labeled
   - official documentation
   - official company announcements
   - standards/specifications
5. Use secondary sources only for orientation or market context.
6. Distinguish:
   - established claims
   - emerging evidence
   - product claims
   - inference from public announcements
   - open questions
7. Write or update `report.md`.
8. Verify links, unresolved placeholders, and internal consistency.
9. Commit and push when the user asked for repository updates.

## Citation Requirements

- Place citations near the claims they support, not only in a final bibliography.
- Use a short `出典メモ:` paragraph after important claims or paragraphs.
- Include the link in the `出典メモ:` itself.
- When quoting source wording, keep quotes short and specific.
- For copyrighted sources, do not paste long passages. Prefer brief quoted phrases plus Japanese paraphrase.
- If a source is an official roadmap, call it a roadmap. If not, write `公表情報からの推定`.

Good pattern:

```markdown
Anthropicの方向性は、MCP、長文脈、エージェント実行、企業統制に寄っている。

出典メモ: MCP発表は [Anthropic, Introducing the Model Context Protocol](...)。Opus 4.6の1M contextとagent teamsは [Claude Opus 4.6](...) に基づく。ここでの「方向性」は公式ロードマップではなく、公表済み機能からの推定である。
```

## Diagram Requirements

Every substantial report should include diagrams unless the topic is purely textual.

Preferred order:

1. Mermaid diagrams embedded in Markdown.
2. Official diagrams or images linked near the discussion, with source and rights context.
3. Excalidraw MCP diagrams if the tool is available.
4. Nanobanaa CLI generated images if the tool is available.

If Excalidraw MCP or Nanobanaa CLI is not available, use Mermaid and mention no special tooling.

Recommended diagram types:

- timeline for history
- flowchart for architecture and process
- sequence diagram for protocol/tool interaction
- graph for ontology/entity relationships
- comparison table for alternatives

## Report Structure

Use this default shape unless the topic needs something else:

```markdown
# <Title>

作成日: YYYY-MM-DD
調査方式: <narrative review / literature review / product evaluation / architecture survey>
対象: <scope>

## 引用方針

## 1. エグゼクティブサマリー

## 2. 背景と研究史

## 3. 技術原理

## 4. 主要アプローチ比較

## 5. 実務活用

## 6. リスク・限界

## 7. 推奨方針

## 参考情報
```

## Quality Checklist

Before finishing:

- No `TBD`, `TODO`, `未定`, or unresolved placeholders.
- Important claims have nearby links.
- Current product/spec claims were verified against current sources.
- Diagrams render as Mermaid-compatible Markdown where possible.
- The report distinguishes evidence from inference.
- `research-tasks.md` reflects completed and remaining work.
- `git diff --check` passes before committing.
