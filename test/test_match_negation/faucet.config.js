"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist",
		filter: path => !path.endsWith("/test2.txt")
	}],
	plugins: [path.resolve(__dirname, "../..")]
};
