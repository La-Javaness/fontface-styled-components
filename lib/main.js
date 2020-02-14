const path = require('path')

const createFontFace = require('./create')
const { readDir } = require('./utils/fs')

module.exports = {
	run: async options => {
		const {
			sourceDir = 'assets/fonts/',
			fontOutputDir = 'dist/fonts/',
			fontsPublicDir = '/public/fonts/',
			styledOutputDir = 'dist/src/fontfaces/',
			forceRefresh = false,
		} = options

		const sourceFiles = await readDir(path.resolve(__dirname, sourceDir), /.*\.ttf$/)
		sourceFiles.map(file =>
			createFontFace(
				file,
				path.resolve(__dirname, fontOutputDir),
				path.resolve(__dirname, styledOutputDir),
				fontsPublicDir,
				forceRefresh
			)
		)
	},
}
