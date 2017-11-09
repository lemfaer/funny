var webpack = require("webpack");

module.exports = {
	context: __dirname,
	entry: "./src/index.jsx",

	module: {
		rules: [
			{
				test: /\.jsx$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				options: {
					presets: ["env", "react"]
				}
			}
		]
	},

	output: {
		path: __dirname + "/bin",
		filename: "script.min.js"
	},

	plugins: [
		// new webpack.optimize.DedupePlugin(),
		// new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
	]
};
