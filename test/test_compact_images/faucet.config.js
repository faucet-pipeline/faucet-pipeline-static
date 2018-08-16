"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist",
		compact: "images"
	}],
	plugins: {
		"static": {
			plugin: path.resolve("../.."),
			bucket: "static"
		}
	}
};
