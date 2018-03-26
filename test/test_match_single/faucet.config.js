"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src.txt",
		target: "./dist/dist.txt",
		match: "*.txt"
	}],
	plugins: {
		"static": path.resolve("../..")
	}
};
