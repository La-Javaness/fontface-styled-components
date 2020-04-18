module.exports = {
	printWidth: 120,
	useTabs: true,
	tabWidth: 4,
	singleQuote: true,
	semi: false,
	endOfLine: 'lf',
	trailingComma: 'es5',
	bracketSpacing: true,
	overrides: [
		{
			files: './**/*.js',
			options: {
				parser: 'babylon',
			},
		},
		{
			files: './**/*.json',
			options: {
				parser: 'json',
			},
		},
		{
			files: '.*.rc',
			options: {
				parser: 'json',
			},
		},
	],
}
