const path = require('path')

const createFontFace = require('./create')
const { readDir } = require('./utils/fs')

module.exports = {
	run: async (options) => {
		const {
			sourceDir = 'assets/fonts/',
			fontOutputDir = 'dist/fonts/',
			fontsPublicDir = '/public/fonts/',
			cssOutputDir = 'dist/src/fontfaces/',
			scssOutputDir = 'dist/src/fontfaces/',
			styledOutputDir = 'dist/src/fontfaces/',
			allowEmpty = false,
			forceRefresh = false,
			quiet = false,
			fontDisplay = null,
			withLocal = true,
			withStyledComponents = true,
			withCSS = false,
			withSCSS = false,
		} = options

		const sourceFiles = await readDir(path.resolve(__dirname, sourceDir), /.*\.ttf$/, allowEmpty)
		sourceFiles.map((file) =>
			createFontFace(file, {
				fontsPublicDir,
				fontOutputDir: path.resolve(__dirname, fontOutputDir),
				cssOutputDir: path.resolve(__dirname, cssOutputDir),
				scssOutputDir: path.resolve(__dirname, scssOutputDir),
				styledOutputDir: path.resolve(__dirname, styledOutputDir),
				forceRefresh,
				quiet,
				fontDisplay,
				withLocal,
				withStyledComponents,
				withCSS,
				withSCSS,
			})
		)
	},
}
