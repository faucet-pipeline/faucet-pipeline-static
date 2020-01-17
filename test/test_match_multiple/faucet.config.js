"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist",
		filter: path => path.endsWith(".txt") && !path.startsWith("inner/")
	}],
	plugins: [path.resolve(__dirname, "../..")]
};
