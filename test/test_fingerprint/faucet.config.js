"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist"
	}],
	manifest: {
		target: "./dist/manifest.json"
	},
	plugins: {
		static: {
			plugin: path.resolve("../.."),
			bucket: "static"
		}
	}
};
