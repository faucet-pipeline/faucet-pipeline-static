"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist",
		match: ["*.txt", "!inner/*.txt"]
	}],
	plugins: {
		"static": path.resolve("../..")
	}
};
