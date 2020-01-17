"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist"
	}],
	manifest: {
		target: "./dist/manifest.json",
		key: (f, targetDir) => path.relative(targetDir, f)
	},
	plugins: [path.resolve(__dirname, "../..")]
};
