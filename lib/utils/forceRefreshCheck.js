const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

const forceRefreshCheck = (outputPath, forceRefresh, quiet) => {
	if (fs.existsSync(outputPath) === true && !forceRefresh) {
		if (!quiet) {
			process.stdout.write(
				chalk.dim(
					`Font '${path.basename(outputPath)}' already exists in the output directory.` +
						` Run with 'forceRefresh: true' to overwrite the existing font.\n`
				)
			)
		}
		return false
	}

	return true
}

module.exports = forceRefreshCheck
