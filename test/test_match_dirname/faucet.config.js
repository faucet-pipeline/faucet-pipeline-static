"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist",
		filter: path => path.startsWith("inner/")
	}],
	plugins: [path.resolve(__dirname, "../..")]
};
