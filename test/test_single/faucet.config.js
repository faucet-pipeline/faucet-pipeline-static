"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src.txt",
		target: "./dist/dist.txt"
	}],
	plugins: {
		"static": {
			plugin: path.resolve("../.."),
			bucket: "static"
		}
	}
};
