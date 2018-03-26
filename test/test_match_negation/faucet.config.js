"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist",
		match: "!*/test2.txt"
	}],
	plugins: {
		"static": path.resolve("../..")
	}
};
