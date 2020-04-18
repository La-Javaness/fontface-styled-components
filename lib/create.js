const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

const ttfInfo = require('ttfinfo')
const ttf2eot = require('ttf2eot')
const ttf2woff = require('ttf2woff')
const ttf2woff2 = require('ttf2woff2')

const { copyFile, writeFile } = require('./utils/fs')
const { camelCase, capitalize } = require('./utils/string')

const transformers = {
	// All transformers take an Uint8Array as input and output
	// an object. The result object will include the transformed buffer
	eot: ttf2eot,
	woff: ttf2woff,
	woff2: ttf2woff2,
	ttf: array => Buffer.from(array),
}

const transformFontTo = (ext, ttfBuffer) => {
	const func = transformers[ext]
	const result = func(new Uint8Array(ttfBuffer))
	return Buffer.from(result.buffer)
}

const writeTransformedFonts = (dirname, filename, ttfBuffer, outputDir, { forceRefresh, quiet }) => {
	const promises = Object.keys(transformers).map(async ext => {
		const inputPath = `${dirname}/${filename}.${ext}`
		const outputPath = `${outputDir}/${filename}.${ext}`

		if (fs.existsSync(outputPath) === true && !forceRefresh && !quiet) {
			process.stdout.write(
				chalk.dim(
					`Font '${filename}.${ext}' already exists in the output directory.` +
						` Run with 'forceRefresh: true' to overwrite the existing font.\n`
				)
			)
			return
		}

		if (fs.existsSync(inputPath) === true) {
			await copyFile(inputPath, outputPath)
			return
		}

		const transformedBuffer = transformFontTo(ext, ttfBuffer)
		await writeFile(outputPath, transformedBuffer)
	})

	return Promise.all(promises)
}

const ttfInfoPromise = buffer =>
	new Promise((resolve, reject) => ttfInfo(buffer, (err, info) => (err ? reject(err) : resolve(info))))

const writeCSSFontFaceTemplate = async (dirname, filename, ttfBuffer, cssOutputDir, fontsPublicDir) => {
	const info = await ttfInfoPromise(ttfBuffer)

	const createStyles = () => {
		const fontFamily = info.tables.name['1']

		// Conditional taken from fontface-loader's original code, but not clear why the length > 2 condition
		if (fontFamily !== null && fontFamily.length > 2) {
			return {
				fontFamily,
				fontWeight: info.tables['OS/2'].weightClass || 400,
				fontStyle: info.tables.post.italicAngle === 0 ? 'normal' : 'italic',
			}
		}

		return { fontFamily: capitalize(filename), fontWeight: 400, fontStyle: 'normal' }
	}

	const styles = createStyles()

	const css = `import { createGlobalStyle } from 'styled-components'

export const ${camelCase(filename)}FontFace = createGlobalStyle\`
  @font-face {
    font-display: ${props => props.fontDisplay || 'auto'};
    font-family: '${styles.fontFamily}';
    font-weight: ${styles.fontWeight};
    font-style: ${styles.fontStyle};
    src: local('${styles.fontFamily}'),
        url('${fontsPublicDir}/${filename}.eot?#iefix') format('embedded-opentype'),
        url('${fontsPublicDir}/${filename}.woff2') format('woff2'),
        url('${fontsPublicDir}/${filename}.ttf')  format('truetype'),
        url('${fontsPublicDir}/${filename}.woff') format('woff');
  }
  \`

export default { ${camelCase(filename)}FontFace }
    `

	const outputPath = `${cssOutputDir}/${filename}.style.js`
	await writeFile(outputPath, css)
}

const createFontFace = async (file, fontsOutputDir, styledOutputDir, fontsPublicDir, opts) => {
	const dirname = path.dirname(file.path)
	const filename = path.basename(file.path, '.ttf')

	await Promise.all([
		writeTransformedFonts(dirname, filename, file.content, fontsOutputDir, opts),
		writeCSSFontFaceTemplate(dirname, filename, file.content, styledOutputDir, fontsPublicDir, opts),
	])
}

module.exports = createFontFace
