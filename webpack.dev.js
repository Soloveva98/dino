const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.config');

module.exports = merge(common, {
	mode: "development",
	devServer: {
		static: {
			directory: path.resolve(__dirname, './public'),
		},
		port: 3307,
		client: {
			overlay: {
				errors: false,
				warnings: false,
			},
		},
	},
});