const fs = require('fs')
const path = require('path')

const ttfInfo = require('ttfinfo')
const ttf2eot = require('ttf2eot')
const ttf2woff = require('ttf2woff')
const ttf2woff2 = require('ttf2woff2')

const { copyFile, writeFile } = require('./utils/fs')
const { camelCase, capitalize } = require('./utils/string')
const forceRefreshCheck = require('./utils/forceRefreshCheck')

const transformers = {
	// All transformers take an Uint8Array as input and output
	// an object. The result object will include the transformed buffer
	eot: ttf2eot,
	woff: ttf2woff,
	woff2: ttf2woff2,
	ttf: (array) => Buffer.from(array),
}

const transformFontTo = (ext, ttfBuffer) => {
	const func = transformers[ext]
	const result = func(new Uint8Array(ttfBuffer))
	return Buffer.from(result.buffer)
}

const writeTransformedFonts = (dirname, filename, ttfBuffer, { fontOutputDir, forceRefresh, quiet }) => {
	const promises = Object.keys(transformers).map(async (ext) => {
		const inputPath = `${dirname}/${filename}.${ext}`
		const outputPath = `${fontOutputDir}/${filename}.${ext}`

		if (!forceRefreshCheck(outputPath, forceRefresh, quiet)) {
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

const ttfInfoPromise = (buffer) =>
	new Promise((resolve, reject) => ttfInfo(buffer, (err, info) => (err ? reject(err) : resolve(info))))

const createStyles = (info, filename) => {
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

const writeTemplate = async (cssOutputDir, inputFilename, extension, content) => {
	const outputPath = `${cssOutputDir}/${camelCase(inputFilename)}.${extension}`
	await writeFile(outputPath, content)
}

const writeStyledComponentsFontFaceTemplate = async (dirname, filename, ttfBuffer, opts) => {
	const info = await ttfInfoPromise(ttfBuffer)
	const styles = createStyles(info, filename)

	const camelCasedName = camelCase(filename)
	await writeTemplate(
		opts.styledOutputDir,
		filename,
		'style.js',
		`import { createGlobalStyle } from 'styled-components'

export const ${camelCasedName}FontFace = createGlobalStyle\`
  @font-face {
    font-display: ${opts.fontDisplay || `\${(props) => props.fontDisplay || 'auto'}`};
    font-family: '${styles.fontFamily}';
    font-weight: ${styles.fontWeight};
    font-style: ${styles.fontStyle};
    src: ${
		opts.withLocal
			? `local('${styles.fontFamily}'),
        `
			: ''
	}url('${opts.fontsPublicDir}/${filename}.eot?#iefix') format('embedded-opentype'),
        url('${opts.fontsPublicDir}/${filename}.woff2') format('woff2'),
        url('${opts.fontsPublicDir}/${filename}.ttf')  format('truetype'),
        url('${opts.fontsPublicDir}/${filename}.woff') format('woff');
  }
  \`

export default { ${camelCasedName}FontFace }
    `
	)
}

const writeCSSFontFaceTemplate = async (dirname, filename, ttfBuffer, opts) => {
	const info = await ttfInfoPromise(ttfBuffer)
	const styles = createStyles(info, filename)

	await writeTemplate(
		opts.cssOutputDir,
		filename,
		'css',
		`@font-face {
    font-display: ${opts.fontDisplay || 'auto'};
    font-family: '${styles.fontFamily}';
    font-weight: ${styles.fontWeight};
    font-style: ${styles.fontStyle};
    src: ${
		opts.withLocal
			? `local('${styles.fontFamily}'),
        `
			: ''
	}url('${opts.fontsPublicDir}/${filename}.eot?#iefix') format('embedded-opentype'),
        url('${opts.fontsPublicDir}/${filename}.woff2') format('woff2'),
        url('${opts.fontsPublicDir}/${filename}.ttf')  format('truetype'),
        url('${opts.fontsPublicDir}/${filename}.woff') format('woff');
  }`
	)
}

const writeSCSSFontFaceTemplate = async (dirname, filename, ttfBuffer, opts) => {
	const info = await ttfInfoPromise(ttfBuffer)
	const styles = createStyles(info, filename)

	await writeTemplate(
		opts.scssOutputDir,
		filename,
		'scss',
		`
$display: 'auto' !default;
@font-face {
  font-family: '${styles.fontFamily}';
  font-weight: ${styles.fontWeight};
  font-style: ${styles.fontStyle};
	font-display: #{$display};
  src: ${
		opts.withLocal
			? `local('${styles.fontFamily}'),
      `
			: ''
  }url('${opts.fontsPublicDir}/${filename}.eot?#iefix') format('embedded-opentype'),
      url('${opts.fontsPublicDir}/${filename}.woff2') format('woff2'),
      url('${opts.fontsPublicDir}/${filename}.ttf')  format('truetype'),
      url('${opts.fontsPublicDir}/${filename}.woff') format('woff');
}`
	)
}

const createFontFace = async (file, opts) => {
	const dirname = path.dirname(file.path)
	const filename = path.basename(file.path, '.ttf')

	await Promise.all(
		[
			writeTransformedFonts(dirname, filename, file.content, opts),
			opts.withStyledComponents && writeStyledComponentsFontFaceTemplate(dirname, filename, file.content, opts),
			opts.withCSS && writeCSSFontFaceTemplate(dirname, filename, file.content, opts),
			opts.withSCSS && writeSCSSFontFaceTemplate(dirname, filename, file.content, opts),
		].filter(Boolean)
	)
}

module.exports = createFontFace
