const path = require('path')

module.exports = {
	entry: './lib/main.js',
	devtool: 'inline-source-map',
	target: 'node',
	node: {
		__dirname: true,
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js',
		library: '',
		libraryTarget: 'commonjs',
	},
	mode: process.env.NODE_ENV || 'development',
}
