const chalk = require('chalk')
const execa = require('execa')
const fs = require('fs')
const os = require('os')

const { readDir } = require('./utils/fs')
const forceRefreshCheck = require('./utils/forceRefreshCheck')

const otf2ttf = async (sourceDirResolved, { fontOutputDir, forceRefresh, quiet }) => {
	const otfSources = await readDir(sourceDirResolved, /.*\.(otf)$/, true, false)

	/* If no OTF files, we're done here. */
	if (!otfSources.length) {
		return []
	}

	/* Check if FontForge is installed. */
	let hasFontForgeSupport = true
	try {
		await execa('fontforge', ['-v'])
	} catch (e) {
		if (e.code === 'ENOENT') {
			hasFontForgeSupport = false
		} else {
			throw e
		}
	}

	if (!hasFontForgeSupport) {
		process.stderr.write(
			chalk.bgYellowBright.black.bold(
				`OpenType fonts were found in '${sourceDirResolved}' but FontForge is not installed. Fonts will not be generated for these OpenType source files.\n`
			)
		)
		return []
	}

	/* Convert fonts. */
	const ttfConvertedSources = []
	for (const otfSource of otfSources) {
		const ttfOutFinalDest = `${otfSource.path.slice(0, -4).replace(sourceDirResolved, fontOutputDir)}.ttf`
		if (forceRefreshCheck(ttfOutFinalDest, forceRefresh, quiet)) {
			const ttfDest = `${otfSource.path.slice(0, -4).replace(sourceDirResolved, os.tmpdir())}.ttf`

			/* We want to run FontForge font by font to avoid RAM shortages. */
			// eslint-disable-next-line no-await-in-loop
			await execa('fontforge', ['--lang=ff', '-c', `Open('${otfSource.path}'); Generate('${ttfDest}'); Quit(0);`])

			ttfConvertedSources.push({ path: ttfDest, content: fs.readFileSync(ttfDest) })
		} else {
			/* Still include the font so that fontface declarations are made for it. */
			ttfConvertedSources.push({ path: ttfOutFinalDest, content: fs.readFileSync(ttfOutFinalDest) })
		}
	}
	return ttfConvertedSources
}

module.exports = otf2ttf
