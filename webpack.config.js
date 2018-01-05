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
					presets: [ "env", "react" ]
				}
			}
		]
	},

	output: {
		path: __dirname + "/bin",
		filename: "script.min.js"
	},

	plugins: [
		new webpack.DefinePlugin({ "process.env.NODE_ENV" : JSON.stringify("production") }),
		new webpack.optimize.UglifyJsPlugin({ "mangle" : false, "sourcemap" : false, "output" : { "comments" : false } })
	]

}
