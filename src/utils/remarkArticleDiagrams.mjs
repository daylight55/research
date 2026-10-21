// Keep Mermaid as the editable source, but publish figures without a client renderer.
export function remarkArticleDiagrams() {
	return (tree, file) => {
		let count = 0
		const visit = (node) => {
			if (!node.children) return
			node.children = node.children.map((child) => {
				if (child.type !== 'code' || child.lang !== 'mermaid') {
					visit(child)
					return child
				}
				count++
				return {
					type: 'mdxJsxFlowElement',
					name: 'ArticleDiagram',
					attributes: [
						{ type: 'mdxJsxAttribute', name: 'source', value: child.value },
						{ type: 'mdxJsxAttribute', name: 'number', value: String(count) },
						{
							type: 'mdxJsxAttribute',
							name: 'locale',
							value: /[/\\]en[/\\]/.test(file.path ?? '') ? 'en' : 'ja'
						}
					],
					children: []
				}
			})
		}
		visit(tree)
		if (count === 0) return
		const source = '@/components/mdx/ArticleDiagram'
		tree.children.unshift({
			type: 'mdxjsEsm',
			value: `import ArticleDiagram from '${source}'`,
			data: {
				estree: {
					type: 'Program',
					sourceType: 'module',
					body: [
						{
							type: 'ImportDeclaration',
							specifiers: [
								{
									type: 'ImportDefaultSpecifier',
									local: { type: 'Identifier', name: 'ArticleDiagram' }
								}
							],
							source: { type: 'Literal', value: source }
						}
					]
				}
			}
		})
	}
}
