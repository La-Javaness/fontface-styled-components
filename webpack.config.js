const path = require('path')

module.exports = {
	entry: './lib/main.js',
	devtool: 'inline-source-map',
	target: 'node',
	node: {
		__dirname: true,
	},
	externals: {
		mkdirp: 'mkdirp',
		ttf2eot: 'ttf2eot',
		ttf2woff: 'ttf2woff',
		ttf2woff2: 'ttf2woff2',
		ttfinfo: 'ttfinfo',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js',
		library: '',
		libraryTarget: 'commonjs',
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
		],
	},
	mode: process.env.NODE_ENV || 'development',
}
