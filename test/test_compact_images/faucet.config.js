"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist",
		compact: "images"
	}],
	plugins: [path.resolve(__dirname, "../..")]
};
