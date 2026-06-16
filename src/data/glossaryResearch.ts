import type { GlossaryResearchProfile } from '../utils/glossary'

type LocaleProfile = Partial<Record<'ja' | 'en', GlossaryResearchProfile>>

const wikipediaUnverified = (reason: string): GlossaryResearchProfile['wikipedia'] => ({
	status: 'unverified',
	reason
})

export const GLOSSARY_RESEARCH_PROFILES = {
	mcp: {
		ja: {
			definition:
				'MCP は、LLM アプリケーションが外部ツール、データソース、プロンプトなどの文脈資源へ接続するためのオープンなプロトコルです。',
			background:
				'Anthropic が 2024 年に公開した Model Context Protocol は、AI アプリケーションごとに個別連携を作るのではなく、クライアント、サーバー、ツール呼び出し、リソース参照を共通の接続面として扱う発想から広がりました。',
			position:
				'AI エージェント、ツール接続、認証、メモリ基盤をつなぐインターフェース層に位置づきます。Knowledge Graph や Graphiti は接続先の知識基盤、OAuth/OIDC/PKCE は接続時の認可文脈に近い概念です。',
			distinctions: [
				'Microsoft Certified Professional など同じ MCP 略称の別概念とは区別します。',
				'MCP はモデルそのものではなく、モデルを含むアプリケーションが外部文脈へアクセスするための接続プロトコルです。'
			],
			sources: [
				{
					title: 'Model Context Protocol specification',
					url: 'https://modelcontextprotocol.io/specification/',
					kind: 'official'
				},
				{
					title: 'Model Context Protocol documentation',
					url: 'https://modelcontextprotocol.io/',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Model Context Protocol',
				url: 'https://en.wikipedia.org/wiki/Model_Context_Protocol',
				reason: 'AI システム向けの Model Context Protocol を指す記事で、記事カテゴリと略称の文脈が一致します。'
			}
		},
		en: {
			definition:
				'MCP is an open protocol for connecting LLM applications to external tools, data sources, prompts, and contextual resources.',
			background:
				'Introduced by Anthropic in 2024, Model Context Protocol reframes integrations around a common client-server interface instead of bespoke tool connectors for each AI application.',
			position:
				'It sits between AI agents, tool access, authentication, and memory systems. Knowledge Graph and Graphiti are adjacent knowledge backends; OAuth, OIDC, and PKCE are adjacent authorization concepts.',
			distinctions: [
				'It is distinct from other MCP expansions such as Microsoft Certified Professional.',
				'MCP is not a model; it is a connection protocol used by model-based applications.'
			],
			sources: [
				{
					title: 'Model Context Protocol specification',
					url: 'https://modelcontextprotocol.io/specification/',
					kind: 'official'
				},
				{
					title: 'Model Context Protocol documentation',
					url: 'https://modelcontextprotocol.io/',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Model Context Protocol',
				url: 'https://en.wikipedia.org/wiki/Model_Context_Protocol',
				reason: 'The article matches the AI integration protocol meant here.'
			}
		}
	},
	ontology: {
		ja: {
			definition:
				'オントロジーは、対象領域の概念、関係、属性、制約を明示的に記述し、共有可能な意味構造として扱うための枠組みです。',
			background:
				'哲学では存在論を意味しますが、情報科学では Gruber や Noy/McGuinness 以降、知識表現や Semantic Web のための明示的な概念仕様として使われてきました。',
			position:
				'Knowledge Graph、RDF、OWL、企業データの意味づけを支える上位概念です。単なる用語集ではなく、関係、制約、推論可能性を含む点が中心です。',
			distinctions: [
				'哲学の ontology は存在一般を問う領域であり、情報科学の ontology とは目的が異なります。',
				'Glossary は用語説明に寄りますが、Ontology は概念間の関係や制約まで扱います。'
			],
			sources: [
				{
					title: 'Ontology Development 101',
					url: 'https://protege.stanford.edu/publications/ontology_development/ontology101.pdf',
					kind: 'paper'
				},
				{
					title: 'OWL 2 Web Ontology Language Overview',
					url: 'https://www.w3.org/TR/owl2-overview/',
					kind: 'standard'
				},
				{
					title: 'Metaphysics, Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/metaphysics/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Ontology (information science)',
				url: 'https://en.wikipedia.org/wiki/Ontology_(information_science)',
				reason: '知識表現・Semantic Web 文脈では、哲学一般の Ontology ではなく information science の記事が対応します。'
			}
		},
		en: {
			definition:
				'An ontology is an explicit model of concepts, relationships, properties, and constraints for a domain of meaning.',
			background:
				'In philosophy, ontology belongs to metaphysics. In information science, it became a knowledge-representation practice for shared domain models, Semantic Web vocabularies, and machine-readable semantics.',
			position:
				'It is the organizing concept behind Knowledge Graphs, RDF, OWL, and enterprise semantic models. The important move is from isolated terms to relationships, constraints, and inferable structure.',
			distinctions: [
				'Philosophical ontology asks what exists; information-science ontology models a domain for representation and reasoning.',
				'A glossary explains terms, while an ontology also specifies relationships, constraints, and identity rules.'
			],
			sources: [
				{
					title: 'Ontology Development 101',
					url: 'https://protege.stanford.edu/publications/ontology_development/ontology101.pdf',
					kind: 'paper'
				},
				{
					title: 'OWL 2 Web Ontology Language Overview',
					url: 'https://www.w3.org/TR/owl2-overview/',
					kind: 'standard'
				},
				{
					title: 'Metaphysics, Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/metaphysics/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Ontology (information science)',
				url: 'https://en.wikipedia.org/wiki/Ontology_(information_science)',
				reason: 'The information-science article matches the knowledge-representation context used here.'
			}
		}
	},
	'knowledge-graph': {
		ja: {
			definition:
				'Knowledge Graph は、実体、概念、属性、関係をノードとエッジとして表し、知識を接続された構造として扱う表現です。',
			background:
				'Semantic Web の RDF/OWL 系譜と、検索・推薦・企業データ統合で使われるグラフ型知識表現の流れが重なっています。',
			position:
				'Ontology が意味の設計図、RDF/OWL が標準表現、Graphiti が時間変化を含む実装例、RAG が検索・生成側の隣接概念として並びます。',
			distinctions: [
				'Graph database は保存・問い合わせの技術であり、Knowledge Graph は意味づけされた知識構造を指します。',
				'単なるネットワーク図ではなく、ノードと関係の意味が重要です。'
			],
			sources: [
				{
					title: 'RDF 1.1 Concepts and Abstract Syntax',
					url: 'https://www.w3.org/TR/rdf11-concepts/',
					kind: 'standard'
				},
				{
					title: 'OWL 2 Web Ontology Language Overview',
					url: 'https://www.w3.org/TR/owl2-overview/',
					kind: 'standard'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Knowledge graph',
				url: 'https://en.wikipedia.org/wiki/Knowledge_graph',
				reason: '意味づけされた実体・関係のグラフ表現を指す記事です。'
			}
		},
		en: {
			definition:
				'A Knowledge Graph represents entities, concepts, attributes, and relationships as connected knowledge rather than isolated records.',
			background:
				'The term overlaps the Semantic Web lineage of RDF/OWL and the applied graph representations used in search, recommendation, and enterprise data integration.',
			position:
				'Ontology supplies the semantic design, RDF/OWL provide standards, Graphiti is a temporal implementation example, and RAG is an adjacent retrieval-generation pattern.',
			distinctions: [
				'A graph database is storage and query infrastructure; a Knowledge Graph is a semantically interpreted knowledge structure.',
				'The meaning of nodes and edges matters more than the visual graph shape.'
			],
			sources: [
				{
					title: 'RDF 1.1 Concepts and Abstract Syntax',
					url: 'https://www.w3.org/TR/rdf11-concepts/',
					kind: 'standard'
				},
				{
					title: 'OWL 2 Web Ontology Language Overview',
					url: 'https://www.w3.org/TR/owl2-overview/',
					kind: 'standard'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Knowledge graph',
				url: 'https://en.wikipedia.org/wiki/Knowledge_graph',
				reason: 'The article matches the semantically connected entity-relation concept used here.'
			}
		}
	},
	rdf: {
		ja: {
			definition:
				'RDF は、主語・述語・目的語のトリプルで情報を表し、Web 上でデータを意味付きに接続するための W3C 標準です。',
			background:
				'RDF 1.1 は、リソース、IRI、リテラル、グラフ、データセットなどの抽象構文を定義し、Semantic Web の基礎的なデータモデルとして位置づけられています。',
			position:
				'Ontology や OWL を機械可読な知識表現へ落とす基盤として位置づきます。',
			distinctions: [
				'RDF はデータモデルであり、OWL はより強い語彙・推論表現を加える ontology language です。',
				'RDF/XML は RDF の構文の一つであり、RDF そのものではありません。'
			],
			sources: [
				{
					title: 'RDF 1.1 Concepts and Abstract Syntax',
					url: 'https://www.w3.org/TR/rdf11-concepts/',
					kind: 'standard'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Resource Description Framework',
				url: 'https://en.wikipedia.org/wiki/Resource_Description_Framework',
				reason: 'RDF 略称が Resource Description Framework を指す文脈で一致します。'
			}
		},
		en: {
			definition:
				'RDF is a W3C data model for representing information as subject-predicate-object triples.',
			background:
				'RDF 1.1 defines resources, IRIs, literals, graphs, and datasets as a foundation for linked data and Semantic Web representations.',
			position:
				'It is the representation layer beneath ontology and OWL-based knowledge modeling.',
			distinctions: [
				'RDF is a data model; OWL adds a richer ontology language and reasoning layer.',
				'RDF/XML is one serialization of RDF, not RDF itself.'
			],
			sources: [
				{
					title: 'RDF 1.1 Concepts and Abstract Syntax',
					url: 'https://www.w3.org/TR/rdf11-concepts/',
					kind: 'standard'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Resource Description Framework',
				url: 'https://en.wikipedia.org/wiki/Resource_Description_Framework',
				reason: 'The RDF abbreviation matches Resource Description Framework in this context.'
			}
		}
	},
	owl: {
		ja: {
			definition:
				'OWL は、Semantic Web 向けにクラス、プロパティ、個体、制約、推論可能な意味を表すための ontology language です。',
			background:
				'W3C の OWL 2 は RDF と組み合わせて使える知識表現言語で、形式意味論とプロファイルを備えています。',
			position:
				'Ontology を標準化された機械可読表現へ落とす言語として RDF と並ぶ位置にあります。',
			distinctions: [
				'OWL は鳥の owl ではなく Web Ontology Language の略称です。',
				'RDF が基礎データモデル、OWL がより表現力の高い ontology language です。'
			],
			sources: [
				{
					title: 'OWL 2 Web Ontology Language Overview',
					url: 'https://www.w3.org/TR/owl2-overview/',
					kind: 'standard'
				},
				{
					title: 'OWL, W3C Semantic Web Standards',
					url: 'https://www.w3.org/OWL/',
					kind: 'standard'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Web Ontology Language',
				url: 'https://en.wikipedia.org/wiki/Web_Ontology_Language',
				reason: 'OWL 略称が Web Ontology Language を指す文脈で一致します。'
			}
		},
		en: {
			definition:
				'OWL is an ontology language for the Semantic Web, used to describe classes, properties, individuals, constraints, and formally defined meanings.',
			background:
				'W3C OWL 2 works with RDF and provides formal semantics and profiles for different reasoning and implementation needs.',
			position:
				'It is the standardized machine-readable language layer for ontology work, next to RDF.',
			distinctions: [
				'OWL means Web Ontology Language here, not the animal.',
				'RDF is the underlying data model; OWL is the more expressive ontology language.'
			],
			sources: [
				{
					title: 'OWL 2 Web Ontology Language Overview',
					url: 'https://www.w3.org/TR/owl2-overview/',
					kind: 'standard'
				},
				{
					title: 'OWL, W3C Semantic Web Standards',
					url: 'https://www.w3.org/OWL/',
					kind: 'standard'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Web Ontology Language',
				url: 'https://en.wikipedia.org/wiki/Web_Ontology_Language',
				reason: 'The OWL abbreviation matches Web Ontology Language in this context.'
			}
		}
	},
	'tacit-knowledge': {
		ja: {
			definition:
				'暗黙知は、言語化や手順化で完全には表しにくいが、判断、技能、理解、実践の中で働いている知識です。',
			background:
				'Michael Polanyi は、知識には個人的・身体的・文脈依存の要素があり、すべてを明示化できるわけではないと論じました。',
			position:
				'AI 要約、言い換え、ナレッジマネジメントが落としやすい判断の背景を説明する概念です。',
			distinctions: [
				'単に「まだ文書化されていない知識」ではなく、文書化しても残り続ける身体化・文脈化された理解を含みます。',
				'形式知との対比だけでなく、両者が相互に支え合う点が重要です。'
			],
			sources: [
				{
					title: 'The Tacit Dimension, University of Chicago Press',
					url: 'https://press.uchicago.edu/ucp/books/book/chicago/T/bo6035368.html',
					kind: 'official'
				},
				{
					title: 'Polanyi Society',
					url: 'https://polanyisociety.org/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Tacit knowledge',
				url: 'https://en.wikipedia.org/wiki/Tacit_knowledge',
				reason: 'Polanyi の tacit knowledge を扱う記事です。'
			}
		},
		en: {
			definition:
				'Tacit knowledge is knowledge that operates in skill, judgment, perception, and practice but cannot be fully captured as explicit rules.',
			background:
				'Michael Polanyi argued that knowing has personal, embodied, and contextual dimensions that cannot be exhaustively made explicit.',
			position:
				'It explains what AI summarization, paraphrase, and knowledge management can lose when they flatten expert judgment into explicit text.',
			distinctions: [
				'It is not merely undocumented knowledge; some tacit structure remains even after documentation.',
				'The contrast with explicit knowledge matters, but the two also depend on each other.'
			],
			sources: [
				{
					title: 'The Tacit Dimension, University of Chicago Press',
					url: 'https://press.uchicago.edu/ucp/books/book/chicago/T/bo6035368.html',
					kind: 'official'
				},
				{
					title: 'Polanyi Society',
					url: 'https://polanyisociety.org/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Tacit knowledge',
				url: 'https://en.wikipedia.org/wiki/Tacit_knowledge',
				reason: 'The article matches the Polanyi-derived concept.'
			}
		}
	},
	palantir: {
		ja: {
			definition:
				'Palantir は、Foundry、Gotham、AIP などを通じて、組織データ、業務モデル、AI ワークフローを統合する企業向けソフトウェア会社です。',
			background:
				'同社の近年の説明では、Ontology を業務上の対象・関係・アクションを統合する層として置き、AIP を生成 AI と運用領域を接続するプラットフォームとして位置づけています。',
			position:
				'Operational AI、Ontology-grounded AI、企業データ統合を説明する代表的な企業・製品群として位置づきます。',
			distinctions: [
				'Palantir は企業名であり、AIP は同社の AI Platform、Ontology は同社製品内の意味モデル層です。',
				'一般概念としての ontology と、Palantir 製品上の Ontology は重なりますが同一ではありません。'
			],
			sources: [
				{
					title: 'Palantir AIP Overview',
					url: 'https://www.palantir.com/docs/foundry/aip/overview/',
					kind: 'official'
				},
				{
					title: 'Palantir AIP architecture overview',
					url: 'https://www.palantir.com/docs/foundry/architecture-center/aip-architecture',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Palantir Technologies',
				url: 'https://en.wikipedia.org/wiki/Palantir_Technologies',
				reason: '企業としての Palantir Technologies を指す文脈で一致します。'
			}
		},
		en: {
			definition:
				'Palantir is an enterprise software company whose platforms connect organizational data, operational models, and AI workflows.',
			background:
				'In Palantir materials, the Ontology functions as a layer for operational objects, relationships, logic, and action, while AIP connects generative AI to operational domains.',
			position:
				'It is a major example of operational AI, ontology-grounded AI, and enterprise data integration.',
			distinctions: [
				'Palantir is the company; AIP is its AI platform; Ontology is the semantic operational layer in its product model.',
				'Palantir Ontology overlaps with the general ontology idea but is also a product-specific architecture.'
			],
			sources: [
				{
					title: 'Palantir AIP Overview',
					url: 'https://www.palantir.com/docs/foundry/aip/overview/',
					kind: 'official'
				},
				{
					title: 'Palantir AIP architecture overview',
					url: 'https://www.palantir.com/docs/foundry/architecture-center/aip-architecture',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Palantir Technologies',
				url: 'https://en.wikipedia.org/wiki/Palantir_Technologies',
				reason: 'The article matches Palantir Technologies as the company discussed here.'
			}
		}
	},
	graphiti: {
		ja: {
			definition:
				'Graphiti は、時間変化するエピソード、実体、関係を扱うための temporal Knowledge Graph フレームワークです。',
			background:
				'Zep の Graphiti は、AI エージェントやアプリケーションが会話・イベント・更新履歴を長期記憶として扱う文脈で使われます。',
			position:
				'MCP と接続できるメモリ基盤、Knowledge Graph の実装例、LLM エージェントの文脈管理技術として位置づきます。',
			distinctions: [
				'Graphiti は漫画の graffiti 風表記や一般名詞ではなく、Zep が公開している temporal Knowledge Graph 実装を指します。',
				'Neo4j のような汎用グラフ DB そのものではなく、エージェント記憶向けのモデル化レイヤーを含みます。'
			],
			sources: [
				{
					title: 'Graphiti GitHub repository',
					url: 'https://github.com/getzep/graphiti',
					kind: 'official'
				},
				{
					title: 'Zep documentation',
					url: 'https://help.getzep.com/',
					kind: 'official'
				}
			],
			wikipedia: wikipediaUnverified(
				'Graphiti は製品・OSS 名としての文脈であり、対応する Wikipedia 記事は未確認です。'
			)
		},
		en: {
			definition:
				'Graphiti is a temporal Knowledge Graph framework for modeling changing episodes, entities, and relationships.',
			background:
				'Zep positions Graphiti in the context of long-term memory for AI agents and applications that need to retain conversation, event, and update history.',
			position:
				'It is a memory backend that can connect with MCP, an implementation example of Knowledge Graphs, and a context-management layer for LLM agents.',
			distinctions: [
				'Graphiti here means the Zep temporal Knowledge Graph project, not a generic spelling variant of graffiti.',
				'It is not merely a graph database; it includes modeling patterns for agent memory.'
			],
			sources: [
				{
					title: 'Graphiti GitHub repository',
					url: 'https://github.com/getzep/graphiti',
					kind: 'official'
				},
				{
					title: 'Zep documentation',
					url: 'https://help.getzep.com/',
					kind: 'official'
				}
			],
			wikipedia: wikipediaUnverified(
				'No verified Wikipedia article matches the Zep temporal Knowledge Graph project.'
			)
		}
	},
	llm: {
		ja: {
			definition:
				'LLM は、大量のテキストを学習し、自然言語の理解、生成、要約、推論補助などを行う大規模言語モデルです。',
			background:
				'Transformer 系の深層学習モデルと大規模データ・計算資源の組み合わせによって、文章生成、質問応答、コード生成、対話型アプリケーションの基盤として使われるようになりました。',
			position:
				'RAG、MCP、エージェント、プロンプト設計、ファインチューニング、Knowledge Graph 連携などの中心にある基盤モデル概念です。',
			distinctions: [
				'LLM は生成 AI の代表例ですが、生成 AI 全体は画像、音声、動画などの生成モデルも含みます。',
				'LLM は知識ベースそのものではなく、外部知識を扱うには RAG、ツール接続、メモリ基盤などと組み合わせます。'
			],
			sources: [
				{
					title: 'What Are Large Language Models (LLMs)? - IBM',
					url: 'https://www.ibm.com/think/topics/large-language-models',
					kind: 'reference'
				},
				{
					title: 'AI Demystified: Introduction to large language models, Stanford University IT',
					url: 'https://uit.stanford.edu/service/techtraining/ai-demystified/llm',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Large language model',
				url: 'https://en.wikipedia.org/wiki/Large_language_model',
				reason: 'LLM が large language model を指す AI システム文脈と一致します。'
			}
		},
		en: {
			definition:
				'An LLM is a large language model trained on large text corpora to understand, generate, summarize, and transform natural language.',
			background:
				'Transformer-based deep learning, large datasets, and large-scale compute made LLMs a foundation for chat interfaces, code generation, question answering, and text automation.',
			position:
				'LLMs sit at the center of RAG, MCP, agents, prompting, fine-tuning, and Knowledge Graph-connected applications.',
			distinctions: [
				'LLMs are a major form of generative AI, but generative AI also includes image, audio, video, and other model types.',
				'An LLM is not a knowledge base by itself; retrieval, tools, and memory systems are added when external knowledge is needed.'
			],
			sources: [
				{
					title: 'What Are Large Language Models (LLMs)? - IBM',
					url: 'https://www.ibm.com/think/topics/large-language-models',
					kind: 'reference'
				},
				{
					title: 'AI Demystified: Introduction to large language models, Stanford University IT',
					url: 'https://uit.stanford.edu/service/techtraining/ai-demystified/llm',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Large language model',
				url: 'https://en.wikipedia.org/wiki/Large_language_model',
				reason: 'The article matches LLM as large language model in the AI systems context.'
			}
		}
	},
	'generative-ai': {
		ja: {
			definition:
				'生成 AI は、テキスト、画像、音声、動画、コードなどの新しいコンテンツを生成できる AI の総称です。',
			background:
				'2022 年以降、対話型 LLM や画像生成モデルの普及により、教育、研究、業務、創作、ソフトウェア開発で利用が急速に広がりました。',
			position:
				'LLM、RAG、AI エージェント、投資テーマ、教育利用、ナレッジマネジメントの上位カテゴリとして扱います。',
			distinctions: [
				'生成 AI は LLM だけを意味せず、画像・音声・動画などの生成モデルも含みます。',
				'従来の識別・分類・予測中心の AI と比べ、出力として新しいコンテンツを作る点が焦点です。'
			],
			sources: [
				{
					title: 'AI principles - OECD',
					url: 'https://www.oecd.org/en/topics/sub-issues/ai-principles.html',
					kind: 'official'
				},
				{
					title: 'Guidance for generative AI in education and research - UNESCO',
					url: 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Generative artificial intelligence',
				url: 'https://en.wikipedia.org/wiki/Generative_artificial_intelligence',
				reason: '生成 AI の技術カテゴリを扱う記事で、LLM だけでない広い概念として一致します。'
			}
		},
		en: {
			definition:
				'Generative AI is a category of AI systems that can create new content such as text, images, audio, video, and code.',
			background:
				'Since 2022, chat-based LLMs and image generation models accelerated adoption in education, research, business workflows, creative work, and software development.',
			position:
				'It is the umbrella category around LLMs, RAG, AI agents, investment themes, education use, and knowledge management.',
			distinctions: [
				'Generative AI is broader than LLMs and includes image, audio, video, and other generative model families.',
				'Compared with AI focused on classification or prediction, the defining point is creating new content.'
			],
			sources: [
				{
					title: 'AI principles - OECD',
					url: 'https://www.oecd.org/en/topics/sub-issues/ai-principles.html',
					kind: 'official'
				},
				{
					title: 'Guidance for generative AI in education and research - UNESCO',
					url: 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Generative artificial intelligence',
				url: 'https://en.wikipedia.org/wiki/Generative_artificial_intelligence',
				reason: 'The article matches generative AI as the broad technology category, not only LLMs.'
			}
		}
	},
	'knowledge-management': {
		ja: {
			definition:
				'Knowledge Management は、組織内の情報と知識が必要な人へ適切なタイミングで届くよう、作成、共有、再利用、学習を設計する実践です。',
			background:
				'APQC などの実務知では、KM は単なる文書管理ではなく、人、プロセス、技術、文化を組み合わせて知識の流れを改善する取り組みとして扱われます。',
			position:
				'暗黙知、形式知、SECI、AI 要約、RAG、企業内ナレッジ基盤を接続する実務寄りの上位概念です。',
			distinctions: [
				'Knowledge Management はツール導入だけではなく、組織の行動、業務プロセス、共有文化を含みます。',
				'単なる検索システムや社内 Wiki ではなく、知識が使われ続ける仕組み全体を扱います。'
			],
			sources: [
				{
					title: 'What is Knowledge Management (KM)? - APQC',
					url: 'https://www.apqc.org/expertise/whatisknowledgemanagement',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Knowledge management',
				url: 'https://en.wikipedia.org/wiki/Knowledge_management',
				reason: '組織における知識の作成・共有・利用を扱う概念として一致します。'
			}
		},
		en: {
			definition:
				'Knowledge Management is the practice of designing how information and knowledge are created, shared, reused, and learned from across an organization.',
			background:
				'APQC frames KM as more than document management: it combines people, process, technology, and culture so knowledge flows to the right people at the right time.',
			position:
				'It connects tacit knowledge, explicit knowledge, SECI, AI summarization, RAG, and enterprise knowledge systems.',
			distinctions: [
				'Knowledge Management is not just tool deployment; it includes organizational behavior, process, and culture.',
				'It is broader than search or an internal wiki because it concerns whether knowledge is reused in practice.'
			],
			sources: [
				{
					title: 'What is Knowledge Management (KM)? - APQC',
					url: 'https://www.apqc.org/expertise/whatisknowledgemanagement',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Knowledge management',
				url: 'https://en.wikipedia.org/wiki/Knowledge_management',
				reason: 'The article matches the organizational practice of creating, sharing, and using knowledge.'
			}
		}
	},
	'second-language-acquisition': {
		ja: {
			definition:
				'Second Language Acquisition は、母語以外の言語をどのように習得するかを扱う応用言語学・認知科学上の研究領域です。',
			background:
				'学習者の入力、相互作用、気づき、タスク、年齢、動機づけ、認知過程などを通じて、第二言語がどのように発達するかを説明します。',
			position:
				'英語学習、タスク型言語教育、noticing、認知スキーマ更新、生成 AI を使った学習支援を理解する基礎概念です。',
			distinctions: [
				'Second Language Acquisition は単なる語学勉強法ではなく、習得過程を説明する研究領域です。',
				'外国語教育と重なりますが、教育技法だけでなく認知・社会・相互作用の過程も扱います。'
			],
			sources: [
				{
					title: 'Language acquisition - Britannica',
					url: 'https://www.britannica.com/topic/language-acquisition',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Second-language acquisition',
				url: 'https://en.wikipedia.org/wiki/Second-language_acquisition',
				reason: 'SLA と呼ばれる第二言語習得研究の概念に一致します。'
			}
		},
		en: {
			definition:
				'Second Language Acquisition is the field that studies how people acquire a language other than their first language.',
			background:
				'It examines input, interaction, noticing, tasks, age, motivation, and cognitive processes to explain how second-language ability develops.',
			position:
				'It provides the foundation for discussions of English learning, task-based language teaching, noticing, cognitive schema updates, and generative AI-assisted learning.',
			distinctions: [
				'Second Language Acquisition is a research field, not merely a set of language-study tips.',
				'It overlaps language teaching but also studies cognitive, social, and interactional acquisition processes.'
			],
			sources: [
				{
					title: 'Language acquisition - Britannica',
					url: 'https://www.britannica.com/topic/language-acquisition',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Second-language acquisition',
				url: 'https://en.wikipedia.org/wiki/Second-language_acquisition',
				reason: 'The article matches second-language acquisition as the SLA research field.'
			}
		}
	},
	'ai-infrastructure': {
		ja: {
			definition:
				'AI Infrastructure は、AI モデルの学習・推論・配備を支える計算資源、データセンター、電力、冷却、ネットワーク、ストレージ、運用基盤の総称です。',
			background:
				'生成 AI の普及により、高密度サーバー、GPU/アクセラレータ、電力供給、冷却、データセンター立地が AI 産業の制約条件として注目されるようになりました。',
			position:
				'半導体、データセンター、電力、クラウド、投資テーマをつなぐインフラ側の上位概念です。',
			distinctions: [
				'AI Infrastructure はモデルやアプリケーションそのものではなく、それらを動かす物理・クラウド・運用基盤です。',
				'GPU だけでなく、電力、冷却、ネットワーク、ストレージ、デプロイ基盤まで含みます。'
			],
			sources: [
				{
					title: 'Energy demand from AI - IEA',
					url: 'https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai',
					kind: 'official'
				},
				{
					title: 'Uptime Institute Global Data Center Survey 2024',
					url: 'https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2024.GlobalDataCenterSurvey.Report.pdf',
					kind: 'reference'
				}
			],
			wikipedia: wikipediaUnverified(
				'AI Infrastructure 全体を対象にした検証済みの単一 Wikipedia 記事は未確認です。'
			)
		},
		en: {
			definition:
				'AI Infrastructure is the compute, data center, power, cooling, networking, storage, and operations foundation needed to train, serve, and deploy AI models.',
			background:
				'Generative AI made high-density servers, accelerators, power supply, cooling, and data center location central constraints for the AI industry.',
			position:
				'It connects semiconductors, data centers, power, cloud platforms, and AI investment themes.',
			distinctions: [
				'AI Infrastructure is not the model or application itself; it is the physical, cloud, and operational base that runs them.',
				'It includes more than GPUs: power, cooling, networking, storage, and deployment operations also matter.'
			],
			sources: [
				{
					title: 'Energy demand from AI - IEA',
					url: 'https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai',
					kind: 'official'
				},
				{
					title: 'Uptime Institute Global Data Center Survey 2024',
					url: 'https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2024.GlobalDataCenterSurvey.Report.pdf',
					kind: 'reference'
				}
			],
			wikipedia: wikipediaUnverified(
				'No verified single Wikipedia article represents AI Infrastructure as the full compute, data center, power, and operations concept.'
			)
		}
	},
	'data-centers': {
		ja: {
			definition:
				'Data Centers は、サーバー、ストレージ、ネットワーク、電源、冷却、物理セキュリティを集約し、デジタルサービスを稼働させる施設です。',
			background:
				'クラウド、AI、動画配信、金融、企業 IT の拡大により、データセンターは電力需要、冷却、地域インフラ、災害耐性の観点から重要性が増しています。',
			position:
				'AI Infrastructure、電力、冷却、半導体、クラウド投資を結びつける物理インフラの中核です。',
			distinctions: [
				'Data Centers は単なるサーバールームではなく、冗長電源、冷却、ネットワーク、運用監視を備えた施設です。',
				'AI データセンターでは通常の IT 負荷より高い電力密度や冷却要件が問題になりやすくなります。'
			],
			sources: [
				{
					title: 'Uptime Institute Global Data Center Survey 2024',
					url: 'https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2024.GlobalDataCenterSurvey.Report.pdf',
					kind: 'reference'
				},
				{
					title: 'Energy demand from AI - IEA',
					url: 'https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Data center',
				url: 'https://en.wikipedia.org/wiki/Data_center',
				reason: 'データセンター施設の一般概念として一致します。'
			}
		},
		en: {
			definition:
				'Data centers are facilities that house servers, storage, networking, power, cooling, and physical security for running digital services.',
			background:
				'Cloud computing, AI, streaming, finance, and enterprise IT have made data centers important for power demand, cooling, regional infrastructure, and resilience.',
			position:
				'They are the physical infrastructure core connecting AI Infrastructure, power, cooling, semiconductors, and cloud investment.',
			distinctions: [
				'Data centers are more than server rooms; they include redundant power, cooling, networking, operations, and monitoring.',
				'AI data centers often raise higher-density power and cooling issues than conventional IT workloads.'
			],
			sources: [
				{
					title: 'Uptime Institute Global Data Center Survey 2024',
					url: 'https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2024.GlobalDataCenterSurvey.Report.pdf',
					kind: 'reference'
				},
				{
					title: 'Energy demand from AI - IEA',
					url: 'https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Data center',
				url: 'https://en.wikipedia.org/wiki/Data_center',
				reason: 'The article matches the general facility concept of data centers.'
			}
		}
	},
	semiconductors: {
		ja: {
			definition:
				'Semiconductors は、導体と絶縁体の中間的な電気的性質を持つ材料や、それを使った集積回路・チップを指す用語です。',
			background:
				'現代の計算機、スマートフォン、AI アクセラレータ、メモリ、通信機器は半導体デバイスに依存しており、産業政策や地政学の焦点にもなっています。',
			position:
				'AI Infrastructure、NAND、SSD、データセンター、台湾情勢、クラウド投資を理解する基礎概念です。',
			distinctions: [
				'材料としての semiconductor と、産業上の semiconductor chips は文脈により指す範囲が異なります。',
				'NAND や GPU は半導体デバイスの具体例であり、Semiconductors はそれらを含む上位概念です。'
			],
			sources: [
				{
					title: 'Semiconductor Industry Association',
					url: 'https://www.semiconductors.org/',
					kind: 'official'
				},
				{
					title: 'Semiconductor - Britannica',
					url: 'https://www.britannica.com/science/semiconductor',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Semiconductor',
				url: 'https://en.wikipedia.org/wiki/Semiconductor',
				reason: '半導体材料・デバイスの基礎概念として一致します。'
			}
		},
		en: {
			definition:
				'Semiconductors are materials with electrical conductivity between conductors and insulators, and the term also commonly refers to chips built from such materials.',
			background:
				'Modern computers, phones, AI accelerators, memory, and communications equipment depend on semiconductor devices, making them central to industrial policy and geopolitics.',
			position:
				'They are foundational for AI Infrastructure, NAND, SSDs, data centers, Taiwan-related supply chains, and cloud investment.',
			distinctions: [
				'The material meaning of semiconductor and the industry meaning of semiconductor chips differ by context.',
				'NAND and GPUs are specific semiconductor devices; Semiconductors is the broader category.'
			],
			sources: [
				{
					title: 'Semiconductor Industry Association',
					url: 'https://www.semiconductors.org/',
					kind: 'official'
				},
				{
					title: 'Semiconductor - Britannica',
					url: 'https://www.britannica.com/science/semiconductor',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Semiconductor',
				url: 'https://en.wikipedia.org/wiki/Semiconductor',
				reason: 'The article matches the basic material and device concept.'
			}
		}
	},
	'international-humanitarian-law': {
		ja: {
			definition:
				'International Humanitarian Law は、武力紛争の影響を人道上の理由から制限し、戦闘に参加していない人や負傷者などを保護する国際法の体系です。',
			background:
				'ジュネーブ諸条約と追加議定書を中心に、戦争の方法・手段、捕虜、文民、負傷者、医療施設などの保護を定めます。',
			position:
				'地雷、民間人保護、戦争被害、停戦、占領、武力紛争下の責任を理解するための法的基盤です。',
			distinctions: [
				'International Humanitarian Law は武力紛争中のルールであり、人権法とは重なりつつも適用場面が異なります。',
				'戦争を合法化する概念ではなく、紛争下でも越えてはならない制約を定めるものです。'
			],
			sources: [
				{
					title: 'What is International Humanitarian Law? - ICRC',
					url: 'https://www.icrc.org/sites/default/files/document/file_list/what-is-ihl-factsheet.pdf',
					kind: 'official'
				},
				{
					title: 'The Geneva Conventions and their Commentaries - ICRC',
					url: 'https://www.icrc.org/en/law-and-policy/geneva-conventions-and-their-commentaries',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'International humanitarian law',
				url: 'https://en.wikipedia.org/wiki/International_humanitarian_law',
				reason: '武力紛争下の人道法体系として一致します。'
			}
		},
		en: {
			definition:
				'International Humanitarian Law is the body of international law that limits the effects of armed conflict and protects people who are not or are no longer taking part in hostilities.',
			background:
				'Centered on the Geneva Conventions and their Additional Protocols, it regulates means and methods of warfare and protects civilians, prisoners, wounded people, and medical services.',
			position:
				'It is the legal foundation for understanding landmines, civilian protection, war harm, ceasefires, occupation, and responsibility during armed conflict.',
			distinctions: [
				'International Humanitarian Law governs armed conflict; human rights law overlaps but has a different scope and legal structure.',
				'It does not legitimize war; it sets limits that still apply during conflict.'
			],
			sources: [
				{
					title: 'What is International Humanitarian Law? - ICRC',
					url: 'https://www.icrc.org/sites/default/files/document/file_list/what-is-ihl-factsheet.pdf',
					kind: 'official'
				},
				{
					title: 'The Geneva Conventions and their Commentaries - ICRC',
					url: 'https://www.icrc.org/en/law-and-policy/geneva-conventions-and-their-commentaries',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'International humanitarian law',
				url: 'https://en.wikipedia.org/wiki/International_humanitarian_law',
				reason: 'The article matches the legal body governing armed conflict for humanitarian reasons.'
			}
		}
	},
	'monetary-policy': {
		ja: {
			definition:
				'Monetary Policy は、中央銀行が物価安定や雇用・経済活動の安定を目的に、政策金利、資金供給、資産買入れなどを通じて金融環境を調整する政策です。',
			background:
				'日本銀行、FRB、ECB などの中央銀行は、それぞれの法的使命と経済環境に応じて、金利、量的緩和、フォワードガイダンスなどを使います。',
			position:
				'金利、住宅ローン、為替、物価、賃金、国債、財政との関係を理解する基礎概念です。',
			distinctions: [
				'Monetary Policy は中央銀行の政策であり、政府の歳出・税制を扱う Fiscal Policy とは異なります。',
				'金利操作だけでなく、資産買入れ、準備預金、コミュニケーション政策も含みます。'
			],
			sources: [
				{
					title: 'Outline of Monetary Policy - Bank of Japan',
					url: 'https://www.boj.or.jp/en/mopo/outline/index.htm',
					kind: 'official'
				},
				{
					title: 'Monetary Policy Strategies of Major Central Banks - Federal Reserve',
					url: 'https://www.federalreserve.gov/monetarypolicy/monetary-policy-strategies-of-major-central-banks.htm',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Monetary policy',
				url: 'https://en.wikipedia.org/wiki/Monetary_policy',
				reason: '中央銀行による金融政策の一般概念として一致します。'
			}
		},
		en: {
			definition:
				'Monetary Policy is central-bank policy that adjusts financial conditions through interest rates, liquidity, asset purchases, and communication to support price stability and economic objectives.',
			background:
				'Central banks such as the Bank of Japan, the Federal Reserve, and the ECB use tools such as policy rates, quantitative easing, and forward guidance according to their mandates and economic conditions.',
			position:
				'It is foundational for understanding interest rates, mortgages, exchange rates, inflation, wages, government bonds, and fiscal interactions.',
			distinctions: [
				'Monetary Policy is central-bank policy; Fiscal Policy concerns government spending and taxation.',
				'It includes more than interest-rate moves, such as asset purchases, reserves, and policy communication.'
			],
			sources: [
				{
					title: 'Outline of Monetary Policy - Bank of Japan',
					url: 'https://www.boj.or.jp/en/mopo/outline/index.htm',
					kind: 'official'
				},
				{
					title: 'Monetary Policy Strategies of Major Central Banks - Federal Reserve',
					url: 'https://www.federalreserve.gov/monetarypolicy/monetary-policy-strategies-of-major-central-banks.htm',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Monetary policy',
				url: 'https://en.wikipedia.org/wiki/Monetary_policy',
				reason: 'The article matches monetary policy as the general central-bank policy concept.'
			}
		}
	},
	newsql: {
		ja: {
			definition:
				'NewSQL は、リレーショナルデータベースの SQL とトランザクション性を保ちながら、分散システムとして水平スケールや高可用性を目指すデータベース分類です。',
			background:
				'クラウドや大規模アプリケーションで、従来の RDBMS の整合性と NoSQL 系のスケール特性を両立したい需要から注目されました。',
			position:
				'Distributed SQL、PostgreSQL 互換、YugabyteDB、CockroachDB、クラウドネイティブなデータ基盤を理解する上位概念です。',
			distinctions: [
				'NewSQL は特定製品名ではなく、分散 SQL データベースの設計思想・分類です。',
				'NoSQL と違い、SQL、スキーマ、ACID トランザクションとの互換性を重視することが多いです。'
			],
			sources: [
				{
					title: 'Distributed SQL - Cockroach Labs',
					url: 'https://www.cockroachlabs.com/glossary/distributed-db/distributed-sql/',
					kind: 'reference'
				},
				{
					title: 'YugabyteDB vs CockroachDB',
					url: 'https://www.yugabyte.com/yugabytedb-vs-cockroachdb/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'NewSQL',
				url: 'https://en.wikipedia.org/wiki/NewSQL',
				reason: 'SQL と分散スケールを組み合わせるデータベース分類として一致します。'
			}
		},
		en: {
			definition:
				'NewSQL is a database category that aims to preserve SQL and relational transaction semantics while adding horizontal scale and high availability through distributed systems.',
			background:
				'It emerged from demand for combining traditional RDBMS consistency with scale characteristics associated with cloud and large-scale applications.',
			position:
				'It frames Distributed SQL, PostgreSQL compatibility, YugabyteDB, CockroachDB, and cloud-native data infrastructure.',
			distinctions: [
				'NewSQL is not a single product name; it is a design category for distributed SQL databases.',
				'Unlike many NoSQL systems, NewSQL usually emphasizes SQL, schemas, and ACID transaction compatibility.'
			],
			sources: [
				{
					title: 'Distributed SQL - Cockroach Labs',
					url: 'https://www.cockroachlabs.com/glossary/distributed-db/distributed-sql/',
					kind: 'reference'
				},
				{
					title: 'YugabyteDB vs CockroachDB',
					url: 'https://www.yugabyte.com/yugabytedb-vs-cockroachdb/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'NewSQL',
				url: 'https://en.wikipedia.org/wiki/NewSQL',
				reason: 'The article matches NewSQL as the database category combining SQL and distributed scale.'
			}
		}
	},
	'oauth-2.1': {
		ja: {
			definition:
				'OAuth 2.1 は、OAuth 2.0 の広く使われる安全な実践を整理し、暗黙的フローなどを外し、Authorization Code + PKCE を中心に据える方向の仕様です。',
			background:
				'IETF OAuth Working Group のドラフトとして、OAuth 2.0、OAuth 2.0 Security Best Current Practice、PKCE などで積み上がった変更を統合する位置づけです。',
			position:
				'MCP や外部 API 接続における認可の前提知識として、PKCE、OIDC と並ぶ位置にあります。',
			distinctions: [
				'OAuth は認可の枠組みであり、OIDC は OAuth 2.0 上に認証情報を載せる identity layer です。',
				'OAuth 2.1 は OAuth 2.0 と別系統の新発明ではなく、既存ベストプラクティスを整理する仕様です。'
			],
			sources: [
				{
					title: 'OAuth 2.1 draft, IETF Datatracker',
					url: 'https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/',
					kind: 'standard'
				},
				{
					title: 'OAuth 2.0 Security Best Current Practice',
					url: 'https://datatracker.ietf.org/doc/rfc9700/',
					kind: 'standard'
				}
			],
			wikipedia: wikipediaUnverified(
				'OAuth 2.1 単体の記事として検証済みの Wikipedia リンクはないため、リンクしません。'
			)
		},
		en: {
			definition:
				'OAuth 2.1 is a specification effort that consolidates safer OAuth 2.0 practices, removes deprecated flows, and centers Authorization Code with PKCE.',
			background:
				'The IETF OAuth Working Group draft integrates lessons from OAuth 2.0, OAuth Security Best Current Practice, and PKCE.',
			position:
				'It is background for authorization when MCP clients, servers, and external APIs need delegated access.',
			distinctions: [
				'OAuth is about authorization; OIDC adds an identity layer on top of OAuth 2.0.',
				'OAuth 2.1 is not a wholly separate invention from OAuth 2.0; it consolidates current best practices.'
			],
			sources: [
				{
					title: 'OAuth 2.1 draft, IETF Datatracker',
					url: 'https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/',
					kind: 'standard'
				},
				{
					title: 'OAuth 2.0 Security Best Current Practice',
					url: 'https://datatracker.ietf.org/doc/rfc9700/',
					kind: 'standard'
				}
			],
			wikipedia: wikipediaUnverified(
				'No verified Wikipedia article specifically represents OAuth 2.1 as used here.'
			)
		}
	},
	pkce: {
		ja: {
			definition:
				'PKCE は、OAuth の Authorization Code Flow で認可コード横取りを防ぐため、クライアントが code verifier と code challenge を使う拡張です。',
			background:
				'RFC 7636 で定義され、モバイルアプリや SPA などクライアントシークレットを安全に保持しにくい環境で重要になりました。',
			position:
				'OAuth 2.1 や MCP 認可の安全性を支える具体的な仕組みとして位置づきます。',
			distinctions: [
				'PKCE は認証方式ではなく、Authorization Code Flow を補強する OAuth 拡張です。',
				'OIDC と併用されることはありますが、OIDC そのものではありません。'
			],
			sources: [
				{
					title: 'RFC 7636: Proof Key for Code Exchange',
					url: 'https://www.rfc-editor.org/rfc/rfc7636',
					kind: 'standard'
				}
			],
			wikipedia: wikipediaUnverified(
				'PKCE 単体の概念として検証済みの Wikipedia 記事はないため、RFC を主出典にします。'
			)
		},
		en: {
			definition:
				'PKCE is an OAuth extension that uses a code verifier and code challenge to protect Authorization Code Flow against code interception.',
			background:
				'Defined in RFC 7636, it became especially important for mobile apps and browser-based clients that cannot safely hold a client secret.',
			position:
				'It is the concrete mechanism that strengthens OAuth 2.1 and MCP authorization flows.',
			distinctions: [
				'PKCE is not an authentication protocol; it strengthens OAuth Authorization Code Flow.',
				'It can be used with OIDC, but it is not OIDC itself.'
			],
			sources: [
				{
					title: 'RFC 7636: Proof Key for Code Exchange',
					url: 'https://www.rfc-editor.org/rfc/rfc7636',
					kind: 'standard'
				}
			],
			wikipedia: wikipediaUnverified(
				'No verified standalone Wikipedia article matches PKCE as the RFC-defined OAuth extension.'
			)
		}
	},
	oidc: {
		ja: {
			definition:
				'OIDC は、OAuth 2.0 の上に ID Token とユーザー情報取得を加えることで、認証を扱えるようにした identity layer です。',
			background:
				'OpenID Foundation が策定する OpenID Connect Core は、OAuth 2.0 フローを使ってエンドユーザーの identity をクライアントへ伝える仕様です。',
			position:
				'OAuth/PKCE と隣接し、外部サービス接続時に「認可」と「認証」を分けるための概念です。',
			distinctions: [
				'OAuth はアクセス委譲の認可、OIDC はログイン主体を確認する認証を扱います。',
				'OpenID 2.0 と OpenID Connect は別世代の仕様です。'
			],
			sources: [
				{
					title: 'OpenID Connect Core 1.0',
					url: 'https://openid.net/specs/openid-connect-core-1_0.html',
					kind: 'standard'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'OpenID Connect',
				url: 'https://en.wikipedia.org/wiki/OpenID_Connect',
				reason: 'OIDC 略称が OpenID Connect を指す認証仕様の文脈で一致します。'
			}
		},
		en: {
			definition:
				'OIDC is an identity layer on top of OAuth 2.0 that adds ID Tokens and user information so clients can authenticate end users.',
			background:
				'OpenID Connect Core, maintained by the OpenID Foundation, uses OAuth 2.0 flows to communicate end-user identity to clients.',
			position:
				'It sits next to OAuth and PKCE as the concept that separates authentication from authorization in external service connections.',
			distinctions: [
				'OAuth delegates access; OIDC communicates authenticated identity.',
				'OpenID Connect is distinct from the older OpenID 2.0 protocol.'
			],
			sources: [
				{
					title: 'OpenID Connect Core 1.0',
					url: 'https://openid.net/specs/openid-connect-core-1_0.html',
					kind: 'standard'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'OpenID Connect',
				url: 'https://en.wikipedia.org/wiki/OpenID_Connect',
				reason: 'The OIDC abbreviation matches OpenID Connect in this authentication context.'
			}
		}
	},
	rag: {
		ja: {
			definition:
				'RAG は、生成モデルの回答に検索された外部情報を組み合わせる Retrieval-Augmented Generation の手法です。',
			background:
				'2020 年の Lewis らの研究以降、LLM が外部文書や知識ベースを参照して回答する代表的な設計として広まりました。',
			position:
				'Knowledge Graph やメモリ基盤と並ぶ、外部知識を LLM に渡す方法として位置づきます。',
			distinctions: [
				'RAG は知識そのものの構造ではなく、検索と生成を組み合わせるアーキテクチャです。',
				'Knowledge Graph は知識表現、RAG は参照された情報を生成に使う処理方式です。'
			],
			sources: [
				{
					title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
					url: 'https://arxiv.org/abs/2005.11401',
					kind: 'paper'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Retrieval-augmented generation',
				url: 'https://en.wikipedia.org/wiki/Retrieval-augmented_generation',
				reason: 'Retrieval-Augmented Generation を指す AI 手法の文脈で一致します。'
			}
		},
		en: {
			definition:
				'RAG, or Retrieval-Augmented Generation, combines retrieved external information with generative model output.',
			background:
				'After the 2020 work by Lewis et al., RAG became a common design for grounding LLM answers in documents or knowledge bases.',
			position:
				'It sits next to Knowledge Graphs and memory systems as a way to feed external knowledge into LLM workflows.',
			distinctions: [
				'RAG is an architecture for retrieval plus generation, not a knowledge representation by itself.',
				'A Knowledge Graph structures knowledge; RAG retrieves information and uses it during generation.'
			],
			sources: [
				{
					title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
					url: 'https://arxiv.org/abs/2005.11401',
					kind: 'paper'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Retrieval-augmented generation',
				url: 'https://en.wikipedia.org/wiki/Retrieval-augmented_generation',
				reason: 'The article matches Retrieval-Augmented Generation as the AI method discussed here.'
			}
		}
	},
	polanyi: {
		ja: {
			definition:
				'Polanyi は、暗黙知、個人的知識、科学共同体における判断を論じたハンガリー系イギリスの思想家 Michael Polanyi を指します。',
			background:
				'Polanyi は化学者として出発し、のちに科学哲学・社会思想へ移り、The Tacit Dimension や Personal Knowledge で「語れる以上に知っている」という暗黙知の議論を展開しました。',
			position:
				'Tacit Knowledge、Value Judgment、Knowledge Management、AI 要約による知識の圧縮リスクを読むための基礎人物です。',
			distinctions: [
				'Polanyi は単なる「暗黙知」という用語の出典ではなく、知る行為を個人的関与と判断の構造として捉えた思想家です。',
				'Karl Polanyi とは別人です。経済人類学の Karl Polanyi と混同しないようにします。'
			],
			sources: [
				{
					title: 'The Tacit Dimension - University of Chicago Press',
					url: 'https://press.uchicago.edu/ucp/books/book/chicago/T/bo6035368.html',
					kind: 'reference'
				},
				{
					title: 'Michael Polanyi - University of Chicago Press',
					url: 'https://press.uchicago.edu/ucp/books/author/P/M/au5523889.html',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Michael Polanyi',
				url: 'https://en.wikipedia.org/wiki/Michael_Polanyi',
				reason: '暗黙知・個人的知識の文脈で扱う Michael Polanyi に一致します。'
			}
		},
		en: {
			definition:
				'Polanyi refers here to Michael Polanyi, the Hungarian-British thinker associated with tacit knowledge, personal knowledge, and judgment in science.',
			background:
				'Trained as a chemist before moving into philosophy and social thought, Polanyi developed the idea that people can know more than they can explicitly tell.',
			position:
				'He anchors discussions of Tacit Knowledge, Value Judgment, Knowledge Management, and the risks of compressing expertise through AI summarization.',
			distinctions: [
				'Polanyi is not just a source for the term tacit knowledge; he treats knowing as a structure of personal commitment and judgment.',
				'He should be distinguished from Karl Polanyi, the economic historian and anthropologist.'
			],
			sources: [
				{
					title: 'The Tacit Dimension - University of Chicago Press',
					url: 'https://press.uchicago.edu/ucp/books/book/chicago/T/bo6035368.html',
					kind: 'reference'
				},
				{
					title: 'Michael Polanyi - University of Chicago Press',
					url: 'https://press.uchicago.edu/ucp/books/author/P/M/au5523889.html',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Michael Polanyi',
				url: 'https://en.wikipedia.org/wiki/Michael_Polanyi',
				reason: 'The article matches Michael Polanyi in the tacit-knowledge context.'
			}
		}
	},
	wittgenstein: {
		ja: {
			definition:
				'Wittgenstein は、言語、意味、論理、規則、生活形式をめぐる20世紀分析哲学の中心人物 Ludwig Wittgenstein を指します。',
			background:
				'前期の Tractatus Logico-Philosophicus では言語・世界・論理の限界を扱い、後期の Philosophical Investigations では意味を使用や言語ゲームの中で捉え直しました。',
			position:
				'言語ゲーム、Philosophy of Language、Intentionality、LLM の言語使用を論じる際の基礎参照点です。',
			distinctions: [
				'前期 Wittgenstein と後期 Wittgenstein は、言語観が大きく異なります。',
				'Wittgenstein は LLM 論者ではなく、LLM 論では彼の言語観を応用的に参照します。'
			],
			sources: [
				{
					title: 'Ludwig Wittgenstein - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/wittgenstein/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Ludwig Wittgenstein',
				url: 'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein',
				reason: '言語哲学・分析哲学の Ludwig Wittgenstein を指す文脈と一致します。'
			}
		},
		en: {
			definition:
				'Wittgenstein refers to Ludwig Wittgenstein, a central figure in twentieth-century analytic philosophy of language, logic, rules, and forms of life.',
			background:
				'His early Tractatus examined the limits of language, world, and logic; his later work reoriented meaning around use, practice, and language games.',
			position:
				'He is a key reference for language games, Philosophy of Language, Intentionality, and philosophical debates about LLM language use.',
			distinctions: [
				'Early and later Wittgenstein should not be collapsed into one doctrine.',
				'Wittgenstein did not write about LLMs; contemporary LLM debates apply his concepts to a new setting.'
			],
			sources: [
				{
					title: 'Ludwig Wittgenstein - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/wittgenstein/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Ludwig Wittgenstein',
				url: 'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein',
				reason: 'The article matches Ludwig Wittgenstein in the philosophy-of-language context.'
			}
		}
	},
	'language-games': {
		ja: {
			definition:
				'Language Games は、言葉の意味を抽象的な対応関係ではなく、命令、質問、報告、約束などの具体的な実践の中で捉える Wittgenstein 後期哲学の概念です。',
			background:
				'Philosophical Investigations では、語の意味は生活形式に埋め込まれた使用から理解されるという観点が示され、規則、理解、共同実践の議論につながりました。',
			position:
				'LLM の出力を「理解しているか」だけでなく、人間の言語実践の中でどのような手として扱われるかを分析するための基礎概念です。',
			distinctions: [
				'通常のゲーム理論や娯楽としてのゲームではなく、言語使用の多様な実践を示す哲学的比喩です。',
				'Language Games は LLM 固有の概念ではありませんが、LLM の発話が人間の実践にどう取り込まれるかを考える際に応用されます。'
			],
			sources: [
				{
					title: 'Ludwig Wittgenstein - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/wittgenstein/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Language game (philosophy)',
				url: 'https://en.wikipedia.org/wiki/Language_game_(philosophy)',
				reason: 'Wittgenstein 後期哲学における言語使用の実践概念として一致します。'
			}
		},
		en: {
			definition:
				'Language Games is a later-Wittgensteinian concept that treats meaning through concrete practices such as commanding, questioning, reporting, promising, and correcting rather than through an abstract word-world mapping alone.',
			background:
				'In Philosophical Investigations, meaning is understood through use within forms of life, connecting language to rules, understanding, and shared practice.',
			position:
				'It is a base concept for analyzing LLM outputs not only by asking whether the system understands, but by asking what kind of move the output becomes in human linguistic practice.',
			distinctions: [
				'It is not game theory or entertainment; it is a philosophical metaphor for varied practices of language use.',
				'Language games are not specific to LLMs, but they are useful for analyzing how LLM utterances are taken up by humans.'
			],
			sources: [
				{
					title: 'Ludwig Wittgenstein - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/wittgenstein/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Language game (philosophy)',
				url: 'https://en.wikipedia.org/wiki/Language_game_(philosophy)',
				reason: 'The article matches the later-Wittgensteinian concept of language use as practice.'
			}
		}
	},
	intentionality: {
		ja: {
			definition:
				'Intentionality は、心的状態や表象が何かについてである、何かを表す、何かへ向かうという性質を指す哲学概念です。',
			background:
				'ブレンターノ以降の心の哲学・現象学・言語哲学で中心的に扱われ、信念、欲求、意味、表象、記号接地の議論に関わります。',
			position:
				'LLM が意味や理解を持つか、言語使用が何かについてであると言えるかを論じる際の中核概念です。',
			distinctions: [
				'日常語の intention、つまり意図や計画だけを意味するわけではありません。',
				'心的志向性と、言語表現が意味を持つことは分けて扱う必要があります。'
			],
			sources: [
				{
					title: 'Intentionality - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/intentionality/',
					kind: 'reference'
				},
				{
					title: 'Rule-Following and Intentionality - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/rule-following/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Intentionality',
				url: 'https://en.wikipedia.org/wiki/Intentionality',
				reason: '心の哲学における aboutness の概念として一致します。'
			}
		},
		en: {
			definition:
				'Intentionality is the philosophical notion that mental states or representations are about, represent, or stand for something.',
			background:
				'Since Brentano, intentionality has been central to philosophy of mind, phenomenology, and philosophy of language, especially in debates about belief, desire, meaning, representation, and grounding.',
			position:
				'It is central when asking whether LLM outputs can be about the world, carry meaning, or count as understanding.',
			distinctions: [
				'Intentionality is broader than ordinary intention as a plan or purpose.',
				'Mental intentionality and linguistic meaning should be analyzed separately.'
			],
			sources: [
				{
					title: 'Intentionality - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/intentionality/',
					kind: 'reference'
				},
				{
					title: 'Rule-Following and Intentionality - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/rule-following/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Intentionality',
				url: 'https://en.wikipedia.org/wiki/Intentionality',
				reason: 'The article matches intentionality as aboutness in philosophy of mind.'
			}
		}
	},
	'philosophy-of-language': {
		ja: {
			definition:
				'Philosophy of Language は、言語の意味、指示、真理、使用、理解、言語と世界・話者の関係を扱う哲学分野です。',
			background:
				'分析哲学の中心領域として、Frege、Russell、Wittgenstein、Austin、Grice、Davidson らの議論を通じて発展しました。',
			position:
				'LLM の発話、意味理解、言語ゲーム、Intentionality を論じる際の上位カテゴリです。',
			distinctions: [
				'言語学が言語の構造や使用を経験的に分析するのに対し、Philosophy of Language は意味・真理・指示などの概念問題を扱います。',
				'自然言語処理の技術分野そのものではありません。'
			],
			sources: [
				{
					title: 'Philosophy of language - Britannica',
					url: 'https://www.britannica.com/topic/philosophy-of-language',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Philosophy of language',
				url: 'https://en.wikipedia.org/wiki/Philosophy_of_language',
				reason: '言語の意味・指示・使用を扱う哲学分野として一致します。'
			}
		},
		en: {
			definition:
				'Philosophy of Language studies meaning, reference, truth, use, understanding, and the relation between language, speakers, and the world.',
			background:
				'It became a central area of analytic philosophy through figures such as Frege, Russell, Wittgenstein, Austin, Grice, and Davidson.',
			position:
				'It is the umbrella field for discussions of LLM utterances, meaning, language games, and Intentionality.',
			distinctions: [
				'Linguistics empirically studies language structure and use; philosophy of language asks conceptual questions about meaning, truth, and reference.',
				'It is not the same as natural language processing as a technical field.'
			],
			sources: [
				{
					title: 'Philosophy of language - Britannica',
					url: 'https://www.britannica.com/topic/philosophy-of-language',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Philosophy of language',
				url: 'https://en.wikipedia.org/wiki/Philosophy_of_language',
				reason: 'The article matches the philosophical field concerned with meaning, reference, and language use.'
			}
		}
	},
	'value-judgment': {
		ja: {
			definition:
				'Value Judgment は、事実の記述だけではなく、何が良い、重要、妥当、望ましいかを評価する判断です。',
			background:
				'倫理学、価値論、科学哲学、政策判断では、観察や分析に価値の選択がどのように入り込むかが問題になります。',
			position:
				'暗黙知、Polanyi、AI 要約、政策分析で、何を残し何を削るかを決める規範的な判断として重要です。',
			distinctions: [
				'Value Judgment は単なる好みではなく、理由づけや規範を伴う評価を含みます。',
				'事実判断と対立するだけでなく、何を事実として重要視するかにも関わります。'
			],
			sources: [
				{
					title: 'Value Theory - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/value-theory/',
					kind: 'reference'
				},
				{
					title: 'Normativity in Metaethics - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/normativity-metaethics/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Value judgment',
				url: 'https://en.wikipedia.org/wiki/Value_judgment',
				reason: '事実記述ではなく評価を含む判断という概念に一致します。'
			}
		},
		en: {
			definition:
				'A Value Judgment is an evaluative judgment about what is good, important, valid, desirable, or worth preserving, not merely a factual description.',
			background:
				'In ethics, value theory, philosophy of science, and policy analysis, the issue is how choices about value shape observation, explanation, and decision-making.',
			position:
				'It matters for Tacit Knowledge, Polanyi, AI summarization, and policy analysis because it determines what is preserved, emphasized, or omitted.',
			distinctions: [
				'A value judgment is not just a private preference; it can involve reasons and norms.',
				'It is not simply opposed to fact judgment, because values also shape which facts are treated as salient.'
			],
			sources: [
				{
					title: 'Value Theory - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/value-theory/',
					kind: 'reference'
				},
				{
					title: 'Normativity in Metaethics - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/normativity-metaethics/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Value judgment',
				url: 'https://en.wikipedia.org/wiki/Value_judgment',
				reason: 'The article matches the concept of evaluative judgment rather than factual description.'
			}
		}
	},
	geopolitics: {
		ja: {
			definition:
				'Geopolitics は、地理的条件が国家間の権力関係、戦略、資源、同盟、紛争に与える影響を分析する視点です。',
			background:
				'古典的には地理と大国戦略を結びつける議論として発展し、現在はエネルギー、海上交通、国境、軍事配置、サプライチェーンも含めて使われます。',
			position:
				'中東、ウクライナ、台湾、エネルギー安全保障、制裁、同盟を横断して読むための上位概念です。',
			distinctions: [
				'Geopolitics は単なる国際ニュースではなく、地理と権力関係の結びつきを読む分析枠組みです。',
				'国名や地域名そのものではなく、それらを動かす構造に注目します。'
			],
			sources: [
				{
					title: 'Geopolitics - Britannica',
					url: 'https://www.britannica.com/topic/geopolitics',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Geopolitics',
				url: 'https://en.wikipedia.org/wiki/Geopolitics',
				reason: '地理的影響と国際政治の権力関係を扱う概念として一致します。'
			}
		},
		en: {
			definition:
				'Geopolitics analyzes how geography shapes power relations, strategy, resources, alliances, and conflict in international relations.',
			background:
				'Classically tied to geography and great-power strategy, the term now also covers energy, maritime routes, borders, military posture, and supply chains.',
			position:
				'It is an umbrella concept for reading the Middle East, Ukraine, Taiwan, energy security, sanctions, and alliances together.',
			distinctions: [
				'Geopolitics is not just international news; it is an analytical frame linking geography and power.',
				'It focuses on structures around places rather than treating country names as explanations.'
			],
			sources: [
				{
					title: 'Geopolitics - Britannica',
					url: 'https://www.britannica.com/topic/geopolitics',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Geopolitics',
				url: 'https://en.wikipedia.org/wiki/Geopolitics',
				reason: 'The article matches the concept of geographic influence on international power relations.'
			}
		}
	},
	'human-rights': {
		ja: {
			definition:
				'Human Rights は、人が人であることに基づいて持つ、国家から付与される以前の普遍的な権利を指します。',
			background:
				'第二次世界大戦後、世界人権宣言や国際人権法を通じて、生命、自由、平等、政治参加、社会的権利などを国際的に保護する枠組みが整えられました。',
			position:
				'市民抑圧、占領、抗議運動、人道危機、国際法を読むための基本概念です。',
			distinctions: [
				'Human Rights は国際人道法とは異なり、平時にも戦時にも人の権利を扱います。',
				'国家の慈善や政策目標ではなく、権利として主張される点が重要です。'
			],
			sources: [
				{
					title: 'What are human rights? - OHCHR',
					url: 'https://www.ohchr.org/en/what-are-human-rights',
					kind: 'official'
				},
				{
					title: 'Universal Declaration of Human Rights - OHCHR',
					url: 'https://www.ohchr.org/en/universal-declaration-of-human-rights',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Human rights',
				url: 'https://en.wikipedia.org/wiki/Human_rights',
				reason: '普遍的な人権概念として一致します。'
			}
		},
		en: {
			definition:
				'Human Rights are universal rights people have simply by being human, not because a state grants them.',
			background:
				'After World War II, the Universal Declaration of Human Rights and international human rights law developed a global framework for civil, political, economic, social, and cultural rights.',
			position:
				'They are a core concept for reading repression, occupation, protest, humanitarian crisis, and international law.',
			distinctions: [
				'Human rights differ from international humanitarian law because they apply beyond armed conflict.',
				'They are claimed as rights, not merely as charity or policy preferences.'
			],
			sources: [
				{
					title: 'What are human rights? - OHCHR',
					url: 'https://www.ohchr.org/en/what-are-human-rights',
					kind: 'official'
				},
				{
					title: 'Universal Declaration of Human Rights - OHCHR',
					url: 'https://www.ohchr.org/en/universal-declaration-of-human-rights',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Human rights',
				url: 'https://en.wikipedia.org/wiki/Human_rights',
				reason: 'The article matches the universal rights concept used here.'
			}
		}
	},
	sanctions: {
		ja: {
			definition:
				'Sanctions は、国際平和、安全保障、人権、核不拡散などの目的で、国家・組織・個人に課される経済・金融・移動・武器関連の制限措置です。',
			background:
				'国連安全保障理事会、米国、EU などは、武力行使以外の圧力手段として資産凍結、渡航禁止、禁輸、金融制裁を使います。',
			position:
				'イラン核問題、ロシア制裁、代理勢力、国際秩序の強制手段を理解する基本概念です。',
			distinctions: [
				'Sanctions は外交的非難より強く、軍事行動よりは非軍事的な強制手段です。',
				'国連制裁と各国・地域機構の独自制裁は法的根拠と範囲が異なります。'
			],
			sources: [
				{
					title: 'Sanctions - United Nations Security Council',
					url: 'https://main.un.org/securitycouncil/en/sanctions/information',
					kind: 'official'
				},
				{
					title: 'OFAC Sanctions Programs and Information',
					url: 'https://ofac.treasury.gov/sanctions-programs-and-country-information',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'International sanctions',
				url: 'https://en.wikipedia.org/wiki/International_sanctions',
				reason: '国際政治上の制裁措置を扱う文脈と一致します。'
			}
		},
		en: {
			definition:
				'Sanctions are restrictive measures, such as financial, trade, travel, or arms-related limits, imposed to pursue security, human-rights, non-proliferation, or peace objectives.',
			background:
				'The UN Security Council, the United States, the EU, and others use asset freezes, travel bans, embargoes, and financial restrictions as non-military pressure tools.',
			position:
				'They are central to Iran nuclear policy, Russia policy, proxy networks, and the enforcement side of international order.',
			distinctions: [
				'Sanctions are stronger than diplomatic criticism but usually short of military action.',
				'UN sanctions and autonomous national or regional sanctions differ in legal basis and scope.'
			],
			sources: [
				{
					title: 'Sanctions - United Nations Security Council',
					url: 'https://main.un.org/securitycouncil/en/sanctions/information',
					kind: 'official'
				},
				{
					title: 'OFAC Sanctions Programs and Information',
					url: 'https://ofac.treasury.gov/sanctions-programs-and-country-information',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'International sanctions',
				url: 'https://en.wikipedia.org/wiki/International_sanctions',
				reason: 'The article matches sanctions as international restrictive measures.'
			}
		}
	},
	jcpoa: {
		ja: {
			definition:
				'JCPOA は、イラン核計画を平和目的に限定するため、2015 年にイランと P5+1、EU が合意した Joint Comprehensive Plan of Action です。',
			background:
				'合意は、イランの濃縮、在庫、遠心分離機、検証を制約する代わりに、核関連制裁の解除を組み合わせる枠組みでした。',
			position:
				'イラン核問題、IAEA 監視、制裁、スナップバック、地域安全保障を読むための中心制度です。',
			distinctions: [
				'JCPOA は平和条約ではなく、核活動の制約と制裁緩和を交換する政治合意です。',
				'NPT や IAEA 保障措置そのものとは別の合意です。'
			],
			sources: [
				{
					title: 'Joint Comprehensive Plan of Action - U.S. Department of State archive',
					url: 'https://2009-2017.state.gov/e/eb/tfs/spi/iran/jcpoa/',
					kind: 'official'
				},
				{
					title: 'Nuclear Agreement - JCPOA - EEAS',
					url: 'https://www.eeas.europa.eu/eeas/nuclear-agreement-%E2%80%93-jcpoa_en',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Iran nuclear deal',
				url: 'https://en.wikipedia.org/wiki/Iran_nuclear_deal',
				reason: 'JCPOA として知られるイラン核合意を扱う記事で一致します。'
			}
		},
		en: {
			definition:
				'The JCPOA is the Joint Comprehensive Plan of Action, the 2015 agreement between Iran, the P5+1, and the EU to ensure Iran nuclear program remains exclusively peaceful.',
			background:
				'The agreement paired limits on enrichment, stockpiles, centrifuges, and verification with relief from nuclear-related sanctions.',
			position:
				'It is central to Iran nuclear policy, IAEA monitoring, sanctions, snapback, and regional security analysis.',
			distinctions: [
				'The JCPOA is a political nuclear agreement, not a peace treaty.',
				'It is distinct from the NPT and from IAEA safeguards themselves.'
			],
			sources: [
				{
					title: 'Joint Comprehensive Plan of Action - U.S. Department of State archive',
					url: 'https://2009-2017.state.gov/e/eb/tfs/spi/iran/jcpoa/',
					kind: 'official'
				},
				{
					title: 'Nuclear Agreement - JCPOA - EEAS',
					url: 'https://www.eeas.europa.eu/eeas/nuclear-agreement-%E2%80%93-jcpoa_en',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Iran nuclear deal',
				url: 'https://en.wikipedia.org/wiki/Iran_nuclear_deal',
				reason: 'The article matches the Iran nuclear agreement known as the JCPOA.'
			}
		}
	},
	ceasefire: {
		ja: {
			definition:
				'Ceasefire は、交戦当事者が敵対行為を停止または一時停止する取り決めや状態を指します。',
			background:
				'停戦は全面和平とは限らず、人道回廊、捕虜交換、交渉、戦線整理などのために限定的・一時的に設定されることがあります。',
			position:
				'ウクライナ戦争、イスラエル・パレスチナ、内戦、人道アクセスを読む際に、戦争継続と和平の間にある重要な概念です。',
			distinctions: [
				'Ceasefire は和平合意や終戦と同じではありません。',
				'一方的停止、局地停戦、包括停戦では拘束力や範囲が異なります。'
			],
			sources: [
				{
					title: 'Ceasefire - ICRC Online Casebook',
					url: 'https://casebook.icrc.org/a_to_z/glossary/ceasefire',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Ceasefire',
				url: 'https://en.wikipedia.org/wiki/Ceasefire',
				reason: '敵対行為の停止・一時停止を指す概念として一致します。'
			}
		},
		en: {
			definition:
				'A ceasefire is an arrangement or condition in which parties to a conflict stop or suspend hostilities.',
			background:
				'Ceasefires are not always peace settlements; they can be temporary or limited measures for humanitarian access, prisoner exchange, negotiation, or battlefield management.',
			position:
				'It is important for reading Ukraine, Israel-Palestine, civil wars, and humanitarian access as a space between active war and peace.',
			distinctions: [
				'A ceasefire is not the same as a peace agreement or the end of a war.',
				'Unilateral pauses, local ceasefires, and comprehensive ceasefires differ in scope and force.'
			],
			sources: [
				{
					title: 'Ceasefire - ICRC Online Casebook',
					url: 'https://casebook.icrc.org/a_to_z/glossary/ceasefire',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Ceasefire',
				url: 'https://en.wikipedia.org/wiki/Ceasefire',
				reason: 'The article matches the suspension of hostilities concept.'
			}
		}
	},
	nato: {
		ja: {
			definition:
				'NATO は、北米と欧州の加盟国による政治・軍事同盟で、加盟国の自由と安全を集団防衛で守ることを目的とします。',
			background:
				'1949 年の北大西洋条約で設立され、冷戦期の抑止から、現在は集団防衛、危機管理、パートナー支援、安全保障協力を担っています。',
			position:
				'ウクライナ支援、欧州安全保障、抑止、同盟政治を理解する基本制度です。',
			distinctions: [
				'NATO は EU ではなく、政治・軍事同盟です。',
				'NATO の支援は加盟国の直接参戦と同じではありません。'
			],
			sources: [
				{
					title: 'What is NATO?',
					url: 'https://www.nato.int/en/what-is-nato',
					kind: 'official'
				},
				{
					title: "NATO's purpose",
					url: 'https://www.nato.int/en/what-we-do/introduction-to-nato/natos-purpose',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'NATO',
				url: 'https://en.wikipedia.org/wiki/NATO',
				reason: 'North Atlantic Treaty Organization を指す同盟文脈と一致します。'
			}
		},
		en: {
			definition:
				'NATO is a political and military alliance of North American and European members whose purpose is to safeguard member freedom and security through collective defense.',
			background:
				'Founded by the 1949 North Atlantic Treaty, NATO evolved from Cold War deterrence into collective defense, crisis management, partner support, and security cooperation.',
			position:
				'It is a core institution for understanding Ukraine support, European security, deterrence, and alliance politics.',
			distinctions: [
				'NATO is not the EU; it is a political and military alliance.',
				'NATO support for a partner is not the same as direct combat participation by the alliance.'
			],
			sources: [
				{
					title: 'What is NATO?',
					url: 'https://www.nato.int/en/what-is-nato',
					kind: 'official'
				},
				{
					title: "NATO's purpose",
					url: 'https://www.nato.int/en/what-we-do/introduction-to-nato/natos-purpose',
					kind: 'official'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'NATO',
				url: 'https://en.wikipedia.org/wiki/NATO',
				reason: 'The article matches the North Atlantic Treaty Organization alliance context.'
			}
		}
	},
	'martial-law': {
		ja: {
			definition:
				'Martial Law は、緊急時に通常の文民当局が機能できないとみなされる区域で、軍当局が一時的に統治権限を担う状態です。',
			background:
				'戦争、反乱、大規模災害、国家非常事態の文脈で発動され、移動、集会、裁判、行政権限に大きな制約を及ぼすことがあります。',
			position:
				'戦時下の選挙、政権正統性、市民権制限を読むための制度概念です。',
			distinctions: [
				'Martial Law は通常の非常事態宣言より強い軍事的統治を含む場合があります。',
				'軍政一般やクーデター後の恒常的な軍事支配とは区別します。'
			],
			sources: [
				{
					title: 'Martial law - Britannica',
					url: 'https://www.britannica.com/topic/martial-law',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Martial law',
				url: 'https://en.wikipedia.org/wiki/Martial_law',
				reason: '緊急時に軍当局が統治権限を担う制度として一致します。'
			}
		},
		en: {
			definition:
				'Martial Law is temporary rule by military authorities over a designated area during an emergency when civil authorities are deemed unable to function.',
			background:
				'It may be invoked in war, rebellion, disaster, or national emergency and can sharply affect movement, assembly, courts, and administrative authority.',
			position:
				'It is a key institutional concept for wartime elections, regime legitimacy, and civil-rights restrictions.',
			distinctions: [
				'Martial law can be stronger than an ordinary state of emergency because military authority takes a governing role.',
				'It should be distinguished from general military rule or permanent post-coup government.'
			],
			sources: [
				{
					title: 'Martial law - Britannica',
					url: 'https://www.britannica.com/topic/martial-law',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Martial law',
				url: 'https://en.wikipedia.org/wiki/Martial_law',
				reason: 'The article matches temporary military authority during emergency.'
			}
		}
	},
	legitimacy: {
		ja: {
			definition:
				'Legitimacy は、政府、政権、制度、決定が、支配される人々や規範の観点から正当なものとして受け入れられる性質です。',
			background:
				'政治学・政治哲学では、同意、法、手続、代表、成果、規範的妥当性が、権力を単なる強制ではなく正当な権威として成立させるかが問われます。',
			position:
				'戦時下の選挙、権威主義体制、革命後体制、国際承認を読むための基本概念です。',
			distinctions: [
				'Legitimacy は合法性と重なりますが、法に従っていることだけでは尽きません。',
				'実効支配や軍事力があることと、正当性があることは別です。'
			],
			sources: [
				{
					title: 'Legitimacy - Britannica',
					url: 'https://www.britannica.com/topic/legitimacy',
					kind: 'reference'
				},
				{
					title: 'Political Legitimacy - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/legitimacy/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Legitimacy (political)',
				url: 'https://en.wikipedia.org/wiki/Legitimacy_(political)',
				reason: '政治制度や統治の正当性を扱う概念として一致します。'
			}
		},
		en: {
			definition:
				'Legitimacy is the quality by which a government, regime, institution, or decision is accepted as rightful from the standpoint of the governed or relevant norms.',
			background:
				'Political science and political philosophy ask how consent, law, procedure, representation, performance, and normative justification turn power into authority rather than mere coercion.',
			position:
				'It is central for wartime elections, authoritarian regimes, post-revolutionary order, and international recognition.',
			distinctions: [
				'Legitimacy overlaps legality but is not exhausted by legal validity.',
				'Effective control or military power is not the same as rightful authority.'
			],
			sources: [
				{
					title: 'Legitimacy - Britannica',
					url: 'https://www.britannica.com/topic/legitimacy',
					kind: 'reference'
				},
				{
					title: 'Political Legitimacy - Stanford Encyclopedia of Philosophy',
					url: 'https://plato.stanford.edu/entries/legitimacy/',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Legitimacy (political)',
				url: 'https://en.wikipedia.org/wiki/Legitimacy_(political)',
				reason: 'The article matches political legitimacy as rightful authority.'
			}
		}
	},
	'political-economy': {
		ja: {
			definition:
				'Political Economy は、市場、国家、社会、制度、権力が経済活動や分配にどう関わるかを分析する社会科学分野です。',
			background:
				'古典派経済学の時代から使われ、現在は国内政治経済、国際政治経済、開発、資源、労働、福祉国家、権威主義的近代化の分析に広がっています。',
			position:
				'湾岸諸国、制裁、社会保障、資源国家、開発モデルを読むための横断概念です。',
			distinctions: [
				'Political Economy は経済指標だけでなく、制度と権力関係を含めて経済を読みます。',
				'純粋な市場分析や政治ニュースの要約とは異なります。'
			],
			sources: [
				{
					title: 'Political economy - Britannica',
					url: 'https://www.britannica.com/money/political-economy',
					kind: 'reference'
				},
				{
					title: 'International political economy - Britannica',
					url: 'https://www.britannica.com/topic/international-political-economy',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Political economy',
				url: 'https://en.wikipedia.org/wiki/Political_economy',
				reason: '国家・市場・社会の関係を扱う分野として一致します。'
			}
		},
		en: {
			definition:
				'Political Economy studies how markets, states, society, institutions, and power shape economic activity and distribution.',
			background:
				'Rooted in classical political economy, the field now covers domestic and international political economy, development, resources, labor, welfare states, and authoritarian modernization.',
			position:
				'It is a cross-cutting concept for Gulf states, sanctions, welfare, resource states, and development models.',
			distinctions: [
				'Political economy reads economics through institutions and power, not only through market indicators.',
				'It is different from a summary of political news or a purely technical market analysis.'
			],
			sources: [
				{
					title: 'Political economy - Britannica',
					url: 'https://www.britannica.com/money/political-economy',
					kind: 'reference'
				},
				{
					title: 'International political economy - Britannica',
					url: 'https://www.britannica.com/topic/international-political-economy',
					kind: 'reference'
				}
			],
			wikipedia: {
				status: 'verified',
				title: 'Political economy',
				url: 'https://en.wikipedia.org/wiki/Political_economy',
				reason: 'The article matches the field studying relations among states, markets, society, and distribution.'
			}
		}
	}
} satisfies Record<string, LocaleProfile>

export function getGlossaryResearchProfile(slug: string, locale: 'ja' | 'en') {
	return GLOSSARY_RESEARCH_PROFILES[slug]?.[locale]
}
