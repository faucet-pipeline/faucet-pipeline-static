"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist/no-fingerprint",
		fingerprint: false
	}, {
		source: "./src",
		target: "./dist/fingerprint"
	}],
	plugins: [path.resolve(__dirname, "../..")]
};
