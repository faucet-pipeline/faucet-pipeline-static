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
	plugins: [path.resolve(__dirname, "../..")]
};
