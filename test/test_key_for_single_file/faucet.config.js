"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src/test.txt",
		target: "./dist/test.txt"
	}],
	manifest: {
		target: "./dist/manifest.json",
		key: (f, targetDir) => path.relative(targetDir, f)
	},
	plugins: [path.resolve(__dirname, "../..")]
};
