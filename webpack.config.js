const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	entry: "./src/index.js",
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, './dist'),
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"],
					},
				},
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"]
			},
			{
				test: /\.scss$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
			}
		],
	},
	plugins: [
		new CleanPlugin(),
		new HtmlPlugin({
			template: './public/index.html',
		}),
		new CopyPlugin({
			patterns: [
				{
					from: "./static",
					to: "./static",
					noErrorOnMissing: true,
				}
			],
		}),
		new MiniCssExtractPlugin()
	],
};