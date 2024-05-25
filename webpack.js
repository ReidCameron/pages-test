module.exports = {
	mode: 'production',
	entry: {
		preview: './src/preview.js',
	},
	output: {
		path: __dirname,
		filename: '[name].js',
	},
	module: {
		rules: [
			{
				test: /.*\.(html|css)$/,
				use: [ 
					'raw-loader',
					{
						loader: 'string-replace-loader',
						options : {
							search: /\s+/g,
							replace: ' ',
						}
					}
				]
			},
		],
	},
};