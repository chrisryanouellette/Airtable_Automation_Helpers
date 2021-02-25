const path = require('path')

module.exports = {
	mode: 'production',
	entry: path.join(__dirname, './src/index.ts'),
	output: {
		filename: 'index.js',
		path: path.join(__dirname, '/dist'),
		library: 'AT',
		libraryTarget: 'var',
		libraryExport: 'default',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts'],
	},
	externals: {
		'@airtable/blocks': '@airtable/blocks',
	},
	watch: true,
}
