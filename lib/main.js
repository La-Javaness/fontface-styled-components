const path = require('path')

const { readDir } = require('./utils/fs')
const createFontFace = require('./create')
const otf2ttf = require('./otf2ttf')

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

		const sourceDirResolved = path.resolve(__dirname, sourceDir)
		const sourceFiles = [
			...(await otf2ttf(sourceDirResolved, { fontOutputDir, forceRefresh, quiet })),
			...(await readDir(sourceDirResolved, /.*\.(ttf)$/, allowEmpty)),
		]

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
