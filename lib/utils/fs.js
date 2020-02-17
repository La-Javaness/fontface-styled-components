const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

/**
 * Reads a directory and exposes the result as a Promise instead of requiring
 * a callback.
 * @param  {String} dirPath The path of the directory to read.
 * @param  {RegExp} pattern The pattern that filenames must match to be included.
 * @param  {Object} [readOptions={}] Options for the `fs.readFileSync` function.
 * @return {Object[]}       The files found in the directory, as objects with properties:
 *       * {String} path    The full path to the file
 *       * {Buffer} content The file's content
 */
const readDir = (dirPath, pattern, readOptions = {}) => {
	return new Promise((resolve, reject) => {
		fs.readdir(dirPath, async (error, files) => {
			if (error) {
				reject(Error(`Failed to scan directory '${dirPath}': ${error}`))
			}

			if (!files || files.length === 0 || files.filter(filename => !!filename.match(pattern)).length === 0) {
				reject(Error(`No font files found in '${dirPath}'. Are you sure it's the right path?`))
			}

			resolve(
				files
					.filter(filename => !!filename.match(pattern))
					.map(filename => {
						const filepath = path.join(dirPath, filename)

						return {
							path: filepath,
							content: fs.readFileSync(filepath, readOptions),
						}
					})
			)
		})
	})
}

/**
 * Write a file to the filesystem, as a Promise.
 * @param  {string} inputPath 	Path of source file to copy.
 * @param  {string} outputPath 	Path in which to write the copy.
 * @return {Promise}         		Nothing.
 */
const copyFile = (inputPath, outputPath) =>
	new Promise((resolve, reject) => {
		mkdirp.sync(path.dirname(outputPath))
		fs.copyFile(inputPath, outputPath, err => (err ? reject(err) : resolve()))
	})

/**
 * Write a file to the filesystem, as a Promise.
 * @param  {string} filepath Path to write to.
 * @param  {Buffer} buffer   Content to write.
 * @return {Promise}         Nothing.
 */
const writeFile = (filepath, buffer) =>
	new Promise((resolve, reject) => {
		mkdirp.sync(path.dirname(filepath))
		fs.writeFile(filepath, buffer, err => (err ? reject(err) : resolve()))
	})

module.exports = { copyFile, readDir, writeFile }
