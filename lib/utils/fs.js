const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

/**
 * Reads a directory and exposes the result as a Promise instead of requiring
 * a callback.
 * @async
 * @param  {string}    dirPath    The path of the directory to read.
 * @param  {RegExp}    pattern    The pattern that filenames must match to be included.
 * @param  {boolean}   allowEmpty If true, allows empty input directory, else throws an error.
 * @param  {?boolean}  readFiles  If true, read the files and add them to the content key.
 * @returns {Array.<Object>}      The files found in the directory, as objects with properties:
 *       * {String} path    The full path to the file.
 *       * {Buffer} content The file's content if `readFiles` was true.
 */
const readDir = (dirPath, pattern, allowEmpty, readFiles = true) => {
	return new Promise((resolve, reject) => {
		fs.readdir(dirPath, async (error, files) => {
			if (error) {
				reject(Error(`Failed to scan directory '${dirPath}': ${error}`))
			}

			if (!files || files.length === 0 || files.filter((filename) => !!filename.match(pattern)).length === 0) {
				if (allowEmpty) {
					resolve([])
				} else {
					reject(Error(`No font files found in '${dirPath}'. Are you sure it's the right path?`))
				}
			}

			resolve(
				files
					.filter((filename) => !!filename.match(pattern))
					.map((filename) => {
						const filepath = path.join(dirPath, filename)

						return {
							path: filepath,
							content: readFiles ? fs.readFileSync(filepath) : undefined,
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
		fs.copyFile(inputPath, outputPath, (err) => (err ? reject(err) : resolve()))
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
		fs.writeFile(filepath, buffer, (err) => (err ? reject(err) : resolve()))
	})

module.exports = { copyFile, readDir, writeFile }
