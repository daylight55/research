/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: ['plugin:astro/recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		tsconfigRootDir: __dirname,
		sourceType: 'module',
		ecmaVersion: 'latest'
	},
	overrides: [
		{
			files: ['*.astro'],
			parser: 'astro-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
				extraFileExtensions: ['.astro']
			},
			rules: {
				// override/add rules settings here, such as:
				'astro/no-set-html-directive': 'error'
			}
		},
		{
			files: ['src/components/MixedArticleContent.astro', 'src/components/ProviderLocale.astro'],
			rules: {
				// These components inject JSON script payloads built from local state.
				// The payloads are serialized with JSON.stringify and cannot execute HTML.
				'astro/no-set-html-directive': 'off'
			}
		}
	]
}
